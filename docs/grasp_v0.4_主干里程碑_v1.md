# Grasp v0.4 主干里程碑 v1

日期：2026-03-21  
对象：`/root/.openclaw/workspace/.downloads/grasp`  
目标：把 `grasp v0.4` 当前已经真实成立的主干能力收口成一次正式里程碑，并明确下一阶段继续推进的切口。

---

## 一、先给结论

`grasp v0.4` 现在已经不是：
- 只有架构图
- 只有定位文案
- 只有单测雏形
- 只有“准备重塑”

它已经进入：

# **主干真实长出来的阶段。**

而且这次不是抽象意义上的“更接近了”，而是已经实际成立了下面几件事：

1. Runtime Truth 雏形已经进入运行路径  
2. Page Grasp 雏形已经进入运行路径  
3. Verification Pipeline 雏形已经进入 `click` / `type` 主路径  
4. `tools.js` 已完成一次干净主干重写  
5. **Handoff / Resume 已经首次形成跨调用持久化闭环**

这意味着：

# **`grasp v0.4` 已经从“重塑准备期”进入“主干施工期”。**

---

## 二、这次里程碑最重要的价值

不是“又修了一些 bug”，
也不是“又加了一些工具”。

这次真正的跃迁是：

# **把 `grasp` 的核心价值，从浏览器操作能力，推进到了浏览器连续性能力。**

更具体地说：

### 以前更像什么
- 能连浏览器
- 能看 hint map
- 能 click / type
- 能做局部页面操作

### 现在开始像什么
- 能陈述 runtime truth
- 能陈述 page grasp
- 能对 action 做验证
- 能在人机接力后保留并恢复 handoff truth

也就是说，`grasp` 正在从：

# **browser automation shell**

往：

# **agent-owned browser runtime**

真正转过去。

---

## 三、这次已经真实成立的能力

---

### 1. Runtime Truth Layer 已落地到主路径

当前已经建立并接入：
- `src/runtime/truth/model.js`
- `src/runtime/truth/snapshot.js`
- `src/server/runtime-status.js`

并且已经形成：
- `createRuntimeTruth`
- `mergeRuntimeTruth`
- `legacyRuntimeStatusToTruth`
- `truthToLegacyRuntimeStatus`
- `readRuntimeTruth`
- `writeRuntimeTruth`

这说明 `grasp` 不再只是“运行时自己感觉在线”，
而是已经开始拥有：

# **统一的 runtime 状态真相层。**

这是 browser runtime 作品成立的前提。

---

### 2. Page Grasp Layer 已进入 server 主路径

当前已经建立并接入：
- `src/grasp/page/state.js`
- `src/grasp/page/capture.js`
- `src/server/state.js`

并且已具备对外表达：
- `pageIdentity`
- `currentRole`
- `graspConfidence`
- `reacquired`
- `domRevision`

这意味着 `grasp` 已经不只是“当前页 title 是什么”，
而是开始对页面形成：

# **可持续、可验证、可恢复的 grasp 表达。**

这一步非常关键，
因为 `grasp` 这个名字要成立，
靠的不是“能打开网页”，
而是：

# **能把握网页当前处于什么状态。**

---

### 3. Verification Pipeline 已进入 `click` / `type` 主路径

当前已经建立并接入：
- `src/grasp/verify/pipeline.js`
- `src/grasp/verify/evidence.js`
- `src/server/postconditions.js`
- `src/server/tools.js`

并且当前真实 evidence 已带出：
- `page_title`
- `summary_excerpt`
- `page_role`
- `grasp_confidence`
- `reacquired`
- `active_hint`
- `details`

这说明 verification 已经不是“动作之后顺手检查一下”，
而是开始成为：

# **以 grasp evidence 为中心的动作收口机制。**

这一步会直接决定 `grasp` 和普通 browser skill 的差异。

---

### 4. Handoff / Resume 已从“概念状态机”推进到“真实运行路径”

当前已经建立：
- `src/grasp/handoff/state.js`
- `src/grasp/handoff/events.js`
- `src/grasp/handoff/persist.js`

并已形成显式状态：
- `idle`
- `handoff_required`
- `handoff_in_progress`
- `awaiting_reacquisition`
- `resumed_unverified`
- `resumed_verified`

更重要的是，
这次不是只有状态定义，
而是已经有真实 MCP/CLI 可调用路径：
- `request_handoff`
- `mark_handoff_in_progress`
- `mark_handoff_done`
- `resume_after_handoff`
- `clear_handoff`

这意味着：

# **handoff 不是想法了，而是 runtime capability。**

---

