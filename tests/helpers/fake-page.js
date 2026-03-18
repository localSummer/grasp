export function createFakePage(overrides = {}) {
  const { url, title, mouse, keyboard, actionsLog = [], ...rest } = overrides;

  const buildAccessor = (value, fallback) => {
    if (value === undefined) {
      return () => fallback;
    }

    if (typeof value === 'function') {
      return value;
    }

    return () => value;
  };

  const recordAction = (target, method, args) => {
    actionsLog.push({ target, method, args });
  };

  const createLoggedMethod = (target, method, implementation = async () => undefined) => {
    return async (...args) => {
      recordAction(target, method, args);
      return implementation(...args);
    };
  };

  const defaults = {
    url: buildAccessor(url, 'about:blank'),
    goto: createLoggedMethod('page', 'goto'),
    evaluate: async (fn, ...args) => fn(...args),
    screenshot: async () => Buffer.from(''),
    close: async () => undefined,
    waitForSelector: async () => null,
    waitForLoadState: async () => undefined,
    title: buildAccessor(title, 'fake page'),
    mouse: {
      click: createLoggedMethod('mouse', 'click'),
      move: createLoggedMethod('mouse', 'move'),
      down: createLoggedMethod('mouse', 'down'),
      up: createLoggedMethod('mouse', 'up'),
      wheel: createLoggedMethod('mouse', 'wheel'),
      ...(mouse ?? {}),
    },
    keyboard: {
      type: createLoggedMethod('keyboard', 'type'),
      press: createLoggedMethod('keyboard', 'press'),
      ...(keyboard ?? {}),
    },
    $: async () => null,
    actionsLog,
  };

  return {
    ...defaults,
    ...rest,
  };
}