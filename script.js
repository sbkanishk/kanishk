/* ===========================================================
   KANISHK — PORTFOLIO SCRIPT
   =========================================================== */
document.getElementById('year').textContent = new Date().getFullYear();

/* -----------------------------------------------------------
   Loader
----------------------------------------------------------- */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  setTimeout(() => {
    loader.classList.add('hidden');
    document.body.classList.remove('no-scroll');
    startRevealObserver();
  }, 900);
});
document.body.classList.add('no-scroll');

/* -----------------------------------------------------------
   Theme toggle (default dark, persisted)
----------------------------------------------------------- */
const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('kanishk-theme');
if (savedTheme) root.setAttribute('data-theme', savedTheme);
else root.setAttribute('data-theme', 'light');

themeToggle.addEventListener('click', () => {
  const current = root.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('kanishk-theme', next);
  const c = document.getElementById('heroCanvas');
  if (c){
    const cctx = c.getContext('2d');
    cctx.fillStyle = getComputedStyle(root).getPropertyValue('--bg').trim();
    cctx.fillRect(0, 0, c.width, c.height);
  }
});

/* -----------------------------------------------------------
   Custom cursor
----------------------------------------------------------- */
const dot = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');
let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX; mouseY = e.clientY;
  dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%,-50%)`;
});
(function animateRing(){
  ringX += (mouseX - ringX) * 0.18;
  ringY += (mouseY - ringY) * 0.18;
  ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%,-50%)`;
  requestAnimationFrame(animateRing);
})();
document.querySelectorAll('a, button, .interest-chip, .project-card, .fact-card').forEach(el => {
  el.addEventListener('mouseenter', () => ring.classList.add('is-active'));
  el.addEventListener('mouseleave', () => ring.classList.remove('is-active'));
});

/* -----------------------------------------------------------
   Nav: scroll state + mobile menu
----------------------------------------------------------- */
const nav = document.getElementById('siteNav');
const burger = document.getElementById('navBurger');
const navMobile = document.getElementById('navMobile');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 30);
  toggleBackToTop();
  updateTimelineProgress();
}, { passive:true });

burger.addEventListener('click', () => {
  const open = navMobile.classList.toggle('open');
  burger.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', open);
});
navMobile.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  navMobile.classList.remove('open');
  burger.classList.remove('open');
}));

document.getElementById('scrollCue').addEventListener('click', () => {
  document.getElementById('about').scrollIntoView({ behavior:'smooth' });
});

/* -----------------------------------------------------------
   Back to top
----------------------------------------------------------- */
const backToTop = document.getElementById('backToTop');
function toggleBackToTop(){
  backToTop.classList.toggle('show', window.scrollY > 600);
}
backToTop.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));

/* -----------------------------------------------------------
   Scroll reveal
----------------------------------------------------------- */
function startRevealObserver(){
  const items = document.querySelectorAll('.reveal, .reveal-line, .timeline-item');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('in-view');
      }
    });
  }, { threshold:0.15, rootMargin:'0px 0px -60px 0px' });
  items.forEach((el, i) => {
    if (el.classList.contains('reveal-line')) el.style.transitionDelay = `${i * 0.06}s`;
    io.observe(el);
  });
}

/* -----------------------------------------------------------
   Timeline progress fill
----------------------------------------------------------- */
function updateTimelineProgress(){
  const timeline = document.querySelector('.timeline');
  const progress = document.getElementById('timelineProgress');
  if (!timeline || !progress) return;
  const rect = timeline.getBoundingClientRect();
  const vh = window.innerHeight;
  const total = rect.height;
  const visible = Math.min(Math.max(vh * 0.75 - rect.top, 0), total);
  progress.style.height = `${(visible / total) * 100}%`;
}

/* -----------------------------------------------------------
   Hero canvas — live Lissajous phase-plot (a signature, not stock)
----------------------------------------------------------- */
const canvas = document.getElementById('heroCanvas');
const ctx = canvas.getContext('2d');
let W, H;
let mouse = { x: null, y: null, active:false };
let t = 0;
let freqX = 3, freqY = 2, targetFreqX = 3, targetFreqY = 2;
const readout = document.getElementById('plotReadout');

function resizeCanvas(){
  W = canvas.width = canvas.offsetWidth * devicePixelRatio;
  H = canvas.height = canvas.offsetHeight * devicePixelRatio;
  canvas.style.width = canvas.offsetWidth + 'px';
}
function isLight(){ return root.getAttribute('data-theme') === 'light'; }

function hexToRgb(hex){
  const h = hex.replace('#','').trim();
  const n = parseInt(h.length === 3 ? h.split('').map(c=>c+c).join('') : h, 16);
  return [(n>>16)&255, (n>>8)&255, n&255];
}

