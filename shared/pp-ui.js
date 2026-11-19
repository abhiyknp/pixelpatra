// Small shared helpers for every Pixelpatra page: tooltips ([data-tip]), messages (toast and alert), an offline warning,
// a warning when the browser blocks saved settings, and a back-to-top button. No dependencies.
//   ppUI.toast('Saved')                      a short message that fades away
//   ppUI.alert('Could not load the demo')    a message that stays until closed (role="alert")
//   <button data-tip="What this does">       a tooltip on hover and keyboard focus
(function () {
  'use strict';
  if (window.ppUI) return;
  var doc = document, mode = doc.currentScript && doc.currentScript.dataset.ui, hub = mode === 'hub', demo = mode === 'demo';
  var framed = false; try { framed = window.top !== window; } catch (e) { framed = true; } // inside the demo hub, the hub itself shows the offline and storage messages
  var css = '' +
    '#pp-tip{position:fixed;z-index:2147483000;max-width:260px;padding:7px 10px;border-radius:8px;background:#1b1410;color:#fff;font:500 12.5px/1.35 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.28);pointer-events:none;opacity:0;transform:translateY(3px);transition:opacity .12s,transform .12s;text-transform:none;letter-spacing:0;font-style:normal}' +
    '#pp-tip.on{opacity:1;transform:none}' +
    '.pp-msgs{position:fixed;z-index:2147483100;left:50%;bottom:18px;transform:translateX(-50%);display:flex;flex-direction:column;gap:8px;align-items:center;width:min(92vw,520px);pointer-events:none}' +
    '.pp-msg{pointer-events:auto;display:flex;gap:10px;align-items:flex-start;width:100%;padding:11px 14px;border-radius:12px;background:#1b1410;color:#fff;font:500 14px/1.4 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;box-shadow:0 8px 28px rgba(0,0,0,.3);border-left:5px solid #f97316;animation:ppIn .18s ease-out}' +
    '.pp-msg.ok{border-left-color:#22c55e}.pp-msg.err{border-left-color:#ef4444;background:#3a1212}.pp-msg.warn{border-left-color:#f59e0b}' +
    '.pp-msg span{flex:1}.pp-msg button{all:unset;cursor:pointer;color:#ffd7b8;font-weight:700;padding:0 4px;line-height:1.2}.pp-msg button:focus-visible{outline:2px solid #ffb27a;outline-offset:2px}' +
    '@keyframes ppIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}' +
    '#pp-offline{position:fixed;z-index:2147483200;top:0;left:0;right:0;padding:9px 14px;background:#b91c1c;color:#fff;text-align:center;font:600 14px/1.35 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}' +
    '#pp-offline[hidden]{display:none}' +
    '#pp-top{position:fixed;z-index:900;right:16px;bottom:78px;width:44px;height:44px;border-radius:50%;border:0;background:#1b1410;color:#fff;font-size:20px;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.3);opacity:0;pointer-events:none;transition:opacity .2s}' +
    '#pp-top.on{opacity:.92;pointer-events:auto}#pp-top:focus-visible{outline:3px solid #ffb27a;outline-offset:2px}' +
    '[data-tip]{cursor:help}button[data-tip],a[data-tip],select[data-tip],label[data-tip]{cursor:pointer}' +
    '.pp-cta{position:fixed;z-index:940;left:0;right:0;bottom:0;display:none;align-items:center;justify-content:center;min-height:56px;padding:8px 16px calc(8px + env(safe-area-inset-bottom));background:#1b1410;color:#fff;font:700 16px/1 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;text-decoration:none;box-shadow:0 -6px 24px rgba(0,0,0,.25);transform:translateY(110%);transition:transform .25s}' +
    '.pp-cta.on{transform:none}.pp-cta:focus-visible{outline:3px solid #ffb27a;outline-offset:-5px}.pp-cta span{color:#ffb454;margin-left:8px}' +
    '@media (max-width:720px){.pp-cta{display:flex}#pp-top{bottom:calc(78px + var(--pp-cta-h,0px))}}' +
    '@media (prefers-reduced-motion:reduce){#pp-tip,.pp-msg,#pp-top,.pp-cta{transition:none;animation:none}}';
  var st = doc.createElement('style'); st.textContent = css; doc.head.appendChild(st);

  // ---------- messages ----------
  var box;
  function msgBox() { if (!box) { box = doc.createElement('div'); box.className = 'pp-msgs'; doc.body.appendChild(box); } return box; }
  function say(text, kind, sticky) {
    var m = doc.createElement('div'); m.className = 'pp-msg ' + (kind || ''); m.setAttribute('role', kind === 'err' || kind === 'warn' ? 'alert' : 'status');
    var s = doc.createElement('span'); s.textContent = text; m.appendChild(s);
    var x = doc.createElement('button'); x.type = 'button'; x.setAttribute('aria-label', 'Dismiss message'); x.textContent = '✕'; m.appendChild(x);
    function gone() { if (m.parentNode) m.parentNode.removeChild(m); }
    x.addEventListener('click', gone); msgBox().appendChild(m);
    if (!sticky) setTimeout(gone, kind === 'err' ? 9000 : 4200);
    return { close: gone };
  }

  // ---------- tooltips ----------
  var tip = doc.createElement('div'); tip.id = 'pp-tip'; tip.setAttribute('aria-hidden', 'true'); doc.body.appendChild(tip);
  var cur = null;
  function place(el) {
    var r = el.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight, x = r.left + r.width / 2 - w / 2, y = r.bottom + 8;
    if (y + h > innerHeight - 6) y = r.top - h - 8;
    x = Math.max(8, Math.min(x, innerWidth - w - 8)); tip.style.left = x + 'px'; tip.style.top = Math.max(6, y) + 'px';
  }
  function showTip(el) { if (!el || !el.dataset.tip) return; cur = el; tip.textContent = el.dataset.tip; tip.setAttribute('role', 'tooltip'); tip.removeAttribute('aria-hidden'); tip.classList.add('on'); el.setAttribute('aria-describedby', 'pp-tip'); place(el); }
  function hideTip() { if (cur) cur.removeAttribute('aria-describedby'); cur = null; tip.classList.remove('on'); tip.removeAttribute('role'); tip.setAttribute('aria-hidden', 'true'); }
  function target(e) {
    var t = e.target && e.target.closest ? e.target.closest('[data-tip],.pp-sw[title]') : null;
    if (t && !t.dataset.tip && t.title) { t.dataset.tip = t.title; t.removeAttribute('title'); } // one tooltip, not two
    return t;
  }
  doc.addEventListener('mouseover', function (e) { if (e.pointerType === 'touch') return; var t = target(e); if (t && t !== cur) showTip(t); else if (!t) hideTip(); });
  doc.addEventListener('focusin', function (e) { var t = target(e); if (t) showTip(t); });
  doc.addEventListener('focusout', hideTip);
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') hideTip(); });
  function follow() { if (!cur) return; var r = cur.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) hideTip(); else place(cur); }
  addEventListener('scroll', follow, { passive: true }); addEventListener('resize', follow);
  // on a touch screen there is no hover: a long press (half a second) shows the tip
  var lp; doc.addEventListener('touchstart', function (e) { var t = target(e); if (!t) return; lp = setTimeout(function () { showTip(t); setTimeout(hideTip, 2600); }, 550); }, { passive: true });
  ['touchend', 'touchmove', 'touchcancel'].forEach(function (n) { doc.addEventListener(n, function () { clearTimeout(lp); }, { passive: true }); });

  // ---------- offline warning ----------
  var off = doc.createElement('div'); off.id = 'pp-offline'; off.setAttribute('role', 'alert'); off.hidden = true;
  off.textContent = 'You are offline. Some things may not load or send until you are back online.'; doc.body.appendChild(off);
  addEventListener('offline', function () { if (!(demo && framed)) off.hidden = false; });
  addEventListener('online', function () { var was = !off.hidden; off.hidden = true; if (was) say('Back online.', 'ok'); });
  if (navigator.onLine === false && !(demo && framed)) off.hidden = false;

  // ---------- saved settings blocked (private window, strict settings) ----------
  var blocked = false; try { var k = '__pp_t'; localStorage.setItem(k, '1'); localStorage.removeItem(k); } catch (e) { blocked = true; }
  if (blocked && !hub && !(demo && framed)) setTimeout(function () { say('Your browser is not saving settings, so your name and colour theme will not carry from page to page. Turn off private browsing to fix this.', 'warn'); }, 1200);

  // ---------- back to top ----------
  if (!hub && !demo) {
    var up = doc.createElement('button'); up.id = 'pp-top'; up.type = 'button'; up.setAttribute('aria-label', 'Back to the top'); up.dataset.tip = 'Back to the top'; up.textContent = '↑'; doc.body.appendChild(up);
    var tk = false; addEventListener('scroll', function () { if (tk) return; tk = true; requestAnimationFrame(function () { tk = false; up.classList.toggle('on', scrollY > innerHeight * 1.2); }); }, { passive: true });
    up.addEventListener('click', function () { scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); });
  }

  // copy text to the clipboard; falls back to a selectable box when the browser blocks the clipboard
  function copy(text, okMsg) {
    function done() { say(okMsg || 'Copied.', 'ok'); }
    function manual() {
      var t = doc.createElement('textarea'); t.value = text; t.setAttribute('readonly', ''); t.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      doc.body.appendChild(t); t.select(); t.setSelectionRange(0, text.length); var ok = false; try { ok = doc.execCommand('copy'); } catch (e) { /* blocked */ } doc.body.removeChild(t);
      if (ok) done(); else say('Could not copy automatically. Copy this link: ' + text, 'warn', true);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, manual); else manual();
  }
  // a "Request a quote" bar for phones, once the visitor has scrolled past the first screen
  if (!hub && !demo && !doc.getElementById('qform')) {
    var ctaWrap = doc.createElement('nav'); ctaWrap.setAttribute('aria-label', 'Quick link'); var cta = doc.createElement('a'); cta.className = 'pp-cta'; cta.href = 'quote.html'; cta.innerHTML = 'Request a quote<span aria-hidden="true">→</span>'; ctaWrap.appendChild(cta); doc.body.appendChild(ctaWrap);
    var ct = false, mq = matchMedia('(max-width:720px)');
    function ctaSync() { var show = mq.matches && scrollY > innerHeight * .9; cta.classList.toggle('on', show); doc.documentElement.style.setProperty('--pp-cta-h', show ? cta.offsetHeight + 'px' : '0px'); }
    addEventListener('scroll', function () { if (ct) return; ct = true; requestAnimationFrame(function () { ct = false; ctaSync(); }); }, { passive: true }); addEventListener('resize', ctaSync);
  }
  window.ppUI = { copy: copy, toast: function (t, k) { return say(t, k || 'ok'); }, alert: function (t, k) { return say(t, k || 'err', true); }, tip: showTip, hideTip: hideTip };
})();
