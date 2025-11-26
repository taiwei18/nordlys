# 项目结构

```
├── content/              # 内容集合（Markdown/MDX）
│   ├── posts/            # 博客文章
│   └── projects/         # 项目展示
├── public/               # 静态资源（原样复制）
├── src/
│   ├── assets/           # Astro 处理的图片
│   ├── components/       # 可复用的 Astro 组件
│   │   ├── layout/       # 页眉、页脚、导航
│   │   ├── mode/         # 明暗模式切换
│   │   ├── posts/        # 文章列表/网格组件
│   │   └── projects/     # 项目列表/网格组件
│   ├── layouts/          # 页面布局模板
│   ├── ogImages/         # OG 图片生成逻辑
│   ├── pages/            # 基于文件的路由
│   ├── plugins/          # Astro/remark 插件
│   ├── style/            # 全局 CSS 和配色方案
│   ├── util/             # 辅助函数
│   ├── content.config.ts # 集合模式定义（Zod）
│   ├── theme.config.ts   # 主题配置
│   └── types.ts          # TypeScript 类型定义
└── .astro/               # 生成的类型和数据存储
```

## 关键约定

- 组件使用 `.astro` 扩展名，带有类型化的 `Props` 接口
- 内容使用 frontmatter，通过 Zod 模式验证
- 页面使用 `getStaticPaths` 处理动态路由
- 导入使用 `@/` 别名指向 `src/` 目录
- 图标遵循 `tabler--{图标名称}` 命名模式
