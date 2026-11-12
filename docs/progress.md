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
