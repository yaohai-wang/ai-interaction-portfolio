import fs from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {launch} from './browser.mjs';

const port=4341,base=`http://127.0.0.1:${port}`;
const server=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:String(port)},stdio:'pipe'});
const report={generatedAt:new Date().toISOString(),viewports:[],print:null,failures:[],passed:false};
let browser;
function check(value,message,details={}){if(!value)report.failures.push({message,...details});}
try{
  let ready=false;
  for(let i=0;i<60;i++){
    try{const r=await fetch(base+'/print/');if(r.ok){ready=true;break;}}catch{}
    await new Promise(r=>setTimeout(r,200));
  }
  if(!ready)throw Error('Local built site did not start');
  browser=await launch();
  for(const width of [1440,390]){
    const ctx=await browser.newContext({viewport:{width,height:width===390?844:1000},locale:'zh-CN',reducedMotion:'reduce'});
    const page=await ctx.newPage();
    const runtimeErrors=[];page.on('pageerror',e=>runtimeErrors.push(String(e)));
    const viewport={width,viewerTasks:[],overview:null,homepage:null,runtimeErrors};
    for(const route of ['/','/cases/ideal-home/','/cases/agent/','/cases/pitwall/','/cases/desktop/']){
      const response=await page.goto(base+route,{waitUntil:'networkidle'});
      check(response?.status()===200,'Route must return HTTP 200',{width,route,status:response?.status()});
      await page.evaluate(()=>document.fonts.ready);
      if(route==='/'){
        viewport.homepage=await page.evaluate(()=>({nestedAnchors:document.querySelectorAll('a a').length,features:[...document.querySelectorAll('.work-feature')].map(e=>({imageContainer:e.querySelector('.work-feature-image')?.tagName,imageLinks:e.querySelectorAll('.work-feature-image a').length,allLinks:e.querySelectorAll('a').length}))}));
        check(viewport.homepage.nestedAnchors===0&&viewport.homepage.features.every(f=>f.imageContainer==='DIV'&&f.imageLinks===1&&f.allLinks===2),'Homepage links must not be nested or repaired into duplicate anchors',{width,homepage:viewport.homepage});
      }
      const opener=page.locator('a[data-image-viewer]').first();
      const href=await opener.getAttribute('href');
      await opener.scrollIntoViewIfNeeded();await opener.click();
      await page.waitForFunction(()=>document.querySelector('.image-viewer')?.open===true);
      await page.waitForFunction(()=>{const i=document.querySelector('.viewer-stage img');return i?.complete&&i.naturalWidth>0;});
      const opened=await page.evaluate(()=>{const d=document.querySelector('.image-viewer'),i=d.querySelector('.viewer-stage img');return{open:d.open,naturalWidth:i.naturalWidth,naturalHeight:i.naturalHeight,src:new URL(i.src).pathname,caption:d.querySelector('.viewer-caption').textContent,zoomed:d.querySelector('.viewer-stage').classList.contains('is-zoomed'),button:d.querySelector('[data-viewer-zoom]').textContent,dialogWidth:d.getBoundingClientRect().width,viewportWidth:innerWidth};});
      check(opened.open&&opened.naturalWidth>0&&opened.src===href,'Image dialog must load the original full image',{width,route,opened,href});
      check(opened.dialogWidth<=width+1,'Image dialog must fit viewport',{width,route,opened});
      await page.locator('[data-viewer-zoom]').click();
      const zoomed=await page.evaluate(()=>{const s=document.querySelector('.viewer-stage'),i=s.querySelector('img'),b=document.querySelector('[data-viewer-zoom]');return{classEnabled:s.classList.contains('is-zoomed'),pressed:b.getAttribute('aria-pressed'),button:b.textContent,imageWidth:i.getBoundingClientRect().width,naturalWidth:i.naturalWidth};});
      check(zoomed.classEnabled&&zoomed.pressed==='true'&&zoomed.button==='适应窗口'&&Math.abs(zoomed.imageWidth-zoomed.naturalWidth)<1,'Original-size toggle must show natural image width',{width,route,zoomed});
      await page.locator('[data-viewer-zoom]').click();
      const fitted=await page.evaluate(()=>{const s=document.querySelector('.viewer-stage'),b=document.querySelector('[data-viewer-zoom]');return{classDisabled:!s.classList.contains('is-zoomed'),pressed:b.getAttribute('aria-pressed'),button:b.textContent};});
      check(fitted.classDisabled&&fitted.pressed==='false'&&fitted.button==='原始尺寸','Fit-to-window toggle must reset state',{width,route,fitted});
      await page.keyboard.press('Escape');
      await page.waitForFunction(()=>document.querySelector('.image-viewer')?.open===false);
      await page.waitForFunction(expected=>document.activeElement?.getAttribute('href')===expected&&document.querySelectorAll('.viewer-stage img').length===0,href);
      const closed=await opener.evaluate(a=>({focusReturned:document.activeElement===a,open:document.querySelector('.image-viewer').open,imagesRemaining:document.querySelectorAll('.viewer-stage img').length}));
      check(closed.focusReturned&&!closed.open&&closed.imagesRemaining===0,'Escape must close and restore the original image-link focus',{width,route,closed});
      viewport.viewerTasks.push({route,href,opened,zoomed,fitted,closed});
    }
    await page.goto(base+'/about/',{waitUntil:'networkidle'});
    viewport.overview=await page.locator('.nav-shot').evaluateAll(xs=>xs.map(x=>({src:x.getAttribute('src'),fit:getComputedStyle(x).objectFit,naturalWidth:x.naturalWidth})));
    check(viewport.overview.length===4&&viewport.overview.every(x=>x.fit==='contain'&&x.naturalWidth>0),'About thumbnails must contain complete images',{width,overview:viewport.overview});
    check(runtimeErrors.length===0,'No viewer runtime errors',{width,runtimeErrors});
    report.viewports.push(viewport);await ctx.close();
  }
  const page=await browser.newPage({viewport:{width:1920,height:1080}});
  await page.goto(base+'/print/',{waitUntil:'networkidle'});await page.emulateMedia({media:'print'});
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});
  report.print=await page.evaluate(()=>({pages:document.querySelectorAll('.revised-page').length,shots:[...document.querySelectorAll('.shot-wrap img,.nav-shot')].map(i=>({page:i.closest('.revised-page')?.id,src:i.getAttribute('src'),fit:getComputedStyle(i).objectFit,width:i.naturalWidth,height:i.naturalHeight})),imageViewerCount:document.querySelectorAll('.image-viewer').length,interactiveImageLinks:document.querySelectorAll('[data-image-viewer]').length}));
  const partial=report.print.shots.filter(x=>/-focus|-detail|-scope|task-content|task-return/.test(x.src));
  const wrongFit=report.print.shots.filter(x=>x.fit!=='contain'||x.width===0);
  check(report.print.pages===18,'Print must contain 18 pages',{pages:report.print.pages});
  check(partial.length===0,'Print must not use fragment crops',{partial});
  check(wrongFit.length===0,'Every print screenshot must use contain and load',{wrongFit});
  check(report.print.imageViewerCount===0&&report.print.interactiveImageLinks===0,'Print must omit the interactive viewer',{imageViewerCount:report.print.imageViewerCount,interactiveImageLinks:report.print.interactiveImageLinks});
}catch(error){report.failures.push({message:String(error),stack:error.stack});}
finally{await browser?.close();server.kill();report.passed=report.failures.length===0;await fs.mkdir('docs/full-interface',{recursive:true});await fs.writeFile('docs/full-interface/image-viewer-proof.json',JSON.stringify(report,null,2));console.log(JSON.stringify({passed:report.passed,viewports:report.viewports.length,viewerTasks:report.viewports.reduce((n,v)=>n+v.viewerTasks.length,0),printPages:report.print?.pages,printShots:report.print?.shots.length,failures:report.failures},null,2));if(!report.passed)process.exitCode=1;}
