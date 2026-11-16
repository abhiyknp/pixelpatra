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
  var by = function (id) { return THEMES.filter(function (t) { return t.id === id; })[0]; };
  function hex(h) { h = h.replace('#', ''); return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; }
  function css(c) { return '#' + c.map(function (v) { return ('0' + Math.max(0, Math.min(255, Math.round(v))).toString(16)).slice(-2); }).join(''); }
  function mix(a, b, t) { var x = hex(a), y = hex(b); return css([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]); }
  function lum(h) { var c = hex(h).map(function (v) { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; }
  var onText = function (bg) { return lum(bg) > .35 ? '#1a1208' : '#ffffff'; };
  function set(vars) { Object.keys(vars).forEach(function (k) { root.style.setProperty(k, vars[k]); }); }

  var adapters = {
    store: function (t) { set({ '--paper': t.bg, '--surface': t.card, '--ink': t.ink, '--muted': mix(t.ink, t.bg, .38), '--line': mix(t.ink, t.bg, .86), '--saffron': t.accent, '--saffron-ink': onText(t.accent), '--teal': t.olive, '--leaf': t.olive, '--plum': t.accent2, '--sky': t.accent }); },
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
    shop: function (t, quiet) { window.PP_THEME = t.id; root.dataset.skin = t.id; if (!quiet && typeof window.render === 'function') { try { window.render(); } catch (e) { /* page not ready */ } } },
    intros: function (t) { var s = document.getElementById('skin-sel'); if (s && s.value !== t.id) { s.value = t.id; s.dispatchEvent(new Event('change', { bubbles: true })); } root.dataset.skin = t.id; }
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
    el.innerHTML = THEMES.map(function (t) { return '<button type="button" role="radio" class="pp-sw" data-id="' + t.id + '" aria-checked="false" aria-label="' + t.name + ' theme: ' + t.note + '" title="' + t.name + ' · ' + t.note + '" style="--a:' + t.bg + ';--b:' + t.accent + ';--c:' + t.olive + '"><span></span></button>'; }).join('');
    function paint() { [].forEach.call(el.querySelectorAll('.pp-sw'), function (b) { b.setAttribute('aria-checked', String(b.dataset.id === current)); b.tabIndex = b.dataset.id === current || (!current && b.dataset.id === 'signature') ? 0 : -1; }); }
    el.addEventListener('click', function (e) { var b = e.target.closest('.pp-sw'); if (!b) return; apply(b.dataset.id, true); if (opts.onPick) opts.onPick(b.dataset.id); paint(); });
    el.addEventListener('keydown', function (e) { var k = e.key; if (['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].indexOf(k) < 0) return; e.preventDefault(); var i = THEMES.map(function (t) { return t.id; }).indexOf(current || 'signature'); i = (i + (k === 'ArrowRight' || k === 'ArrowDown' ? 1 : THEMES.length - 1)) % THEMES.length; apply(THEMES[i].id, true); if (opts.onPick) opts.onPick(THEMES[i].id); paint(); el.querySelector('[data-id="' + THEMES[i].id + '"]').focus(); });
    window.addEventListener('pp-theme', paint); paint();
  }
  var css1 = '.pp-swatches { display: inline-flex; gap: 8px; align-items: center; } .pp-sw { all: unset; box-sizing: border-box; cursor: pointer; width: 34px; height: 34px; border-radius: 50%; position: relative; background: conic-gradient(var(--b) 0 50%, var(--a) 0 75%, var(--c) 0); box-shadow: 0 0 0 1.5px rgba(128,128,128,.55); transition: transform .2s, box-shadow .2s; } .pp-sw:hover { transform: scale(1.12); } .pp-sw:focus-visible { outline: 3px solid #ffb27a; outline-offset: 3px; } .pp-sw[aria-checked="true"] { box-shadow: 0 0 0 3px #fff, 0 0 0 5px #f97316; } .pp-sw[aria-checked="true"]::after { content: "✓"; position: absolute; inset: 0; display: grid; place-items: center; color: #fff; font: 700 15px/1 system-ui; text-shadow: 0 1px 3px rgba(0,0,0,.7); } @media (max-width: 640px) { .pp-sw { width: 38px; height: 38px; } }';
  var st = document.createElement('style'); st.textContent = css1; document.head.appendChild(st);

  window.ppTheme = { themes: THEMES, apply: apply, mount: mount, current: function () { return current; }, saved: stored };
  var q = new URLSearchParams(location.search).get('theme'), start = (q && by(q) && q) || stored();
  if (start && by(start)) { apply(start, false, true);
    // these pages build their controls after load: apply again once they exist
    if (page !== 'shop' && page !== 'house') [400, 1500].forEach(function (ms) { setTimeout(function () { if (current === start) apply(start, false, true); }, ms); }); }
})();
