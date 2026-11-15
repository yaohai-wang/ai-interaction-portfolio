# 连续执行记录

目标目录：`/Users/youkaiou/就职/portfolio/`。仅本地构建，无部署、DNS 更改、线上消息或表单提交。

## M0 · 调研

- 已通过 Codex 项目清单定位三个项目；个人站的实际 Git 仓库位于 `个人介绍/portfolio-web`。
- 建立独立作品集 Git 仓库；§3 全部硬性规则已写入根目录 AGENTS.md。
- 栈：Astro 5 静态输出 + TypeScript + YAML + Zod。包管理器采用 npm（独立作品集）；原项目分别保留既有 pnpm/npm，不改其锁文件。
- 结构：`src/content/` 文案数据，`src/components/` 积木，`src/pages/` 路由，`public/` 同域素材，`scripts/` 产线，`output/pdf/` 交付，`tmp/` 历史归档及 QA。
- 字体：Noto Sans SC，官方仓库 TTF 做实际用字子集；OFL 许可随站保存。仅本地依赖安装：Node 已有，Playwright/ffmpeg/Python 工具安装到本目录。
- 事实口径：保留提交日期 ≠ 项目实际起止日期；本地工作区 ≠ 线上版本；源码实现 ≠ 真实运行成功。详细见 facts.md 和 audit-*.md。
- 预览：M1 起使用 `npm run dev`；当前为资料阶段。
- 遗留：视频身份/公开授权、个人职责/起因、公开联系方式、设计措辞、工具与 Figma 均保留 TODO。

### M0 补充：Qloo（用户更新）
- 用户明确定位案例 01 视频到 Codex 的 Qloo 项目，并同步更新任务书；已只读查到 `/Users/youkaiou/Desktop/Qloo/design/live-2d/`。
- 产品为 TasteTwin 交互原型；视频为示例数据演示，不声称已接真实模型/识别服务。角色与公开权限仍待确认。
- 中止已无必要的全盘视频元数据扫描，转为 Qloo 目录内的精确素材清单，避免继续读取无关研究录像。

## M1 · 骨架、设计系统与 PDF 打样

- Astro 静态页面、YAML + Zod 内容校验和全部积木渲染器已建立；HTML 坐标标注独立于图片。
- 统一暖白编辑式版式、来源于三个项目的强调色接口、12 栏逻辑布局与移动适配；打印画布 1920×1080，页边距 96px。
- Noto Sans SC 按实际文字生成自托管 WOFF2；字体许可随站。三页样张已通过：3 页、16:9、中文文本可提取、所有字体嵌入、1 个可点击链接。
- 预览：`npm run dev`；打印：`npm run pdf -- --sample`；样张：`output/pdf/M1-中文与链接-三页样张.pdf`。
- 遗留：图片仍由 M2 脚本逐步采集；内容将在 M3/M4 替换样张数据。期间遇到 Astro SVG 编译和内容打包路径问题均已修复。

## M2 · 素材管线与缺失材料

- `shots` 完成三个站的只读清单：理想之家线上10张、F1线上9张、个人站线上8张。每张JPG/WebP均小于400KB，真实画面及图注可在 `/assets-review/` 查看。
- Git迭代：理想之家97bd65f旧入口/房间与线上现状；F1的36e5c70→f7c61d3；个人站30c007c、aea24b5、0deaeef均已从真实归档启动截图。失败尝试（Home另外两版云端对象超时；F1旧Next编译；个人站完整大归档）均记入assets文档，个人站改最小归档后成功，不用新代码伪造旧版。
- TasteTwin已按用户补充纳入：本地80.208秒H.264/AAC候选副本、海报、完整357.263秒视频的每5秒联系表、8张推荐关键帧和2张阶段对比。来源/哈希/时间码见manifest与provenance；不声称真实AI或健康效果。公开权限仍待确认。
- `/specs` 提供TasteTwin、理想之家两个主打案例的规格，另附F1；包含SVG流程/分支状态图、组件、颜色/字号/圆角/间距，均附原代码来源。不是Figma文件。
- 工作流证据来自原任务文档与提交记录；每个案例均≥6张可用素材并有一组对比（Qloo为阶段检查截图，未虚构Git）。
- 预览：`npm run dev` → `/assets-review/`、`/specs/`；单页画布 `/specs/?sheet=ideal-home&canvas=1`。
- 遗留：视频最终选帧、角色/公开权限、Figma整理及设计原始动机由Kai确认。

