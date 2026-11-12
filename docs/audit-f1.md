# 围场智析：只读代码与历史审计

审计日期：2026-11-12。仓库：`/Users/youkaiou/Desktop/F1`。所有下述源文件路径均相对此根目录；这是本机代码审计，不等于线上运行验证。原仓库只读，未运行服务、未调用生成接口，未部署。

## 重要边界与任务书差异

1. 首页 `/zh/home`、方法、冠军预测、赛车升级等页面的助手是 `webOnly`：仅传导航上下文，不传整页证据。`hosted/lib/assistant/context.ts:70–87` 明确 `sources:[],webOnly:true`。本页/全站证据支持车队概览、车手、积分、赛果、新闻。不能声称“首页全部数据自动入模”。
2. `docs/ASSISTANT_DIAGNOSIS_2026-10-24.md:7–19` 记载最后找到的真实问答为 `provider_access / HTTP 403 / unsupported_country_region_territory` 且尚未恢复。之后维护成功不等于问答恢复。本次只读截图不能验证新回答。文案应写“交互与证据机制已实现；线上回答可用性待复测”。
3. 技术是双入口：根目录 Next.js 16 / React 19 / TypeScript；线上 `hosted/browser/` 为 Vite 静态 React 客户端，Cloudflare Worker + D1 + Queues 提供后端。来源 `package.json`、`hosted/package.json`、`hosted/browser/vite.config.ts:1–4`、`hosted/browser/main.tsx:1–36`、`hosted/scripts/build-free.mjs:9–12`。根项目 pnpm 11.25.0。
4. 原树已有大量未提交修改（最新文档到 2026-11-12），而 HEAD 为 2026-10-19。下文“当前代码”指工作树；历史 commit 只能证明对应提交时内容。git 日期不是项目实际起止日期。
5. 仓库中的“用户反馈”多指 Kai 对 Codex 制作过程的反馈，不能冒充产品终端用户研究。

## 仓库、版本与域名

| 事实 | 来源 |
| --- | --- |
| 域名为 f1.youkai-ou.com | `hosted/wrangler.jsonc:13,27` |
| 名称围场智析 / PITWALL | `src/components/Shell.tsx:11` |
| 页脚自称独立车迷项目 | `src/components/Shell.tsx:43` |
| 最早保留提交 dd728ff7c06a5e92643e8a9da4cb27ad38c753dc；2026-10-17 18:28:34 +09:00；baseline before 2026-10-17 fixes | `git log --reverse --format='%h %ad %s' --date=iso-strict` |
| HEAD 3d6f720；2026-10-19 12:04:46 +09:00；Handle assistant provider limits without day-wide lockout | `git log -1` |
| 最新已有部署记录为 2026-11-12 入口更新，版本 e9c3a9e0-167c-4d5d-bb17-f47902112c31 | `docs/CLOUD_DEPLOYMENT.md:3`；本任务没有执行部署 |

## 功能证据（覆盖任务书 §6.3）

