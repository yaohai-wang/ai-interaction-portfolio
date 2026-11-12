# 理想生活 / 理想之家：只读源码审计

审计日期：2026-11-12。仓库 `/Users/youkaiou/Desktop/生活成长app`；Codex 项目名「生活成长app」。当前 HEAD `78d0202737aea6abea7f7496a76ccb8154cbfe8e`（2026-10-18）。本审计未改源仓库、未发起 AI 请求、未提交线上表单。下列相对路径均相对此仓库；行号来自当前工作树。未发现该仓库内 AGENTS.md。`git status --short` 为空。旧文档有被新方案替代的部分，现行源码优先。

## 身份、范围与关键差异

| ID | 可写入作品集的事实 / 边界 | 来源 |
|---|---|---|
| HOME-01 | 正式域名为 `https://home.youkai-ou.com`，保留独立个人站。 | README.md:3-7；wrangler.jsonc:28-32；docs/cloudflare-validation.md:7 |
| HOME-02 | 源码产品名称「理想生活」，日文「理想の暮らし」。任务书沿个人站名称写「理想之家」；统一名称必须 TODO(Kai)。 | src/App.tsx:50；src/i18n/messages.json:3898-3900；PORTFOLIO_BRIEF.md §6.2 |
| HOME-03 | 技术栈是 React、TypeScript、Vite、Three.js、Dexie（IndexedDB）；Cloudflare Workers + Express 后端。包管理器 pnpm。 | package.json dependencies/devDependencies、packageManager；src/storage/db.ts:1、404、431；cloudflare/index.ts:1-10 |
| HOME-04 | 用户称三个项目均在 Codex 中完成；独立设计开发的口径由任务书提供，不能靠 git author 推导职责。 | 当前用户原话；PORTFOLIO_BRIEF.md §6.2 |
| HOME-05 | 部署版采用浏览器游戏存档；不是跨设备云存档产品。仓库虽然含 OAuth/账户同步本地实现，但不能将它当线上现有能力。 | cloudflare/index.ts:37-38、49-50；README.md「数据与备份」；docs/cloudflare-validation.md:50-51 |
| HOME-06 | 线上「未来的家」图像生成功能未启用，不能宣称可在线生成真实房间改造图。 | cloudflare/index.ts:51 `image:false`、:86 `/api/future-homes` 返回 503；docs/cloudflare-validation.md:70 |
| HOME-07 | 已有真实设计过程材料：PRD.md、DESIGN.md、UX-CONTRACT.md、整体改版实施方案.md、验收记录.md，以及浮岛原型、目标图、结果图。它们不是 Figma 文件。 | 上述文件；docs/design/welcome-island/CODEX_TASK.md:3-12 |
| HOME-08 | 首次 git checkpoint 是 2026-10-11，不能把它写成项目真实开始日；上线记录是 2026-10-12。 | commits 429ee53、c33c972；README.md:3；项目真实起止时间 TODO(Kai) |

## §6.2 功能逐条核对

