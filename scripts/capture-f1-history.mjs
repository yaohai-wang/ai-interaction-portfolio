import fs from 'node:fs/promises';
import { chromium } from 'playwright';
import path from 'node:path';
import {spawn,execFileSync} from 'node:child_process';
import {launch,context,capture,settle} from './browser.mjs';
const root=process.cwd(),repo='/Users/youkaiou/Desktop/F1';
const versions=[{commit:'460ef77',title:'内页刷新前',date:'2026-10-17T21:41:52+09:00'},{commit:'1e17a79',title:'内页 P0–P10 接入后',date:'2026-10-18T10:24:32+09:00'},{commit:'36e5c70',title:'磨砂圆角前',date:'2026-10-18T15:13:02+09:00'}];
const only=process.env.F1_HISTORY_COMMIT;
const selected=only?versions.filter(v=>v.commit===only):versions;
const output=path.join(root,'public/shots/f1');await fs.mkdir(output,{recursive:true});
const reports=[],shots=[];
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox']});
try{
 for(let i=0;i<selected.length;i++){
  const v=selected[i],dir=path.join(root,'tmp/history/f1-'+v.commit),port=Number(process.env.F1_HISTORY_PORT||4421)+i;
  await fs.mkdir(dir,{recursive:true});
  if(!await fs.stat(path.join(dir,'ARCHIVE_SOURCE.json')).catch(()=>null)){
   const names=execFileSync('git',['ls-tree','--name-only',v.commit],{cwd:repo,encoding:'utf8'}).trim().split('\n');
   const files=['src','public','data','messages','config','scripts','package.json','pnpm-lock.yaml','next.config.ts','tsconfig.json','postcss.config.mjs','next-env.d.ts'].filter(n=>names.includes(n));
   const tar=execFileSync('git',['archive',v.commit,...files],{cwd:repo,maxBuffer:100*1024*1024});
   execFileSync('tar',['-xf','-','-C',dir],{input:tar});
   await fs.writeFile(path.join(dir,'ARCHIVE_SOURCE.json'),JSON.stringify({repo,commit:execFileSync('git',['rev-parse',v.commit],{cwd:repo,encoding:'utf8'}).trim(),paths:files},null,2));
  }
  if(!await fs.stat(path.join(dir,'node_modules')).catch(()=>null))await fs.symlink(path.join(repo,'node_modules.nosync'),path.join(dir,'node_modules'));
  let server=null,logs='';const externalBase=process.env.F1_HISTORY_BASE;
  const base=externalBase||'http://127.0.0.1:'+port;
  try{
   if(!externalBase){
    const start=()=>{const proc=spawn(process.execPath,[path.join(repo,'node_modules.nosync/next/dist/bin/next'),'dev','--webpack','--hostname','127.0.0.1','--port',String(port)],{cwd:dir,env:{...process.env,PAID_AI_DISABLED:'1',ASSISTANT_ENABLED:'false',ASSISTANT_CLOUD_ONLY:'true'},stdio:['ignore','pipe','pipe']});proc.stdout.on('data',b=>{logs+=b;});proc.stderr.on('data',b=>{logs+=b;});return proc;};
    server=start();
    const begin=Date.now();let retried=false;
    while(Date.now()-begin<90000){
     if(server.exitCode!==null){if(!retried&&logs.includes('Retry the same command')){server=start();retried=true;}else throw Error('Archive server exited: '+logs.slice(-1800));}
     if(logs.includes('Ready in'))break;await new Promise(r=>setTimeout(r,500));
    }
   }
   const ctx=await context(browser),page=await ctx.newPage();
   // Equal display clock for archive screenshots; numerical results remain the archive's saved data.
   await ctx.addInitScript(()=>{const NativeDate=Date;const fixed=Date.parse('2026-10-18T00:00:00Z');window.Date=class extends NativeDate{constructor(...args){super(...(args.length?args:[fixed]));}static now(){return fixed;}};});
   const response=await page.goto(base+'/zh/home',{waitUntil:'domcontentloaded',timeout:90000});
   if(!response?.ok())throw Error('HTTP '+response?.status());
   await page.locator('main').first().waitFor({timeout:30000});await settle(page);
   await page.evaluate(async()=>{await Promise.race([Promise.all([...document.images].map(im=>im.decode().catch(()=>{}))),new Promise(r=>setTimeout(r,12000))]);});
   if(await page.getByText('Build Error',{exact:true}).count())throw Error('Next build error');
   const result=await capture(page,'f1/history-'+v.commit+'-home');
   shots.push({id:'history-'+v.commit+'-home',title:v.title+' · 首页',kind:'git-archive',commit:v.commit,date:v.date,capturedAt:new Date().toISOString(),sourceURL:base+'/zh/home',sourceRepository:repo,...result,webp:'/shots/f1/history-'+v.commit+'-home.webp',caption:'从 git archive '+v.commit+' 本地运行截图；显示时钟固定 2026-10-18，数据保留该提交快照。官方赛车素材权利归原权利人；非商业展示。'});
   await ctx.close();reports.push({commit:v.commit,status:'captured',log:logs.slice(-4000)});console.log(v.commit,'captured',result.bytes);
  }catch(error){reports.push({commit:v.commit,status:'failed',error:String(error),log:logs.slice(-5000)});console.log(v.commit,'failed',String(error));}
  finally{if(server){server.kill('SIGTERM');await new Promise(r=>setTimeout(r,600));}}
 }
}finally{await browser.close();}
let previous=[];try{previous=JSON.parse(await fs.readFile(path.join(output,'history.json'),'utf8'));}catch{}
const combined=[...previous.filter(x=>!shots.some(y=>y.id===x.id)),...shots];
await fs.writeFile(path.join(output,'history.json'),JSON.stringify(combined,null,2)+'\n');
await fs.writeFile(path.join(output,'history-report.json'),JSON.stringify(reports,null,2)+'\n');
let manifest=[];try{manifest=JSON.parse(await fs.readFile(path.join(output,'manifest.json'),'utf8'));}catch{}
await fs.writeFile(path.join(output,'manifest.json'),JSON.stringify([...manifest.filter(x=>x.kind!=='git-archive'&&x.kind!=='repository-history'),...combined],null,2)+'\n');
