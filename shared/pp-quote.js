// The request-a-quote form. Delivery order: Netlify Forms (automatic on Netlify), then email, then WhatsApp, then a copy-to-clipboard
// panel, so a request is never lost. Settings live in shared/pp-config.js.
(function () {
  'use strict';
  var C = window.PP_CONFIG || {}, $ = function (s) { return document.querySelector(s); };
  var form = $('#qform'), done = $('#qdone'); if (!form) return;
  var q = new URLSearchParams(location.search);
  function setSel(sel, v) { if (!v) return; var o = [].filter.call(sel.options, function (x) { return x.value === v; })[0]; if (o) sel.value = v; }
  var t = q.get('template');
  setSel($('#q-template'), t); var p = q.get('package'); setSel($('#q-package'), p === 'setup' ? 'Setup & launch' : p === 'custom' ? 'Custom build' : p === 'files' ? 'Template files' : p);
  try { var n = localStorage.getItem('pp-name'); if (n && !$('#q-org').value) $('#q-org').value = n; } catch (e) { /* storage blocked */ }

  // ---------- price estimate: the template and package price, plus each extra service that is ticked ----------
  var inr = function (n) { return '₹' + Number(n).toLocaleString('en-IN'); };
  var estBox = $('#q-estimate'), estField = $('#q-est'), lastEst = '', cur = null;
  function estimate() {
    var opt = $('#q-template').selectedOptions[0], pkg = $('#q-package').value, lines = [], base = null;
    var key = pkg === 'Template files' ? 'files' : pkg === 'Setup & launch' ? 'setup' : null;
    var picked = [].map.call(form.querySelectorAll('input[name="features"]:checked'), function (c) { return c.value; });
    form.classList.toggle('nopr', pkg === 'Custom build'); // a custom build has no fixed amounts, so the service prices are hidden
    if (pkg === 'Custom build') {
      var esc2 = function (x) { return x.replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
      estBox.innerHTML = '<h3>Custom build</h3><p>The price of a custom build depends on what you need. We do not set an amount in advance: tell us what you want, and we agree the scope and the price with you in writing before any work starts.</p>' +
        (picked.length ? '<p class="est-note">Services you would like included: ' + picked.map(esc2).join(', ') + '.</p>' : '');
      cur = { lines: [], base: null, total: 0, pkg: pkg, template: opt ? opt.value : '', picked: picked, custom: true }; var act0 = $('#q-est-actions'); if (act0) act0.hidden = false;
      lastEst = 'Custom build: priced after we agree the scope'; if (estField) estField.value = lastEst; return;
    }
    // the price of the template includes its website and Owner view; Setup & launch adds a fee for doing it all for the customer
    var files = opt && opt.dataset.files ? +opt.dataset.files : 0, fee = opt && opt.dataset.fee ? +opt.dataset.fee : 0;
    if (files && pkg === 'Template files') { base = files; lines.push([opt.value + ' · template files', files]); }
    else if (files && pkg === 'Setup & launch') { base = files + fee; lines.push([opt.value + ' · template (website with Owner view)', files]); lines.push(['Setup & launch: we add your content and put it live', fee]); }
    var add = 0; [].forEach.call(form.querySelectorAll('input[name="features"]:checked'), function (c) { var v = +c.dataset.price || 0; add += v; lines.push([c.value, v, true]); });
    var total = (base || 0) + add, html;
    if (!lines.length) html = '<p class="est-note">Choose a template and a package, then tick any extra services. Your estimate appears here.</p>';
    else {
      html = '<h3>Your estimate</h3><ul>' + lines.map(function (l) { return '<li><span>' + (l[2] ? '+ ' : '') + l[0].replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</span><b>' + inr(l[1]) + '</b></li>'; }).join('') + '</ul>';
      if (base === null) html += '<p class="est-note">' + 'Pick a template to see its base price.' + '</p>';
      html += '<p class="est-total"><span>' + (base === null ? 'Extra services' : 'Estimated total') + '</span><b>' + inr(total) + '</b></p><p class="est-note">This is an estimate. We confirm the exact price, with any taxes, in your quote.</p>';
    }
    cur = { lines: lines, base: base, total: total, pkg: pkg, template: opt ? opt.value : '', picked: picked };
    var act = $('#q-est-actions'); if (act) act.hidden = !lines.length && pkg !== 'Custom build';
    estBox.innerHTML = html; lastEst = lines.length ? (base === null ? 'Extra services ' : 'Estimated total ') + inr(total) : ''; if (estField) estField.value = lastEst;
  }
  // ---------- the estimate as a PDF (the browser's Save as PDF) or an email ----------
  function ref() { var d = new Date(), z = function (n) { return ('0' + n).slice(-2); }; return 'PP-' + d.getFullYear() + z(d.getMonth() + 1) + z(d.getDate()) + '-' + Math.random().toString(36).slice(2, 6).toUpperCase(); }
  function escH(x) { return String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function sheetHtml(r) {
    var who = [$('#q-name').value.trim(), $('#q-org').value.trim(), $('#q-email').value.trim(), $('#q-phone').value.trim()].filter(Boolean).map(escH).join(' · ') || 'Not filled in yet';
    var rows = cur.custom ? '<tr><td>Custom build: the price depends on what you need, so no amount is set in advance. We agree the scope and the price with you in writing before any work starts.</td><td></td></tr>' + (cur.picked.length ? '<tr><td>Services you would like included: ' + cur.picked.map(escH).join(', ') + '</td><td></td></tr>' : '')
      : cur.lines.map(function (l) { return '<tr><td>' + (l[2] ? '+ ' : '') + escH(l[0]) + '</td><td class="amt">' + inr(l[1]) + '</td></tr>'; }).join('');
    var total = cur.custom ? '' : '<tr class="tot"><td>' + (cur.base === null ? 'Extra services' : 'Estimated total') + '</td><td class="amt">' + inr(cur.total) + '</td></tr>';
    var contact = [C.email, C.whatsapp ? 'WhatsApp +' + C.whatsapp : ''].filter(Boolean).map(escH).join(' · ');
    return '<div class="ps-head"><b>Pixelpatra</b><span>Estimate</span></div><p class="ps-meta">Reference ' + r + ' · ' + new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) + '</p>' +
      '<p><b>Prepared for:</b> ' + who + '</p><p><b>Template:</b> ' + escH(cur.template || 'Not chosen yet') + ' · <b>Package:</b> ' + escH(cur.pkg) + '</p><table>' + rows + total + '</table>' +
      '<p class="ps-note">This is an estimate, not a quote. We confirm the exact price, with any taxes that apply, in your quote. Nothing starts until you say yes.</p>' + (contact ? '<p class="ps-note">Contact: ' + contact + '</p>' : '') + '<p class="ps-note">Request a quote: ' + escH(location.origin + location.pathname.replace(/[^/]*$/, '') + 'quote.html') + '</p>';
  }
  function printEstimate() {
    if (!cur) estimate(); if (!cur) return;
    var sh = $('#print-sheet'); if (!sh) { sh = document.createElement('div'); sh.id = 'print-sheet'; document.body.appendChild(sh); }
    sh.innerHTML = sheetHtml(ref()); document.body.classList.add('print-est');
    var done = function () { document.body.classList.remove('print-est'); removeEventListener('afterprint', done); }; addEventListener('afterprint', done); setTimeout(function () { window.print(); }, 60);
  }
  function mailEstimate() {
    if (!cur) estimate(); if (!cur) return;
    var em = $('#q-email').value.trim(), to = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em) ? em : '';
    var lines = cur.custom ? ['Custom build: the price depends on what you need. We agree the scope and the price in writing before any work starts.'].concat(cur.picked.length ? ['Services you would like included: ' + cur.picked.join(', ')] : [])
      : cur.lines.map(function (l) { return (l[2] ? '+ ' : '') + l[0] + ': ' + inr(l[1]); }).concat(['', (cur.base === null ? 'Extra services: ' : 'Estimated total: ') + inr(cur.total)]);
    var body = ['Pixelpatra estimate', 'Template: ' + (cur.template || 'not chosen yet'), 'Package: ' + cur.pkg, ''].concat(lines, ['', 'This is an estimate, not a quote. We confirm the exact price in your quote.', 'Request a quote: ' + location.origin + location.pathname.replace(/[^/]*$/, '') + 'quote.html']).join('\n');
    var url = 'mailto:' + to + '?subject=' + encodeURIComponent('Your Pixelpatra estimate') + '&body=' + encodeURIComponent(body);
    (window.__ppMailto || function (u) { location.href = u; })(url);
    if (!to && window.ppUI) ppUI.toast('Your email app opened. Add your own address and send it to yourself.', 'ok');
  }
  var bp = $('#q-est-pdf'), bm = $('#q-est-mail'); if (bp) bp.addEventListener('click', printEstimate); if (bm) bm.addEventListener('click', mailEstimate);

  ['#q-template', '#q-package'].forEach(function (id) { $(id).addEventListener('change', estimate); }); form.addEventListener('change', function (e) { if (e.target.name === 'features') estimate(); });
  estimate();

  // an Explorer reward, if the visitor unlocked it by trying the demos
  document.addEventListener('DOMContentLoaded', function () {
    var ex = window.ppExplore, note = $('#q-reward'), fld = $('#q-explorer'); if (!ex || !ex.unlocked()) return;
    fld.value = 'Explorer reward unlocked: ' + ex.reward; note.hidden = false; note.textContent = 'Explorer reward unlocked: ' + ex.reward + '. We will apply it to your request.';
  });

  var E = { name: $('#e-name'), email: $('#e-email'), phone: $('#e-phone'), goal: $('#e-goal'), consent: $('#e-consent') };
  function mark(inp, msg, el) { el.textContent = msg || ''; if (inp) inp.setAttribute('aria-invalid', msg ? 'true' : 'false'); return !msg; }
  function validate() {
    var ok = true, first = null, list = [], v = function (id) { return $(id).value.trim(); };
    function bad(inp, msg, el) { if (!mark(inp, msg, el)) { ok = false; if (!first) first = inp; list.push({ id: inp.id, msg: msg }); } }
    bad($('#q-name'), v('#q-name').length < 2 ? 'Please tell us your name.' : '', E.name);
    var em = v('#q-email'), ph = v('#q-phone').replace(/[\s\-()]/g, '');
    var emBad = em && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em), phBad = ph && !/^\+?\d{8,15}$/.test(ph);
    bad($('#q-email'), emBad ? 'That email does not look right.' : (!em && !ph ? 'Add an email or a phone number.' : ''), E.email);
    bad($('#q-phone'), phBad ? 'Use 8 to 15 digits, with the country code if outside India.' : '', E.phone);
    bad($('#q-goal'), v('#q-goal').length < 10 ? 'Tell us a little about what you want (at least a sentence).' : '', E.goal);
    bad($('#q-consent'), $('#q-consent').checked ? '' : 'Please tick to agree.', E.consent);
    var sum = $('#qsummary');
    if (list.length) {
      sum.innerHTML = '<b>Please fix ' + (list.length === 1 ? 'this' : 'these ' + list.length + ' things') + ' before sending:</b><ul>' + list.map(function (x) { return '<li><a href="#' + x.id + '">' + x.msg + '</a></li>'; }).join('') + '</ul>';
      sum.hidden = false; sum.focus(); sum.scrollIntoView({ block: 'center', behavior: 'smooth' });
      [].forEach.call(sum.querySelectorAll('a'), function (a) { a.addEventListener('click', function (e) { e.preventDefault(); var t = $(a.getAttribute('href')); if (t) { t.focus(); t.scrollIntoView({ block: 'center', behavior: 'smooth' }); } }); });
    } else { sum.hidden = true; sum.innerHTML = ''; }
    return ok;
  }
  function summary() {
    var f = new FormData(form), lines = [], get = function (k) { return (f.get(k) || '').toString().trim(); };
    lines.push('Quote request for Pixelpatra', '', 'Name: ' + get('name'), 'Business: ' + (get('organisation') || '-'), 'Email: ' + (get('email') || '-'), 'Phone: ' + (get('phone') || '-'), '',
      'Order reference: ' + (orderRef || '-'), 'Template: ' + get('template'), 'Package: ' + get('package'), 'Extra services: ' + (f.getAll('features').join(', ') || '-'), 'Estimate: ' + (lastEst || '-'), (get('explorer') ? get('explorer') : 'Explorer reward: no'), 'Budget: ' + get('budget'), 'Timeline: ' + get('timeline'), 'Content ready: ' + get('content'),
      'Current website: ' + (get('website') || '-'), 'Best time to reach: ' + (get('best_time') || '-'), '', 'What they want:', get('goal'));
    return lines.join('\n');
  }
  // ---------- payment by UPI: the amount comes from the estimate; the customer then tells us the UPI reference so we can match it ----------
  var orderRef = '';
  function payNeeded() { return cur && !cur.custom && cur.total > 0 && C.upi && C.upi.id; }
  function upiLink() { return 'upi://pay?pa=' + encodeURIComponent(C.upi.id).replace('%40', '@') + '&pn=' + encodeURIComponent(C.upi.name || 'Pixelpatra') + '&am=' + Number(cur.total).toFixed(2) + '&cu=INR&tn=' + encodeURIComponent(orderRef); }
  function payHtml() {
    if (cur && cur.custom) return '<div class="paybox"><h3>Payment</h3><p>For a custom build you pay after we agree the scope and the price with you. Nothing is due now.</p></div>';
    if (!payNeeded()) return '';
    return '<div class="paybox" id="paybox"><h3>Pay ' + inr(cur.total) + ' by UPI</h3><p>Scan the code with any UPI app, or tap the button on your phone. The amount and your order reference are filled in for you.</p>' +
      '<div class="pay-grid"><div class="pay-qr" id="pay-qr" role="img" aria-label="UPI QR code for ' + inr(cur.total) + '"></div><div class="pay-info"><p><b>Amount</b> ' + inr(cur.total) + '</p><p><b>UPI ID</b> <code>' + esc(C.upi.id) + '</code></p><p><b>Order reference</b> <code>' + esc(orderRef) + '</code></p>' +
      '<p class="pay-btns"><a class="btn btn-solid" id="pay-open" href="' + esc(upiLink()) + '">Pay with a UPI app</a> <button type="button" class="btn" id="pay-copy-id">Copy UPI ID</button></p></div></div>' +
      '<form id="pay-form" novalidate><label for="pay-utr">After you pay, enter the UPI reference number</label><input id="pay-utr" autocomplete="off" autocapitalize="characters" placeholder="From your UPI app, for example 412345678901"><span class="err" id="e-utr" role="alert"></span><button class="btn btn-solid" type="submit" id="pay-go">I have paid</button></form>' +
      '<p class="est-note">We match your payment to your order and reply within one working day (Monday to Saturday).</p></div>';
  }
  function wirePay() {
    var box = $('#paybox'); if (!box) return;
    try { var qr = qrcode(0, 'M'); qr.addData(upiLink()); qr.make(); $('#pay-qr').innerHTML = qr.createSvgTag({ cellSize: 5, margin: 2, scalable: true }); } catch (e) { $('#pay-qr').textContent = 'Use the button or the UPI ID.'; }
    $('#pay-copy-id').addEventListener('click', function () { if (window.ppUI) ppUI.copy(C.upi.id, 'UPI ID copied.'); });
    $('#pay-form').addEventListener('submit', function (e) {
      e.preventDefault(); var utr = $('#pay-utr').value.trim(), err = $('#e-utr');
      if (!/^[A-Za-z0-9]{8,30}$/.test(utr)) { err.textContent = 'Please enter the reference number from your UPI app (letters and numbers, 8 to 30 characters).'; $('#pay-utr').setAttribute('aria-invalid', 'true'); $('#pay-utr').focus(); return; }
      err.textContent = ''; $('#pay-utr').setAttribute('aria-invalid', 'false');
      var data = { 'form-name': 'payment', order_ref: orderRef, name: $('#q-name').value.trim(), email: $('#q-email').value.trim(), phone: $('#q-phone').value.trim(), amount: String(cur.total), utr: utr, template: cur.template, package: cur.pkg };
      var line = 'Payment reference for ' + orderRef + ': ' + utr + ' (' + inr(cur.total) + ' to ' + C.upi.id + ')';
      var ok = function () { $('#pay-form').outerHTML = '<p class="reward-note">Thank you. We have your payment reference (' + esc(utr) + '). We will confirm your payment within one working day.</p>'; };
      var manual = function () { $('#pay-form').outerHTML = '<p>This site could not send the reference automatically. Please copy this and send it to us:</p><pre>' + esc(line) + '</pre><p><button type="button" class="btn" id="pay-copy-ref">Copy</button></p>'; $('#pay-copy-ref').addEventListener('click', function () { if (window.ppUI) ppUI.copy(line, 'Copied.'); }); };
      if (!netlify) { manual(); return; }
      var b = $('#pay-go'); b.disabled = true; b.textContent = 'Sending…';
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(data).toString() }).then(function (r) { if (r.ok) ok(); else throw new Error('post'); }).catch(function () { manual(); });
    });
  }
  function show(html) { form.hidden = true; done.hidden = false; done.innerHTML = html; done.focus(); done.scrollIntoView({ block: 'start', behavior: 'smooth' }); }
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  function fallback(text) {
    var subj = 'Quote request: ' + ($('#q-template').value), btns = '';
    if (C.email) btns += '<a class="btn btn-solid" href="mailto:' + encodeURIComponent(C.email).replace('%40', '@') + '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(text) + '">Send by email</a> ';
    if (C.whatsapp) btns += '<a class="btn btn-wa" target="_blank" rel="noopener" href="https://wa.me/' + C.whatsapp + '?text=' + encodeURIComponent(text) + '">Send on WhatsApp</a> ';
    btns += '<button type="button" class="btn" id="q-copy">Copy my request</button>';
    show('<h2>One last step</h2><p>' + (C.email || C.whatsapp ? 'Choose how to send your request. We reply as soon as we can.' : 'Your request is ready. Copy it and send it to us. (This site has not been connected to an inbox yet.)') + '</p><pre>' + esc(text) + '</pre><p>' + btns + '</p><p><a href="quote.html">Edit and start again</a></p>' + payHtml()); wirePay();
    var cp = $('#q-copy'); if (cp) cp.addEventListener('click', function () { (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () { cp.textContent = 'Copied ✓'; }, function () { var r = document.createRange(); r.selectNodeContents($('#qdone pre')); var s = getSelection(); s.removeAllRanges(); s.addRange(r); cp.textContent = 'Press Ctrl+C to copy'; }); });
  }
  function thanks(text) {
    var nm = $('#q-name').value.trim().split(/\s+/)[0];
    show('<h2>Thank you, ' + esc(nm) + '.</h2><p>We have your request and will reply with a clear quote' + ($('#q-email').value ? ' at ' + esc($('#q-email').value.trim()) : '') + ' ' + 'within one working day (Monday to Saturday). Nothing starts until you say yes.</p>' +
      '<h3>What you asked for</h3><pre>' + esc(text) + '</pre><p><button type="button" class="btn" id="q-copy">Copy this</button> <button type="button" class="btn" id="q-print">Save estimate as PDF</button> <a class="btn" href="index.html#templates">Back to the templates</a></p>' + payHtml());
    wirePay(); var cp = $('#q-copy'); if (cp) cp.addEventListener('click', function () { if (window.ppUI) ppUI.copy(text, 'Copied.'); });
    var pr = $('#q-print'); if (pr) pr.addEventListener('click', printEstimate);
  }
  var netlify = C.netlifyForms === true || (C.netlifyForms !== false && /\.netlify\.app$/.test(location.hostname));
  form.addEventListener('submit', function (e) {
    e.preventDefault(); if (!validate()) return;
    orderRef = ref(); if ($('#q-ref')) $('#q-ref').value = orderRef; if (!cur) estimate();
    var text = summary(), btn = $('#q-send'); btn.disabled = true; btn.textContent = 'Sending…';
    if (!netlify) { fallback(text); return; }
    if (navigator.onLine === false && window.ppUI) ppUI.alert('You are offline, so we cannot send this automatically. Use the options on the next screen, so your request is not lost.', 'warn');
    var body = new URLSearchParams(new FormData(form)).toString();
    fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body }).then(function (r) { if (r.ok) thanks(text); else throw new Error('post'); }).catch(function () { btn.disabled = false; btn.textContent = 'Send my request'; if (window.ppUI) ppUI.alert('We could not send your request automatically. Please use one of the options below, so nothing is lost.', 'warn'); fallback(text); });
  });
  form.addEventListener('input', function (e) { var id = e.target.id; if (e.target.getAttribute('aria-invalid') === 'true') { e.target.setAttribute('aria-invalid', 'false'); var m = { 'q-name': 'name', 'q-email': 'email', 'q-phone': 'phone', 'q-goal': 'goal', 'q-consent': 'consent' }[id]; if (m) E[m].textContent = ''; if (!form.querySelector('[aria-invalid="true"]')) { var sm = $('#qsummary'); sm.hidden = true; sm.innerHTML = ''; } } });
})();
