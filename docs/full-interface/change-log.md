# 完整界面截图调整记录

日期：2026-11-13。依据用户最新要求「多展示整个界面，不要只截一小部分」，在现有黑色 Design-dna 版式上调整图片选取与展示。修改前的17页内容数据保存在 `content-before.yaml`；当前内容为18页。本记录描述已写入源码的改动，不代替最终构建、PDF导出或逐页验收报告。

## 展示方式

- 案例正文移除只包含一段文字、单个数值、条件标签或局部按钮的碎片裁图，改用已有完整模块面板或完整产品视窗。保留原图片、裁切版本和来源 manifest，未重绘产品界面或修改原图文字。
- 总览缩略图由横向 `cover` 裁切改为 `contain` 等比例完整显示，避免只剩人物腿部、局部桌面或一条界面横带。正文图片也保持原比例，不以填满容器为由切掉内容。
- 比较页主要采用两张完整状态图。压缩重复说明，把关键数值与操作关系写在图下，给完整界面留下更大面积。
- 网页截图支持点击放大，包含适应窗口与原尺寸查看；原图链接保留为无脚本时的入口。PDF继续使用完整截图，放大查看属于网页交互，不冒称PDF内也有相同弹窗。
- 黑色、轻字重、紫色主动作、琥珀标记和封面三角星云保留；本轮不重做产品视觉。

## 页数与顺序

| 页码 | 调整后内容 |
|---|---|
| P1–2 | 封面与四项目导航；总览完整显示图片 |
| P3–8 | 理想之家：样板间、设计假设、完整手记面板、兑换与样板间、查询与放弃、版本比较 |
| P9–12 | TasteTwin：完整推荐页、状态合计、条件修正、份量与已记录餐食 |
| P13–15 | F1：完整产品首页、完整页面与助手的范围比较、完整回答与来源 |
| P16 | 桌面平行宇宙：一张完整桌面主视觉、项目介绍与演示入口 |
| P17 | 桌面平行宇宙：Comic / Cyberpunk两张完整项目内容界面 |
| P18 | 联系与现有演示入口 |

原P16不再同时挤入主桌面、四张主题缩略图、三张任务裁图和说明。主题与内容保持拆到P17，末页顺延至P18。没有增加未经证实的项目成果。

## 图片替换映射

以下路径以 `public/` 为根；“完整面板”与“完整产品视窗”分别标明，不能混称为浏览器全屏。

| 页面 | 原展示 | 调整后展示 |
|---|---|---|
| P5 手记与核对 | `revised/home/08-vision-saved-focus.jpg`、`11-real-candidates-focus.jpg`、`12-selection-reviewed-focus.jpg`，另有输入短条 `09-journal-input-focus.jpg` | `revised/home/09-journal-input.jpg` + `12-selection-reviewed.jpg`：完整「今日手记」模块外壳，包含标题、关闭入口、正文、候选与主操作 |
| P6 积分与空间 | `revised/home/13-confirmed-points-detail.jpg`、`16-purchased-focus.jpg` + 样板间 | `revised/home/16-purchased.jpg` + 保留 `showroom-dining.jpg`：完整家具商店成功面板与完整预设样板间产品视窗 |
| P7 异常与恢复 | `revised/home/21-offline-unknown-detail.jpg`、`22-after-query-detail.jpg`、`23-abandoned-input-focus.jpg` | `revised/home/22-after-query.jpg` + `23-abandoned-input.jpg`：完整候选面板与完整输入面板；标题改为「找回结果后，也能主动放弃」 |
| P10 状态关系 | `revised/tastetwin/06-planned-totals-nutrition.jpg`、`09-result-totals-nutrition.jpg` | `revised/tastetwin/06-planned-totals-full.jpg` + `09-result-totals-full.jpg`：完整推荐页，保留场景、导航和合计所在位置 |
| P11 条件修正 | 小定位图 + `revised/tastetwin/02-parsed-focus.jpg`、`03-corrected-focus.jpg` | `revised/tastetwin/02-parsed-full.jpg` + `03-corrected-full.jpg`：两张完整条件页 |
| P12 份量确认 | `revised/tastetwin/05-plan-one-focus.jpg`、`07-confirm-half-focus.jpg`、`10-recorded-food-focus.jpg`、`09-result-kcal-focus.jpg` | `revised/tastetwin/07-confirm-half-full.jpg` + `10-recorded-meal-full.jpg`：完整份量确认场景与摄入详情页 |
| P14 回答范围 | `revised/f1/evidence-scope.jpg`、`web-only-scope.jpg` | `revised/f1/evidence-context.jpg` + `web-only-context.jpg`：完整车队页/首页与助手同时展示 |
| P15 实际问答 | `revised/f1/evidence-dialogue.jpg`、`web-only-answer.jpg` | `revised/f1/evidence-sources.jpg` + `web-only-result.jpg`：完整产品界面，保留提问、回答与来源所处位置 |
| P16 桌面主视觉 | `revised/personal/desktop-comic.jpg`与多张小图等页展示 | 单独使用 `revised/personal/desktop-comic.jpg`完整桌面，增加页面面积 |
| P17 主题与内容保持 | 原P16的 `revised/personal/task-content-comic.jpg`、`task-content-cyberpunk.jpg`、`task-return.jpg` | `revised/personal/project-comic.jpg` + `project-cyberpunk.jpg`：完整项目面板与周围桌面背景，直接比较主题变化 |