### 5. Handoff 跨调用持久化闭环已真实跑通

这是这次里程碑里最关键的一项。

当前已验证通过的真实链路：

1. `clear_handoff`
2. `request_handoff`
3. `mark_handoff_in_progress`
4. `get_status`
5. `mark_handoff_done`
6. `get_status`
7. `resume_after_handoff`
8. `get_status`

真实结果已经验证：
- `request_handoff` 后，`get_status` 能看到 `handoff_required`
- `mark_handoff_in_progress` 后，`get_status` 能看到 `handoff_in_progress`
- `mark_handoff_done` 后，`get_status` 能看到 `awaiting_reacquisition`
- `resume_after_handoff` 后，`get_status` 最终能看到 `resumed_verified`

而且 `resume_after_handoff` 已返回完整 evidence，包括：
- `page_title`
- `summary_excerpt`
- `page_role`
- `grasp_confidence`
- `reacquired`
- `pageIdentity`

这代表什么？

代表：

# **`grasp` 已经第一次具备了“人机接力后，跨调用保持并恢复浏览器真相”的能力。**

这不是一个普通小 feature，
而是作品级能力。

---

### 6. `tools.js` 已完成一次干净主干重写，并扩大到更完整的交互面

这次不是继续在旧 `tools.js` 上 patch，
而是已经按 `v0.4` 主干思路，完成了一次干净重写。

当前主干已收住的入口包括：
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

而且这次不是只把入口“接进去”，
而是已经做过真实页验证：
- `hover`：真实页面成功触发并返回更新后的可交互状态
- `press_key`：真实页面成功触发键盘交互
- `watch_element`：真实监听页面弹层并命中结果文本
- `scroll`：真实页面滚动后可重新抓到新视口元素

剩余旧工具不再混挂在这次主干重塑上，
而是留在旧路径中等待后续迁移。

这一步的价值在于：

# **`v0.4` 第一次拥有了“干净宿主入口 + 更完整验证交互面”。**

这直接降低了继续施工时的污染风险，也让新主干不再只是 click/type 的窄入口。

---

### 7. Resume 已从 page-level verified 推到带 task anchors 的验证

这是本轮新增里非常关键的一刀。

当前 `resume_after_handoff` 已不再只判断：
- 页面是不是重新抓住了
- `reacquired` 是否成立

而是开始支持 task-level anchors：
- `expected_url_contains`
- `expected_page_role`
- `expected_selector`

并且已经形成两层能力：

#### 第一层：resume 时可显式传入 anchors
真实验证已经证明：
- anchors 匹配时，可落到 `resumed_verified`
- anchors 故意不匹配时，可落到 `resumed_unverified`

也就是说，系统现在已经能区分：
- 页面重新连上了
- 但任务并没有真正接回来

#### 第二层：anchors 已可持久化进 handoff state，并由 resume 自动继承
当前 `request_handoff` 已支持把下列字段写入 handoff state：
- `expected_url_contains`
- `expected_page_role`
- `expected_selector`

而 `resume_after_handoff` 在不显式传 anchors 时，
已经能自动继承 handoff state 中保存的 anchors 进行 continuation 判断。

这意味着：

# **handoff state 已开始承载任务连续性，而不再只是流程状态。**

这是 `grasp` 从 page continuity 走向 task continuity 的第一步。

---

### 8. Handoff / Resume 已补上专门测试护栏

当前不再只是靠“真实页跑通过”来证明这条线成立，
而是已经补上专门测试护栏，覆盖了：

- `requestHandoff persists task anchors on state`
- `handoff persisted anchors survive write/read`
- `resume continuation mismatch can force resumed_unverified`

当前测试总量已来到：

# **49 / 49 全绿**

这说明 handoff / resume 这条线已经同时具备：
- 真实运行证据
- 状态层护栏
- 持久化护栏
- mismatch 护栏

这使它从“已跑通的一段链路”变成“开始具备可持续维护性的主干能力”。

---

### 9. GitHub 登录页上的高摩擦 auth 长链已经成立

这一项很关键，因为它证明 `grasp` 的 task continuation 判断，
已经不只是在温和页面或单测里成立，
而是在更像真实 handoff 的 auth 场景里也成立。

#### 正向实测：正确 anchors 时，可稳定落到 `resumed_verified`
在 `https://github.com/login` 上，使用 anchors：
- `expected_url_contains: github.com`
- `expected_page_role: auth`
- `expected_selector: input[name=login], input[name=password], form`
- `continuation_goal: resume after github login`

