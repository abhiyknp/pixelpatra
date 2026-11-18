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
  var estBox = $('#q-estimate'), estField = $('#q-est'), lastEst = '';
  function estimate() {
    var opt = $('#q-template').selectedOptions[0], pkg = $('#q-package').value, lines = [], base = null;
    var key = pkg === 'Template files' ? 'files' : pkg === 'Setup & launch' ? 'setup' : null;
    var picked = [].map.call(form.querySelectorAll('input[name="features"]:checked'), function (c) { return c.value; });
    form.classList.toggle('nopr', pkg === 'Custom build'); // a custom build has no fixed amounts, so the service prices are hidden
    if (pkg === 'Custom build') {
      var esc2 = function (x) { return x.replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
      estBox.innerHTML = '<h3>Custom build</h3><p>The price of a custom build depends on what you need. We do not set an amount in advance: tell us what you want, and we agree the scope and the price with you in writing before any work starts.</p>' +
        (picked.length ? '<p class="est-note">Services you would like included: ' + picked.map(esc2).join(', ') + '.</p>' : '');
      lastEst = 'Custom build: priced after we agree the scope'; if (estField) estField.value = lastEst; return;
    }
    var basic = +estBox.dataset.basic || 0;
    if (pkg === 'Custom build' && basic) { base = basic; lines.push([(opt && opt.value !== 'Not sure yet' ? opt.value + ' · ' : '') + 'Custom build, starting price (Basic website with Owner view)', basic]); }
    else if (opt && key && opt.dataset[key]) { base = +opt.dataset[key]; lines.push([opt.value + ' · ' + pkg + (key === 'setup' ? ' (Basic website with Owner view)' : ''), base]); }
    var add = 0; [].forEach.call(form.querySelectorAll('input[name="features"]:checked'), function (c) { var v = +c.dataset.price || 0; add += v; lines.push([c.value, v, true]); });
    var total = (base || 0) + add, html;
    if (!lines.length) html = '<p class="est-note">Choose a template and a package, then tick any extra services. Your estimate appears here.</p>';
    else {
      html = '<h3>Your estimate</h3><ul>' + lines.map(function (l) { return '<li><span>' + (l[2] ? '+ ' : '') + l[0].replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</span><b>' + inr(l[1]) + '</b></li>'; }).join('') + '</ul>';
      if (pkg === 'Custom build' && base !== null) html += '<p class="est-note">Basic is the least a built site costs. Anything beyond these services is priced from your scope in the quote.</p>';
      if (base === null) html += '<p class="est-note">' + 'Pick a template to see its base price.' + '</p>';
      html += '<p class="est-total"><span>' + (base === null ? 'Extra services' : 'Estimated total') + '</span><b>' + inr(total) + '</b></p><p class="est-note">This is an estimate. We confirm the exact price, with any taxes, in your quote.</p>';
    }
    estBox.innerHTML = html; lastEst = lines.length ? (base === null ? 'Extra services ' : 'Estimated total ') + inr(total) : ''; if (estField) estField.value = lastEst;
  }
  ['#q-template', '#q-package'].forEach(function (id) { $(id).addEventListener('change', estimate); }); form.addEventListener('change', function (e) { if (e.target.name === 'features') estimate(); });
  estimate();

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
      'Template: ' + get('template'), 'Package: ' + get('package'), 'Extra services: ' + (f.getAll('features').join(', ') || '-'), 'Estimate: ' + (lastEst || '-'), 'Budget: ' + get('budget'), 'Timeline: ' + get('timeline'), 'Content ready: ' + get('content'),
      'Current website: ' + (get('website') || '-'), 'Best time to reach: ' + (get('best_time') || '-'), '', 'What they want:', get('goal'));
    return lines.join('\n');
  }
  function show(html) { form.hidden = true; done.hidden = false; done.innerHTML = html; done.focus(); done.scrollIntoView({ block: 'start', behavior: 'smooth' }); }
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  function fallback(text) {
    var subj = 'Quote request: ' + ($('#q-template').value), btns = '';
    if (C.email) btns += '<a class="btn btn-solid" href="mailto:' + encodeURIComponent(C.email).replace('%40', '@') + '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(text) + '">Send by email</a> ';
    if (C.whatsapp) btns += '<a class="btn btn-wa" target="_blank" rel="noopener" href="https://wa.me/' + C.whatsapp + '?text=' + encodeURIComponent(text) + '">Send on WhatsApp</a> ';
    btns += '<button type="button" class="btn" id="q-copy">Copy my request</button>';
    show('<h2>One last step</h2><p>' + (C.email || C.whatsapp ? 'Choose how to send your request. We reply as soon as we can.' : 'Your request is ready. Copy it and send it to us. (This site has not been connected to an inbox yet.)') + '</p><pre>' + esc(text) + '</pre><p>' + btns + '</p><p><a href="quote.html">Edit and start again</a></p>');
    var cp = $('#q-copy'); if (cp) cp.addEventListener('click', function () { (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () { cp.textContent = 'Copied ✓'; }, function () { var r = document.createRange(); r.selectNodeContents($('#qdone pre')); var s = getSelection(); s.removeAllRanges(); s.addRange(r); cp.textContent = 'Press Ctrl+C to copy'; }); });
  }
  function thanks() { var nm = $('#q-name').value.trim().split(/\s+/)[0]; show('<h2>Thank you, ' + esc(nm) + '.</h2><p>We have your request and will reply with a clear quote' + ($('#q-email').value ? ' at ' + esc($('#q-email').value.trim()) : '') + '. Nothing starts until you say yes.</p><p><a class="btn" href="index.html#templates">Back to the templates</a></p>'); }
  var netlify = C.netlifyForms === true || (C.netlifyForms !== false && /\.netlify\.app$/.test(location.hostname));
  form.addEventListener('submit', function (e) {
    e.preventDefault(); if (!validate()) return;
    var text = summary(), btn = $('#q-send'); btn.disabled = true; btn.textContent = 'Sending…';
    if (!netlify) { fallback(text); return; }
    if (navigator.onLine === false && window.ppUI) ppUI.alert('You are offline, so we cannot send this automatically. Use the options on the next screen, so your request is not lost.', 'warn');
    var body = new URLSearchParams(new FormData(form)).toString();
    fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body }).then(function (r) { if (r.ok) thanks(); else throw new Error('post'); }).catch(function () { btn.disabled = false; btn.textContent = 'Send my request'; if (window.ppUI) ppUI.alert('We could not send your request automatically. Please use one of the options below, so nothing is lost.', 'warn'); fallback(text); });
  });
  form.addEventListener('input', function (e) { var id = e.target.id; if (e.target.getAttribute('aria-invalid') === 'true') { e.target.setAttribute('aria-invalid', 'false'); var m = { 'q-name': 'name', 'q-email': 'email', 'q-phone': 'phone', 'q-goal': 'goal', 'q-consent': 'consent' }[id]; if (m) E[m].textContent = ''; if (!form.querySelector('[aria-invalid="true"]')) { var sm = $('#qsummary'); sm.hidden = true; sm.innerHTML = ''; } } });
})();
