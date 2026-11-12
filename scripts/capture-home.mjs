import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn,execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';
import {launch,context,capture,settle} from './browser.mjs';
const run=promisify(execFile);
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
process.chdir(root);
const repo='/Users/youkaiou/Desktop/生活成长app';
const out=path.join(root,'public/shots/home');
const manifest=[];const notes=[];
const date='2026-11-12';
const historyCommits=['429ee53','97bd65f','8c468d4'];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function shot(page,name,title,meta={}){
  await settle(page);
  console.log('capturing',name);
  const result=await capture(page,`home/${name}`,{timeout:120000});
  const row={title,...result,webp:`/shots/home/${name}.webp`,kind:'online',sourceURL:page.url(),date,caption:'原产品实际界面；隔离浏览器只读截图，未发送 AI 请求。',...meta};
  manifest.push(row);console.log('captured',name,result.bytes);
  await fs.writeFile(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2));
}
async function enter(page){
  const skip=page.getByRole('button',{name:/跳过动画/});
  if(await skip.first().isVisible().catch(()=>false))await skip.first().click();
  else {
    const local=page.locator('.local-login');
    if(await local.isVisible().catch(()=>false)){await local.click();await page.waitForTimeout(2200);}
    const sk=page.getByRole('button',{name:/跳过动画/});
    if(await sk.first().isVisible().catch(()=>false))await sk.first().click();
    else {const bt=page.getByRole('button',{name:/进屋坐坐|进入世界|进入小屋|进入我的/});if(await bt.first().isVisible().catch(()=>false))await bt.first().click();}
  }
  await page.locator('.home-game').waitFor({state:'visible',timeout:45000});
  await page.waitForTimeout(2000);
}
async function route(page,hash){await page.evaluate(h=>{location.hash=h},`#/${hash}`);await page.waitForTimeout(1400);}
async function online(browser){
 const ctx=await context(browser);const page=await ctx.newPage();page.setDefaultTimeout(25000);
 const blocked=[];page.on('requestfailed',r=>{if(!['GET','HEAD','OPTIONS'].includes(r.method()))blocked.push({method:r.method(),url:r.url()})});
 try{
  await page.goto('https://home.youkai-ou.com/',{waitUntil:'domcontentloaded',timeout:90000});
  await page.locator('.welcome').waitFor({timeout:60000});
  await page.waitForFunction(()=>document.querySelector('.welcome')?.dataset.assetsReady==='true',{timeout:60000});
  await shot(page,'welcome','日期、季节与可拖动浮岛');
  await enter(page);
  await page.waitForTimeout(3500);await shot(page,'room','默认室内视角');
  for(const [hash,name,title,selector] of [
   ['goals','journal','今日手记：无愿景时的引导空态','.journal-panel'],
   ['life','vision','愿景板：从愿景开始','.module-shell--life'],
   ['shop','shop','家具商店：成长积分兑换入口','.module-shell--shop'],
   ['furnish','furnish','布置房间：编辑工具的初始状态','.furnish-dock'],
   ['archive','archive','生活档案：篇章与记录','.module-shell--archive'],
  ]){await route(page,hash);await page.locator(selector).waitFor({state:'visible'});await shot(page,name,title);}
  await route(page,'space');
  for(const [label,name,title] of [['整栋','whole-house','整栋视角'],['第一视角','first-person','第一视角']]){
   await page.getByRole('button',{name:'视角与楼层',exact:true}).click();
   await page.getByRole('button',{name:label,exact:true}).click();
   await shot(page,name,title);
  }
  await route(page,'showroom');
  await page.locator('canvas').first().waitFor({state:'visible'});
  await page.waitForTimeout(4000);await shot(page,'showroom','样板间：无需修改个人房间的参观入口');
  notes.push(`线上截图完成 ${manifest.filter(x=>x.kind==='online').length} 张；非 GET 请求拦截记录 ${blocked.length} 条。所有模型生成按钮未点击。`);
 }catch(error){notes.push(`线上截图异常：${error.message}`);console.error('online',error.message);}
 finally{await ctx.close();}
}
async function archive(commit){
 const dir=path.join(root,'tmp/history',`home-${commit}`);await fs.mkdir(dir,{recursive:true});
 // Export committed files only. No checkout or writes in the source repository.
 const tar=path.join(root,'tmp/history',`home-${commit}.tar`);
 try {
  await run('git',['--no-optional-locks','-C',repo,'archive','--format=tar','--output',tar,commit,'src','public','index.html','package.json','vite.config.ts','tsconfig.json'],{timeout:180000});
  await run('tar',['-xf',tar,'-C',dir],{timeout:120000});
 } finally { await fs.rm(tar,{force:true}); }
 const modules=path.join(dir,'node_modules');await fs.mkdir(modules,{recursive:true});
 // Each package is read-only via symlink; Vite's own .vite and .vite-temp folders
 // remain in this exported copy, never in the original node_modules.
 for(const entry of await fs.readdir(path.join(repo,'node_modules'),{withFileTypes:true})){
  if(entry.name.startsWith('.'))continue;
  const target=path.join(modules,entry.name);try{await fs.symlink(path.join(repo,'node_modules',entry.name),target,'dir');}catch(e){if(e.code!=='EEXIST')throw e;}
 }
 await fs.writeFile(path.join(dir,'portfolio.vite.mjs'),`import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nexport default defineConfig({plugins:[react()],cacheDir:${JSON.stringify(path.join(dir,'node_modules/.vite'))},optimizeDeps:{entries:['index.html']},server:{host:'127.0.0.1',strictPort:true}});\n`);
 return dir;
}
async function warmHistoryObjects(){
 const hashes=new Set();
 for(const commit of historyCommits){
  const {stdout}=await run('git',['--no-optional-locks','-C',repo,'ls-tree','-r','--format=%(objectname)',commit,'src','public','index.html','package.json','vite.config.ts','tsconfig.json'],{timeout:60000});
  stdout.trim().split('\n').filter(Boolean).forEach(x=>hashes.add(x));
 }
 const list=[...hashes];let cursor=0;
 await Promise.all(Array.from({length:6},async()=>{for(;;){const i=cursor++;if(i>=list.length)return;await run('git',['--no-optional-locks','-C',repo,'cat-file','blob',list[i]],{timeout:90000,maxBuffer:40*1024*1024}).catch(()=>{});}}));
 console.log('read-only object warmup',list.length);
}
async function history(browser){
 await warmHistoryObjects();
 for(const [index,commit] of historyCommits.entries()){
  let server;let ctx;
  try{
   console.log('archive',commit);const dir=await archive(commit);const port=4411+index;
   const meta=(await run('git',['--no-optional-locks','-C',repo,'show','-s','--format=%H%n%aI%n%s',commit],{timeout:60000})).stdout.trim().split('\n');
   server=spawn(process.execPath,[path.join(repo,'node_modules/vite/bin/vite.js'),'--config',path.join(dir,'portfolio.vite.mjs'),'--host','127.0.0.1','--port',String(port)],{cwd:dir,env:{...process.env,BROWSER:'none'},stdio:['ignore','pipe','pipe']});
   let log='';server.stdout.on('data',b=>{log+=b});server.stderr.on('data',b=>{log+=b});
   const url=`http://127.0.0.1:${port}/`;let ready=false;
   for(let i=0;i<90;i++){try{const r=await fetch(url);if(r.ok){ready=true;break}}catch{}if(server.exitCode!==null)break;await sleep(1000)}
   await fs.writeFile(path.join(dir,'portfolio-server.log'),log);
   if(!ready)throw new Error(`Vite 未启动：${log.slice(-1000)}`);
   ctx=await context(browser);
   // Local-only session response replaces unavailable archive backend. No AI output,
   // saved goals, actions, balance edits or fabricated user data are supplied.
   await ctx.route('**/api/account/session',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({configured:false,user:null,storage:'local'})}));
   const page=await ctx.newPage();page.setDefaultTimeout(45000);
   await page.goto(url,{waitUntil:'domcontentloaded',timeout:90000});
   await page.locator('.welcome').waitFor({state:'visible',timeout:90000});await page.waitForTimeout(6500);
   await shot(page,`history-${commit}-welcome`,`${meta[1].slice(0,10)} · 入口快照 ${commit}`,{kind:'history',sourceURL:undefined,commit:meta[0],date:meta[1].slice(0,10),caption:`git archive 本地复现；${meta[2]}。日期为提交时间；未调用真实后端或 AI。`});
   await enter(page);
   await shot(page,`history-${commit}-room`,`${meta[1].slice(0,10)} · 房间快照 ${commit}`,{kind:'history',sourceURL:undefined,commit:meta[0],date:meta[1].slice(0,10),caption:`git archive 本地复现；${meta[2]}。隔离浏览器初始房间；仅本地登录状态使用静态响应。`});
   notes.push(`历史 ${commit} 已导出并运行；提交时间 ${meta[1]}；${meta[2]}。`);
  }catch(error){notes.push(`历史 ${commit} 跳过或部分完成：${error.killed?'命令达到超时上限；':''}${error.message}`);console.error('history',commit,error.message)}
  finally{if(ctx)await ctx.close();if(server){server.kill('SIGTERM');await sleep(500);if(server.exitCode===null)server.kill('SIGKILL')}}
 }
}
async function main(){
 await fs.mkdir(out,{recursive:true});
 if(process.argv.includes('--history-only')||process.argv.includes('--online-only')){const keep=process.argv.includes('--history-only')?'online':'history';try{manifest.push(...JSON.parse(await fs.readFile(path.join(out,'manifest.json'),'utf8')).filter(x=>x.kind===keep))}catch{}}
 const browser=await launch();try{if(!process.argv.includes('--history-only'))await online(browser);if(!process.argv.includes('--online-only'))await history(browser)}finally{await browser.close()}
 await fs.writeFile(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2));
 const report=`# 理想生活素材与复现记录\n\n采集日期 ${date}。源码仓库只读，写入限本 portfolio。\n\n## 复跑\n\n\`node scripts/capture-home.mjs\`（全量）；\`--online-only\` 或 \`--history-only\` 可单独执行。需要本机 Chrome、项目依赖、源仓库现存依赖。\n\n## 采集约束\n\n1440×900、DPR2、zh-CN、Asia/Shanghai；统一 JPEG + WebP；JPEG 不超过 400KB。浏览器新建隔离上下文，公共请求拦截器禁止非 GET/HEAD/OPTIONS 请求及模型路径；不填写、提交、购买、保存、AI 生成。打开页面产生的初始存档仅在该临时浏览器上下文。\n\n历史版本使用 git archive 到 tmp/history/home-*；逐包只读链接原仓库依赖，Vite 缓存与临时 config 全部留在导出副本。纯前端运行，/api/account/session 使用 {configured:false,user:null,storage:'local'} 静态响应，只让本地体验可进入；未注入用户愿景/行动或伪造 AI 结果。\n\n## 结果\n\n${notes.map(x=>'- '+x).join('\n')}\n\n## 素材\n\n| 图 | 类型 | 来源 |\n|---|---|---|\n${manifest.map(x=>`| ${x.title} | ${x.kind} | ${x.sourceURL||x.commit} |`).join('\n')}\n\n## 迭代对比\n\n推荐同一构图使用 history-97bd65f-welcome → welcome：2026-10-17 旧入口与当前浮岛。浮岛改版提交 8c468d4（2026-10-18）。设计理由仅采用 docs/design/welcome-island/CODEX_TASK.md:18-23 的“去掉玻璃卡片、改左文案右浮岛、保留现有语言和进入逻辑”；不声称用户指标提升。history-8c468d4-room → room 可检查样板间入口大小，后续提交 78d0202 明确 make showroom entrance smaller and less prominent。\n\n当前产品名称为理想生活（统一名称 TODO(Kai)）；图中时间、积分为产品真实界面初始化状态，不能解释为个人成果。历史提交日期不是实际项目起止日期。线上未来图片功能 image:false，不提供生成成功截图。AI 候选结果需 Kai 提供真实公开录屏或明确授权，不用合成结果冒充。\n`;
 await fs.writeFile(path.join(root,'docs/assets-home.md'),report);console.log('done',manifest.length,'images');
}
await main();
