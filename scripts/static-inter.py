from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools import subset
for label,weight in [('light',200),('regular',400),('semibold',600)]:
    target=Path(f'public/fonts/inter-{label}.woff2')
    if target.exists():continue
    font=TTFont('public/fonts/inter-variable.woff2')
    axes={a.axisTag:a.defaultValue for a in font['fvar'].axes};axes['wght']=weight
    font=instantiateVariableFont(font,axes,inplace=True)
    options=subset.Options();options.layout_features=['*']
    sub=subset.Subsetter(options=options);sub.populate(unicodes=list(range(0x250))+list(range(0x2000,0x2200)));sub.subset(font)
    family='Inter';style={'light':'ExtraLight','regular':'Regular','semibold':'SemiBold'}[label]
    for nid,value in [(1,family),(2,style),(4,family+' '+style),(6,family+'-'+style)]:
        font['name'].setName(value,nid,3,1,0x409)
    font.flavor='woff2';font.save(target)
    print(target)
