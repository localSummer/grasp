import { buildEvidence, capturePageEvidence } from './evidence.js';

export async function runVerifiedAction({
  action,
  page,
  state,
  execute,
  verify,
  onSuccess,
  onFailure,
  baseEvidence = {},
}) {
  const executionResult = await execute();
  const verification = await verify(executionResult);

  if (!verification?.ok) {
    const failureEvidence = await capturePageEvidence(page, state, {
      action,
      ...baseEvidence,
      details: verification?.evidence ?? null,
    });
    const failure = {
      ok: false,
      error_code: verification?.error_code,
      retryable: verification?.retryable,
      suggested_next_step: verification?.suggested_next_step,
      evidence: failureEvidence,
      executionResult,
    };
    if (onFailure) return onFailure(failure);
    return failure;
  }

  const capturedSuccess = await capturePageEvidence(page, state, {
    action,
    ...baseEvidence,
    url: verification?.evidence?.url ?? page?.url?.() ?? null,
    dom_revision: verification?.evidence?.domRevision ?? state?.pageState?.domRevision ?? null,
    active_hint: verification?.evidence?.activeId ?? null,
    details: verification?.evidence ?? null,
  });

  const successEvidence = buildEvidence(capturedSuccess);
  const success = {
    ok: true,
    evidence: successEvidence,
    executionResult,
    verification,
  };
  if (onSuccess) return onSuccess(success);
  return success;
}
