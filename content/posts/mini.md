---
title: UniApp + Vue3 自动化埋点体系设计方案
description: 关于小程序埋点方案
publishedDate: 2025-11-26
tags:
  - 小程序开发
---
## 1. 背景与痛点分析

在构建 UniApp (Vue3) 应用时，埋点系统面临以下核心冲突：

*   **全局拦截 (Global Intercept):** 颗粒度过粗，仅能获取页面路径，无法携带业务上下文数据，**不符合精细化分析要求**。
*   **手动埋点 (Manual Tracking):** 代码侵入性极强，业务逻辑与埋点逻辑耦合，**维护成本高，不仅修改麻烦，还容易漏埋**。
*   **自定义指令 (Custom Directive):** 在 UniApp 的非 H5 端（如小程序）受限于架构，指令的生命周期与事件绑定支持并不完美，**技术可行性受阻**。

**解决方案目标：** 采用 **“运行时 Mixin + 编译时 AST 转换”** 的双层架构，辅以 **Vitest** 确保转译逻辑的正确性。

***

## 2. 总体架构图

代码段

```mermaid
graph TD
    A[源代码 Source Code] -->|Vite Build Plugin| B(AST 语法树分析)
    B --> C{是否包含埋点标记?}
    C -->|Yes| D[注入埋点函数代码]
    C -->|No| E[保持原样]
    D --> F[生成产物 Code]
    E --> F
    
    G[App 运行时] --> H[全局 Mixin (页面级)]
    H --> I[上报 PV/PageStack]
    F --> J[触发事件 (Click/Tap)]
    J --> K[执行注入的埋点逻辑]
    K --> L[上报 Event]

```

***

## 3. 页面级埋点：全局 Mixin 策略

对于页面浏览（PV）或页面停留时长，利用 Vue3 的全局 Mixin 或 UniApp 的生命周期拦截更为高效。

### 实现思路

利用 `app.mixin` 混入 `onShow` 和 `onHide` 生命周期，自动提取当前页面路径及参数。

### 代码实现


JavaScript

```
// src/utils/tracker.js
export const trackPage = (path, query) => {
  console.log('[Page Track]', path, query);
  // 实际发送请求逻辑...
};

// src/main.js
import { createSSRApp } from 'vue';
import App from './App.vue';
import { trackPage } from './utils/tracker';

export function createApp() {
  const app = createSSRApp(App);

  app.mixin({
    onShow() {
      // 获取当前页面栈
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      if (currentPage) {
        trackPage(currentPage.route, currentPage.options);
      }
    }
  });

  return { app };
}

```

***

## 4. 事件级埋点：AST 编译时注入 (核心)

这是本方案的重难点。我们不修改源码，而是在 Vite 构建过程中，通过编写自定义插件，解析 `.vue` 文件，找到特定的标记，自动插入埋点代码。
## 工作流程

1.  **过滤文件**：只处理 `.vue` 文件
2.  **解析模板**：使用 `vue/compiler-sfc` 解析 Vue 组件的 template 部分
3.  **查找标记**：通过正则匹配查找带有 `data-track` 属性的元素
4.  **遍历 AST**：递归遍历模板的抽象语法树，找到所有需要处理的节点
5.  **注入逻辑**：
    *   如果元素**已有点击事件**：在原有事件后追加 `,sendMd('c', mdValue)`
    *   如果元素**没有点击事件**：添加 `@click="sendMd('c', mdValue)"`
6.  **替换代码**：用修改后的模板替换原模板内容

### 策略：约定大于配置

我们约定：只要标签上带有 `data-track="EventName"` 属性，编译器就会自动为该元素的 `@click` 或 `@tap` 事件处理函数中插入埋点代码。

### Vite 插件实现 (基于 Babel AST)

我们需要安装 babel 相关依赖：

npm install @babel/parser @babel/traverse @babel/generator @babel/types -D

JavaScript

