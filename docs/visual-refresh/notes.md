# Design DNA 应用说明

本轮依据用户提供的 `/Users/youkaiou/Downloads/DESIGN.md`，使用本机已安装的 `design-dna` skill，完成「规格整理 → 三维 DNA → 源码应用 → 实际 CSS 核验」。用户要求连续执行，不增加中途确认。`design-dna.json` 对照 skill 的 `references/schema.md` 校验了全部 227 个必填叶字段。

## 来源与可验证范围

- `DESIGN-reference.md` 是用户原始 Markdown 的副本，未将其当成对用户经历、项目结果或权限的证明。
- 本轮没有获得原始 Variant 参考页面或原始截图。颜色取自 Markdown 的明确 token，不能称为像素测量、源站复刻或图片相似度验证。因此不写入可选 `measurement`、`measured_palette`，也不执行基于不存在参考图的色差评分。
- 源文档把青绿写为有效 `#15846e`，同时另有不合法的 `#15846`。采用有效 token `#15846e` 统一处理。
- 仅采用参考的视觉语言：纯黑、轻字重、留白、三角粒子、交替两栏。作品集保持王耀海自己的身份、项目和真实材料，不复制 Dala 的品牌文字。

## 三个维度如何落地

| 维度 | 设计决定 | 源码位置 |
|---|---|---|
| Design system | 黑色 `#000000` 画布，白色标题，`#9a9a9a`/`#bdbdbd` 辅助文字，紫色 `#8052ff` 唯一实心主动作，琥珀 `#ffb829` 提示与链接，青绿 `#15846e` 装饰 | `src/styles/revision.css` |
| Design system | Inter 静态 200/400/600 与本地 Noto Sans SC 子集；标题真实 400、正文真实 200；6px 节奏；去掉截图外层灰框、阴影和重复卡片 | `src/styles/revision.css`、`scripts/subset-font.py` |
| Design style | 封面用大标题与三角星云；首页项目交替两栏；案例以真实截图和短叙事为核心，细节比较保持可读 | `src/components/Block.astro`、`src/pages/index.astro` |
| Visual effects | 确定性 SVG：1050 个云团三角形和 70 个环境三角形，只对云团做慢速整体变换，无指针物理或额外 WebGL 依赖 | `src/components/Constellation.astro` |
| Visual effects | PDF、打印、系统减少动态效果设置下静止；文本不做拆字、故障或滚动变形 | `src/styles/revision.css` |

## 为中文作品集做的明确适配

源参考是品牌落地页，不能直接吞掉用户要求的真实案例证据。其「hero 不出现产品截图」应用于作品集总封面；具体案例首屏和正文保留真实产品图。样板间属于展示预设，不能写成记录 14 成长值后的真实解锁成果；F1 展示完整产品界面；证据裁切保留关键问题、操作、结果与边界。

网页外框由参考的约 1280px 调整为含内边距的 1472px，保证产品截图面积。PDF 使用 1920 × 1080px，左右 96px；封面 104px、案例标题 78px、证据页标题 58px，中文行高增至 1.16–1.2。正文网页 18px / PDF 26px，均使用 200 字重。移动端在 800px 以下以单列为主。

按钮保持 24px 圆角；截图首屏采用 12px、首页项目图 18px、证据裁图 0px，避免过度圆角截掉界面。参考中的无边框、无阴影规则适用于作品集的外层组件；原产品截图内的颜色、组件、状态和文字不改色或重绘。历史规格与素材辅助页不属于本轮品牌首页的设计承诺。

粒子效果是依据文字规格创作的原生 SVG 解释，并非获取了源站粒子素材。固定位置在构建时生成，运行时只做一个 CSS transform 动画，减少依赖并支持清晰的 PDF 输出。

## 核验结果与复现

在最新本地构建上运行：

```sh
cd /Users/youkaiou/就职/portfolio
node docs/visual-refresh/verify-design-dna.mjs
```

`design-dna-verification.json` 记录了浏览器实际 computed style / DOM 的 14 项检查，当前全部通过：精确颜色、纯黑背景、Inter/Noto 字体链、标题 400、正文 200、紫底白字主按钮、导航次级动作、项目区无卡片面板、封面无产品图且 1120 个三角形、无 Canvas、减少动态效果时静止、打印静止、无远程资源请求、17 页打印结构。

这是源码呈现核验，不是参考截图的像素相似度评分。颜色对比按 WCAG 相对亮度公式计算：白/黑 21:1，银灰/黑约 11.18:1，灰/黑约 7.46:1，琥珀/黑约 12.14:1，白/紫按钮约 4.60:1。未把截图内部的第三方 UI 纳入作品集外层配色合规结论。最终 PDF 的页数、裁切和逐页视觉结果见本目录的导出与检查记录。

两处实施问题已修复：跳到正文链接在改黑色主题后原先会白底白字，现为紫底白字；首页导航下载改为 ghost 链接，避免同屏两个紫色实心主按钮。

## PDF 字体兼容适配

首次使用 Inter variable 直接导出时，Chrome 将相关字体输出为 Type3。现从保留的同一 variable 源生成同字形静态 200/400/600 woff2，页面仍采用真实轻字重与常规字重，不改变视觉 token。最终主版与轻量版字体检查均为 `allFontsEmbedded: true`；采用嵌入 TrueType 输出。源 variable 文件保留作为可复现输入。
