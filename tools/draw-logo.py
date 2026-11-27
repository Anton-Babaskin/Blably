from glyph import text_path
from fontTools.ttLib import TTFont
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen
EXT='package/files/nunito-latin-ext-900-normal.woff'
LAT8='package/files/nunito-latin-800-normal.woff'
def bounds(fontfile,text,size):
    f=TTFont(fontfile); cmap=f.getBestCmap(); gs=f.getGlyphSet(); s=size/f['head'].unitsPerEm
    bp=BoundsPen(gs); cx=0
    for ch in text:
        g=cmap[ord(ch)]; gs[g].draw(TransformPen(bp,(s,0,0,-s,cx,0))); cx+=gs[g].width*s
    return bp.bounds
# letter ş centered inside bubble body
size=250
x0,y0,x1,y1=bounds(EXT,'ş',size)
cx,cy=256,236   # visual centre of bubble body
dx=cx-(x0+x1)/2; dy=cy-(y0+y1)/2 + 6
sh,_=text_path(EXT,'ş',size,dx,dy)
# bubble: rounded body + soft tail bottom-left
bubble=("M150 112 H362 A78 78 0 0 1 440 190 V282 A78 78 0 0 1 362 360 H232 "
        "L168 410 C158 418 146 410 149 398 L158 360 H150 A78 78 0 0 1 72 282 V190 A78 78 0 0 1 150 112 Z")
defs='''<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5FA2FF"/><stop offset=".55" stop-color="#3A72FA"/><stop offset="1" stop-color="#2652E8"/></linearGradient>
<radialGradient id="gl" cx=".3" cy=".08" r=".9"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/></radialGradient>
<linearGradient id="ink" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3D7BFF"/><stop offset="1" stop-color="#2450E6"/></linearGradient>
<filter id="sh" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#0B2A8A" flood-opacity=".28"/></filter>
</defs>'''
icon=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">{defs}
<rect width="512" height="512" rx="116" fill="url(#bg)"/><rect width="512" height="512" rx="116" fill="url(#gl)"/>
<g filter="url(#sh)"><path d="{bubble}" fill="#fff"/></g>
<path d="{sh}" fill="url(#ink)"/></svg>'''
open('/home/claude/brand/settlingo-icon.svg','w').write(icon)
# mark only (no background) for in-app use, blue bubble with white letter
mark=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="60 100 392 322"><defs><linearGradient id="mb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5FA2FF"/><stop offset="1" stop-color="#2652E8"/></linearGradient></defs>
<path d="{bubble}" fill="url(#mb)"/><path d="{sh}" fill="#fff"/></svg>'''
open('/home/claude/brand/settlingo-mark.svg','w').write(mark)
# wordmark
wsize=120
wx0,wy0,wx1,wy1=bounds(LAT8,'Settlingo',wsize)
wd,ww=text_path(LAT8,'Settlingo',wsize,-wx0,-wy0)
W=wx1-wx0; H=wy1-wy0
open('/home/claude/brand/settlingo-wordmark.svg','w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:.1f} {H:.1f}"><path d="{wd}" fill="#0E1B3D"/></svg>')
# lockup: icon 160 + gap + wordmark scaled to cap height
iconsize=150; gap=34; sc=iconsize*0.56/H
LW=iconsize+gap+W*sc; 
lock=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {LW:.1f} {iconsize}">{defs}
<g transform="scale({iconsize/512})"><rect width="512" height="512" rx="116" fill="url(#bg)"/><rect width="512" height="512" rx="116" fill="url(#gl)"/><g filter="url(#sh)"><path d="{bubble}" fill="#fff"/></g><path d="{sh}" fill="url(#ink)"/></g>
<g transform="translate({iconsize+gap},{(iconsize-H*sc)/2}) scale({sc})"><path d="{wd}" fill="#0E1B3D"/></g></svg>'''
open('/home/claude/brand/settlingo-lockup.svg','w').write(lock)
print('ok',W,H)
