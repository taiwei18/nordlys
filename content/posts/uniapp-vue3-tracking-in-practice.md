---
title: 从真实项目出发，重新设计 UniApp + Vue3 埋点
description: 复盘 HaoLi168 项目的页面曝光、data-md 编译注入与手动埋点，整理一套能逐步落地的改造方案
publishedDate: 2026-03-15
tags:
  - 小程序开发
  - Vue3
  - 工程化
---

我之前写过一版 UniApp 自动化埋点方案，思路是“全局 Mixin 处理页面访问，Vite 插件处理点击事件”。单看设计图，这套组合很顺：页面不用重复写 `onShow`，按钮也只要挂一个属性。

后来我把它放回 HaoLi168 这个真实项目里重新看了一遍，结论没那么轻松。

项目里已经有一套正在使用的埋点链路。页面通过 `<route>` 配置业务编码，普通点击写 `data-md`，弹窗和接口结果则调用 `sendTrack()`。只看页面、组件和布局目录，粗略统计就有 74 处 `data-md`，分布在 28 个文件里；显式的 `sendTrack()` 也有 42 次，分布在 26 个文件中。这里面包含少量注释和测试页面，不过已经足够看出它不是一段孤立的示例代码。

这恰好说明了一件事：埋点可以减少手写，但很难做到“所有事件都自动识别”。编译器知道用户点了哪个节点，却不知道一次抽奖成功、一个弹窗展示或者一次订单提交失败在业务上叫什么。

所以这次不再追求全自动。我想做的是把重复劳动交给框架，同时给业务事件留一个清楚的手动入口。

## 先看项目里已经有的链路

HaoLi168 使用 UniApp、Vue 3、Vite 和 TypeScript。埋点相关代码主要在这几处：

```text
src/main.ts                 注册 TrackerPlugin
src/utils/track.ts          组装公共参数并发送事件
src/utils/tlog.ts           转换模板里的 data-md
src/api/maidian.ts          请求 /data.maidian.php
src/pages.json              页面编码和页面标题
src/utils/__tests__/        Vite 插件测试
```

运行过程大致如下：

```mermaid
graph LR
    A[页面 onShow] --> D[Tracker.track]
    B[data-md 点击] --> C[编译期注入 sendMd]
    C --> D
    E[业务代码 sendTrack] --> D
    D --> F[补充设备与路由信息]
    F --> G[/data.maidian.php]
```

页面访问是自动的。每个页面在 `<route lang="json5">` 中声明 `title2`：

```vue
<route lang="json5">
{
  layout: "tabbar",
  title2: "A2001",
  style: {
    navigationBarTitleText: "商城",
  },
}
</route>
```

`UniPages` 会生成 `pages.json`。全局 Mixin 在页面 `onShow` 时查找当前路由，再把 `title2` 和 `navigationBarTitleText` 交给 `Tracker`。一个新页面只要配置好路由元数据，基本访问事件就有了。

点击事件走另一条路：

```vue
<view
  @click="handleRechargeClick(item)"
  :data-md="{
    title2: 'A2001',
    title3: '充值中心',
    detail: `0::${item.rechargeTypeName}`,
  }"
>
  立即充值
</view>
```

构建时，`tlog.ts` 读取 `.vue` 模板，找到 `data-md`，将它改写成一次 `sendMd('c', data)` 调用。业务只负责描述“这是什么”，发送逻辑仍由统一的 `Tracker` 处理。

剩下的事件只能显式写。例如订单充值中的弹窗展示、用户取消连续包月、接口返回活动名称后再上报访问，这些信息不在模板节点上，自动注入猜不出来：

```ts
const { sendTrack } = useTrackMixin();

sendTrack("v", {
  title2: "A2003",
  title3: "订单充值中",
  object: "a",
});
```

这个分工是对的。问题主要出在三条链路还没有真正收拢。

## 自动化应该停在哪儿

我会把事件分成三类，而不是让一个 AST 插件包办全部工作。

