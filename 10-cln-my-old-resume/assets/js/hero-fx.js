/* Hero extras: count-up numbers when chapter 3 enters */
(function () {
  const root = document.querySelector('.sh');
  if (!root || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c2 = root.querySelector('.sh-c.c2');
  if (!c2) return;
  const items = [...c2.querySelectorAll('.sh-stats b')].map(el => ({ el, end: parseFloat(el.textContent) || 0 }));
  let raf = 0, was = false;

  function run() {
    cancelAnimationFrame(raf);
    const t0 = performance.now(), dur = 1400;
    const step = now => {
      const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      items.forEach(i => { i.el.textContent = Math.round(i.end * e); });
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }

  new MutationObserver(() => {
    const on = c2.classList.contains('on');
    if (on && !was) run();
    if (!on && was) { cancelAnimationFrame(raf); items.forEach(i => { i.el.textContent = i.end; }); }
    was = on;
  }).observe(c2, { attributes: true, attributeFilter: ['class'] });
})();
