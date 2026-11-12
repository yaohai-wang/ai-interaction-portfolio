import sys,json
from pathlib import Path
from pypdf import PdfReader,PdfWriter
p=Path(sys.argv[1]);r=PdfReader(p);w=PdfWriter();w.clone_document_from_reader(r);w.add_metadata({'/Title':'王耀海-AI创新交互设计师-作品集-草稿','/Author':'王耀海 / Kai Wang','/Subject':'AI 交互设计作品集 · 审阅草稿','/Creator':'Astro / Playwright / Codex'});tmp=p.with_suffix('.tmp.pdf');w.write(tmp);tmp.replace(p)
r=PdfReader(p);links=0;fonts=set();embedded=True
for page in r.pages:
 for a in page.get('/Annots',[]):
  o=a.get_object()
  if o.get('/Subtype')=='/Link': links+=1
 for f in page.get('/Resources',{}).get('/Font',{}).values():
  f=f.get_object();fonts.add(str(f.get('/BaseFont')))
  for x in f.get('/DescendantFonts',[f]):
   x=x.get_object();d=x.get('/FontDescriptor');d=d.get_object() if d else {}
   if not any(k in d for k in ['/FontFile','/FontFile2','/FontFile3']): embedded=False
report={'file':str(p),'pages':len(r.pages),'bytes':p.stat().st_size,'links':links,'fonts':sorted(fonts),'allFontsEmbedded':embedded,'ratio':float(r.pages[0].mediabox.width)/float(r.pages[0].mediabox.height),'textExtractable':all(len(x.extract_text())>10 for x in r.pages)}
Path(str(p)+'.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False,indent=2))
if not embedded or not report['textExtractable']:sys.exit(1)
