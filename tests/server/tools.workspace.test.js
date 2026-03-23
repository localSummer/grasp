import test from 'node:test';
import assert from 'node:assert/strict';
import { registerWorkspaceTools } from '../../src/server/tools.workspace.js';

test('workspace_inspect returns task_kind workspace with live items and composer state', async () => {
  const calls = [];
  const server = { registerTool(name, spec, handler) { calls.push({ name, handler }); } };
  const state = {
    pageState: { currentRole: 'workspace', workspaceSurface: 'thread', graspConfidence: 'high', riskGateDetected: false },
    handoff: { state: 'idle' },
  };

  registerWorkspaceTools(server, state, {
    getActivePage: async () => ({ title: async () => 'BOSS直聘', url: () => 'https://www.zhipin.com/web/geek/chat?id=1' }),
    syncPageState: async () => undefined,
    collectVisibleWorkspaceSnapshot: async () => ({
      workspace_surface: 'thread',
      live_items: [{ label: '李女士', selected: true }],
      active_item: { label: '李女士' },
      composer: { kind: 'chat_composer', draft_present: false },
      action_controls: [{ label: '发送', action_kind: 'send' }],
      blocking_modals: [],
      loading_shell: false,
      summary: { active_item_label: '李女士', draft_present: false, loading_shell: false },
    }),
  });

  const tool = calls.find((entry) => entry.name === 'workspace_inspect');
  const result = await tool.handler({});

  assert.equal(result.meta.result.task_kind, 'workspace');
  assert.equal(result.meta.result.workspace.workspace_surface, 'thread');
  assert.equal(result.meta.result.workspace.live_items.length, 1);
});

test('workspace_inspect redacts runtime fields from the public workspace view', async () => {
  const calls = [];
  const server = { registerTool(name, spec, handler) { calls.push({ name, handler }); } };
  const state = {
    pageState: { currentRole: 'workspace', workspaceSurface: 'thread', graspConfidence: 'high', riskGateDetected: false },
    handoff: { state: 'idle' },
  };

  registerWorkspaceTools(server, state, {
    getActivePage: async () => ({ title: async () => 'BOSS直聘', url: () => 'https://www.zhipin.com/web/geek/chat?id=1' }),
    syncPageState: async () => undefined,
    collectVisibleWorkspaceSnapshot: async () => ({
      workspace_surface: 'thread',
      live_items: [{ label: '李女士', selected: true, hint_id: 'L1', normalized_label: '李女士' }],
      active_item: { label: '李女士', hint_id: 'L1', normalized_label: '李女士', selected: true },
      composer: { kind: 'chat_composer', draft_present: true, draft_text: '你好' },
      action_controls: [{ label: '发送', action_kind: 'send', hint_id: 'B1' }],
      blocking_modals: [{ label: '权限提示', hint_id: 'M1', normalized_label: '权限提示' }],
      loading_shell: false,
      summary: { active_item_label: '李女士', draft_present: true, loading_shell: false },
    }),
  });

  const tool = calls.find((entry) => entry.name === 'workspace_inspect');
  const result = await tool.handler({});
  const workspace = result.meta.result.workspace;

  assert.deepEqual(workspace.live_items, [{ label: '李女士', selected: true }]);
  assert.deepEqual(workspace.active_item, { label: '李女士' });
  assert.deepEqual(workspace.composer, { kind: 'chat_composer', draft_present: true });
  assert.deepEqual(workspace.action_controls, [{ label: '发送', action_kind: 'send' }]);
  assert.deepEqual(workspace.blocking_modals, [{ label: '权限提示' }]);
  assert.equal(workspace.live_items[0].hint_id, undefined);
  assert.equal(workspace.live_items[0].normalized_label, undefined);
  assert.equal(workspace.composer.draft_text, undefined);
});

