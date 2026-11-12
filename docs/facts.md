# 事实与来源账本

核对日期：2026-11-12（Asia/Tokyo）。本文件连同 `audit-home.md`、`audit-f1.md`、`audit-personal.md` 构成逐项来源账本。页面内的来源编号指向这些文件。没有将示例简历或课程资料当作 Kai 的经历。

## 证据等级

- **B**：用户任务书中的信息/本轮直接指示。主文件 `PORTFOLIO_BRIEF.md`。
- **H / F / P**：对应仓库源码、配置或保留的提交记录；精确路径/行见下方审计文件。
- **S**：本轮只读截图，包含来源 URL/commit 的 `public/shots/*/manifest.json`。只证明截取时可见的 UI。
- **A**：由源码归纳的设计分析，页面必须标「分析草稿 · 待确认」，不是用户研究结论或本人原话。

## 基础事实

| 编号 | 表述 | 来源与边界 |
|---|---|---|
| B01 | 王耀海 / Kai Wang；作品集面向 AI 创新交互设计师 | 用户任务书 §1、§5；定位文案待 K01 |
| B02 | 三个产品都在 Codex 中制作 | 用户本轮明确指示；工具只写 Codex，不推断模型 |
| B03 | 教育与语言资料 | 任务书 §6.6，进一步与个人站源码 P 核对；准确性待 K16 |
| B04 | 理想之家独立设计与开发 | 任务书 §6.2 已核实定位；具体职责/时段仍待 K04 |
| B05 | Agent 视频存在但归属、主导程度和公开权限不明 | 任务书 §6.1；不得用候选代填 |
| B06 | 目标岗位和 JD 能力映射 | 任务书 §1；职位 URL 本轮可访问但浏览器文本提取为空，未追加“目前仍开放”的实时判断 |
| B07 | 原项目只读、不部署、不提交线上消息 | 本轮用户指示与任务书 §3 |

## 仓库映射

| 前缀 | 原仓库（只读） | 线上地址 |
|---|---|---|
| H | `/Users/youkaiou/Desktop/生活成长app` | https://home.youkai-ou.com/ |
| F | `/Users/youkaiou/Desktop/F1` | https://f1.youkai-ou.com/zh/home |
| P | `/Users/youkaiou/Desktop/个人介绍/portfolio-web` | https://youkai-ou.com/ |

Codex `list_projects` 核实项目路径；域名分别由各仓库部署配置或 README 核对。个人站实际 Git 根目录比 Codex 项目目录深一层。

## §6 对照与差异

- **H**：中文词汇以 i18n 为准，使用「今日手记、家具商店、未来的家、生活档案、灵感小屋、零钱包」。主产品名暂为「理想之家（名称待确认）」。技术为 React + Three.js + Vite + Dexie。线上 Cloudflare 禁用图片生成；不得写已可生成未来房间图像。
- **F**：根项目为 Next.js，线上客户端为 Vite + React + Cloudflare Worker。首页、方法、预测和升级页是 webOnly 导航上下文，不把整页数据传给 AI。最近已知真实问答诊断为 403；本轮不调用模型，不宣称恢复。全部细项见 audit-f1.md。
- **P**：原生 JavaScript，五主题及 AI fallback 以源码核对。个人站的 AI 产品经理措辞不复制到作品集。
- 任何 git 最早日期只表述为「现存提交记录始于」，不当作项目启动日；截图各自注明线上/归档/工作区。

## 素材与外部依据

- 自绘流程图和 `/specs` 来自代码结构，是本轮重建材料，**不是 Figma 设计稿**。
- 代码和提交记录不等于用户访谈、产品成效；不填任何效果数字、留存率或用户量。
- 官方赛车/车手/车队图仅在案例内页使用，图注注明原页面官方素材、权利归原权利人、非商业展示。封面/总览/案例头图均为自制排版/流程示意。
- 中文字体来源：[Noto CJK 官方仓库](https://github.com/notofonts/noto-cjk)，Sans/LICENSE 为 SIL Open Font License；本地 `public/fonts/OFL.txt`。
- Cloudflare Pages 单文件 25 MiB 上限，本轮核实：[官方 Limits](https://developers.cloudflare.com/pages/platform/limits/#file-size)。该限制用于视频脚本；未发生上传。

## 详细证据

- [理想之家逐项审计](audit-home.md)
- [围场智析逐项审计](audit-f1.md)
- [个人站逐项审计](audit-personal.md)
- 截图版本、步骤和回退限制见 `assets-*.md`。
