// Campus Desk: a records dashboard. Add, edit, delete, search, sort, filter, page and export, all kept in this browser.
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var KEY = 'pp-records-v1', PER = 8;
  var S = window.SAMPLE, data;
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function load() { try { var r = JSON.parse(localStorage.getItem(KEY)); if (r && r.students && r.staff) return r; } catch (e) { /* none saved */ } return { students: clone(S.students), staff: clone(S.staff) }; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* storage blocked */ } }
  data = load();

  var SCHEMA = {
    students: { title: 'Students', one: 'student', filter: { k: 'course', l: 'All courses', opts: S.courses }, cols: [['name', 'Student'], ['course', 'Course'], ['year', 'Year'], ['score', 'Average'], ['status', 'Status'], ['joined', 'Joined']],
      fields: [{ k: 'name', l: 'Full name', t: 'text', req: 1 }, { k: 'email', l: 'Email', t: 'email', req: 1 }, { k: 'phone', l: 'Phone', t: 'tel' }, { k: 'course', l: 'Course', t: 'select', opts: S.courses }, { k: 'year', l: 'Year', t: 'select', opts: ['1', '2', '3', '4'] }, { k: 'score', l: 'Average score (0 to 100)', t: 'number', min: 0, max: 100 }, { k: 'status', l: 'Status', t: 'select', opts: ['Active', 'On leave', 'Graduated'] }, { k: 'joined', l: 'Joined on', t: 'date' }] },
    staff: { title: 'Staff', one: 'staff member', filter: { k: 'department', l: 'All departments', opts: S.depts }, cols: [['name', 'Name'], ['department', 'Department'], ['role', 'Role'], ['city', 'City'], ['status', 'Status'], ['joined', 'Joined']],
      fields: [{ k: 'name', l: 'Full name', t: 'text', req: 1 }, { k: 'email', l: 'Email', t: 'email', req: 1 }, { k: 'phone', l: 'Phone', t: 'tel' }, { k: 'department', l: 'Department', t: 'select', opts: S.depts }, { k: 'role', l: 'Role', t: 'text', req: 1 }, { k: 'city', l: 'City', t: 'text' }, { k: 'status', l: 'Status', t: 'select', opts: ['Active', 'On leave'] }, { k: 'joined', l: 'Joined on', t: 'date' }] }
  };
  var st = { view: 'dash', q: '', sort: { k: 'name', d: 1 }, page: 1, f: '', status: '' };
  var COLORS = ['#2f6df6', '#12a594', '#c98512', '#a24ad6', '#d6457a', '#3a8f3a'];
  var color = function (s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return COLORS[h % COLORS.length]; };
  var initials = function (n) { return n.split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase(); };
  var fmtDate = function (d) { if (!d) return '–'; var x = new Date(d + 'T00:00:00'); return isNaN(x) ? d : x.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); };
  var toastT; function say(m) { var t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('show'); }, 2600); }

  function counts() { $('#c-students').textContent = data.students.length; $('#c-staff').textContent = data.staff.length; }
  function dash() {
    var s = data.students, active = s.filter(function (x) { return x.status === 'Active'; }).length, avg = s.length ? Math.round(s.reduce(function (a, x) { return a + (+x.score || 0); }, 0) / s.length) : 0;
    var cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 30); var fresh = s.concat(data.staff).filter(function (x) { return new Date(x.joined) >= cutoff; });
    var byCourse = S.courses.map(function (c) { return [c, s.filter(function (x) { return x.course === c; }).length]; }), max = Math.max.apply(null, byCourse.map(function (x) { return x[1]; }).concat(1));
    var stat = ['Active', 'On leave', 'Graduated'].map(function (k, i) { return [k, s.filter(function (x) { return x.status === k; }).length, ['var(--ok)', 'var(--warn)', 'var(--accent)'][i]]; }), tot = s.length || 1, off = 0;
    var arcs = stat.map(function (x) { var len = x[1] / tot * 100, a = '<circle r="15.9" cx="21" cy="21" fill="none" stroke="' + x[2] + '" stroke-width="6" stroke-dasharray="' + len + ' ' + (100 - len) + '" stroke-dashoffset="' + (-off) + '"/>'; off += len; return a; }).join('');
    var recent = s.concat(data.staff).sort(function (a, b) { return a.joined < b.joined ? 1 : -1; }).slice(0, 5);
    return '<div><h1>Dashboard</h1><p class="sub">A quick look at your records. All names and numbers are sample data.</p></div>' +
      '<div class="kpis"><div class="card kpi"><span>Students</span><b>' + s.length + '</b><small>' + active + ' active</small></div><div class="card kpi"><span>Staff</span><b>' + data.staff.length + '</b><small>' + data.staff.filter(function (x) { return x.status === 'Active'; }).length + ' active</small></div><div class="card kpi"><span>Average score</span><b>' + avg + '%</b><small>across all students</small></div><div class="card kpi"><span>New in 30 days</span><b>' + fresh.length + '</b><small>students and staff</small></div></div>' +
      '<div class="grid2"><div class="card"><h2>Students by course</h2><div class="bars">' + byCourse.map(function (c) { return '<div class="bar"><span>' + esc(c[0]) + '</span><span class="track"><i style="width:' + (c[1] / max * 100) + '%"></i></span><b>' + c[1] + '</b></div>'; }).join('') + '</div></div>' +
      '<div class="card"><h2>Student status</h2><div class="donut"><svg viewBox="0 0 42 42" role="img" aria-label="Student status split">' + arcs + '</svg><div class="legend">' + stat.map(function (x) { return '<span style="--c:' + x[2] + '">' + x[0] + ' · ' + x[1] + '</span>'; }).join('') + '</div></div></div></div>' +
      '<div class="card"><h2>Recently added</h2><ul class="recent">' + recent.map(function (x) { return '<li><span class="av" style="--c:' + color(x.name) + '">' + initials(x.name) + '</span><div><b>' + esc(x.name) + '</b><small>' + esc(x.course || x.department) + ' · joined ' + fmtDate(x.joined) + '</small></div></li>'; }).join('') + '</ul></div>';
  }
  function rows(type) {
    var sc = SCHEMA[type], q = st.q.trim().toLowerCase();
    var r = data[type].filter(function (x) { return (!st.f || x[sc.filter.k] === st.f) && (!st.status || x.status === st.status) && (!q || Object.keys(x).some(function (k) { return k !== 'id' && String(x[k]).toLowerCase().indexOf(q) >= 0; })); });
    var k = st.sort.k, d = st.sort.d; r.sort(function (a, b) { var x = a[k], y = b[k]; if (k === 'year' || k === 'score') { x = +x; y = +y; } else { x = String(x).toLowerCase(); y = String(y).toLowerCase(); } return x < y ? -d : x > y ? d : 0; });
    return r;
  }
  function table(type) {
    var sc = SCHEMA[type], all = rows(type), pages = Math.max(1, Math.ceil(all.length / PER)); if (st.page > pages) st.page = pages;
    var list = all.slice((st.page - 1) * PER, st.page * PER);
    var head = '<h1>' + sc.title + '</h1><p class="sub">' + data[type].length + ' records. Search, sort, edit or add a ' + sc.one + '.</p>';
    var tools = '<div class="tools"><select id="f-main" aria-label="Filter"><option value="">' + sc.filter.l + '</option>' + sc.filter.opts.map(function (o) { return '<option' + (st.f === o ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') + '</select><select id="f-status" aria-label="Filter by status"><option value="">All statuses</option>' + sc.fields.filter(function (f) { return f.k === 'status'; })[0].opts.map(function (o) { return '<option' + (st.status === o ? ' selected' : '') + '>' + o + '</option>'; }).join('') + '</select><span class="sp"></span><button class="btn" id="csv">Export CSV</button></div>';
    var th = sc.cols.map(function (c) { var on = st.sort.k === c[0]; return '<th scope="col"' + (on ? ' aria-sort="' + (st.sort.d > 0 ? 'ascending' : 'descending') + '"' : '') + '><button type="button" data-sort="' + c[0] + '">' + c[1] + '</button></th>'; }).join('') + '<th scope="col"><span class="sr">Actions</span></th>';
    var body = list.map(function (x) {
      var cells = sc.cols.map(function (c, i) { var v = x[c[0]], out;
        if (i === 0) out = '<td class="nm"><div class="who"><span class="av" style="--c:' + color(x.name) + '">' + initials(x.name) + '</span><div><b>' + esc(x.name) + '</b><small>' + esc(x.email) + '</small></div></div></td>';
        else { var inner = c[0] === 'status' ? '<span class="pill st-' + esc(String(v).replace(/ /g, '-')) + '">' + esc(v) + '</span>' : c[0] === 'joined' ? fmtDate(v) : c[0] === 'score' ? esc(v) + '%' : esc(v); out = '<td data-l="' + c[1] + '">' + inner + '</td>'; }
        return out; }).join('');
      return '<tr>' + cells + '<td class="ac"><div class="act"><button class="ib" data-edit="' + x.id + '" aria-label="Edit ' + esc(x.name) + '"><svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25zM20.7 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg></button><button class="ib del" data-del="' + x.id + '" aria-label="Delete ' + esc(x.name) + '"><svg viewBox="0 0 24 24"><path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg></button></div></td></tr>';
    }).join('');
    var empty = '<div class="empty"><b>No records match</b>Try a different search or clear the filters. <p><button class="btn" id="clear">Clear search and filters</button></p></div>';
    var pager = '<div class="pager"><span>' + (all.length ? ((st.page - 1) * PER + 1) + '–' + Math.min(st.page * PER, all.length) + ' of ' + all.length : '0 results') + '</span><div class="btns"><button class="btn" data-pg="-1"' + (st.page <= 1 ? ' disabled' : '') + ' aria-label="Previous page">←</button><span style="align-self:center;padding:0 6px">Page ' + st.page + ' of ' + pages + '</span><button class="btn" data-pg="1"' + (st.page >= pages ? ' disabled' : '') + ' aria-label="Next page">→</button></div></div>';
    return head + tools + '<div class="card" style="padding:6px 6px 14px">' + (all.length ? '<div class="tbl-wrap"><table class="tbl"><thead><tr>' + th + '</tr></thead><tbody>' + body + '</tbody></table></div>' : empty) + pager + '</div>';
  }
  function render(keepFocus) {
    var m = $('#main'); counts();
    $$('.nav').forEach(function (b) { b.classList.toggle('on', b.dataset.view === st.view); b.setAttribute('aria-current', b.dataset.view === st.view ? 'page' : 'false'); });
    m.innerHTML = st.view === 'dash' ? dash() : table(st.view); $('#add').textContent = '+ Add ' + (st.view === 'staff' ? 'staff member' : 'student');
    document.title = (SCHEMA[st.view] ? SCHEMA[st.view].title : 'Dashboard') + ' · Campus Desk';
    if (!keepFocus) { m.focus({ preventScroll: true }); }
  }
  function go(v) { st.view = v; st.page = 1; st.f = ''; st.status = ''; st.q = ''; $('#q').value = ''; st.sort = { k: 'name', d: 1 }; history.replaceState(null, '', '#' + v); render(); closeSide(); }

  // ---- add / edit
  var dlg = $('#dlg'), form = $('#form'), editing = null, type = 'students';
  function openForm(t, id) {
    type = t; editing = id ? data[t].filter(function (x) { return x.id === id; })[0] : null; var sc = SCHEMA[t], v = editing || { status: 'Active', year: '1', joined: new Date().toISOString().slice(0, 10), score: 70 };
    var fields = sc.fields.map(function (f) {
      var val = v[f.k] == null ? '' : v[f.k], id = 'f-' + f.k, ctl;
      if (f.t === 'select') ctl = '<select id="' + id + '" name="' + f.k + '">' + f.opts.map(function (o) { return '<option' + (String(val) === o ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') + '</select>';
      else ctl = '<input id="' + id + '" name="' + f.k + '" type="' + f.t + '" value="' + esc(val) + '"' + (f.min != null ? ' min="' + f.min + '" max="' + f.max + '"' : '') + (f.t === 'email' ? ' autocomplete="off" inputmode="email"' : '') + (f.t === 'tel' ? ' inputmode="tel"' : '') + '>';
      return '<div class="fld"><label for="' + id + '">' + f.l + (f.req ? '' : ' <span style="color:var(--muted);font-weight:400">(optional)</span>') + '</label>' + ctl + '<span class="e" id="e-' + f.k + '" role="alert"></span></div>';
    });
    var pairs = ''; for (var i = 0; i < fields.length; i++) pairs += (i >= 2 && i % 2 === 0 ? '' : '') + fields[i];
    form.innerHTML = '<h2 id="dlg-t">' + (editing ? 'Edit ' : 'Add ') + sc.one + '</h2><div class="two">' + pairs + '</div><div class="row-end"><button type="button" class="btn" id="cancel">Cancel</button><button type="submit" class="btn primary">' + (editing ? 'Save changes' : 'Add ' + sc.one) + '</button></div>';
    dlg.showModal(); var f1 = $('#f-name'); if (f1) f1.focus();
  }
  function validateForm() {
    var sc = SCHEMA[type], ok = true, first = null, out = {};
    sc.fields.forEach(function (f) {
      var el = $('#f-' + f.k), val = el.value.trim(), msg = '';
      if (f.req && val.length < 2) msg = 'Please fill this in.';
      else if (f.t === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val)) msg = 'Enter a valid email.';
      else if (f.t === 'email' && data[type].some(function (x) { return x.email.toLowerCase() === val.toLowerCase() && (!editing || x.id !== editing.id); })) msg = 'This email is already in use.';
      else if (f.t === 'tel' && val && !/^\+?\d{8,15}$/.test(val.replace(/[\s-]/g, ''))) msg = 'Use 8 to 15 digits.';
      else if (f.t === 'number' && (val === '' || isNaN(+val) || +val < f.min || +val > f.max)) msg = 'Enter a number from ' + f.min + ' to ' + f.max + '.';
      else if (f.t === 'date' && val && isNaN(new Date(val))) msg = 'Enter a valid date.';
      $('#e-' + f.k).textContent = msg; el.setAttribute('aria-invalid', msg ? 'true' : 'false'); if (msg) { ok = false; if (!first) first = el; }
      out[f.k] = f.t === 'number' ? +val : val;
    });
    if (first) first.focus(); return ok ? out : null;
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault(); var v = validateForm(); if (!v) return;
    if (editing) { Object.assign(editing, v); say('Saved ' + v.name + '.'); } else { v.id = (type === 'students' ? 's' : 't') + Date.now(); data[type].unshift(v); say('Added ' + v.name + '.'); st.view === 'dash' ? 0 : (st.page = 1); }
    save(); dlg.close(); render(true);
  });
  form.addEventListener('click', function (e) { if (e.target.id === 'cancel') dlg.close(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  var cdlg = $('#confirm'), pend = null;
  function askDelete(t, id) { var x = data[t].filter(function (r) { return r.id === id; })[0]; if (!x) return; pend = { t: t, id: id, name: x.name }; $('#cf-t').textContent = 'Delete ' + x.name + '?'; $('#cf-p').textContent = 'This removes the record from this demo. You can bring it back with “Reset sample data”.'; cdlg.showModal(); $('#cf-yes').blur(); cdlg.querySelector('[value=no]').focus(); }
  cdlg.addEventListener('close', function () { if (cdlg.returnValue === 'yes' && pend) { data[pend.t] = data[pend.t].filter(function (r) { return r.id !== pend.id; }); save(); say('Deleted ' + pend.name + '.'); render(true); } pend = null; cdlg.returnValue = ''; });

  // ---- events
  document.addEventListener('click', function (e) {
    var t = e.target.closest('button'); if (!t) return;
    if (t.dataset.view) go(t.dataset.view);
    else if (t.id === 'add') openForm(st.view === 'staff' ? 'staff' : 'students');
    else if (t.dataset.edit) openForm(st.view, t.dataset.edit);
    else if (t.dataset.del) askDelete(st.view, t.dataset.del);
    else if (t.dataset.sort) { st.sort = { k: t.dataset.sort, d: st.sort.k === t.dataset.sort ? -st.sort.d : 1 }; render(true); var h = $('[data-sort="' + t.dataset.sort + '"]'); if (h) h.focus(); }
    else if (t.dataset.pg) { st.page += +t.dataset.pg; render(true); $('#main').scrollIntoView({ block: 'start' }); }
    else if (t.id === 'clear') { st.q = ''; st.f = ''; st.status = ''; $('#q').value = ''; st.page = 1; render(true); }
    else if (t.id === 'csv') exportCsv();
    else if (t.id === 'reset') { data = { students: clone(S.students), staff: clone(S.staff) }; save(); st.page = 1; say('Sample data restored.'); render(true); closeSide(); }
    else if (t.id === 'burger') { var o = $('#side').classList.toggle('open'); t.setAttribute('aria-expanded', String(o)); }
  });
  document.addEventListener('change', function (e) { if (e.target.id === 'f-main') { st.f = e.target.value; st.page = 1; render(true); $('#f-main').focus(); } if (e.target.id === 'f-status') { st.status = e.target.value; st.page = 1; render(true); $('#f-status').focus(); } });
  var qt; $('#q').addEventListener('input', function (e) { clearTimeout(qt); qt = setTimeout(function () { var v = e.target.value; if (st.view === 'dash') { st.view = 'students'; history.replaceState(null, '', '#students'); } st.q = v; st.page = 1; render(true); $('#q').value = v; }, 160); });
  function closeSide() { $('#side').classList.remove('open'); $('#burger').setAttribute('aria-expanded', 'false'); }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSide(); });
  function exportCsv() {
    var sc = SCHEMA[st.view], list = rows(st.view), ks = sc.fields.map(function (f) { return f.k; });
    var csv = [ks.join(',')].concat(list.map(function (x) { return ks.map(function (k) { return '"' + String(x[k] == null ? '' : x[k]).replace(/"/g, '""') + '"'; }).join(','); })).join('\n');
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = st.view + '.csv'; document.body.appendChild(a); a.click(); a.remove(); say('Exported ' + list.length + ' records.');
  }
  var h = location.hash.slice(1); st.view = SCHEMA[h] ? h : 'dash'; render(true);
})();
