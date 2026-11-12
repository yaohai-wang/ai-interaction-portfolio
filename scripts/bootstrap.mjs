import fs from 'node:fs/promises';import {spawnSync} from 'node:child_process';
await fs.mkdir('tools',{recursive:true});await fs.mkdir('tmp',{recursive:true});
try{await fs.access('tools/NotoSansSC-VF.ttf')}catch{const r=await fetch('https://raw.githubusercontent.com/notofonts/noto-cjk/main/Sans/Variable/TTF/Subset/NotoSansSC-VF.ttf');if(!r.ok)throw Error('Official font download failed');await fs.writeFile('tools/NotoSansSC-VF.ttf',Buffer.from(await r.arrayBuffer()));}
for(const [cmd,args] of [['python3',['-m','venv','.venv']],['.venv/bin/pip',['install','fonttools','brotli','pypdf','pillow','--cache-dir','tmp/pip-cache']]]){const r=spawnSync(cmd,args,{stdio:'inherit'});if(r.status!==0)throw Error('Setup failed');}
console.log('Local dependencies ready. npm run build; npm run dev.');