## M3 · 两个主打案例

- 完成TasteTwin 5页：产品原型范围、问题/取舍、视频可见的流程、条件回显标注、确认记录标注。角色/公开/选帧仍明确TODO，不称为真实模型或自主Agent。
- 完成理想之家6页：案例首页、核心循环、手记空态、样板间体验、真实版本对比、异步与部署边界。
- 独立复核修正：样板间标注按实际控件定位；删除错误的 saved→abandoned 线性连接，二者是分支终态；更新视频新版源码依据与01:07.4时间码。
- 静态构建与schema通过；主打案例各页都有真实内容或明确TODO，问题集中在questions.md。
- 预览：`/cases/agent/` 与 `/cases/ideal-home/`；其他页面占位在M4替换。

## M4 · 其余页面

- 完成围场智析4页、桌面平行宇宙1页、封面/关于/总览/三条判断/工作流/结语，合计22块，对应22页。
- 总览明确主打理想之家；TasteTwin标示原型与公开待定。个人站五主题保持同一构图，并加入两处HTML标注与流程。
- 四个案例的角色/时间/工具/Demo/二维码信息均有真实内容或明确TODO；不生成未部署的作品集二维码。
- 已修正文案与标注中的两处源码版本引用和视频时间码。静态构建及内容schema通过；当前素材最大397,355字节，全部运行资源同域。
- 预览：`npm run dev`；全部页面与 `/print/` 已可读。正式稿仍因27处内容待确认而受发布检查拦截，问题按K编号汇总。

## M5 · 打磨与草稿交付

- 完成22页主草稿与同内容精简版，分别3,833,268 / 1,563,345字节；中文字体已嵌入，文本可提取，6个外链与7个页内链接有效。
- 完成24组桌面/移动检查：1440、1280、390宽度下无横向溢出、缺图或外域运行请求；键盘跳转、替代文本、减少动效、视频按需加载均通过。
- 重新调整总览的自制缩略图、标注引线、个人站拼图和规格表页脚；围场助手使用可溯源的局部裁切图。3张规格JPG/WebP与SVG已导出。
- Chrome/Poppler与macOS原生PDFKit渲染复核通过；源PDF保持不变。
- 形成README、自动检查报告、release-checklist；本地网页带草稿PDF下载。TODO正式发布拦截已验证，当前27处待确认关联17个本人问题。
- 预览：`npm run dev` → `http://localhost:4321/`。素材与视频选帧在 `/assets-review/`，设计规格在 `/specs/`，打印同源在 `/print/`。
- 交付PDF在 `output/pdf/`。全部工作只在portfolio目录；4个来源项目只读，无部署、DNS修改、线上消息/表单提交。
- 遗留仅限Kai确认的事实、措辞、角色与公开权限、最终视频选帧、工具/Figma、反馈、联系方式、实习范围、产品名称、线上问答手动复测、国内实网与实际上传限制。M6/M7未执行。

## 2026-11-12 · 16页修订预览版

- 按新附件实际重写现有源码：理想之家优先，取消独立宣言与无证据的过程页，AI辅助过程并入真实迭代；四案例分别展示闭环、规则状态、上下文范围、主题保持。
- 完成独立合成数据实测：Home真实模型与积分/家具/房间/离线恢复；TasteTwin半份记账；F1两个真实问题；桌面双入口/换主题/焦点。原产品只读，没部署。
- 新主PDF3,838,931字节、轻量版1,605,338字节，均16页，字体嵌入与10个链接校验通过。全部页面双引擎渲染并逐页复核，P7/P15可读性问题已修正。24组网页检查通过，原3份PDF SHA不变。
- 预览：`npm run dev`；完整打印稿`/print/`，新文件`output/pdf/portfolio-ai-interaction-revised.pdf`及`-light.pdf`。
- 修改记录与验证见`docs/revision/change-log.md`、`validation.md`。本人职责/周期、动机/研究、公开许可、联系信息等仍见`docs/portfolio-evidence-gaps.md`；发布检查继续受实质缺口拦截。

