# TasteTwin 素材 / M2

所有源文件只读。源目录：`/Users/youkaiou/Desktop/Qloo/design/live-2d/review/flow-videos/`。本轮没有运行源项目录制/构建脚本，也没有修改源素材。使用已有真实点击录屏生成候选材料，仍待 Kai 最终选帧、剪辑与确认公开。

## 候选视频

- `public/video/agent/tastetwin-recommend-candidate.mp4`：推荐餐食分段的完整 00:00.000–01:20.208，未加速；1920×1080 H.264/AAC。原始1920×1280画面等比缩小并左右留边，不裁掉字幕。
- 源文件 `03-recommend.mp4`；视频保留原有「示例数据」与流程字幕；不代表真实AI模型。
- 这段最完整地显示条件输入→推荐→详情→加入/管理计划→确认实际餐次/份量→跨模块同步，建议作60–90秒精华候选。
- 海报：`public/video/agent/poster.jpg`；主图也可使用`/shots/agent/home.jpg`。
- `provenance.json` 记录源SHA-256、完整片长度、候选区间、输出编码和待确认状态。

重新生成（只写 portfolio）：

```sh
node scripts/video.mjs --input /Users/youkaiou/Desktop/Qloo/design/live-2d/review/flow-videos/03-recommend.mp4 --start 0 --duration 80.208
node scripts/process-agent.mjs
```

第二个脚本将通用脚本的 `highlight.mp4` 重命名为明确的候选文件名。

## 8 张关键帧（草稿推荐）

| 成品 | 源分段 | 精确时间码 | 实际画面与可说明的交互 |
|---|---|---|---|
| `/shots/agent/home.jpg` | `00-home.mp4` | 00:01.500 | 四模块、Twin与湖景首页 |
| `/shots/agent/profile.jpg` | `01-profile.mp4` | 00:34.000 | 已保存的饮食档案，将用于推荐；仍是示例资料 |
| `/shots/agent/intent.jpg` | `03-recommend.mp4` | 00:10.200 | 减脂目标、过敏/忌口、已识别清淡/鸡肉/20分钟内；标签可改 |
| `/shots/agent/details.jpg` | `03-recommend.mp4` | 00:16.700 | 菜品详情与食材，决定加入前可检查 |
| `/shots/agent/plan.jpg` | `03-recommend.mp4` | 00:31.500 | 三道菜进入计划，已吃/计划/预计分别列示 |
| `/shots/agent/confirm.jpg` | `03-recommend.mp4` | 00:56.300 | 炒饭「吃了」后仍需选餐次和实际份量，确认或先不记 |
| `/shots/agent/result.jpg` | `03-recommend.mp4` | 01:07.400 | 三道计划确认吃了后合计更新，计划归零，不重复统计 |
| `/shots/agent/uncertainty.jpg` | `04-trends.mp4` | 00:32.500 | 右下「了解预测方式」披露数据、假设、占位模型与范围 |

对应 WebP 同名；`public/shots/agent/manifest.json` 保存每张精确源路径与秒数。JPEG/WebP均低于400KB。已目视检查 intent、confirm、uncertainty，实际图像与上述说明一致。

标注建议（归一化坐标相对完整1920×1280画面，文字由HTML叠加，不烧入图片）：

- intent：目标(0.71,0.226)、档案上下文(0.77,0.390)、已识别条件(0.77,0.522)、可修改标签(0.78,0.60)。
- confirm：记到哪餐/实际份量(0.52,0.855)、确认记录(0.579,0.855)、先不记(0.613,0.855)。左侧已吃仍为1,344，计划仍为3份456，符合尚未确认的状态；这些只是原型示例数值，不作成效。

## 全片联系表

`public/video/agent/contact-all-01.jpg` 至 `contact-all-04.jpg` 从357.263秒原片每5秒抽帧，4列×5行。每页100秒，按左到右、上到下阅读；末页不足格为空白。全部低于400KB。`contact-01.jpg` 是80秒候选分段的单独联系表。联系表用于选材，不作最终大图。

## 迭代素材边界

Qloo项目根未见Git仓库，因此不虚构提交历史。`design/live-2d/README.md:81,93,224,257` 记录横向营养布局和从五展示模块到四完整流程的阶段迭代；`_backup-before-flow-v1/manifest.json` 保存修改前文件哈希。已有截图`design/live-2d/00-home.png`与`review/flow-v1/F00-1-home.png`可用于标明「已有检查截图」的前后比较，不能标成从Git恢复。本轮三个已上线项目的Git历史管线单独处理。

## 说明与待确认

所有图注均应标明「TasteTwin交互原型；示例数据」。没有真实AI调用/工具执行/健康结果，不附会研究或测试结论。Kai需要确认角色与公开权限、最终关键帧与片段，以及完整版/在线Demo地址。

已生成可追溯的补充对比：`/shots/agent/stage-before.jpg`（源 `00-home.png`）与 `/shots/agent/stage-after.jpg`（源 `review/flow-v1/F00-1-home.png`），同名WebP。两张均已目视检查，前者五模块/未来预测达成数字，后者四模块/早期估算与记录完整度；原始文件SHA-256及修改时间在manifest。理由仅按文档归纳：把展示模块组织成可完成流程，并移除达成时间承诺（`CODEX-TASK-flow-v1.md:9–17,60`）。最终设计动机仍待Kai确认。