| 事件                     | 触发方式                  | 原因                                    |
| ------------------------ | ------------------------- | --------------------------------------- |
| 页面访问                 | 路由元数据 + 页面生命周期 | 规则稳定，页面路径和标题都能统一取得    |
| 普通点击                 | `data-md` + 编译转换      | 模板上已有明确的业务描述                |
| 弹窗、接口结果、流程状态 | `useTracker()` 手动调用   | 触发条件藏在业务逻辑中，不能靠 DOM 推断 |

“手动”并不等于设计失败。真正该避免的是每个页面各写一套请求、公共字段和异常处理。业务代码保留一次 `track()` 调用，反而能准确说明事件发生的时机。

比如“点击领取”与“领取成功”不是同一件事。前者适合 `data-md`，后者必须等接口成功后再发送。如果为了追求零调用把它们合并，最后得到的只是看起来省事、实际含义错误的数据。

## 先统一事件入口

现有实现里，Vue 插件会创建一个 `Tracker`，每次调用 `useTrackMixin()` 又会创建一个。`Tracker` 的构造函数还会执行 `init()`。现在 `init()` 里的应用监听器是空函数，所以暂时看不出影响；以后只要加入队列刷新或前后台切换逻辑，每个组件都会重复注册监听。

更稳妥的做法是全局只保留一个实例：

```ts
export type TrackType = "v" | "c" | "e";
export type TrackObject = "a" | "b" | "p";

export interface TrackParams {
  title2: string;
  title3?: string;
  title4?: string;
  detail?: string;
  object?: TrackObject;
}

export const tracker = new Tracker();

export function useTracker() {
  return {
    track: tracker.track.bind(tracker),
  };
}
```

`TrackerPlugin`、页面 Mixin、编译注入和普通 TypeScript 文件都使用这个实例。名字也可以从 `useTrackMixin` 改成 `useTracker`，因为它实际上是一个 composable，不是 Mixin。

类型要在入口处收紧。当前 `IMaidianParams` 把 `class1`、`class2` 标成必填，但业务调用大多不传；`track(type, params: any)` 又绕过了这层检查。类型声明与运行数据各说各话，IDE 自然帮不上忙。

我倾向于分开“业务参数”和“最终请求参数”：

```ts
interface TrackPayload extends TrackParams {
  type: TrackType;
  title1: string;
  object: TrackObject;
  url: string;
  pre_page?: string;
  version?: string;
  SDKVersion?: string;
  iosAn?: string;
  banben?: string;
}
```

业务只填写它知道的字段。`title1`、页面地址和设备信息由 SDK 补齐，发送前再校验最终 payload。这样既能兼容后端现有字段，也不会逼着每个按钮重复填写环境信息。

还有一个合并顺序容易被忽略。公共字段不该被模板数据随意覆盖：

```ts
const payload: TrackPayload = {
  ...params,
  ...context,
  type,
  object: params.object ?? "b",
  title1: params.title2.slice(0, 3),
};
```

如果确实允许业务覆盖某些公共字段，应列出白名单，而不是依赖对象展开的先后顺序。

## 页面访问：复用路由配置，但别假装所有 onShow 都一样

用 `pages.json` 做页面事件表，比在几十个页面里复制 `sendTrack('v')` 要省心得多。不过当前查找逻辑只读取了 `subPackages[0]`。项目现在只有一个分包根目录，这段代码能工作；一旦增加第二个分包，其中的页面就会静默漏报。

可以先生成一张完整索引：

```ts
const pageMetaMap = new Map(
  [
    ...pages,
    ...subPackages.flatMap(({ root, pages }) =>
      pages.map((page) => ({
        ...page,
        path: `${root}/${page.path}`,
      })),
    ),
  ].map((page) => [page.path, page]),
);
```

页面 `onShow` 时按当前 route 查询。找不到配置或没有 `title2` 时，开发环境打印一次告警；生产环境可以把它视为“不自动上报”。这里最好选一种约定，不要继续无声跳过，因为无声失败通常要等报表断层后才会被发现。

