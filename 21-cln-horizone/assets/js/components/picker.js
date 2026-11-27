// Replaces plain <select> elements with the same custom list used on the home page.
// Usage: add data-pick to a <select>, or call enhanceSelect(el, { float, compact }).
//   float:   draw the list on top of the page (needed inside scrolling tables)
//   compact: smaller button for table rows and filter bars
// The real select stays in the page (hidden), so code that reads .value or listens for 'change' keeps working.
let hzOpenPicker = null;   // close function of the list that is open right now (only one at a time)
document.addEventListener('click', () => hzOpenPicker && hzOpenPicker());
document.addEventListener('keydown', e => { if (e.key === 'Escape' && hzOpenPicker) hzOpenPicker(); });
window.addEventListener('scroll', e => { if (hzOpenPicker && !(e.target.closest && e.target.closest('.pop'))) hzOpenPicker(); }, true);
window.addEventListener('resize', () => hzOpenPicker && hzOpenPicker());

function enhanceSelect(sel, opts = {}) {
  if (!sel || sel.dataset.enh) return;
  sel.dataset.enh = '1'; sel.classList.add('enh'); sel.tabIndex = -1;
  const host = document.createElement('div');
  host.className = 'cd-host' + (sel.closest('.form') ? '' : ' cd-inline') + (opts.compact ? ' cd-sm' : '');
  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'cd-pick'; btn.setAttribute('aria-haspopup', 'listbox'); btn.setAttribute('aria-expanded', 'false');
  if (sel.getAttribute('aria-label')) btn.setAttribute('aria-label', sel.getAttribute('aria-label'));
  btn.innerHTML = '<span></span>';
  sel.after(host); host.append(btn, sel);
  let pop = null;
  const label = () => { const o = sel.options[sel.selectedIndex]; btn.firstElementChild.textContent = o ? o.textContent : ''; btn.classList.toggle('ph', !sel.value); };
  const close = () => { if (pop) { pop.remove(); pop = null; btn.setAttribute('aria-expanded', 'false'); } if (hzOpenPicker === close) hzOpenPicker = null; };
  btn.addEventListener('click', e => {
    e.stopPropagation();
    if (pop) return close();
    if (hzOpenPicker) hzOpenPicker();
    pop = document.createElement('div'); pop.className = 'pop list' + (opts.compact ? ' cd-sm' : '');
    pop.addEventListener('click', ev => ev.stopPropagation());
    [...sel.options].forEach(o => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'opt' + (o.value === sel.value ? ' on' : ''); b.textContent = o.textContent; b.dataset.v = o.value;
      b.onclick = () => { sel.value = o.value; label(); close(); sel.dispatchEvent(new Event('change', { bubbles: true })); };
      pop.appendChild(b);
    });
    if (opts.float) {
      document.body.appendChild(pop);
      const r = btn.getBoundingClientRect();
      Object.assign(pop.style, { position: 'fixed', right: 'auto', zIndex: 90, minWidth: Math.max(r.width, 150) + 'px' });
      const h = Math.min(pop.scrollHeight, 280), below = innerHeight - r.bottom;
      pop.style.top = (below < h + 16 && r.top > below ? r.top - h - 6 : r.bottom + 6) + 'px';
      pop.style.left = Math.max(8, Math.min(r.left, innerWidth - pop.offsetWidth - 8)) + 'px';
    } else host.appendChild(pop);
    btn.setAttribute('aria-expanded', 'true'); hzOpenPicker = close;
    const on = pop.querySelector('.on'); if (on) pop.scrollTop = on.offsetTop - pop.clientHeight / 2 + 18;
  });
  sel.addEventListener('change', label);
  new MutationObserver(label).observe(sel, { childList: true });   // options filled in by another script later
  if (sel.form) sel.form.addEventListener('reset', () => setTimeout(label));
  label();
}
document.querySelectorAll('select[data-pick]').forEach(s => enhanceSelect(s));
