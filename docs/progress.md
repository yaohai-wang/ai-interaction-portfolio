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
