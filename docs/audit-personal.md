# 个人站只读审计 / M0、M2 素材依据

审计日期：2026-11-12（Asia/Tokyo）。项目：桌面平行宇宙。本文是仓库证据清单，不等于 Kai 已确认新的作品集文案或发布授权。

## 仓库、入口与证据边界

- Codex 项目目录为 `/Users/youkaiou/Desktop/个人介绍`；真实 Git 仓库为其下的 `portfolio-web/`，下文路径均相对该仓库。
- 正式域名 `https://youkai-ou.com`：`AGENTS.md:58`、`README.md:5`；预览域名与 Cloudflare 部署方式也在该处记录。域名映射是仓库记录，本次未触发部署。
- `package.json:1–18`：原生 ES Modules，无 npm dependencies；`npm run dev` 调用 `node scripts/serve.mjs`；默认端口 4173，可设 `PORT`。源码在受 Git 管理的 `dist/`。本地桌面入口 `/desk-universes.html`，`build:pages` 将其映射为正式首页 `/`，旧人物页保留于 `/profile`（`AGENTS.md:59`）。
- 桌面技术不是运行时 WebGL/Three.js 3D：它是 Blender 完整场景预渲染图 + DOM 投影热点 + 相机式网页拖移缩放。`DESIGN_SYSTEM.md:11` 明确区分。旧人物验收页使用本地 three.js，不能移作当前桌面栈的描述。
- 当前分支 HEAD `9c10322`（2026-10-13 11:33:35 +09:00）；本地全分支最新为合并提交 `e38245a`（2026-10-13 11:37:27 +09:00）。最早记录 `30c007c`（2026-10-11 21:54:08 +09:00）。这些是可见 Git 记录窗口，不是项目实际开始/结束时间。
- 本次发现大量既有未提交工作：`dist/desk-universes.html/.js`、`desk-layout.js`、`desk-scene-themes.js`、新闻/天气快照等已修改；F1 物件、F1 项目卡、附加导航/游戏模块等为未跟踪文件。不得用 HEAD 截图冒称当前工作区或线上现状。三个版本分别标为「commit 历史版本」「本地工作区」「线上实测」。

## §6.4 功能逐条核对

| ID | 可核对的事实 | 文件依据 | 作品集用法/边界 |
|---|---|---|---|
| P01 | 一张可拖动、缩放的桌面，全景重置与操作说明 | `dist/desk-universes.html:76,83,96`；`dist/desk-camera.js` | 用「空间式导航」描述，不说实时三维渲染 |
| P02 | 键盘/鼠标进入 AI 分身；木屋进入理想之家；赛车进入围场助手；另有相册、音乐、个人介绍、研究、游戏 | `dist/desk-universes.html:48–59` | F1/键鼠等当前工作区新增，按工作区事实记录 |
| P03 | 顶部同时提供文字导航 | `dist/desk-universes.html:63–78` | 可分析为物件入口与文字入口并行，不把分析说成 Kai 已确认的设计动机 |
| P04 | 五主题为 Comic、Cyberpunk、Pixel、Blueprint、Retro Computer | `dist/ui/theme-registry.js:16,26,36,47,57` | 中文正文保留这些专有名词 |
| P05 | 同一 Provider 同时驱动主题 tokens、整间室内和窗外图像 | `dist/ui/theme-provider.js:35–63`；`dist/desk-scene-themes.js:1–10,127–158`；`DESIGN_SYSTEM.md:7,99` | 同构图与共享业务状态是有代码依据的核心取舍 |
| P06 | 音效可关，主题底部按钮可直接选择 | `dist/desk-universes.html:80–83`；`dist/ui/theme-switcher.js:7–25` | 截图使用按钮，不点击品牌/角色物件 |
| P07 | 主题默认 Comic，选择保存在 selectedUniverse | `dist/ui/theme-registry.js:89–99`；`dist/ui/theme-provider.js:28–50` | 可在本地隔离浏览器环境设定，不改原站 |
| P08 | AI 空态四个建议问题 | `dist/desk-chat-content.js:5–10`；`dist/desk-chat.js:128–135` | **不要点击建议问题**：click handler 直接 submit()，会发消息 |
| P09 | 输入上限 800 字；清空当前对话 | `dist/desk-chat.js:4,113,143,275–276` | 可只展示空态与字数计数 |
| P10 | AI 回答基于公开资料；连接不可用标预设回答 | `dist/desk-chat.js:153,186–195` | 文案是实际界面事实；未发送消息，不声称本次观察到真实回答质量 |
| P11 | 预设回答不会进入下一轮模型上下文 | `dist/desk-chat.js:7–14`；`dist/desk-chat-content.js:20` | 可作为上下文边界分析，标「代码归纳」 |
| P12 | 支持停止回答，未完成回答有说明 | `dist/desk-chat.js:146,197–205,273` | 代码证据，不在生产模拟触发 |
| P13 | 主题载入失败可重试；两张图解码完成后才显示；递增 revision 防止旧请求覆盖新主题 | `dist/desk-scene-themes.js:55–158`；`DESIGN_SYSTEM.md:99` | 可画状态图，不编造访谈发现 |
| P14 | 减少动态偏好覆盖主题时长 | `dist/ui/theme-tokens.css:42–55`；`DESIGN_SYSTEM.md:157–159` | 当前作品集也应尊重系统偏好 |

