import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getCollection } = vi.hoisted(() => ({
  getCollection: vi.fn()
}))

vi.mock('astro:content', () => ({ getCollection }))

import { generateTags, getTagUsage } from './tags'

const posts = [
  {
    data: {
      author: 'TaiWei',
      draft: false,
      publishedDate: new Date('2026-09-08'),
      tags: ['Astro', '工程化'],
      title: '文章一'
    }
  },
  {
    data: {
      author: 'TaiWei',
      draft: false,
      publishedDate: new Date('2026-09-07'),
      tags: ['astro'],
      title: '文章二'
    }
  }
]

const projects = [
  {
    data: {
      tags: ['项目标签'],
      title: '不应参与标签聚合的项目'
    }
  }
]

describe('文章标签聚合', () => {
  beforeEach(() => {
    getCollection.mockImplementation(async (collection: string) =>
      collection === 'posts' ? posts : projects
    )
  })

  it('只从文章生成标签', async () => {
    const tags = await generateTags()

    expect(tags.map(({ tag }) => tag)).toContain('astro')
    expect(tags.map(({ tag }) => tag)).toContain('工程化')
    expect(tags.map(({ tag }) => tag)).not.toContain('项目标签')
    expect(getCollection).not.toHaveBeenCalledWith('projects')
  })

  it('只统计使用标签的文章', async () => {
    expect(await getTagUsage('astro')).toBe(2)
    expect(getCollection).not.toHaveBeenCalledWith('projects')
  })
})
