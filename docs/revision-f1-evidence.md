# 围场智析 · 本轮事实与实际问答证据

复测：2026-11-12 13:52 UTC（日本时间 22:52）。入口：<https://f1.youkai-ou.com>。原仓库 `/Users/youkaiou/Desktop/F1` 只读。执行脚本 `scripts/revised-f1.mjs`，机器记录 `docs/revision-f1-results.json`，截图索引 `public/revised/f1/manifest.json`。

## 当前结论

本轮两个真实界面提交均返回 HTTP 200 / `supported`。因此，2026-10-24 诊断的 provider 403 只能作为历史记录，不能代表今天。本轮确认的是两个指定问题可完成；没有完成广泛回答质量评测，也没有复现当前服务失败。

可以保留“上下文范围”与“实际回答、来源、边界”两页；不应声称完整可信问答能力或所有页面数据都会进入模型。首页问题的回答实际说明不能查看首页实时内容，再转向联网资料；这是真实的范围边界，不能标成服务故障。若另需失败/恢复图，仍缺当次实际失败素材。

## 内部事实表

| 项目 | 分级 | 已核实内容或缺口 | 证据 |
|---|---|---|---|
| 项目性质 | 已有材料证实 | 可访问的 F1 信息产品，含保存数据、页面证据与联网问答；本轮两例问答成功 | 本轮真实接口/UI记录；原仓库 README、hosted、src |
| 实际起止时间 | 本人尚需确认 | 可见 Git 窗口不是实际周期；不据此写完成天数 | `docs/audit-f1.md` 历史记录 |
| 目标用户 | 设计假设 | 希望从赛季信息继续追问依据的 F1 读者；没有本轮用户研究 | 尚无访谈或任务观察原始材料 |
| 问题来源 | 设计假设 | 不同页面具有不同证据范围，容易产生“助手已读取整页”的预期；此为基于实现的分析 | 本轮 context 对照，非用户反馈 |
| 我的职责/协作关系 | 本人尚需确认 | 不能凭作者、依赖或最终代码推断个人承担全部设计/开发 | 待本人确认 |
| AI 辅助部分 | 已有材料证实 + 本人尚需确认 | 用户确认项目在 Codex 中完成；具体本人判断、选择与工具分工需单独材料 | 用户陈述；不从依赖推断技能 |
| 已实现能力 | 已有材料证实 | 车队页提供本页/全站/联网；首页仅联网；问题、回答、可展开来源、数据或检索时间均可见 | 下列两次真实 UI/接口记录 |
| 验证范围 | 已有材料证实 | Chromium、1440×900、独立 context，每页仅一次发送，共2次，没有自动重试 | `revision-f1-results.json.totalChatRequests = 2` |
| 演示入口 | 已有材料证实 | `/zh/teams/ferrari`、`/zh/home` | context与POST实测 |
| 素材来源 | 已有材料证实 | 当前线上真实UI截图及其像素裁切，没有注入回答或替换接口 | manifest 中时间、sourceURL、cropPixels |
| 后续用户测试 | 建议新增 | 给读者一个积分问题，请其先解释当前范围，再找出回答依据与数据时间；只记录实际观察 | 目前没有测试人数/成功率 |

## 例1：车队页证据回答

- 当前页：<https://f1.youkai-ou.com/zh/teams/ferrari>，显示“法拉利 · 车队概览”。
- `GET /api/assistant/context`，`scope=page_only`，HTTP 200。返回 `scopes=[page_only,site_only,web]`、`configured=true`、`webConfigured=true`、`live=false`。
- 保存数据时间 `2026-11-08T17:00:00Z`；抓取时间 `2026-11-11T07:19:13.385Z`。不能把二者写成这次测试时间或实时赛果。
- 实际发送：“仅依据本页资料，法拉利在当前保存的 2026 赛季快照中排名第几、多少积分？请给出数据时间并引用来源；没有资料就直说。”
- 真实 `POST /api/assistant/chat` 一次，HTTP 200，`status=supported`，`effectiveScope=page_only`。
- 实际回答：“法拉利在保存的 2026 赛季快照中排名第 2，积 510 分。数据时间：2026-11-08 17:00 UTC。”
- 返回一条来源 `team-ferrari`，链接 <https://www.formula1.com/en/results/2026/team>。来源对象含 `season:2026, position:"2", points:"510", wins:"2"`；答案的排名、积分、时间与该返回证据对应。
- 这例没有返回逐句 `citations` 数组；界面用“来源 · 1”折叠区展示来源，而非逐句索引。来源展开时原样显示 JSON 证据，这是当前实现，未替换成设计稿。
- 界面实际警告：“快照资料，非实时”。

