# 技术栈

## 核心框架
- Astro 5.x（静态站点生成器）
- TypeScript（严格模式）

## 样式
- Tailwind CSS 4.x 配合 `@tailwindcss/vite` 插件
- `@tailwindcss/typography` 用于文章排版
- 自定义配色方案位于 `src/style/color-schemes.css`

## 内容
- 通过 `@astrojs/mdx` 支持 MDX
- Astro Content Collections 管理文章和项目
- Expressive Code 提供语法高亮，支持可折叠区域和行号

## 关键库
- `satori` + `@resvg/resvg-js` + `sharp` 用于生成 OG 图片
- `pagefind` 用于客户端搜索
- `reading-time` 用于估算阅读时间
- `@iconify-json/tabler` 提供图标

## 包管理器
- pnpm（必需）

## 常用命令

```bash
pnpm dev        # 启动开发服务器
pnpm build      # 生产环境构建
pnpm preview    # 构建并预览
pnpm lint       # 运行 ESLint + Stylelint
pnpm check      # Lint + Astro 类型检查
```

## 代码风格
- Prettier：无分号、单引号、无尾随逗号
- ESLint 配合 TypeScript 和 Astro 插件
- Stylelint 用于 CSS
- 路径别名：`@/*` 映射到 `src/*`
