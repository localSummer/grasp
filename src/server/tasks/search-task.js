import { getActivePage } from '../../layer1-bridge/chrome.js';
import { waitUntilStable } from '../content.js';
import { observeSearchSnapshot } from '../observe.js';
import { createTaskFrame } from '../task-frame.js';

function chooseSearchPlan(snapshot, frame) {
  const searchHint = (snapshot?.hints ?? []).find((hint) => hint.semantic === 'search_input');
  let mode = 'primary_submit';
  if (frame.nextRecovery === 'alternate_submit') {
    mode = 'alternate_submit';
  } else if (frame.nextRecovery === 'reobserve') {
    mode = 'reobserve';
  }
  frame.nextRecovery = null;
  const plan = {
    query: snapshot?.query,
    mode,
    hintId: searchHint?.id ?? frame.semanticBindings.get('search_input') ?? null,
  };
  if (plan.hintId) {
    frame.semanticBindings.set('search_input', plan.hintId);
  }
  return plan;
}

function applyRecovery(frame, verdict) {
  if (!verdict?.error_code) return;
  if (verdict.error_code === 'NO_EFFECT') {
    frame.nextRecovery = 'alternate_submit';
  } else if (verdict.error_code === 'LOADING_PENDING') {
    frame.nextRecovery = 'wait_then_reverify';
  } else {
    frame.nextRecovery = 'reobserve';
  }
}

function finalizeResult(frame, status, plan, verdict) {
  const attempts = status === 'failed' ? frame.attempts : frame.attempts + 1;
  const toolCalls = frame.history.filter((entry) => entry.execution).length;
  return {
    status,
    attempts,
    toolCalls,
    retries: Math.max(frame.attempts, 0),
    plan,
    verdict,
    frame,
  };
}

export async function runSearchTask({
  query,
  observer,
  executor,
  verifier,
  waitThenReverify,
  maxAttempts = 3,
  taskId,
}) {
  const frame = createTaskFrame({
    taskId: taskId ?? `search-${Date.now()}`,
    kind: 'search_task',
    maxAttempts,
  });
  const waitFn = typeof waitThenReverify === 'function'
    ? waitThenReverify
    : async () => undefined;

  for (; frame.attempts < frame.maxAttempts; frame.attempts += 1) {
    const observerResult = await observer({ query, frame });
    const snapshot = observerResult?.snapshot ?? observerResult;
    const plan = chooseSearchPlan(snapshot, frame);
    const execution = await executor(plan);
    const verdict = await verifier({ plan, execution, snapshot, frame });
    frame.history.push({ snapshot, plan, execution, verdict });

    if (verdict.ok) {
      return finalizeResult(frame, 'completed', plan, verdict);
    }

    if (verdict.error_code === 'LOADING_PENDING') {
      await waitFn({ plan, snapshot, frame, query });
      const retryVerdict = await verifier({ plan, execution, snapshot, frame, retry: true });
      frame.history.push({ phase: 'wait_then_reverify', plan, verdict: retryVerdict });
      if (retryVerdict.ok) {
        return finalizeResult(frame, 'completed', plan, retryVerdict);
      }
      applyRecovery(frame, retryVerdict);
      continue;
    }

    applyRecovery(frame, verdict);
  }

  return finalizeResult(frame, 'failed', null, null);
}

export async function runSearchTaskTool({ state, query, max_attempts = 3 }) {
  const page = await getActivePage();
  const observer = async ({ frame }) => observeSearchSnapshot({ page, state, query, frame });
  const executor = async (plan) => ({ ok: true, execution: plan });
  const verifier = async () => ({ ok: true, evidence: { ready: true } });
  const waitThenReverify = async () => {
    await waitUntilStable(page, { stableChecks: 2, interval: 120, timeout: 2000 });
  };

  const result = await runSearchTask({
    query,
    observer,
    executor,
    verifier,
    waitThenReverify,
    maxAttempts: max_attempts,
    taskId: `search-tool-${Date.now()}`,
  });

  state.taskFrames.set(result.frame.taskId, result.frame);
  return result;
}
