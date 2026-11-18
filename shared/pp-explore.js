// "Explore Pixelpatra": a small corner checklist. Visitors tick off five things that show off the templates; finishing all five
// unlocks a reward (set in shared/pp-config.js, default: a free 15-minute planning call). Progress is kept in this browser only.
//   <script src="shared/pp-explore.js" data-ui="widget">   shows the corner tracker
//   <script src="../shared/pp-explore.js" data-ui="quiet">  inside a demo: records what the visitor tries, shows nothing
(function () {
  'use strict';
  if (window.ppExplore) return;
  var KEY = 'pp-explore', cfg = window.PP_CONFIG || {}, reward = (cfg.reward && cfg.reward.text) || 'A free 15-minute planning call';
  var TASKS = [
    { id: 'name', text: 'Type your business name', href: '#your-name' },
    { id: 'look', text: 'Choose a theme, your own colour or your logo', href: '#hero-sw' },
    { id: 'demo', text: 'Open a live demo', href: '#templates' },
    { id: 'owner', text: 'Try an Owner view inside a shop demo', href: 'demo/?demo=sample1&start=admin' },
    { id: 'phone', text: 'See a shop as a phone app', href: 'demo/?demo=sample1&device=phone' }
  ];
  var script = document.currentScript, mode = (script && script.dataset.ui) || 'widget';
  function read() { try { var a = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(a) ? a.filter(function (x) { return TASKS.some(function (t) { return t.id === x; }); }) : []; } catch (e) { return []; } }
  function write(a) { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) { /* storage blocked */ } }
  var listeners = [];
  function mark(id) {
    var a = read(); if (a.indexOf(id) >= 0 || !TASKS.some(function (t) { return t.id === id; })) return;
    var was = a.length === TASKS.length; a.push(id); write(a); listeners.forEach(function (f) { f(id, !was && a.length === TASKS.length); });
  }
  function unlocked() { return read().length === TASKS.length; }
  window.ppExplore = { mark: mark, unlocked: unlocked, reward: reward, count: function () { return read().length; }, on: function (f) { listeners.push(f); } };

  // ---------- what counts ----------
  if (mode === 'quiet') {
    mark('demo');
    var ownerCheck = function () { if (location.hash === '#admin') mark('owner'); };
    ownerCheck(); addEventListener('hashchange', ownerCheck);
    document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-act="mode"][data-v="app"]'); if (b) mark('phone'); }, true);
  }
  if (mode !== 'widget' || new URLSearchParams(location.search).get('embed') === '1') return; // inside the live-preview window the page behind it shows the tracker

  // ---------- the corner tracker ----------
  var css = '.pp-ex{position:fixed;z-index:950;left:14px;bottom:calc(14px + var(--pp-cta-h,0px));font:500 14px/1.35 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}' +
    '.pp-ex-pill{all:unset;box-sizing:border-box;cursor:pointer;display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 16px 0 12px;border-radius:99px;background:#1b1410;color:#fff;font-weight:700;box-shadow:0 6px 20px rgba(0,0,0,.3)}' +
    '.pp-ex-pill:focus-visible{outline:3px solid #ffb27a;outline-offset:3px}.pp-ex-star{color:#ffb454;font-size:17px;line-height:1}.pp-ex.done .pp-ex-pill{background:#14532d}' +
    '.pp-ex-ring{width:22px;height:22px;border-radius:50%;background:conic-gradient(#ffb454 calc(var(--p,0)*1%),rgba(255,255,255,.25) 0)}.pp-ex-ring::after{content:"";display:block;width:14px;height:14px;margin:4px;border-radius:50%;background:#1b1410}.pp-ex.done .pp-ex-ring::after{background:#14532d}' +
    '.pp-ex-panel{position:absolute;left:0;bottom:54px;width:min(320px,calc(100vw - 28px));padding:16px 18px;border-radius:16px;background:#fff;color:#1b1410;box-shadow:0 14px 44px rgba(0,0,0,.35)}.pp-ex-panel[hidden]{display:none}' +
    '.pp-ex-panel h2{margin:0 0 2px;font-size:17px}.pp-ex-sub{margin:0 0 10px;color:#6b5d52;font-size:13px}.pp-ex-bar{height:6px;border-radius:99px;background:#eee4d8;overflow:hidden;margin:0 0 12px}.pp-ex-bar i{display:block;height:100%;background:#f97316;transition:width .4s}' +
    '.pp-ex-list{list-style:none;margin:0;padding:0;display:grid;gap:6px}.pp-ex-list li{display:flex;gap:9px;align-items:flex-start}.pp-ex-list .tick{flex:none;width:20px;height:20px;border-radius:50%;border:2px solid #cdbfb0;display:grid;place-items:center;font-size:12px;color:#fff;margin-top:1px}' +
    '.pp-ex-list li.on .tick{background:#16a34a;border-color:#16a34a}.pp-ex-list li.on span{color:#6b5d52;text-decoration:line-through}.pp-ex-list a{color:inherit;text-underline-offset:3px}' +
    '.pp-ex-reward{margin:12px 0 0;padding:10px 12px;border-radius:12px;background:#fff4e8;font-size:13.5px}.pp-ex.done .pp-ex-reward{background:#dcfce7}.pp-ex-reward a{display:inline-block;margin-top:6px;font-weight:700}' +
    '.pp-ex-x{all:unset;cursor:pointer;position:absolute;right:10px;top:8px;padding:6px;color:#6b5d52}.pp-ex-x:focus-visible{outline:2px solid #f97316;border-radius:6px}' +
    '@media (prefers-reduced-motion:reduce){.pp-ex-bar i{transition:none}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  var root = document.createElement('div'); root.className = 'pp-ex';
  root.innerHTML = '<div class="pp-ex-panel" id="pp-ex-panel" role="region" aria-label="Explore Pixelpatra" hidden><button type="button" class="pp-ex-x" aria-label="Close checklist">✕</button><h2>Explore Pixelpatra</h2><p class="pp-ex-sub" id="pp-ex-sub"></p><div class="pp-ex-bar" aria-hidden="true"><i id="pp-ex-fill"></i></div><ul class="pp-ex-list" id="pp-ex-list"></ul><div class="pp-ex-reward" id="pp-ex-reward"></div></div>' +
    '<button type="button" class="pp-ex-pill" id="pp-ex-pill" aria-expanded="false" aria-controls="pp-ex-panel"><span class="pp-ex-ring" id="pp-ex-ring"></span><span id="pp-ex-count"></span></button>';
  function paint() {
    var a = read(), n = a.length, pct = Math.round(n / TASKS.length * 100), done = n === TASKS.length;
    root.classList.toggle('done', done); root.style.setProperty('--p', pct);
    root.querySelector('#pp-ex-count').textContent = done ? 'Reward unlocked' : n + ' of ' + TASKS.length + ' explored';
    root.querySelector('#pp-ex-sub').textContent = done ? 'You have tried everything. Nicely done.' : 'Try five things and unlock a reward.';
    root.querySelector('#pp-ex-fill').style.width = pct + '%';
    root.querySelector('#pp-ex-list').innerHTML = TASKS.map(function (t) { var on = a.indexOf(t.id) >= 0; return '<li class="' + (on ? 'on' : '') + '"><span class="tick" aria-hidden="true">' + (on ? '✓' : '') + '</span><span>' + (on ? '<span class="sr-only" style="position:absolute;left:-9999px">Done: </span>' : '') + (on ? t.text : '<a href="' + t.href + '">' + t.text + '</a>') + '</span></li>'; }).join('');
    root.querySelector('#pp-ex-reward').innerHTML = done ? '<b>Unlocked: ' + reward + '.</b><br>Mention it when you request a quote; it is added to your request automatically.<br><a href="quote.html?explorer=1">Claim it in a quote request</a>' : '<b>Reward:</b> ' + reward + '.';
  }
  var pill = root.querySelector('#pp-ex-pill'), panel = root.querySelector('#pp-ex-panel');
  function toggle(open) { var o = open == null ? panel.hidden : open; panel.hidden = !o; pill.setAttribute('aria-expanded', String(o)); }
  pill.addEventListener('click', function () { toggle(); }); root.querySelector('.pp-ex-x').addEventListener('click', function () { toggle(false); pill.focus(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { toggle(false); pill.focus(); } });
  document.addEventListener('click', function (e) { if (!panel.hidden && !root.contains(e.target)) toggle(false); });
  window.ppExplore.on(function (id, justDone) { paint(); if (justDone) { toggle(true); if (window.ppUI) ppUI.toast('You unlocked a reward: ' + reward + '.', 'ok'); } });
  addEventListener('storage', function (e) { if (e.key === KEY) paint(); });
  function init() { document.body.appendChild(root); paint(); }
  if (document.body) init(); else document.addEventListener('DOMContentLoaded', init);
})();
