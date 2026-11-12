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
