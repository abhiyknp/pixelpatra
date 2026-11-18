#!/usr/bin/env python3
"""Makes share.jpg (1200x630): the picture shown when the site link is pasted into WhatsApp, Instagram, Facebook or LinkedIn.
Run it again after changing the previews:  python3 tools/make-share.py   (needs Pillow)"""
import os
from PIL import Image, ImageDraw, ImageFont, ImageOps
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H = 1200, 630
im = Image.new('RGB', (W, H), '#f6f7fb'); d = ImageDraw.Draw(im)
def font(sz, bold=True):
    for f in (['/usr/share/fonts/opentype/inter/Inter-Bold.otf', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'] if bold else ['/usr/share/fonts/opentype/inter/Inter-Regular.otf', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf']):
        if os.path.exists(f): return ImageFont.truetype(f, sz)
    return ImageFont.load_default()
# the logo mark: a 3x3 grid of squares with one orange
x0, y0, s, g = 70, 70, 22, 6
grid = ['d', 'd', 'o', 'd', None, 'd', 'd', None, None]
for i, c in enumerate(grid):
    if c: r, q = divmod(i, 3); d.rounded_rectangle([x0 + q * (s + g), y0 + r * (s + g), x0 + q * (s + g) + s, y0 + r * (s + g) + s], 4, fill='#f26b1d' if c == 'o' else '#15172a')
d.text((x0 + 100, y0 + 4), 'Pixelpatra', font=font(46), fill='#15172a')
d.text((70, 215), 'Your website,', font=font(76), fill='#15172a')
d.text((70, 305), 'ready this week.', font=font(76), fill='#f26b1d')
d.text((70, 420), 'Immersive website templates for shops,', font=font(30, False), fill='#4b5070')
d.text((70, 462), 'portfolios, factories and 3D experiences.', font=font(30, False), fill='#4b5070')
d.text((70, 560), 'Try every template live  ·  Made in India', font=font(26), fill='#15172a')
# four template previews on the right, tilted by a stagger
names = ['giftshop', 'oil', 'portfolio', 'house']; tw, th = 250, 156
for k, n in enumerate(names):
    p = Image.open(f'{ROOT}/previews/{n}.jpg').convert('RGB'); p = ImageOps.fit(p, (tw, th), Image.LANCZOS)
    col, row = k % 2, k // 2; x = 640 + col * (tw + 22) + row * 18; y = 120 + row * (th + 28) + col * 30
    sh = Image.new('RGBA', (tw + 40, th + 40), (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle([20, 24, tw + 20, th + 24], 14, fill=(20, 20, 40, 60)); im.paste(sh.convert('RGB'), (x - 20, y - 20), sh)
    m = Image.new('L', (tw, th), 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, tw - 1, th - 1], 14, fill=255); im.paste(p, (x, y), m)
im.save(f'{ROOT}/share.jpg', quality=88, optimize=True, progressive=True); print('share.jpg written')
