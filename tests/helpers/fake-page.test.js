import test from 'node:test';
import assert from 'node:assert/strict';
import { createFakePage } from './fake-page.js';

test('createFakePage records default interaction calls', async () => {
  const page = createFakePage();

  await page.goto('https://example.com/', { waitUntil: 'domcontentloaded' });
  await page.mouse.move(10, 20, { steps: 2 });
  await page.keyboard.press('Enter');

  assert.deepStrictEqual(page.actionsLog, [
    {
      target: 'page',
      method: 'goto',
      args: ['https://example.com/', { waitUntil: 'domcontentloaded' }],
    },
    {
      target: 'mouse',
      method: 'move',
      args: [10, 20, { steps: 2 }],
    },
    {
      target: 'keyboard',
      method: 'press',
      args: ['Enter'],
    },
  ]);
});

test('createFakePage preserves scalar overrides and shared action log', async () => {
  const actionsLog = [];
  const page = createFakePage({
    url: 'https://grok.com/',
    title: 'Grok',
    actionsLog,
  });

  await page.mouse.wheel(0, 120);

  assert.strictEqual(page.url(), 'https://grok.com/');
  assert.strictEqual(await page.title(), 'Grok');
  assert.strictEqual(page.actionsLog, actionsLog);
  assert.deepStrictEqual(actionsLog, [
    {
      target: 'mouse',
      method: 'wheel',
      args: [0, 120],
    },
  ]);
});