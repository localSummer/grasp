export function createRuntimeTruth(overrides = {}) {
  return {
    browser_process: {
      state: 'unknown', // unknown | running | stopped
      pid: null,
    },
    cdp: {
      state: 'unknown', // unknown | connected | disconnected | unreachable
      url: process.env.CHROME_CDP_URL || 'http://localhost:9222',
      browserVersion: null,
      protocolVersion: null,
    },
    page: {
      state: 'unknown', // unknown | available | unavailable
      title: null,
      url: null,
    },
    server: {
      state: 'idle', // idle | connecting | connected | disconnected | error
      lastError: null,
      retryCount: 0,
      connectedAt: null,
      lastAttemptAt: null,
    },
    profile: {
      state: 'unknown',
      path: null,
    },
    updatedAt: Date.now(),
    ...overrides,
  };
}

export function mergeRuntimeTruth(base, patch = {}) {
  return {
    ...base,
    ...patch,
    browser_process: { ...(base.browser_process ?? {}), ...(patch.browser_process ?? {}) },
    cdp: { ...(base.cdp ?? {}), ...(patch.cdp ?? {}) },
    page: { ...(base.page ?? {}), ...(patch.page ?? {}) },
    server: { ...(base.server ?? {}), ...(patch.server ?? {}) },
    profile: { ...(base.profile ?? {}), ...(patch.profile ?? {}) },
    updatedAt: patch.updatedAt ?? Date.now(),
  };
}

export function legacyRuntimeStatusToTruth(snapshot) {
  if (!snapshot) return createRuntimeTruth();

  const serverState = snapshot.state === 'CDP_UNREACHABLE'
    ? 'error'
    : (snapshot.state ?? 'unknown');
  const cdpState = snapshot.state === 'connected'
    ? 'connected'
    : snapshot.state === 'CDP_UNREACHABLE'
      ? 'unreachable'
      : 'disconnected';

  return createRuntimeTruth({
    cdp: {
      state: cdpState,
      url: snapshot.cdpUrl ?? (process.env.CHROME_CDP_URL || 'http://localhost:9222'),
      browserVersion: null,
      protocolVersion: null,
    },
    server: {
      state: serverState,
      lastError: snapshot.lastError ?? null,
      retryCount: snapshot.retryCount ?? 0,
      connectedAt: snapshot.connectedAt ?? null,
      lastAttemptAt: snapshot.lastAttemptAt ?? null,
    },
    updatedAt: snapshot.updatedAt ?? Date.now(),
  });
}

export function truthToLegacyRuntimeStatus(truth) {
  const cdpState = truth?.cdp?.state;
  let state = 'idle';
  if (cdpState === 'connected') state = 'connected';
  else if (cdpState === 'unreachable') state = 'CDP_UNREACHABLE';
  else if (truth?.server?.state) state = truth.server.state;

  return {
    state,
    retryCount: truth?.server?.retryCount ?? 0,
    lastError: truth?.server?.lastError ?? null,
    lastAttemptAt: truth?.server?.lastAttemptAt ?? null,
    connectedAt: truth?.server?.connectedAt ?? null,
    cdpUrl: truth?.cdp?.url ?? (process.env.CHROME_CDP_URL || 'http://localhost:9222'),
    safeMode: process.env.GRASP_SAFE_MODE !== 'false',
    updatedAt: truth?.updatedAt ?? Date.now(),
  };
}