test('workspace_inspect short-circuits blocked handoff and gated pages', async () => {
  const cases = [
    { handoffState: 'handoff_required', expectedStatus: 'handoff_required' },
    { handoffState: 'handoff_in_progress', expectedStatus: 'handoff_required' },
    { handoffState: 'awaiting_reacquisition', expectedStatus: 'handoff_required' },
    { handoffState: 'idle', riskGateDetected: true, expectedStatus: 'gated' },
  ];

  for (const testCase of cases) {
    const calls = [];
    const server = { registerTool(name, spec, handler) { calls.push({ name, handler }); } };
    const state = {
      pageState: { currentRole: 'workspace', workspaceSurface: 'thread', graspConfidence: 'high', riskGateDetected: testCase.riskGateDetected === true },
      handoff: { state: testCase.handoffState },
    };

    registerWorkspaceTools(server, state, {
      getActivePage: async () => ({ title: async () => 'BOSS直聘', url: () => 'https://www.zhipin.com/web/geek/chat?id=1' }),
      syncPageState: async () => undefined,
      collectVisibleWorkspaceSnapshot: async () => ({
        workspace_surface: 'thread',
        live_items: [{ label: '李女士', selected: true }],
        active_item: { label: '李女士' },
        composer: { kind: 'chat_composer', draft_present: true },
        action_controls: [{ label: '发送', action_kind: 'send' }],
        blocking_modals: [],
        loading_shell: false,
        summary: { active_item_label: '李女士', draft_present: true, loading_shell: false },
      }),
    });

    const tool = calls.find((entry) => entry.name === 'workspace_inspect');
    const before = JSON.parse(JSON.stringify(state));
    const result = await tool.handler({});

    assert.equal(result.meta.status, testCase.expectedStatus);
    assert.equal(result.meta.continuation.suggested_next_action, 'request_handoff');
    assert.deepEqual(state, before);
  }
});

test('workspace_inspect prefers select_live_item when there is no active item even with a draft', async () => {
  const calls = [];
  const server = { registerTool(name, spec, handler) { calls.push({ name, handler }); } };
  const state = {
    pageState: { currentRole: 'workspace', workspaceSurface: 'thread', graspConfidence: 'high', riskGateDetected: false },
    handoff: { state: 'idle' },
  };

  registerWorkspaceTools(server, state, {
    getActivePage: async () => ({ title: async () => 'BOSS直聘', url: () => 'https://www.zhipin.com/web/geek/chat?id=1' }),
    syncPageState: async () => undefined,
    collectVisibleWorkspaceSnapshot: async () => ({
      workspace_surface: 'thread',
      live_items: [{ label: '李女士', selected: false }],
      active_item: null,
      composer: { kind: 'chat_composer', draft_present: true },
      action_controls: [{ label: '发送', action_kind: 'send' }],
      blocking_modals: [],
      loading_shell: false,
      summary: { active_item_label: null, draft_present: true, loading_shell: false },
    }),
  });

  const tool = calls.find((entry) => entry.name === 'workspace_inspect');
  const result = await tool.handler({});

  assert.equal(result.meta.continuation.suggested_next_action, 'select_live_item');
});

test('workspace_inspect does not suggest execute_action when blockers are visible or send controls are missing', async () => {
  const cases = [
    {
      label: 'visible blocker',
      snapshot: {
        workspace_surface: 'thread',
        live_items: [{ label: '李女士', selected: true }],
        active_item: { label: '李女士' },
        composer: { kind: 'chat_composer', draft_present: true },
        action_controls: [{ label: '发送', action_kind: 'send' }],
        blocking_modals: [{ label: '权限提示' }],
        loading_shell: false,
        summary: {
          active_item_label: '李女士',
          draft_present: true,
          loading_shell: false,
          outcome_signals: { active_item_stable: true },
        },
      },
    },
    {
      label: 'missing send control',
      snapshot: {
        workspace_surface: 'thread',
        live_items: [{ label: '李女士', selected: true }],
        active_item: { label: '李女士' },
        composer: { kind: 'chat_composer', draft_present: true },
        action_controls: [{ label: '取消', action_kind: 'dismiss' }],
        blocking_modals: [],
        loading_shell: false,
        summary: {
          active_item_label: '李女士',
          draft_present: true,
          loading_shell: false,
          outcome_signals: { active_item_stable: true },
        },
      },
    },
  ];

  for (const testCase of cases) {
    const calls = [];
    const server = { registerTool(name, spec, handler) { calls.push({ name, handler }); } };
    const state = {
      pageState: { currentRole: 'workspace', workspaceSurface: 'thread', graspConfidence: 'high', riskGateDetected: false },
      handoff: { state: 'idle' },
    };

    registerWorkspaceTools(server, state, {
      getActivePage: async () => ({ title: async () => 'BOSS直聘', url: () => 'https://www.zhipin.com/web/geek/chat?id=1' }),
      syncPageState: async () => undefined,
      collectVisibleWorkspaceSnapshot: async () => testCase.snapshot,
    });

    const tool = calls.find((entry) => entry.name === 'workspace_inspect');
    const result = await tool.handler({});

    assert.notEqual(result.meta.continuation.suggested_next_action, 'execute_action');
    assert.equal(result.meta.continuation.suggested_next_action, 'workspace_inspect');
  }
});

