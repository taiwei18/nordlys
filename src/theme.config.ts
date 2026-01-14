import { defineThemeConfig } from "./types";

export default defineThemeConfig({
  site: "https://nordlys.fjelloverflow.dev",
  title: "TaiWei",
  description: "TaiWei",
  author: "FjellOverflow",
  navbarItems: [
    { label: "博客", href: "/posts/" },
    { label: "项目", href: "/projects/" },
    { label: "标签", href: "/tags/" },
    { label: "时间轴", href: "/timeline/" },
    { label: "关于", href: "/about/" },
    {
      label: "Other pages",
      children: [
        { label: "Landing page", href: "/" },
        { label: "404 page", href: "/404" },
        { label: "Author: FjellOverflow", href: "/authors/FjellOverflow/" },
        { label: "Tag: documentation", href: "/tags/documentation/" },
      ],
    },
  ],
  footerItems: [
    {
      icon: "tabler--brand-github",
      href: "https://github.com/FjellOverflow/nordlys",
      label: "Github",
    },
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
  postsPerPage: 4,
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