| ID | 可陈述事实 | 文件/行来源 |
| --- | --- | --- |
| F1-01 | 中英双语，语言切换保留路由 | `src/lib/i18n.ts:1–7`，`src/components/Shell.tsx:38` |
| F1-02 | 主导航包含首页、全部车队、积分、新闻、赛车升级、赛果、冠军预测；方法入口在页头资料链接和页脚；还存在赛历、规则页 | `src/components/Shell.tsx:28–29,37,43`，`src/components/live/RealPageContent.tsx:53` |
| F1-03 | 当前本地 snapshot 有 11 支车队 | `data/live/snapshot.json` 的 `data.constructors` 长度。不要用 `src/config/team-themes.ts` 的十个主题误判，Cadillac 用 fallback |
| F1-04 | 当前本地已保存第 20 站，asOf 2026-11-08T17:00:00Z，fetchedAt 2026-11-11T07:19:13.385Z，256 次模拟 | `data/live/snapshot.json` 相应 JSON 字段。仅作核验，正文宜避免易过时赛事数字 |
| F1-05 | 全局助手为原生 modal dialog 抽屉，有顶部入口和解读本页入口 | `src/components/assistant/Assistant.tsx:35–47,97–108` |
| F1-06 | 抽屉顶部显示当前页面名称 | `src/components/assistant/Assistant.tsx:99` |
| F1-07 | 本页/全站/联网模式取决于可用 context；webOnly 页面只有联网 | `src/components/assistant/Assistant.tsx:49–52,94–99`，`hosted/lib/assistant/context.ts:70–87` |
| F1-08 | 空态每个范围显示三个建议问题；点击只填入输入框，不发送 | `src/components/assistant/Assistant.tsx:94,101` |
| F1-09 | 解读本页打开同一个面板并预填“总结本页”，未自动发送 | `src/components/assistant/Assistant.tsx:44–47,56–58` |
| F1-10 | 用户发送动作才 POST /api/assistant/chat | `src/components/assistant/Assistant.tsx:81–90,107` |
| F1-11 | 回答包含引用角标、可折叠来源、检索时间、发布时间或数据日期 | `src/components/assistant/Assistant.tsx:102,111–149`。代码机制并非正确率保证 |
| F1-12 | 页顶显示保存站次/日期，展开可见采集时间和赛果截止，过期显示保存状态 | `src/components/live/RefreshShared.tsx:14` |
| F1-13 | 预测页明示模拟次数、实验性、90% 区间、抽样误差、0/100% 不代表确定性、小样本回测局限 | `src/components/live/RefreshForecast.tsx:17` |
| F1-14 | 方法页公开来源、模型假设、未建模因素、概率不保证准确、官方素材权利声明 | `src/components/live/RealPageContent.tsx:49–51` |
| F1-15 | 开场可跳过与重播 | `src/components/RealIntro.tsx:102`，`src/components/Shell.tsx:43` |
| F1-16 | 全站有关闭动效开关并尊重 reduced-motion | `src/components/Shell.tsx:45–47`，`src/components/live/refresh.css:24,36`，`src/components/assistant/assistant.css:18` |
| F1-17 | 无完整快照显示“真实数据暂不可用”，不以 DEMO 填补；静态端读取失败显示重试 | `src/components/live/RealPageContent.tsx:53`，`hosted/browser/main.tsx:23,29` |
| F1-18 | 静态端读取 manifest 并核验内容 hash/schema；超过两小时或采集错误标为 stale | `hosted/browser/data.ts:9–12,29` |
| F1-19 | 中文正式功能名以源码为准：围场首页、全部车队、积分榜、围场新闻、赛车升级、世界冠军预测、方法与数据 | `messages/zh.json:5–11,30`；比赛赛果参见 `RealPageContent.tsx:53` |

## 从代码提取的设计规格

这些是现有实现的逆向整理，不是 Figma 设计稿。

| 类别 | 值 | 来源 |
| --- | --- | --- |
| 主强调色 | #39d3c1 | `src/components/live/refresh.css:3` |
| 旧全局强调色与浅色 | #20d3c5 / #90f0e3 | `src/app/globals.css:3` |
| 底色/面板/深底 | #081419 / #102329 / #0b1c22 | `src/components/live/refresh.css:3` |
| 文字/次级文字 | #eff3ed / #a2b8bb | 同上 |
| 提醒色 | #e5ba7e | 同上 |
| 卡/面板/控件圆角 | 24 / 16 / 12 px | `src/styles/glass.css:3–5` |
| 胶囊圆角 | 999 px | `src/styles/glass.css:6` |
| frame/tab/scope/input 内缩 | 8 / 4 / 3 / 6 px | `src/styles/glass.css:7–14` |
| 磨砂 | blur 28 px + saturate 170%；手机 blur 16 px | `src/styles/glass.css:15–16,372` |
| 材质 | 白色 6% 填充 / 12% 边框 / 8% 顶部高光 | `src/styles/glass.css:17,23,27` |
| 标题/正文 | h1 60 / h2 30 / h3 20 / 正文 15 / small 12 px | `src/components/live/refresh.css:4–5` |
| 间距 | section top 64 / grid gap 20 / section-head bottom 24 / panel padding 28 px | `src/components/live/refresh.css:6` |
| 助手尺寸/文字 | 桌面宽 480；标题 23 / 正文 15 / 建议 14 / textarea 16 px | `src/components/assistant/assistant.css:6,10,18` |
| 助手控件 | 发送 44×44；建议 min-height 52；scope min-height 40 px | `src/components/assistant/assistant.css:18` |

组件清单：SnapshotStatus、RefreshTitle、RefreshTabs、原生 Select、车队切片画廊、车手海报卡、积分条、90% 区间图、双栏升级面板、折叠来源、原生 dialog 助手、建议问题、输入/取消、错误/重试。分别对应 `RefreshShared.tsx`、`RefreshHome.tsx`、`RefreshStandings.tsx`、`RefreshForecast.tsx`、`LiveUpgradeExplorer.tsx`、`Assistant.tsx`。

流程：打开页面 → 注册页面与版本 → 打开助手 → 选择允许范围 → 输入/预填问题 → 用户发送 → 校验 context 并读取允许证据 → 回答与引用 → 用户追问/关闭。应分出“本页证据支持”和“仅导航上下文 webOnly”两条路径。