## 2026-11-13 · Design-dna 黑色视觉改版

- 按用户新提供DESIGN.md与本机Design-dna skill重做实际源码，形成完整三维DNA与14项实际样式核验。黑底、轻字重、大留白、紫色主动作与三角星云；首页交替两栏，不再以重复框体包裹截图。
- F1恢复完整产品首页，扩展为P13–15；总稿17页。理想之家首页/空间页改用真实预设样板间第一视角，保留与14点任务的区别。桌面比较改为同一正文的真实主题裁切。
- 主PDF4,591,809字节、轻量2,158,212字节；17页逐页双引擎检查、24组网页检查、字体/链接/原稿SHA/正文一致性通过。修复Inter可变字体PDF兼容、手机标题孤字与跳转链接对比度。
- 预览：`cd /Users/youkaiou/就职/portfolio && npm run dev`；主/轻量PDF仍在output/pdf/portfolio-ai-interaction-revised{,-light}.pdf。详细修改与验收在docs/visual-refresh/。
- 无部署，原项目只读；公开许可、个人职责/周期/动机、联系方式和个人资料确认见docs/questions.md与portfolio-evidence-gaps.md。

## 2026-11-13 · 完整界面截图优化

- 按用户要求将碎片裁图改为完整面板/完整产品视窗；总览缩略图不再横裁。Home保持真实样板间，F1保留页面与助手，TasteTwin保留顶栏和整体场景。
- 个人站拆为P16完整桌面与P17完整内容页对照，结语P18。旧裁图和证据文件保留，当前主稿不再引用。
- 网页正文图片加入完整图查看、原始尺寸切换、Escape关闭与焦点返回；桌面/手机10次实际交互通过。
- 18页主PDF5,163,975字节、轻量1,886,256字节。24组页面检查、18页边界、14项DNA核验、字体/链接/正文一致/原稿SHA检查通过；全部页面渲染和逐页记录见docs/full-interface/。
- 预览命令仍为npm run dev；交付仍在output/pdf/portfolio-ai-interaction-revised{,-light}.pdf。不部署、不改原产品，本人事实缺口无新增。

## 2026-11-14 网页版重做（Claude）

- 首页与四个案例页改由 `src/site/content.ts`（内容）和 `src/site/render.ts`（生成 HTML）输出，外壳是 `src/layouts/SiteLayout.astro`，样式与交互在 `public/site/site.css`、`public/site/site.js`。视觉方向仍按 DESIGN.md。
- 交互：首屏星群（随指针避让、按作品变形）、步骤播放器（积分与热量数字随步骤变化）、新旧版拖动对比、大图查看、案例间的转场。
- `/about/` 跳转到首页的“关于”。`/print/`、`/specs/`、`/assets-review/` 与 PDF 没有改动，仍用 `Block.astro`、`global.css`、`revision.css`。
- `npm run dev` 现在会先跑 `scripts/prepare.mjs`，保证新文案的字都在字体子集里。
- 尚未在本机跑过 `npm run build`；改动未提交，旧版首页与案例页可用 git 找回。
- 文案均取自 `portfolio.yaml` 与截图里能看到的内容，没有新增事实。
- PDF 版已按同一套设计重排：`output/pdf/王耀海-AI交互设计作品集.pdf`（25 页，1600×900，约 9 MB），并替换了 `public/downloads/portfolio-ai-interaction-revised.pdf`（旧版仍在 `output/pdf/` 同名文件里）。版式在 `src/site/print.ts` 与 `public/site/print.css`，星群图在 `public/site/sky/`。这份 PDF 是在 Claude 的云端环境用无头 Chrome 打印的，`npm run pdf` 仍会生成旧版式。
