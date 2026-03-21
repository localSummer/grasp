# Grasp 作品诊断与定位收紧建议 v1

日期：2026-03-20  
对象：`grasp`（本地仓库 + GitHub 当前主线）  
目标：诊断当前 `grasp` 的作品成熟度，明确它最强的地方、当前最关键的瓶颈，以及下一步最值得收紧的定位方向。

---

## 一、先给结论

`grasp` 现在已经不是：
- 一个浏览器 automation 小工具
- 一个普通 MCP 包装层
- 一个只有技术感、没有作品感的 runtime 项目

它已经是：

# **一部正在成型的作品。**

而且不是空架子，是真的已经有：
- 好名字
- 好主张
- 清楚的系统分层
- OpenClaw 指向
- 可成立的产品问题意识

但它现在最大的瓶颈也很明确：

# **主线还没有彻底收死。**

也就是说：
- 方向是对的
- 骨架是强的
- 作品感已经出现了
- 但“哪条线是主线，哪条线是服务主线的技术层”还可以再收一刀

---

## 二、现在这部作品最成立的地方

### 1. 核心主张已经成立

`README` 开头这句非常强：

> **Give AI its own browser.**

这不是功能描述，
这是产品主张。

它在说的不是：
- AI 也能用浏览器

而是：
- AI 应该拥有自己的浏览器身份
- 不借人的浏览器
- 不每次重来
- 不依赖短命会话

这句已经很像作品，而不是工具说明。

---

### 2. `log in once, persist forever` 的故事是有力量的

这一层也成立：
- dedicated profile
- session persistence
- agent-owned browser state

它让 `grasp` 和大多数 browser automation 区分开了。

大多数浏览器工具提供的是：
- 能点
- 能开
- 能操作

而 `grasp` 在试图提供的是：

# **浏览器身份的持续性。**

这是更高一层的价值。

---

### 3. 技术结构不是乱堆，是有层次的

仓库里已经能看出系统分层：
- `layer1-bridge`
- `layer2-perception`
- `layer3-action`

这很值钱。

说明你不是在做一个“命令堆”，
而是在做一个：
# **可解释、可演化、可讲述的 runtime 结构。**

作品要成立，结构感非常重要。

---

### 4. OpenClaw 指向是清楚的

`PLAN.md` 写得很明确：

> **Turn Grasp from a strong standalone MCP browser project into an OpenClaw-ready agent browser runtime.**

以及：

> **An OpenClaw user can give the agent its own browser without becoming a browser automation engineer.**

这两句都很强。

说明你不是在泛做浏览器层，
而是已经知道自己在服务谁、解决什么门槛。

---

## 三、当前最关键的瓶颈

### 瓶颈 1：现在有两条强叙事，还没完全压成一条主线

当前 `grasp` 里实际上并行存在两条都很强的故事：

#### 故事 A：Agent-owned browser runtime
关键词：
- own browser
- persistent profile
- login once
- durable session
- dedicated identity

#### 故事 B：Semantic browser grasp
关键词：
- Hint Map
- semantic perception
- stable fingerprints
- real input
- WebMCP fallback

这两条都不是错，
但现在它们都很强，
就会出现一个问题：

# **谁是主线，谁是服务主线的技术层？**

如果这点不彻底收死，
作品会一直有一点“很强，但还差最后一下统一”的感觉。

---

### 我的判断

# **主线应该是 A：agent-owned browser runtime**

也就是：
- 给 agent 一个自己的浏览器
- 给它持续身份
- 给它持续会话
- 让它不用反复从零开始

而：
- Hint Map
- semantic perception
- real input
- WebMCP
- action layers

这些都应该被讲成：
# **为了让 agent 真正拥有浏览器，这些技术才有意义。**

换句话说：

# 主张在前，技术在后。
# 产品故事在前，技术亮点服务故事。

这就是现在最该收的一刀。

---

### 瓶颈 2：`grasp` 这个名字的力量还没被完全兑现

