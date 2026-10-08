const menuBtn = document.querySelector('.menu-btn');
const nav = document.querySelector('.nav');
menuBtn?.addEventListener('click', () => nav.classList.toggle('open'));
document.querySelectorAll('.nav a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, {threshold: .12});
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const form = document.getElementById('bookingForm');
const toast = document.getElementById('toast');
form?.addEventListener('submit', e => {
  e.preventDefault();
  toast.classList.add('show');
  form.reset();
  setTimeout(() => toast.classList.remove('show'), 3500);
});

/* ===== v2 ===== */
const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
const fine = matchMedia('(pointer:fine)').matches;
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const curtain = $('.curtain');

/* занавес при загрузке */
addEventListener('load', () => {
  setTimeout(() => { curtain.classList.replace('in', 'out'); setTimeout(() => curtain.classList.remove('out'), 700); }, 350);
});

/* инерционный скролл */
let cur = scrollY, target = scrollY, raf = 0;
const maxY = () => document.documentElement.scrollHeight - innerHeight;
function loop() {
  cur += (target - cur) * .09;
  if (Math.abs(target - cur) < .4) { cur = target; raf = 0; } else raf = requestAnimationFrame(loop);
  scrollTo({ top: cur, behavior: 'instant' });
}
if (fine && !reduce) {
  document.documentElement.classList.add('smooth');
  addEventListener('wheel', e => {
    if (e.ctrlKey) return;
    e.preventDefault();
    target = Math.max(0, Math.min(maxY(), target + e.deltaY * (e.deltaMode ? 33 : 1)));
    if (!raf) raf = requestAnimationFrame(loop);
  }, { passive: false });
  addEventListener('scroll', () => { if (!raf) cur = target = scrollY; });
}

/* переходы между «слайдами»: диагональный занавес */
function go(y) {
  if (reduce) return scrollTo(0, y);
  curtain.classList.add('in');
  setTimeout(() => {
    cur = target = y; scrollTo({ top: y, behavior: 'instant' });
    curtain.classList.replace('in', 'out');
    setTimeout(() => curtain.classList.remove('out'), 700);
  }, 600);
}
$$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  const id = a.getAttribute('href'), t = id === '#top' ? null : $(id);
  if (id !== '#top' && !t) return;
  e.preventDefault();
  go(t ? t.getBoundingClientRect().top + scrollY : 0);
}));

/* параллакс + прогресс + наклон ленты */
const bar = $('.progress'), reelEl = $('.reel');
function onScroll() {
  const y = scrollY;
  bar.style.transform = `scaleX(${y / Math.max(1, maxY())})`;
  if (!reduce) $$('[data-speed]').forEach(el => {
    if (el.classList.contains('reveal') && !el.classList.contains('visible')) return;
    el.style.transform = `translate3d(0,${y * el.dataset.speed}px,0)`;
  });
  const r = reelEl.getBoundingClientRect();
  reelEl.style.setProperty('--ry', (-24 + (r.top / innerHeight) * 14).toFixed(1) + 'deg');
}
addEventListener('scroll', onScroll, { passive: true }); onScroll();

/* 3D-наклон карточек */
if (fine && !reduce) $$('.tilt').forEach(el => {
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    el.style.transform = `perspective(900px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) translateZ(10px)`;
  });
  el.addEventListener('mouseleave', () => el.style.transform = '');
});

/* курсор */
if (fine && !reduce) {
  const c = document.createElement('div'); c.className = 'cursor'; document.body.appendChild(c);
  let cx = 0, cy = 0, tx = 0, ty = 0;
  addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
  (function m() { cx += (tx - cx) * .2; cy += (ty - cy) * .2; c.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(m); })();
  $$('a,button,.clip,.tilt,.service-card').forEach(el => {
    el.addEventListener('mouseenter', () => c.classList.add('big'));
    el.addEventListener('mouseleave', () => c.classList.remove('big'));
  });
}

/* счётчики */
$$('.stats b').forEach(b => {
  const m = b.textContent.match(/^([\d.]+)(.*)$/); if (!m) return;
  const end = parseFloat(m[1]), dec = m[1].includes('.') ? 1 : 0;
  new IntersectionObserver(([en], o) => {
    if (!en.isIntersecting) return; o.disconnect();
    const t0 = performance.now();
    (function s(t) { const p = Math.min(1, (t - t0) / 1400), e = 1 - Math.pow(1 - p, 3);
      b.textContent = (end * e).toFixed(dec) + m[2]; if (p < 1) requestAnimationFrame(s); })(t0);
  }).observe(b);
});

