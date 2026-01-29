import { defineThemeConfig } from "./types";

export default defineThemeConfig({
  site: "https://www.taiwei.site",
  title: "TaiWei",
  description:
    "TaiWei 的前端与产品工程笔记，聚焦 Astro 建站、性能优化与工程实践。",
  author: "TaiWei",
  navbarItems: [
    { label: "博客", href: "/posts/" },
    { label: "项目", href: "/projects/" },
    { label: "标签", href: "/tags/" },
    { label: "时间轴", href: "/timeline/" },
    { label: "关于", href: "/about/" },
    {
      label: "其它页面",
      children: [
        { label: "首页", href: "/" },
        { label: "404 页面", href: "/404" },
        { label: "作者：FjellOverflow", href: "/authors/FjellOverflow/" },
        { label: "标签：documentation", href: "/tags/documentation/" },
      ],
    },
  ],
  footerItems: [
    // {
    //   icon: "tabler--brand-github",
    //   href: "https://github.com/FjellOverflow/nordlys",
    //   label: "Github",
    // },
    {
      icon: "tabler--rss",
      href: "/feed.xml",
      label: "RSS feed",
    },
  ],

  // optional settings
  locale: "zh-CN",
  mode: "dark",
  modeToggle: true,
  colorScheme: "scheme-nord",
  openGraphImage: undefined,
  postsPerPage: 5,
  postsView: "list",
  projectsPerPage: 3,
  projectsView: "list",
  scrollProgress: false,
  scrollToTop: true,
  tagIcons: {
    tailwindcss: "tabler--brand-tailwind",
    astro: "tabler--brand-astro",
    documentation: "tabler--book",
  },
  expressiveCodeThemes: ["vitesse-light", "vitesse-black"],
});
