import sys,json
from pathlib import Path
from pypdf import PdfReader,PdfWriter
p=Path(sys.argv[1]);r=PdfReader(p);w=PdfWriter();w.clone_document_from_reader(r);w.add_metadata({'/Title':'王耀海-AI交互设计作品集-修订预览版','/Author':'王耀海 / Kai Wang','/Subject':'2027届 AI创新交互设计方向 · 修订预览版','/Creator':'Astro / Playwright / Codex'});tmp=p.with_suffix('.tmp.pdf');w.write(tmp);tmp.replace(p)
r=PdfReader(p);links=0;fonts=set();embedded=True;uris=[];internal=[];invalid_destinations=[]
for page in r.pages:
 for a in page.get('/Annots',[]):
  o=a.get_object()
  if o.get('/Subtype')=='/Link':
   links+=1
   action=o.get('/A',{})
   if action.get('/URI'):uris.append(str(action.get('/URI')))
   dest=o.get('/Dest')
   if dest:
    name=str(dest);target=r.named_destinations.get(name)
    number=r.get_destination_page_number(target) if target else None
    internal.append({'destination':name,'page':number+1 if number is not None else None})
    if number is None or number<0 or number>=len(r.pages):invalid_destinations.append(name)
 for f in page.get('/Resources',{}).get('/Font',{}).values():
  f=f.get_object();fonts.add(str(f.get('/BaseFont')))
  for x in f.get('/DescendantFonts',[f]):
   x=x.get_object();d=x.get('/FontDescriptor');d=d.get_object() if d else {}
   if not any(k in d for k in ['/FontFile','/FontFile2','/FontFile3']): embedded=False
report={'file':str(p),'pages':len(r.pages),'bytes':p.stat().st_size,'links':links,'fonts':sorted(fonts),'allFontsEmbedded':embedded,'ratio':float(r.pages[0].mediabox.width)/float(r.pages[0].mediabox.height),'uriLinks':uris,'internalLinks':internal,'invalidInternalLinks':invalid_destinations,'localServerLinks':any('127.0.0.1' in u or 'localhost' in u for u in uris),'internalReviewMarkers':any(__import__('re').search(r'TODO\(Kai\)|K\d{2}|(?:\.tsx|\.mjs|\.ts):\d|commit ',x.extract_text()) for x in r.pages),'textExtractable':all(len(x.extract_text())>10 for x in r.pages)}
Path(str(p)+'.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False,indent=2))
if not embedded or not report['textExtractable'] or report['localServerLinks'] or invalid_destinations or report['internalReviewMarkers']:sys.exit(1)
