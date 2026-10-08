/* capricorn hero + pinned intro
   - hero video parallax + text fade
   - intro is pinned for ~220vh; scroll progress drives: title leaves, "01" drifts up,
     car rises + zooms out, description is revealed from behind the car            */

const $ = s => document.querySelector(s);
const clamp = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mix = (a, b, t) => a + (b - a) * t;
const ease = t => 1 - Math.pow(1 - t, 3);                    // easeOutCubic
const range = (p, a, b) => ease(clamp((p - a) / (b - a)));  // sub-timeline a..b

const hero = $('#hero'), heroVideo = $('#heroVideo'), heroCopy = $('.hero-copy');
const intro = $('#intro');
const head = $('.head'), ghost = $('.ghost'), lead = $('.lead'), car = $('.car');
const nav = $('#nav');

heroVideo.play().catch(() => {});   // some browsers need a nudge

let target = 0, current = 0, lastY = scrollY, running = false;

function readScroll() {
  const vh = innerHeight;

  // --- hero: video drifts slower, copy floats up and fades
  const hp = clamp(scrollY / vh);
  heroVideo.style.transform = `translate3d(0,${scrollY * 0.18}px,0)`;
  heroCopy.style.transform = `translate3d(0,${-hp * 60}px,0)`;
  heroCopy.style.opacity = 1 - clamp(hp * 1.6);

  // --- intro progress 0..1 across the pinned distance
  const r = intro.getBoundingClientRect();
  target = clamp(-r.top / (r.height - vh));

  // --- nav: hide on scroll down, show on scroll up
  nav.classList.toggle('hide', scrollY > lastY && scrollY > 120);
  lastY = scrollY;

  if (!running) { running = true; requestAnimationFrame(loop); }
}

function render(p) {
  const vh = innerHeight;

  // title block: floats up and fades out first
  const t = range(p, 0.02, 0.42);
  head.style.transform = `translate3d(0,${-t * vh * 0.5}px,0)`;
  head.style.opacity = 1 - t;

  // giant 01: rises behind everything, a bit slower than the car
  const g = range(p, 0, 0.9);
  ghost.style.transform = `translate3d(0,${-g * vh * 0.34}px,0)`;

  // car: starts big + low (cropped by the bottom edge), ends full + settled
  const c = range(p, 0.05, 0.85);
  car.style.transform = `translate3d(0,${mix(vh * 0.4, 0, c)}px,0) scale(${mix(1.4, 1, c)})`;

  // description: starts hidden behind the car, rises to its place and fades in
  const l = range(p, 0.38, 0.8);
  lead.style.opacity = l;
  lead.style.transform = `translate3d(0,${mix(vh * 0.5, 0, l)}px,0)`;
}

// smooth follow: eases toward the scroll position so motion feels fluid
function loop() {
  current += (target - current) * (reduce ? 1 : 0.12);
  if (Math.abs(target - current) < 0.0004) current = target;
  render(current);
  if (current !== target) requestAnimationFrame(loop);
  else running = false;
}

addEventListener('scroll', readScroll, { passive: true });
addEventListener('resize', () => { readScroll(); render(current); });
readScroll();
render(current = target);
