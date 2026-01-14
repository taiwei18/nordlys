# 项目结构文档

本文档详细说明了 Nordlys 博客主题的项目结构和各目录的功能。

## 目录结构

### 根目录

- `.astro/`: Astro 生成的缓存和类型定义。
- `.github/`: GitHub Actions 工作流（CI/CD）。
- `.kiro/`: 可能与特定工具或部署相关的配置。
- `.vscode/`: VS Code 编辑器配置和推荐扩展。
- `content/`: 博客内容（Markdown/MDX 文件）。
  - `posts/`: 博客文章。
  - `projects/`: 项目展示页面。
- `public/`: 静态资源目录。文件会原样复制到构建输出目录。
  - `favicon.svg`: 网站图标。
  - `zoom-vanilla.js/`: 图片缩放功能的第三方库。
- `src/`: 源代码目录。
  - `assets/`: 经过处理的资源，如 SVG 图标和截图。
  - `components/`: 可复用的 Astro 组件。
    - `layout/`: 全局布局组件（页眉、页脚、导航）。
    - `mode/`: 明暗模式切换逻辑。
    - `posts/`: 文章列表和项。
    - `projects/`: 项目列表和项。
  - `layouts/`: 页面布局模板。
  - `ogImages/`: 动态生成 Open Graph 图片的逻辑。
  - `pages/`: 页面路由。每个文件对应一个 URL 路径。
  - `plugins/`: 各种功能插件（如阅读时间计算、代码块图标等）。
  - `style/`: 全局 CSS 样式和配色方案定义。
  - `util/`: 通用的辅助工具函数。
  - `theme.config.ts`: 主题的核心配置文件。
  - `content.config.ts`: 内容集合的模型定义。
  - `types.ts`: 全局 TypeScript 类型声明。
- `astro.config.ts`: Astro 项目配置文件。
- `package.json`: 项目依赖和脚本说明。
- `tsconfig.json`: TypeScript 编译配置。

## 关键技术栈

- **Astro**: 现代化的静态网站生成器。
- **Tailwind CSS**: 实用优先的 CSS 框架。
- **TypeScript**: 强类型编程。
- **Zod**: 内容 schema 验证。
- **Satori**: 用于生成 Open Graph 图片。

## 开发约定

- 使用 `@/` 别名引用 `src/` 目录下的内容。
- 博客内容存储在 `content/` 目录下，并通过 `src/content.config.ts` 进行验证。
- 样式通过 `src/style/main.css` 管理，并使用了自定义的 `colorScheme`。
