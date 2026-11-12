# 桌面平行宇宙 · 本轮真实任务证据

实测日期：2026-11-12 13:57:16–13:57:57 UTC（日本时间 22:57）。真实入口 <https://youkai-ou.com/>。原仓库 `/Users/youkaiou/Desktop/个人介绍/portfolio-web` 只读；不修改产品、不部署。`scripts/revised-personal.mjs` 通过独立 Chromium context 执行实际点击、悬停和键盘操作，截图与事实来自线上响应，无 DOM/CSS 替换或截图拼接。

机器记录：`docs/revision-personal-results.json`。素材：`public/revised/personal/manifest.json`。

## 当前可确认结论

木屋物件与顶部“理想之家”文字按钮确实打开同一个 `#desk-dream-home-dialog` DOM 节点，正文一致、产品外链一致。Comic → Cyberpunk 切换期间该面板保持打开，正文哈希与外链不变；从面板“返回桌面”后保留 Cyberpunk 主题，场景相机恢复打开前位置。

本轮实际验证了木屋 hover 标签、主题选择器 ArrowRight 切换与可见焦点、返回按钮、Escape、焦点回到发起入口。不能外推为所有页面/主题/浏览器已经通过完整无障碍测试。

**阅读位置的真实限制：**切换前 `.dh-body.scrollTop=19`，切换后 `=9`，内容高度均556，容器高度从537变为547，均在各自可滚动区域底部。可以写“同一内容继续阅读”，不能写“像素位置精确保留”或“跨主题无任何布局变化”。不改原产品；若需要锚点级阅读位置保持，列为后续建议。

## 内部事实表

| 项目 | 分级 | 已核实内容或缺口 | 依据 |
|---|---|---|---|
| 项目性质 | 已有材料证实 | 已上线个人站；预渲染整间桌面图像 + DOM 物件热点 + 相机式平移缩放 + 五主题共享内容 | 原仓库 DESIGN_SYSTEM；本轮页面及主题状态 |
| 实际起止时间 | 本人尚需确认 | 历史 Git 日期仅证明保留记录，不代替实际工作周期 | `docs/audit-personal.md` |
| 目标用户/问题来源 | 设计假设 | 希望了解作者与项目的访问者；以物件探索辅以文字入口降低找入口成本，是基于实现的分析，不是已做用户研究 | 双入口代码和本轮任务，无访谈原始材料 |
| 我的职责/协作 | 本人尚需确认 | 公开产品介绍有“独立设计”等自述，但本轮未独立确认本人实际职责和协作分工，不能从代码推断全栈所有工作均本人独立完成 | `dist/desk-dream-home.js:8,14` 是页面自述，非外部证明 |
| AI 辅助部分 | 已有材料证实 + 本人尚需确认 | 用户已说明项目在 Codex 中完成；历史 AGENTS 记录参考和画风选择。具体本人决策及工具分工仍应引用对应记录 | `docs/audit-personal.md` 工作流；不倒推探索过程 |
| 已实现能力 | 已有材料证实 | 双入口同面板、保持内容切换主题、返回桌面、已测键盘与焦点行为 | 下述8步真实任务 |
| 验证记录 | 已有材料证实 | 1440×900、deviceScaleFactor 2、zh-CN、reduced-motion；本轮16项布尔检查通过，另记录阅读位置差异；无 pageerror | `revision-personal-results.json` |
| 演示入口/素材来源 | 已有材料证实 | 当前线上站，6张连续状态截图 + 3张来源可追溯像素裁切 | manifest 的 sourceURL/date/cropPixels |
| 效果提升 | 本人尚需确认 | 没有用户测试人数、任务耗时或成功率证据 | 不写提升转化、效率或用户偏好 |
| 后续用户任务 | 建议新增 | 让参与者先从木屋找到理想之家，再在打开时切换主题并返回，记录其是否发现文字入口与当前主题 | 尚无真实受试结果 |

## 实际任务与结果

1. 新隔离 context 进入桌面，默认 Comic；等待当前图层 `ready` 且场景、窗景图像真实解码完成。保存 `desktop-comic`。
2. 鼠标悬停木屋物件 `#dream-home-toy`，可见提示“理想之家AI产品”和热点边界。保存 `object-hover`；`object-hover-detail` 为其真实像素局部。
3. 点击木屋，打开 `#desk-dream-home-dialog`；`data-panel-open=dream-home`，焦点位于“返回桌面”按钮。保存 `project-comic`。
4. 面板正文可滚动19px；用真实鼠标滚轮到该区域底部，再点击当前 Comic 主题按钮并按 `ArrowRight`。实际切换到 Cyberpunk，场景 ready；面板仍打开、DOM 节点相同，正文 SHA256 与外链都不变。保存 `project-cyberpunk`，其中主题选择器有粉色3px键盘焦点环。`theme-keyboard-focus` 为该图真实局部。
5. 点击“返回桌面”。没有打开的面板；Cyberpunk 保留，焦点回到 `#dream-home-toy`。场景 transform 与起始相同：`matrix(1, 0, 0, 1, -720, -450)`。保存 `desktop-return`。
6. 点击顶部“理想之家”文字按钮 `#open-dream-home`，到达原有同一 DOM 节点；正文与物件入口相同、CTA 仍为 `https://home.youkai-ou.com/`。保存 `project-text-entry`；`text-entry-detail` 放大当前选中的文字入口。
7. 按 `Escape`，面板关闭，焦点回到 `#open-dream-home`；实际 outline 为粉色3px实线。
8. 全程没有打开/提交个人 AI 对话，没有点击产品外链、音乐播放或上传照片。所有非 GET/HEAD/OPTIONS 请求被拦截；本轮唯一观察到的被阻断 POST 是统计 `cdn-cgi/rum`。

