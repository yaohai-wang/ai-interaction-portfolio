import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
import sharp from 'sharp';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),output=path.join(root,'public/revised/personal'),url='https://youkai-ou.com/';
await fs.mkdir(output,{recursive:true});
if(process.argv.includes('--derive')||process.argv.includes('--derive-content')){await deriveCrops();process.exit(0);}
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2,locale:'zh-CN',timezoneId:'Asia/Tokyo',reducedMotion:'reduce'});
const manifest=[],blocked=[],errors=[],report={startedAt:new Date().toISOString(),sourceURL:url,viewport:{width:1440,height:900},deviceScaleFactor:2,steps:[],checks:{}};
await context.route('**/*',route=>{const req=route.request(),u=new URL(req.url());if(!['GET','HEAD','OPTIONS'].includes(req.method())){blocked.push({method:req.method(),url:u.origin+u.pathname});return route.abort();}return route.continue();});
const page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));
const hash=s=>createHash('sha256').update(s).digest('hex');
async function scene(theme){await page.locator(`#current-layer[data-scene-status="ready"][data-scene-theme="${theme}"]`).waitFor({state:'attached',timeout:45000});await page.evaluate(async()=>{await document.fonts.ready;await Promise.all(['scene-image','window-image'].map(id=>document.getElementById(id).decode()));});await page.waitForTimeout(350);}
async function capture(id,title,step,clip){const png=await page.screenshot({animations:'disabled',timeout:30000,...(clip?{clip}: {})}),pipeline=sharp(png).resize({width:1920,withoutEnlargement:true});let jpg,webp,jq=92,wq=90;
 do{jpg=await pipeline.clone().jpeg({quality:jq,mozjpeg:true}).toBuffer();jq-=4;}while(jpg.length>400000&&jq>=24);
 do{webp=await pipeline.clone().webp({quality:wq}).toBuffer();wq-=4;}while(webp.length>400000&&wq>=24);
 if(jpg.length>400000||webp.length>400000)throw Error('Image budget exceeded '+id);
 await fs.writeFile(path.join(output,id+'.jpg'),jpg);await fs.writeFile(path.join(output,id+'.webp'),webp);const size=await sharp(jpg).metadata();
 const state=await page.evaluate(()=>({theme:document.documentElement.dataset.uiTheme,panel:document.querySelector('#desk-app').dataset.panelOpen??null,activeElement:document.activeElement?.id||document.activeElement?.className}));
 manifest.push({id,title,kind:'live-interaction',date:new Date().toISOString(),sourceURL:url,sequenceStep:step,...state,image:'/revised/personal/'+id+'.jpg',webp:'/revised/personal/'+id+'.webp',width:size.width,height:size.height,bytes:jpg.length,webpBytes:webp.length,...(clip?{viewportCrop:clip}:{}),caption:'来源：Kai个人站真实连续交互截图。第三方角色及品牌标识权利归原权利人，非商业展示；未发送AI消息。'});
}
async function state(action){const data=await page.evaluate(()=>({theme:document.documentElement.dataset.uiTheme,scene:{...document.querySelector('#current-layer').dataset},panel:document.querySelector('#desk-app').dataset.panelOpen??null,openDialogs:[...document.querySelectorAll('dialog[open]')].map(e=>e.id),focused:{id:document.activeElement?.id,className:document.activeElement?.className,text:document.activeElement?.textContent?.trim(),outline:getComputedStyle(document.activeElement).outline},tip:{visible:!document.querySelector('#object-tip').hidden,text:document.querySelector('#object-tip').textContent},body:document.querySelector('#desk-dream-home-dialog .dh-body')?{text:document.querySelector('#desk-dream-home-dialog .dh-body').innerText,scrollTop:document.querySelector('#desk-dream-home-dialog .dh-body').scrollTop,scrollHeight:document.querySelector('#desk-dream-home-dialog .dh-body').scrollHeight,clientHeight:document.querySelector('#desk-dream-home-dialog .dh-body').clientHeight}:null,cta:document.querySelector('#desk-dream-home-dialog .dh-play')?.href,sceneTransform:getComputedStyle(document.querySelector('#scene-frame')).transform,artboardTransform:getComputedStyle(document.querySelector('#artboard')).transform}));
 const entry={action,date:new Date().toISOString(),...data};report.steps.push(entry);return entry;}
