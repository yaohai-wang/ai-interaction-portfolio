import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { launch } from './browser.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source='/Users/youkaiou/Desktop/Qloo/design/live-2d';
const tmp=path.join(root,'tmp/revised/tastetwin');
const copyRoot=path.join(tmp,'runtime');
const output=path.join(root,'public/revised/tastetwin');
const stamp=new Date().toISOString();
const provenance=[];
await fs.mkdir(copyRoot,{recursive:true});
await fs.mkdir(output,{recursive:true});
await fs.mkdir(path.join(tmp,'captures'),{recursive:true});
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
// Tighter crops retain literal pixels from the same full-frame capture; no UI is added or removed.
async function makeFocusCrops(){
 const file=path.join(output,'manifest.json');
 const entries=JSON.parse(await fs.readFile(file,'utf8'));
 const specs=[
  ['01-input-conditions','01-input-focus',36,842,880,104,'本次输入'],
  ['02-parsed-conditions','02-parsed-focus',36,365,880,680,'档案、规则识别与条件标签'],
  ['03-corrected-conditions','03-corrected-focus',36,365,880,610,'档案与手动修正的当前标签'],
  ['05-plan-one-plan','05-plan-one-focus',24,24,1152,174,'原计划：晚餐一份'],
  ['07-confirm-half-plan','07-confirm-half-focus',24,24,1152,174,'实际半份：待确认'],
  ['08-recorded-plan-plan','08-recorded-plan-focus',24,24,1152,174,'原计划已关联记录'],
  ['10-recorded-meal-meal','10-recorded-meal-focus',36,78,880,380,'已保存晚餐：半份与130 kcal']
 ];
 for(const [baseId,id,left,top,width,height,title] of specs){
  const base=entries.find(e=>e.id===baseId);assert.ok(base,baseId);
  const raw=await fs.readFile(path.join(tmp,'captures',base.step+'.png'));
  const rect={left:base.crop.x*2+left,top:base.crop.y*2+top,width,height};
  const crop=await sharp(raw).extract(rect).toBuffer();
  let q=88,jpeg;do{jpeg=await sharp(crop).jpeg({quality:q,mozjpeg:true}).toBuffer();q-=7;}while(jpeg.length>400000&&q>30);
  let wq=86,webp;do{webp=await sharp(jpeg).webp({quality:wq}).toBuffer();wq-=7;}while(webp.length>400000&&wq>24);
  assert.ok(jpeg.length<=400000&&webp.length<=400000);
  await fs.writeFile(path.join(output,id+'.jpg'),jpeg);await fs.writeFile(path.join(output,id+'.webp'),webp);
  const entry={...base,id,title,image:`/revised/tastetwin/${id}.jpg`,webp:`/revised/tastetwin/${id}.webp`,width,height,bytes:jpeg.length,webpBytes:webp.length,kind:'local-prototype-focus-crop',crop:{x:rect.left/2,y:rect.top/2,width:width/2,height:height/2,source:base.step+'-full',reference:baseId},framing:'原始同一帧的局部裁切；无标注、拼图或界面改写',sourceScreenshotSHA256:hash(raw)};
  const existing=entries.findIndex(e=>e.id===id);if(existing<0)entries.push(entry);else entries[existing]=entry;
 }
 await fs.writeFile(file,JSON.stringify(entries,null,2)+'\n');
 return entries.length;
}
if(process.argv.includes('--recrop-only')){console.log(JSON.stringify({images:await makeFocusCrops(),mode:'recrop-only'}));process.exit(0);}

