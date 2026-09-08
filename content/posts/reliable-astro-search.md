---
title: 搜索没有报错，为什么就是搜不到文章？
description: 记录一次 Astro 博客搜索失效的排查，以及 Pagefind 与本地索引双搜索源的实现
publishedDate: 2026-09-08
tags:
  - astro
  - pagefind
---

最开始看搜索页时，我以为问题会出在文章索引上。

输入「小程序」，页面很快给出 `No Results`。控制台没有报错，输入框和清空按钮也正常工作。我第一反应是中文分词出了问题，接着又怀疑文章没被 `data-pagefind-body` 标记。后来证明，这两条路都走偏了。

我换了一种运行方式，结果立刻变了。

在 `pnpm dev` 里搜索不到任何内容，执行 `pnpm build` 后再启动生产预览，同样搜索「小程序」，能返回 3 篇文章。文章在，索引也在。坏掉的不是搜索算法，而是开发环境里的搜索来源。

## Pagefind 只认识构建后的页面

这个项目使用 Pagefind 做静态全文搜索。它的工作方式和调用接口的代码不在同一个阶段：Astro 先把页面输出到 `dist`，随后 `postbuild` 执行 Pagefind，扫描这些 HTML 并生成 `/pagefind/` 目录。

```json
{
  "scripts": {
    "build": "astro build",
    "postbuild": "pagefind --site dist"
  }
}
```

生产预览能搜索，是因为这两个步骤都跑完了。`pnpm dev` 只启动 Astro 开发服务器，不会凭空多出一份 Pagefind 索引，因此下面这段导入必然失败：

```ts
await import('/pagefind/pagefind.js')
```

原来的加载器捕获了这个错误，然后塞给 `window.pagefind` 一个永远返回空数组的假实现。页面确实没有崩，也正因为没有崩，问题反而更难看出来。加载失败和真的搜不到文章，最后都显示成 `No Results`。

这不是一个好的降级。它只是把错误藏起来了。

## 我没有让开发服务器动态生成 Pagefind

确认原因后，我考虑过在开发阶段也生成 Pagefind 索引。官方 Node API 支持把内存中的 HTML 加入索引，理论上可以接进 Astro 或 Vite 的开发中间件。但这意味着还要处理文章更新、索引重建、内存文件和路由同步。为了让一个博客的本地搜索可用，代价有点大。

我最后保留了生产环境的 Pagefind，同时给开发环境准备了一份轻量索引。

搜索页本来就是 Astro 页面，可以在构建或服务端渲染阶段读取内容集合。这里取出非草稿文章，只保留标题、描述、标签和地址：

```ts
const searchDocuments = (await getPosts(undefined, undefined, false)).map(
  ({ id, data }) => ({
    title: data.title,
    description: data.description,
    tags: data.tags,
    url: `/posts/${id}/`
  })
)
```

这份数据很小，可以直接写进页面。开发环境没有 Pagefind 时，就按标题、描述和标签匹配。查询会按空白拆成多个关键词，所有词都命中才返回结果。标题命中的排序最高，标签次之，描述排在最后。

本地索引不搜索正文，这是刻意做的取舍。开发时，我更需要快速确认文章能不能被找到，生产环境才承担完整的正文检索。如果把正文也塞进页面，搜索页会随着文章数量一直变大，不划算。

本地匹配单独放在一个纯函数里，没有 DOM，也不知道 Pagefind 的存在。这样做不是为了多一层“架构”，而是因为排序规则需要真正测一下。比如搜索 `astro 搜索` 时，两个词可以分别出现在标题和描述中；搜 `pagefind` 时，标题命中应该排在描述命中前面。同分结果继续沿用文章原本的发布时间顺序，列表不会每次输入都乱跳。

```ts
const terms = normalize(query).trim().split(/\s+/).filter(Boolean)

if (
  !terms.every(
    (term) =>
      title.includes(term) || tags.includes(term) || description.includes(term)
  )
)
  return null
```

## 加载失败不能再伪装成空结果

Pagefind 的加载方式也改了。现在页面拿到的是一个可等待的 Promise：加载成功就返回真实 API，失败则返回 `null`，由搜索逻辑决定是否切换到本地索引。

