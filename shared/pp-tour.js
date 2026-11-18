// A short, skippable tour of the Pixelpatra home page: four steps, shown once. Re-open it from the footer ("Take a quick tour")
// or with ?tour=1 in the address. Nothing is sent anywhere; "seen" is remembered in this browser only.
(function () {
  'use strict';
  var KEY = 'pp-tour', reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var STEPS = [
    { sel: '#your-name', title: 'Type your business name', text: 'Click the name in the preview and type yours. Every template and every live demo will show it.' },
    { sel: '#hero-sw', title: 'Pick your colours', text: 'Choose one of six themes, or tap the rainbow circle to use your own brand colour. You can add your logo too.' },
    { sel: '#cards .card .demo, .card .demo', title: 'Open any template live', text: 'Every template opens as a working demo. Try the Owner view, the phone view and the cart.' },
    { sel: '.nav .btn', title: 'Like one? Ask for a quote', text: 'Tell us what you need and we reply with a clear price. Nothing starts until you say yes.' }
  ];
  var i = 0, on = false, ring, pop, prevFocus;
  function seen() { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; } }
  function remember() { try { localStorage.setItem(KEY, '1'); } catch (e) { /* storage blocked */ } }
  function target(n) { return document.querySelector(STEPS[n].sel); }
  function build() {
    ring = document.createElement('div'); ring.className = 'pp-tour-ring'; ring.setAttribute('aria-hidden', 'true');
    pop = document.createElement('div'); pop.className = 'pp-tour-pop'; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-modal', 'false'); pop.setAttribute('aria-labelledby', 'pp-tour-t'); pop.tabIndex = -1;
    document.body.appendChild(ring); document.body.appendChild(pop);
  }
  function place() {
    var el = target(i); if (!el) return;
    var r = el.getBoundingClientRect(), pad = 8;
    ring.style.cssText = 'left:' + (r.left - pad) + 'px;top:' + (r.top - pad) + 'px;width:' + (r.width + pad * 2) + 'px;height:' + (r.height + pad * 2) + 'px';
    var pw = Math.min(340, innerWidth - 24), x = Math.max(12, Math.min(r.left, innerWidth - pw - 12)), below = r.bottom + 16, ph = pop.offsetHeight || 190;
    var y = below + ph > innerHeight - 8 ? Math.max(12, r.top - ph - 16) : below;
    pop.style.cssText = 'width:' + pw + 'px;left:' + x + 'px;top:' + y + 'px';
  }
  function render() {
    var s = STEPS[i], last = i === STEPS.length - 1;
    pop.innerHTML = '<p class="pp-tour-n">Step ' + (i + 1) + ' of ' + STEPS.length + '</p><h2 id="pp-tour-t">' + s.title + '</h2><p>' + s.text + '</p>' +
      '<div class="pp-tour-dots" aria-hidden="true">' + STEPS.map(function (_, k) { return '<i' + (k === i ? ' class="on"' : '') + '></i>'; }).join('') + '</div>' +
      '<div class="pp-tour-row"><button type="button" class="pp-tour-skip">Skip tour</button><span>' + (i ? '<button type="button" class="pp-tour-back">Back</button>' : '') + '<button type="button" class="pp-tour-next">' + (last ? 'Got it' : 'Next') + '</button></span></div>';
    pop.querySelector('.pp-tour-skip').addEventListener('click', end);
    var b = pop.querySelector('.pp-tour-back'); if (b) b.addEventListener('click', function () { go(i - 1); });
    pop.querySelector('.pp-tour-next').addEventListener('click', function () { last ? end() : go(i + 1); });
    pop.querySelector('.pp-tour-next').focus({ preventScroll: true });
  }
  function go(n) {
    i = n; var el = target(i);
    if (!el) { if (i < STEPS.length - 1) { go(i + 1); } else end(); return; }
    var r = el.getBoundingClientRect();
    if (r.top < 70 || r.bottom > innerHeight - 70) el.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
    render(); setTimeout(place, reduce ? 0 : 380); place();
  }
  function end() { on = false; remember(); if (ring) ring.remove(); if (pop) pop.remove(); ring = pop = null; document.removeEventListener('keydown', key); removeEventListener('resize', place); removeEventListener('scroll', place); if (prevFocus && prevFocus.focus) prevFocus.focus({ preventScroll: true }); }
  function key(e) { if (e.key === 'Escape') end(); else if (e.key === 'ArrowRight') { if (i < STEPS.length - 1) go(i + 1); } else if (e.key === 'ArrowLeft') { if (i > 0) go(i - 1); } }
  function start() {
    if (on) return; on = true; prevFocus = document.activeElement; build(); document.addEventListener('keydown', key); addEventListener('resize', place); addEventListener('scroll', place, { passive: true }); go(0);
  }
  window.ppTour = { start: start };
  document.addEventListener('click', function (e) { var a = e.target.closest('[data-tour]'); if (a) { e.preventDefault(); start(); } });
  // first visit: start after the opening cloth has gone (the page announces it), or after a few seconds
  var auto = new URLSearchParams(location.search).get('tour') === '1' || !seen();
  if (auto) { var fired = false, run = function () { if (fired) return; fired = true; setTimeout(start, 900); }; addEventListener('pp-opened', run); if (window.__ppOpened) run(); setTimeout(run, 6500); }
})();
