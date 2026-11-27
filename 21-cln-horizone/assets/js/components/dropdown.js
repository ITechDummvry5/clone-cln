// Header dropdown panels: one open at a time, close on outside click or Escape.
// Markup: <button data-dd="name"> opens <div class="panel" id="dd-name" hidden>. Load after layout/header.js.
function closeDropdowns() {
  document.querySelectorAll('.panel').forEach(p => {
    p.hidden = true; document.querySelector(`[aria-controls="${p.id}"]`)?.setAttribute('aria-expanded', 'false');
  });
}
(function () {
  document.querySelectorAll('[data-dd]').forEach(b => {
    const panel = document.getElementById('dd-' + b.dataset.dd);
    b.setAttribute('aria-controls', panel.id);
    b.addEventListener('click', e => {
      e.stopPropagation();
      const open = panel.hidden; closeDropdowns();
      panel.hidden = !open; b.setAttribute('aria-expanded', String(open));
    });
  });
  document.addEventListener('click', e => { if (!e.target.closest('.panel')) closeDropdowns(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDropdowns(); });
})();
