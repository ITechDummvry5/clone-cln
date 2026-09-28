// Counter animation + scroll reveal
let observer;

export function animateCounters() {
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    let current = 0;
    const duration = 1600;
    const step = target / (duration / 16);
    const interval = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current).toLocaleString();
      if (current >= target) clearInterval(interval);
    }, 16);
  });
}

export function observeReveal(el) {
  el.classList.add('reveal');
  if (el.dataset.delay) el.style.transitionDelay = el.dataset.delay + 'ms';
  observer.observe(el);
}

export function initReveal() {
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('visible');
      observer.unobserve(el);
      // Once revealed, drop the helper classes so hover effects work normally
      el.addEventListener('transitionend', function done(e) {
        if (e.target !== el || e.propertyName !== 'opacity') return;
        el.classList.remove('reveal', 'visible');
        el.style.transitionDelay = '';
        el.removeEventListener('transitionend', done);
      });
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.service-card, .step').forEach(observeReveal);
}
