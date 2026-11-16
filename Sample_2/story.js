// "Seed to bottle": a scroll-driven film. One tall section; a pinned stage shows six scenes (real video and photos), with
// captions, a chapter rail and a canvas of seeds, dust, golden drops and a rising pool of oil drawn over them.
// Scroll position is the only clock: scroll down to play, back up to rewind.
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var portrait = matchMedia('(max-aspect-ratio: 1/1)').matches;
  var CH = window.STORY_CHAPTERS || [];
  var N = CH.length, FIN = 0.88; // the scenes use the first 88% of the scroll, the title card the rest
  var film = $('#film'), scenesEl = $('#scenes'), capEl = $('#cap'), rail = $('#rail'), bar = $('#bar'), fin = $('#finale'), cv = $('#fx'), ctx = cv.getContext('2d');

  // hero film: the first scene's video, looping behind the title
  var hv = $('#heroVid');
  function heroPlay() { var m = CH[0] && CH[0].media[0]; if (!hv || !m) return; hv.src = portrait && m.portrait ? m.portrait : m.src; hv.play().catch(function () {}); }
  heroPlay();

  if (reduce) document.documentElement.classList.add('static');

  // build scenes, captions and rail
  var scenes = CH.map(function (c, i) {
    var el = document.createElement('div'); el.className = 'scene'; el.setAttribute('aria-hidden', 'true'); if (c.bg) el.style.background = c.bg;
    var layers = c.media.map(function (m, j) {
      var n;
      if (m.type === 'video') { n = document.createElement('video'); n.muted = true; n.loop = true; n.playsInline = true; n.setAttribute('playsinline', ''); n.preload = 'none'; n.poster = m.poster || ''; n.dataset.src = portrait && m.portrait ? m.portrait : m.src; n.className = 'm'; }
      else { n = document.createElement('img'); n.className = 'm'; n.alt = ''; n.decoding = 'async'; n.dataset.src = portrait && m.portrait ? m.portrait : m.src; }
      if (m.filter) n.style.filter = m.filter;
      n.addEventListener('error', function () { n.style.display = 'none'; });
      if (j > 0) n.classList.add('b');
      el.appendChild(n); return n;
    });
    scenesEl.appendChild(el);
    var chap = document.createElement('div'); chap.className = 'chap'; chap.innerHTML = '<span class="eyebrow">' + c.eyebrow + '</span><h2>' + c.h + '</h2><p>' + c.p + '</p>';
    capEl.appendChild(chap);
    var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', c.rail); b.innerHTML = '<span>' + c.rail + '</span><i></i>';
    b.addEventListener('click', function () { goTo(i); }); rail.appendChild(b);
    return { el: el, layers: layers, chap: chap, btn: b, loaded: false, c: c };
  });
  function load(s) {
    if (s.loaded) return; s.loaded = true;
    s.layers.forEach(function (n) { if (n.dataset.src) { n.src = n.dataset.src; if (n.tagName === 'VIDEO') { n.preload = 'auto'; n.load(); } } });
  }
  function range() { var r = film.getBoundingClientRect(); var h = film.offsetHeight - innerHeight; return { p: clamp(-r.top / Math.max(1, h), 0, 1), top: scrollY + r.top, h: h }; }
  function goTo(i) { var r = range(); var c = (i + 0.5) / N * FIN; scrollTo({ top: r.top + c * r.h, behavior: reduce ? 'auto' : 'smooth' }); }

  // ---------- canvas effects ----------
  var W = 0, H = 0, dpr = 1, parts = [], pool = 0, last = 0, vel = 0;
  function size() { dpr = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  addEventListener('resize', size); size();
  var rnd = function (a, b) { return a + Math.random() * (b - a); };
  function spawn(kind) {
    if (kind === 'seeds') return { x: rnd(0, W), y: rnd(-H * .2, 0), vx: rnd(-18, 18), vy: rnd(120, 280), r: rnd(5, 11), a: rnd(0, 6.28), w: rnd(-3, 3), k: kind };
    if (kind === 'dust') return { x: rnd(0, W), y: rnd(H * .2, H), vx: rnd(-8, 8), vy: rnd(-26, -8), r: rnd(1, 3.2), a: rnd(.2, .8), ph: rnd(0, 6.28), k: kind };
    if (kind === 'drops') return { x: W * (portrait ? .5 : .62) + rnd(-3, 3), y: -10, vx: 0, vy: rnd(300, 420), r: rnd(3, 6), k: kind };
  }
  function drawSeed(p) {
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = '#2b2118'; ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * 2.1, 0, 0, 6.28); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(-p.r * .15, -p.r * 1.6, p.r * .3, p.r * 3.2); ctx.restore();
  }
  var ripples = [];
  function frame(t) {
    var dt = Math.min(.05, (t - last) / 1000 || .016); last = t; ctx.clearRect(0, 0, W, H);
    var r = range(), idx = Math.min(N - 1, Math.floor(r.p / FIN * N)), local = clamp((r.p / FIN * N) - idx, 0, 1);
    var kind = (CH[idx] || {}).fx, alpha = r.p > FIN ? clamp(1 - (r.p - FIN) / .04, 0, 1) : 1;
    var speed = 1 + Math.min(3, Math.abs(vel) * 0.02);
    // spawn
    if (kind === 'seeds' && parts.length < 70 && Math.random() < .5) parts.push(spawn('seeds'));
    if (kind === 'dust' && parts.length < 90 && Math.random() < .6) parts.push(spawn('dust'));
    if (kind === 'drops' && Math.random() < .09 + .03 * speed) parts.push(spawn('drops'));
    var poolY = H - clamp(local * 1, 0, 1) * H * .22 - 8;
    ctx.globalAlpha = alpha;
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      if (p.k === 'seeds') { p.x += p.vx * dt * speed; p.y += p.vy * dt * speed; p.a += p.w * dt; drawSeed(p); }
      else if (p.k === 'dust') { p.ph += dt; p.x += (p.vx + Math.sin(p.ph) * 12) * dt; p.y += p.vy * dt; ctx.fillStyle = 'rgba(255,214,120,' + (p.a * (.5 + .5 * Math.sin(p.ph * 2))) + ')'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28); ctx.fill(); }
      else { p.y += p.vy * dt * speed; var g = ctx.createLinearGradient(p.x - p.r, 0, p.x + p.r, 0); g.addColorStop(0, '#f6c53a'); g.addColorStop(1, '#c98a08'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(p.x, p.y, p.r, p.r * 2.2, 0, 0, 6.28); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect(p.x - p.r * .5, p.y - p.r, p.r * .3, p.r * .8); if (kind === 'drops' && p.y > poolY) { ripples.push({ x: p.x, y: poolY, r: 2, a: .9 }); parts.splice(i, 1); continue; } }
      if (p.y > H + 30 || p.y < -40 || p.x < -40 || p.x > W + 40 || (p.k !== kind)) parts.splice(i, 1);
    }
    // the pool of oil that rises through the oil chapter
    if (kind === 'drops') {
      var pg = ctx.createLinearGradient(0, poolY, 0, H); pg.addColorStop(0, 'rgba(245,190,50,.92)'); pg.addColorStop(1, 'rgba(160,100,6,.95)');
      ctx.fillStyle = pg; ctx.beginPath(); ctx.moveTo(0, H); for (var x = 0; x <= W; x += 12) ctx.lineTo(x, poolY + Math.sin(x * .02 + t / 500) * 3); ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
    }
    for (var j = ripples.length - 1; j >= 0; j--) { var q = ripples[j]; q.r += 90 * dt; q.a -= 1.4 * dt; if (q.a <= 0) { ripples.splice(j, 1); continue; } ctx.strokeStyle = 'rgba(255,230,150,' + q.a + ')'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(q.x, q.y, q.r * 2.2, q.r * .5, 0, 0, 6.28); ctx.stroke(); }
    ctx.globalAlpha = 1; vel *= .9;
    if (running) requestAnimationFrame(frame);
  }
  var running = false;
  new IntersectionObserver(function (e) { var on = e[0].isIntersecting; if (on && !running && !reduce) { running = true; last = performance.now(); requestAnimationFrame(frame); } else if (!on) { running = false; } }, { threshold: 0 }).observe(film);

  // ---------- scroll ----------
  var lastY = scrollY, ticking = false;
  function update() {
    ticking = false; if (reduce) return;
    var r = range(), pp = r.p, w = FIN / N, fade = w * .34; vel = scrollY - lastY; lastY = scrollY;
    var idx = Math.min(N - 1, Math.floor(pp / FIN * N));
    document.body.classList.toggle('infilm', pp > 0 && pp < 1);
    scenes.forEach(function (s, i) {
      var c = (i + .5) * w, dist = Math.abs(pp - c);
      if (i === 0 && pp < c) dist = 0; if (i === N - 1 && pp > c) dist = 0;
      var o = clamp((w / 2 + fade / 2 - dist) / fade, 0, 1); if (pp > FIN && i === N - 1) o = clamp(1 - (pp - FIN) / (1 - FIN) * .35, .65, 1);
      var t = clamp((pp - i * w) / w, 0, 1), k = 1.02 + .1 * t;
      s.el.style.opacity = o; s.el.style.visibility = o < .01 ? 'hidden' : 'visible';
      s.layers.forEach(function (n, j) {
        var dx = (j % 2 ? 1 : -1) * (t - .5) * 2.5, dy = (.5 - t) * 3;
        n.style.transform = 'translate3d(' + dx + '%,' + dy + '%,0) scale(' + (k + j * .03) + ')';
        if (j > 0) n.style.opacity = clamp((t - .35) / .3, 0, 1);
      });
      if (Math.abs(i - idx) <= 1) load(s);
      s.layers.forEach(function (n) { if (n.tagName === 'VIDEO' && n.src) { if (o > .02 && n.paused && !reduce) n.play().catch(function () {}); else if (o <= .02 && !n.paused) n.pause(); } });
      s.chap.classList.toggle('on', i === idx && pp < FIN); s.btn.classList.toggle('on', i === idx); s.btn.setAttribute('aria-current', i === idx ? 'step' : 'false');
    });
    fin.classList.toggle('on', pp >= FIN + .03);
    bar.style.width = (pp * 100) + '%';
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  addEventListener('scroll', req, { passive: true }); addEventListener('resize', req);
  scenes.forEach(function (s, i) { if (i < 2) load(s); });
  update();
  if (reduce) scenes.forEach(function (s) { load(s); s.layers.forEach(function (n) { if (n.tagName === 'VIDEO') n.pause(); }); });
})();
