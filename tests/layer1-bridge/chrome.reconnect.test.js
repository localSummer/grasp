import test from 'node:test';
import assert from 'node:assert/strict';
import { createConnectionSupervisor } from '../../src/layer1-bridge/chrome.js';

test('supervisor marks browser unreachable after bounded retries', async () => {
  let attempt = 0;
  const supervisor = createConnectionSupervisor({
    connect: async () => {
      attempt += 1;
      throw new Error(`ECONNREFUSED attempt ${attempt}`);
    },
    now: () => 1000,
    retryDelays: [0, 0, 0],
    persistStatus: async () => {},
  });

  await assert.rejects(() => supervisor.getBrowser());

  const status = supervisor.getStatus();
  assert.strictEqual(status.state, 'CDP_UNREACHABLE');
  assert.strictEqual(status.retryCount, 3);
  assert.strictEqual(attempt, 3);
});
