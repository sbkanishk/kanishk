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
else root.setAttribute('data-theme', 'dark');

themeToggle.addEventListener('click', () => {
  const current = root.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('kanishk-theme', next);
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
   Hero canvas — animated math field (parametric nodes + links)
----------------------------------------------------------- */
const canvas = document.getElementById('heroCanvas');
const ctx = canvas.getContext('2d');
let W, H, particles = [];
const PARTICLE_COUNT = 70;
const LINK_DIST = 130;
let mouse = { x: -9999, y: -9999 };

function resizeCanvas(){
  W = canvas.width = canvas.offsetWidth * devicePixelRatio;
  H = canvas.height = canvas.offsetHeight * devicePixelRatio;
  canvas.style.width = canvas.offsetWidth + 'px';
}
function initParticles(){
  particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++){
    particles.push({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35 * devicePixelRatio,
      vy: (Math.random() - 0.5) * 0.35 * devicePixelRatio,
      r: (Math.random() * 1.4 + 0.8) * devicePixelRatio
    });
  }
}
function isLight(){ return root.getAttribute('data-theme') === 'light'; }

function drawFrame(){
  ctx.clearRect(0, 0, W, H);
  const accent = getComputedStyle(root).getPropertyValue('--accent').trim();
  const accent2 = getComputedStyle(root).getPropertyValue('--accent-2').trim();
  const lineAlpha = isLight() ? 0.10 : 0.16;
  const dotAlpha = isLight() ? 0.5 : 0.75;

  for (let i = 0; i < particles.length; i++){
    const p = particles[i];
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > W) p.vx *= -1;
    if (p.y < 0 || p.y > H) p.vy *= -1;

    const dx = p.x - mouse.x, dy = p.y - mouse.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < 160 * devicePixelRatio){
      const force = (160 * devicePixelRatio - dist) / (160 * devicePixelRatio);
      p.x += (dx / dist) * force * 1.2;
      p.y += (dy / dist) * force * 1.2;
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = i % 3 === 0 ? accent2 : accent;
    ctx.globalAlpha = dotAlpha;
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  for (let i = 0; i < particles.length; i++){
    for (let j = i + 1; j < particles.length; j++){
      const a = particles[i], b = particles[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < LINK_DIST * devicePixelRatio){
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = accent;
        ctx.globalAlpha = lineAlpha * (1 - dist / (LINK_DIST * devicePixelRatio));
        ctx.lineWidth = devicePixelRatio;
        ctx.stroke();
      }
    }
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(drawFrame);
}

function setupHeroCanvas(){
  resizeCanvas();
  initParticles();
  drawFrame();
}
window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = (e.clientX - rect.left) * devicePixelRatio;
  mouse.y = (e.clientY - rect.top) * devicePixelRatio;
});
canvas.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
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
