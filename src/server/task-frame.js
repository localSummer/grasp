export function createTaskFrame({ taskId, kind, maxAttempts = 3 }) {
  return {
    taskId,
    kind,
    attempts: 0,
    maxAttempts,
    history: [],
    semanticBindings: new Map(),
    nextRecovery: null,
  };
}
