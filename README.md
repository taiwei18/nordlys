<p align="center">
  <a href="https://nordlys.fjelloverflow.dev">
    <img alt="logo" src="./public/favicon.svg" height="64">
  </a>
</p>

<h1 align="center">
  <a href="https://nordlys.fjelloverflow.dev">Nordlys</a>
</h1>

<p align="center">
  一个简约的Astro博客主题</p>

<p align="center">
  <img src="./public/preview.png" width="85%"/>
</p>

<p align="center">
  <img src="https://img.shields.io/github/package-json/v/FjellOverflow/Nordlys?label=Version"/>
  &ensp;
  <img src="https://img.shields.io/github/license/FjellOverflow/Nordlys?label=License"/>
  &ensp;
  <img src="https://img.shields.io/github/actions/workflow/status/FjellOverflow/Nordlys/cd.yaml?branch=main&label=Build"/>
</p>

<p align="center">
  <a href="https://nordlys.fjelloverflow.dev">预览</a> |
  <a href="#特性">功能</a> |
  <a href="#安装">安装</a> |
  <a href="#入门指南">开始使用</a> |
  <a href="#文档">文档</a>
</p>

## 特性

<div align="center">
  <img src="https://github.com/user-attachments/assets/ee5ab8ef-8c63-4810-a53f-622643e9e7a8" width="50%"/>
  <div>Nordlys在<a href="https://developer.chrome.com/docs/lighthouse/performance/performance-scoring/">Lighthouse</a>测试中获得了100%的评分</div>
</div>

- ⚙️ 易于配置
- 🔎 内置搜索功能
- 📱 自适应屏幕尺寸，适合移动设备
- 🧑‍🦯 无障碍设计
- 🎨 内置及可自定义的颜色方案
- 🌙 明暗模式切换
- 🎁 图片缩放、自动生成的目录、阅读时间等功能...
- 👨‍💻 **针对开发者**：
  - 最佳实践指南
  - 最小化依赖项，保持最新版本
  - 强类型检查及代码格式化支持

## 安装

0. 确保您的系统已安装[pnpm](https://pnpm.io/installation)。

1. 克隆或[fork](https://github.com/new?template_name=nordlys&template_owner=FjellOverflow)此仓库，或使用`pnpm dlx create-astro --template FjellOverflow/nordlys`创建新项目。

2. 运行`pnpm install`。

3. 运行`pnpm dev`。

4. （如需安装VSCode推荐的扩展程序，请打开“扩展”选项卡并输入`@recommended`。）

## 入门指南

该主题的外观和功能配置在`theme.config.ts`文件中。请根据需要调整标题、作者信息、网址和颜色方案。大多数设置都提供了默认值。

所有内容均采用Markdown或MDX格式编写。添加新页面、博客文章或项目非常简单：只需在相应目录下创建`my-latest-post.md`文件并调整前端元数据即可。有关需要设置的特定属性，请参考提供的示例。


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


## 文档

该主题具有自文档化功能。您可以直接访问[https://nordlys.fjelloverflow.dev/posts/](https://nordlys.fjelloverflow.dev/posts/)，查看使用和自定义主题的示例及教程。 