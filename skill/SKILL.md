---
name: grasp
description: Use when user wants to automate browser interactions — navigate websites, click elements, fill forms, scroll pages, take screenshots, or observe web content. Requires grasp MCP server running and Chrome with remote debugging enabled.
---

# Grasp — Browser Automation

Grasp gives the AI a persistent Chrome profile (`chrome-grasp`). Log in once; sessions survive every run.

## Prerequisites

Before any action, verify Chrome is reachable:

```
get_status  →  check "connected: true"
```

If not connected, ask the user to run:
```bash
npx grasp
# or: grasp connect
```

## Core Pattern (3 steps)

```
1. navigate(url)           → land on page
2. get_hint_map()          → see what's interactable
3. click(hintId) / type()  → act
```

Repeat steps 2–3 until the task is done. Use `get_page_summary` or `screenshot` to verify results.

**Re-scan rule:** Call `get_hint_map` again after every navigation, click that loads a new page, or DOM change. Old hint IDs are invalid after any page update.

## Hint Map vs Screenshot

| Use `get_hint_map` | Use `screenshot` |
|---|---|
| Finding what to click/type | Verifying visual result |
| Navigation and interaction | CAPTCHA / visual-only content |
| Token-efficient perception | Confirming layout after action |

Hint Map costs 90%+ fewer tokens than raw HTML or screenshot OCR.

## Execution Modes

**Standard mode** (most pages): Hint Map + real input events via CDP.

**WebMCP mode** (pages exposing `window.__webmcp__`): `navigate` auto-detects it. Use `call_webmcp_tool` for native API calls. `get_status` shows current mode.

## Safety Mode

High-risk clicks (destructive buttons, payment confirms) are intercepted automatically when `GRASP_SAFE_MODE=true` (default). Use `confirm_click(hintId)` to proceed after reviewing.

## When Things Go Wrong

| Symptom | Fix |
|---|---|
| `get_hint_map` returns empty | Page still loading — call `get_page_summary` first, then retry |
| Element not found after click | Page navigated — call `get_hint_map` again to re-scan |
| Element exists but not clickable | It may be off-screen — `scroll("down")` then re-scan |
| `watch_element` times out | Action didn't trigger DOM change — check with `screenshot` |

## Full Tool Reference

See [references/tools.md](references/tools.md) for all tools, parameters, and usage notes.