## §6.6 公开背景、差异与隐私边界

| ID | 来源内容 | 依据 | 采用建议 |
|---|---|---|---|
| B01 | 王耀海 / Kai Wang；东京科学大学建筑结构工程硕士在读；预计 2027 年 3 月毕业 | `dist/desk-about-content.js:3,6–7` | 可以引用任务书及这个公开文案；专业正式名称让 Kai 最终核对 |
| B02 | 日本大学建筑工程本科 | `dist/desk-about-content.js:7` | 旧 `dist/content.js:78,81` 写「建筑学科 · 工学学士」，不是冲突但命名粒度不同，不自行推断官方学位名 |
| B03 | 中文母语、日语 N1、TOEIC 805 | `dist/desk-about-content.js:6` 与 `dist/content.js:81,84–86` 相互一致 | 数字来源明确 |
| B04 | 华为开发者 AI 助手相关实习项目；RAG、Agent Workflow、产品需求设计、AI 回答质量评测 | `dist/desk-about-content.js:4,7` | 任务书允许写入，但实习公开范围仍须 TODO(Kai)，不自动增加内部截图/评测数字 |
| B05 | 旧人物页写 AI 客服、AI 产品经理实习、所参与产品已上线 | `dist/content.js:20–35` | 是站点公开叙述，不替代实习证明与简历；本作品集避免扩大其贡献边界 |
| B06 | 理想之家、AI 营养健康管理应用、AI 个人网站 | `dist/desk-about-content.js:4,7` | 营养应用不擅自添加为第五项目 |
| B07 | 职业方向为 AI 产品经理 / AI 应用开发 | `dist/desk-about-content.js:6`；`dist/desk-about.js:10` | 与本次 AI 交互岗位目标不同，不照搬到作品集，不改原站 |
| B08 | 新看板写 ENTJ，旧人物内容写 INTJ | `dist/desk-about-content.js:6` vs `dist/content.js:148–157` | 本作品集无必要加入 MBTI，避免制造无关冲突 |
| B09 | 个人站代码公开邮箱和微信 | `dist/desk-chat-content.js:12–13` | 任务书要求 Kai 确认本作品集可公开联系方式，因此暂不用具体值；保留 TODO(Kai) |
| B10 | 个人站旧内容声称「20余名用户试玩」及家具不足反馈 | `dist/content.js:41,46,49` | 本次未查到原始用户反馈证据；不要新增这个数字。TODO(Kai): 是否有可公开记录与具体迭代对应；没有则删用户反馈成效 |

