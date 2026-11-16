// Sample records: invented names only. Dates are relative to today so the dashboard always looks current.
(function () {
  var first = ['Aarav', 'Diya', 'Vihaan', 'Anaya', 'Reyansh', 'Ira', 'Kabir', 'Meera', 'Arjun', 'Saanvi', 'Ishaan', 'Kiara', 'Rohan', 'Tara', 'Dev', 'Navya', 'Yash', 'Pari', 'Neel', 'Riya', 'Karan', 'Zoya', 'Aditya', 'Myra', 'Samar', 'Anvi', 'Veer', 'Sara', 'Om', 'Nisha', 'Harsh', 'Aisha', 'Tanay', 'Mahi', 'Ayaan', 'Sneha'];
  var last = ['Sharma', 'Verma', 'Nair', 'Iyer', 'Khan', 'Patel', 'Reddy', 'Gill', 'Mehta', 'Joshi', 'Bose', 'Kulkarni', 'Menon', 'Rao', 'Chopra', 'Das', 'Singh', 'Pillai', 'Saxena', 'Bhatt'];
  var courses = ['B.Tech Computer Science', 'B.Com', 'BBA', 'B.Sc Physics', 'MBA', 'BA English'];
  var depts = ['Teaching', 'Administration', 'Accounts', 'IT support', 'Library'];
  var roles = { 'Teaching': ['Lecturer', 'Senior lecturer', 'Head of department'], 'Administration': ['Office coordinator', 'Registrar', 'Admissions officer'], 'Accounts': ['Accountant', 'Accounts assistant'], 'IT support': ['Systems administrator', 'Lab technician'], 'Library': ['Librarian', 'Library assistant'] };
  var cities = ['Pune', 'Jaipur', 'Kochi', 'Indore', 'Bhubaneswar', 'Lucknow', 'Coimbatore', 'Nagpur'];
  var seed = 7; function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; } function pick(a) { return a[Math.floor(rnd() * a.length)]; }
  function daysAgo(n) { var d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); }
  function phone() { return '9' + (100000000 + Math.floor(rnd() * 899999999)); }
  var used = {};
  function person() { var f, l, k; do { f = pick(first); l = pick(last); k = f + l; } while (used[k]); used[k] = 1; return { name: f + ' ' + l, email: (f + '.' + l).toLowerCase() + '@campusdesk.example' }; }
  var students = [], staff = [], i, p;
  for (i = 0; i < 36; i++) { p = person(); var st = rnd(); students.push({ id: 's' + (i + 1), name: p.name, email: p.email, phone: phone(), course: pick(courses), year: 1 + Math.floor(rnd() * 4), score: 52 + Math.floor(rnd() * 46), status: st < .8 ? 'Active' : st < .9 ? 'On leave' : 'Graduated', joined: daysAgo(Math.floor(rnd() * (i < 5 ? 25 : 900))) }); }
  for (i = 0; i < 24; i++) { p = person(); var d = pick(depts), sl = rnd(); staff.push({ id: 't' + (i + 1), name: p.name, email: p.email, phone: phone(), department: d, role: pick(roles[d]), city: pick(cities), status: sl < .92 ? 'Active' : 'On leave', joined: daysAgo(Math.floor(rnd() * (i < 3 ? 25 : 2400))) }); }
  window.SAMPLE = { students: students, staff: staff, courses: courses, depts: depts };
})();
