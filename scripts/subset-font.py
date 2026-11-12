from pathlib import Path
import hashlib,sys,json
from fontTools.ttLib import TTFont
from fontTools import subset
from fontTools.varLib.instancer import instantiateVariableFont
text=Path('tmp/font-text.txt').read_text()
cache=Path('tmp/font-subset-key.txt')
key=hashlib.sha256((''.join(sorted(set(text)))+'200,400,650').encode()).hexdigest()
if cache.exists() and cache.read_text()==key and all(Path(f'public/fonts/noto-sc-{n}.woff2').exists() for n in ['light','regular','medium']):
    print('Font character set unchanged; using verified local subsets');sys.exit(0)
for name,weight in [('light',200),('regular',400),('medium',650)]:
    font=TTFont('tools/NotoSansSC-VF.ttf')
    options=subset.Options(); options.layout_features=['*'];options.name_IDs=['*'];options.name_legacy=True;options.name_languages=['*']
    sub=subset.Subsetter(options=options);sub.populate(text=text);sub.subset(font)
    font=instantiateVariableFont(font,{'wght':weight},inplace=True)
    font.flavor='woff2';font.save(f'public/fonts/noto-sc-{name}.woff2')
print('Noto Sans SC subset includes',len(set(text)),'unique source characters')

cache.write_text(key)
