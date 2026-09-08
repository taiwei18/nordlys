# 删除首页特效与示例导航实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 删除首页动态线条背景及其死代码和专属依赖，并从“其它页面”菜单删除作者与标签示例入口。

**Architecture:** 在展示接入点执行干净切换，`LandingLayout.astro` 恢复为纯 Astro 静态布局；删除失去调用方的 React/WebGL 组件及 `three` 依赖。导航变更仅修改主题配置，不触及作者、标签的数据模型、内容展示或路由。

**Tech Stack:** Astro 5、TypeScript、React 19、Tailwind CSS 4、pnpm

## Global Constraints

- 保留首页标题由 `background: true` 控制的静态柔光。
- 保留顶部“标签”主导航、作者与标签路由、文章标签与作者元数据。
- 不修改其他动效组件及其依赖。
- 不做无关重构。

---

### Task 1: 删除首页动态线条特效

**Files:**
- Modify: `src/layouts/LandingLayout.astro:11,25-36`
- Delete: `src/components/FloatingLines.tsx`

**Interfaces:**
- Consumes: `LandingLayout.astro` 当前的 `FloatingLines` React 组件接入。
- Produces: 不再加载 WebGL 客户端组件的首页布局；其余 `LandingLayout` props 与 slots 保持不变。

- [ ] **Step 1: 移除组件接入**

删除：

```astro
import FloatingLines from "../components/FloatingLines";
```

以及：

```astro
<div style={{ width: "100%", height: "100%", position: "absolute" }}>
  <FloatingLines
    client:load
    enabledWaves={["middle", "bottom", "top"]}
    lineCount={20}
    lineDistance={100}
    bendRadius={30}
    bendStrength={15}
    interactive={true}
    parallax={true}
  />
</div>
```

- [ ] **Step 2: 删除失去调用方的组件**

删除 `src/components/FloatingLines.tsx`，不保留空组件或兼容导出。

- [ ] **Step 3: 验证源代码无残留引用**

搜索 `FloatingLines`，预期 `src` 中没有匹配结果。

### Task 2: 清理专属依赖

**Files:**
- Modify: `package.json:63`
- Modify: `pnpm-lock.yaml`

**Interfaces:**
- Consumes: 根包中的 `three` 直接依赖。
- Produces: 不含 `three` 的依赖清单和同步锁文件。

- [ ] **Step 1: 使用包管理器删除依赖**

Run: `pnpm remove three`

Expected: 命令成功，`package.json` 不再声明 `three`，`pnpm-lock.yaml` 同步更新。

- [ ] **Step 2: 确认没有其他源码导入**

搜索 `from "three"` 和 `from 'three'`，预期 `src` 中没有匹配结果。

### Task 3: 删除“其它页面”示例入口

**Files:**
- Modify: `src/theme.config.ts:19-20`

**Interfaces:**
- Consumes: `navbarItems` 中“其它页面”的 `children` 数组。
- Produces: 只含“首页”和“404 页面”的该子菜单；顶部“标签”主导航保持不变。

- [ ] **Step 1: 删除两个子菜单项**

删除：

```ts
{ label: "作者：FjellOverflow", href: "/authors/FjellOverflow/" },
{ label: "标签：documentation", href: "/tags/documentation/" },
```

- [ ] **Step 2: 校验配置行为**

确认 `navbarItems` 仍包含：

```ts
{ label: "标签", href: "/tags/" },
```

并确认“其它页面”的 `children` 仍包含首页与 404 页面。

### Task 4: 端到端验证

**Files:**
- Verify: `src/layouts/LandingLayout.astro`
- Verify: `src/theme.config.ts`
- Verify: generated site

**Interfaces:**
- Consumes: 前三项完成后的站点源码。
- Produces: 可构建、可访问且符合删除范围的静态站点。

- [ ] **Step 1: 执行生产构建**

Run: `pnpm build`

Expected: Astro 构建、静态路由生成及 Pagefind 索引均成功，退出码为 0。

- [ ] **Step 2: 启动站点并检查首页**

启动开发服务器，浏览器访问 `/`。预期：首页标题、正文链接、页脚和静态标题柔光仍显示；页面中不存在动态线条 canvas/WebGL 背景。

- [ ] **Step 3: 检查导航菜单**

展开“其它页面”。预期：显示“首页”和“404 页面”，不显示“作者：FjellOverflow”或“标签：documentation”；顶部“标签”主导航仍显示。
