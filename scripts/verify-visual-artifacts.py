from pathlib import Path
from pypdf import PdfReader
from PIL import Image,ImageChops
import hashlib,json,datetime

def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
a=Path('output/pdf/portfolio-ai-interaction-revised.pdf');b=Path('output/pdf/portfolio-ai-interaction-revised-light.pdf')
readers=[PdfReader(p,strict=True) for p in [a,b]]
original=[]
for x in json.loads(Path('docs/revision/baseline.json').read_text())['originalPDFs']:
    original.append({'path':x['path'],'sha256':sha(x['path']),'unchanged':sha(x['path'])==x['sha256']})
checks={'seventeenPages':all(len(r.pages)==17 for r in readers),'sameExtractedText':[p.extract_text() for p in readers[0].pages]==[p.extract_text() for p in readers[1].pages],'originalPDFsUnchanged':all(x['unchanged'] for x in original),'downloadCopyMatches':sha(a)==sha('public/downloads/'+a.name)==sha('dist/downloads/'+a.name)}
regions=[]
for n in range(1,18):
    i=Image.open(f'tmp/visual-refresh/main-{n:02}.png');j=Image.open(f'tmp/visual-refresh/light-{n:02}.png')
    regions.append({'page':n,'headerIdentical':ImageChops.difference(i.crop((0,0,1600,230)),j.crop((0,0,1600,230))).getbbox() is None,'footerIdentical':ImageChops.difference(i.crop((0,830,1600,900)),j.crop((0,830,1600,900))).getbbox() is None})
checks['headerFooterPixelsMatch']=all(x['headerIdentical'] and x['footerIdentical'] for x in regions)
files=[]
for p in [a,b]:
    metadata=json.loads(Path(str(p)+'.json').read_text());checks[p.stem+'Fonts']=metadata['allFontsEmbedded'];checks[p.stem+'Links']=not metadata['invalidInternalLinks'] and not metadata['localServerLinks']
    files.append({'path':str(p),'bytes':p.stat().st_size,'sha256':sha(p),'pages':metadata['pages'],'links':metadata['links']})
images=[{'path':str(p),'sha256':sha(p)} for p in sorted(Path('tmp/visual-refresh').glob('main-*.png'))]+[{'path':str(p),'sha256':sha(p)} for p in sorted(Path('tmp/visual-refresh').glob('light-*.png'))]+[{'path':str(p),'sha256':sha(p)} for p in sorted(Path('tmp/visual-refresh/native').glob('page-*.png'))]
checks['allThreeRenderSets']=len(images)==51
report={'date':datetime.datetime.now(datetime.timezone.utc).isoformat(),'checks':checks,'passed':all(checks.values()),'files':files,'originalPDFs':original,'textRegionComparison':regions,'renderedPages':images}
Path('docs/visual-refresh/final-artifacts.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps({'checks':checks,'files':files},ensure_ascii=False,indent=2))
assert all(checks.values())
