from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools import subset
from fontTools.varLib.instancer import instantiateVariableFont
text=Path('tmp/font-text.txt').read_text()
for name,weight in [('regular',400),('medium',650)]:
    font=TTFont('tools/NotoSansSC-VF.ttf')
    options=subset.Options(); options.layout_features=['*'];options.name_IDs=['*'];options.name_legacy=True;options.name_languages=['*']
    sub=subset.Subsetter(options=options);sub.populate(text=text);sub.subset(font)
    font=instantiateVariableFont(font,{'wght':weight},inplace=True)
    font.flavor='woff2';font.save(f'public/fonts/noto-sc-{name}.woff2')
print('Noto Sans SC subset includes',len(set(text)),'unique source characters')
