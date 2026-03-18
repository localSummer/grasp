import test from 'node:test';
import assert from 'node:assert/strict';
import { createConnectionSupervisor } from '../../src/layer1-bridge/chrome.js';

test('supervisor marks browser unreachable after bounded retries', async () => {
  let attempt = 0;
  const snapshots = [];
  const supervisor = createConnectionSupervisor({
    connect: async () => {
      attempt += 1;
      throw new Error(`ECONNREFUSED attempt ${attempt}`);
    },
    now: () => 1000,
    retryDelays: [0, 0, 0],
    persistStatus: async (snapshot) => {
      snapshots.push(snapshot);
    },
  });

  await assert.rejects(() => supervisor.getBrowser());

  const status = supervisor.getStatus();
  assert.strictEqual(status.state, 'CDP_UNREACHABLE');
  assert.strictEqual(status.retryCount, 3);
  assert.strictEqual(attempt, 3);

  const lastSnapshot = snapshots[snapshots.length - 1];
  assert.strictEqual(lastSnapshot?.state, 'CDP_UNREACHABLE');
  assert.strictEqual(lastSnapshot?.retryCount, 3);
  assert.ok(typeof lastSnapshot?.lastError === 'string' && lastSnapshot.lastError.includes('ECONNREFUSED'));
  assert.ok(typeof lastSnapshot?.updatedAt === 'number');
});

test('supervisor transitions to disconnected when browser emits event', async () => {
  let disconnectHandler;
  const browser = {
    isConnected: () => true,
    once: (event, handler) => {
      if (event === 'disconnected') {
        disconnectHandler = handler;
      }
    },
  };

  const supervisor = createConnectionSupervisor({
    connect: async () => browser,
    now: () => 2000,
    retryDelays: [0],
    persistStatus: async () => {},
  });

  await supervisor.getBrowser();
  assert.ok(typeof disconnectHandler === 'function');

  disconnectHandler();

  const status = supervisor.getStatus();
  assert.strictEqual(status.state, 'disconnected');
  assert.strictEqual(status.lastError, 'browser disconnected');
});