三次打开/保持过程的正文 SHA256 都是：`e317e3d85e8612176a823542ba1d3c0b9c0865e39c7fe70344813eeee3a193d0`。此哈希只证明当前已读取内容一致，不证明任意状态都保持。

## 选图与叙事建议

主视觉使用 `desktop-comic`；三张真实连续状态用 `project-comic → project-cyberpunk → desktop-return`。文字入口同内容的证据为 `project-text-entry`，可用小图或补充图注。需要解释发现入口时，用 `object-hover-detail` 与 `text-entry-detail` 并列；两张来自实际状态，不能写成同一时刻的合成界面。

适合的主张：“物件入口负责探索，文字入口保留直接路径；换主题时，已打开的项目内容继续保留。”其中后半句本轮实测成立；前半句的“负责”是基于实现的设计解释，设计动机与本人角色仍待本人确认。

不要将项目面板中“持续结合用户反馈”“独立设计”等原站文案当作本轮已验证研究或个人贡献。该截图证明的是导航与状态保持，不是理想之家产品的 AI 闭环。图像中的第三方角色和品牌只作为原站界面背景，权利归原权利人，非商业展示。

## 精确源码依据

- 双入口共用同一实例：`dist/desk-universes.js:107–112`；项目物件 click 绑定 `dist/desk-dream-home.js:17–24`。
- hover 与焦点提示：`dist/desk-interactions.js:20–38`。
- 打开面板、记录发起入口、焦点到返回按钮：`dist/desk-interactions.js:94–107`。
- 返回关闭、恢复相机、恢复原入口焦点：`dist/desk-interactions.js:52–66`；Escape：`:118–123`。
- 选择器 `aria-pressed`、ArrowLeft/ArrowRight/Home/End 与焦点：`dist/ui/theme-switcher.js:22–31`。本轮只实际执行 ArrowRight，不能宣称其余键均实测。
- Provider 只更新主题属性/token并通知订阅者：`dist/ui/theme-provider.js:35–63`；场景图与UI共用主题：`dist/desk-universes.js:22–39,51–60`。
- 项目正文与CTA：`dist/desk-dream-home.js:6–16`。重新打开将滚动置零是`:19`的明确行为；本轮文字入口再次打开后也实际为0。

复跑：`node scripts/revised-personal.mjs`（仅只读真实UI操作）；`node scripts/revised-personal.mjs --derive` 只从现有截图裁切，不联网。所有新文件只在 portfolio，原项目树只读，未 build/部署。

## 单页右侧任务条裁切

新增 `task-open`、`task-themed`、`task-return`，每张来自原连续任务的一张完整截图，仅 sharp.extract，不拼图、不重绘。前两张使用同一像素框，仅保留导航、项目标题和返回入口，避开“独立设计”“用户反馈”等原站正文。第三张回到木屋入口对应的桌面区域。

| 文件 | 原单帧 | 原图裁切 left/top/width/height | 620px宽显示高度 |
|---|---|---|---|
| task-open | project-comic | 200 / 0 / 1720 / 360 | 130px |
| task-themed | project-cyberpunk | 200 / 0 / 1720 / 360 | 130px |
| task-return | desktop-return | 380 / 800 / 1340 / 300 | 139px |

JPEG/WebP均小于400KB，来源拍摄时间与裁切像素已写manifest。620px宽的实际预览已目视检查；主标题和主题变化可辨，返回按钮保持真实尺寸，没有为作品集改UI。预览文件仅为QA用途，在 `tmp/qa/personal-task-crops/`。`scripts/revised-personal.mjs --derive` 可重做这些裁切，不访问线上。

### 最终P15关键控件裁切修正

最终PDF审阅发现：前一组宽横条虽然能辨认项目主标题，但把远处的“返回桌面”按钮缩得过小。为保持现有112px图框高度，本轮另增两个更紧的真实单帧裁切，旧横条和原图不覆盖：

| 新文件 | 原单帧 | 裁切 left/top/width/height | 展示用途 |
|---|---|---|---|
| task-open-controls | project-comic | 1300 / 20 / 400 / 180 | Comic：顶部当前选中的“理想之家”项目文字入口，以及下方“返回桌面”按钮 |
| task-themed-controls | project-cyberpunk | 1300 / 20 / 400 / 180 | Cyberpunk：同一选中项目和返回按钮，主题样式改变 |

两张均是同一矩形的直接像素裁切，保留相邻导航和主题背景；没有将左侧H2标题与右侧按钮拼到一起。这里的项目标题取自实际选中的“理想之家”文字导航。正文中的“独立设计/用户反馈”等未核实自述不在裁切中。

保持比例按112px高显示时图像约249px宽；已在该真实展示尺寸下目视检查，选中项目与返回按钮文字可读。它们替换桌面页原来的两个任务图src，布局高度不变。JPG分别14,822 / 14,925字节，WebP分别8,504 / 9,388字节；manifest已记录原图、来源时间与cropPixels，`--derive`可复做。
