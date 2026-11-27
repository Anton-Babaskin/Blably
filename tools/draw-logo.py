"""Draw the Blably logo files in brand/ from Nunito 800 glyph outlines.

Usage: pip install fonttools brotli && python3 tools/draw-logo.py
The mark is a lowercase "b" that is itself a speech bubble: flat, one colour, no tile inside a tile.
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen

ROOT = Path(__file__).resolve().parent.parent
FONT = TTFont(ROOT / 'fonts' / 'nunito-latin-800-normal.woff2')
BRAND = ROOT / 'brand'
NAME = 'Blably'   # wordmark text

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

# The mark: a lowercase "b" that is itself a speech bubble. The stem's foot kicks out into the tail.
# One flat shape, one colour, no gradients. Drawn on a 512 grid.
B_PATH = ('M146 108A40 40 0 0 1 226 108V168A150 150 0 1 1 214 446'
          'L132 482C118 488 108 476 116 464L146 418Z'
          'M302 236A64 64 0 1 0 302.1 236Z')
BLUE, INK = '#2F6BFF', '#0E1B3D'
def mark(color):
    return f'<path d="{B_PATH}" fill="{color}" fill-rule="evenodd"/>'
# In the app icon the mark is centred on its optical centre (bowl + stem, ~280,278) and scaled to leave air.
ICON = f'<rect width="512" height="512" rx="112" fill="{BLUE}"/><g transform="translate(256 256) scale(.84) translate(-282 -276)">' + mark('#FFFFFF') + '</g>'
(BRAND / 'blably-icon.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">{ICON}</svg>')
(BRAND / 'blably-mark.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="100 54 362 438">{mark(BLUE)}</svg>')
word, W, H = outline(NAME, 120)
(BRAND / 'blably-wordmark.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:.1f} {H:.1f}"><path d="{word}" fill="{INK}"/></svg>')
# Lockup: the bare mark (no tile) next to the wordmark; the mark's bowl sits on the text baseline.
for name, ink in (('blably-lockup.svg', INK), ('blably-lockup-dark.svg', '#FFFFFF')):
    mh = H * 1.32                      # mark height relative to the wordmark
    ms = mh / 438                      # scale of the 362x438 mark box
    gap = H * 0.22
    total_w = 362 * ms + gap + W
    (BRAND / name).write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {total_w:.1f} {mh:.1f}">'
        f'<g transform="scale({ms:.4f}) translate(-100 -54)">{mark(BLUE)}</g>'
        f'<g transform="translate({362 * ms + gap:.1f},{mh - H - mh * 0.035:.1f})"><path d="{word}" fill="{ink}"/></g></svg>')
print('brand files written to', BRAND)