然后执行完整链：
- `session_trust_preflight`
- `navigate_with_strategy`
- `request_handoff`
- `mark_handoff_done`
- `resume_after_handoff`
- `get_status`

真实结果：
- `Resume state: resumed_verified`
- `Task continuation: ok`
- `Checkpoint still present: no`
- continuation checks 为 `3 / 3` 通过

这说明在高摩擦 auth 页上，
正确的 continuation anchors 已经足以支撑一次真实的 task continuation 验收。

#### 反向实测：错误 anchors 时，可稳定拒绝 false-verified
同样在 `https://github.com/login` 上，故意写入错误 anchors：
- `expected_url_contains: /dashboard`
- `expected_page_role: docs`
- `expected_selector: main article`

然后执行 handoff / resume 链。

真实结果：
- `Resume state: resumed_unverified`
- `Task continuation: failed`
- continuation checks 为 `0 / 3` 通过

这意味着：

# **页面虽然重新抓住了，但任务没接上时，系统不会误判成 verified。**

这条反向证据非常值钱，
因为它标志着 `grasp` 已经开始具备：

# **false-verified defense**

也就是：
- 不只会确认正确恢复
- 还会拒绝错误恢复

---

### 10. ChatGPT checkpoint 长链已经成立

这一项证明 `grasp` 已经不仅能处理 auth 场景，
而且开始能处理更高风控、带 checkpoint / challenge 的 runtime orchestration。

在 `https://chatgpt.com/` 上，当前已经真实跑通：
- `session_trust_preflight`
- `preheat_session`
- `navigate_with_strategy`
- `request_handoff_from_checkpoint`
- `mark_handoff_done`
- `resume_after_handoff`
- `get_status`

真实结果证明：
- `Just a moment...` 不再被误报为普通 `content`
- 页面会被识别为 `checkpoint`
- checkpoint 可细分为：
  - `waiting_room`
  - `challenge`
- strategy 会明确给出：
  - `handoff_or_preheat`
  - `request_handoff_from_checkpoint`
- checkpoint 未清除时，resume 会落到：
  - `resumed_unverified`
  - `Continuation ready: no`
  - `Suggested next action: handoff_required`

这意味着：

# **grasp` 已经具备了 checkpoint-aware runtime orchestration。**

它不只会识别高风控阻塞，
还会把阻塞接进 handoff / resume 主路径，并拒绝错误恢复。

---

### 11. 工程骨架已完成主干拆分

当前核心结构已不再全部堆在 `src/server/tools.js` 中，
而是拆成：
- `src/server/continuity.js`
- `src/server/tools.strategy.js`
- `src/server/tools.handoff.js`
- `src/server/tools.actions.js`
- `src/server/tools.js`（orchestration shell）

这意味着：

# **产品主线和工程骨架开始真正对齐。**

此前最容易污染、也最难稳定维护的 continuity / strategy / handoff 逻辑，
已经不再全部挤在一个大宿主文件里。

---

### 12. 当前测试状态

当前测试总量已来到：

# **52 / 52 全绿**

---

## 四、这次里程碑不是解决了什么，而是跨过了什么

这次真正跨过的，不是单个 bug，
而是三道边界：

### 边界 1：从“能操作”跨到“能验证”
### 边界 2：从“能观察”跨到“能把握页面状态”
### 边界 3：从“单次会话状态”跨到“跨调用连续状态”

尤其第 3 条最重要。

因为只要状态还是 process-scoped，
浏览器就只是一个“当下能点的工具”；
一旦状态进入 runtime-scoped，
浏览器才开始接近：

# **agent-owned runtime**

这正是 `grasp` 的主线所在。

---

## 五、这次暴露出的真实工程结论

### 1. `tools.js` 旧宿主容器确实已经不适合继续 patch

真实施工过程中反复出现：
- 文本污染
- 尾部残片
- 语法错误
- test 路径与 MCP 启动路径表现不一致

这不是偶发小事故，
而是说明：

# **旧容器已经不适合承载 v0.4 重塑。**

这次整块重写是对的。

---

### 2. `v0.4` 的中心层判断是对的

实测与施工都再次证明：
真正该成为中心的不是：
- bridge
- hints
- actions
- tool registration

而是：
- Runtime Truth
- Handoff / Resume
- Verification
- Page Grasp

这说明此前的架构判断没有偏题，
而且已经被真实工程路径验证。

---

### 3. `browser family 主身份是验证层` 这个判断在 `grasp` 上成立

从 `resume_after_handoff` 返回的 evidence 来看，
`grasp` 的价值已经越来越不是：
- 帮 agent 模拟人类点点点