```
// inject-click-handler.ts vite插件
import { parse } from 'vue/compiler-sfc'
import { Plugin } from 'vite'

export default (): Plugin => {
  return {
    name: 'inject-click-handler',
    transform(code, id) {
      try {
        if (!/.vue$/.test(id)) return null
        const parseCode = parse(code)
        if (!parseCode) return null
        if (!parseCode.descriptor?.template?.content) return null
        const dataMdRegex = /<[^>]*\bdata-track="([^"]*)"[^>]*>/g // 匹配data-md，
        // 匹配当前文件是否有埋点标识，在继续往下遍历ast
        const { content, ast } = parseCode.descriptor.template

        // 返回null的时候表示不修改任何代码
        if (!content.match(dataMdRegex)) {
          return null
        }

        // 获取template模板
        let $code = parseCode.descriptor.template.content
        // 需要修改的节点数组
        const nodeArray = []
        // 递归ast节点
        const handleEachAst = (node) => {
          if (node?.props?.length) {
            // 查找我们在页面写的data-track
            const isMd = node?.props?.find(
              (item) =>
                item?.name === 'data-track' ||
                (item.name === 'bind' && item?.arg?.content === 'data-track'),
            )

            // 查找当前元素是否有点击函数并追加混入的埋点函数
            if (isMd) {
              // console.log('埋点标识', node?.props)

              const findVueClickEvent = node?.props?.find(
                (item) => item.name === 'on' && item.type === 7,
              )
              let pushFn = ''
              const mdContent =
                isMd.name === 'data-track' ? `'${isMd.value.content}'` : isMd.exp.content
              if (findVueClickEvent) {
                // 检查是否一个函数   sendMd是混入的埋点函数
                const isFunctionCall = (str) => {
                  const trimmed = str.trim()
                  return trimmed.endsWith(')') && trimmed.includes('(')
                }
                if (!isFunctionCall(findVueClickEvent.exp.content)) {
                  findVueClickEvent.exp.content += '()'
                }
                pushFn = `@${findVueClickEvent.arg.content}${findVueClickEvent.modifiers.length ? `.${findVueClickEvent.modifiers[0]}` : ''}="${findVueClickEvent.exp.content},sendMd('c',${mdContent})"`
              } else {
                pushFn = `@click="sendMd('c',${mdContent})"`
                console.log('nodeStr', node?.props)
              }
              const nodeStr = node.loc.source.replace(findVueClickEvent.loc.source, pushFn)

              nodeArray.push({
                source: node.loc.source,
                replaceSource: nodeStr,
              })
            }
          }

          if (Array.isArray(node?.children)) {
            node.children.forEach((item) => {
              item.props && handleEachAst(item)
            })
          }

          if (nodeArray.length) {
            nodeArray.forEach((item) => {
              $code = $code.replace(item.source, item.replaceSource)
            })
          }
        }

        handleEachAst(ast)
        return {
          code: code.replace(parseCode.descriptor.template.content, $code),
        }
      } catch (e) {
        return null
      }
    },
  }
}


```

*注意：在实际 Vue3 + Vite 环境中，直接操作 `.vue` 文件的 AST 比较复杂，通常推荐通过 `vue-template-compiler` 的 `compilerOptions.nodeTransforms` 来操作模板 AST，或者在 Vite 处理完模板编译后的 JS 阶段进行注入。*

***

## 5. 自动化测试：Vitest 稳定校对

AST 逻辑复杂，极其容易在业务代码更新时失效（例如 Vue 编译器版本升级导致生成的 render 函数结构变化）。必须引入单元测试来保证“编译插件”的稳定性。

### 测试策略

不测试业务 UI，**只测试 AST 转换逻辑**。输入一段包含 `data-track` 的代码，断言输出的代码中包含 `$tracker(...)` 调用。

### 测试用例 (Vitest)

TypeScript

```
// tests/auto-track.test.ts
import { describe, it, expect } from 'vitest';
import autoTrackPlugin from '../build/vite-plugin-auto-track'; // 导入上面写的插件

// 模拟 Vite transform 上下文
const runTransform = (code: string) => {
  const plugin = autoTrackPlugin();
  // @ts-ignore
  return plugin.transform(code, 'test.vue');
};

describe('Auto Track AST Plugin', () => {
  
  it('应当自动为带有 data-track 的点击事件注入埋点代码', () => {
    // 模拟 Vue 编译后的 Render 函数片段
    const inputCode = `
      import { createVNode as _createVNode } from "vue";
      const _sfc_render = (_ctx, _cache) => {
        return _createVNode("button", {
          "data-track": "buy_button_click",
          onClick: () => { console.log("click happened"); }
        }, "Click Me");
      }
    `;

    const outputCode = runTransform(inputCode);

    // 断言 1: 原始逻辑保留
    expect(outputCode).toContain('console.log("click happened")');
    
    // 断言 2: 埋点代码已注入
    // 检查是否插入了 $tracker('buy_button_click')
    expect(outputCode).toMatch(/\$tracker\(['"]buy_button_click['"]\)/);
  });

  it('没有 data-track 的元素不应被修改', () => {
    const inputCode = `
      const _sfc_render = () => {
        return _createVNode("div", { onClick: () => {} });
      }
    `;
    const outputCode = runTransform(inputCode);
    expect(outputCode).not.toContain('$tracker');
  });
});

```
***

## 6. 方案总结与优势

1.  **开发体验 (DX):** 开发者只需在模板中写 `<button data-track="login">`，无需手动引入埋点 SDK，无需在 methods 中写脏代码。
2.  **代码质量:** 业务逻辑与监控逻辑完全解耦。源码中看不到埋点调用，产物中自动包含。
3.  **稳定性:** 通过 Vitest 对 AST 插件进行测试，确保 Vue 版本升级或代码风格变更不会导致埋点失效。
4.  **UniApp 兼容性:** 由于是在 **编译阶段 (Build Time)** 完成的代码注入，生成的最终代码就是普通的 JS 函数调用，因此**完美支持 小程序、H5、App 等所有 UniApp 平台**，避开了运行时指令的兼容性坑。
