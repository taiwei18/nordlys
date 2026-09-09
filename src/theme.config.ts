import { defineThemeConfig } from './types'

export default defineThemeConfig({
  site: 'https://www.taiwei.site',
  title: 'TaiWei',
  description: 'TaiWei 的前端与产品工程笔记',
  author: 'TaiWei',
  navbarItems: [
    { label: '博客', href: '/posts/' },
    { label: '标签', href: '/tags/' },
    { label: '时间轴', href: '/timeline/' },
    { label: '关于', href: '/about/' },
    {
      label: '其它页面',
      children: [
        { label: '首页', href: '/' },
        { label: '404 页面', href: '/404' }
      ]
    }
  ],
  footerItems: [
    // {
    //   icon: "tabler--brand-github",
    //   href: "https://github.com/FjellOverflow/nordlys",
    //   label: "Github",
    // },
    {
      icon: 'tabler--rss',
      href: '/feed.xml',
      label: 'RSS feed'
    }
  ],

  // optional settings
  locale: 'zh-CN',
  mode: 'dark',
  modeToggle: true,
  colorScheme: 'scheme-nord',
  openGraphImage: undefined,
  postsPerPage: 5,
  postsView: 'list',
  scrollProgress: false,
  scrollToTop: true,
  tagIcons: {
    tailwindcss: 'tabler--brand-tailwind',
    astro: 'tabler--brand-astro',
    pagefind: 'tabler--file-search',
    webshare: 'tabler--world-share',
    小程序开发: 'tabler--brand-miniprogram',
    documentation: 'tabler--book'
  },
  expressiveCodeThemes: ['vitesse-light', 'vitesse-black']
})
