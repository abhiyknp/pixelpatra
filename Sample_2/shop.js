// Order and dealer forms for the sample: no server, they open a WhatsApp message with the details filled in.
(function () {
  var C = window.SHOP, $ = function (s) { return document.querySelector(s); };
  var inr = function (n) { return '₹' + n.toLocaleString('en-IN'); };
  var qty = {};
  var wa = function (text) {
    if (!C.whatsapp) { alert('Sample site: no WhatsApp number is set yet. The message would be:\n\n' + text); return; }
    window.open('https://wa.me/' + C.whatsapp + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
  };
  var packs = $('#packs');
  packs.innerHTML = C.packs.map(function (p) {
    return '<article class="pack"><div class="ph">' + (p.img ? '<img src="' + p.img + '" alt="" loading="lazy">' : '') + '</div><h3>' + p.name + '</h3><small>' + p.note + '</small><div class="price">' + inr(p.price) + '</div>' +
      '<div class="qty"><button type="button" data-id="' + p.id + '" data-d="-1" aria-label="One less ' + p.name + '">−</button><output id="q-' + p.id + '" aria-live="polite">0</output><button type="button" data-id="' + p.id + '" data-d="1" aria-label="One more ' + p.name + '">+</button></div></article>';
  }).join('');
  function sum() {
    var lines = [], total = 0;
    C.packs.forEach(function (p) { var n = qty[p.id] || 0; if (n) { lines.push(n + ' × ' + p.name); total += n * p.price; } });
    $('#ordersum').textContent = lines.length ? lines.join(', ') + ' · ' + inr(total) : 'Nothing added yet';
    $('#orderbtn').setAttribute('aria-disabled', lines.length ? 'false' : 'true'); $('#orderbtn').style.opacity = lines.length ? 1 : .55;
    return { lines: lines, total: total };
  }
  packs.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-id]'); if (!b) return;
    var id = b.dataset.id; qty[id] = Math.max(0, (qty[id] || 0) + (+b.dataset.d)); $('#q-' + id).textContent = qty[id]; sum();
  });
  $('#orderbtn').addEventListener('click', function (e) {
    e.preventDefault(); var s = sum(); if (!s.lines.length) { $('#ordersum').textContent = 'Add a pack first'; return; }
    wa('Hello ' + C.brand + ', I would like to order: ' + s.lines.join(', ') + '. Total ' + inr(s.total) + '.');
  });
  sum();
  $('#dealerForm').addEventListener('submit', function (e) {
    e.preventDefault(); var v = function (id) { return $(id).value.trim(); };
    if (!v('#d-name') || !v('#d-city')) { $('#d-err').textContent = 'Please add your name and city.'; return; }
    $('#d-err').textContent = '';
    wa('Dealer enquiry for ' + C.brand + '. Name: ' + v('#d-name') + '. Shop: ' + (v('#d-shop') || '-') + '. City: ' + v('#d-city') + '. Monthly need: ' + $('#d-qty').value + '. ' + v('#d-note'));
  });
  var cr = $('#credits'), esc = function (t) { return String(t || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  if (cr) cr.innerHTML = (window.CREDITS || []).map(function (c) { return '<li>' + (c.kind === 'video' ? 'Video' : 'Photo') + ': ' + (c.page ? '<a href="' + esc(c.page) + '" rel="noopener">' + esc(c.title) + '</a>' : esc(c.title)) + ', ' + esc(c.artist || 'unknown') + ', ' + (c.license_url ? '<a href="' + esc(c.license_url) + '" rel="noopener">' + esc(c.license) + '</a>' : esc(c.license)) + '</li>'; }).join('');
  var top = $('#top'); var onS = function () { top.classList.toggle('solid', scrollY > innerHeight * .6 && !document.body.classList.contains('infilm')); }; addEventListener('scroll', onS, { passive: true }); onS();
})();