名字其实很好。

因为它不是：
- browser
- driver
- automation
- crawl
- control

它叫：
# **grasp**

这个词天然带有：
- 抓住
- 把握
- 理解
- 稳定拿住

的意味。

但当前 README 虽然已经讲了 perception、Hint Map、real input，
还没有把：

# **为什么这个作品叫 grasp**

这件事打成一条锋利的作品论点。

---

### 我建议补出的句子

# **Grasp is not just browser control. It gives the agent a stable grip on the web.**

中文可以是：

# **Grasp 不是让 agent 会点网页，**
# **而是让 agent 真正抓住网页世界。**

这句一旦立住：
- 名字
- perception
- verification
- persistence
- interaction

就会从并列概念，变成一个整体。

---

### 瓶颈 3：现在更像“强 runtime 项目”，还差一点“作品一击即中”

现在的 `grasp` 已经很强，
但当前给人的第一感觉还是更偏：
- serious runtime
- strong browser MCP system
- structured engineering project

而不是那种：
# **一句话就能把你抓住的作品。**

这不是因为它弱，
而是因为它现在还偏“工程的成立”，
还没有完全冲到“作品的锋利”。

---

## 四、`grasp` 最该对抗的敌人

一个作品要成立，不只要知道自己做什么，
还要知道自己反对什么。

我认为 `grasp` 的敌人应该明确成这几条：

### 1. AI 说自己做完了，但没有真实页面证据

### 2. 浏览器 automation 很强，但 agent 对页面没有真正把握

### 3. 登录态和浏览器状态不能持续，AI 每次都像失忆

### 4. 只能操作页面，不能确认页面状态是否成立

### 5. 交互动作很多，但没有形成“看见 → 判断 → 验证 → 取证”的闭环

这些敌人一旦写清，
`grasp` 就不会滑向 generic automation。

---

## 五、我对 `grasp` 的最佳定位建议

### 当前最建议的一句话定位

# **Grasp is an agent-owned browser runtime for OpenClaw.**
# **It gives the agent a persistent browser identity and a stable grasp on the web.**

中文可写成：

# **Grasp 是面向 OpenClaw 的 agent-owned browser runtime。**
# **它给 agent 一个持久的浏览器身份，也让 agent 真正抓住网页世界。**

这两句里：
- 第一层是产品主张
- 第二层是名字兑现

这会比单纯说“browser automation via MCP”强很多。

---

## 六、主线 / 副线建议

### 主线
# **Agent-owned browser runtime**

这是产品成立的根。

---

### 第一副线
# **Stable grasp on the web**

这是名字和 perception/verification 价值的兑现。

---

### 第二副线
# **OpenClaw-ready browser reality layer**

这是落地语境。

---

### 技术层（不做主线）
- Hint Map
- fingerprint-stable IDs
- real input
- WebMCP fast path
- CDP bridge
- recovery semantics

这些都应该写成：
# supporting machinery
而不是争主位。

---

## 七、下一步最值得改的地方

### 1. README opening 再收一刀
目标：
- 让第一屏只服务一个主张
- 减少并列叙事
- 强化名字兑现

### 2. 补一句解释“为什么叫 grasp”
这会非常增强作品记忆点。

### 3. 在 docs / release note 里统一主线
把：
- OpenClaw-ready
- persistent browser identity
- stable grasp on the web
统一成同一套语言。

### 4. 把 Hint Map 等技术写成“为了什么”，不是“我们有什么”
这会显著提升作品感。

---

## 八、一句话最终判断

`grasp` 现在已经具备作品雏形，
而且是很有希望做成的那种。

它现在最需要的，不是再堆更多功能，
而是：

# **把“agent-owned browser runtime”收成绝对主线，**
# **再让“stable grasp on the web”成为名字与技术的统一兑现。**

如果这一步收好，
`grasp` 会从“很强的项目”真正进入：
# **很成立的作品。**
