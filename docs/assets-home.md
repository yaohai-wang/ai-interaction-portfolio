# 理想生活素材与复现记录

采集日期 2026-11-12。源码仓库只读，写入限本 portfolio。

## 复跑

`node scripts/capture-home.mjs`（全量）；`--online-only` 或 `--history-only` 可单独执行。需要本机 Chrome、项目依赖、源仓库现存依赖。

## 采集约束

1440×900、DPR2、zh-CN、Asia/Shanghai；统一 JPEG + WebP；JPEG 不超过 400KB。浏览器新建隔离上下文，公共请求拦截器禁止非 GET/HEAD/OPTIONS 请求及模型路径；不填写、提交、购买、保存、AI 生成。打开页面产生的初始存档仅在该临时浏览器上下文。

历史版本使用 git archive 到 tmp/history/home-*；逐包只读链接原仓库依赖，Vite 缓存与临时 config 全部留在导出副本。纯前端运行，/api/account/session 使用 {configured:false,user:null,storage:'local'} 静态响应，只让本地体验可进入；未注入用户愿景/行动或伪造 AI 结果。

## 结果

- 线上截图完成 10 张；非 GET 请求拦截记录 3 条。所有模型生成按钮未点击。
- 历史 429ee53 跳过：git archive 达到 180 秒超时上限，未进入运行截图阶段。原命令： git --no-optional-locks -C /Users/youkaiou/Desktop/生活成长app archive --format=tar --output /Users/youkaiou/就职/portfolio/tmp/history/home-429ee53.tar 429ee53 src public index.html package.json vite.config.ts tsconfig.json

- 历史 97bd65f 已导出并运行；提交时间 2026-10-17T16:00:49+09:00；feat: publish showroom navigation and welcome language switching。
- 历史 8c468d4 跳过：git archive 达到 180 秒超时上限，未进入运行截图阶段。原命令： git --no-optional-locks -C /Users/youkaiou/Desktop/生活成长app archive --format=tar --output /Users/youkaiou/就职/portfolio/tmp/history/home-8c468d4.tar 8c468d4 src public index.html package.json vite.config.ts tsconfig.json


## 素材

| 图 | 类型 | 来源 |
|---|---|---|
| 日期、季节与可拖动浮岛 | online | https://home.youkai-ou.com/ |
| 默认室内视角 | online | https://home.youkai-ou.com/#/space |
| 今日手记：无愿景时的引导空态 | online | https://home.youkai-ou.com/#/goals |
| 愿景板：从愿景开始 | online | https://home.youkai-ou.com/#/life |
| 家具商店：成长积分兑换入口 | online | https://home.youkai-ou.com/#/shop |
| 布置房间：编辑工具的初始状态 | online | https://home.youkai-ou.com/#/furnish |
| 生活档案：篇章与记录 | online | https://home.youkai-ou.com/#/archive |
| 整栋视角 | online | https://home.youkai-ou.com/#/space |
| 第一视角 | online | https://home.youkai-ou.com/#/space |
| 样板间：无需修改个人房间的参观入口 | online | https://home.youkai-ou.com/#/showroom |
| 2026-10-17 · 入口快照 97bd65f | history | 97bd65f66589096a0d6da9d5979e04638b8e17d9 |
| 2026-10-17 · 房间快照 97bd65f | history | 97bd65f66589096a0d6da9d5979e04638b8e17d9 |

## 迭代对比

推荐同一构图使用 history-97bd65f-welcome → welcome：2026-10-17 旧入口与当前浮岛。浮岛改版提交 8c468d4（2026-10-18）。设计理由仅采用 docs/design/welcome-island/CODEX_TASK.md:18-23 的“去掉玻璃卡片、改左文案右浮岛、保留现有语言和进入逻辑”；不声称用户指标提升。history-8c468d4-room → room 可检查样板间入口大小，后续提交 78d0202 明确 make showroom entrance smaller and less prominent。

当前产品名称为理想生活（统一名称 TODO(Kai)）；图中时间、积分为产品真实界面初始化状态，不能解释为个人成果。历史提交日期不是实际项目起止日期。线上未来图片功能 image:false，不提供生成成功截图。AI 候选结果需 Kai 提供真实公开录屏或明确授权，不用合成结果冒充。

## 最终自检

- 10 张线上截图 + 2 张历史截图；联系表已目视检查，未发现黑屏。
- 97bd65f 旧入口与当前浮岛构成一组真实迭代对比；其余两个候选因导出超时跳过，不计作已复现。
- 原仓库 git status --short 在工作前后均为空；未切换分支、构建、安装依赖或改源码。
- 截图中 300 点是产品初始赠送，空房是新浏览器存档；样板间明确是预设展示场景，均非 Kai 的成效指标。
- 所有本任务创建的历史 Vite 服务与浏览器已关闭。
