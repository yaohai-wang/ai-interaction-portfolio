import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import sharp from 'sharp';

// This derivative is a pixel crop only. It does not alter UI content or call the live site.
// Keep the entire 1200px source height and 70px of background beside the drawer.
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const directory=path.join(root,'public/shots/f1');
const sourceImage='/shots/f1/assistant-empty.jpg';
const sourcePath=path.join(root,'public',sourceImage);
const crop={left:1200,top:0,width:720,height:1200};
const byteLimit=400000;
const original=await fs.readFile(sourcePath);
const originalHash=createHash('sha256').update(original).digest('hex');
const metadata=await sharp(original).metadata();
if(metadata.width!==1920||metadata.height!==1200){
  throw new Error(`Expected inspected source 1920×1200; found ${metadata.width}×${metadata.height}. Inspect it and update the crop before running again.`);
}
const cropped=sharp(original).extract(crop);
async function compress(format){
  for(let quality=94;quality>=30;quality-=4){
    const pipeline=cropped.clone();
    const buffer=await (format==='jpeg'?pipeline.jpeg({quality,mozjpeg:true}):pipeline.webp({quality})).toBuffer();
    if(buffer.length<=byteLimit)return{buffer,quality};
  }
  throw new Error(`${format} could not meet ${byteLimit} bytes without excessive compression`);
}
const jpeg=await compress('jpeg');
const webp=await compress('webp');
await fs.writeFile(path.join(directory,'assistant-detail.jpg'),jpeg.buffer);
await fs.writeFile(path.join(directory,'assistant-detail.webp'),webp.buffer);
const manifestPath=path.join(directory,'manifest.json');
const manifest=JSON.parse(await fs.readFile(manifestPath,'utf8'));
const source=manifest.find(item=>item.id==='assistant-empty');
if(!source)throw new Error('Missing assistant-empty provenance in manifest');
const date=new Date().toISOString();
const record={
  id:'assistant-detail',
  title:'助手空态 · 完整抽屉局部',
  kind:'derived-crop',
  date,
  sourceURL:source.sourceURL,
  sourceId:source.id,
  sourceImage,
  sourceCapturedAt:source.date,
  sourcePixels:{width:metadata.width,height:metadata.height},
  sourceSHA256:originalHash,
  cropPixels:crop,
  transform:'sharp.extract only; no resize, retouch, generation, UI change, or live request',
  image:'/shots/f1/assistant-detail.jpg',
  webp:'/shots/f1/assistant-detail.webp',
  width:crop.width,
  height:crop.height,
  bytes:jpeg.buffer.length,
  webpBytes:webp.buffer.length,
  jpegQuality:jpeg.quality,
  webpQuality:webp.quality,
  caption:'由 assistant-empty 原图裁切，保留助手完整高度及少量页面背景；仅空态与只读上下文，未发送问题，不证明真实回答可用。来源：围场智析界面；原站官方赛车素材权利归原权利人，非商业展示。'
};
const index=manifest.findIndex(item=>item.id===record.id);
if(index<0)manifest.push(record);else manifest[index]=record;
await fs.writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n');
if(createHash('sha256').update(await fs.readFile(sourcePath)).digest('hex')!==originalHash)throw new Error('Original image changed unexpectedly');
console.log(JSON.stringify({id:record.id,cropPixels:crop,width:record.width,height:record.height,bytes:record.bytes,webpBytes:record.webpBytes,date,sourceUnchanged:true},null,2));