`onShow` 也不完全等于首次访问。用户从详情页返回列表、切换小程序前后台、重新打开 Tab 页，都可能再次触发。数据侧如果需要区分首次进入和重新可见，可以增加 `view_id`、`show_reason`，或者明确接受每次可见都记一次 PV。技术上没有唯一答案，先把口径写清楚更重要。

至于停留时长，需要同时记录 `onShow` 和 `onHide`/`onUnload`，还要处理应用切到后台的情况。它不该顺手塞进一个只会上报 PV 的示例里，然后在文档中宣称已经支持。

## 点击注入：保留声明式写法，重做转换器

`data-md` 在这个项目里已经铺开，直接要求全部改成手写调用没有必要。它的表达也比一个事件名字符串更实用，动态列表项可以在点击时带上 `item.name`、订单号和礼品信息。

但现有转换器仍是一个脆弱的源码替换器。它借助 `vue/compiler-sfc` 找节点，最后却用 `String.replace()` 改模板。几个具体问题不能绕过去：

- 节点没有点击事件时，代码仍访问 `findVueClickEvent.loc`，异常被最外层 `catch` 吞掉，整份文件会停止注入；
- 它找到的是第一个 `v-on`，未确认事件名一定是 `click` 或 `tap`；
- `@click="handle"` 会被改成 `handle()`，原本由 Vue 传入的 `$event` 丢了；
- 多个事件修饰符只保留第一个；
- 解析错误直接返回 `null`，构建照常成功，最终表现是漏埋而不是报错。

项目里的 15 个插件测试目前都能通过，但其中“无点击事件”用例明确接受 `null`，等于把已知 bug 当成合法结果。测试还 mock 了 `parse()` 返回的 AST，验证的是手工对象能不能走通，不是 Vue 编译器面对真实 SFC 时会产生什么。

这部分应该先规定转换契约，再写实现：

1. 只处理带 `data-md` 的 `.vue` 模板；
2. 只增强显式的 `@click` 或 `@tap`，第一阶段不替元素凭空增加交互；
3. 保留原处理器的 `$event`、返回值和全部修饰符；
4. 同一节点已经注入时不重复处理；
5. 开发时明确报错，CI 和生产构建遇到转换失败就中止，并给出文件名与位置；
6. 生成 Source Map，排查线上堆栈时仍能回到原组件。

实现上有两条路。要么使用 Vue compiler 的 `nodeTransforms`，在模板生成 render 函数前改事件表达式；要么等模板编译成 JavaScript 后，再用 Babel AST 包装 `onClick`/`onTap`。两种方案都比替换 `node.loc.source` 稳定，但不要混在一起。

我更偏向模板 AST，因为 `data-md`、事件参数和修饰符在这个阶段仍保留 Vue 语义。转换前后的意图可以写成：

```vue
<!-- 输入 -->
<view @click.stop="openGift(item)" :data-md="trackData">领取</view>

<!-- 等价行为，不代表最终生成源码 -->
<view
  @click.stop="
    ($event) => {
      sendMd('c', trackData);
      return openGift(item);
    }
  "
>
  领取
</view>
```

埋点放在业务处理器之前，是因为很多点击会立刻跳页。若先跳转再收集公共参数，`getCurrentPages()` 可能已经指向下一页，点击事件就会记错 `url`。这个顺序仍要通过微信小程序实机验证，不能只看 H5。

没有 `@click` 的 `data-md` 应在编译时警告。一个非交互节点可能是漏写事件，也可能只是把标记挂错了位置，插件没法替开发者做决定。

## 不是所有平台都有微信小程序 API

项目的 `package.json` 提供 H5、App 和多个小程序平台的构建命令，但公共参数直接调用了：

```ts
uni.getAccountInfoSync();
uni.getAppBaseInfo();
```

并继续读取 `miniprogram.miniProgram.version`。这更像微信小程序实现，而不是已经完成的跨端适配。

可以把 Context 拆成平台适配器：