状态：空态 → 获取 context → 可输入 → thinking → supported / insufficient_evidence / needs_clarification / out_of_scope / data_stale / unavailable / provider_* / rate_limited。来源 `Assistant.tsx:12–27,58–68,74–108`。取消提示已发请求仍可能计次 `:92,103`；retryAt 冷却禁用重试和发送 `:59–68,105,107`；关闭 abort、旧响应隔离和焦点回归 `:41,73,83–90`。本轮不把全部分支称为运行验收。

## 代表性历史与迭代依据

| 提交 | 日本时间 | 内容与用途 |
| --- | --- | --- |
| 460ef77 | 2026-10-17 21:41:52 +09:00 | selected UI integration；A3 与 B1–B6 已完成，内页 P0–P10 尚未接入 |
| 1e17a79 | 2026-10-18 10:24:32 +09:00 | P10 connect refreshed routes；内页层级刷新完成 |
| 36e5c70 | 2026-10-18 15:13:02 +09:00 | 磨砂玻璃之前，适合 before |
| f7c61d3 | 2026-10-18 17:13:54 +09:00 | Apply approved rounded frosted-glass surfaces；适合 after |
| 3d6f720 | 2026-10-19 12:04:46 +09:00 | 按 provider 错误分类，替代整日锁死；当前 HEAD |

日期、标题来自 `git log --format='%h %ad %s' --date=iso-strict`。原树只读，旧版只允许 `git archive` 到 portfolio/tmp/history，在副本运行；不切原分支、不建原 worktree。

现有对照材料：`docs/screenshots/glass-refresh-2026-10-18/{before,after,production}/`；`docs/screenshots/ai-ui-simplify-2026-10-17/{before,after}/`；`docs/screenshots/ui-refresh-integrated/`。助手回答图部分是 UI fixture，不能当作真实生成或真实用户反馈。`design/prototypes/ui-refresh-pages-2026-10-18/` 是可运行独立样稿，不应冒充正式版本。

## 工作流事实与设计取舍

| 可证实的过程 | 来源 |
| --- | --- |
| Kai 要求先做图片/动画样稿，三个入口方向和 B1–B6 小样供选择 | `docs/UI_REFRESH_2026-10-17.md:3–7,20–50` |
| Kai 选择 A3、边框入口、五灯加载并关闭流体光标，后选择 B1/B2/B3/B4/B6 | `AGENTS.md` 的 2026-10-17 visual preferences 段 |
| 旧页问题：重复 AI 入口、9–10px 小字、数据层级弱、0% 条过多、阅读面割裂 | `docs/UI_REFRESH_PAGES_2026-10-18.md:16–23` |
| 各问题分别对应 P0–P10 可选方案 | 同文 `:29–39` |
| Kai 看过样稿后决定全部接入，P3 用深色；原画廊、海报、双栏结构保留 | `docs/UI_REFRESH_PAGES_PHASE2_DEPLOY_2026-10-18.md:3,9–13` |
| 扫 CSS/组件 → 建材质 token → 同心圆角 → 不逐行 blur → 透明度/能力降级 | `docs/GLASS_REFRESH_2026-10-18.md:15–43` |
| 桌面/手机、双语、键盘和回归证据保留；旧测试结果不能冒充本轮验收 | 同文 `:49–55` |
| 按真实错误分类，展示 Retry-After，由用户重试，不自动重试模型 | `docs/ASSISTANT_RECOVERY_2026-10-19.md:13–22` |

作品集草稿分析（待 Kai 确认）：页面减少用户重复输入背景的负担；引用与时间让证据可追溯；预测以区间和限制呈现不确定性。以上是对实现的设计解读，不是用户研究结论，不是性能或正确率承诺。

## 截图建议与限制

清单：/zh/home 首屏、首页季节速览、AI 助手空态、/zh/teams/ferrari、/zh/teams/mercedes/upgrades、/zh/championship、/zh/methodology。只点顶部 AI 助手打开空态，不发送。所有非 GET/HEAD/OPTIONS 与助手 API 均由捕获上下文阻断。等待实际 DOM、图像解码，不依赖 networkidle。

官方车图、肖像、标识出现在内页截图时，图注写“来源：围场智析界面；赛车/车手/队徽原素材来自 Formula 1 官方，权利归原权利人；非商业展示”。封面、总览、案例头图不要以这些素材为主体；建议用自制的页面/上下文/证据流程线图。

## 只有 Kai 能补充

TODO(Kai): 起因、真实目标用户、本人职责、实际项目起止时间。git 首次保留提交只证明记录存在，不能代替启动时间。

TODO(Kai): 真实使用者反馈与可公开例子；请区分自己对制作过程的意见和终端用户研究。

TODO(Kai): 实际使用的设计工具、Figma 文件、模型与人机分工，及是否认可三条设计解读的措辞。

TODO(Kai): 未来是否允许真实问答复测；本次不触发线上生成，不影响作品集连续构建。
