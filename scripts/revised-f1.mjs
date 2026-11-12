import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import sharp from 'sharp';
// Current explicit authorization: AGENTS.md final section and docs/revision/REVISION_REQUEST.md §1.4 / §6.1–3.
// Two synthetic questions, one request each, existing configuration; no retry or invented API response.
if(!process.argv.includes('--send')&&!process.argv.includes('--derive'))throw new Error('Use --derive for existing-image crops, or --send for the two explicitly authorized live requests.');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),output=path.join(root,'public/revised/f1'),base='https://f1.youkai-ou.com';
async function deriveCrops(){
 const manifestPath=path.join(output,'manifest.json'),entries=JSON.parse(await fs.readFile(manifestPath,'utf8'));
 const crops=[
  {id:'evidence-scope',source:'evidence-context',title:'车队页 · 本页/全站/联网范围',crop:{left:1285,top:145,width:600,height:136}},
  {id:'web-only-scope',source:'web-only-context',title:'首页 · 仅联网范围',crop:{left:1285,top:145,width:600,height:136}},
  {id:'evidence-sources-detail',source:'evidence-sources',title:'快照回答与一条展开来源',crop:{left:1285,top:485,width:600,height:372}},
  {id:'web-only-sources-detail',source:'web-only-sources',title:'联网来源 · 检索时间与缺失发布日期',crop:{left:1285,top:772,width:600,height:275}},
  {id:'web-only-answer',source:'web-only-detail',title:'实际联网回答 · 能力边界及两条引用',crop:{left:50,top:715,width:910,height:550}}
 ];
 for(const crop of crops){const source=entries.find(x=>x.id===crop.source);if(!source)continue;
  const input=sharp(await fs.readFile(path.join(root,'public',source.image))).extract(crop.crop);let jpg,webp,quality=94;
  do{jpg=await input.clone().jpeg({quality,mozjpeg:true}).toBuffer();webp=await input.clone().webp({quality}).toBuffer();quality-=4;}while((jpg.length>400000||webp.length>400000)&&quality>=30);
  if(jpg.length>400000||webp.length>400000)throw Error('Crop exceeds image budget');
  await fs.writeFile(path.join(output,crop.id+'.jpg'),jpg);await fs.writeFile(path.join(output,crop.id+'.webp'),webp);
  const entry={id:crop.id,title:crop.title,kind:'derived-crop',sourceImage:source.image,sourceURL:source.sourceURL,sourceCapturedAt:source.date,date:new Date().toISOString(),cropPixels:crop.crop,image:'/revised/f1/'+crop.id+'.jpg',webp:'/revised/f1/'+crop.id+'.webp',width:crop.crop.width,height:crop.crop.height,bytes:jpg.length,webpBytes:webp.length,caption:'真实复测截图的像素裁切；未更改文字或界面内容。'};
  const index=entries.findIndex(x=>x.id===entry.id);if(index<0)entries.push(entry);else entries[index]=entry;
 }
 await fs.writeFile(manifestPath,JSON.stringify(entries,null,2)+'\n');
}
if(process.argv.includes('--derive')){await deriveCrops();process.exit(0);}
const cases=[
{id:'evidence',route:'/zh/teams/ferrari',title:'车队证据页 · 当前真实问答',question:'仅依据本页资料，法拉利在当前保存的 2026 赛季快照中排名第几、多少积分？请给出数据时间并引用来源；没有资料就直说。'},
{id:'web-only',route:'/zh/home',title:'仅导航上下文 · 当前真实问答',question:'当前围场首页的 2026 赛季法拉利积分是多少？请说明你实际依据的是联网来源还是本页证据，给出来源与数据时间；若无法核实请直接说明。'}];
await fs.mkdir(output,{recursive:true});
const startedAt=new Date().toISOString(),manifest=[],results=[],blocked=[];
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox']});
const scrub=v=>Array.isArray(v)?v.map(scrub):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).filter(([k])=>!['contextId','requestId','token','authorization'].includes(k)).map(([k,x])=>[k,scrub(x)])):v;
async function capture(page,id,title,route,extra={},clip){
 const png=await page.screenshot({animations:'allow',timeout:30000,...(clip?{clip}: {})}),input=sharp(png).resize({width:1920,withoutEnlargement:true});let jpeg,webp,jq=92,wq=90;
 do{jpeg=await input.clone().jpeg({quality:jq,mozjpeg:true}).toBuffer();jq-=4;}while(jpeg.length>400000&&jq>=30);
 do{webp=await input.clone().webp({quality:wq}).toBuffer();wq-=4;}while(webp.length>400000&&wq>=30);
 if(jpeg.length>400000||webp.length>400000)throw Error('Image exceeds budget: '+id);
 await fs.writeFile(path.join(output,id+'.jpg'),jpeg);await fs.writeFile(path.join(output,id+'.webp'),webp);const size=await sharp(jpeg).metadata();
 const entry={id,title,kind:'live-retest',date:new Date().toISOString(),sourceURL:base+route,image:'/revised/f1/'+id+'.jpg',webp:'/revised/f1/'+id+'.webp',bytes:jpeg.length,webpBytes:webp.length,width:size.width,height:size.height,...(clip?{viewportCrop:clip}:{}),caption:'本轮线上真实复测；使用现有配置，无伪造响应。原站赛车及品牌素材权利归原权利人，非商业展示。',...extra};manifest.push(entry);return entry;
}
async function save(){await fs.writeFile(path.join(output,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');await fs.writeFile(path.join(root,'docs/revision-f1-results.json'),JSON.stringify({startedAt,finishedAt:new Date().toISOString(),cases:results,blocked,totalChatRequests:results.reduce((s,r)=>s+r.calls,0),scope:'One intentional UI submission per case; no retries, fabricated response, deployment or source-repository write.'},null,2)+'\n');}
try{for(const item of cases){
 const ctx=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2,locale:'zh-CN',timezoneId:'Asia/Tokyo',reducedMotion:'reduce'});let sends=0,active=false;
 await ctx.route('**/*',async route=>{const req=route.request(),url=new URL(req.url());if(['GET','HEAD','OPTIONS'].includes(req.method()))return route.continue();let body;try{body=req.postDataJSON();}catch{}
 if(active&&req.method()==='POST'&&url.origin===base&&url.pathname==='/api/assistant/chat'&&body?.message===item.question&&sends===0){sends++;return route.continue();}
 blocked.push({case:item.id,method:req.method(),url:url.origin+url.pathname});return route.abort();});
 const page=await ctx.newPage(),result={id:item.id,title:item.title,pageURL:base+item.route,question:item.question,startedAt:new Date().toISOString(),contextResponses:[],calls:0};results.push(result);
 page.on('response',async response=>{if(new URL(response.url()).pathname==='/api/assistant/context')try{result.contextResponses.push({url:response.url(),httpStatus:response.status(),receivedAt:new Date().toISOString(),body:scrub(await response.json())});}catch{}});
 try{
 await page.goto(result.pageURL,{waitUntil:'domcontentloaded',timeout:60000});await page.locator('.real-page').first().waitFor({timeout:45000});await page.evaluate(()=>document.fonts.ready);
 await page.getByRole('button',{name:'AI 助手',exact:true}).first().click();await page.locator('dialog[open]').waitFor();
 await page.waitForFunction(()=>document.querySelector('.assistant-scopes button')||document.querySelector('.assistant-state')?.textContent?.trim(),{},{timeout:20000});await page.waitForTimeout(400);
 result.beforeText=await page.locator('dialog[open]').innerText();result.pageText=await page.locator('.real-page').first().innerText();result.visibleScopeButtons=await page.locator('.assistant-scopes button').evaluateAll(xs=>xs.map(x=>({text:x.textContent,selected:x.getAttribute('aria-pressed')})));
 await capture(page,item.id+'-context',item.title+' · 发送前',item.route,{stage:'before-send'});
 await page.getByRole('textbox',{name:'你的问题'}).fill(item.question);
 if(await page.getByRole('button',{name:'发送',exact:true}).isDisabled())result.blocked='界面发送按钮不可用，未绕过真实配置或状态。';else{
 active=true;const responsePromise=page.waitForResponse(r=>new URL(r.url()).pathname==='/api/assistant/chat'&&r.request().method()==='POST',{timeout:100000});await page.getByRole('button',{name:'发送',exact:true}).click();
 try{const response=await responsePromise;result.httpStatus=response.status();result.responseReceivedAt=new Date().toISOString();result.response=scrub(await response.json());}catch(error){result.responseError=String(error);}active=false;
 await page.waitForFunction(()=>!document.querySelector('.assistant-send[aria-label="取消"]'),{},{timeout:10000}).catch(()=>{});await page.waitForTimeout(500);}
 result.afterText=await page.locator('dialog[open]').innerText();result.visibleStatus=await page.locator('.assistant-state').innerText();
 await capture(page,item.id+'-result',item.title+' · 实际结果',item.route,{stage:'after-send',httpStatus:result.httpStatus,status:result.response?.status});
 const clip=await page.evaluate(()=>{const d=document.querySelector('dialog[open]'),r=d.getBoundingClientRect(),ends=[...d.querySelectorAll('.assistant-turn,.assistant-state,.outline-button')].filter(e=>e.getBoundingClientRect().height>0).map(e=>e.getBoundingClientRect().bottom),x=Math.max(0,Math.floor(r.left-12)),y=Math.max(0,Math.floor(r.top));return{x,y,width:Math.min(innerWidth-x,Math.ceil(r.width+20)),height:Math.ceil(Math.min(innerHeight,Math.max(r.top+280,...ends)+18)-y)}});
 await capture(page,item.id+'-detail',item.title+' · 问题和结果局部',item.route,{stage:'after-send-detail',httpStatus:result.httpStatus,status:result.response?.status},clip);
 if(await page.locator('.assistant-sources summary').count()){await page.locator('.assistant-sources summary').last().click();await page.locator('.assistant-sources[open]').last().scrollIntoViewIfNeeded();await page.waitForTimeout(200);result.expandedSourcesText=await page.locator('.assistant-sources[open]').last().innerText();await capture(page,item.id+'-sources',item.title+' · 实际来源展开',item.route,{stage:'sources-expanded'});}
 }catch(error){result.error=String(error);console.log('CASE_ERROR',item.id,String(error));}
 finally{active=false;result.calls=sends;result.finishedAt=new Date().toISOString();await ctx.close();}
 await save();console.log(JSON.stringify({id:item.id,calls:sends,httpStatus:result.httpStatus,status:result.response?.status,answer:result.response?.answer,visibleStatus:result.visibleStatus,error:result.error,blocked:result.blocked}));
}}finally{await browser.close();await save();}
