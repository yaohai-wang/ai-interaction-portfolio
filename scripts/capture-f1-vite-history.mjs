import fs from 'node:fs/promises';
import { chromium } from 'playwright';
import path from 'node:path';
import http from 'node:http';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {launch,context,capture,settle} from './browser.mjs';
const root=process.cwd(),repo='/Users/youkaiou/Desktop/F1';
const selected=(process.env.F1_VITE_COMMITS||'36e5c70,f7c61d3').split(',');const shots=[],reports=[];
for(const commit of selected){
 const dir=path.join(root,'tmp/history/f1-'+commit),hosted=path.join(dir,'hosted');let browser,server;
 try{
  if(!await fs.stat(path.join(hosted,'browser/index.html')).catch(()=>null)){
   await fs.mkdir(dir,{recursive:true});const paths=commit==='36e5c70'?['hosted','messages']:['hosted','messages','src/styles'];
   const archive=execFileSync('git',['archive',commit,...paths],{cwd:repo,maxBuffer:32*1024*1024});execFileSync('tar',['-xf','-','-C',dir],{input:archive});
  }
  if(!await fs.stat(path.join(dir,'messages/zh.json')).catch(()=>null)){const archive=execFileSync('git',['archive',commit,'messages'],{cwd:repo,maxBuffer:2*1024*1024});execFileSync('tar',['-xf','-','-C',dir],{input:archive});}
  if(!await fs.stat(path.join(hosted,'node_modules')).catch(()=>null))await fs.symlink('/private/tmp/pitwall-hosted-clean-20261018/node_modules',path.join(hosted,'node_modules'));
  if(!await fs.stat(path.join(hosted,'dist/client/index.html')).catch(()=>null))execFileSync(process.execPath,['/private/tmp/pitwall-hosted-clean-20261018/node_modules/vite/bin/vite.js','build','--config','browser/vite.config.ts'],{cwd:hosted,encoding:'utf8',timeout:90000});
  const data=JSON.parse(await fs.readFile(path.join(hosted,'data/initial-data.json'),'utf8'));const files={},bodies={};
  for(const [key,value] of Object.entries(data)){const body=JSON.stringify(value),hash=createHash('sha256').update(body).digest('hex');files[key]={hash,url:'/seed/'+hash+'.json'};bodies['/seed/'+hash+'.json']=body;}
  const manifest={version:commit,files,assistantEnabled:false};
  server=http.createServer(async(req,res)=>{
   const route=new URL(req.url,'http://local').pathname;
   if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405).end();return;}
   if(route==='/api/public/manifest'){res.setHeader('content-type','application/json');res.end(JSON.stringify(manifest));return;}
   if(bodies[route]){res.setHeader('content-type','application/json');res.end(bodies[route]);return;}
   if(route.startsWith('/api/')){res.writeHead(404).end();return;}
   const ext=path.extname(route);const rel=route.replace(/^\/+/, '');
   if(rel.split('/').includes('..')){res.writeHead(400).end();return;}
   let file=path.join(hosted,'dist/client',ext?rel:'index.html');
   if(!await fs.stat(file).catch(()=>null))file=path.join(hosted,'public',rel);
   try{const content=await fs.readFile(file);res.setHeader('content-type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.ttf':'font/ttf'}[path.extname(file)]||'application/octet-stream'));res.end(content);}catch{res.writeHead(404).end();}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
  browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox']});const ctx=await context(browser);await ctx.addInitScript(()=>{const Original=Date;const fixed=Date.parse('2026-10-18T00:00:00Z');window.Date=class extends Original{constructor(...a){super(...(a.length?a:[fixed]));}static now(){return fixed;}};});const page=await ctx.newPage();
  await page.goto(base+'/zh/home',{waitUntil:'domcontentloaded',timeout:45000});await page.locator('.bento').waitFor({timeout:30000});await settle(page);
  await page.evaluate(async()=>Promise.race([Promise.all([...document.images].filter(i=>i.getBoundingClientRect().top<innerHeight).map(i=>i.decode().catch(()=>{}))),new Promise(r=>setTimeout(r,10000))]));
  const result=await capture(page,'f1/history-'+commit+'-home',{animations:'allow',timeout:60000});
  const date=execFileSync('git',['show','-s','--format=%cI',commit],{cwd:repo,encoding:'utf8'}).trim();
  shots.push({id:'history-'+commit+'-home',title:(commit==='36e5c70'?'统一材质前':'统一材质后')+' · 历史客户端',kind:'git-archive',commit,date,capturedAt:new Date().toISOString(),sourceRepository:repo,sourceURL:base+'/zh/home',...result,webp:'/shots/f1/history-'+commit+'-home.webp',caption:'git archive '+commit+'；原 Vite 客户端与该提交的公开 seed 本地运行，显示时钟固定 2026-10-18。仅以只读本地 manifest 适配静态文件，助手关闭；原页面代码未改。官方赛车素材权利归原权利人；非商业展示。'});
  reports.push({commit,status:'captured',adapter:'Read-only local manifest and archived public seed; original client source unchanged.'});console.log(commit,result.bytes);
 }catch(e){reports.push({commit,status:'failed',error:String(e)});console.log(commit,'failed',String(e));}
 finally{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r));}
}
const out=path.join(root,'public/shots/f1');let history=[];try{history=JSON.parse(await fs.readFile(path.join(out,'history.json'),'utf8'));}catch{}
history=[...history.filter(x=>!shots.some(y=>y.id===x.id)),...shots];await fs.writeFile(path.join(out,'history.json'),JSON.stringify(history,null,2)+'\n');let previousReports=[];try{previousReports=JSON.parse(await fs.readFile(path.join(out,'vite-history-report.json'),'utf8'));}catch{}
await fs.writeFile(path.join(out,'vite-history-report.json'),JSON.stringify([...previousReports.filter(x=>!reports.some(y=>y.commit===x.commit)),...reports],null,2)+'\n');
let manifest=[];try{manifest=JSON.parse(await fs.readFile(path.join(out,'manifest.json'),'utf8'));}catch{}
await fs.writeFile(path.join(out,'manifest.json'),JSON.stringify([...manifest.filter(x=>!history.some(y=>y.id===x.id)),...history],null,2)+'\n');