function drawFrame(){
  const accent = getComputedStyle(root).getPropertyValue('--accent').trim();
  const accent2 = getComputedStyle(root).getPropertyValue('--accent-2').trim();
  const bg = getComputedStyle(root).getPropertyValue('--bg').trim();
  const [br,bgc,bb] = hexToRgb(bg);

  // fade previous trail toward background (oscilloscope-style persistence)
  ctx.fillStyle = `rgba(${br},${bgc},${bb},0.045)`;
  ctx.fillRect(0, 0, W, H);

  const cx = W * 0.62, cy = H * 0.5;
  const amp = Math.min(W, H) * 0.34;

  // gently drift target frequencies over time; mouse nudges them when present
  const drift = Math.sin(performance.now() * 0.00007);
  if (mouse.active){
    targetFreqX = 2 + (mouse.x / W) * 4;
    targetFreqY = 2 + (mouse.y / H) * 4;
  } else {
    targetFreqX = 3 + drift * 1.1;
    targetFreqY = 2 + Math.cos(performance.now() * 0.00005) * 1.1;
  }
  freqX += (targetFreqX - freqX) * 0.01;
  freqY += (targetFreqY - freqY) * 0.01;

  const steps = 6;
  ctx.lineWidth = devicePixelRatio * 1.4;
  ctx.lineJoin = 'round';
  for (let i = 0; i < steps; i++){
    const t0 = t + i * 0.004;
    const t1 = t + (i + 1) * 0.004;
    const x0 = cx + amp * Math.sin(freqX * t0);
    const y0 = cy + amp * 0.62 * Math.sin(freqY * t0 + Math.PI / 3);
    const x1 = cx + amp * Math.sin(freqX * t1);
    const y1 = cy + amp * 0.62 * Math.sin(freqY * t1 + Math.PI / 3);
    ctx.strokeStyle = isLight() ? accent : accent;
    ctx.globalAlpha = (isLight() ? 0.32 : 0.42) * (0.4 + (i / steps) * 0.6);
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // head marker
  const hx = cx + amp * Math.sin(freqX * t);
  const hy = cy + amp * 0.62 * Math.sin(freqY * t + Math.PI / 3);
  ctx.beginPath();
  ctx.arc(hx, hy, 3.2 * devicePixelRatio, 0, Math.PI * 2);
  ctx.fillStyle = accent2;
  ctx.globalAlpha = 0.9;
  ctx.fill();
  ctx.globalAlpha = 1;

  t += 0.012;

  if (readout){
    readout.textContent = `x(t) = sin(${freqX.toFixed(2)}t)   y(t) = sin(${freqY.toFixed(2)}t + π/3)`;
  }

  requestAnimationFrame(drawFrame);
}

function setupHeroCanvas(){
  resizeCanvas();
  ctx.fillStyle = getComputedStyle(root).getPropertyValue('--bg').trim();
  ctx.fillRect(0, 0, W, H);
  drawFrame();
}
window.addEventListener('resize', resizeCanvas);
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = (e.clientX - rect.left) * devicePixelRatio;
  mouse.y = (e.clientY - rect.top) * devicePixelRatio;
  mouse.active = true;
});
canvas.addEventListener('mouseleave', () => { mouse.active = false; });
setupHeroCanvas();

/* -----------------------------------------------------------
   Easter eggs
----------------------------------------------------------- */
const eggToast = document.getElementById('eggToast');
function showEgg(msg, duration = 3200){
  eggToast.textContent = msg;
  eggToast.classList.add('show');
  clearTimeout(showEgg._t);
  showEgg._t = setTimeout(() => eggToast.classList.remove('show'), duration);
}

// Interest chip clicks (football + others)
document.querySelectorAll('.interest-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const msg = chip.getAttribute('data-msg');
    if (msg) showEgg(msg);
    if (chip.classList.contains('football-chip')){
      chip.animate(
        [{ transform:'rotate(0deg) scale(1)' }, { transform:'rotate(360deg) scale(1.15)' }, { transform:'rotate(360deg) scale(1)' }],
        { duration:700, easing:'ease-out' }
      );
    }
  });
});

// Konami code: ↑ ↑ ↓ ↓ ← → ← → B A
const konamiSeq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let konamiPos = 0;
window.addEventListener('keydown', (e) => {
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (key === konamiSeq[konamiPos]){
    konamiPos++;
    if (konamiPos === konamiSeq.length){
      document.body.classList.remove('konami-active');
      void document.body.offsetWidth; // restart animation
      document.body.classList.add('konami-active');
      showEgg('∀ε>0 ∃ konami : you found the secret. Respect. 🐉', 4000);
      konamiPos = 0;
    }
  } else {
    konamiPos = (key === konamiSeq[0]) ? 1 : 0;
  }
});