`docs/KAI_ABOUT.md:3,7,15` 表示七章文案源于历史确认稿；`AGENTS.md:15` 也记录 Kai 对第三人称和建筑结构背景的选择。这是源仓库的历史记录，不把其中旧发布/操作授权带入本任务。

## 可用于 M2 的真实历史

以下 `git show` / `git log` 信息均来自原仓库，只读：

| commit | 日期（+09:00） | 原始提交标题 | 素材价值 |
|---|---|---|---|
| `30c007c` | 2026-10-11 21:54:08 | Prepare private portfolio with isolated Cloudflare environments | 最早可恢复版本；旧桌面十主题（需实际启动核验）与后续五主题对比 |
| `aea24b5` | 2026-10-11 22:42:38 | Fix Safari desk masking and update shelf and news monitor | 中间版本，窗景遮罩与桌面物件修正；可与初版同构图对比 |
| `0deaeef` | 2026-10-12 11:05:23 | Publish integrated five-theme portfolio and personal modules | 五主题、个人介绍、音乐、理想之家等整合；适合做主要 after |
| `fb6e425` | 2026-10-13 11:06:26 | Refresh news on entry and recover unavailable news sources | 新闻刷新语义迭代；无需将数据更新细节放到案例主视觉 |
| `9c10322` | 2026-10-13 11:33:35 | Prefetch news immediately when entering the website | 页面进入即预取；可作为工作流事件 |

建议选前三个旧版本，分别 `git archive <commit>` 导出到 portfolio 内 tmp 路径或任务临时目录。本地启动各自 `node scripts/serve.mjs`，只读静态画面。未提交的最新 F1 美术不在历史 archive，当前对照优先使用线上截图并明确出处。旧版本启动失败要记录，不通过改原仓库修复。Git 日期只能证明记录发生时间，不能据此写「两天独立完成整站」。

## 截图配置建议（无需模型调用）

统一 `locale: zh-CN`、`timezoneId: Asia/Shanghai`、1440×900、deviceScaleFactor 2。站点脚本进入页面会发新闻 GET 预取，打开聊天只会做状态 GET；不要点击建议问题或提交 textarea。

当前版本：
1. 打开 `https://youkai-ou.com/`（本地使用 `/desk-universes.html`）。
2. 五套同构图分别选择 `.ui-universe-button[data-theme-id="comic"]`、`cyberpunk`、`pixel`、`blueprint`、`retro`。主页面选择器在 `#style-nav` 下，避免与弹窗内复制按钮匹配冲突。
3. 每次点击 `#reset-view` 恢复同一全景；等待 `#current-layer[data-scene-status="ready"][data-scene-theme="..."]` 可见、`#scene-image` 与 `#window-image` 解码完成，再等主题过渡结束。等固定短时间不能替代 ready。
4. 文件建议 `personal/comic.jpg`、`cyberpunk.jpg`、`pixel.jpg`、`blueprint.jpg`、`retro.jpg`。
5. `#open-chat` 打开 AI 空态，截图 `personal/chat-empty.jpg`；**不要点击 `.dc-suggestion`，不要填表或按 Enter**。
6. 回到桌面 `#open-dream-home` 打开介绍卡，截图 `personal/ideal-home-card.jpg`。
7. 当前工作区/线上若存在 `#open-f1`，打开介绍卡，截图 `personal/f1-card.jpg`；旧历史不存在则记录。
8. 需要审阅背景可点击 `#open-about`，只读页面，但不要把邮箱、微信自动放进作品集。

主图与拼图保持广角，以桌面构图/多主题为叙述中心。Spider-Man 摆件、Nikon、F1、Pepsi 等是第三方角色/品牌物件，不用作封面或作品总览主体。案例内图注：`来源：Kai 个人站界面截图；其中第三方角色与品牌标识权利归原权利人，非商业展示。`

## 设计 tokens 与组件（从实现提取，不称 Figma 稿）

来源 `dist/ui/theme-registry.js`：

