import { chromium } from 'playwright-core';
import { startChromeHint } from '../cli/detect-chrome.js';
import { writeRuntimeStatus } from '../server/runtime-status.js';
import { isSafeModeEnabled } from '../server/state.js';

const CDP_URL = process.env.CHROME_CDP_URL || 'http://localhost:9222';
const DEFAULT_RETRY_DELAYS = [0, 250, 1000];
const SAFE_MODE = isSafeModeEnabled();

async function defaultConnect() {
  try {
    const browser = await chromium.connectOverCDP(CDP_URL);
    console.error('[Grasp] Connected to Chrome via CDP:', CDP_URL);
    return browser;
  } catch (err) {
    throw new Error(
      `Chrome not reachable at ${CDP_URL}.\n` +
      `Start Chrome with remote debugging enabled:\n` +
      `  ${startChromeHint(CDP_URL)}\n` +
      `Or run: grasp status  to diagnose the problem.\n` +
      `(${err.message})`
    );
  }
}

const defaultPersistStatus = async (snapshot) => {
  await writeRuntimeStatus(snapshot);
};

function runPersist(persistFn, snapshot) {
  if (!persistFn) return;
  try {
    const result = persistFn(snapshot);
    if (result && typeof result.catch === 'function') {
      result.catch(() => {});
    }
  } catch {
    // swallow
  }
}

export function createConnectionSupervisor({
  connect = defaultConnect,
  now = () => Date.now(),
  retryDelays = DEFAULT_RETRY_DELAYS,
  persistStatus = defaultPersistStatus,
  safeMode = SAFE_MODE,
  cdpUrl = CDP_URL,
} = {}) {
  let browser = null;
  let pending = null;
  let status = {
    state: 'idle',
    retryCount: 0,
    lastError: null,
    lastAttemptAt: null,
    connectedAt: null,
    cdpUrl,
    safeMode,
    updatedAt: now(),
  };

  function updateStatus(updates) {
    status = {
      ...status,
      ...updates,
      cdpUrl,
      safeMode,
      updatedAt: now(),
    };
    runPersist(persistStatus, status);
    return status;
  }

  function attachDisconnectListener(instance) {
    if (!instance || typeof instance.once !== 'function') return;
    instance.once('disconnected', () => {
      browser = null;
      updateStatus({ state: 'disconnected', lastError: 'browser disconnected' });
    });
  }

  async function attemptConnect() {
    updateStatus({ state: 'connecting', lastError: null });

    for (let index = 0; index < retryDelays.length; index += 1) {
      const delayMs = retryDelays[index];
      if (delayMs) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }

      const attemptCount = index + 1;
      updateStatus({
        retryCount: attemptCount,
        lastAttemptAt: now(),
        lastError: null,
      });

      try {
        const candidate = await connect();
        browser = candidate;
        attachDisconnectListener(candidate);
        updateStatus({
          state: 'connected',
          connectedAt: now(),
          lastError: null,
          retryCount: attemptCount,
        });
        return candidate;
      } catch (error) {
        updateStatus({ lastError: error.message });
      }
    }

    updateStatus({ state: 'CDP_UNREACHABLE', retryCount: retryDelays.length, lastAttemptAt: now() });
    throw new Error(status.lastError ?? 'CDP unreachable');
  }

  async function getBrowser() {
    if (browser?.isConnected?.()) {
      updateStatus({ state: 'connected', connectedAt: now(), lastError: null });
      return browser;
    }

    if (pending) {
      return pending;
    }

    pending = attemptConnect();
    try {
      return await pending;
    } finally {
      pending = null;
    }
  }

  function getStatus() {
    return status;
  }

  function reset() {
    browser = null;
    pending = null;
    updateStatus({
      state: 'idle',
      retryCount: 0,
      lastError: null,
      lastAttemptAt: null,
      connectedAt: null,
    });
  }

  return { getBrowser, getStatus, reset };
}

const supervisor = createConnectionSupervisor();

async function getBrowser() {
  return supervisor.getBrowser();
}

async function getActivePage() {
  const browser = await getBrowser();
  const context = browser.contexts()[0];
  if (!context) throw new Error('No browser context available.');
  const pages = context.pages();

  const userPages = pages.filter((page) => {
    const url = page.url();
    if (!url) return false;
    if (url.startsWith('chrome://')) return false;
    if (url.startsWith('chrome-extension://')) return false;
    if (url.startsWith('about:')) return false;
    return true;
  });

  if (userPages.length === 0) {
    if (pages.length > 0) return pages[pages.length - 1];
    throw new Error('No open tabs found in Chrome.');
  }

  for (const page of userPages) {
    try {
      const isVisible = await page.evaluate(() => document.visibilityState === 'visible');
      if (isVisible) return page;
    } catch {
      // Page still loading — skip
    }
  }

  return userPages[userPages.length - 1];
}

async function navigateTo(url) {
  const page = await getActivePage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  } catch (err) {
    if (err.name === 'TimeoutError' || err.message?.includes('timeout')) {
      console.error(
        `[Grasp] Navigation to ${url} timed out, continuing with partially loaded page.`
      );
    } else {
      throw err;
    }
  }

  return page;
}

async function getTabs() {
  const browser = await getBrowser();
  const context = browser.contexts()[0];
  if (!context) throw new Error('No browser context available.');
  const pages = context.pages();
  return Promise.all(
    pages.map(async (p, i) => ({
      index: i,
      title: await p.title().catch(() => ''),
      url: p.url(),
      isUser: p.url() && !p.url().startsWith('chrome://') && !p.url().startsWith('about:'),
    }))
  );
}

async function switchTab(index) {
  const browser = await getBrowser();
  const context = browser.contexts()[0];
  if (!context) throw new Error('No browser context available.');
  const pages = context.pages();
  if (index < 0 || index >= pages.length) {
    throw new Error(`Tab index ${index} out of range (0-${pages.length - 1})`);
  }
  await pages[index].bringToFront();
  return pages[index];
}

async function newTab(url) {
  const browser = await getBrowser();
  const context = browser.contexts()[0];
  if (!context) throw new Error('No browser context available.');
  const page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  } catch (err) {
    if (!err.message?.includes('timeout')) {
      await page.close().catch(() => {});
      throw err;
    }
    console.error(`[Grasp] newTab navigation timeout for ${url}, continuing.`);
  }
  await page.bringToFront();
  return page;
}

async function closeTab(index) {
  const browser = await getBrowser();
  const context = browser.contexts()[0];
  if (!context) throw new Error('No browser context available.');
  const pages = context.pages();
  if (index < 0 || index >= pages.length) {
    throw new Error(`Tab index ${index} out of range (0-${pages.length - 1})`);
  }
  await pages[index].close();
}

export { getBrowser, getActivePage, navigateTo, getTabs, switchTab, newTab, closeTab };