async function copyFile(relative){
 const from=path.join(source,relative),to=path.join(copyRoot,relative),bytes=await fs.readFile(from);
 await fs.mkdir(path.dirname(to),{recursive:true});await fs.writeFile(to,bytes);
 provenance.push({relative,bytes:bytes.length,sha256:hash(bytes)});
}
async function copyTree(relative){
 for(const item of await fs.readdir(path.join(source,relative),{withFileTypes:true})){
  if(item.name==='source'||item.name.startsWith('.'))continue;
  const next=path.join(relative,item.name);
  if(item.isDirectory())await copyTree(next);else if(item.isFile())await copyFile(next);
 }
}
for(const item of await fs.readdir(source,{withFileTypes:true})){
 if(item.isFile()&&/\.(?:html|js|css)$/.test(item.name))await copyFile(item.name);
}
for(const folder of ['assets','env','twin','audio','fx'])await copyTree(folder);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.json':'application/json','.wav':'audio/wav','.mp3':'audio/mpeg'};
const server=http.createServer(async(req,res)=>{
 try{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
  const requested=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=path.resolve(copyRoot,'.'+(requested==='/'?'/index.html':requested));
  if(!file.startsWith(copyRoot+path.sep)){res.writeHead(403);res.end();return;}
  const bytes=await fs.readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:bytes);
 }catch{res.writeHead(404);res.end('Not found');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await launch();
const ctx=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2,locale:'zh-CN',timezoneId:'Asia/Shanghai',reducedMotion:'reduce'});
const blocked=[],errors=[],requests=[],steps=[],manifest=[];
await ctx.route('**/*',async route=>{
 const req=route.request();
 if(!req.url().startsWith(origin+'/')||!['GET','HEAD'].includes(req.method())){blocked.push({url:req.url(),method:req.method()});await route.abort();return;}
 requests.push({method:req.method(),path:new URL(req.url()).pathname});await route.continue();
});
const page=await ctx.newPage();
page.on('pageerror',error=>errors.push(error.message));
page.on('response',response=>{if(response.status()>=400)errors.push(`HTTP ${response.status()} ${response.url()}`);});
const numbers=async()=>page.evaluate(()=>({
 totals:TTStore.select.totals(), profile:TTStore.copy(TTStore.state.profile),
 prefs:TTStore.copy(TTStore.state.ui.recommend), plan:TTStore.copy(TTStore.state.plan),
 dinner:TTStore.copy(TTStore.state.days[TTStore.DATE].meals.dinner), date:TTStore.DATE,
 actualChoice:document.querySelector('[data-plan-actual]')?.value||null,
 table:[...document.querySelectorAll('[data-total]')].map(row=>({key:row.dataset.total,values:[...row.querySelectorAll('[data-column]')].map(cell=>({column:cell.dataset.column,text:cell.textContent}))}))
}));
const click=async selector=>{await page.locator(selector).click();await page.waitForTimeout(450);};
async function exportImage(png,id,extra){
 let q=87,scale=1,buffer;
 do{buffer=await sharp(png).resize({width:Math.round((extra.crop?1400:1920)*scale),withoutEnlargement:true}).jpeg({quality:q,mozjpeg:true}).toBuffer();if(q>38)q-=7;else scale*=.85;}while(buffer.length>400000);
 const jpeg=path.join(output,id+'.jpg');await fs.writeFile(jpeg,buffer);
 let webp,qw=86;
 do{webp=await sharp(buffer).webp({quality:qw}).toBuffer();qw-=7;}while(webp.length>400000&&qw>=24);
 assert.ok(webp.length<=400000,id+' WebP must fit');await fs.writeFile(path.join(output,id+'.webp'),webp);
 const meta=await sharp(buffer).metadata();
 manifest.push({id,title:extra.title,image:`/revised/tastetwin/${id}.jpg`,webp:`/revised/tastetwin/${id}.webp`,bytes:buffer.length,webpBytes:webp.length,width:meta.width,height:meta.height,kind:extra.crop?'local-prototype-crop':'local-prototype-full',sourcePath:source,sourcePage:'index.html?motion=off',capturedAt:stamp,mode:'真实运行的本地规则原型；独立浏览器示例数据；未连接模型',caption:extra.caption,...extra});
}
async function capture(id,title,caption,crops=[]){
 await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(550);
 const png=await page.screenshot({animations:'disabled'});
 await fs.writeFile(path.join(tmp,'captures',id+'.png'),png);
 const data=await numbers();steps.push({id,title,caption,data});
 await exportImage(png,id+'-full',{title,caption,step:id,viewport:{width:1440,height:900,dpr:2}});
 for(const crop of crops){
  const box=await page.locator(crop.selector).boundingBox();assert.ok(box,`Missing ${crop.selector}`);
  const padding=crop.padding??6;
  const x=Math.max(0,Math.floor(box.x-padding)),y=Math.max(0,Math.floor(box.y-padding));
  const width=Math.min(1440-x,Math.ceil(box.width+2*padding)),height=Math.min(900-y,Math.ceil(box.height+2*padding));
  const extracted=await sharp(png).extract({left:x*2,top:y*2,width:width*2,height:height*2}).toBuffer();
  await exportImage(extracted,id+'-'+crop.name,{title:title+' · '+crop.title,caption,step:id,crop:{x,y,width,height,source:id+'-full',selector:crop.selector},viewport:{width:1440,height:900,dpr:2}});
 }
 return data;
}
const rail={name:'conditions',title:'条件操作区',selector:'.rec-rail'};
const planCrop={name:'plan',title:'计划与实际份量',selector:'.rec-bottom'};
const nutrition={name:'nutrition',title:'已吃、计划、预计合计',selector:'.rec-bottom'};
try{
 await page.goto(origin+'/index.html?motion=off',{waitUntil:'networkidle'});
 await page.waitForFunction(()=>window.TTStore&&window.TTUI&&window.TTTextures);
 await page.waitForTimeout(1800);
 await capture('00-home','TasteTwin 本地原型','本地规则原型；项目自带示例档案和既有摄入记录。');
 await click('#mainNav [data-open="3"]');
 await click('[data-action="rec-scene"][data-value="home"]');
 const baseline=await numbers();assert.equal(baseline.totals.eaten.kcal,1344);assert.equal(baseline.plan.length,0);
 const input='清淡鸡肉，20 分钟内';
 await page.locator('[data-rec-text]').fill(input);
 await capture('01-input','输入本次要求','输入“清淡鸡肉，20 分钟内”；上海、花生过敏、不吃香菜由示例档案带入。',[rail]);
 await click('[data-action="rec-send"]');
 const parsed=await capture('02-parsed','规则识别条件','关键词与正则规则识别清淡、鸡肉、20 分钟内；不是模型推理结果。',[rail]);
 assert.deepEqual(parsed.prefs.tags,['清淡','鸡肉','20 分钟内']);
 await click('[data-action="rec-tag"][data-value="鸡肉"]');
 await click('[data-action="rec-tag"][data-value="鱼虾"]');
 await click('[data-action="rec-tag"][data-value="20 分钟内"]');
 await click('[data-action="rec-tag"][data-value="15 分钟内"]');
 const corrected=await capture('03-corrected','手动改为鱼虾、15 分钟内','已识别气泡保留原输入；选中标签改为清淡、鱼虾、15 分钟内。标签可改不等于完整推荐匹配已实现。',[rail]);
 assert.deepEqual(corrected.prefs.tags,['清淡','鱼虾','15 分钟内']);
 assert.deepEqual(corrected.profile,baseline.profile,'manual condition edits preserve the inherited profile');
 await click('[data-action="rec-find"]');
 await page.waitForSelector('[data-action="rec-add"][data-id="dish-0"]');
 const suggested=await capture('04-recommendations','查看本地候选餐食','在家候选为本地菜品示例，并过滤档案过敏/忌口；当前标签不驱动完整食材、口味和时间匹配。',[rail]);
 assert.equal(suggested.totals.eaten.kcal,1344);assert.equal(suggested.plan.length,0);
 const dish=await page.evaluate(()=>TTStore.copy(TTStore.recipes.find(d=>d.id==='dish-0')));
 await click('[data-action="rec-add"][data-id="dish-0"]');
 await click('[data-action="rec-bottom"][data-value="plan"]');
 const planned=await capture('05-plan-one','计划吃一份','虾仁花椰菜炒饭加入晚餐计划：1 份、260 kcal；尚未记入已吃。',[planCrop]);
 assert.equal(planned.plan.length,1);assert.equal(planned.plan[0].servings,1);assert.equal(planned.totals.eaten.kcal,1344);assert.equal(planned.totals.planned.kcal,dish.kcal);
 await click('[data-action="rec-bottom"][data-value="nutrition"]');
 await capture('06-planned-totals','计划与已吃分别合计','已吃 1344 kcal，计划 260 kcal，预计 1604 kcal。原有 1344 kcal 为项目示例基线。',[nutrition]);
 await click('[data-action="rec-bottom"][data-value="plan"]');
 await click('[data-action="plan-eat"]');
 await page.locator('[data-plan-actual]').selectOption('0.5');
 const pending=await capture('07-confirm-half','实际只吃半份，等待确认','晚餐实际份量选择 0.5 份；确认前已吃仍为 1344 kcal，计划仍为 260 kcal。',[planCrop]);
 assert.equal(pending.actualChoice,'0.5');assert.equal(pending.totals.eaten.kcal,1344);assert.equal(pending.totals.planned.kcal,260);
 await click('[data-action="plan-eat-confirm"]');
 const recorded=await capture('08-recorded-plan','计划已关联摄入记录','确认后计划项显示已记录；此处描述仍保留原计划 1 份，实际记录为 0.5 份。',[planCrop]);
 assert.equal(recorded.dinner.items.length,1);assert.equal(recorded.dinner.items[0].servings,.5);assert.equal(recorded.plan[0].state,'eaten');assert.ok(recorded.plan[0].recordRef);
 await click('[data-action="rec-bottom"][data-value="nutrition"]');
 const result=await capture('09-result-totals','确认后更新实际摄入','已吃从 1344 增至 1474 kcal（增加 130）；未吃计划降为 0，预计等于已吃。全部为规则原型的示例数据。',[nutrition]);
 for(const key of ['kcal','p','c','f','fiber']){
  const expected=Math.round((baseline.totals.eaten[key]+dish[key]*.5)*1000)/1000;
  assert.equal(result.totals.eaten[key],expected,`${key}: recorded half serving`);
  assert.equal(result.totals.planned[key],0,`${key}: no double counting`);
  assert.equal(result.totals.expected[key],expected);
 }
 assert.equal(result.table.find(r=>r.key==='kcal').values.find(v=>v.column==='eaten').text,'1,474');
 await click('[data-action="rec-bottom"][data-value="plan"]');
 await click('[data-action="rec-view-meal"]');
 await click('[data-meal-open="dinner"]');
 const meal=await capture('10-recorded-meal','核对已保存的半份晚餐','晚餐详情显示虾仁花椰菜炒饭 0.5 份、130 kcal；与确认后合计增加量一致。',[{name:'meal',title:'已保存晚餐详情',selector:'.meal-sheet'}]);
 assert.equal(meal.dinner.items[0].servings,.5);assert.equal(meal.totals.eaten.kcal,1474);
 const report={status:'passed',capturedAt:stamp,source,copyRoot,input,sourceFiles:provenance,steps,dish,baseline:baseline.totals,result:result.totals,actualServing:.5,expectedIncrease:130,network:{requests,blocked},pageErrors:errors,
 limitations:['本地关键词/正则规则，不是真实大模型调用','候选使用固定示例菜品并过滤档案过敏/忌口，偏好标签未实现完整匹配','记录后计划描述仍保留原计划 1 份；实际摄入以关联记录 0.5 份计入','原有 1344 kcal 为项目自带示例，不是本次任务新增或真实用户数据']};
 await fs.writeFile(path.join(output,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 await fs.writeFile(path.join(tmp,'report.json'),JSON.stringify(report,null,2)+'\n');
 await fs.writeFile(path.join(tmp,'source-manifest.json'),JSON.stringify(provenance,null,2)+'\n');
 const totalImages=await makeFocusCrops();
 console.log(JSON.stringify({status:report.status,images:totalImages,baseline:1344,planned:260,actualServing:.5,increase:130,result:1474,errors,report:path.join(tmp,'report.json')},null,2));
}catch(error){
 await fs.writeFile(path.join(tmp,'failure.json'),JSON.stringify({error:String(error),steps,manifest,errors,blocked},null,2)+'\n');throw error;
}finally{await ctx.close();await browser.close();await new Promise(resolve=>server.close(resolve));}
