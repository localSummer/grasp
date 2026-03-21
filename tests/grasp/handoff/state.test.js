import test from 'node:test';
import assert from 'node:assert/strict';
import { createHandoffState } from '../../../src/grasp/handoff/state.js';
import {
  requestHandoff,
  markHandoffInProgress,
  markAwaitingReacquisition,
  markResumedUnverified,
  markResumeVerified,
  clearHandoff,
} from '../../../src/grasp/handoff/events.js';

test('handoff state starts idle', () => {
  const state = createHandoffState();
  assert.equal(state.state, 'idle');
  assert.equal(state.reason, null);
});

test('handoff lifecycle transitions are explicit', () => {
  let state = createHandoffState();
  state = requestHandoff(state, 'login_required', 'user must complete login');
  assert.equal(state.state, 'handoff_required');
  assert.equal(state.reason, 'login_required');

  state = markHandoffInProgress(state, 'waiting for human');
  assert.equal(state.state, 'handoff_in_progress');

  state = markAwaitingReacquisition(state, 'human finished, reacquiring');
  assert.equal(state.state, 'awaiting_reacquisition');

  state = markResumedUnverified(state, { page: 'dashboard' }, 'browser resumed');
  assert.equal(state.state, 'resumed_unverified');

  state = markResumeVerified(state, { page: 'dashboard' }, 'resume verified');
  assert.equal(state.state, 'resumed_verified');
  assert.ok(state.verifiedAt);

  state = clearHandoff(state);
  assert.equal(state.state, 'idle');
  assert.equal(state.reason, null);
});

test('requestHandoff persists task anchors on state', () => {
  let state = createHandoffState();
  state = requestHandoff(state, 'login_required', 'user must complete login', {
    expected_url_contains: '/docs/intro',
    expected_page_role: 'docs',
    expected_selector: 'main',
    continuation_goal: 'continue reading docs',
    expected_hint_label: 'Search',
  });

  assert.equal(state.expected_url_contains, '/docs/intro');
  assert.equal(state.expected_page_role, 'docs');
  assert.equal(state.expected_selector, 'main');
  assert.equal(state.continuation_goal, 'continue reading docs');
  assert.equal(state.expected_hint_label, 'Search');

  state = clearHandoff(state);
  assert.equal(state.expected_url_contains, null);
  assert.equal(state.expected_page_role, null);
  assert.equal(state.expected_selector, null);
  assert.equal(state.continuation_goal, null);
  assert.equal(state.expected_hint_label, null);
});
