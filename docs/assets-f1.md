# 围场智析素材记录

完成日期：2026-11-12。输出目录：`public/shots/f1/`。来源仓库 `/Users/youkaiou/Desktop/F1` 全程只读；所有归档、运行缓存、截图和说明均在 portfolio 内。没有部署、改 DNS、切换原分支、建立原 worktree、发送问题或提交表单。

## 线上截图

`node scripts/capture-f1.mjs` 可复跑；可用 `F1_SHOTS=assistant-empty,forecast` 选择部分，`F1_BASE_URL` 改只读来源。复用 `scripts/browser.mjs` 的安全 context、settle、capture；F1 为二维界面，使用正常 Chromium 渲染，未强制 WebGL 软件渲染。视口 1440×900、deviceScaleFactor 2、locale zh-CN、Asia/Shanghai，系统偏好 reduce。最终图片压至宽 1920；JPEG 用于打印，WebP 用于网页。

完成 9 张：

| 文件 | 画面与操作 |
| --- | --- |
| home | `/zh/home`，实际页面与图像就绪后首屏 |
| home-overview | 同页滚到 `.bento`，上移 110 px 保留标题 |
| assistant-empty | 首页顶部 AI 助手按钮，仅打开空态；只读 context GET 允许，没有发送消息 |
| team | `/zh/teams/ferrari` 车队概览 |
| upgrades | `/zh/teams/mercedes/upgrades` 赛车升级 |
| forecast | `/zh/championship` 首屏与不确定性说明 |
| forecast-interval | 同页滚到 `.interval-panel` |
| methodology | `/zh/methodology` 数据来源与模型 |
| methodology-rights | 同页滚到 `#workers-ai` 附近 |

`manifest.json` 为完整素材数组，每条含 title、sourceURL、date、caption、kind、image、webp。`capture-report.json` 记录最终 9 张成功，失败 0。截图过程中站点自身尝试的 Cloudflare RUM POST 已被阻断；没有 AI chat POST，没有输入/发送/提交动作。`noSubmittedMessages` 只统计生成端点，不能把被阻断的统计请求误称为用户发消息。

第三方素材只在案例内页使用；统一图注：来源为围场智析界面，赛车/车手/队徽原素材来自 Formula 1 官方，权利归原权利人，非商业展示。封面、总览和案例头图不应将官方赛车/人物/品牌作为主体。

## 真实历史迭代对比

`node scripts/capture-f1-vite-history.mjs` 可重新构建并捕获以下两个版本，或用 `F1_VITE_COMMITS=36e5c70` 单独运行。脚本通过 git archive 读取原仓库，副本只写入 `tmp/history/f1-<commit>/`，没有更改原始页面代码。运行依赖只读引用本机已有的 hosted node_modules，未在原项目安装依赖。

| 文件 | 来源 | 说明 |
| --- | --- | --- |
| history-36e5c70-home | `36e5c70`，2026-10-18 15:13:02 +09:00 | 磨砂圆角前的真实 Vite 客户端 |
| history-f7c61d3-home | `f7c61d3`，2026-10-18 17:13:54 +09:00 | 磨砂圆角后；提交标题 Apply approved rounded frosted-glass surfaces across the site |

两版均从各自提交的 `hosted/data/initial-data.json` 读取原公开 seed。只读本地 HTTP 适配器为原客户端提供 manifest 和 seed 文件，替代必须启动 Worker/D1 的读端；关闭助手，绝不生成回答。页面显示时钟均固定为 2026-10-18T00:00:00Z，历史数据原样保留。源代码、文案、布局、样式未补写或修饰。官方远程图像依然按历史代码引用，不承诺远程 URL 的字节与 2026-10-18 完全相同。

可据此讲述的变化：直角卡片 → 24/16/12 px 的同心圆角与磨砂分层；原布局、赛车切片和数据层级保留。原因与性能取舍来自原仓库 `docs/GLASS_REFRESH_2026-10-18.md:15–43`；不声称这一视觉改变提高了留存、满意度或其他未测量指标。

`history.json` 保存 2 张历史元数据；`vite-history-report.json` 保存 2 个 captured 状态。旧版 `460ef77` 也已按 git archive 导出并尝试 Next/webpack 运行：服务 Ready 后首次页面编译长时间不返回，已停止该副本，未将失败页用作素材。`history-report.json` 保留终止后连接失败记录。`1e17a79` 作为额外核对点导出但未用于最终视觉素材。最终对比使用两个成功运行的 Vite 历史版本，无需仓库既存截图或 fixture 回答替代。

## QA 与边界

11 张 JPEG 与 11 张 WebP 均小于 400,000 字节。最终 JPEG 约 89–229 KB。已查看首页、助手空态与历史首屏；其余画面合为 `tmp/qa/f1-contact-sheet.jpg` 做视觉检查。图片不是黑屏、加载器或浏览器错误页面。

助手空态只能证明页面与上下文界面可显示。`docs/audit-f1.md` 已注明首页仅 webOnly 导航上下文，以及最近仓库诊断的真实问答故障；本轮未消耗接口额度来证明问答恢复。未修改原产品、原仓库密钥、账号、额度或部署配置。
