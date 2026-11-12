# 王耀海 · AI 交互设计作品集

本地审阅草稿；没有部署。包含 Astro 静态网页版、22 页横版 PDF、精简草稿、只读素材管线与代码重建的设计规格。

## 本地预览

```sh
cd /Users/youkaiou/就职/portfolio
npm run dev
```

打开 `http://localhost:4321/`。主要入口：`/`、`/about/`、`/cases/agent/`、`/cases/ideal-home/`、`/cases/pitwall/`、`/cases/desktop/`、`/specs/`、`/assets-review/`、`/print/`。

生产静态预览：`npm run build` 后运行 `npm run preview`。

## 修改文案

- 所有叙事在 `src/content/portfolio.yaml`；`src/content/schema.ts` 用 Zod 校验。
- `/specs` 文案与代码规格在 `src/content/specs.yaml`，由页面内 schema 校验。
- 每块积木对应一页 PDF。角色、动机、公开权限等待本人确认项用 K 编号关联 `docs/questions.md`。
- 改字后运行 `npm run build`，会重新生成实际用字字体子集和本地二维码。不要直接覆盖截图写文字；标注坐标和文本在 YAML 中。
- 英文切换结构已预留 `data-locale` 和语言入口，本期未翻译。

## 脚本

```sh
npm run build                  # 草稿构建：允许 TODO 并显式显示
npm run check -- --external     # 内部链接/外域资源/图片预算 + 外部Demo只读GET
npm run qa                     # 1440 / 1280 / 390、键盘、视频、外域请求
npm run pdf                    # 22页草稿主版
npm run pdf -- --light          # 同内容，降低图片质量
npm run specs                  # 导出3张1920×1080规格图和SVG
npm run shots -- home          # 单站线上只读截图
npm run shots -- f1 --history   # 真实提交归档的截图（只写本目录tmp）
npm run shots -- personal --history
npm run video                  # 帮助；无参数不会处理未知源文件
```

`node scripts/process-agent.mjs` 重新生成 TasteTwin 的关键帧/联系表与来源记录。候选80秒片段的转码流程见 `docs/assets-qloo.md`。

视频当前仅为本地候选，使用示例数据；最终帧、剪辑与公开权限待 Kai 确认。源视频、原项目代码和存档不被修改。

## 输出

- `output/pdf/王耀海-AI创新交互设计师-作品集-草稿.pdf`
- `output/pdf/王耀海-AI创新交互设计师-作品集-草稿-精简版.pdf`
- `output/pdf/M1-中文与链接-三页样张.pdf`
- `docs/facts.md` / `audit-*.md`：逐项来源与限制。
- `docs/questions.md`：只需本人回答的问题。
- `docs/release-checklist.md`：完成情况与发布前待办。
- `docs/progress.md`：M0–M5 记录。
- `public/shots/*/manifest.json`：每张图的来源、日期、版本、图注。

主版导出后会同步到站点的本地 PDF 下载入口。

PDF 使用 Playwright Chromium，从同一 `/print` 路由导出，保留链接与字体。主版上限20 MB，精简版10 MB；每张JPG/WebP不超过400KB；视频小于25MiB。实际投递限制待确认。

## 迁移到另一台电脑

需 Node 22+、npm、Python 3、Google Chrome（可用 `CHROME_PATH` 指定）。依赖只装进本目录：

```sh
npm ci --cache ./tmp/npm-cache
npm run setup
npm run build
```

`setup` 下载 Noto 官方字体并安装本地 `.venv`；字体按实际用字做子集，许可证位于 `public/fonts/OFL.txt`。`shots --history` 还需要原始仓库及现存依赖；预览、构建与 PDF 使用已纳入版本管理的素材，不依赖原项目。

## 发布

不在本次执行。`npm run build:release` 会因未解决 TODO / 待确认而失败。先完成 `docs/release-checklist.md`，再按 Kai 确认的域名与 Cloudflare 方式操作；不得直接把本地草稿当作正式投递版本。

## macOS 原生 PDF 复核

```sh
osascript -l JavaScript scripts/render-native.js \
  "output/pdf/王耀海-AI创新交互设计师-作品集-草稿.pdf" tmp/qa/native
```

PDFKit 只读渲染，每页输出 PNG 及输入哈希报告。所有图片与临时文件仅写入 portfolio/tmp。
