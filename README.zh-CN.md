# Grasp

[English](./README.md) · [简体中文](./README.zh-CN.md) · [GitHub](https://github.com/Yuzc-001/grasp) · [Issues](https://github.com/Yuzc-001/grasp/issues)

[![Version](https://img.shields.io/badge/version-v0.4.0-0B1738?style=flat-square)](./CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-23C993?style=flat-square)](./LICENSE)
[![Validated](https://img.shields.io/badge/validated-Claude%20Code%20%7C%20Codex%20%7C%20Cursor-5B6CFF?style=flat-square)](./README.zh-CN.md#安装)
[![npm](https://img.shields.io/badge/npm-grasp-CB3837?style=flat-square)](https://www.npmjs.com/package/grasp)

> **给 AI 一个专属浏览器运行时。**
>
> 持久状态、可验证动作、可恢复的人机接力——全部运行在你的机器上、你的 Chrome profile 里。

Grasp 是一个开源 MCP 浏览器运行时，面向 AI agent。它完全本地运行，连接专属的 `chrome-grasp` profile，给 agent 的不只是浏览器控制能力，而是浏览器连续性：页面 grasp、动作验证、handoff 持久化，以及人工介入后的恢复能力。

**当前版本：** `v0.4.0`

**发布文档：**
- [Release Notes](./docs/release-notes-v0.4.0.md)
- [实现里程碑](./docs/grasp_v0.4_主干里程碑_v1.md)
- [作品定位](./docs/grasp_作品诊断与定位收紧建议_v1.md)

---

## v0.4 有什么不同

`v0.4` 不是“又多了一些浏览器工具”。
它是 Grasp 从“浏览器 wrapper”开始走向“浏览器 runtime”的节点。

### v0.4 主干能力
- **Runtime Truth** —— 浏览器 / 运行时状态被统一收敛到一个 truth layer
- **Page Grasp** —— Grasp 开始跟踪页面角色、grasp 信心、页面身份和 reacquisition 状态
- **Verified actions** —— `click` / `type` 不再只是盲成功，而会返回结构化 evidence
- **Recoverable handoff** —— 需要人工介入的步骤可以被请求、持久化，并在跨调用后恢复
- **Task continuation anchors** —— resume 可以校验期望 URL、页面角色、选择器是否匹配
- **False-verified defense** —— 当页面回来了但任务没接上时，Grasp 会拒绝误判为 verified

### v0.4 明确承诺什么
- agent 可以拥有自己的持久浏览器 profile
- agent 可以基于紧凑的语义页面视图进行推理
- agent 可以验证动作是否真的产生了可观察变化
- agent 可以跨调用经历 handoff / resume
- agent 可以在 continuation anchors 不匹配时拒绝错误恢复

### v0.4 不承诺什么
- 对所有高风控 / 强验证环境的通用绕过
- 对所有登录或验证码流程的全自动完成
- 对所有多步工作流的完整任务语义恢复

一句话：

# Grasp v0.4 关心的是“连续性”，不只是“控制权”。

---

## 设计理念

Agent 应该拥有自己的浏览器。不是借来的会话，不是每次重置的空白标签——而是一个属于它的持久 profile，凭据随使用积累，永不消失。

`chrome-grasp` 就是那个 profile。Agent 在里面完成登录，会话跨越每一次运行。你的标签页和历史从不被触碰。

四个原则贯穿 Grasp 的设计：

**本地，开源。** 全部代码以 MIT 协议开放，运行在你自己的硬件上。没有云后端，没有遥测，不需要账号。Agent 的行为只在你与浏览器之间。

**语义感知，而非原始 HTML。** Grasp 扫描实时视口，生成极简的 Hint Map——屏幕上所有可交互元素的稳定、精炼表示：

```
[B1] 提交订单      (button, pos:450,320)
[I1] 优惠码输入框   (input,  pos:450,280)
[L2] 返回购物车    (link,   pos:200,400)
```

ID 通过指纹注册表跨调用保持稳定。Token 消耗比原始 HTML 节省 90%+。Agent 通过结构化语义理解 UI，而不是在噪声里盲猜。

**真实输入 + 事后验证。** 每次点击沿曲线路径划过屏幕。每次滚动以一组 wheel 事件序列抵达。每次按键携带独立的时序。这是通过 Chrome DevTools Protocol 分发的输入——不是 `element.click()`。在 `v0.4` 中，这些输入越来越多地与 post-action verification 和 grasp evidence 配对出现。

**Handoff 是一等公民。** 对于强验证与高风控环境，Grasp 接受一次性的人工在场。它不试图抹去所有门槛；它要做的，是把一次必要的人工步骤，转化为可持久化、可恢复、可验证的浏览器连续性。

**它不消灭门槛；它消灭门槛的重复——并拒绝错误恢复。**

---

## 安装

### 一行命令

```bash
npx grasp
```

检测 Chrome，以 `chrome-grasp` profile 启动，自动配置 AI 客户端。首次运行时打开浏览器——在里面登录 Agent 需要的服务，会话永久保存。

### Claude Code

```bash
claude mcp add grasp -- npx -y grasp
```

### Claude Desktop / Cursor

```json
{
  "mcpServers": {
    "grasp": {
      "command": "npx",
      "args": ["-y", "grasp"]
    }
  }
}
```

### Codex CLI

```toml
[mcp_servers.grasp]
type    = "stdio"
command = "npx"
args    = ["-y", "grasp"]
```

---

## CLI

| 命令 | 说明 |
|:---|:---|
| `grasp` / `grasp connect` | 连接向导——检测 Chrome、启动、配置 AI 客户端 |
| `grasp status` | 连接状态、当前标签页、最近操作 |
| `grasp logs` | 查看审计日志（`~/.grasp/audit.log`） |
| `grasp logs --lines 20` | 最近 20 条 |
| `grasp logs --follow` | 实时跟随 |

---

## MCP 工具

### v0.4 主干工具面

| 工具 | 说明 |
|:---|:---|
| `navigate` | 导航到 URL，并刷新 runtime / page grasp 状态 |
| `get_status` | 当前浏览器 / runtime 状态、页面角色、grasp 信心、handoff 状态 |
| `get_page_summary` | 标题、URL、模式与精简后的可见内容 |
| `get_hint_map` | 返回当前视口的语义交互地图 |
| `click` | 按 Hint ID 点击，并返回验证 evidence |
| `type` | 按 Hint ID 输入，并进行验证 |
| `hover` | 按 Hint ID 悬停，并刷新可见交互状态 |
| `press_key` | 发送键盘输入，并刷新页面状态 |
| `watch_element` | 监听选择器的 appears / disappears / changes |
| `scroll` | 滚动当前页面，并刷新 page grasp |
| `request_handoff` | 持久化记录当前流程需要人工介入 |
| `mark_handoff_in_progress` | 标记人工正在处理该步骤 |
| `mark_handoff_done` | 标记人工步骤已完成，进入 reacquisition 阶段 |
| `resume_after_handoff` | 重新 grasp 页面，并在恢复前校验 continuation anchors |
| `clear_handoff` | 清空 handoff 状态并回到 idle |

### v0.4 工具面的说明

- `resume_after_handoff` 支持 task continuation anchors：
  - `expected_url_contains`
  - `expected_page_role`
  - `expected_selector`
- anchors 可以在 `request_handoff` 时持久化写入，并在 resume 时自动继承
- continuation mismatch 不再误判为 verified，而会落到 `resumed_unverified`

代码库里仍可能保留一些 legacy / auxiliary 能力，但上面这张表才是当前 `v0.4` 的主干工具面。

---

## 配置

| 变量 | 默认值 | 说明 |
|:---|:---|:---|
| `CHROME_CDP_URL` | `http://localhost:9222` | Chrome 远程调试地址 |
| `GRASP_SAFE_MODE` | `true` | 执行前拦截高危操作 |

持久化配置存储在 `~/.grasp/config.json`。

## 恢复语义

`v0.4` 中的工具越来越多地会通过结构化 `meta` 暴露恢复语义：

- `error_code`：失败类型，例如 `CDP_UNREACHABLE`、`STALE_HINT`、`ACTION_NOT_VERIFIED`
- `retryable`：调用方是否可以安全地做有界重试
- `suggested_next_step`：建议下一步动作，例如 `retry`、`reobserve`、`wait_then_reverify`
- `evidence`：验证器判断时使用的页面证据
- handoff 恢复还可以返回 continuation evidence，用来说明期望 URL / role / selector 是否真的匹配

这正是 `v0.4` 的变化之一：
- 不再只是执行浏览器动作
- 而是开始判断这次恢复到底算不算有效恢复

benchmark 的 smoke 场景和口径说明仍然保留在 [docs/benchmarks/search-benchmark.md](./docs/benchmarks/search-benchmark.md)。

---

## 仓库结构

```
index.js                    CLI 入口，MCP Server 引导
src/
  server/                   工具注册表、状态、审计日志、响应
  layer1-bridge/            Chrome CDP 连接、WebMCP 探测
  layer2-perception/        Hint Map、指纹注册表
  layer3-action/            鼠标曲线、滚轮事件、键盘输入
  cli/                      connect · status · logs · 自动配置
examples/                   客户端配置示例
start-chrome.bat            Windows Chrome 启动脚本
```

---

## 许可证

MIT — 见 [LICENSE](./LICENSE)。

## 联系

- Issues：https://github.com/Yuzc-001/grasp/issues

## Claude Code Skill

安装随包附带的 skill，让 Claude 获得 Grasp 所有工具的结构化知识——工作流、Hint Map 用法、安全模式和 WebMCP 探测。

**OpenClaw：** 搜索 `grasp`，一键安装。

**手动安装：**

```bash
curl -L https://github.com/Yuzc-001/grasp/raw/main/grasp.skill -o ~/.claude/skills/grasp.skill
```

安装后，Claude 自动知道何时、如何使用 Grasp——无需手动提示。

---

## Star 历史

[![Star History Chart](./star-history.svg)](https://star-history.com/#Yuzc-001/grasp&Date)

---

[README.md](README.md) · [CHANGELOG.md](CHANGELOG.md) · [CONTRIBUTING.md](CONTRIBUTING.md)