而是：
- 帮 agent 确认网页当前到底处于什么状态
- 帮 agent 确认动作后有没有真的发生可观察变化
- 帮 agent 在高摩擦网页中建立可恢复的操作连续性

这与此前总纲判断一致。

---

## 六、当前还没有完成的部分

这次里程碑成立，
不代表 `v0.4` 已经做完。

当前明确还没完成的有：

### 1. 新主干已覆盖更完整交互面，但仍不是全量迁移完成
当前已进入新主干并完成真实验证的包括：
- `hover`
- `scroll`
- `press_key`
- `watch_element`

这说明主干已经不再只是 click/type + handoff 的窄面，
而是开始拥有更完整的验证/恢复交互面。

但尚未迁入新主干的旧工具仍然存在，典型还包括：
- tabs 类工具
- 其他历史辅助工具
- 仍未按新中心层重排的一些旧入口

也就是说，

# **当前是“主干已明显长厚”，但还不是“全量迁移完成”。**

---

### 2. Resume Verified 已迈入 task-level，但仍是第一阶段版本
现在 `resumed_verified` 的成立，
已经不再只是：
- 页面可重新连接
- page grasp 成立
- reacquired 为 true

它已经开始结合：
- `expected_url_contains`
- `expected_page_role`
- `expected_selector`
- persisted anchors inheritance

也就是说，

# **当前已经不是纯 page-level verified，**
# **而是进入了 task-level verified 的第一阶段。**

但它还没有完全回答更高层问题：
- 用户要完成的任务是不是已经恢复到真正可继续的 affordance？
- 页面虽然满足 selector / role / url 条件，但流程语义是否仍然偏航？
- 登录之后是否只是回到正确页面，而不是回到正确任务节点？

因此更准确的判断应是：

# **当前是“anchor-based task continuation verified”，**
# **还不是“完整任务语义 verified”。**

这是下一阶段的重要升级点。

---

### 3. 还缺少更高摩擦页面的真实实测闭环
当前真实闭环已经在 `https://github.com/login` 上成立，
但后续还应继续撞更高摩擦页面：
- 登录态保持
- 人机验证后恢复
- Boss 招聘
- bilibili
- 更复杂的 SPA / docs / auth 混合页面

因为 `grasp` 的作品价值，
不能只靠温和页面证明。

---

### 4. 版本一致性还没收口
当前仍存在：
- `README` / `CHANGELOG`: `v0.3.0`
- `package.json`: `0.2.0`

这会影响作品对外叙事与内部里程碑一致性。

---

## 七、下一阶段最值得推进的切口

我建议下一阶段不要再发散，
而是沿着当前已经成立的主干继续施工。

优先级建议如下：

---

### P1：把 anchor-based continuation 推向更强的任务语义验证

当前 task anchors 已经成立，
下一阶段应继续加入更高层判断：
- expected continuation cue
- target affordance reacquisition
- wrong-page / wrong-flow detection
- 多锚点之间的优先级 / 组合判断

目标是把：
- “URL / role / selector 对了”

继续升级为：
- “任务真的接上了，而且接在对的节点上”

这一步会决定 `grasp` 是否真的能成为复杂实战里的浏览器作品。

---

### P2：继续高摩擦网页实测

优先顺序建议：
1. GitHub 登录后恢复
2. 登录态保持
3. 人机验证后恢复
4. 高摩擦招聘/内容平台页面

目标不是为了堆测试数量，
而是为了继续逼出：
- continuity bugs
- wrong-flow bugs
- false-verified bugs

---

### P3：收版本与对外叙事一致性

在主干进一步稳定后，
需要同步收口：
- `README`
- `CHANGELOG`
- `package.json`
- docs 中的版本与主张表达

让外部叙事与当前实际施工状态对齐。

---

## 八、对作品定位的最新判断

截至这次里程碑，
我对 `grasp` 的判断是：

# **它已经具备了作品成立所需的核心主轴。**

它现在最成立的，不再只是：
- 会操作浏览器

而是：

# **开始承担“网页真相 / 任务连续性 / 人机接力恢复”的责任。**

这正是 OpenClaw 体系里一个浏览器作品应该去承担的位置。

如果继续沿着当前主干推进，
`grasp` 最终最有机会成为的，不是普通 browser skill，
而是：

# **OpenClaw 的 agent-owned browser runtime。**

---

## 九、一句话收口

这次里程碑的本质不是：

“`grasp` 修好了一个 handoff 功能。”

而是：

# **`grasp v0.4` 第一次把浏览器连续性，做成了真实可运行的主干能力。**

这一步，值钱，而且是真的。