| ID | 源码事实 | 来源 |
|---|---|---|
| HOME-10 | 核心循环：愿景 → 自然语言手记 → AI 候选行动 → 人勾选确认 → 计分 → 家具商店 → 布置房间。 | src/features/journal/JournalPanel.tsx:137-174、221-239；src/features/home/RoomHome.tsx:169-175；src/domain/economy.ts:15-31 |
| HOME-11 | 未保存有效愿景时，手记输入下方显示「先保存一份愿景，让这些行动有自己的方向」，提供「完善愿景」，不显示整理按钮。有效愿景同时要求摘要和目标。 | src/features/journal/JournalPanel.tsx:99、139-140、237-239 |
| HOME-12 | AI 生成候选后呈现「留下你确认做过的事」「勾选后才会保存并计分」；选中条目显示关联目标、积分说明与积分预览。 | src/features/journal/JournalPanel.tsx:222-232 |
| HOME-13 | 用户点击「保存所选并计分」后才调用 confirmDailySelection；返回后显示确认保存结果。 | src/features/journal/JournalPanel.tsx:153-174、220、232 |
| HOME-14 | 成长计分是确定性业务公式，不是让模型直接控制钱包余额：目标行动 min(50, 重要度×6+投入×4)，每天上限 160，照顾自己类每天上限 10，首次赠送 300 不等同成长结果。 | src/domain/economy.ts:3-5、15-20；src/domain/life-journal.ts:10-45；README.md「当前可用范围」 |
| HOME-15 | 欢迎页为可拖动的 3D 浮岛，显示本地日期和季节，可跳过入场。 | src/features/welcome/WelcomePage.tsx:52-65、102-131；src/features/welcome/island/WelcomeIsland.tsx:58-84 |
| HOME-16 | 欢迎页实现减少动态效果偏好；房间在背景挂载但使用 inert，过渡完成后恢复交互。 | src/features/welcome/WelcomePage.tsx:12、28-32、57-58、71-79；welcome.css:81-84 |
| HOME-17 | 主场景 RoomWorld 支持小人行走；当前源码视角标签为「室内、整栋、第一视角」，并非任务书写的「全屋、第一人称」。 | src/features/home/RoomHome.tsx:107、142、151-153 |
| HOME-18 | 「拍照」打开 PhotoPanel。 | src/features/home/RoomHome.tsx:153、158-163；src/features/home/PhotoPanel.tsx |
| HOME-19 | 当前底部 9 入口：样板间、愿景板、今日手记、家具商店、布置房间、未来的家、生活档案、灵感小屋、零钱包。 | src/features/home/RoomHome.tsx:31-37、155 |
| HOME-20 | 任务书的「今日日记、家具店、未来之家、生活记录、生活小贴士、钱包」与现行源码不完全一致；页面文案应改用 HOME-19。 | 同上 |
| HOME-21 | 支持 zh/en/ja；先读保存的选择，否则 navigator.language 为 ja→ja、en→en，其他→zh。 | src/i18n/index.ts:4-15、20-25 |
| HOME-22 | 欢迎页写明「数据仅保存在此浏览器中」；源库 Dexie 默认数据库 ideal-life-v1。 | src/features/welcome/WelcomePage.tsx:123；src/storage/db.ts:404、431-432；线上限制见 HOME-05 |
| HOME-23 | 样板间 `/#/showroom` 是现有评审入口，不更改玩家房间/家具/积分；不需要发 AI 请求。 | README.md「我的房间布局」；src/features/home/RoomHome.tsx:143、150 |
| HOME-24 | `?roomLayout=...` 会一次性改变该账号房间，是配置操作；自动截图不要使用。 | src/App.tsx:33-44；README.md「我的房间布局」 |
| HOME-25 | 日记草稿持久保存；候选可放弃返回输入；处理时可以回房间。 | src/features/journal/JournalPanel.tsx:28-67、176-180、233-241 |
| HOME-26 | 未知结果使用「查询原结果」；请求身份被保留，不自动再次生成。 | src/ai/task-coordinator.ts:63-107；src/features/journal/JournalPanel.tsx:233 |
| HOME-27 | 任务状态 pending/running/unknown/received/failed/saved/abandoned；saved 和 abandoned 不可被旧响应复活。 | src/domain/ai-operations.ts:48-61 |
| HOME-28 | 结果不可用显示具体错误；草稿保留，用户可返回输入重新整理；源码区分 failed 和 unknown。 | src/features/journal/JournalPanel.tsx:222-243；src/ai/task-coordinator.ts:28-52 |
| HOME-29 | 当前中文方向无障碍标签通过「向{p0}移动」拼接翻译。日文「右」实际映射为「そうだよ」，任务书疑虑有源码证据，但属 M6，不在本次修改。 | src/features/home/RoomHome.tsx:152；src/i18n/messages.json:3482-3484、3934 |

## 可直接生成的设计规格