推荐素材：`evidence-detail`（问题+回答）、`evidence-scope`（范围）、`evidence-sources-detail`（回答+展开来源）。完整场景以 `evidence-context` 或 `evidence-sources` 作定位图。

## 例2：首页只有导航上下文，真实联网回答

- 当前页：<https://f1.youkai-ou.com/zh/home>，显示“围场首页”。
- `GET /api/assistant/context`，`scope=web`，HTTP 200。返回 `webOnly=true, scopes=[web], configured=true, webConfigured=true, live=false`。仅显示页面名不等于模型读取整页。
- 实际发送：“当前围场首页的 2026 赛季法拉利积分是多少？请说明你实际依据的是联网来源还是本页证据，给出来源与数据时间；若无法核实请直接说明。”
- 真实 POST 一次，HTTP 200，`supported`，`effectiveScope=web`；`search.provider=OpenAI`，检索于 `2026-11-12T13:52:33.156Z`。
- 实际回答先说明：“我无法查看‘围场首页’的实时页面内容，因此不能确认本页显示的积分。”之后声明依据联网来源，并将 F1 榜单的 510 与 FIA 圣保罗资料的 504 分区分为不同时间资料。
- 返回两个可点击引用，响应中 `citations` 的区间分别关联两个 `sourceId`，界面渲染为 `[1]`、`[2]`：
  1. <https://www.formula1.com/en/results/2026/team>
  2. <https://www.fia.com/sites/default/files/2026_gp_sao_paulo_media_kit_eng_1.pdf>
- 两个网络来源的 `publishedAt` 均缺失，界面如实显示“未提供发布日期”；`retrievedAt` 为本次检索时间。回答里“今日抓取”的措辞是实际模型输出，不应在作品集叙事中升级为已验证的原文发布日期。
- 本轮核对了回答中的引用映射与来源栏；没有独立读取原始官方页面及 PDF 来重新核验 504/510 的外部事实。作品集宜描述“返回了这两条引用，并区分时间”，不替模型回答背书。
- 没有服务失败、`insufficient_evidence` 或错误恢复截图。不得把“无法读取首页内容”改写为 API 失败。真实下一步是使用可用联网范围并核对来源，本次没有修改或新增界面提示。

推荐素材：`web-only-scope`、`web-only-answer`、`web-only-sources-detail`；完整回答与界面为 `web-only-detail`、`web-only-sources`。两条来源均未提供发布日期，这是明确可展示的边界。

## 可公开主张与不可外推范围

- 可说：两个指定页面的范围不同；本轮真实问答成功；车队页答案可对应保存快照；联网回答有两条索引引用；来源时间与检索时间区分显示。
- 不可说：整个网站都已读取、所有回答已验证正确、实时数据、全面可靠、自动修好了历史403、没有错误、故障恢复本轮已验证。
- 需要改进的可见点仅作为建议：本页来源区当前显示原始 JSON；网络回答的“今日抓取”不应被读者误当发布日期。尚未改变原产品。

## 方法、复跑与审查记录

`node scripts/revised-f1.mjs --send` 会按明确本轮授权重新发送两个问题，可能产生已有 API 用量，默认无此参数不运行；本轮只执行一次、总计2个请求。`node scripts/revised-f1.mjs --derive` 只处理已有截图，不联网。裁切固定于此次已检查的图，未来不同回答需重新目视检查裁切边缘。

首轮执行被自动批准审查按旧 AGENTS 的“先确认具体问题”条款拒绝，拒绝时没有发送。随后核对用户本轮附件 §1.4/§6.1–3 与 AGENTS 新优先规则，重新提交相同受限动作获得通过。没有绕过审查；不购买、不部署、不改凭据或数据配置。记录中去除签名 contextId，不保存密钥。所有非授权 POST（如统计）均拦截。

原代码范围依据：`hosted/lib/assistant/context.ts:24–30,70–87`；UI 范围/请求/来源展示 `src/components/assistant/Assistant.tsx:49–52,74–108,111–149`。代码只能解释机制，当前可用性以此次实际响应为准。