```ts
interface TrackContextProvider {
  getAppContext(): Partial<TrackPayload>;
  getRouteContext(): Pick<TrackPayload, "url" | "pre_page"> | null;
}
```

微信小程序适配器读取账号与基础库信息；H5 使用网页地址和应用构建版本；App 再提供自己的版本字段。拿不到某个值时返回 `undefined`，不要为了凑字段伪造空字符串。

这也意味着文章里不该出现“编译后是普通 JavaScript，所以完美兼容所有 UniApp 平台”这种结论。编译能通过，只说明语法过关。生命周期、事件名称、平台 API 和请求时机仍要逐端验证。

## 发送层先求可观测，再谈复杂队列

目前每条事件都立即调用 `/data.maidian.php`。对于现阶段，这比一上来实现离线队列更容易控制。先补上几个很实际的能力：

- 每条事件生成 `event_id`，服务端可以据此去重；
- debug 日志受环境开关控制，并对手机号、openid 等字段脱敏；
- 请求失败记录事件名、页面和错误类型，不能只打印一整份 payload；
- 设定超时和内存队列上限，埋点失败不能拖住业务操作；
- 应用进入后台时尝试 flush，但不承诺一定发送成功。

等能看见失败率后，再决定是否值得做批量、持久化和指数退避。重试也不是越多越好。参数错误导致的 4xx 不该重试，断网事件可以暂存，超过队列上限则按明确规则丢弃。

隐私边界同样要放在 SDK 入口，而不是靠每个页面自觉。路由 query 和 `detail` 都可能带用户信息，建议对允许上报的字段做白名单，并在隐私授权完成前禁用非必要采集。

## 测试要用真实输入

转换器最有价值的测试输入就是完整 `.vue` 文件。不要 mock Vue parser，让真实编译器参与：

```ts
it("保留事件参数和修饰符", async () => {
  const input = `
    <template>
      <view
        @click.stop.prevent="select(item, $event)"
        :data-md="{ title2: 'A2001', title3: item.name }"
      />
    </template>
  `;

  const result = await runTransform(input, "ProductItem.vue");

  expect(result.code).toContain("sendMd");
  expect(result.code).toContain("select(item, $event)");
  expect(result.code).toContain(".stop.prevent");
});
```

测试矩阵至少还应包括：静态与动态 `data-md`、方法引用、内联表达式、`@tap`、其他 `v-on` 排在前面、嵌套节点、重复节点、没有事件以及重复转换。

单元测试之后，再跑一次目标平台构建。对 HaoLi168 来说，微信小程序是主路径，CI 可以固定执行：

```bash
pnpm vitest run src/utils/__tests__/tlog.test.ts
pnpm build:mp-weixin
```

最后在构建产物中抽查一个静态参数和一个动态参数，并用开发者工具点一次。AST 测试通过不代表小程序事件一定按预期触发，这一步省不了。

## 怎么在现有项目里改，不至于一次推翻

我会分批做，而不是重写所有埋点。

第一批只收入口：创建单例 `tracker`，把 `useTrackMixin()` 迁到 `useTracker()`，保留旧函数做代理，业务页面不用一起改完。

第二批整理页面事件：生成完整的主包和分包路由索引，补上缺失 `title2` 的开发告警，和数据同学确认 `onShow` 的统计口径。

第三批替换编译插件。先只支持“已有 `@click`/`@tap`”的节点，把无事件标记当作构建警告。新旧转换结果可以在测试环境双写日志，但上报只走一份，避免污染报表。

之后再拆 Context 与 Transport。跨端适配、失败队列、隐私过滤都放在这一层，模板和业务页面不需要知道发送细节。

这套方案保留了 HaoLi168 已经使用的路由字段与 `data-md`，也承认复杂业务事件必须手动描述。它不会让源码里彻底看不到埋点，但能把最容易复制、漏写和写错的部分集中管理。

对业务项目来说，这比“百分之百自动化”更可靠。埋点代码少一点当然好，数据含义不跑偏更重要。
