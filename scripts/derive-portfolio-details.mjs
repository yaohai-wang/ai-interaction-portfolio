import fs from 'node:fs/promises';
import sharp from 'sharp';
import crypto from 'node:crypto';

// Only rectangular crops of existing captured pixels. No compositing or UI edits.
// Optional argument `home` or `tastetwin` limits regeneration to that group.
const groups = {
  tastetwin: [
    {
      source: '09-result-totals-nutrition', name: '09-result-kcal-focus',
      crop: { left: 0, top: 86, width: 1200, height: 116 },
      title: '确认后的热量合计',
      caption: '同一结果营养表的表头与热量行局部；本地规则原型，示例数据。',
    },
    {
      source: '10-recorded-meal-focus', name: '10-recorded-food-focus',
      crop: { left: 0, top: 252, width: 880, height: 126 },
      title: '保存的实际份量',
      caption: '已保存晚餐详情的食材行局部；0.5份、130 kcal，本地规则原型示例数据。',
    },
  ],
  home: [
    {
      source: '23-abandoned-input-detail', name: '23-abandoned-input-focus',
      crop: { left: 0, top: 255, width: 888, height: 560 },
      title: '主动放弃后保留原文与重新整理入口',
      caption: '独立测试存档 · 合成输入 · 浏览器离线故障注入；真实原帧矩形裁切。',
    },
  ],
};
const requested = process.argv.slice(2);
for (const name of requested) if (!(name in groups)) throw new Error('Unknown group: ' + name);
for (const [name, edits] of Object.entries(groups)) {
  if (requested.length && !requested.includes(name)) continue;
  const group = 'public/revised/' + name;
  const manifest = JSON.parse(await fs.readFile(group + '/manifest.json', 'utf8'));
  for (const edit of edits) {
    const sourceImage = '/revised/' + name + '/' + edit.source + '.jpg';
    const buffer = await fs.readFile('public' + sourceImage);
    const sourceRecord = manifest.find((row) => row.id === edit.source);
    const crop = sharp(buffer).extract(edit.crop);
    const jpg = await crop.clone().jpeg({ quality: 92, mozjpeg: true }).toBuffer();
    const webp = await crop.clone().webp({ quality: 88 }).toBuffer();
    if (Math.max(jpg.length, webp.length) > 400000) throw new Error('Crop exceeds budget');
    await fs.writeFile(group + '/' + edit.name + '.jpg', jpg);
    await fs.writeFile(group + '/' + edit.name + '.webp', webp);
    const record = {
      id: edit.name, title: edit.title,
      image: '/revised/' + name + '/' + edit.name + '.jpg',
      webp: '/revised/' + name + '/' + edit.name + '.webp',
      width: edit.crop.width, height: edit.crop.height,
      bytes: jpg.length, webpBytes: webp.length,
      kind: 'derived-readability-crop', sourceImage,
      sourceSHA256: crypto.createHash('sha256').update(buffer).digest('hex'),
      cropPixels: edit.crop, caption: edit.caption,
      ...(name === 'home' ? { sourceURL: sourceRecord?.sourceURL, capturedAt: sourceRecord?.capturedAt } : {}),
    };
    const index = manifest.findIndex((row) => row.id === edit.name);
    if (index < 0) manifest.push(record); else manifest[index] = record;
    console.log(JSON.stringify({ group: name, id: edit.name, width: record.width, height: record.height, bytes: jpg.length, webpBytes: webp.length, sourceSHA256: record.sourceSHA256 }));
  }
  await fs.writeFile(group + '/manifest.json', JSON.stringify(manifest, null, 2));
}
