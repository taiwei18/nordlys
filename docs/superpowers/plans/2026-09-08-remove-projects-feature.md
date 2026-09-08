# 完整移除项目功能实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 从导航、路由、内容模型、标签聚合与构建产物中完整移除项目功能。

**Architecture:** 采用干净切除，不增加功能开关或兼容层。项目集合及所有消费者一起删除，标签系统改为只依赖文章集合，最终以生产构建和浏览器访问结果证明项目页面已不存在。

**Tech Stack:** Astro 5、TypeScript、Vitest、pnpm、Pagefind

## Global Constraints

- 不修改文章正文、时间轴或说明文档中作为普通语义出现的“项目”一词。
- 不新增 `/projects` 重定向或兼容页。
- 不调整其它导航、页面样式或动画。
- 现有未提交改动属于用户工作，不覆盖、不回滚。

---

### Task 1: 标签数据源回归保护

**Files:**
- Create: `src/util/tags.test.ts`
- Modify: `src/util/tags.ts`

**Interfaces:**
- Consumes: `getPosts(tag?: string)` from `src/util/posts.ts`
- Produces: `generateTags(): Promise<ResolvedTag[]>` 和 `getTagUsage(tag: string): Promise<number>`，二者只读取文章集合

- [ ] **Step 1: 写失败测试**

使用 `vi.mock('astro:content')` 提供文章和项目两类集合数据，断言 `generateTags()` 只返回文章标签，`getTagUsage()` 只统计文章，并断言不请求 `projects` 集合。

- [ ] **Step 2: 验证测试按预期失败**

Run: `pnpm test src/util/tags.test.ts`
Expected: FAIL，结果包含项目标签或调用了 `getCollection('projects')`。

- [ ] **Step 3: 写最小实现**

从 `src/util/tags.ts` 删除 `getProjects` 导入；`generateTags` 仅展开 `await getPosts()` 的标签；`getTagUsage` 仅返回 `(await getPosts(tag)).length`。

- [ ] **Step 4: 验证测试通过**

Run: `pnpm test src/util/tags.test.ts`
Expected: PASS。

### Task 2: 删除项目路由与数据模型

**Files:**
- Modify: `src/content.config.ts`
- Modify: `src/theme.config.ts`
- Modify: `src/types.ts`
- Modify: `src/pages/tags/[tag].astro`
- Delete: `src/pages/projects/[...page].astro`
- Delete: `src/pages/projects/[page].astro`
- Delete: `src/components/projects/ProjectsGrid.astro`
- Delete: `src/components/projects/ProjectsGridItem.astro`
- Delete: `src/components/projects/ProjectsList.astro`
- Delete: `src/components/projects/ProjectsListItem.astro`
- Delete: `src/util/projects.ts`
- Delete: `content/projects/example-project.md`
- Delete: `content/projects/nordlys.md`

**Interfaces:**
- Consumes: `getPosts(tag?: string)`
- Produces: 只包含 `posts` 的 Astro `collections`；只显示文章的标签详情页

- [ ] **Step 1: 删除项目集合和配置字段**

`src/content.config.ts` 只定义并导出 `posts`；从 `ThemeConfig`、默认配置和站点配置删除 `projectsPerPage`、`projectsView`；删除导航中的项目注释残留。

- [ ] **Step 2: 清理标签详情页**

删除项目组件和工具导入、项目查询及 Projects 区块，只保留文章列表。

- [ ] **Step 3: 删除专属文件与内容**

删除上述路由、组件、工具函数和两个项目 Markdown 文件，不保留空目录或兼容文件。

- [ ] **Step 4: 运行定向测试与类型检查**

Run: `pnpm test src/util/tags.test.ts && pnpm exec astro check`
Expected: 测试通过，Astro 检查报告 0 errors。

### Task 3: 生产构建与浏览器验收

**Files:**
- Verify: `dist/**`

**Interfaces:**
- Consumes: Task 1 与 Task 2 的最终代码
- Produces: 不包含项目导航和 `/projects` 页面构建产物的静态站点

- [ ] **Step 1: 运行生产构建**

Run: `pnpm build`
Expected: Astro 与 Pagefind 成功完成构建。

- [ ] **Step 2: 检查构建产物**

确认 `dist/projects` 不存在，并搜索构建 HTML 中的 `/projects/`、`>项目<` 与 `>Projects<`，预期没有导航或页面区块残留。

- [ ] **Step 3: 启动生产预览并浏览器验收**

运行 `pnpm exec astro preview`。桌面与移动宽度下检查首页导航无“项目”；访问 `/tags/` 及任一标签详情确认无 Projects 区块；访问 `/projects/` 确认返回 404 页面。

- [ ] **Step 4: 部署说明**

确认 `.github/workflows/cd.yaml` 在 `main` push 时通过 `withastro/action@v3` 重新构建，并通过 `actions/deploy-pages@v4` 发布新 artifact。线上旧页面消失依赖本次提交推送并完成该工作流。