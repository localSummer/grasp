import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

const dir = await mkdtemp(join(tmpdir(), 'grasp-handoff-'));
process.env.GRASP_HANDOFF_STATE_PATH = join(dir, 'handoff-state.json');
const { createHandoffState } = await import('../../../src/grasp/handoff/state.js');
const { writeHandoffState, readHandoffState } = await import('../../../src/grasp/handoff/persist.js');

test('handoff state persists across reads', async () => {
  const state = createHandoffState();
  state.state = 'handoff_required';
  state.reason = 'login_required';
  await writeHandoffState(state);

  const loaded = await readHandoffState();
  assert.equal(loaded.state, 'handoff_required');
  assert.equal(loaded.reason, 'login_required');
});

test('handoff persisted anchors survive write/read', async () => {
  const state = createHandoffState();
  state.state = 'awaiting_reacquisition';
  state.reason = 'login_required';
  state.expected_url_contains = '/docs/intro';
  state.expected_page_role = 'docs';
  state.expected_selector = 'main';
  state.continuation_goal = 'continue reading docs';
  state.expected_hint_label = 'Search';
  await writeHandoffState(state);

  const loaded = await readHandoffState();
  assert.equal(loaded.expected_url_contains, '/docs/intro');
  assert.equal(loaded.expected_page_role, 'docs');
  assert.equal(loaded.expected_selector, 'main');
  assert.equal(loaded.continuation_goal, 'continue reading docs');
  assert.equal(loaded.expected_hint_label, 'Search');
});
