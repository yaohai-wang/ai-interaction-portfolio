# /specs 设计规格来源与使用

2026-11-12 从只读源代码提取；不是 Figma 设计稿，不证明 Kai 已确认全部设计判断。内容集中于 `src/content/specs.yaml`，页面在 `src/pages/specs.astro`，样式仅在 `src/styles/specs.css`。页面模块内用 Zod 校验结构、三份规格数量、每份四步流程、四类令牌、颜色格式、引用的来源 ID 与状态边的端点。

## 使用

- `/specs/`：三份规格和完整源码索引；桌面纵向浏览，390 px 下逐段阅读。
- `/specs/?sheet=tastetwin&canvas=1`：TasteTwin 单页画板。
- `/specs/?sheet=ideal-home&canvas=1`：理想之家单页画板。
- `/specs/?sheet=pitwall&canvas=1`：围场智析单页画板。
- `canvas=1` 且屏宽大于800时，每份画板固定1920×1080、内边距96；浏览器打印每份一页。只选一份时其余被隐藏。手机始终改为可读的纵向排版。
- 单页入口不部署、不上传。可以本地截图后由 Kai 导入 Figma 整理；不得把本页称为已完成的 Figma 文件。

页面引用如 `T3:30`，对应当前项目源码索引里的 T3 文件第30行。代码存在压缩长行时，行号仍按原文件保留，未虚构细行号。各表给出选定的实际实现值，不宣称已经建立完整全产品 token 系统。

## TasteTwin

根目录 `/Users/youkaiou/Desktop/Qloo/design/live-2d`。先读 `docs/audit-qloo.md`，再核对下列源文件：

- T1 `style.css`：第1行包含基础文字色、背景、h1、`.glass` 圆角和卡片内边距；第7-8行覆盖 muted/border/玻璃材质，第11行的 `.brand .twin` 才是品牌绿 #4d703b。不能把旧26 px blur 说成当前材质，现行覆盖是32 px / 140%；本规格不展示 blur。
- T2 `flow.css`：11 流程栏22 px内边距；14 模块标题15 px；15按钮18 px圆角；18输入9 px圆角；20操作组8 px间距。第24行 max-width:1200 媒体查询另将流程栏padding改为18 px；表中采用桌面1440范围。
- T3 `recommend.js`：9/16方案与结果；26加入计划；27本地延时与results状态；28本地关键词识别；30计划确认/取消/移出/撤销事件。这里没有调用真实大模型，不把“AI建议”样式称作模型能力验证。
- T4 `store.js`：41-49按planId去重以及eaten/planned统计；87-91添加计划、修改份量、删除/恢复、确认已吃。图的 planned/eaten 是数据状态；`planEdit: eat` 是 UI 的临时确认状态，removePlan 是删除对象行为。图不是虚构的服务端 Agent 状态机。
- T5 `profile.js:19-21`：保存、取消与输入更新；T6 `forecast-model.js:1-10`：demo-placeholder 与不确定性边界。

状态图主要表达“计划 → 核对实际餐次/份量 → 已吃”，并显示取消/移出/撤销。没有将用户尚未确认的计划纳入已吃，也没有把任意状态标为绝对不可逆终态。eaten 的外框用于强调已确认状态，不代表代码禁止后续删除餐次；完整关联逻辑在 store.js。

## 理想之家 / 源码名理想生活

根目录 `/Users/youkaiou/Desktop/生活成长app`。来源先经 `docs/audit-home.md` 核对，本轮复读了状态机与现行CSS。

- H1 `src/domain/ai-operations.ts:48-61`：全部状态迁移白名单与saved/abandoned终态保护。
- H2 `src/ai/task-coordinator.ts:22-52,63-107`：响应失败/未知/完成的归类；一次显式POST；恢复沿原身份GET，不重复提交。图省略同状态自循环和部分跨状态路径，保留核心循环与失败/未知分支。
- H3 `src/features/journal/JournalPanel.tsx:137-174,214-245`：愿景前置、输入、候选与人工确认。
- H4 `src/features/home/refined-ui.css:2,52-69,86`：真实生效的室内覆盖token、弹层与控件。原全局 tokens.css 的旧青蓝色不用于本规格主色。
- H5 `src/features/home/RoomHome.tsx:92-180`：RoomWorld、模块与导航；H6 `src/domain/economy.ts:15-31`：确定性计分/经济规则；H7 `src/components/ModuleShell.tsx:1-20`：单任务模态层。

图聚焦“今日手记”的操作，不把 future 图像操作的自动接收保存分支套用到行动计分。`received → saved` 在手记中需用户选择并确认。其他活动状态也可以abandoned，图只保留一条代表路径；完整白名单在H1。当前线上未来的家图像生成未启用，浏览器本地存档也不是跨设备同步。

## 围场智析

根目录 `/Users/youkaiou/Desktop/F1`；完整审计见 `docs/audit-f1.md`。原树已有未提交更改；这里引用审计时工作树，不将HEAD当最新线上完整版本。

- F2 `src/components/live/refresh.css:3-6`：当前页面色彩、标题/正文和网格间距。
- F3 `src/components/assistant/Assistant.tsx:12-27,35-108,111-149`：状态label、context、输入/发送、取消/重试、引用。
- F4 `src/styles/glass.css:3-14`：24/16/12 px圆角及同心内缩。
- F5 `src/components/live/RefreshShared.tsx:14`：来源/时间状态；F6 `src/components/live/RefreshForecast.tsx:17`：概率边界与区间。
- F7 `hosted/lib/assistant/context.ts:70-87`：首页/方法/预测/升级属于webOnly导航上下文；sources为空，不能声称已读取整页证据。

状态图是现有React变量/结果状态的交互归纳，非完整服务端状态机：空turns、loading、supported、unavailable、cancelled、rate_limited。没有省略真实服务商失败的限制，也不把取消等同于撤销已发生的服务端成本。图中rate_limited不直接连到新调用，文字明确等待retryAt后由用户重试；本轮没有发送任何线上问题。

## 校验交接

本子任务不运行 build、不修改 global.css 或其他agent源文件、不提交。交由主任务统一构建与浏览器QA，重点检查1920×1080单页边界、390 px阅读、打印页数和字体子集。状态图附title/desc，令牌使用带表头的table，来源表可读；页面所有请求同域。
