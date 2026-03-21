import test from 'node:test';
import assert from 'node:assert/strict';
import { runVerifiedAction } from '../../../src/grasp/verify/pipeline.js';

function fakePage(url = 'https://example.com') {
  return {
    url: () => url,
    title: async () => 'Example Domain',
    evaluate: async () => 'Example Domain content',
  };
}

test('runVerifiedAction returns success with normalized evidence', async () => {
  const result = await runVerifiedAction({
    action: 'click',
    page: fakePage(),
    state: { pageState: { domRevision: 2, currentRole: 'content', graspConfidence: 'high', reacquired: false } },
    baseEvidence: { hint_id: 'L1' },
    execute: async () => ({ label: 'Learn more' }),
    verify: async () => ({ ok: true, evidence: { url: 'https://example.com', domRevision: 2, activeId: 'L1' } }),
  });

  assert.equal(result.ok, true);
  assert.equal(result.evidence.action, 'click');
  assert.equal(result.evidence.hint_id, 'L1');
  assert.equal(result.evidence.dom_revision, 2);
  assert.equal(result.evidence.page_title, 'Example Domain');
  assert.equal(result.evidence.summary_excerpt, 'Example Domain content');
  assert.equal(result.evidence.page_role, 'content');
  assert.equal(result.evidence.grasp_confidence, 'high');
});

test('runVerifiedAction returns failure with captured evidence', async () => {
  const result = await runVerifiedAction({
    action: 'type',
    page: fakePage('https://example.com/login'),
    state: { pageState: { domRevision: 5, currentRole: 'auth', graspConfidence: 'medium', reacquired: true } },
    baseEvidence: { hint_id: 'I1' },
    execute: async () => ({ text: 'abc' }),
    verify: async () => ({ ok: false, error_code: 'ACTION_NOT_VERIFIED', retryable: true, suggested_next_step: 'reverify', evidence: { value: '' } }),
  });

  assert.equal(result.ok, false);
  assert.equal(result.error_code, 'ACTION_NOT_VERIFIED');
  assert.equal(result.evidence.hint_id, 'I1');
  assert.equal(result.evidence.action, 'type');
  assert.equal(result.evidence.url, 'https://example.com/login');
  assert.equal(result.evidence.page_role, 'auth');
  assert.equal(result.evidence.grasp_confidence, 'medium');
});
