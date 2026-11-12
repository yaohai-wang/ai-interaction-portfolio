import {launch,context,capture,settle} from './browser.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import sharp from 'sharp';
import {spawnSync} from 'node:child_process';
const project=path.resolve(import.meta.dirname,'..');
process.chdir(project);
const repo='/Users/youkaiou/Desktop/个人介绍/portfolio-web';
const out=path.join(project,'public/shots/personal');
const historyRoot=path.join(project,'tmp/history');
await fs.mkdir(out,{recursive:true});
await fs.mkdir(historyRoot,{recursive:true});
const manifest=[];
const errors=[];
const captions='来源：Kai 个人站界面截图；第三方角色形象与品牌标识权利归原作品及各权利人，非商业展示。';
const themes=[['comic','Comic'],['cyberpunk','Cyberpunk'],['pixel','Pixel'],['blueprint','Blueprint'],['retro','Retro Computer']];
const browser=await launch();
const ctx=await context(browser);
// The public context rejects non-read methods. Block model endpoints as an
// additional guard, including the personal site's desk-chat name.
await ctx.route('**/api/desk-chat',route=>route.abort());
async function save(page,name,title,info={}){
 const result=await capture(page,'personal/'+name);
 const webpPath=path.join(out,name+'.webp');let q=78,buf;do{buf=await sharp(path.join(out,name+'.jpg')).webp({quality:q}).toBuffer();q-=6;}while(buf.length>400000&&q>25);await fs.writeFile(webpPath,buf);if(buf.length>400000)throw Error('WebP exceeds budget');
 const record={title,image:result.image,webp:result.image.replace(/\.jpg$/,'.webp'),kind:'screenshot',date:new Date().toISOString().slice(0,10),caption:captions,...info};
 manifest.push(record);console.log(JSON.stringify({saved:record.image,title,bytes:result.bytes}));
}
async function waitScene(page,theme){
 await page.locator('#current-layer[data-scene-status="ready"]'+(theme?'[data-scene-theme="'+theme+'"]':'')).waitFor({state:'visible',timeout:60000});
 await page.evaluate(async()=>{await Promise.all([...document.querySelectorAll('#scene-image,#window-image')].map(i=>i.decode()));});
 await settle(page);
}
async function live(){
 const page=await ctx.newPage();
 try{
 await page.goto('https://youkai-ou.com/',{waitUntil:'domcontentloaded',timeout:45000});
 console.log(JSON.stringify({url:page.url(),title:await page.title(),buttons:await page.locator('button').evaluateAll(bs=>bs.map(b=>({id:b.id,text:b.innerText,theme:b.dataset.themeId})).filter(b=>b.id||b.theme))}));
 if(process.argv.includes('--probe')){return;}
 await waitScene(page);
 if(await page.locator('#boom-sound[aria-pressed="true"]').count())await page.locator('#boom-sound').click();
 for(const [id,label] of (process.argv.includes('--cards-only')?[]:themes)){
  try{
   await page.locator('#reset-view').click();
   await page.locator('#style-nav [data-theme-id="'+id+'"]').click();
   await waitScene(page,id);
   await save(page,id,'桌面平行宇宙 · '+label,{sourceURL:'https://youkai-ou.com/',theme:id,kind:'live'});
  }catch(e){errors.push({task:'live-'+id,error:e.message});}
 }
 await page.locator('#style-nav [data-theme-id="comic"]').click();await waitScene(page,'comic');
 for(const [id,name,title] of [['open-chat','chat-empty','AI 分身 · 空态'],['open-dream-home','ideal-home-card','理想之家 · 项目介绍'],['open-f1','f1-card','围场助手 · 项目介绍']]){
  try{
   await page.keyboard.press('Escape');await settle(page);await page.locator('#reset-view').click();await page.locator('#'+id).click();await settle(page);
   await save(page,name,title,{sourceURL:'https://youkai-ou.com/',kind:'live'});
  }catch(e){errors.push({task:name,error:e.message});}
 }
 }catch(e){errors.push({task:'live',error:e.message});}
 finally{await page.close();}
}
function command(args,cwd){const r=spawnSync(args[0],args.slice(1),{cwd,env:{...process.env,GIT_OPTIONAL_LOCKS:'0'},encoding:'utf8',timeout:60000,maxBuffer:16*1024*1024});if(r.status!==0)throw new Error((r.error?.message||r.stderr||r.stdout||'command failed').slice(0,2000));return r.stdout;}
async function serve(root){
 const types={'.html':'text/html;charset=utf-8','.js':'text/javascript;charset=utf-8','.css':'text/css;charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.json':'application/json','.webp':'image/webp','.mp3':'audio/mpeg','.woff2':'font/woff2'};
 const server=http.createServer(async(req,res)=>{try{if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}const url=new URL(req.url,'http://localhost');if(url.pathname.startsWith('/api/')){res.writeHead(503,{'Content-Type':'application/json'});res.end('{"error":"archived-static-preview"}');return;}let p=path.resolve(root,'.'+decodeURIComponent(url.pathname));if(!p.startsWith(root+path.sep)&&p!==root){res.writeHead(403);res.end();return;}if((await fs.stat(p)).isDirectory())p=path.join(p,'index.html');const bytes=await fs.readFile(p);res.writeHead(200,{'Content-Type':types[path.extname(p)]||'application/octet-stream'});res.end(req.method==='HEAD'?undefined:bytes);}catch{res.writeHead(404);res.end();}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));return {server,url:'http://127.0.0.1:'+server.address().port};
}
async function history(){
 for(const commit of ['30c007c','aea24b5','0deaeef']){
  const minimal=!process.argv.includes('--full-history');const suffix=minimal?'-minimal':'';const dir=path.join(historyRoot,'personal-'+commit+suffix);const tar=path.join(historyRoot,'personal-'+commit+suffix+'.tar');let server,page;
  try{
   console.log('Archiving personal '+commit);
   await fs.mkdir(dir,{recursive:true});
   if(!await fs.stat(path.join(dir,'dist/desk-universes.html')).catch(()=>false)){
    let paths=['dist'];
    if(minimal){const files=command(['git','-C',repo,'ls-tree','--name-only',commit+':dist']).trim().split('\n');paths=files.filter(f=>/\.(js|css|html|svg)$/.test(f)).map(f=>'dist/'+f);if(commit==='0deaeef'){paths.push('dist/ui','dist/assets/desk-themes/scenes/comic.png','dist/assets/desk-themes/windows/comic.png','dist/assets/desk-current/window-alpha.png','dist/assets/ui-boom');}else{paths.push('dist/assets/desk-universes/unified-scene/comic.png','dist/assets/desk-universes/kai-backgrounds/02-comic.png','dist/assets/desk-universes/approved-window-mask.png','dist/assets/desk-materials/comic.svg');if(commit==='aea24b5')paths.push('dist/assets/desk-universes/approved-window-alpha-v2.png');}}
    command(['git','-C',repo,'archive','--format=tar','--output='+tar,commit,...paths]);
    command(['tar','-xf',tar,'-C',dir]);await fs.unlink(tar);
   }
   const meta=command(['git','-C',repo,'show','-s','--format=%aI%n%s',commit]).trim().split('\n');
   const service=await serve(path.join(dir,'dist'));server=service.server;
   page=await ctx.newPage();await page.goto(service.url+'/desk-universes.html#comic',{waitUntil:'domcontentloaded',timeout:45000});
   // Historic revisions have different selectors. Use only real UI controls.
   if(await page.locator('#style-nav [data-theme-id="comic"]').count()){
    await page.locator('#style-nav [data-theme-id="comic"]').click();await waitScene(page,'comic');
   }else{
    console.log(JSON.stringify({commit,buttons:await page.locator('#style-nav button').evaluateAll(bs=>bs.map(b=>({text:b.textContent,label:b.getAttribute('aria-label'),dataset:b.dataset})))}));
    const comic=page.locator('#style-nav button').filter({hasText:/comic/i});
    if(await comic.count())await comic.first().click();
    else if(await page.locator('#style-nav button[data-style="comic"]').count())await page.locator('#style-nav button[data-style="comic"]').click();
    await page.locator('#desk-app[data-style=\"comic\"]').waitFor({state:'visible',timeout:30000});await page.waitForTimeout(1200);
    await page.evaluate(async()=>{await Promise.all([...document.images].filter(i=>!i.hidden&&i.src).map(i=>i.decode().catch(()=>{})));});
    await settle(page);
   }
   await save(page,'history-'+commit,commit+' · '+meta[1],{kind:'history',commit,date:meta[0],sourceURL:repo,caption:'来源：个人站 Git '+commit+' 的本地静态还原；'+captions});
  }catch(e){errors.push({task:'history-'+commit,error:e.message});console.log('History failed '+commit+': '+e.message);}
  finally{await page?.close();if(server)await new Promise(r=>server.close(r));}
 }
}
try{
 if(!process.argv.includes('--history-only'))await live();
 if(!process.argv.includes('--live-only')&&!process.argv.includes('--cards-only')&&!process.argv.includes('--probe'))await history();
 if(!process.argv.includes('--probe')){
  // Preserve previous assets when rerunning just one stage.
  const previous=JSON.parse(await fs.readFile(path.join(out,'manifest.json'),'utf8').catch(()=>'[]'));
  const map=new Map(previous.map(x=>[x.image,x]));manifest.forEach(x=>map.set(x.image,x));
  await fs.writeFile(path.join(out,'manifest.json'),JSON.stringify([...map.values()],null,2)+'\n');
  const reportFile=path.join(out,process.argv.includes('--full-history')?'capture-report.json':'history-minimal-report.json');await fs.writeFile(reportFile,JSON.stringify({captured:manifest.length,errors},null,2)+'\n');
 }
 console.log(JSON.stringify({captured:manifest.length,errors}));
}finally{await browser.close();}
