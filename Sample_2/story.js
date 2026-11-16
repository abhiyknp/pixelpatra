// "Seed to bottle": a scroll-driven film. One tall section with a pinned stage. Scrolling scrubs one real video clip
// (field, sunflower, seeds, press, oil, bottles), swaps the captions and chapter rail, and the last stretch ends on the
// brand title. Scroll position is the only clock: scroll down to play, back up to rewind.
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var F = window.STORY_FILM || {}, CH = window.STORY_CHAPTERS || [];
  var N = CH.length, FIN = 0.9; // the chapters use the first 90% of the scroll, the title card the rest
  var film = $('#film'), vid = $('#filmVid'), capEl = $('#cap'), rail = $('#rail'), bar = $('#bar'), fin = $('#finale'), cv = $('#fx'), ctx = cv.getContext('2d');

  // Lite mode swaps the film for six still frames, one per chapter (about 0.6 MB instead of 3 to 7 MB). It turns on by itself
  // on Data Saver and slow connections, and a button lets anyone switch it.
  var tall = matchMedia('(max-aspect-ratio: 1/1)').matches;
  var lite = (function () {
    var q = new URLSearchParams(location.search).get('lite'); if (q) return q === '1';
    try { var s = localStorage.getItem('pp-lite'); if (s !== null) return s === '1'; } catch (e) { /* storage blocked */ }
    var c = navigator.connection; return !!(c && (c.saveData || /(^|-)(slow-)?2g|3g/.test(c.effectiveType || '')));
  })();
  var liteBtn = $('#lite');
  if (liteBtn) { liteBtn.textContent = lite ? 'Lite mode: on (tap for full film)' : 'Lite mode'; liteBtn.setAttribute('aria-pressed', String(lite));
    liteBtn.addEventListener('click', function () { try { localStorage.setItem('pp-lite', lite ? '0' : '1'); } catch (e) { /* storage blocked */ } var u = new URL(location.href); u.searchParams.delete('lite'); location.href = u.toString(); }); }
  var still = null;
  // mp4 first (Safari and phones), webm as the fallback. Tall phone screens get the narrow 9:16 cut.
  function source(v) {
    v.muted = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.poster = F.poster || '';
    var m = document.createElement('source'); m.src = tall && F.mp4p ? F.mp4p : F.mp4; m.type = 'video/mp4'; v.appendChild(m);
    if (!(tall && F.mp4p)) { var w = document.createElement('source'); w.src = F.webm; w.type = 'video/webm'; v.appendChild(w); }
    v.preload = 'auto'; v.load();
  }
  if (lite && F.stills) {
    still = document.createElement('img'); still.className = 'filmvid'; still.alt = ''; still.src = F.stills[0]; vid.parentNode.replaceChild(still, vid);
    vid = { seeking: false, readyState: 0, currentTime: 0, addEventListener: function () {}, controls: false }; // nothing to scrub
  } else source(vid);
  // the hero plays the same clip on a loop
  var hv = $('#heroVid'); if (hv && lite) { hv.poster = F.poster || ''; hv.removeAttribute('autoplay'); } else if (hv) { var hs = document.createElement('source'); hs.src = F.hero || F.mp4; hs.type = 'video/mp4'; hv.poster = F.poster || ''; hv.appendChild(hs); hv.loop = true; hv.preload = reduce ? 'none' : 'auto'; if (!reduce) hv.play().catch(function () {}); }
  if (reduce) { document.documentElement.classList.add('static'); vid.controls = true; }

  var chaps = CH.map(function (c, i) {
    var chap = document.createElement('div'); chap.className = 'chap'; chap.innerHTML = '<span class="eyebrow">' + c.eyebrow + '</span><h2>' + c.h + '</h2><p>' + c.p + '</p>';
    capEl.appendChild(chap);
    var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', c.rail); b.innerHTML = '<span>' + c.rail + '</span><i></i>';
    b.addEventListener('click', function () { goTo(i); }); rail.appendChild(b);
    return { chap: chap, btn: b, c: c };
  });
  function range() { var r = film.getBoundingClientRect(); var h = film.offsetHeight - innerHeight; return { p: clamp(-r.top / Math.max(1, h), 0, 1), top: scrollY + r.top, h: h }; }
  function goTo(i) { var r = range(); scrollTo({ top: r.top + (i + 0.5) / N * FIN * r.h, behavior: reduce ? 'auto' : 'smooth' }); }

  // ---------- golden dust drifting over the film ----------
  var W = 0, H = 0, dpr = 1, motes = [], last = 0;
  function size() { dpr = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  addEventListener('resize', size); size();
  for (var i = 0; i < 46; i++) motes.push({ x: Math.random(), y: Math.random(), r: .6 + Math.random() * 2, s: .004 + Math.random() * .012, ph: Math.random() * 6.28, a: .15 + Math.random() * .5 });

  // ---------- scrubbing ----------
  var target = 0, cur = 0, state = { idx: 0, p: 0 }, running = false;
  function seek() {
    // ease toward the target time; seek only when the last seek has finished, so the frames stay in step with the scroll
    var d = target - cur; cur += d * .22; if (Math.abs(d) < .004) cur = target;
    if (!vid.seeking && vid.readyState >= 2 && Math.abs(vid.currentTime - cur) > .004) { try { vid.currentTime = cur; } catch (e) { /* not ready */ } }
  }
  function frame(t) {
    var dt = Math.min(.05, (t - last) / 1000 || .016); last = t; seek();
    ctx.clearRect(0, 0, W, H);
    var a = state.p > FIN ? clamp(1 - (state.p - FIN) / .05, 0, 1) : 1;
    motes.forEach(function (m) { m.ph += dt; m.y -= m.s * dt * 6; m.x += Math.sin(m.ph) * .0004; if (m.y < -.02) { m.y = 1.02; m.x = Math.random(); }
      ctx.fillStyle = 'rgba(255,214,120,' + (m.a * a * (.5 + .5 * Math.sin(m.ph * 2))) + ')'; ctx.beginPath(); ctx.arc(m.x * W, m.y * H, m.r, 0, 6.28); ctx.fill(); });
    if (running) requestAnimationFrame(frame);
  }
  new IntersectionObserver(function (e) { var on = e[0].isIntersecting; if (on && !running && !reduce) { running = true; last = performance.now(); requestAnimationFrame(frame); } else if (!on) { running = false; } }, { threshold: 0 }).observe(film);

  // ---------- scroll ----------
  var ticking = false;
  function update() {
    ticking = false; if (reduce) return;
    var r = range(), pp = r.p; state.p = pp;
    var q = clamp(pp / FIN, 0, .99999) * N, idx = Math.floor(q), local = q - idx, c = CH[idx].time;
    if (still && idx !== state.idx && F.stills[idx]) { var img = still; img.style.opacity = 0; setTimeout(function () { img.onload = function () { img.style.opacity = 1; }; img.src = F.stills[idx]; }, 220); }
    state.idx = idx; target = pp >= FIN ? (CH[N - 1].time[1] || F.length) : c[0] + (c[1] - c[0]) * local;
    document.body.classList.toggle('infilm', pp > 0 && pp < 1);
    chaps.forEach(function (s, i) { s.chap.classList.toggle('on', i === idx && pp < FIN); s.btn.classList.toggle('on', i === idx); s.btn.setAttribute('aria-current', i === idx ? 'step' : 'false'); });
    fin.classList.toggle('on', pp >= FIN + .03);
    bar.style.width = (pp * 100) + '%';
    if (!running && !reduce) { seek(); }
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  addEventListener('scroll', req, { passive: true }); addEventListener('resize', req);
  vid.addEventListener('loadeddata', function () { update(); seek(); });
  update();
})();
