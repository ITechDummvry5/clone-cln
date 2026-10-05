/* ========================================
   NAVBAR
======================================== */
const navWrap = document.querySelector('.nav-wrap');
const navLinks = document.getElementById('navLinks');
const ddItem = document.querySelector('.has-dd');

window.addEventListener('scroll', () => navWrap.classList.toggle('scrolled', scrollY > 20), { passive: true });

document.getElementById('burger').addEventListener('click', () => navLinks.classList.toggle('open'));
ddItem.querySelector('.dd-toggle').addEventListener('click', e => {
  if (innerWidth <= 1024) { e.preventDefault(); ddItem.classList.toggle('open'); }
});
navLinks.querySelectorAll('.mega-card, .mn, li:not(.has-dd) > a').forEach(a =>
  a.addEventListener('click', () => navLinks.classList.remove('open')));

/* Active link based on scroll position */
const spy = ['home' ];
const allLinks = document.querySelectorAll('.nav-links > li > a, .f-nav a');
function setActive() {
  if (document.body.dataset.page !== 'home') return;   // other pages are marked by components.js
  let current = 'home';
  spy.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top <= 140) current = id;
  });
  allLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
}
window.addEventListener('scroll', setActive, { passive: true });
setActive();

/* ========================================
   SCROLL REVEAL + COUNT-UP
======================================== */
const revealIO = new IntersectionObserver(entries => {
  entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); revealIO.unobserve(en.target); } });
}, { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => revealIO.observe(el));

function countUp(el) {
  const to = +el.dataset.to, suffix = el.dataset.suffix || '', dur = 1800, t0 = performance.now();
  (function tick(t) {
    const p = Math.min((t - t0) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(to * eased) + (p === 1 ? suffix : '');
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}
const statIO = new IntersectionObserver(entries => {
  entries.forEach(en => { if (en.isIntersecting) { countUp(en.target); statIO.unobserve(en.target); } });
}, { threshold: .6 });
document.querySelectorAll('.count').forEach(el => statIO.observe(el));

/* ========================================
   VIDEO MODAL
======================================== */
const modal = document.getElementById('modal');
const mVideo = document.getElementById('modalVideo');
function openModal(src) { mVideo.src = src; modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); mVideo.play().catch(() => {}); }
function closeModal() { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); mVideo.pause(); mVideo.removeAttribute('src'); mVideo.load(); }
document.querySelectorAll('[data-video]').forEach(b => b.addEventListener('click', () => openModal(b.dataset.video)));
document.getElementById('modalX').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ========================================
   NEWSLETTER
======================================== */
const form = document.getElementById('subForm');
const msg = document.getElementById('formMsg');
if (form) form.addEventListener('submit', e => {
  e.preventDefault();
  const v = document.getElementById('subEmail').value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
    msg.textContent = 'Enter a valid email address, for example name@example.com.';
    msg.className = 'form-msg err'; return;
  }
  msg.textContent = "Thanks! You're subscribed.";
  msg.className = 'form-msg ok';
  form.reset();
});

/* ========================================
   MEGA MENU NEWS SLIDER
======================================== */
(function () {
  const slider = document.getElementById('mnSlider');
  if (!slider) return;
  const track = slider.querySelector('.mn-track');
  const items = track.children, visible = 2, gap = 30;
  const max = Math.max(items.length - visible, 0);
  let i = 0;
  const go = n => {
    i = n > max ? 0 : n < 0 ? max : n;           // loops at both ends
    const step = items[0].offsetWidth + gap;
    track.style.transform = `translateX(${-i * step}px)`;
  };
  slider.querySelector('.next').addEventListener('click', () => go(i + 1));
  slider.querySelector('.prev').addEventListener('click', () => go(i - 1));
  window.addEventListener('resize', () => go(i));
})();
