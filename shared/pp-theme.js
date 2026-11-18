// Pixelpatra global theme: six colour themes that every template, the store page and the demo picker share.
// The choice is saved in this browser (localStorage "pp-theme"), applied on load, and passed between frames, so picking a
// theme in the picker re-colours the template inside it and the next template opens already in that theme.
//   <script src="../shared/pp-theme.js" data-pp="shop|house|intros|oil|portfolio|store"></script>
(function () {
  'use strict';
  var THEMES = [
    { id: 'signature', name: 'Signature', note: 'Ivory, terracotta and olive', bg: '#FFF8ED', card: '#FFFCF6', ink: '#4B2E1E', accent: '#A3472B', accent2: '#C9A227', olive: '#5B6B46' },
    { id: 'atelier', name: 'Everyday', note: 'Clay and cocoa', bg: '#F4EBDF', card: '#FBF5EE', ink: '#22140E', accent: '#A63D17', accent2: '#B88352', olive: '#5E6B1F' },
    { id: 'festive', name: 'Festive', note: 'Saffron and rani pink', bg: '#FFF3E3', card: '#FFF9F0', ink: '#3A0A14', accent: '#B0124F', accent2: '#C9A227', olive: '#7A4A00' },
    { id: 'monsoon', name: 'Monsoon', note: 'Peacock and moss', bg: '#EEF4F1', card: '#F8FBF9', ink: '#0C2624', accent: '#0B6B63', accent2: '#C9A227', olive: '#4F5E12' },
    { id: 'gifting', name: 'Gifting', note: 'Cherry and blush', bg: '#FFF4F1', card: '#FFFAF8', ink: '#3B0A12', accent: '#A3122A', accent2: '#C9A227', olive: '#6B3A2E' },
    { id: 'evening', name: 'Evening', note: 'Indigo and brass', bg: '#12142B', card: '#171A33', ink: '#F1EDE4', accent: '#E2B45C', accent2: '#C99A6C', olive: '#B9C38A', dark: true }
  ];
  var KEY = 'pp-theme', page = (document.currentScript && document.currentScript.dataset.pp) || 'store', root = document.documentElement;
  var by = function (id) { if (id === 'custom') { var c = getColor(); return c ? customTheme(c) : undefined; } return THEMES.filter(function (t) { return t.id === id; })[0]; };
  function hex(h) { h = h.replace('#', ''); return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; }
  function css(c) { return '#' + c.map(function (v) { return ('0' + Math.max(0, Math.min(255, Math.round(v))).toString(16)).slice(-2); }).join(''); }
  function mix(a, b, t) { var x = hex(a), y = hex(b); return css([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]); }
  function lum(h) { var c = hex(h).map(function (v) { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; }
  var onText = function (bg) { return lum(bg) > .35 ? '#1a1208' : '#ffffff'; };
  // the Pixelpatra shell itself wants a lively accent. The template palettes use deep tones (good for text on a cream page), so
  // for buttons, the logo and the opening cloth the accent is made brighter and more saturated, keeping its hue.
  function hsl(h) { var c = hex(h).map(function (v) { return v / 255; }), mx = Math.max(c[0], c[1], c[2]), mn = Math.min(c[0], c[1], c[2]), l = (mx + mn) / 2, d = mx - mn, s = d ? d / (1 - Math.abs(2 * l - 1)) : 0, hh = 0;
    if (d) { hh = mx === c[0] ? ((c[1] - c[2]) / d) % 6 : mx === c[1] ? (c[2] - c[0]) / d + 2 : (c[0] - c[1]) / d + 4; hh *= 60; if (hh < 0) hh += 360; } return [hh, s, l]; }
  function fromHsl(h, s, l) { var k = function (n) { return (n + h / 30) % 12; }, a = s * Math.min(l, 1 - l), f = function (n) { return l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); }; return css([f(0) * 255, f(8) * 255, f(4) * 255]); }
  function vivid(h) { var x = hsl(h), g = x[0] > 70 && x[0] < 210; /* greens and teals look neon when bright, so they stay a little deeper */ return fromHsl(x[0], Math.max(x[1], g ? .78 : .86), g ? Math.min(.40, Math.max(x[2], .36)) : Math.min(.58, Math.max(x[2], .52))); }
  function best(bg) { var L = lum(bg), dark = (L + .05) / (lum('#1a1208') + .05), white = 1.05 / (L + .05); return dark >= white ? '#1a1208' : '#ffffff'; }
  function set(vars) { Object.keys(vars).forEach(function (k) { root.style.setProperty(k, vars[k]); }); }

  // ---- your own brand colour (kept in this browser only): becomes a seventh theme called "custom"
  var CK = 'pp-color', LK = 'pp-logo', LAK = 'pp-logo-ar';
  function lsGet(k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }
  function getColor() { var c = lsGet(CK); return /^#[0-9a-f]{6}$/i.test(c) ? c.toLowerCase() : ''; }
  function contrastW(h) { return 1.05 / (lum(h) + .05); }
  function deepen(h) { var c = h, i = 0; while (contrastW(c) < 4.5 && i++ < 10) c = mix(c, '#000000', .1); return c; }
  function shiftHue(h, deg, sat, l) { var x = hsl(h); return fromHsl((x[0] + deg + 360) % 360, sat == null ? x[1] : sat, l == null ? x[2] : l); }
  function customTheme(c) {
    var deep = deepen(c);
    return { id: 'custom', name: 'Your colour', note: 'Built from your own brand colour', bg: mix(c, '#fffaf3', .93), card: mix(c, '#ffffff', .97), ink: mix(c, '#000000', .8), accent: deep, accent2: shiftHue(c, 38, .62, .5), olive: shiftHue(deep, -38, .5, .27), base: c };
  }
  var SKIN_VARS = ['--ivory', '--plaster', '--linen', '--sand', '--sand2', '--card', '--caramel', '--terra', '--terra-ink', '--olive', '--choc', '--choc2', '--line', '--line2', '--glow', '--cta', '--on-cta', '--head-bg', '--sk-ink', '--sk-ink2', '--sk-accent', '--sk-dark', '--sk-glow', '--sk-cta', '--sk-on-cta', '--sk-chip'];
  function rgba(h, a) { var c = hex(h); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
  // the three shop templates style themselves with skin variables; a custom colour sets the same variables directly
  function skinInline(t) {
    SKIN_VARS.forEach(function (k) { root.style.removeProperty(k); });
    if (t.id !== 'custom') return;
    var c = t.base, glow = mix(c, '#ffd9a0', .55), v = { '--ivory': t.bg, '--plaster': mix(c, '#fffaf3', .86), '--linen': mix(c, '#fffaf3', .88), '--sand': mix(c, '#ffffff', .55), '--sand2': mix(c, '#ffffff', .7), '--card': t.card,
      '--caramel': t.accent2, '--terra': c, '--terra-ink': t.accent, '--olive': t.olive, '--choc': t.ink, '--choc2': mix(t.ink, '#ffffff', .2), '--line': mix(c, '#ffffff', .78), '--line2': mix(c, '#ffffff', .6), '--glow': glow,
      '--cta': t.accent, '--on-cta': best(t.accent), '--head-bg': rgba(t.bg, .96), '--sk-ink': t.ink, '--sk-ink2': mix(t.ink, '#ffffff', .2), '--sk-accent': t.accent, '--sk-dark': t.ink, '--sk-glow': glow, '--sk-cta': glow, '--sk-on-cta': t.ink, '--sk-chip': rgba(t.card, .94) };
    set(v);
  }
  var adapters = {
    store: function (t) { set({ '--paper': t.bg, '--surface': t.card, '--ink': t.ink, '--muted': mix(t.ink, t.bg, .38), '--line': mix(t.ink, t.bg, .86), '--saffron': vivid(t.accent), '--saffron-ink': best(vivid(t.accent)), '--teal': t.olive, '--leaf': t.olive, '--plum': t.accent2, '--sky': vivid(t.accent) }); },
    oil: function (t) { set({ '--cream': t.bg, '--paper': t.card, '--ink': t.ink, '--ink2': mix(t.ink, t.bg, .3), '--line': mix(t.ink, t.bg, .82), '--gold': t.dark ? t.accent : (lum(t.accent) > .3 ? t.accent : mix(t.accent, '#ffffff', .12)), '--gold2': mix(t.accent, '#ffffff', .35), '--leaf': t.olive }); },
    portfolio: function (t) {
      var dark = t.dark ? t.bg : mix(t.ink, '#000000', .6), acc = t.dark ? t.accent : mix(t.accent, '#ffffff', .22), acc2 = t.dark ? t.accent2 : mix(t.accent2, '#ffffff', .25);
      set({ '--bg': dark, '--ink': t.dark ? t.ink : mix(t.bg, '#ffffff', .4), '--acc': acc, '--mut': mix(t.dark ? t.ink : t.bg, dark, .45) });
      window.PP_COLORS = { c1: hex(acc).map(function (v) { return v / 255; }), c2: hex(acc2).map(function (v) { return v / 255; }) };
    },
    // the records dashboard: its own palette until a theme is chosen
    dash: function (t) { set({ '--bg': t.bg, '--card': t.card, '--ink': t.ink, '--muted': mix(t.ink, t.bg, .4), '--line': mix(t.ink, t.bg, .86), '--accent': t.dark ? t.accent : t.accent, '--accent-ink': onText(t.accent), '--accent2': t.accent2 }); },
    // the Business Analyst portfolio keeps its own dark navy look until a theme is chosen; a light theme uses its light tokens
    ba: function (t) {
      var vars = { '--paper': t.bg, '--surface': t.card, '--surface-2': mix(t.bg, t.ink, .06), '--ink': t.ink, '--ink-2': mix(t.ink, t.bg, .28), '--ink-3': mix(t.ink, t.bg, .46), '--rule': mix(t.ink, t.bg, .84),
        '--accent': t.dark ? t.accent : t.accent, '--accent-ink': t.dark ? mix(t.accent, '#ffffff', .3) : mix(t.accent, '#000000', .15), '--accent-soft': mix(t.accent, t.bg, .88), '--signal': t.accent2, '--signal-soft': mix(t.accent2, t.bg, .86), '--on-signal': onText(t.accent2) };
      root.setAttribute('data-theme', t.dark ? 'dark' : 'light'); set(vars);
    },
    shop: function (t, quiet) { window.PP_THEME = t.id; root.dataset.skin = t.id; skinInline(t); if (!quiet && typeof window.render === 'function') { try { window.render(); } catch (e) { /* page not ready */ } } },
    intros: function (t) { var s = document.getElementById('skin-sel'); if (s && t.id !== 'custom' && s.value !== t.id) { s.value = t.id; s.dispatchEvent(new Event('change', { bubbles: true })); } root.dataset.skin = t.id; skinInline(t);
      if (s && !s.__pp) { s.__pp = 1; s.addEventListener('change', function () { if (s.value !== 'custom') skinInline({ id: '' }); }); } }
  };
  adapters.house = adapters.shop; adapters.hub = function () {};

  var current = null, saved = false;
  function apply(id, persist, quiet) {
    var t = by(id); if (!t) return;
    current = id; root.dataset.ppTheme = id; (adapters[page] || adapters.store)(t, quiet);
    if (persist) { try { localStorage.setItem(KEY, id); saved = true; } catch (e) { /* storage blocked */ } }
    window.dispatchEvent(new CustomEvent('pp-theme', { detail: { id: id, theme: t } }));
  }
  function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  window.addEventListener('storage', function (e) { if (e.key === KEY && e.newValue && e.newValue !== current) apply(e.newValue, false); });
  window.addEventListener('message', function (e) { var m = e.data || {}; if (m.pixelpatra === 'theme' && by(m.id)) apply(m.id, false); });

  // the swatch buttons, used by the picker and the store page
  function mount(el, opts) {
    opts = opts || {}; el.classList.add('pp-swatches'); el.setAttribute('role', 'radiogroup'); el.setAttribute('aria-label', 'Colour theme');
    el.innerHTML = THEMES.map(function (t) { return '<button type="button" role="radio" class="pp-sw" data-id="' + t.id + '" aria-checked="false" aria-label="' + t.name + ' theme: ' + t.note + '" title="' + t.name + ' · ' + t.note + '" style="--a:' + t.bg + ';--b:' + t.accent + ';--c:' + t.olive + '"><span></span></button>'; }).join('') + '<button type="button" role="radio" class="pp-sw pp-custom" data-id="custom" aria-checked="false" aria-label="Your own brand colour: pick any colour" data-tip="Your own colour. Pick any brand colour."><span></span></button><input type="color" class="pp-color-in" tabindex="-1" aria-hidden="true">';
    var cin = el.querySelector('.pp-color-in'), live = 0;
    function openPicker() { cin.value = getColor() || '#f26b1d'; if (cin.showPicker) { try { cin.showPicker(); return; } catch (e) { /* fall through */ } } cin.click(); }
    cin.addEventListener('input', function () { clearTimeout(live); live = setTimeout(function () { setColor(cin.value); apply('custom', true); if (opts.onPick) opts.onPick('custom'); paint(); }, 60); });
    function paint() { var ct = by('custom'), cb = el.querySelector('.pp-custom'); if (cb) { cb.classList.toggle('set', !!ct); if (ct) { cb.style.setProperty('--a', ct.bg); cb.style.setProperty('--b', ct.base); cb.style.setProperty('--c', ct.olive); } }
      [].forEach.call(el.querySelectorAll('.pp-sw'), function (b) { b.setAttribute('aria-checked', String(b.dataset.id === current)); b.tabIndex = b.dataset.id === current || (!current && b.dataset.id === 'signature') ? 0 : -1; }); }
    el.addEventListener('click', function (e) { var b = e.target.closest('.pp-sw'); if (!b) return;
      if (b.dataset.id === 'custom' && (!getColor() || current === 'custom')) { openPicker(); return; } // no colour yet, or already on it: choose or change the colour
      apply(b.dataset.id, true); if (opts.onPick) opts.onPick(b.dataset.id); paint(); });
    el.addEventListener('keydown', function (e) { var k = e.key; if (['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].indexOf(k) < 0) return; e.preventDefault(); var ids = THEMES.map(function (t) { return t.id; }).concat(getColor() ? ['custom'] : []), i = ids.indexOf(current || 'signature'); i = (i + (k === 'ArrowRight' || k === 'ArrowDown' ? 1 : ids.length - 1)) % ids.length; apply(ids[i], true); if (opts.onPick) opts.onPick(ids[i]); paint(); el.querySelector('[data-id="' + ids[i] + '"]').focus(); });
    window.addEventListener('pp-theme', paint); paint();
  }
  var css1 = '.pp-swatches { display: inline-flex; gap: 8px; align-items: center; } .pp-sw { all: unset; box-sizing: border-box; cursor: pointer; width: 34px; height: 34px; border-radius: 50%; position: relative; background: conic-gradient(var(--b) 0 50%, var(--a) 0 75%, var(--c) 0); box-shadow: 0 0 0 1.5px rgba(128,128,128,.55); transition: transform .2s, box-shadow .2s; } .pp-sw:hover { transform: scale(1.12); } .pp-sw:focus-visible { outline: 3px solid #ffb27a; outline-offset: 3px; } .pp-sw[aria-checked="true"] { box-shadow: 0 0 0 3px #fff, 0 0 0 5px #f97316; } .pp-sw[aria-checked="true"]::after { content: "✓"; position: absolute; inset: 0; display: grid; place-items: center; color: #fff; font: 700 15px/1 system-ui; text-shadow: 0 1px 3px rgba(0,0,0,.7); } @media (max-width: 640px) { .pp-sw { width: 38px; height: 38px; } }';
  css1 += ' .pp-sw.pp-custom { background: conic-gradient(#ef4444, #f59e0b, #eab308, #22c55e, #06b6d4, #6366f1, #d946ef, #ef4444); } .pp-sw.pp-custom.set { background: conic-gradient(var(--b) 0 50%, var(--a) 0 75%, var(--c) 0); } .pp-sw.pp-custom:not(.set)::before { content: "+"; position: absolute; inset: 0; display: grid; place-items: center; color: #fff; font: 700 18px/1 system-ui, sans-serif; text-shadow: 0 1px 2px rgba(0,0,0,.45); } .pp-color-in { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }';
  var st = document.createElement('style'); st.textContent = css1; document.head.appendChild(st);

  // ---- brand: the name typed on the Pixelpatra home page replaces the template's sample brand name everywhere it is shown
  var scr = document.currentScript, DEFS = ((scr && scr.dataset.brand) || '').split('|').filter(Boolean), INIT = (scr && scr.dataset.initials) || '';
  DEFS.sort(function (a, b) { return b.length - a.length; });
  function custom() { try { return (localStorage.getItem('pp-name') || '').trim().slice(0, 28); } catch (e) { return ''; } }
  function initials(n) { return (n.split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 2) || '').toUpperCase(); }
  function conv(str) { var n = custom(); if (!n || !DEFS.length || !str) return str; DEFS.forEach(function (d) { if (str.indexOf(d) >= 0) str = str.split(d).join(d === d.toUpperCase() && d !== d.toLowerCase() ? n.toUpperCase() : n); }); return str; }
  var origText = new WeakMap(), origAttr = new WeakMap(), ATTRS = ['alt', 'aria-label', 'title', 'placeholder'];
  function fixText(node) {
    var cur = node.nodeValue, o = origText.has(node) ? origText.get(node) : cur;
    if (!origText.has(node)) { if (!(DEFS.some(function (d) { return cur.indexOf(d) >= 0; }) || (INIT && cur.trim() === INIT))) return; origText.set(node, cur); o = cur; }
    var n = custom(), v = n ? (INIT && o.trim() === INIT ? o.replace(INIT, initials(n)) : conv(o)) : o; if (v !== cur) node.nodeValue = v;
  }
  function fixEl(el) {
    ATTRS.forEach(function (a) { var cur = el.getAttribute(a); if (cur == null) return; var m = origAttr.get(el) || {}; var o = m[a] != null ? m[a] : cur; if (m[a] == null) { if (!DEFS.some(function (d) { return cur.indexOf(d) >= 0; })) return; m[a] = cur; origAttr.set(el, m); } var v = custom() ? conv(o) : o; if (v !== cur) el.setAttribute(a, v); });
  }
  function walk(root) {
    if (!root || (root.nodeType === 1 && /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA)$/.test(root.nodeName))) return;
    if (root.nodeType === 3) { fixText(root); return; }
    if (root.nodeType !== 1 && root.nodeType !== 9) return;
    var tw = document.createTreeWalker(root, 5 /* text and elements */, { acceptNode: function (n) { return n.nodeType === 1 && /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA)$/.test(n.nodeName) ? 2 : 1; } }), n;
    if (root.nodeType === 1) fixEl(root);
    while ((n = tw.nextNode())) { if (n.nodeType === 3) fixText(n); else fixEl(n); }
  }
  var brandOn = false, bq = [], bt = 0;
  function brandAll() {
    var n = custom(); root.toggleAttribute('data-pp-brand', !!n);
    if (n) { root.style.setProperty('--pp-brand', JSON.stringify(n)); root.style.setProperty('--pp-brand-up', JSON.stringify(n.toUpperCase())); } else { root.style.removeProperty('--pp-brand'); root.style.removeProperty('--pp-brand-up'); }
    if (document.title) { if (!document.__ppT) document.__ppT = document.title; document.title = n ? conv(document.__ppT) : document.__ppT; }
    walk(document.body || root);
  }
  function startBrand() {
    if (brandOn || !DEFS.length) return; brandOn = true; brandAll();
    new MutationObserver(function (ms) { ms.forEach(function (m) { if (m.type === 'childList') m.addedNodes.forEach(function (x) { bq.push(x); }); else bq.push(m.target); }); if (!bt) bt = requestAnimationFrame(function () { bt = 0; var q = bq; bq = []; q.forEach(walk); }); }).observe(document.body, { childList: true, subtree: true, characterData: true });
    window.addEventListener('storage', function (e) { if (e.key === 'pp-name') brandAll(); });
    window.addEventListener('message', function (e) { if ((e.data || {}).pixelpatra === 'brand') brandAll(); });
  }
  if (DEFS.length) { if (document.body) startBrand(); else document.addEventListener('DOMContentLoaded', startBrand); }
  var bcss = 'html[data-pp-brand] .mark.wordmark { -webkit-mask-image: none; mask-image: none; background: none; width: auto; aspect-ratio: auto; height: auto; display: inline-block; } html[data-pp-brand] .mark.wordmark::after { content: var(--pp-brand-up); font: 600 19px/1 "Cormorant Garamond", Georgia, serif; letter-spacing: .16em; color: var(--choc, currentColor); white-space: nowrap; } html[data-pp-brand] .mark.lockup { background: none; width: auto; aspect-ratio: auto; display: grid; place-items: center; } html[data-pp-brand] .mark.lockup::after { content: var(--pp-brand-up); font: 600 clamp(26px, 6vw, 64px)/1.1 "Cormorant Garamond", Georgia, serif; letter-spacing: .14em; color: var(--choc, currentColor); text-align: center; }';
  var bst = document.createElement('style'); bst.textContent = bcss; document.head.appendChild(bst);
  function brandName(def) { return conv(def); }

  // ---- your own logo (kept in this browser only; the logo is shrunk to a small PNG before it is saved)
  function setColor(c) { if (!/^#[0-9a-f]{6}$/i.test(c)) return false; try { localStorage.setItem(CK, c.toLowerCase()); } catch (e) { return false; } window.dispatchEvent(new CustomEvent('pp-theme', { detail: { id: current } })); return true; }
  function getLogo() { return lsGet(LK); }
  function setLogo(url, ar) { try { localStorage.setItem(LK, url); localStorage.setItem(LAK, String(ar)); } catch (e) { return false; } applyLogo(); return true; }
  function clearLogo() { try { localStorage.removeItem(LK); localStorage.removeItem(LAK); } catch (e) { /* storage blocked */ } applyLogo(); }
  function applyLogo() {
    var u = getLogo(), ar = parseFloat(lsGet(LAK)) || 1;
    if (u && /^data:image\/(png|jpeg|webp);base64,/.test(u)) { root.setAttribute('data-pp-logo', ''); root.style.setProperty('--pp-logo', 'url("' + u + '")'); root.style.setProperty('--pp-logo-ar', String(ar)); }
    else { root.removeAttribute('data-pp-logo'); root.style.removeProperty('--pp-logo'); root.style.removeProperty('--pp-logo-ar'); }
    window.dispatchEvent(new CustomEvent('pp-logo', { detail: { has: !!u } }));
  }
  var lcss = 'html[data-pp-logo] .mark.wordmark, html[data-pp-logo] .mark.lockup, html[data-pp-logo] .mark.monogram { -webkit-mask-image: none !important; mask-image: none !important; background: var(--pp-logo) center / contain no-repeat !important; aspect-ratio: var(--pp-logo-ar) !important; width: auto !important; }'
    + ' html[data-pp-logo] .mark.wordmark { height: 30px; } html[data-pp-logo] .mark.wordmark::after, html[data-pp-logo] .mark.lockup::after { content: none !important; } html[data-pp-logo] .mark.lockup { display: block !important; background: var(--pp-logo) center / contain no-repeat, rgba(255, 251, 244, .94) !important; background-origin: content-box, border-box !important; padding: 14px 22px !important; border-radius: 16px !important; box-sizing: content-box !important; } html[data-pp-logo] .mark.monogram { height: 34px; } html[data-pp-logo] .mark.lockup { height: clamp(90px, 16vw, 170px); max-width: 100%; }'
    + ' html[data-pp-logo] [data-pp-logo-slot] { display: inline-block !important; background: var(--pp-logo) center / contain no-repeat !important; aspect-ratio: var(--pp-logo-ar) !important; height: var(--slot-h, 30px) !important; width: auto !important; min-width: 0 !important; font-size: 0 !important; color: transparent !important; border-radius: 0 !important; box-shadow: none !important; padding: 0 !important; border: 0 !important; } html[data-pp-logo] [data-pp-logo-slot] * { display: none !important; }';
  var lst = document.createElement('style'); lst.textContent = lcss; document.head.appendChild(lst); applyLogo();
  window.addEventListener('storage', function (e) { if (e.key === LK || e.key === LAK) applyLogo(); if (e.key === CK && current === 'custom') apply('custom', false); });
  window.ppTheme = { setColor: setColor, getColor: getColor, setLogo: setLogo, getLogo: getLogo, clearLogo: clearLogo, themes: THEMES, apply: apply, mount: mount, current: function () { return current; }, saved: stored, brand: brandName, refreshBrand: brandAll };
  var q = new URLSearchParams(location.search).get('theme'), start = (q && by(q) && q) || stored();
  if (start && by(start)) { apply(start, false, true);
    // these pages build their controls after load: apply again once they exist
    if (page !== 'shop' && page !== 'house') [400, 1500].forEach(function (ms) { setTimeout(function () { if (current === start) apply(start, false, true); }, ms); }); }
})();
