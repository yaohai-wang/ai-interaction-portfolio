# 理想之家样板间取景

2026-11-13 本轮定稿：`public/revised/home/showroom-dining.jpg`，1920 × 1200；对应 WebP 同名。餐桌、六把餐椅、盆栽、沙发、窗和墙面生活入口均来自产品真实三维场景。保留顶部“参观样板间 / 理想公寓”和底部“第一视角”控件。

来源为 https://home.youkai-ou.com/#/showroom 。通过内置第一视角、拖动环顾和 WASD 行走取景，未调整原产品 UI、场景、灯光或家具。图像处理仅为等比例缩小与 JPEG / WebP 压缩，无生成图、补绘或调色。

已只读核对 `/Users/youkaiou/Desktop/生活成长app/src/features/home/Showroom.tsx:9–28`：此处创建新的内存 `snapshot`，数据来自 `createLivingWallApartmentLayout`，与玩家存档分离。独立浏览器上下文禁止非 GET/HEAD/OPTIONS 请求，没有请求 AI，也没有写入真实玩家存档。截图中的房间是预设样板间，不能作为本次 14 点行动积分兑换的结果。

可复现脚本：`node scripts/capture-showroom-dining.mjs`；精确动作记录见 `public/revised/home/manifest.json` 的 `showroom-dining.uiActions`。行走距离取决于实际渲染帧率，重拍后仍需目视核对，不应声称像素完全一致。

旧 `showroom-angled-a/b/c` 文件名保留以免破坏现有引用，但 manifest 标题已纠正为“顶视”，并明确标注原误名。本轮临时正对墙/柜门的试拍已移到 `tmp/visual-refresh/home-candidates/`，从正式 manifest 移除。用户原项目及原素材未移动、未修改。
