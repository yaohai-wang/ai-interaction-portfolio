# 桌面平行宇宙素材 / M2

来源仓库：`/Users/youkaiou/Desktop/个人介绍/portfolio-web`。线上站：`https://youkai-ou.com/`。本轮没有改动原仓库、部署或向模型发送消息。

## 线上截图

`node scripts/capture-personal.mjs --live-only`；只重试面板可用 `--cards-only`。

统一中文locale、Asia/Shanghai时区、1440×900、DPR2。五主题通过底部原生按钮切换，每次回到全景，等待整组场景图片decode和ready，再截图；JPEG最大1920宽并压到400KB内，派生WebP也逐步压缩至预算。照片不加设备框。

| 成品（对应同名WebP） | 操作/内容 |
|---|---|
| `comic.jpg` | Comic，默认全景 |
| `cyberpunk.jpg` | Cyberpunk，同构图 |
| `pixel.jpg` | Pixel，同构图 |
| `blueprint.jpg` | Blueprint，同构图 |
| `retro.jpg` | Retro Computer，同构图 |
| `chat-empty.jpg` | 顶部「聊聊」，四个建议问题与800字计数空态 |
| `ideal-home-card.jpg` | 顶部「理想之家」，文字项目卡 |
| `f1-card.jpg` | 顶部「围场助手」，带现有产品快照的介绍卡 |

文件在 `public/shots/personal/`，完整来源/日期/图注见同目录`manifest.json`。初次从聊天面板切向理想之家时一次点击等待失败；加Esc关闭前面板后，三张面板已全部重新成功截图，没有触发聊天建议按钮。脚本级上下文阻止非GET/HEAD/OPTIONS请求，并额外阻止`/api/desk-chat`。没有填写、提交或点击建议问题。

## Git 历史尝试

从只读原仓库选择 `30c007c`（2026-10-11，初始可恢复）、`aea24b5`（2026-10-11，Safari遮罩与物件修订）、`0deaeef`（2026-10-12，五主题整合），以`git archive`导出到`tmp/history/personal-<commit>/`，不在原库切分支或建立worktree。副本使用仅GET/HEAD的临时静态服务器，API请求返回503，不运行原仓库会刷新缓存/读取env的serve.mjs。

原`.git/objects`存在大量iCloud `dataless`文件。第一轮完整dist导出`30c007c`在读取约205MB后超过240秒而失败；原完整归档尝试见`public/shots/personal/capture-report.json`。随后改为只归档Comic页面及实际依赖，成功还原并截图`30c007c`与`aea24b5`；`0deaeef`最小归档虽曾超时，但并行的完整归档随后成功，已静态运行并截图。重试结果见`history-minimal-report.json`及`capture-report.json`的resolutions/final字段。不把失败归档当成已运行版本，也不把未提交工作区误标为HEAD。

## 有来源的阶段对比

为保证失败时仍有真实迭代材料，读取原项目既有截图并保留SHA-256与文件修改时间：

- `history-existing-ten.jpg` ← `work/qa/desk-universes/unified-magazine-comic.jpg`：已有早期10主题/旧物件布局截图，非本轮Git恢复。
- `history-existing-five.jpg` ← `work/qa/five-theme-migration/overview-comic-final.png`：已有5主题UI迁移中截图，场景仍为固定风格；不是当前最终美术。
- `comic.jpg` ← 2026-11-12线上实测：5主题连场景与UI整体切换，顶部增加文字导航及项目入口。

已目视核对两张阶段图与线上Comic图。对比可说明「十主题拆分→共享五主题→场景和UI统一」，代码/决策记录为`DESIGN_SYSTEM.md:21–32,97–101`、`AGENTS.md:29–37`；不要把commit日期等同于截图实际日期，不声称这些截图是一场受控实验。

## 署名和用途

案例内部所有截图图注：`来源：Kai个人站界面截图；第三方角色形象与品牌标识权利归原作品及各权利人，非商业展示。` 全景含Spider-Man摆件、Nikon/Pepsi/F1等品牌物件，只作产品界面分析，不作为封面、作品总览或案例头图主体。早期素材含旧名字拼写、旧角色方向等，属于历史UI，不搬作本次人物信息。


## 最终 Git 还原结果

- `history-30c007c.jpg/webp`：2026-10-11 21:54:08 +09:00 的初始提交，已真实启动、等场景解码并截图；已目视检查。
- `history-aea24b5.jpg/webp`：2026-10-11 22:42:38 +09:00 的窗景遮罩与物件修订，已真实启动、等场景解码并截图。
- 三个旧提交与当前`comic.jpg`组成真实迭代对照。前两个提交仅导出实际Comic运行依赖，`0deaeef`使用完整dist归档；未改任何源码或原资产字节。最小导出中其他主题的后台预加载可能404，不影响已等待ready的Comic截图；不声称完整历史产品已全功能复验。
- 命令`node scripts/capture-personal.mjs --history-only --minimal-history`，默认已采用同样的最小归档；`--full-history`才尝试完整dist。
- 2张已有阶段检查截图保留在素材审阅页作为补充，叙事主对照优先选真实Git还原图。

- `history-0deaeef.jpg/webp`：2026-10-12 11:05:23 +09:00的五主题/个人模块整合提交；完整Git归档随后成功，已静态运行并目视检查。三个历史提交均有有效截图，最初的超时均已由明确重试路径解决。
