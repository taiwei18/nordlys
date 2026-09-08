# Astro 搜索复盘文章实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 写入并验证一篇自然、准确的 Astro 搜索功能实战复盘文章。

**Architecture:** 文章以实际故障排查为叙事线，关键代码只负责解释根因与方案。初稿完成后按 humanizer-zh 逐段复写，再通过内容集合检查和生产构建验证 frontmatter、Markdown 与页面生成。

**Tech Stack:** Markdown、Astro Content Collections、humanizer-zh、pnpm

## Global Constraints

- 路径固定为 `content/posts/reliable-astro-search.md`。
- 日期固定为 2026-09-08，标签为 Astro、Pagefind。
- 全文约 1800～2500 字。
- 不虚构代码、API、测试和构建结果。
- 避免 AI 高频词、填充短语、三段式排比、宣传话术和金句式收尾。

---

### Task 1: 写作实战复盘初稿

**Files:**
- Create: `content/posts/reliable-astro-search.md`

**Interfaces:**
- Consumes: 当前搜索实现与已观察的验证数据。
- Produces: 可由 Astro 内容集合加载的中文技术文章。

- [ ] 写入 title、description、publishedDate、tags frontmatter。
- [ ] 从开发模式的 “No Results” 现象开篇，对照生产预览定位 Pagefind 构建时索引根因。
- [ ] 用精简代码片段解释双搜索源、加载 Promise、防抖与请求序号、`type:post` 过滤。
- [ ] 写入测试、构建与浏览器验证数据，以及本地降级不搜索正文的取舍。

### Task 2: 使用 humanizer-zh 自然化复写

**Files:**
- Modify: `content/posts/reliable-astro-search.md`

**Interfaces:**
- Consumes: Task 1 的完整初稿。
- Produces: 保留技术事实、语气自然的发布稿。

- [ ] 扫描并删除填充开场、空泛意义、宣传词、模糊归因和协作交流痕迹。
- [ ] 打散机械编号与三项排比，混合长短句，保留第一人称判断和具体细节。
- [ ] 检查破折号、粗体、同义词循环和公式化总结。
- [ ] 按直接性、节奏、信任度、真实性、精炼度五项评分；低于 45/50 时继续修改。

### Task 3: 验证文章可发布

**Files:**
- Verify: `content/posts/reliable-astro-search.md`
- Verify: generated `/posts/reliable-astro-search/`

**Interfaces:**
- Consumes: humanizer-zh 发布稿。
- Produces: 内容集合与生产构建均接受的文章页面。

- [ ] 运行 Prettier 检查该 Markdown 文件。
- [ ] 运行 `pnpm exec astro check`，确认没有新增错误。
- [ ] 运行 `pnpm build`，确认文章详情页和 OG 图片生成成功。
- [ ] 浏览器打开文章页，确认标题、章节、代码块和正文可读。