P3理想之家样板间、P8历史/当前欢迎界面、P9 TasteTwin首页与P13 F1首页原本即为完整图，本轮继续保留。旧裁图留在素材库作为历史记录，不继续用作主稿碎片拼接。

## 事实与素材边界

**理想之家。** `09-journal-input.jpg`、`12-selection-reviewed.jpg`、`16-purchased.jpg`、`22-after-query.jpg`和`23-abandoned-input.jpg`是此前直接截取的完整模块面板，不是包含房间背景的浏览器全屏截图。它们来自同一已验证的隔离存档与合成输入，涉及的真实模型响应沿用已有记录，本轮换图未重新发送模型请求。

P6的成功面板表示仙人掌已进入家具库，图内不显示20点价签和294余额；账务说明由原任务记录支撑，不写成这些数字都在该图中可见。`showroom-dining.jpg`是独立预设样板间，含顶部标题、返回与底部视角控件；它不是14点行动生成或购买出的房间，也不替换原实际兑换记录。

P7改用查询结果与放弃后的完整面板，不再以局部未知状态图承担主展示。特别保留这一来源区别：未采用的 `21-offline-unknown.jpg` 虽文件名含unknown，但采集时仍为running，不能拿它证明可见“结果未知”和查询入口。原未知状态局部截图及故障注入证据继续保留。迟到响应保护仍仅查代码，没有新增并发乱序实测主张。

**TasteTwin。** 完整画面仍是本地规则原型及自带示例资料，不称为真实模型推荐或真实用户健康记录。1344 + 260 × 0.5 = 1474 kcal的同任务关系保留；原计划行仍显示1份，实际记录半份的产品局限没有因换图而视为已修复。条件可改选也不等于完整匹配机制已经实现。

**F1。** 沿用此前两次真实问答的完整采集帧，没有再次提交问题。页面名称不等于页面证据；本页快照与联网范围区别保留。回答来源的存在不等于所有外部原文已经复核，图中引用也不自动成为PDF可点击热点。完整页面中的赛车与品牌素材按原权利声明作非商业展示。

**桌面个人站。** 两张完整内容图包含原站文字，原文未改写或遮盖；其中用户反馈或效果表达仅作为界面内容展示，不升级为作品集已证实的用户研究。双入口、主题切换、返回与Escape沿用原验证范围，不宣称像素级阅读位置完全不变。没有新增AI分身请求。

本人职责、实际周期、设计动机、公开许可及联系方式等缺口继续以 `docs/portfolio-evidence-gaps.md` 与 `docs/questions.md` 为准。交付仍为修订预览版，未部署或公开；原产品仓库保持只读。

## 验证记录的归属

本文件仅记录源码与素材选择。本轮最终18页PDF是否已导出、字体与链接是否通过、每页图像是否复核，须以本目录后续实际验证报告为准；上一轮 `docs/visual-refresh/` 的17页通过记录不能直接作为本轮验收。
