#!/usr/bin/env python3
"""Downloads the openly licensed photos and videos used by Sample_2 from Wikimedia Commons, shrinks them for the web and
writes assets/credits.js (author, licence and link for every file, as the licences require).

    python3 tools/fetch-media.py            # everything not downloaded yet
    python3 tools/fetch-media.py bottle     # just one entry

Needs: Python 3 with Pillow, ffmpeg, curl. Wikimedia limits automated downloads, so this waits between requests and stops
at the first "429 too many requests"; run it again later and it carries on where it stopped (originals are kept in
.cache/, which is not committed). Replace these with the client's own photos and films for a live site.
"""
import json, os, re, subprocess, sys, time, urllib.parse
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
CACHE = os.path.join(ROOT, '.cache'); OUT = os.path.join(ROOT, 'assets'); os.makedirs(CACHE, exist_ok=True)
UA = 'pixelpatra-sample-build/1.0 (demo site; contact via the repository owner)'
GAP = 6  # seconds between requests
# name -> (Commons file title, kind, options)
MEDIA = {
  'field':     ('Sunflower - Arroyo Seco- New Mexico- United States.webm', 'video', {'w': 1280, 't': 10}),
  'field-p':   ('Sunflower Field at sulthan Bathery.webm', 'video', {'w': 720, 't': 10, 'portrait': True}),
  'sun':       ('Heliotropism in Helianthus annuus.webm', 'video', {'w': 1280, 't': 10}),
  'oil':       ('Water and sunflower oil on a magnetic stirrer 01 ies.webm', 'video', {'w': 1280, 't': 8}),
  'seeds':     ('Sunflower seeds. img 001.jpg', 'image', {'w': 1920}),
  'seeds2':    ('Sunflower seeds. img 004.jpg', 'image', {'w': 1920}),
  'mill':      ('Meher oil mill in Yeditha.jpg', 'image', {'w': 1920}),
  'press':     ('Surendra Solvent Oil Mll in Yeditha.jpg', 'image', {'w': 1920}),
  'extract':   ('Extração de óleo de girassol ECIRTEC SP.jpg', 'image', {'w': 1920}),
  'bottle':    ('Bottle 1 liter Sunflower refined oil.jpg', 'image', {'w': 1400}),
  'bottle2':   ('Ayçiçek yağı.jpg', 'image', {'w': 1400}),
}
def curl(args, out=None):
    cmd = ['curl', '-sL', '-m', '300', '-A', UA] + (['-o', out] if out else []) + args
    return subprocess.run(cmd, capture_output=True)
class RateLimited(Exception): pass
def info(title):
    u = 'https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url|extmetadata|size&format=json&titles=' + urllib.parse.quote('File:' + title)
    r = curl([u]).stdout.decode('utf8', 'replace')
    if 'too many requests' in r.lower(): raise RateLimited(title)
    p = list(json.loads(r)['query']['pages'].values())[0]; return p['imageinfo'][0]
def download(name, title):
    dest = os.path.join(CACHE, name + os.path.splitext(title)[1].lower())
    meta_path = os.path.join(CACHE, name + '.json')
    if os.path.exists(dest) and os.path.exists(meta_path): return dest, json.load(open(meta_path))
    ii = info(title); time.sleep(GAP); m = ii['extmetadata']
    meta = {'title': title, 'page': 'https://commons.wikimedia.org/wiki/File:' + urllib.parse.quote(title.replace(' ', '_')),
            'license': m.get('LicenseShortName', {}).get('value', ''), 'license_url': m.get('LicenseUrl', {}).get('value', ''),
            'artist': re.sub(r'\s+', ' ', re.sub('<[^>]+>', '', m.get('Artist', {}).get('value', ''))).strip()[:100]}
    url = ii['url'].split('?')[0]
    curl([url], dest)
    head = open(dest, 'rb').read(400) if os.path.exists(dest) else b''
    if b'<html' in head.lower() or b'<!DOCTYPE' in head: os.remove(dest); raise RateLimited(title)
    json.dump(meta, open(meta_path, 'w'), ensure_ascii=False); time.sleep(GAP); return dest, meta
def make(name, src, kind, o):
    if kind == 'image':
        from PIL import Image
        im = Image.open(src).convert('RGB'); im.thumbnail((o['w'], o['w'])); im.save(os.path.join(OUT, name + '.jpg'), quality=78, optimize=True, progressive=True)
    else:
        mp4 = os.path.join(OUT, name + '.mp4'); w = o['w']
        vf = ('scale=%d:-2' % w) if not o.get('portrait') else ('scale=%d:-2' % w)
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', src, '-t', str(o['t']), '-an', '-vf', vf + ',fps=25', '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4], check=True)
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', mp4, '-frames:v', '1', '-q:v', '4', os.path.join(OUT, name + '-poster.jpg')], check=True)
def main():
    want = sys.argv[1:] or list(MEDIA); done = {}
    for name in want:
        title, kind, o = MEDIA[name]
        try: src, meta = download(name, title)
        except RateLimited as e: print('Rate limited at', name, '- run again later.'); break
        make(name, src, kind, o); done[name] = meta; print('ok', name)
    credits = []
    for name, (title, kind, o) in MEDIA.items():
        p = os.path.join(CACHE, name + '.json')
        if os.path.exists(p): m = json.load(open(p)); credits.append({'name': name, 'kind': kind, **m})
    open(os.path.join(OUT, 'credits.js'), 'w', encoding='utf8').write('window.CREDITS = ' + json.dumps(credits, ensure_ascii=False, indent=1) + ';\n')
if __name__ == '__main__': main()
