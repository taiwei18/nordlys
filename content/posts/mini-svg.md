---
title: 关于小程序中使用svg图标的方案
description: 小程序使用base64显示svg
publishedDate: 2026-01-19
tags:
  - 小程序开发
---
### 小程序svg显示
---

## 一、Base64 字体的本质是什么？

### 字体文件本来是什么

Iconfont 本质是一个 **字体文件**（如 `.ttf` / `.woff`）：

```text
iconfont.ttf  →  二进制文件
```

正常情况下，CSS 通过路径加载它：

```css
@font-face {
  font-family: 'iconfont';
  src: url('./iconfont.ttf');
}
```

但在 **微信小程序** 里：

* `.wxss` **不允许**直接引用本地字体文件
* 就会报错或直接不生效

---

### Base64 是什么？

Base64 是一种 **把二进制文件编码成字符串** 的方式：

```text
iconfont.ttf（二进制）
↓
Base64 编码
↓
"AAEAAAALAIAAAwAwT1MvMg8SBJQAAAC8AAAAYGNtYXAW..."

Base64 只是一个编码方式，不是资源类型。

Base64 装的是什么	表现是什么
data:image/png;base64,...	图片
data:font/ttf;base64,...	字体
data:application/pdf;base64,...	PDF
```

---

## 二、Base64 字体是如何“被使用”的？

### 字体被“嵌入”到 CSS 中

通过 `data:` URL 方式直接写进 CSS / WXSS：

```css
@font-face {
  font-family: 'iconfont';
  src: url("data:font/ttf;base64,AAEAAAALAIAAAwAwT1MvMg8SBJQAAAC8...");
}
```

关键点：

* **不再需要外部字体文件**
* 整个字体内容已经在这段字符串里

---

###  渲染流程（非常重要）

当小程序 / 浏览器解析到这段样式时：

```
解析 wxss
↓
发现 data:font/ttf;base64,...
↓
直接从字符串中“还原”字体文件
↓
注册为 iconfont 字体
↓
根据 Unicode 渲染图标
```


---

## 三、为什么 Base64 能解决小程序的问题？

### 微信小程序的限制点

* 禁止在 wxss 中引用本地字体路径
* 外链字体首次加载可能失败或闪烁
* 网络慢时 icon 可能不显示

---

### Base64 的“绕过方式”

| 问题        | Base64 如何解决 |
| --------- | ----------- |
| 本地路径被禁    | 根本不需要路径     |
| 网络请求失败    | 没有请求        |
| 字体加载时机不稳定 | wxss 解析即生效  |

 **Base64 本质上是“把字体当成样式的一部分”**

---

## 四、Iconfont + Base64 为什么能显示图标？

Iconfont 的图标显示依赖 **Unicode + 字体映射**：

```html
<text class="iconfont">&#xe600;</text>
```

只要满足两点即可：

1. `font-family: iconfont` 存在
2. 字体文件中包含 `\e600 → 某个图形`

Base64 方式只是 **改变了字体的加载方式**，并没有改变这套机制。

---

## 五、一句话总结

> **Base64 引入字体图标的原理，是将字体文件的二进制内容编码成字符串，通过 `data:` URL 内嵌进 CSS / WXSS，使运行环境在解析样式时直接还原并注册字体，从而绕过文件路径和网络加载限制。**