test('workspace action skeletons call injected handlers only on direct pages', async () => {
  const directCalls = [];
  const directServer = { registerTool(name, spec, handler) { directCalls.push({ name, handler }); } };
  const directState = {
    pageState: { currentRole: 'workspace', workspaceSurface: 'thread', graspConfidence: 'high', riskGateDetected: false },
    handoff: { state: 'idle' },
  };

  registerWorkspaceTools(directServer, directState, {
    getActivePage: async () => ({ title: async () => 'BOSS直聘', url: () => 'https://www.zhipin.com/web/geek/chat?id=1' }),
    syncPageState: async () => undefined,
    collectVisibleWorkspaceSnapshot: async () => ({
      workspace_surface: 'thread',
      live_items: [{ label: '李女士', selected: true }],
      active_item: { label: '李女士' },
      composer: { kind: 'chat_composer', draft_present: true },
      action_controls: [{ label: '发送', action_kind: 'send' }],
      blocking_modals: [],
      loading_shell: false,
      summary: { active_item_label: '李女士', draft_present: true, loading_shell: false },
    }),
    selectLiveItem: async () => 'select_live_item_mutated',
    draftAction: async () => 'draft_action_mutated',
    executeAction: async () => 'execute_action_mutated',
  });

  const directResults = [];
  for (const toolName of ['select_live_item', 'draft_action', 'execute_action']) {
    const tool = directCalls.find((entry) => entry.name === toolName);
    directResults.push(await tool.handler({}));
  }

  assert.equal(directResults[0].meta.continuation.suggested_next_action, 'workspace_inspect');
  assert.equal(directResults[1].meta.continuation.suggested_next_action, 'workspace_inspect');
  assert.equal(directResults[2].meta.continuation.suggested_next_action, 'workspace_inspect');
  assert.deepEqual(directResults.map((result) => result.meta.result.action.status), ['unimplemented', 'unimplemented', 'unimplemented']);

  const blockedCalls = [];
  const blockedServer = { registerTool(name, spec, handler) { blockedCalls.push({ name, handler }); } };
  const blockedState = {
    pageState: { currentRole: 'workspace', workspaceSurface: 'thread', graspConfidence: 'high', riskGateDetected: false },
    handoff: { state: 'handoff_required' },
  };
  const blockedMutations = [];

  registerWorkspaceTools(blockedServer, blockedState, {
    getActivePage: async () => ({ title: async () => 'BOSS直聘', url: () => 'https://www.zhipin.com/web/geek/chat?id=1' }),
    syncPageState: async () => undefined,
    collectVisibleWorkspaceSnapshot: async () => ({
      workspace_surface: 'thread',
      live_items: [{ label: '李女士', selected: true }],
      active_item: { label: '李女士' },
      composer: { kind: 'chat_composer', draft_present: true },
      action_controls: [{ label: '发送', action_kind: 'send' }],
      blocking_modals: [],
      loading_shell: false,
      summary: { active_item_label: '李女士', draft_present: true, loading_shell: false },
    }),
    selectLiveItem: async () => blockedMutations.push('select_live_item_mutated'),
    draftAction: async () => blockedMutations.push('draft_action_mutated'),
    executeAction: async () => blockedMutations.push('execute_action_mutated'),
  });

  for (const toolName of ['select_live_item', 'draft_action', 'execute_action']) {
    const tool = blockedCalls.find((entry) => entry.name === toolName);
    const result = await tool.handler({});

    assert.equal(result.meta.status, 'handoff_required');
    assert.equal(result.meta.continuation.suggested_next_action, 'request_handoff');
  }

  assert.deepEqual(blockedMutations, []);
});
