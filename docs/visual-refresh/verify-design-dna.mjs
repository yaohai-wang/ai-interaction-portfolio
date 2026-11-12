import fs from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';

// Run from repository root after npm run build. Reads dist; only writes this report.
const port=4347,base=`http://127.0.0.1:${port}`;
const server=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:String(port)},stdio:'pipe'});
let browser;
try {
  let ready=false;
  for(let i=0;i<60;i++){
    try{if((await fetch(base)).ok){ready=true;break;}}catch{}
    await new Promise(resolve=>setTimeout(resolve,200));
  }
  if(!ready)throw new Error('Local static server unavailable');
  browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const remoteResources=[];
  page.on('request',request=>{if(!request.url().startsWith(base)&&!request.url().startsWith('data:'))remoteResources.push(request.url());});
  await page.goto(base,{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  const actual=await page.evaluate(()=>{
    const root=getComputedStyle(document.documentElement);
    const palette=Object.fromEntries(['void','bone-white','ash-gray','silver-mist','electric-iris','saffron-spark','deep-verdant'].map(name=>[name,root.getPropertyValue(`--color-${name}`).trim()]));
    const style=selector=>{const el=document.querySelector(selector);if(!el)return null;const s=getComputedStyle(el);return{fontFamily:s.fontFamily,fontWeight:s.fontWeight,fontSize:s.fontSize,lineHeight:s.lineHeight,background:s.backgroundColor,color:s.color,boxShadow:s.boxShadow,animationName:s.animationName};};
    return {palette,body:style('body'),heading:style('.r-cover h1'),paragraph:style('.r-cover-description'),button:style('.r-cover .primary-link'),headerDownload:style('.header-download'),cloud:style('.constellation-cloud'),heroProductImages:document.querySelectorAll('.r-cover img').length,inlineSvgPathCount:document.querySelectorAll('.constellation path').length,canvasCount:document.querySelectorAll('canvas').length,loadedFonts:[...document.fonts].filter(f=>f.status==='loaded').map(f=>({family:f.family,weight:f.weight})),featurePanels:[...document.querySelectorAll('.work-feature')].map(el=>{const s=getComputedStyle(el);return{background:s.backgroundColor,shadow:s.boxShadow,border:s.borderTopWidth};})};
  });
  await page.emulateMedia({reducedMotion:'reduce'});
  const reducedMotion=await page.locator('.constellation-cloud').evaluate(el=>getComputedStyle(el).animationName);
  await page.emulateMedia({media:'print',reducedMotion:'no-preference'});
  await page.goto(base+'/print/',{waitUntil:'networkidle'});
  const print=await page.evaluate(()=>({pages:document.querySelectorAll('.revised-page').length,cloudAnimation:getComputedStyle(document.querySelector('.constellation-cloud')).animationName,background:getComputedStyle(document.querySelector('.revised-page')).backgroundColor,headings:[...document.querySelectorAll('.revised-page h1')].map(el=>getComputedStyle(el).fontWeight),paragraphs:[...document.querySelectorAll('.revised-page p')].map(el=>getComputedStyle(el).fontWeight)}));
  const normalizeHex=h=>h.length===4?'#'+[...h.slice(1)].map(c=>c+c).join(''):h;
  const expectedPalette={'void':'#000000','bone-white':'#ffffff','ash-gray':'#9a9a9a','silver-mist':'#bdbdbd','electric-iris':'#8052ff','saffron-spark':'#ffb829','deep-verdant':'#15846e'};
  const checks={
    exactPalette:Object.entries(expectedPalette).every(([k,v])=>normalizeHex(actual.palette[k])===v),
    blackBackground:actual.body.background==='rgb(0, 0, 0)'&&print.background==='rgb(0, 0, 0)',
    interAndNotoFallback:actual.heading.fontFamily.includes('Inter')&&actual.heading.fontFamily.includes('Folio'),
    headingWeight400:actual.heading.fontWeight==='400'&&print.headings.every(w=>w==='400'),
    bodyWeight200:actual.paragraph.fontWeight==='200',
    violetAction:actual.button.background==='rgb(128, 82, 255)'&&actual.button.color==='rgb(255, 255, 255)',
    headerSecondaryAction:actual.headerDownload?.background==='rgba(0, 0, 0, 0)',
    unboxedFeatureSections:actual.featurePanels.every(p=>p.background==='rgba(0, 0, 0, 0)'&&p.shadow==='none'&&p.border==='0px'),
    coverConstellationOnly:actual.heroProductImages===0&&actual.inlineSvgPathCount===1120,
    noCanvas:actual.canvasCount===0,
    reducedMotionStatic:reducedMotion==='none',
    printStatic:print.cloudAnimation==='none',
    selfHostedResources:remoteResources.length===0,
    seventeenPrintPages:print.pages===17
  };
  const report={date:new Date().toISOString(),method:'Computed CSS and DOM inspection of locally built dist. This is not reference image measurement or perceptual similarity scoring.',reference:'docs/visual-refresh/DESIGN-reference.md',checks,passed:Object.values(checks).every(Boolean),actual,reducedMotion,print,remoteResources};
  await fs.writeFile('docs/visual-refresh/design-dna-verification.json',JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({passed:report.passed,checks},null,2));
  if(!report.passed)process.exitCode=1;
} finally {await browser?.close();server.kill();}
