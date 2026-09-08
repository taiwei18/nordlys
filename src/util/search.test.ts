import { describe, expect, it } from 'vitest'
import { searchDocuments, type SearchDocument } from './search'

const documents: SearchDocument[] = [
  {
    title: 'Astro 搜索实践',
    description: '使用 Pagefind 构建静态全文搜索',
    tags: ['Astro', '搜索'],
    url: '/posts/astro-search/'
  },
  {
    title: '前端工程笔记',
    description: 'Astro 项目中的搜索体验优化',
    tags: ['工程化'],
    url: '/posts/frontend-notes/'
  },
  {
    title: '部署 Pagefind',
    description: '静态站点部署指南',
    tags: ['ASTRO', 'Pagefind'],
    url: '/posts/pagefind-deploy/'
  }
]

describe('searchDocuments', () => {
  it('空查询不返回文章', () => {
    expect(searchDocuments(documents, '   ')).toEqual([])
  })

  it('忽略大小写并支持标签匹配', () => {
    expect(searchDocuments(documents, 'pagefind')).toEqual([
      {
        title: '部署 Pagefind',
        excerpt: '静态站点部署指南',
        url: '/posts/pagefind-deploy/'
      },
      {
        title: 'Astro 搜索实践',
        excerpt: '使用 Pagefind 构建静态全文搜索',
        url: '/posts/astro-search/'
      }
    ])
  })

  it('多个关键词必须全部命中', () => {
    expect(searchDocuments(documents, 'astro 搜索')).toEqual([
      {
        title: 'Astro 搜索实践',
        excerpt: '使用 Pagefind 构建静态全文搜索',
        url: '/posts/astro-search/'
      },
      {
        title: '前端工程笔记',
        excerpt: 'Astro 项目中的搜索体验优化',
        url: '/posts/frontend-notes/'
      }
    ])
  })

  it('标题命中优先于标签和描述命中', () => {
    expect(searchDocuments(documents, 'astro').map(({ url }) => url)).toEqual([
      '/posts/astro-search/',
      '/posts/pagefind-deploy/',
      '/posts/frontend-notes/'
    ])
  })
})
