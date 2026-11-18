// Records a short silent clip of each live demo for the template cards (plays on hover). Run with the site served locally:
//   node tools/make-clips.js http://localhost:8795/pixelpatra/ previews
// It scrolls or moves the pointer through each demo, takes screenshots, and ffmpeg turns them into a looping mp4 (forward, then back).
const { chromium } = require('playwright'); const { execFileSync } = require('child_process'); const fs = require('fs'); const path = require('path');
const base = process.argv[2] || 'http://localhost:8795/pixelpatra/', out = process.argv[3] || 'previews', only = process.argv[4];
const N = 30, FPS = 12;
const scroll = (frac) => async (p, k) => { await p.evaluate(([f, k, n]) => { const h = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight) - innerHeight; window.scrollTo(0, Math.min(h, innerHeight * f * (k / n))); }, [frac, k, N]); };
const DEMOS = {
  portfolio: { url: 'Sample_3/index.html', step: async (p, k) => { await p.mouse.move(250 + k * 25, 330 + Math.sin(k / 3) * 80); } },
  ba: { url: 'Sample_4/index.html', step: scroll(1.4) },
  giftshop: { url: 'Sample_1/index.html', step: scroll(1.5) },
  house: { url: 'House_3D_Prototype/index.html', step: scroll(2.6) },
  intros: { url: 'kits/scroll-intros/index.html', step: scroll(2.2) },
  oil: { url: 'Sample_2/index.html', step: scroll(2.6) },
  pixel: { url: 'Sample_5/index.html', setup: async (p) => { const b = await p.$('text=Tear it for me'); if (b) await b.click(); }, step: async () => {} },
  records: { url: 'Sample_6/index.html', step: async (p, k) => { if (k === 6) await p.fill('input[type=search], #q, .search input', 'an').catch(() => {}); await scroll(0.5)(p, k); } },
};
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  for (const [id, d] of Object.entries(DEMOS)) {
    if (only && only !== id) continue;
    const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } }), p = await ctx.newPage(), dir = fs.mkdtempSync('/tmp/clip-' + id + '-');
    await p.goto(base + d.url, { waitUntil: 'load' }); await p.waitForTimeout(id === 'house' ? 7000 : 3500);
    if (d.setup) await d.setup(p);
    for (let k = 0; k < N; k++) { await d.step(p, k); await p.waitForTimeout(id === 'pixel' ? 120 : 260); await p.screenshot({ path: path.join(dir, 'f' + String(k).padStart(3, '0') + '.png') }); }
    await ctx.close();
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(dir, 'f%03d.png'), '-filter_complex', '[0:v]scale=640:400,split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1[v]', '-map', '[v]', '-c:v', 'libx264', '-crf', '30', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', path.join(out, id + '.mp4')]);
    console.log(id, fs.statSync(path.join(out, id + '.mp4')).size);
  }
  await b.close();
})();
