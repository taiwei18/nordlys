# 编码 Agent 对比文章实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 Nordlys 博客中发布一篇日期为 2026-06-15、约 4000 字的 Claude Code、Codex CLI、Pi 与 OMP 实战对比文章。

**Architecture:** 文章使用“接手陌生仓库并完成跨文件修改”作为叙述主线，把检索、编辑、权限、验证和任务拆分串在同一次工作中。所有产品事实先按 2026-06-15 的时间截面建立证据表，再写入正文；成文后单独执行 Humanizer-zh 编辑和 Astro 页面验证。

**Tech Stack:** Markdown、Astro Content Collections、Pagefind、pnpm、Humanizer-zh

## Global Constraints

- 对比对象固定为 Claude Code、OpenAI Codex CLI、`earendil-works/pi` 与 `can1357/oh-my-pi`。
- `publishedDate` 固定为 `2026-06-15`。
- 正文约 4000 字，面向已经用过至少一种编码 Agent 的开发者。
- 只写 2026-06-15 当日或之前可以由官方资料确认的能力。
- 当前文档不能单独证明历史能力；需要日期明确的发布记录、版本标签、历史提交或当时文档。
- 官方自述只能证明功能存在，不能证明效果优于其他产品。
- 使用克制的第一人称，不虚构使用时长、项目数、成本、耗时或跑分。
- 不设总冠军，按使用场景给出推荐。
- 最终文章必须经过 Humanizer-zh 检查，总评分不低于 45/50。
- 不生成文章配图；现有 frontmatter 的图片字段均为可选。

---

### Task 1: 建立历史事实证据表

**Files:**
- Reference: `docs/superpowers/specs/2026-09-11-coding-agent-comparison-design.md`
- Create: `docs/superpowers/plans/evidence/2026-06-agent-comparison-sources.txt`

**Interfaces:**
- Consumes: 设计稿中的四个产品定义、时间截面和资料规则。
- Produces: 每个正文事实对应的“产品、能力、日期、来源 URL、可用结论”纯文本记录，供 Task 2 使用。

- [ ] **Step 1: 查询四个项目截至 2026-06-15 的官方资料**

优先检查官方仓库的发布页、带日期的 changelog、版本标签和历史 README。至少覆盖：

```text
产品定位
支持的模型或供应商
项目规则文件
文件读取与搜索
编辑机制
LSP 或符号引用能力
权限、审批与沙箱
会话与上下文管理
非交互或 CI 模式
子 Agent 或任务拆分
扩展、Skills、Hooks 或 MCP
```

Pi 固定使用：

```text
https://github.com/earendil-works/pi
```

OMP 固定使用：

```text
https://github.com/can1357/oh-my-pi
```

- [ ] **Step 2: 写入逐条证据记录**

创建 `docs/superpowers/plans/evidence/2026-06-agent-comparison-sources.txt`，每条采用同一格式：

```text
[Claude Code]
能力：项目级指令
截止日期：2026-06-15
来源：https://...
可写结论：...
限制：来源只能证明功能存在，不能证明体验优于其他产品。
```

无法确认的能力写：

```text
可写结论：未确认，不进入正文或对比表。
```

不得用当前官网页面替换缺失的历史证据。

- [ ] **Step 3: 检查时间截面**

逐条确认来源发布日期、标签日期或提交日期不晚于 `2026-06-15`。删除只有 2026-06-16 以后证据支持的功能。

- [ ] **Step 4: 检查证据覆盖**

运行：

```powershell
Select-String -Path docs/superpowers/plans/evidence/2026-06-agent-comparison-sources.txt -Pattern '\[Claude Code\]|\[Codex\]|\[Pi\]|\[OMP\]'
```

预期：四个产品名均至少出现一次。随后人工确认正文计划涉及的每个比较维度都有来源或明确标记“未确认”。

- [ ] **Step 5: 提交证据表**

```bash
git add docs/superpowers/plans/evidence/2026-06-agent-comparison-sources.txt
git commit -m "docs: collect June 2026 agent comparison sources"
```

### Task 2: 撰写有来源约束的文章初稿

**Files:**
- Create: `content/posts/claude-code-codex-pi-omp-comparison.md`
- Reference: `docs/superpowers/plans/evidence/2026-06-agent-comparison-sources.txt`
- Reference: `content/posts/reliable-astro-search.md`

**Interfaces:**
- Consumes: Task 1 的历史证据记录。
- Produces: frontmatter 完整、正文结构完整、包含资料链接的中文初稿。

- [ ] **Step 1: 写入 frontmatter 与开场**

文件头必须使用：

```yaml
---
title: Claude Code、Codex、Pi 与 OMP：同一个任务下的四种编码 Agent
description: 用一次陌生仓库的跨文件修改，对比 Claude Code、Codex CLI、Pi 与 OMP 的检索、编辑、权限、扩展和任务拆分方式
publishedDate: 2026-06-15
tags:
  - AI Agent
  - Claude Code
  - Codex
  - 开发工具
---
```

开场在 300 字内说明：本文比较 Harness 而非模型跑分；对比对象和事实截至 `2026-06-15`；贯穿任务是接手陌生仓库并完成跨文件修改。

- [ ] **Step 2: 写入四个对象和任务基线**

依次说明：

```text
Claude Code = Anthropic 编码 Agent
Codex = OpenAI Codex CLI
Pi = earendil-works/pi
OMP = can1357/oh-my-pi
```

然后定义同一任务的五步：找入口、确认调用关系、修改实现与调用方、运行验证、必要时拆分调查。不得声称完成了不存在的统一基准测试。