下面是代码提取的实现规格，不是原始 Figma 设计，也不是 Kai 已确认的设计理由。

### 核心流程

`保存愿景（摘要 + 目标） → 写手记 → 显式提交 AI → 候选行动 / 积分说明 → 勾选确认 → 本地事务保存 + 计分 → 家具商店 → 布置房间`

AI 介入点：JournalPanel.tsx:145-150；人工确认点：:153-160、224-232。显示输出从自然语言转换成候选清单，再由确定性规则映射为成长积分；家具兑换与布置由用户操作。

### 状态图

- pending → running：用户显式开始请求。
- running → received：收到已完成结果，显示待确认清单。
- running → unknown：通信失败、原结果未确认，显示查询原结果。
- running/unknown → failed：服务端失败或可明确归因的拒绝。
- received → saved：用户选择后提交成功。
- pending/running/unknown/received/failed → abandoned：用户放弃/返回重新整理。
- saved、abandoned 为终态，不允许旧异步响应覆盖。

来源：src/domain/ai-operations.ts:48-61；src/ai/task-coordinator.ts:22-52、63-107。图中“用户确认”是 received→saved 的必经交互，AI 状态轮询不能直接给手记积分。

### 组件清单

| 组件 | 实际职责 | 来源 |
|---|---|---|
| WelcomePage / WelcomeIsland | 日期季节、入口、拖动浮岛、可跳过过渡 | src/features/welcome/WelcomePage.tsx；island/WelcomeIsland.tsx |
| RoomHome / RoomWorld | 室内主场景、导航、视角、状态、功能挂件 | src/features/home/RoomHome.tsx:92-180 |
| ModuleShell | 当前任务模态层与主滚动区 | src/components/ModuleShell.tsx；refined-ui.css:52-58 |
| VisionPanel | 愿景整理和保存 | src/features/vision/VisionPanel.tsx；RoomHome.tsx:169-172 |
| JournalPanel | 输入、等待、候选确认、结果、历史更正 | src/features/journal/JournalPanel.tsx:13-20、214-245 |
| ShopPanel | 商店搜索分类、购买、立即摆放 | src/features/shop/ShopPanel.tsx；RoomHome.tsx:174 |
| FurnishPanel | 房屋/家具编辑、预览、会话撤销 | src/features/home/FurnishPanel.tsx；RoomHome.tsx:157 |
| PhotoPanel | 取景、快门、预览、保存 | src/features/home/PhotoPanel.tsx；RoomHome.tsx:158 |
| Showroom | 独立样板间参观 | src/features/home/Showroom.tsx；RoomHome.tsx:143 |

### 当前实际生效的令牌（不能只抄旧 tokens.css）

`src/features/home/refined-ui.css:2` 覆盖全局旧青蓝色 token。因此主案例强调色宜选 `--primary:#617460`，不是旧 `tokens.css:3` 的 `#176A73`。

| 类型 | 值 | 来源 |
|---|---|---|
| 主色 | #617460 | refined-ui.css:2 |
| 墨色 | #393e35 | refined-ui.css:2 |
| 弱化文字 | #7a8074 | refined-ui.css:2 |
| 画布 | #f7f6ef | refined-ui.css:2 |
| 卡片 | #fffefa | refined-ui.css:2 |
| 线条 | #e0e2d7 | refined-ui.css:2 |
| 危险 | #a34b3f | refined-ui.css:2 |
| 主按钮 | #647a59；hover #546b49 | refined-ui.css:63-64 |
| 卡片/小圆角变量 | 18px / 10px | refined-ui.css:2 |
| 弹层圆角 / 内边距 | 22px / 24px | refined-ui.css:54-58 |
| 图标按钮 / 任务按钮最小点击高 | 44px | refined-ui.css:15、61 |
| 模块标题 | 20px / 600 | refined-ui.css:56 |
| 模块正文 | 15px / 1.6 行高 | refined-ui.css:58 |
| 次级标题 / 按钮 | 18px / 14px | refined-ui.css:60-61 |
| 表单网格间距 / 动作间距 | 16px / 10px | refined-ui.css:86、69 |
| 欢迎品牌绿 / 按钮绿 | #637860 / #5b6f58 | welcome.css:15、28、31 |
| 欢迎标题 | clamp(34px,4.1cqi,56px)、600、1.24行高 | welcome.css:26 |
| 欢迎主按钮 | 14px 圆角、58px 高 | welcome.css:31 |
| 字体源栈 | PingFang SC, Microsoft YaHei, Noto Sans CJK SC, sans-serif | src/styles/tokens.css:36 |