try{
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});await scene('comic');
 const initial=await state('新隔离浏览器进入桌面，默认Comic');await capture('desktop-comic','主视觉 · Comic桌面',0);
 await page.locator('#dream-home-toy').hover();await page.waitForTimeout(120);const hovered=await state('鼠标悬停木屋物件');report.checks.objectHoverLabel=hovered.tip.visible&&hovered.tip.text==='理想之家AI产品';await capture('object-hover','木屋物件 · 实际悬停提示',1);
 await page.locator('#dream-home-toy').click();await page.locator('#desk-dream-home-dialog[open]').waitFor();await page.waitForTimeout(400);
 const dialog=await page.locator('#desk-dream-home-dialog').elementHandle();const opened=await state('点击木屋，打开理想之家项目面板');report.checks.objectOpensExpectedPanel=opened.panel==='dream-home';report.checks.openFocusesReturn=opened.focused.className.includes('desk-panel-back');await capture('project-comic','01 点击物件 · 理想之家项目',2);
 if(opened.body.scrollHeight>opened.body.clientHeight+5){await page.locator('#desk-dream-home-dialog .dh-body').hover();await page.mouse.wheel(0,140);await page.waitForTimeout(250);}
 const beforeSwitch=await state('主题切换前的内容与阅读位置');
 await page.locator('#style-nav button[data-theme-id="comic"]').click();await page.keyboard.press('ArrowRight');await scene('cyberpunk');
 const switched=await state('面板保持打开，选择器内按ArrowRight切到Cyberpunk');
 report.checks.keyboardThemeSwitch=switched.theme==='cyberpunk'&&await page.locator('#style-nav button[data-theme-id="cyberpunk"]').getAttribute('aria-pressed')==='true';
 report.checks.sameDialogNodeAfterTheme=await page.evaluate(el=>el===document.querySelector('#desk-dream-home-dialog'),dialog);
 report.checks.panelRemainsOpen=switched.panel==='dream-home'&&switched.openDialogs.includes('desk-dream-home-dialog');report.checks.sameContentAfterTheme=switched.body.text===beforeSwitch.body.text;report.checks.sameDestinationAfterTheme=switched.cta===beforeSwitch.cta;report.checks.readingPosition={before:beforeSwitch.body.scrollTop,after:switched.body.scrollTop,scrollWasPossible:beforeSwitch.body.scrollHeight>beforeSwitch.body.clientHeight+5};
 await capture('project-cyberpunk','02 切换主题 · 同一项目继续阅读',3);
 await page.locator('#desk-dream-home-dialog .desk-panel-back').click();await page.waitForTimeout(750);await scene('cyberpunk');const returned=await state('点击返回桌面');report.checks.returnButtonClosesPanel=returned.openDialogs.length===0&&returned.panel===null;report.checks.returnFocusToObject=returned.focused.id==='dream-home-toy';report.checks.cameraRestored=returned.sceneTransform===initial.sceneTransform&&returned.artboardTransform===initial.artboardTransform;await capture('desktop-return','03 返回桌面 · 保留Cyberpunk主题',4);
 await page.locator('#open-dream-home').click();await page.locator('#desk-dream-home-dialog[open]').waitFor();await page.waitForTimeout(400);const viaText=await state('点击顶部理想之家文字入口');report.checks.textAndObjectSameDialog=await page.evaluate(el=>el===document.querySelector('#desk-dream-home-dialog'),dialog);report.checks.textAndObjectSameContent=viaText.body.text===opened.body.text;report.checks.textAndObjectSameDestination=viaText.cta===opened.cta;await capture('project-text-entry','文字入口 · 到达同一项目面板',5);
 await page.keyboard.press('Escape');await page.waitForTimeout(750);const escaped=await state('按Escape返回文字入口');report.checks.escapeClosesPanel=escaped.openDialogs.length===0;report.checks.escapeFocusToText=escaped.focused.id==='open-dream-home';
 report.contentSHA256={object:hash(opened.body.text),afterTheme:hash(switched.body.text),textEntry:hash(viaText.body.text)};
 const bools=Object.entries(report.checks).filter(([,v])=>typeof v==='boolean');report.failedChecks=bools.filter(([,v])=>!v).map(([k])=>k);
 console.log(JSON.stringify({checks:report.checks,failedChecks:report.failedChecks,shots:manifest.length,errors},null,2));
}catch(error){report.error=String(error);console.log('ERROR',String(error));}
finally{report.finishedAt=new Date().toISOString();report.blockedRequests=blocked;report.pageErrors=errors;report.noAIMessages=true;await fs.writeFile(path.join(output,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');await fs.writeFile(path.join(root,'docs/revision-personal-results.json'),JSON.stringify(report,null,2)+'\n');await browser.close();}

async function deriveCrops(){
 const manifestPath=path.join(output,'manifest.json'),entries=JSON.parse(await fs.readFile(manifestPath,'utf8'));
 const crops=[
 {id:'object-hover-detail',source:'object-hover',title:'木屋入口与实际悬停标签',crop:{left:410,top:744,width:350,height:335}},
 {id:'theme-keyboard-focus',source:'project-cyberpunk',title:'实际键盘焦点 · Cyberpunk选择器',crop:{left:780,top:1080,width:365,height:110}},
 {id:'text-entry-detail',source:'project-text-entry',title:'顶部文字入口 · 当前项目选中',crop:{left:1320,top:15,width:148,height:85}},
 {id:'task-open',source:'project-comic',title:'01 打开项目 · Comic标题与返回入口',crop:{left:200,top:0,width:1720,height:360}},
 {id:'task-themed',source:'project-cyberpunk',title:'02 切换主题 · 同一项目标题与返回入口',crop:{left:200,top:0,width:1720,height:360}},
 {id:'task-return',source:'desktop-return',title:'03 返回桌面 · 原木屋入口所在区域',crop:{left:380,top:800,width:1340,height:300}},
 {id:'task-open-controls',source:'project-comic',title:'01 Comic · 已选项目标题与返回桌面按钮',crop:{left:1300,top:20,width:400,height:180}},
 {id:'task-themed-controls',source:'project-cyberpunk',title:'02 Cyberpunk · 同一已选项目与返回桌面按钮',crop:{left:1300,top:20,width:400,height:180}},
 {id:'task-content-comic',source:'project-comic',title:'01 Comic · 理想之家项目正文',crop:{left:980,top:364,width:700,height:130}},
 {id:'task-content-cyberpunk',source:'project-cyberpunk',title:'02 Cyberpunk · 保留同一段项目正文',crop:{left:980,top:350,width:700,height:130}}
 ];
 const selected=process.argv.includes('--derive-content')?crops.filter(item=>item.id.startsWith('task-content-')):crops;
 for(const item of selected){const source=entries.find(e=>e.id===item.source);if(!source)continue;
 const pipeline=sharp(await fs.readFile(path.join(root,'public',source.image))).extract(item.crop),jpg=await pipeline.clone().jpeg({quality:94,mozjpeg:true}).toBuffer(),webp=await pipeline.clone().webp({quality:94}).toBuffer();
 if(jpg.length>400000||webp.length>400000)throw Error('Crop budget exceeded');
 await fs.writeFile(path.join(output,item.id+'.jpg'),jpg);await fs.writeFile(path.join(output,item.id+'.webp'),webp);
 const entry={id:item.id,title:item.title,kind:'derived-crop',sourceImage:source.image,sourceURL:source.sourceURL,sourceCapturedAt:source.date,date:new Date().toISOString(),cropPixels:item.crop,image:'/revised/personal/'+item.id+'.jpg',webp:'/revised/personal/'+item.id+'.webp',bytes:jpg.length,webpBytes:webp.length,width:item.crop.width,height:item.crop.height,caption:'真实交互截图像素裁切，未改动界面。第三方素材权利归原权利人，非商业展示。'};
 const index=entries.findIndex(e=>e.id===entry.id);if(index<0)entries.push(entry);else entries[index]=entry;
 }
 await fs.writeFile(manifestPath,JSON.stringify(entries,null,2)+'\n');
}
await deriveCrops();
