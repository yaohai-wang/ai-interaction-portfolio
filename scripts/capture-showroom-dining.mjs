// Replays only the product's built-in showroom camera and movement controls.
// Source repositories and real player saves are untouched. All non-read HTTP calls are blocked.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
import {launch,context} from './browser.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
process.chdir(root);
const out=path.join(root,'public/revised/home');
const manifestPath=path.join(out,'manifest.json');
const manifest=JSON.parse(await fs.readFile(manifestPath,'utf8'));
const entry=manifest.find(x=>x.id==='showroom-dining');
if(!entry) throw new Error('Expected provenance entry showroom-dining.');
const browser=await launch(),ctx=await context(browser),page=await ctx.newPage();
page.setDefaultTimeout(90000);
try {
 await page.goto('https://home.youkai-ou.com/#/showroom',{waitUntil:'domcontentloaded',timeout:90000});
 await page.getByRole('button',{name:/跳过动画/}).first().click();
 await page.locator('.showroom[data-ready="true"]').waitFor();
 await page.waitForTimeout(3000);
 for(const c of entry.uiActions) {
  if(c.action==='button') {await page.getByRole('button',{name:c.name,exact:true}).last().click();await page.waitForTimeout(1800);}
  if(c.action==='drag') {await page.mouse.move(c.x,c.y);await page.mouse.down();await page.mouse.move(c.x+c.dx,c.y+c.dy,{steps:40});await page.mouse.up();await page.waitForTimeout(2000);}
  if(c.action==='key') {await page.keyboard.down(c.key);await page.waitForTimeout(c.ms);await page.keyboard.up(c.key);await page.waitForTimeout(700);}
 }
 await page.mouse.move(1380,30);await page.waitForTimeout(1800);
 const png=await page.screenshot({animations:'disabled'});
 let q=90,jpg;
 do {jpg=await sharp(png).resize(1920).jpeg({quality:q,mozjpeg:true}).toBuffer();q-=6;} while(jpg.length>400000&&q>30);
 const webp=await sharp(jpg).webp({quality:85}).toBuffer();
 await fs.writeFile(path.join(out,'showroom-dining.jpg'),jpg);
 await fs.writeFile(path.join(out,'showroom-dining.webp'),webp);
 Object.assign(entry,{capturedAt:new Date().toISOString(),bytes:jpg.length,webpBytes:webp.length});
 await fs.writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n');
 console.log(JSON.stringify({image:entry.image,bytes:jpg.length,caption:entry.caption}));
} finally {await ctx.close();await browser.close();}