/* лента стрижек. Чтобы вставить настоящее видео: добавь поле video: 'videos/fade.mp4' */
const heads = `<ellipse cx="100" cy="138" rx="50" ry="66"/><path d="M50 130c-12-4-12 26 2 24M150 130c12-4 12 26-2 24M80 198v34M120 198v34M20 260c6-30 40-30 60-28h40c20-2 54-2 60 28"/>`;
const clips = [
  { n: 'FADE', m: 'SKIN · LOW', h: '<path class="hair" pathLength="1" d="M50 118C46 52 154 52 150 118C146 92 128 80 100 80C72 80 54 92 50 118Z"/><path class="fade" d="M50 118V152M150 118V152M56 118V140M144 118V140"/>' },
  { n: 'POMPADOUR', m: 'CLASSIC', h: '<path class="hair" pathLength="1" d="M46 122C28 55 95 14 168 42C150 56 154 90 154 122C140 84 62 84 46 122Z"/>' },
  { n: 'CREW CUT', m: 'MILITARY', h: '<path class="hair" pathLength="1" d="M52 112C54 70 146 70 148 112C140 92 126 88 100 88C74 88 60 92 52 112Z"/><path class="dots" d="M64 100h72M70 90h60"/>' },
  { n: 'UNDERCUT', m: 'MODERN', h: '<path class="hair" pathLength="1" d="M60 108C56 40 150 30 142 108C132 78 112 70 100 70C80 70 66 80 60 108Z"/><path class="fade" d="M52 112V150M148 112V150"/>' },
  { n: 'TEXTURE', m: 'CROP', h: '<path class="hair" pathLength="1" d="M48 120L52 70L68 84L80 56L98 78L116 52L128 80L146 66L152 120C140 96 128 84 100 84C72 84 58 96 48 120Z"/>' },
  { n: 'FADE + BEARD', m: 'FULL LOOK', h: '<path class="hair" pathLength="1" d="M50 118C46 52 154 52 150 118C146 92 128 80 100 80C72 80 54 92 50 118Z"/><path class="hair" pathLength="1" d="M52 150C56 214 144 214 148 150C134 182 66 182 52 150Z"/>' }
];
function clipEl(c, i) {
  const d = document.createElement('div'); d.className = 'clip';
  d.innerHTML = (c.video ? `<video src="${c.video}" autoplay muted loop playsinline></video>` : `<svg viewBox="0 0 200 260" preserveAspectRatio="xMidYMid slice">${heads}${c.h}</svg>`) +
    `<span class="rec">REC 0${i % 6 + 1}</span><div class="cap"><span>${c.n}<br><small>${c.m}</small></span></div><i class="bar"></i>`;
  d.style.setProperty('--d', (i * -.7) + 's');
  d.querySelectorAll('.hair,.bar,.clip').forEach(x => x.style.animationDelay = (i * -.7) + 's');
  d.style.setProperty('animation-delay', (i * -.7) + 's');
  return d;
}
$$('.reel-track').forEach((tr, k) => {
  const list = k ? [...clips].reverse() : clips;
  for (let r = 0; r < 2; r++) list.forEach((c, i) => tr.appendChild(clipEl(c, i + k * 3)));
});

/* 3D-барбер-пол на canvas */
const cv = $('#pole');
if (cv) {
  const g = cv.getContext('2d'); let W, H, dpr, mx = 0, my = 0, sx = 0, sy = 0, spin = 0;
  const fit = () => { dpr = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); };
  fit(); addEventListener('resize', fit);
  addEventListener('mousemove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; });
  const R = 1, L = 2.5, N = 5, TURNS = 1.6, STEPS = 70;
  function draw(t) {
    g.clearRect(0, 0, W, H);
    sx += (mx - sx) * .06; sy += (my - sy) * .06;
    spin = t * .0006 + scrollY * .002;
    const ay = sx * 1.2 + t * .00022, ax = .28 + sy * .5 + .06 * Math.sin(t * .0007);
    const sc = Math.min(W / 3.2, H / 6.2);
    const P = (x, y, z) => {
      let X = x * Math.cos(ay) + z * Math.sin(ay), Z = -x * Math.sin(ay) + z * Math.cos(ay);
      let Y = y * Math.cos(ax) - Z * Math.sin(ax); Z = y * Math.sin(ax) + Z * Math.cos(ax);
      const f = 6 / (6 + Z); return [W / 2 + X * sc * f, H / 2 - Y * sc * f, Z];
    };
    const line = (pts, col, w) => {
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i], z = (a[2] + b[2]) / 2, al = .15 + .85 * (1 - (z + 1) / 2);
        g.strokeStyle = col; g.globalAlpha = al; g.lineWidth = w * (.6 + al * .6);
        g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
      }
      g.globalAlpha = 1;
    };
    [-L, L].forEach(y => { // кольца-крышки
      for (const k of [1, .86]) { const p = []; for (let i = 0; i <= 64; i++) { const a = i / 64 * 6.2832; p.push(P(Math.cos(a) * R * k, y + (k < 1 ? (y > 0 ? .18 : -.18) : 0), Math.sin(a) * R * k)); } line(p, '#d7ff45', 1.6); }
    });
    for (let k = 0; k < N; k++) { // спиральные полосы
      const p = [];
      for (let i = 0; i <= STEPS; i++) { const u = i / STEPS, a = u * TURNS * 6.2832 + k / N * 6.2832 + spin * 6; p.push(P(Math.cos(a) * R, -L + u * 2 * L, Math.sin(a) * R)); }
      line(p, k % 2 ? '#d7ff45' : '#8d8b82', k % 2 ? 2.2 : 1.4);
    }
    for (let k = 0; k < 8; k++) { const a = k / 8 * 6.2832, p = [P(Math.cos(a) * R, -L, Math.sin(a) * R), P(Math.cos(a) * R, L, Math.sin(a) * R)]; line(p, '#3a3a34', 1); }
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}
