import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import ffmpeg from 'ffmpeg-static';
import ffprobe from 'ffprobe-static';
import sharp from 'sharp';
const root=path.resolve(import.meta.dirname,'..');process.chdir(root);
const source='/Users/youkaiou/Desktop/Qloo/design/live-2d/review/flow-videos';
const shots=path.join(root,'public/shots/agent');const videos=path.join(root,'public/video/agent');const tmp=path.join(root,'tmp/agent');
for(const dir of [shots,videos,tmp])await fs.mkdir(dir,{recursive:true});
function run(bin,args){const r=spawnSync(bin,args,{encoding:'utf8',timeout:180000,maxBuffer:4*1024*1024});if(r.status!==0)throw Error(r.stderr||String(r.error));return r.stdout;}
const frames=[
 {file:'00-home.mp4',seconds:1.5,name:'home',title:'首页 · 共享状态的入口'},
 {file:'01-profile.mp4',seconds:34.0,name:'profile',title:'先保存饮食档案，推荐继承上下文'},
 {file:'03-recommend.mp4',seconds:10.2,name:'intent',title:'把自然语言意图转成可核对的条件'},
 {file:'03-recommend.mp4',seconds:16.7,name:'details',title:'先查看菜品详情，再决定加入计划'},
 {file:'03-recommend.mp4',seconds:31.5,name:'plan',title:'区分已吃、计划与预计'},
 {file:'03-recommend.mp4',seconds:56.3,name:'confirm',title:'明确餐次与实际份量，再确认记录'},
 {file:'03-recommend.mp4',seconds:67.4,name:'result',title:'确认后更新合计，不重复计入'},
 {file:'04-trends.mp4',seconds:32.5,name:'uncertainty',title:'说明趋势依据与演示模型边界'},
];
const manifest=[];
for(const frame of frames){
 const input=path.join(source,frame.file),png=path.join(tmp,frame.name+'.png');
 run(ffmpeg,['-y','-ss',String(frame.seconds),'-i',input,'-frames:v','1',png]);
 let q=88,jpg;do{jpg=await sharp(png).resize({width:1920,withoutEnlargement:true}).jpeg({quality:q,mozjpeg:true}).toBuffer();q-=6;}while(jpg.length>400000&&q>30);
 await fs.writeFile(path.join(shots,frame.name+'.jpg'),jpg);
 let wq=84,webp;do{webp=await sharp(jpg).webp({quality:wq}).toBuffer();wq-=6;}while(webp.length>400000&&wq>25);
 await fs.writeFile(path.join(shots,frame.name+'.webp'),webp);
 manifest.push({title:frame.title,image:'/shots/agent/'+frame.name+'.jpg',webp:'/shots/agent/'+frame.name+'.webp',kind:'video-frame',sourceURL:input,sourceSeconds:frame.seconds,date:'2026-10-29T16:36:39.737Z',caption:'来源：TasteTwin 本地交互原型真实点击录屏。界面数值均为示例，不代表真实识别、健康建议或用户效果。关键帧为草稿推荐，待 Kai 确认。'});
 console.log(JSON.stringify({frame:frame.name,jpeg:jpg.length,webp:webp.length}));
}
// Contact sheets from the complete original. Every five seconds; preserve the
// source aspect ratio and all UI text. The timestamp index is separate data.
const all=path.join(source,'TasteTwin-flow-all.mp4');
run(ffmpeg,['-y','-i',all,'-vf','fps=1/5,scale=320:-1,tile=4x5','-q:v','5',path.join(tmp,'all-contact-%02d.jpg')]);
const contacts=(await fs.readdir(tmp)).filter(f=>/^all-contact-\d+\.jpg$/.test(f)).sort();
for(const [i,file] of contacts.entries()){
 let q=85,b;do{b=await sharp(path.join(tmp,file)).jpeg({quality:q,mozjpeg:true}).toBuffer();q-=6;}while(b.length>400000&&q>25);
 const dest='contact-all-'+String(i+1).padStart(2,'0')+'.jpg';await fs.writeFile(path.join(videos,dest),b);
 manifest.push({title:'全片每5秒联系表 '+(i+1),image:'/video/agent/'+dest,kind:'contact-sheet',sourceURL:all,date:'2026-10-29T16:36:39.737Z',startSeconds:i*100,caption:'每5秒一帧，按从左到右、从上到下顺序。编号用于 Kai 选择关键帧，末页空格不是源视频黑屏。'});
}
await fs.writeFile(path.join(shots,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
const probe=JSON.parse(run(ffprobe.path,['-v','quiet','-show_format','-show_streams','-of','json',all]));
const srcHash=createHash('sha256').update(await fs.readFile(all)).digest('hex');
await fs.writeFile(path.join(videos,'provenance.json'),JSON.stringify({product:'TasteTwin',status:'draft-selection-pending-Kai',source:all,sourceSha256:srcHash,sourceDuration:Number(probe.format.duration),sourceVideo:probe.streams.find(s=>s.codec_type==='video'),highlightCandidate:{source:path.join(source,'03-recommend.mp4'),start:0,duration:80.208,reason:'保留完整推荐→核对→计划→确认记录流程，未加速；待Kai确定最终60–90秒区间'},recommendedFrames:frames,publicPermission:'TODO(Kai): 确认可公开范围及团队角色',contacts:contacts.length},null,2)+'\n');
console.log('Agent frames and complete-source contact sheets generated.');

const candidate=path.join(videos,'tastetwin-recommend-candidate.mp4');
if(await fs.stat(path.join(videos,'highlight.mp4')).catch(()=>false))await fs.rename(path.join(videos,'highlight.mp4'),candidate);
if(await fs.stat(candidate).catch(()=>false)){const p=JSON.parse(run(ffprobe.path,['-v','quiet','-show_format','-show_streams','-of','json',candidate]));const v=p.streams.find(s=>s.codec_type==='video'),a=p.streams.find(s=>s.codec_type==='audio');if(v.width!==1920||v.height!==1080||v.codec_name!=='h264'||a?.codec_name!=='aac'||Number(p.format.size)>25*1024*1024)throw Error('Candidate video format/budget mismatch');const meta=JSON.parse(await fs.readFile(path.join(videos,'provenance.json'),'utf8'));meta.output={path:'/video/agent/tastetwin-recommend-candidate.mp4',duration:Number(p.format.duration),bytes:Number(p.format.size),width:v.width,height:v.height,videoCodec:v.codec_name,audioCodec:a.codec_name,status:'candidate-awaiting-Kai'};await fs.writeFile(path.join(videos,'provenance.json'),JSON.stringify(meta,null,2)+'\n');}
// This project has dated file snapshots, not a Git repository. Keep that
// provenance explicit instead of fabricating historical commit screenshots.
const stages=[['stage-before','/Users/youkaiou/Desktop/Qloo/design/live-2d/00-home.png','早期五模块首页'],['stage-after','/Users/youkaiou/Desktop/Qloo/design/live-2d/review/flow-v1/F00-1-home.png','四模块流程版首页']];
const current=JSON.parse(await fs.readFile(path.join(shots,'manifest.json'),'utf8'));
for(const [name,sourceImage,title] of stages){let q=86,j;do{j=await sharp(sourceImage).resize({width:1920,withoutEnlargement:true}).jpeg({quality:q,mozjpeg:true}).toBuffer();q-=6;}while(j.length>400000&&q>25);await fs.writeFile(path.join(shots,name+'.jpg'),j);let wq=84,w;do{w=await sharp(j).webp({quality:wq}).toBuffer();wq-=6;}while(w.length>400000&&wq>25);await fs.writeFile(path.join(shots,name+'.webp'),w);current.push({title,image:'/shots/agent/'+name+'.jpg',webp:'/shots/agent/'+name+'.webp',kind:'existing-review',sourceURL:sourceImage,date:(await fs.stat(sourceImage)).mtime.toISOString(),sourceSha256:createHash('sha256').update(await fs.readFile(sourceImage)).digest('hex'),caption:'来源：TasteTwin原项目已有阶段检查截图，非Git恢复；示例数据，非真实健康结果。'});}
await fs.writeFile(path.join(shots,'manifest.json'),JSON.stringify(current,null,2)+'\n');