- 全局间距 `4/8/12/16/24/32px`；控件最小尺寸 `44px`；面板内边距 `24px`（第 9 行）。
- 正文 `1rem`，辅助 `0.875rem`，标题 `1.75rem`，行高 `1.65`（第 10 行）。这套个人站使用系统字体，不适用于新作品集必须自托管开源字体的要求。
- 层级 nav/panel/popover/feedback=`10/20/30/40`；动效 `120/220/600ms`（第 11–12 行）。
- Comic：surface `#FFF4D6`，text `#17171C`，primary `#BD2636`，accent `#FFD43B`；3px 边框；control/panel 圆角 `3px/4px`（第 16–21 行）。本案例强调色可取 `#BD2636`。
- Cyberpunk：surface `#191731`，text `#EAFBFF`，primary `#50E8F3`；1px 边框；panel 圆角 `2px 16px 2px 16px`（第 26–31 行）。
- Pixel：surface `#F6EACB`，text `#18382F`，primary `#24744D`；2px 边框；无圆角（第 36–41 行）。
- Blueprint：surface `#153C67`，text `#F1F8FF`，primary `#F4D44D`；1px 边框；无圆角（第 47–52 行）。
- Retro：surface `#D7D8CF`，text `#20262B`，primary `#58498F`；2px 边框；panel 圆角 1px（第 57–62 行）。

组件：Button/IconButton、Tabs/Navigation/Tooltip、Panel/Card/ContentSection、Dialog、Input/Textarea、Loading/Empty/Error、ChatWindow/MessageBubble；见 `DESIGN_SYSTEM.md:118–130`，实现分布 `dist/ui/components.css` 与各 `desk-*.js/.css`。五主题按钮具 aria-pressed、键盘方向键/Home/End（`theme-switcher.js:22–31`）。

可画「代码归纳」流程：物件/文字导航 → 相机聚焦 → 共享面板 → 返回/Escape → 相机与焦点恢复；主题变化只替换 tokens 与图像，不重置业务内容。状态：idle → loading → ready；loading → error → retry；新选择使旧请求 stale；dispose 取消。每个结论标来源，不写成先验用户研究结果。

## 第 21 页工作流的真实依据

- `AGENTS.md:23,25,27,29,31,33`：有明确的画风反馈、逐次修订、参考保留与 UI 冻结要求。可概括为「先定构图与验收边界，再独立生成主题，检查热点与 UI 未被破坏」。不把这些文档自动归为 Kai 本人的逐字原话。
- `AGENTS.md:37,51` 与 `DESIGN_SYSTEM.md:21–32`：十主题退役、共享 Provider、分阶段适配与验证；历史验收数字有文档，但本次不重新运行原站测试，不宣称当前全量已通过。
- `docs/KAI_ABOUT.md:3,23–31`：先确认局部设计稿、接入共享面板、发现顶部入口缺失后补入口、再做不同视口/主题/键盘检查。可用作可追溯的「反馈 → 改动 → 验证」例子。
- Git 五主题整合提交 `0deaeef`、新闻修复 `fb6e425`、进入即预取 `9c10322` 与 AGENTS 最新约定相互印证。
- 已能确认工具：Codex 来自用户本次陈述；原生 JS、Blender/预渲染、Cloudflare 来自代码与文档。Figma、具体模型名称及 Kai 使用程度仍须本人确认；不能把工程依赖当作 Kai 熟练掌握的工具。

## TODO(Kai) 待确认

1. 这个案例的正式角色、实际项目起止时间与投入范围（Git 窗口不能代替）。
2. 是否认可「空间导航 + 共享主题 + 透明 AI 边界」作为设计叙事，以及最初的问题/目标读者。
3. AI 分身为什么选择这四个建议问题、是否有真实反馈；没有则不写研究或效果结论。
4. 对外职业定位句、实习公开范围与可公开联系方式。
5. 理想之家是否有可公开的试玩记录与家具选择不足等原始反馈；本稿先不采用人数。
6. Figma、Blender、图像模型等实际本人使用情况；作品集工具栏只写已确认项目。
