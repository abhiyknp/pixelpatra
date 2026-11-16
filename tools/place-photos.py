#!/usr/bin/env python3
"""Puts real photos into every template that uses them. See PHOTO_PROMPTS.md for the list of names.

    python3 tools/place-photos.py <folder with the photos>

Each file is cropped and shrunk to the size its template needs, copied to every template that uses it, and registered in
assets/photos.json (products) so nothing else has to be edited. Files with other names are ignored and listed at the end.
Needs Pillow.
"""
import json, os, re, sys
from PIL import Image, ImageOps
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOPS = ['Sample_1', 'House_3D_Prototype', 'kits/scroll-intros']
PACK = {'pack-box': (1100, 733), 'pack-card': (733, 1100), 'pack-jar': (1100, 733), 'pack-leather': (1100, 733), 'pack-pouch': (1100, 733),
        'pack-seal': (1100, 733), 'pack-tag': (1100, 1100), 'logo-photo': (1100, 638)}
def save(im, size, dest, q=82):
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    ImageOps.fit(im.convert('RGB'), size, Image.LANCZOS, centering=(.5, .45)).save(dest, 'JPEG', quality=q, optimize=True, progressive=True)
def main(src):
    done, skipped = [], []
    for dp, _, fs in os.walk(src):
        for f in sorted(fs):
            name, ext = os.path.splitext(f); ext = ext.lower()
            if ext not in ('.jpg', '.jpeg', '.png', '.webp'): continue
            path = os.path.join(dp, f); im = Image.open(path); im = ImageOps.exif_transpose(im)
            if re.fullmatch(r'product-\d\d|gift-set-(small|medium|large)', name):
                for s in SHOPS:
                    save(im, (900, 900), f'{ROOT}/{s}/assets/products/{name}.jpg')
                    pj = f'{ROOT}/{s}/assets/photos.json'; d = json.load(open(pj)) if os.path.exists(pj) else {'products': {}}
                    d.setdefault('products', {})[name] = f'assets/products/{name}.jpg'; json.dump(d, open(pj, 'w'), indent=1)
                done.append(name)
            elif name in PACK:
                for s in SHOPS: save(im, PACK[name], f'{ROOT}/{s}/assets/{name}.jpg')
                done.append(name)
            elif re.fullmatch(r'p[1-6]', name):
                save(im, (1600, 1200), f'{ROOT}/Sample_3/assets/{name}.jpg', 80); done.append(name)
            elif name in ('pack-1l', 'pack-5l', 'pack-15l'):
                save(im, (1200, 900), f'{ROOT}/Sample_2/assets/{name}.jpg', 80)
                cfg = f'{ROOT}/Sample_2/config.js'; s2 = open(cfg, encoding='utf-8').read().replace(f'assets/{name}.svg', f'assets/{name}.jpg'); open(cfg, 'w', encoding='utf-8').write(s2); done.append(name)
            else: skipped.append(f)
    print('placed:', ', '.join(done) or 'nothing'); 
    if skipped: print('ignored (name not in the list):', ', '.join(skipped))
if __name__ == '__main__':
    if len(sys.argv) != 2: sys.exit(__doc__)
    main(sys.argv[1])
