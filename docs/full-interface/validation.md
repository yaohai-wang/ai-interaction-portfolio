# 完整截图版 · 验证记录

日期：2026-11-13。按用户“多展示整个界面，不要截一小部分”更新。保留Design-dna黑色视觉，当前18页。

## 构建、图片和网页

- `npm run build`：9条静态路由构建成功。单图体积、站内链接、资源来源和内容schema检查通过。
- `node scripts/revision-proof.mjs`：18页顺序与数据一致，无横向越界、页脚碰撞或内部审阅标记。
- `npm run qa`：1440/1280/390宽度、8路由，共24组通过；无缺图、横向溢出、运行错误或外域运行请求。
- `node scripts/full-image-proof.mjs`：桌面/手机×首页和四案例，共10次真实图片交互通过；打开完整图、切换原始尺寸、Escape关闭及焦点返回正常。首页没有嵌套链接。
- 打印主稿28张截图均未引用原focus/detail/scope/task-content/task-return碎片裁图；全部按contain展示。四个目录缩略图也使用contain，不再横条裁切。Home操作图为完整模块面板，其余案例为完整产品视窗；不把面板截图冒称全站截图。
- `node docs/full-interface/verify-design-dna.mjs`：14项设计颜色、字体、布局和动效核验通过，18页结构正确。

## PDF结构和保留

- 主版：18页，5,163,975字节。轻量版：18页，1,886,256字节。
- 两版16:9，字体全部嵌入、正文可提取；11个链接保持有效结构，目录指向P3/P9/P13/P16，封面跳P2。
- `.venv/bin/python scripts/verify-visual-artifacts.py`：严格读取通过，主/轻量逐页文本一致，页眉/页脚像素一致。3份原PDF哈希未变，网页下载副本与主版SHA一致。
- 主版全部18页经PDFKit和Poppler渲染，轻量版全部18页经Poppler渲染；54张图的哈希在final-artifacts.json。没有只用浏览器截图代替最终PDF检查。

## 目视检查分工记录

- P1–3与P18：封面、完整缩略图、样板间、最终链接页均完整，无拉伸、截边或异常分页。轻量图保持完整场景；原始文字按页面缩放显示，网页可打开原始尺寸阅读。
- P4–8：见pdf-review-home.md，核对完整手记面板、兑换与样板间、恢复/放弃、历史对照。
- P9–12：见pdf-review-taste.md，核对完整导航、场景、条件/餐次面板与账务状态。
- P13–17：见pdf-review-f1-desktop.md，核对完整页面+助手、完整桌面与两套完整内容页。

整个界面保留后，PDF中的细小UI字仍应结合图注或放大阅读；关键状态和数值同时以可提取正文说明。没有重绘UI、拼接伪造产品画面或重新调用模型。原产品只读，无部署。本人事实与公开授权缺口仍在docs/questions.md和docs/portfolio-evidence-gaps.md，本轮没有新增需回答的问题。