- [ ] **Step 3: 按任务阶段完成主体**

主体使用以下二级标题：

```markdown
## 先别急着比较模型
## 四个名字背后是四种工作方式
## 进入陌生仓库，先看谁能少走弯路
## 跨文件修改，编辑只是最表面的一层
## 命令能不能直接跑，取决于你愿意交出多少权限
## 任务变大以后，上下文和分工开始决定体验
## Pi 与 OMP，不只是原版和增强版
## 把差异压进一张表
## 我会怎样按场景选择
## 最后选择的其实是工作流
```

每节只使用证据表中“可写结论”的事实。个人判断使用“我更愿意”“对我来说”等明确标记，与事实分开。

- [ ] **Step 4: 添加紧凑对比表**

表格列为：

```markdown
| 维度 | Claude Code | Codex CLI | Pi | OMP |
```

行只包含：模型与供应商、默认工具、代码智能、扩展方式、权限与隔离、任务拆分、自动化、上手成本。每格一到两句；证据不足时写“截至本文日期未确认”，不能猜测。

- [ ] **Step 5: 写出按场景推荐与资料链接**

结论覆盖四类读者：少配置、OpenAI 工作流、模型自由、完整工程工具链。推荐必须引用前文已说明的差异，不增加新事实。

文末添加：

```markdown
## 资料
```

列出实际用于正文的官方 URL。未在正文使用的资料不必堆入列表。

- [ ] **Step 6: 检查初稿基础约束**

运行：

```powershell
Select-String -Path content/posts/claude-code-codex-pi-omp-comparison.md -Pattern 'publishedDate: 2026-06-15|earendil-works/pi|can1357/oh-my-pi|## 资料'
```

预期：四项均匹配。人工确认所有功能性陈述可以在证据表中找到对应记录。

- [ ] **Step 7: 提交初稿**

```bash
git add content/posts/claude-code-codex-pi-omp-comparison.md
git commit -m "docs: draft coding agent comparison"
```

### Task 3: 使用 Humanizer-zh 完成人性化编辑

**Files:**
- Modify: `content/posts/claude-code-codex-pi-omp-comparison.md`

**Interfaces:**
- Consumes: Task 2 中事实已经核验的文章初稿。
- Produces: 含义和来源不变、语气自然、评分不低于 45/50 的终稿。

- [ ] **Step 1: 标出常见 AI 写作模式**

扫描全文，定位并改写以下模式：

```text
标志着、彰显、至关重要、深入探讨、不断演变的格局
不仅……而且……
这不仅仅是……而是……
此外、然而、值得注意的是
没有来源的“开发者认为”或“行业普遍认为”
连续三项形容词或机械三段式
连续等长句和每段结尾都下结论
过多破折号、粗体和内联标题列表
```

- [ ] **Step 2: 调整叙述节奏和作者声音**

保留克制的第一人称。把抽象优缺点改成任务中的具体后果，例如“跨文件重命名时是否需要自己搜索遗漏引用”。长短句交错；不把每节改成完全相同的“功能、优点、缺点”结构。

- [ ] **Step 3: 检查事实没有在润色中漂移**

逐段对照证据表。Humanizer 修改只能改变表达，不能增加功能、数字、比较级或使用经历。删除无法重新对应到来源的句子。

- [ ] **Step 4: 给终稿评分**

按 Humanizer-zh 的五项标准记录最终分数：

```text
直接性：/10
节奏：/10
信任度：/10
真实性：/10
精炼度：/10
总分：/50
```

预期：总分 `>= 45/50`。评分不写入文章正文；低于 45 分则继续修改后重新评分。

- [ ] **Step 5: 提交终稿**

```bash
git add content/posts/claude-code-codex-pi-omp-comparison.md
git commit -m "docs: humanize coding agent comparison"
```

### Task 4: 构建并浏览文章页

**Files:**
- Verify: `content/posts/claude-code-codex-pi-omp-comparison.md`
- Generated: `dist/`

**Interfaces:**
- Consumes: Task 3 的 Markdown 终稿。
- Produces: 可由 Astro 解析、可构建、可在浏览器阅读并被 Pagefind 收录的文章页。

- [ ] **Step 1: 运行 Astro 构建**

运行：

```bash
pnpm build
```

预期：`astro build` 成功，随后 Pagefind 成功扫描 `dist`；无 frontmatter、Markdown 表格或链接解析错误。

- [ ] **Step 2: 启动生产预览**

运行：

```bash
pnpm astro preview
```

预期：预览服务器输出本地 URL 并持续运行。此命令必须通过进程管理工具启动，不在普通 shell 调用中阻塞。

- [ ] **Step 3: 在浏览器检查文章页**

打开：

```text
/posts/claude-code-codex-pi-omp-comparison/
```

确认：标题完整；发布日期显示为 2026-06-15；目录与全部二级标题存在；四列表格在桌面视口可读；窄视口没有正文横向溢出或内容裁切；资料链接可点击；正文没有 Markdown 源码泄漏。

- [ ] **Step 4: 检查文章搜索**

在站点搜索页分别输入：

```text
Claude Code
OMP
编码 Agent
```

预期：三次查询均能返回新文章，标题和地址正确。

- [ ] **Step 5: 停止预览并记录验证结果**

停止由进程管理工具启动的预览服务。最终交付中报告 `pnpm build` 结果、文章页路径、浏览器检查项和 Humanizer-zh 分数；不得把未执行的检查写成通过。
