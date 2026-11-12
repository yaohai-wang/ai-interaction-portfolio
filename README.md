# 王耀海 · AI 交互设计作品集（修订预览版）

现有 Astro 工程的本地修订稿：**16 页、16:9 网页与 PDF**，面向 2027 届 AI 创新交互设计方向。原 22 页草稿和原始素材保留；本轮没有部署、公开发布或修改其他产品源码。

本版本仍是修订预览版。个人职责、实际项目周期、TasteTwin 素材公开许可及联系方式等缺口集中在 [docs/portfolio-evidence-gaps.md](docs/portfolio-evidence-gaps.md)。阅读页移除了内部 TODO，不代表这些事实已确认，也不代表已可正式投递。

## 本地预览

```sh
cd /Users/youkaiou/就职/portfolio
npm run dev
```

打开终端显示的地址，默认 `http://127.0.0.1:4321/`。

主要入口：

- `/`：封面与项目导航；`/about/`：简介。完整16页主稿在 `/print/`，案例正文也可分别阅读。
- `/cases/ideal-home/`、`/cases/agent/`、`/cases/pitwall/`、`/cases/desktop/`：四个案例。
- `/print/`：与 PDF 同序的 16 页打印稿。
- `/specs/`、`/assets-review/`：源码规格与素材审阅补充，不计入 16 页主稿。

查看构建产物：先 `npm run build`，再 `npm run preview`，使用终端显示的地址。

## 当前结构

| 页码 | 内容 |
|---|---|
| 1–2 | 封面、简介与项目导航 |
| 3–8 | 理想之家：问题假设、同一任务、积分与房间、恢复、迭代 |
| 9–12 | TasteTwin：规则边界、状态关系、条件修正、实际半份记录 |
| 13–14 | 围场智析：上下文范围、两次真实问答与来源边界 |
| 15 | 桌面平行宇宙：主视觉、主题对比、打开—切换—返回任务 |
| 16 | 现有演示入口 |

AI 辅助过程并入理想之家迭代页，没有为凑页数新增未经证实的决策过程。详细修改记录见 [docs/revision/change-log.md](docs/revision/change-log.md)，实际验证与逐页检查见 [docs/revision/validation.md](docs/revision/validation.md)。

## 编辑与构建

- `src/content/portfolio.yaml`：项目顺序、页面内容、图片、图注和链接。
- `src/content/schema.ts`：Zod 内容校验。
- `src/components/`：页面组件；`src/styles/revision.css` 是本轮主要网页/打印样式，`src/styles/global.css` 保留基础样式。
- `src/content/specs.yaml`、`src/pages/specs.astro`、`src/styles/specs.css`：规格补充页。
- `public/revised/`：本轮真实任务素材；各项目 `manifest.json` 记录来源、时间及裁切坐标。
- `public/shots/`、`public/video/`：保留的上一版素材；不要覆盖原图改字或伪造产品状态。

```sh
npm run build                  # 构建修订预览版并执行静态检查
npm run check -- --external     # 另用只读 GET 检查演示链接
npm run qa                     # 构建产物的 1440 / 1280 / 390 布局与基础交互检查
npm run pdf                    # 从当前 dist/print 导出修订 PDF
npm run pdf -- --light          # 导出低体积修订版
npm run specs                  # 可选：导出补充规格图与 SVG
```

修改内容后应先构建，再导出 PDF。PDF 脚本保留链接与嵌入字体；主版同步到本地网页下载入口。所有运行资源同域；本轮没有英文全文，英文入口只保留结构。

## PDF 与原稿

当前交付：

- `output/pdf/portfolio-ai-interaction-revised.pdf`：16 页修订预览版。
- `output/pdf/portfolio-ai-interaction-revised-light.pdf`：同内容的低体积修订版，已正式导出供本地审阅。
- `output/pdf/portfolio-ai-interaction-revised.pdf.json`：页数、文件大小、字体、内部跳转及外部链接记录。
- `public/downloads/portfolio-ai-interaction-revised.pdf`：本地站点下载副本。

原文件继续保留，修订导出不会覆盖它们：

- `output/pdf/王耀海-AI创新交互设计师-作品集-草稿.pdf`
- `output/pdf/王耀海-AI创新交互设计师-作品集-草稿-精简版.pdf`
- `output/pdf/M1-中文与链接-三页样张.pdf`

原稿哈希见 `docs/revision/baseline.json`；上一版页面数据保留为 `docs/revision/portfolio-original.yaml`。`--light` 输出名为 `portfolio-ai-interaction-revised-light.pdf`，已交付该版本，不会覆盖旧精简版。

macOS 下将导出的 PDF 逐页渲染为检查图：

```sh
osascript -l JavaScript scripts/render-native.js \
  output/pdf/portfolio-ai-interaction-revised.pdf tmp/revision/native
```

该命令只读 PDF，图片写入 `tmp/revision/native/`。检查结果分别见 `docs/revision/print-proof.json`、`pdf-layout-check.json`、`qa-report.json`（执行对应检查后生成），以及 PDF 同名 JSON。链接存在、链接可访问和业务功能可用是三项不同验证。

## 证据与复测边界

四个项目的内部事实记录分别为 `docs/revision-home-evidence.md`、`revision-tastetwin-evidence.md`、`revision-f1-evidence.md`、`revision-personal-evidence.md`。设计假设、本人事实缺口和建议新增功能不混同为已完成成果。

- 理想之家使用独立浏览器存档、合成输入和真实模型响应；积分含初始赠送，未将样板间冒充个人结果。
- TasteTwin 是本地规则交互原型，使用示例数据，不能写成真实模型推荐。
- F1 本轮两次真实问题成功；不再用历史 403 代表今天，也不据此声称所有答案正确或故障恢复已验证。
- 个人站真实验证了双入口、内容保留、主题切换和焦点恢复；未向个人 AI 分身发送消息，不声称阅读像素位置完全不变。

`node scripts/revised-personal.mjs` 执行只读任务；两个 `revised-*.mjs --derive` 分支只裁切现有 F1/个人站截图，不联网。`node scripts/revised-f1.mjs --send` 会重新发送两个真实问题并可能产生已有 API 用量；仅在对应明确授权内使用，普通预览、构建和 PDF 导出都不会调用模型。

## 环境与发布状态

本机需要 Node.js/npm、Python 3，以及 Google Chrome（可用 `CHROME_PATH` 指定）。迁移后可在本目录安装依赖和字体工具：

```sh
npm ci --cache ./tmp/npm-cache
npm run setup
npm run build
```

`setup` 会下载官方 Noto 字体并创建本地 `.venv`；字体许可证在 `public/fonts/OFL.txt`。使用已纳入工程的素材进行预览、构建和 PDF 导出，不依赖原产品仓库；重新采集历史版本才需要原仓库。

本轮**不部署**。`npm run build:release` 还会检查 `docs/revision/release-gate.json` 中的实质缺口；移除页面上的 TODO 不能解除发布限制。原 `docs/progress.md`、`docs/questions.md` 和 `docs/release-checklist.md` 保留为上一轮 M0–M5 记录，当前缺口以 `docs/portfolio-evidence-gaps.md` 为准。
