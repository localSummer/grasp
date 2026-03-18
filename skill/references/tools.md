# Grasp Tool Reference

## Navigation

| Tool | Key Parameters | Notes |
|---|---|---|
| `navigate` | `url` | Auto-detects WebMCP on arrival |
| `get_status` | — | Returns connected, mode (standard/webmcp), current URL |
| `get_page_summary` | — | Title + URL + first 2000 chars of visible text |
| `screenshot` | — | Base64 PNG of current viewport |

## Interaction

### get_hint_map
Returns semantic map of all interactable elements in viewport.
```
[B1] Submit order      (button, pos:450,320)
[I1] Coupon code       (input,  pos:450,280)
[L2] Back to cart      (link,   pos:200,400)
```
IDs are fingerprint-stable — same element gets same ID across calls. Call again after page changes.

### get_form_fields
Returns form fields aligned with hint map IDs. Use before `type` to confirm target fields.

### click
| Parameter | Type | Description |
|---|---|---|
| `hintId` | string | e.g. `"B1"` |

High-risk actions (delete, pay, submit with irreversible effects) are intercepted when `GRASP_SAFE_MODE=true`. Use `confirm_click` to proceed.

### confirm_click
Force-click an intercepted high-risk element. Same parameters as `click`.

### type
| Parameter | Type | Description |
|---|---|---|
| `hintId` | string | Target input field |
| `text` | string | Text to type keystroke-by-keystroke |

### hover
| Parameter | Type | Description |
|---|---|---|
| `hintId` | string | Element to hover |

Use to trigger dropdowns, tooltips, or reveal hidden menus.

### scroll
| Parameter | Type | Description |
|---|---|---|
| `direction` | `"up"` \| `"down"` | Scroll direction |
| `amount` | number | Pixels (default: 300) |

Dispatched as real wheel events.

### press_key
| Parameter | Type | Description |
|---|---|---|
| `key` | string | e.g. `"Enter"`, `"Tab"`, `"Escape"`, `"ctrl+a"` |

### watch_element
| Parameter | Type | Description |
|---|---|---|
| `selector` | string | CSS selector |
| `timeout` | number | Max ms to wait (default: 5000) |

Resolves when DOM changes detected. Use to wait for async updates after an action.

## Tabs

| Tool | Key Parameters | Notes |
|---|---|---|
| `get_tabs` | — | Returns index, title, URL for all tabs |
| `switch_tab` | `index` | 0-based index from get_tabs |
| `new_tab` | `url` | Opens URL in new tab, switches to it |
| `close_tab` | `index` | Closes tab by index |

## Audit & WebMCP

| Tool | Key Parameters | Notes |
|---|---|---|
| `get_logs` | `lines` (default 20) | Recent operations from `~/.grasp/audit.log` |
| `call_webmcp_tool` | `tool`, `params` | WebMCP mode only — calls native page API |

## Configuration

| Variable | Default | Effect |
|---|---|---|
| `CHROME_CDP_URL` | `http://localhost:9222` | Chrome remote debugging address |
| `GRASP_SAFE_MODE` | `true` | Intercept destructive actions |

Config file: `~/.grasp/config.json`

## Common Workflows

**Fill and submit a form:**
```
navigate(url)
get_hint_map()          → find input IDs
get_form_fields()       → confirm field labels
type(hintId, text)      → fill each field
click(submitButtonId)   → submit
screenshot()            → verify result
```

**Scrape content after login:**
```
get_status()            → confirm connected
navigate(url)           → page already logged in (session persists)
get_page_summary()      → extract visible text
scroll("down")          → load more if needed
```

**Handle dynamic page:**
```
click(buttonId)
watch_element(".result-container")   → wait for update
get_hint_map()                        → re-scan after change
```
