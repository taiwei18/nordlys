# 可靠文章搜索实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让文章搜索在开发与生产环境中都可靠可用，并提供清晰、无竞态的搜索状态。

**Architecture:** 服务端向搜索页注入轻量文章索引，生产环境优先使用 Pagefind 全文搜索，开发环境和 Pagefind 失败时回退到本地文章索引。搜索匹配与排序实现为无 DOM 纯函数，页面控制器只负责防抖、请求序号、状态与安全 DOM 渲染。

**Tech Stack:** Astro 5、TypeScript、Pagefind 1.4、Vitest、pnpm

## Global Constraints

- 生产环境继续使用 Pagefind 正文全文索引。
- 本地回退仅搜索非草稿文章的标题、描述和标签。
- 不改变内容集合 schema 或 Pagefind postbuild 流程。
- 不把文章元数据直接拼入 `innerHTML`。
- 输入防抖固定为 300ms。

---

### Task 1: 本地文章搜索纯函数

**Files:**
- Create: `src/util/search.ts`
- Create: `src/util/search.test.ts`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**
- Produces: `SearchDocument`、`SearchResult`、`searchDocuments(documents, query)`。
- `SearchDocument`: `{ title: string; description: string; tags: string[]; url: string }`。
- `SearchResult`: `{ title: string; excerpt: string; url: string }`。

- [ ] 安装 Vitest，并添加 `test: "vitest run"` 脚本。
- [ ] 先写失败测试，覆盖空查询、多关键词 AND 匹配、大小写不敏感、标签匹配、标题优先排序。
- [ ] 运行 `pnpm test src/util/search.test.ts`，确认因模块或导出不存在而失败。
- [ ] 实现最小纯函数：查询按空白拆分，所有关键词必须命中；标题、标签、描述分别计 3、2、1 分并降序；同分保持输入顺序。
- [ ] 再运行同一测试，确认全部通过。

### Task 2: 可等待的 Pagefind 加载器

**Files:**
- Modify: `src/plugins/PagefindPlugin.astro`
- Modify: `src/env.d.ts`

**Interfaces:**
- Produces: `window.pagefindPromise: Promise<PagefindApi | null>`。
- `PagefindApi.search(query)` 返回 `{ results: PagefindResult[] }`。
- 加载失败返回 `null`，不伪造空结果。

- [ ] 把内联的 fire-and-forget 加载改成单例 Promise，并复用已有 `window.pagefind`。
- [ ] 仅在加载失败时解析为 `null`，让搜索页能够选择本地回退。
- [ ] 补全 `Window`、Pagefind API 与结果数据的全局类型。

### Task 3: 双搜索源页面与状态机

**Files:**
- Modify: `src/pages/search.astro`

**Interfaces:**
- Consumes: `getPosts()`、`searchDocuments()`、`window.pagefindPromise`。
- Produces: `idle/loading/results/empty/error` 五种可见状态。

- [ ] 服务端读取文章并序列化 `title`、`description`、`tags`、`url` 轻量索引。
- [ ] 将搜索输入、按钮和状态文案中文化，给输入添加 `aria-label="搜索文章"`，给状态标题添加 `aria-live="polite"`。
- [ ] 实现 300ms 防抖与递增请求序号；空查询立即恢复 idle。
- [ ] 查询时优先等待 Pagefind；得到 API 后使用全文结果，否则调用本地纯函数。
- [ ] 使用 `createElement`、`textContent`、`href` 构建结果，Pagefind excerpt 作为纯文本显示。
- [ ] Pagefind 单次查询异常时尝试本地回退；只有本地搜索也异常时显示 error。
- [ ] 结果上限保持 15，并正确显示剩余数量。

### Task 4: 验证开发与生产搜索

**Files:**
- Verify: `src/util/search.test.ts`
- Verify: `src/pages/search.astro`
- Verify: generated Pagefind index

**Interfaces:**
- Consumes: 完整搜索实现。
- Produces: 两种运行环境均通过的行为证据。

- [ ] 运行 `pnpm test`，预期全部测试通过。
- [ ] 运行 `pnpm exec astro check`，预期无类型错误。
- [ ] 运行 `pnpm build`，预期静态构建与 Pagefind 索引成功。
- [ ] 浏览器在 `pnpm dev` 搜索“小程序”，预期回退索引返回相关文章。
- [ ] 浏览器在生产 preview 搜索正文独有关键词，预期 Pagefind 返回文章。
- [ ] 快速连续输入后只显示最后查询；清空恢复 idle；无匹配显示中文空状态。
