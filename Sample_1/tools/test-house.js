// Screenshots of opening D, the house, at chosen points of the walk. Each shot is
//   { "p": 0..1 walk position, "w": viewport width, "mood": "festive" (optional), "focus": "product-03" (optional),
//     "skin": "signature" (optional) }
// Usage: node tools/test-house.js '[{"p":0.2,"w":1280},{"p":0.6,"w":390,"mood":"festive"}]' [out-dir]
// Prints any page errors. WebGL runs on SwiftShader, so expect a few seconds per shot. Needs tools/preview.sh.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const shots = JSON.parse(process.argv[2] || '[{"p":0.2,"w":1280}]'); const out = process.argv[3] || '.';
const url = process.env.SHOP_URL || 'http://localhost:8765/index.html';
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errs = [];
  for (const [k, s] of shots.entries()) {
    const pg = await b.newPage({ viewport: { width: s.w, height: s.w < 760 ? 780 : 760 } });
    pg.on('pageerror', (e) => errs.push(`shot ${k}: ${e.message}`)); pg.on('console', (m) => { if (m.type() === 'error') errs.push(`shot ${k}: ${m.text().slice(0, 200)}`); });
    await pg.addInitScript((skin) => localStorage.setItem('shop-proto-v2', JSON.stringify({ opening: 'house', skin, seenHouse: true })), s.skin || 'signature');
    await pg.goto(url + '#home'); await pg.waitForTimeout(500);
    await pg.evaluate((p) => { const lc = document.getElementById('lc'), st = document.getElementById('lc-stage'); scrollTo(0, lc.getBoundingClientRect().top + scrollY - 65 + p * (lc.offsetHeight - st.offsetHeight)); }, s.p);
    await pg.waitForFunction(() => window.HOUSE && (window.HOUSE.ready || window.HOUSE.failed), null, { timeout: 120000 }).catch(() => errs.push(`shot ${k}: house not ready`));
    await pg.evaluate(() => { SHOP_DEBUG.LC.p = SHOP_DEBUG.lcTarget(); SHOP_DEBUG.LC.houseIn = 1; }); await pg.waitForTimeout(800);
    if (s.mood) { await pg.click('[data-act="house-moods"]'); await pg.click(`[data-act="house-mood"][data-k="${s.mood}"]`); }
    if (s.focus) await pg.evaluate((id) => { const p = SHOP_DEBUG.LC.p; const i = TOUR_ITEMS.findIndex((o) => (HOUSE.roomAt(p) === 'F' ? o.room === 'F' : o.room === 'BR') && o.label && o.id === id); SHOP_DEBUG.houseFocus(i); }, s.focus);
    await pg.waitForTimeout(s.focus ? 4000 : 2500);
    await pg.screenshot({ path: `${out}/house-${k}.png` }); await pg.close();
  }
  console.log('errors:', errs.length ? errs : 'none'); await b.close();
})();