规格页应将“源产品字体是系统字体栈”和“本作品集采用自托管开源中文子集”区分。

## git 时间线与迭代对比候选

全部当前 main 历史只有以下 9 个提交。日期为 git author date（+09:00），只证明该提交时间。

| commit | 日期 | 原始提交说明 / 可述事实 |
|---|---|---|
| 429ee53a7fe0f709ac6de5790dd96d1b5c4f87e7 | 2026-10-11 12:36:50 | chore: checkpoint current Ideal Life app；已有完整产品快照，不能称当天从零开始 |
| d6f598f | 2026-10-11 | feat: connect fixed AI routing and validate room render layouts |
| bdc6b979257ffe61ac9d766e8cab2c64226882cc | 2026-10-12 | feat: prepare existing Ideal Life app for Cloudflare Workers AI |
| 9cc0ff4ae02ffb359712c98ced89daaf71d7fb1b | 2026-10-12 | docs: record GitHub initialization and verified Cloudflare preview |
| 46b19f5174280db6005da4947b8e6e6812c8fdd7 | 2026-10-12 | docs: distinguish manual CI validation from pending automatic deployment |
| c33c9725197f10769321215c468b9bba84cad44c | 2026-10-12 | docs: record approved Cloudflare production release |
| 97bd65f66589096a0d6da9d5979e04638b8e17d9 | 2026-10-17 16:00:49 | feat: publish showroom navigation and welcome language switching |
| 8c468d46adf603a31a01431e6e93aec0f35535be | 2026-10-18 22:44:37 | feat: replace welcome entrance with floating island |
| 78d0202737aea6abea7f7496a76ccb8154cbfe8e | 2026-10-18 23:05:37 | style: make showroom entrance smaller and less prominent |

建议 3 个旧版本：`429ee53`（最早 checkpoint/旧欢迎页）、`97bd65f`（浮岛改造前）、`8c468d4`（浮岛已完成、样板间入口尚未弱化），分别与 HEAD 对比。`git archive` 导出到 portfolio 内临时目录后再装依赖/启动，不能在原仓库执行 install、build 或换分支。使用 archive 副本的 Vite 纯前端即可截图空态（新浏览器上下文，不导入真实用户数据）；拦截 POST 并阻止模型调用。原库 `node_modules` 不能当可写缓存。

### 可准确写的对比说明

- **旧小屋入口 → 左文案、右浮岛。** 真实变更由 `97bd65f → 8c468d4` 支持。任务材料明确要求去掉玻璃卡片、独立浮岛可拖动、保留语言和进入/跳过功能；来源 docs/design/welcome-island/CODEX_TASK.md:18-23。可以写“保持入口能力，重做场景与构图”；不能写“提升留存/转化”。
- **显眼样板间入口 → 次级参观入口。** `8c468d4 → 78d0202`，原始提交文字为 make showroom entrance smaller and less prominent。只能证明视觉层级调整；背后用户反馈或研究动因 TODO(Kai)。

## 可证实的 Vibe Coding 工作方式

