# Grasp v0.4.0 Release Notes

日期：2026-03-21  
版本：`v0.4.0`

---

## Summary

`v0.4.0` is the release where Grasp stops feeling like a browser wrapper and starts feeling like a browser runtime.

This release is not centered on “more tools”.
It is centered on browser continuity:
- runtime truth
- page grasp
- verified actions
- persisted handoff
- task continuation after human intervention
- false-verified rejection

In short:

# Grasp v0.4.0 is about continuity, not just control.

---

## What is new in v0.4.0

### 1. Runtime Truth entered the mainline
Grasp now centers browser/runtime state around a unified truth model instead of scattered status viewpoints.

This gives the runtime a more trustworthy base for:
- browser connectivity
- page availability
- status reporting
- recovery decisions

### 2. Page Grasp became first-class state
Grasp now tracks more than title + URL.
It can express:
- `pageIdentity`
- `currentRole`
- `graspConfidence`
- `reacquired`
- `domRevision`

That means the runtime is starting to reason about what state the page is in, not just where the browser is.

### 3. Verified actions moved into the mainline
`click` and `type` are no longer treated as blind success paths.
They now return structured evidence and feed a verification-oriented action flow.

### 4. Handoff / Resume became a real runtime capability
Human-required steps are now represented explicitly as runtime state instead of being treated as an implicit interruption.

Main states include:
- `handoff_required`
- `handoff_in_progress`
- `awaiting_reacquisition`
- `resumed_unverified`
- `resumed_verified`

### 5. Handoff now persists across calls
Grasp can now survive handoff / resume across MCP calls by persisting handoff state into runtime-scoped storage.

This is one of the biggest shifts in `v0.4.0`.
It moves handoff from process-scoped memory into recoverable runtime behavior.

### 6. Task continuation anchors were introduced
`resume_after_handoff` can now verify whether recovery actually returned to the expected workflow context.

Supported anchors include:
- `expected_url_contains`
- `expected_page_role`
- `expected_selector`

These anchors can be written during `request_handoff` and inherited automatically at resume time.

### 7. False-verified defense is now real
If the page comes back but the expected continuation context does not match, Grasp no longer treats the recovery as verified.

Instead, it falls to:
- `resumed_unverified`

This matters because a browser runtime should not only confirm correct recovery.
It should also reject wrong recovery.

---

## Real validation in v0.4.0

### Mainline interaction surface validated
The cleaned `v0.4` mainline surface now includes:
- `navigate`
- `get_status`
- `get_page_summary`
- `get_hint_map`
- `click`
- `type`
- `hover`
- `press_key`
- `watch_element`
- `scroll`
- `request_handoff`
- `mark_handoff_in_progress`
- `mark_handoff_done`
- `resume_after_handoff`
- `clear_handoff`

### Handoff persistence validated
A full cross-call handoff chain now closes successfully from:
- `handoff_required`
through
- `handoff_in_progress`
- `awaiting_reacquisition`
into
- `resumed_verified`

### High-friction auth recovery validated
On `https://github.com/login`, Grasp now has both:

#### Positive continuation evidence
With matching persisted anchors, recovery returns:
- `resumed_verified`
- `Task continuation: ok`

#### Negative continuation evidence
With intentionally wrong anchors, recovery returns:
- `resumed_unverified`
- `Task continuation: failed`

This gives `v0.4.0` both sides of the claim:
- it can confirm correct recovery
- it can reject incorrect recovery

### High-friction checkpoint orchestration validated
On `https://chatgpt.com/`, Grasp now has a full checkpoint-aware runtime chain:

1. `session_trust_preflight`
2. `preheat_session`
3. `navigate_with_strategy`
4. `request_handoff_from_checkpoint`
5. `mark_handoff_done`
6. `resume_after_handoff`
7. `get_status`

This chain now proves that Grasp can:
- identify `checkpoint` instead of misclassifying the page as normal content
- distinguish checkpoint kinds such as `waiting_room` and `challenge`
- surface a concrete next step (`handoff_required`)
- persist checkpoint-aware handoff state
- reject false recovery when the checkpoint is still present after resume

### Cross-target strategy isolation validated
When the active page is a ChatGPT checkpoint, Grasp no longer reuses that page-state as if it were the target state for `https://github.com/login`.

This means strategy decisions now distinguish:
- current page context
- target host context

instead of collapsing them into the same checkpoint conclusion.

### Test status
Current automated test status:

# `52 / 52` passing

---

## What v0.4.0 does claim

Grasp v0.4.0 claims that:
- the agent can own a persistent browser profile
- the runtime can express page-level grasp and recovery state
- actions can be verified through structured evidence
- handoff can persist across calls
- continuation can be checked against expected anchors
- wrong recovery can be rejected instead of being silently accepted

---

## What v0.4.0 does not claim

Grasp v0.4.0 does **not** claim:
- universal bypass of high-friction or strongly verified environments
- fully autonomous completion of every login or CAPTCHA flow
- full task-semantic recovery for every multi-step workflow

The current state is better described as:

# anchor-based task continuation verification

not yet:

# full task-semantic recovery

---

## Release significance

This release matters because it changes the shape of the product.

Before, Grasp could already operate a browser.
Now it is starting to:
- maintain browser continuity
- reason about recovery validity
- survive human intervention
- reject false confidence

That is the beginning of a real browser runtime.

---

## Recommended reading

For the current product position:
- `docs/grasp_作品诊断与定位收紧建议_v1.md`

For the current implementation milestone:
- `docs/grasp_v0.4_主干里程碑_v1.md`
