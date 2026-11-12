import fs from 'node:fs/promises';
import { chromium } from 'playwright';
import path from 'node:path';
import {launch,context,capture,settle} from './browser.mjs';
const base=process.env.F1_BASE_URL||'https://f1.youkai-ou.com';
const output='public/shots/f1';
const date=new Date().toISOString();
const credit='来源：围场智析界面；赛车、车手及队徽原素材来自 Formula 1 官方，权利归原权利人；非商业展示。';
const definitions=[
 {id:'home',title:'围场首页',route:'/zh/home',wait:'.real-page'},
 {id:'home-overview',title:'赛季速览',route:'/zh/home',wait:'.bento',scroll:'.bento'},
 {id:'assistant-empty',title:'带页面名称的助手空态',route:'/zh/home',wait:'.real-page',assistant:true},
 {id:'team',title:'车队概览',route:'/zh/teams/ferrari',wait:'.team-hero'},
 {id:'upgrades',title:'赛车升级与资料层级',route:'/zh/teams/mercedes/upgrades',wait:'.real-page'},
 {id:'forecast',title:'预测与有限模拟的边界',route:'/zh/championship',wait:'.forecast-meta'},
 {id:'forecast-interval',title:'最终积分区间',route:'/zh/championship',wait:'.interval-panel',scroll:'.interval-panel'},
 {id:'methodology',title:'方法与数据来源',route:'/zh/methodology',wait:'.live-reading'},
 {id:'methodology-rights',title:'权利与 AI 解读说明',route:'/zh/methodology',wait:'.live-reading',scroll:'#workers-ai'}
];
await fs.mkdir(output,{recursive:true});
let blocked=[];const shots=[];const failures=[];
 for(const shot of definitions.filter(s=>!process.env.F1_SHOTS||process.env.F1_SHOTS.split(',').includes(s.id))){
  const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox']}),ctx=await context(browser);
  ctx.on('requestfailed',req=>{if(/\/api\/(assistant|chat)/.test(req.url())||!['GET','HEAD','OPTIONS'].includes(req.method()))blocked.push({url:req.url(),method:req.method(),error:req.failure()?.errorText});});
  const page=await ctx.newPage();
  try{
   const response=await page.goto(base+shot.route,{waitUntil:'domcontentloaded',timeout:60000});
   if(!response?.ok())throw Error('HTTP '+response?.status());
   await page.locator(shot.wait).first().waitFor({timeout:45000});await settle(page);
   await page.evaluate(async()=>{await Promise.race([Promise.all([...document.images].filter(i=>i.getBoundingClientRect().top<innerHeight*2).map(i=>i.decode().catch(()=>{}))),new Promise(r=>setTimeout(r,12000))]);});
   if(shot.assistant){await page.getByRole('button',{name:'AI 助手',exact:true}).first().click();await page.locator('dialog[open]').waitFor();await settle(page);}
   if(shot.scroll){await page.locator(shot.scroll).first().scrollIntoViewIfNeeded();await page.evaluate(()=>window.scrollBy(0,-110));await settle(page);}
   const result=await capture(page,'f1/'+shot.id,{animations:'allow',timeout:60000});
   shots.push({...shot,kind:'live-read-only',date,sourceURL:base+shot.route,...result,webp:'/shots/f1/'+shot.id+'.webp',caption:credit+(shot.assistant?' 仅空态与只读上下文；未发送问题，不用于证明真实回答可用。':'')});
   console.log(shot.id,result.bytes);
  }catch(error){failures.push({id:shot.id,error:String(error)});console.log('FAILED',shot.id,String(error));}
  finally{await page.close();await browser.close();}
 }
let history=[];try{history=JSON.parse(await fs.readFile(path.join(output,'history.json'),'utf8'));}catch{}
let previous=[];try{previous=JSON.parse(await fs.readFile(path.join(output,'manifest.json'),'utf8'));}catch{}
await fs.writeFile(path.join(output,'manifest.json'),JSON.stringify([...previous.filter(s=>!shots.some(x=>x.id===s.id)&&!history.some(x=>x.id===s.id)),...shots,...history],null,2)+'\n');
await fs.writeFile(path.join(output,'capture-report.json'),JSON.stringify({date,source:base,shots:shots.length,failures,blocked,noSubmittedMessages:!blocked.some(r=>r.method==='POST'&&/\/api\/(assistant\/chat|chat|generate|analyze)/i.test(r.url)),blockedNonReadRequests:blocked.filter(r=>!['GET','HEAD','OPTIONS'].includes(r.method)).length,note:'Context blocks generation endpoints and non-read methods; read-only context GET is allowed. An attempted POST would be blocked and reported; no send/form action exists in this script.'},null,2)+'\n');
if(failures.length)process.exitCode=1;