```ts
window.pagefindPromise ??= (async () => {
  if (window.pagefind) return window.pagefind

  try {
    window.pagefind = await import('/pagefind/pagefind.js')
    return window.pagefind
  } catch {
    return null
  }
})()
```

这个改动顺手解决了另一个隐蔽问题。旧页面在输入事件里直接调用 `window.pagefind.search()`，但模块导入是异步的。如果用户刚打开页面就开始输入，搜索可能比模块更早执行。网络快时不容易碰到，不能因此当它不存在。

现在搜索会等待同一份加载 Promise。模块只加载一次，后续查询复用结果。生产环境走 Pagefind，开发环境和加载失败的生产环境走本地索引。

## 防抖只能省请求，不能解决旧结果覆盖

搜索框加了 300ms 防抖，避免每输入一个字符就跑一次查询。不过 Pagefind 查询和结果数据加载都是异步的，仅有防抖还不够。

假设先搜索「Astro」，紧接着改成「Astro 搜索」。第二次查询虽然更晚发出，却可能更早返回。如果没有额外判断，第一次查询的结果会在最后写回页面，输入框是一回事，结果列表又是另一回事。

我的处理很朴素：每次输入都递增一个请求编号，查询完成时只允许最新编号更新界面。

```ts
const currentRequestId = ++this.requestId

// 等待 Pagefind 或本地搜索完成

if (currentRequestId !== this.requestId) return
```

清空输入也会递增编号。这样即使之前的请求还在路上，它回来后也只能被丢掉。

页面状态没有做成复杂的状态机库，只保留用户真正看得到的情况：等待输入、正在搜索、找到结果、没有结果，以及两个搜索来源都失败时的错误提示。状态标题用了 `aria-live="polite"`，读屏软件能听到结果数量变化。

结果渲染也从拼接 `innerHTML` 改成了 `createElement` 和 `textContent`。标题和摘要来自内容文件，但这不代表应该把它们直接塞进 HTML。能避开的注入入口，就别留着。

## 搜索结果里为什么会出现时间轴

生产构建时，Pagefind 报告自己索引了 4 个页面，而项目当时只有 3 篇文章。多出来的是时间轴页面，它也带有 `data-pagefind-body`。

如果搜索功能叫「文章搜索」，结果里混进时间轴并不合理。靠地址前缀在浏览器里过滤也不漂亮，因为 Pagefind 的搜索句柄在调用 `data()` 前并没有 URL。先把所有结果数据取回来再过滤，会多发请求，还会让结果总数不准确。

更合适的做法是在文章页写入 Pagefind 原生过滤标记：

```astro
<article data-pagefind-body data-pagefind-filter="type:post">
  <Content />
</article>
```

查询时直接限制类型：

```ts
await pagefind.search(query, {
  filters: { type: 'post' }
})
```

过滤发生在搜索阶段，结果数量和列表内容自然保持一致。时间轴仍然可以被 Pagefind 建索引，只是不会出现在文章搜索里。

## 最后怎么确认它真的好了

这次我没有只看构建是否通过。构建成功只能说明代码可以产出页面，不能说明搜索框真的能搜。

本地匹配函数有 4 个 Vitest 测试，覆盖空查询、大小写、多个关键词和排序。写这篇文章之前的那次验证中，Astro 生成了 19 个页面；Pagefind 索引里有 4 个页面、1060 个词和 1 个过滤器。文章加入后，Pagefind 收录了 5 个页面，索引词数增加到 1389。

我又在浏览器里走了几遍。开发模式搜索「小程序」，本地索引返回 2 篇文章；生产预览搜索正文里的「招商visa卡」，Pagefind 返回《webshare的使用和覆写》。输入一个不存在的词会看到「没有找到相关文章」，点击清空后则回到等待输入的状态。

最开始我盯着 `No Results`，差点一路查到中文分词。真正让排查转向的是那组很普通的对照：同一个关键词，在开发服务器和生产预览里的表现不一样。

Pagefind 和 Astro 开发服务器处在两个生命周期里。现在代码没有再掩盖这件事，开发时用一份够小的本地索引，构建后交给 Pagefind 搜正文。各做各擅长的部分，问题也就简单了。
