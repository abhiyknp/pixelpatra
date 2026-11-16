// Sample portfolio: a full-screen particle field. The name is drawn on a hidden canvas, sampled into points, and each point
// has a second home on a spiral galaxy. Scrolling morphs name -> galaxy; the pointer pushes particles away.
import * as THREE from 'three';
const C = window.PORTFOLIO, $ = (s) => document.querySelector(s);
const nameNow = () => (window.ppTheme ? window.ppTheme.brand(C.name) : C.name);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const small = innerWidth < 700;

// ---- text content
$('#h1').textContent = C.name + ', ' + C.role; $('#role').textContent = C.role; $('#line').textContent = C.line;
$('#logo').textContent = C.name.split(' ').map((w) => w[0]).join('');
$('#aboutp').textContent = 'Sample text: a short, honest paragraph about who you are, how you work and what you care about. ' + C.line;
$('#chips').innerHTML = C.skills.map((s) => '<span>' + s + '</span>').join('');
$('#mail').textContent = C.email; $('#mail').href = 'mailto:' + C.email;
$('#wa').addEventListener('click', (e) => { e.preventDefault(); if (!C.whatsapp) { alert('Sample site: no WhatsApp number is set yet.'); return; } open('https://wa.me/' + C.whatsapp + '?text=' + encodeURIComponent('Hello ' + C.name + ', I saw your portfolio.'), '_blank', 'noopener'); });
if (C.instagram) { $('#ig').hidden = false; $('#ig').href = 'https://instagram.com/' + C.instagram.replace(/^@/, ''); }
$('#grid').innerHTML = C.projects.map((p, i) => '<a class="proj fade" href="#project-' + (i + 1) + '" data-i="' + i + '" style="--g:linear-gradient(135deg,' + p.c[0] + ',' + p.c[1] + ')"><img class="pi" src="' + p.img + '" alt="" loading="lazy"><span class="n">0' + (i + 1) + ' · ' + p.y + '</span><b>' + p.t + '</b><span>' + p.k + '</span></a>').join('');
// project view: a full-screen panel with the image, the story and next/previous
const view = $('#view'); let cur = -1, opener = null;
function show(i) { cur = (i + C.projects.length) % C.projects.length; const p = C.projects[cur];
  $('#v-img').src = p.img; $('#v-img').alt = p.t + ', ' + p.k; $('#v-n').textContent = '0' + (cur + 1) + ' / 0' + C.projects.length + ' · ' + p.y; $('#v-t').textContent = p.t; $('#v-k').textContent = p.k; $('#v-role').textContent = p.role; $('#v-text').textContent = p.text; }
function openView(i, from) { opener = from; show(i); view.hidden = false; document.body.style.overflow = 'hidden'; document.querySelectorAll('main, .top, footer').forEach((n) => n.setAttribute('inert', '')); $('#v-close').focus(); history.replaceState(null, '', '#project-' + (cur + 1)); }
function closeView() { view.hidden = true; document.body.style.overflow = ''; document.querySelectorAll('[inert]').forEach((n) => n.removeAttribute('inert')); history.replaceState(null, '', '#work'); if (opener) opener.focus(); }
$('#grid').addEventListener('click', (e) => { const a = e.target.closest('.proj'); if (!a) return; e.preventDefault(); openView(+a.dataset.i, a); });
$('#v-close').addEventListener('click', closeView); $('#v-next').addEventListener('click', () => show(cur + 1)); $('#v-prev').addEventListener('click', () => show(cur - 1));
addEventListener('keydown', (e) => { if (view.hidden) return; if (e.key === 'Escape') closeView(); if (e.key === 'ArrowRight') show(cur + 1); if (e.key === 'ArrowLeft') show(cur - 1); });
const fromHash = () => { const hp = /^#project-(\d)$/.exec(location.hash); if (hp && C.projects[+hp[1] - 1]) { if (view.hidden || cur !== +hp[1] - 1) openView(+hp[1] - 1, opener); } else if (!view.hidden) closeView(); };
addEventListener('hashchange', fromHash); fromHash(); // the browser's back button and shared links work
// reveal on scroll
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .15 });
document.querySelectorAll('.fade').forEach((n, i) => { n.style.transitionDelay = (i % 3) * 80 + 'ms'; io.observe(n); });
// card tilt + highlight
document.querySelectorAll('.proj').forEach((el) => {
  el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.style.setProperty('--mx', x * 100 + '%'); el.style.setProperty('--my', y * 100 + '%'); if (!reduce) el.style.transform = 'perspective(700px) rotateY(' + (x - .5) * 10 + 'deg) rotateX(' + (.5 - y) * 10 + 'deg) translateZ(8px)'; });
  el.addEventListener('pointerleave', () => { el.style.transform = ''; });
});

