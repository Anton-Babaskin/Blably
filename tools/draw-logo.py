"""Draw the Settlingo logo files in brand/ from Nunito 800 glyph outlines.

Usage: pip install fonttools brotli && python3 tools/draw-logo.py
The mark is a speech bubble with an "S" drawn as a winding path: the brand initial and a learning path.
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen

ROOT = Path(__file__).resolve().parent.parent
FONT = TTFont(ROOT / 'fonts' / 'nunito-latin-800-normal.woff2')
BRAND = ROOT / 'brand'

def outline(text, size):
    cmap, gs, s = FONT.getBestCmap(), FONT.getGlyphSet(), size / FONT['head'].unitsPerEm
    bp, x = BoundsPen(gs), 0
    for ch in text:
        g = cmap[ord(ch)]; gs[g].draw(TransformPen(bp, (s, 0, 0, -s, x, 0))); x += gs[g].width * s
    x0, y0, x1, y1 = bp.bounds
    pen, x = SVGPathPen(gs), 0
    for ch in text:
        g = cmap[ord(ch)]; gs[g].draw(TransformPen(pen, (s, 0, 0, -s, x - x0, -y0))); x += gs[g].width * s
    return pen.getCommands(), x1 - x0, y1 - y0

BUBBLE = ('M150 112H362A78 78 0 0 1 440 190V282A78 78 0 0 1 362 360H232L168 410C158 418 146 410 149 398'
          'L158 360H150A78 78 0 0 1 72 282V190A78 78 0 0 1 150 112Z')
S_PATH = 'M318 176C286 160 214 158 200 196C186 236 312 226 312 270C312 312 236 316 194 298'
DEFS = '''<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5FA2FF"/><stop offset=".55" stop-color="#3A72FA"/><stop offset="1" stop-color="#2652E8"/></linearGradient>
<radialGradient id="gl" cx=".3" cy=".08" r=".9"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/></radialGradient>
<linearGradient id="ink" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3D7BFF"/><stop offset="1" stop-color="#2450E6"/></linearGradient>
<filter id="sh" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#0B2A8A" flood-opacity=".28"/></filter>
</defs>'''
ICON = (f'<rect width="512" height="512" rx="116" fill="url(#bg)"/><rect width="512" height="512" rx="116" fill="url(#gl)"/>'
        f'<g filter="url(#sh)"><path d="{BUBBLE}" fill="#fff"/></g>'
        f'<path d="{S_PATH}" fill="none" stroke="url(#ink)" stroke-width="34" stroke-linecap="round"/>')

(BRAND / 'settlingo-icon.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">{DEFS}{ICON}</svg>')
(BRAND / 'settlingo-mark.svg').write_text(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="60 100 392 322"><defs><linearGradient id="mb" x1="0" y1="0" x2="1" y2="1">'
    '<stop offset="0" stop-color="#5FA2FF"/><stop offset="1" stop-color="#2652E8"/></linearGradient></defs>'
    f'<path d="{BUBBLE}" fill="url(#mb)"/><path d="{S_PATH}" fill="none" stroke="#fff" stroke-width="34" stroke-linecap="round"/></svg>')
word, W, H = outline('Settlingo', 120)
(BRAND / 'settlingo-wordmark.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:.1f} {H:.1f}"><path d="{word}" fill="#0E1B3D"/></svg>')
for name, ink in (('settlingo-lockup.svg', '#0E1B3D'), ('settlingo-lockup-dark.svg', '#FFFFFF')):
    size, gap = 150, 34; sc = size * 0.5 / H
    (BRAND / name).write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size + gap + W * sc:.1f} {size}">{DEFS}'
        f'<g transform="scale({size / 512})">{ICON}</g>'
        f'<g transform="translate({size + gap},{(size - H * sc) / 2 + 2:.1f}) scale({sc:.4f})"><path d="{word}" fill="{ink}"/></g></svg>')
print('brand files written to', BRAND)