1. **把视觉要求写成可执行规格。** 浮岛任务同时给 prototype.html、桌面/手机目标图；要求色值、布局、交互照样稿迁移，并排除评审工具条。来源 docs/design/welcome-island/CODEX_TASK.md:3-12、25-43。
2. **约束改动边界。** 同任务要求保留多语言/路由/进入房间逻辑，不改室内和其他页面；来源 :18-23、58-62。
3. **处理实现差异。** 样稿 three r128 与产品 r186 的颜色管理/物理光照及 shader 差异有明确适配说明；来源 :45-55。
4. **验收包括结构检查和视觉对比。** 本地 1440×900 / 390×844 截图对比，并测拖动、点击、语言、进入和跳过；来源 :64-75。
5. **区分模拟验证与真实调用。** docs/cloudflare-validation.md:35-52、63-71 明确测试覆盖、真实模型样例和未启用功能。不能把 mock 成功写成全部 AI 效果验证。
6. **迭代有可追溯提交。** 2026-10-17 增样板间，10-18 重构浮岛，再弱化参观入口，见 git 时间线。提交 author 多为 Codex，仅证明工具提交，不足以推断 Kai 手写比例。

作品集第21页可表述为“给出场景与边界 → 用原型/截图明确目标 → Codex 实现 → 本地操作与对图 → 记录证据再提交”，标为“由仓库材料归纳，待 Kai 确认”；不能虚构使用过 Figma 或具体模型辅助编程。

## 截图操作清单（只浏览，不提交）

统一：1440×900、DPR2、locale zh-CN、timezone Asia/Shanghai；新隔离上下文。任一 request.method 不为 GET/HEAD/OPTIONS 应拦截，任何 AI endpoint 尤其 POST 不放行。不要点整理、保存、购买、备份恢复、布局应用。测试路由以 `#` 为前端切换；打开空态本身可能初始化隔离浏览器的本地存档，不影响原用户资料。

| 输出名 | URL / 操作 | 等待条件 |
|---|---|---|
| home/welcome | `/` | `.welcome[data-assets-ready=true]`；canvas非黑；稳定后截 |
| home/room | `/` → 点「跳过动画」 | `.entry-stage[data-entry-active=false]`；`.home-game`可见；canvas有内容 |
| home/journal | 入房后 `#/goals` | `.journal-panel`；文本“今天，做了哪些小事？” |
| home/vision | `#/life` | `.module-shell--life`；愿景表单可见，不填写提交 |
| home/shop | `#/shop` | `.module-shell--shop`；商品预览 img complete；不购买 |
| home/furnish | `#/furnish` | `.furnish-dock`；只截初始编辑面板，不移动/保存 |
| home/whole-house | `#/space` →「视角与楼层」→「整栋」 | 弹层关闭、3D完成渲染 |
| home/first-person | `#/space` →「视角与楼层」→「第一视角」 | 弹层关闭、3D完成渲染 |
| home/showroom | `#/showroom` | Showroom场景完成；可参观，不写主存档 |
| home/archive | `#/archive` | `.module-shell--archive`可见 |

注意：旧版跳过按钮文字/DOM 不同，可用包含“跳过”的 accessible name；手机版跳过默认隐藏，要点「进屋坐坐」并等待转场。`WelcomePage.tsx:131` 桌面跳过含末尾空格。当前 CSS `.home-game.home-refined` 是可靠的房间挂载选择器。AI 结果截图缺失时保留真实空态 + 源码状态图；不能用伪造对话冒充真实结果。

## TODO(Kai)（只问本人知道的内容，不因缺失停工）

- 项目统一名称：理想生活或理想之家。
- 实际起止时间、角色边界及用到的设计/编程工具；本地 git 最早只是 checkpoint。
- 为什么开始做、目标人群、观察到的问题与真实反馈；源码不能证明用户研究。
- 核心设计判断与取舍是否符合本人意图，尤其浮岛改版和弱化样板间入口的原因。
- 可公开的 AI 输入/结果示例或录屏；当前任务未发任何 AI 消息。
- 是否有 Figma 文件、草图或其他可公开原始设计材料。
- 真实 AI 质量评估与用户测试结论；现有记录只支持少量合成样例验证，不能推广到长期质量。