// ---- particles
const canvas = $('#gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(50, 1, .1, 50); camera.position.z = 4;
function sampleText(name) {
  const lines = name.split(' '), W = 1200, H = lines.length > 1 ? 560 : 300, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle';
  let fs = H / lines.length * .9; const font = () => '700 ' + fs + 'px "Space Grotesk", Arial, sans-serif'; x.font = font();
  while (Math.max(...lines.map((l) => x.measureText(l).width)) > W * .94 && fs > 30) { fs -= 6; x.font = font(); }
  lines.forEach((l, i) => x.fillText(l, W / 2, H * (i + .5) / lines.length + fs * .04));
  const d = x.getImageData(0, 0, W, H).data, pts = []; const step = small ? 4 : 3;
  for (let j = 0; j < H; j += step) for (let i = 0; i < W; i += step) if (d[(j * W + i) * 4 + 3] > 128) pts.push([(i / W - .5), -(j / H - .5) * (H / W)]);
  return pts;
}
let points = null, mat = null, uni = null;
function build() {
  if (points) { scene.remove(points); points.geometry.dispose(); }
  const pts = sampleText(nameNow()), n = pts.length;
  const home = new Float32Array(n * 3), alt = new Float32Array(n * 3), rnd = new Float32Array(n);
  const vh = 2 * 4 * Math.tan(25 * Math.PI / 180), vw = vh * (innerWidth / innerHeight), tw = Math.min(vw * (small ? .9 : .62), 5.6);
  for (let i = 0; i < n; i++) {
    home[i * 3] = pts[i][0] * tw; home[i * 3 + 1] = pts[i][1] * tw + (innerWidth < 700 ? .9 : .55); home[i * 3 + 2] = 0;
    const r = Math.pow(Math.random(), .6) * 4.2, arm = (i % 3) * 2.094, a = r * 1.6 + arm + (Math.random() - .5) * .5;
    alt[i * 3] = Math.cos(a) * r; alt[i * 3 + 1] = (Math.random() - .5) * .5 * (1 - r / 5) ; alt[i * 3 + 2] = Math.sin(a) * r - 1.5; rnd[i] = Math.random();
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(home, 3)); g.setAttribute('aAlt', new THREE.BufferAttribute(alt, 3)); g.setAttribute('aRand', new THREE.BufferAttribute(rnd, 1));
  uni = { uTime: { value: 0 }, uProg: { value: 0 }, uMouse: { value: new THREE.Vector2(9, 9) }, uSize: { value: small ? 3.2 : 3.0 }, uPx: { value: renderer.getPixelRatio() }, uC1: { value: new THREE.Vector3(1, .42, .08) }, uC2: { value: new THREE.Vector3(1, .86, .5) } };
  mat = new THREE.ShaderMaterial({ uniforms: uni, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute vec3 aAlt; attribute float aRand; uniform float uTime, uProg, uSize, uPx; uniform vec2 uMouse; varying float vR; varying float vF;
      void main(){ float k = smoothstep(0., 1., clamp(uProg * 1.15 - aRand * .15, 0., 1.)); vec3 p = mix(position, aAlt, k);
        float ang = uTime * .06 * k; p.xz = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * p.xz;
        p.z += sin(uTime * .8 + aRand * 6.283) * .035; p.xy += vec2(sin(uTime * .5 + aRand * 11.), cos(uTime * .6 + aRand * 7.)) * (.01 + .03 * k);
        vec2 d = p.xy - uMouse; float r = length(d); float f = smoothstep(.75, 0., r) * (1. - k * .6); p.xy += normalize(d + 1e-4) * f * .32; p.z += f * .35; vF = f; vR = aRand;
        vec4 mv = modelViewMatrix * vec4(p, 1.); gl_PointSize = uSize * uPx * (1. + f * 1.6) * (3.6 / -mv.z) * (.7 + aRand * .8); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 uC1; uniform vec3 uC2; varying float vR; varying float vF; void main(){ vec2 c = gl_PointCoord - .5; float d = length(c); if (d > .5) discard; float a = smoothstep(.5, .05, d);
        vec3 col = mix(uC1, uC2, vR); col = mix(col, vec3(1., .95, .8), vF * .35); gl_FragColor = vec4(col, a * (.6 + vF * .2)); }` });
  points = new THREE.Points(g, mat); scene.add(points);
}
function size() { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); build(); }
addEventListener('resize', size); addEventListener('storage', (e) => { if (e.key === 'pp-name') build(); });
(document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(size); size();

// ---- pointer, scroll, loop
const mouse = new THREE.Vector2(9, 9), target = new THREE.Vector2(9, 9); let prog = 0, progT = 0;
const glow = $('#glow');
addEventListener('pointermove', (e) => { const vh = 2 * 4 * Math.tan(25 * Math.PI / 180), vw = vh * camera.aspect; target.set((e.clientX / innerWidth - .5) * vw, -(e.clientY / innerHeight - .5) * vh); glow.style.opacity = 1; glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; });
addEventListener('pointerleave', () => { target.set(9, 9); glow.style.opacity = 0; });
addEventListener('scroll', () => { progT = Math.min(1, scrollY / (innerHeight * .85)); }, { passive: true });
let t0 = performance.now();
function frame(now) {
  const dt = (now - t0) / 1000; t0 = now; if (uni) {
    if (window.PP_COLORS) { uni.uC1.value.set(...window.PP_COLORS.c1); uni.uC2.value.set(...window.PP_COLORS.c2); }
    uni.uTime.value += dt; mouse.lerp(target, .18); uni.uMouse.value.copy(mouse); prog += (progT - prog) * .07; uni.uProg.value = reduce ? 0 : prog;
    camera.position.x = (mouse.x === 9 ? 0 : mouse.x * .03); camera.position.y = (mouse.y === 9 ? 0 : mouse.y * .03) - prog * .4; camera.lookAt(0, 0, -prog); renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
// first impression: the name assembles from a scattered cloud
if (!reduce) { prog = 1; setTimeout(() => { progT = Math.min(1, scrollY / (innerHeight * .85)); }, 150); }
