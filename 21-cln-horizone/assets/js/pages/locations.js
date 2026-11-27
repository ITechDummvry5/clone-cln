hydrateImages();
const $ = (id) => document.getElementById(id);

const svg = d => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const GL = {
  plane: svg('<path d="M10.5 13.5 3 11l1-2 8 .5L16 5a1.8 1.8 0 0 1 3 1.5L15.5 11l.5 8-2 1-2.5-7.5z"/>'),
  desk: svg('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h.01M15 8h.01M9 12h.01M15 12h.01M10 21v-3h4v3"/>'),
  wheel: svg('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/><path d="M12 3v6.5M3.5 15l6-2.5M20.5 15l-6-2.5"/>'),
  ok: svg('<circle cx="12" cy="12" r="9"/><path d="m8 12.5 3 3 5-6"/>'),
  car: svg('<path d="M4 17v-4l2-5.5A2 2 0 0 1 7.9 6h8.2A2 2 0 0 1 18 7.5L20 13v4zM4 17v2M20 17v2M4 13h16M7.5 15h.01M16.5 15h.01"/>'),
};
const cityHref = c => 'location.html?city=' + slug(c[1]);
const BASE_REGIONS = ['Asia-Pacific','Europe','Americas','Middle East & Africa'];
const REGIONS = ['All', ...BASE_REGIONS.filter(r => CITIES.some(c => c[7] === r)), ...[...new Set(CITIES.map(c => c[7]))].filter(r => r && !BASE_REGIONS.includes(r))];   // admin can add regions
let region = 'All', query = '';

function render() {
  closeDetails();
  const q = query.trim().toLowerCase();
  const list = CITIES.filter(c => (region === 'All' || c[7] === region) && (!q || (c[0] + ' ' + c[1]).toLowerCase().includes(q)));
  $('count').textContent = `${list.length} cit${list.length === 1 ? 'y' : 'ies'} · ${list.length * 2} pick-up points`;
  $('cities').innerHTML = list.map(c => `
    <article class="lc"><a class="pic" href="${cityHref(c)}" aria-label="${esc(c[1])} car rental">${img(pic('cities.' + c[8]))}<span class="badge">${c[7]}</span></a>
      <div class="body"><small>${c[0]}</small><h3><a href="${cityHref(c)}">${c[1]}</a></h3><p>${c[2]}</p>
        <div class="pt"><span>${c[3]}</span><em>24 h</em></div><div class="pt"><span>${c[4]}</span><em>07:00–21:00</em></div>
        <div class="foot"><span><b>${c[5]}</b> cars · from <b>${HZC.usd(c[6])}</b>/day</span><button type="button" class="btn det" data-city="${esc(c[1])}" aria-haspopup="dialog" aria-expanded="false">Details</button><a class="btn" href="cars.html?pickup=${encodeURIComponent(c[1])}">See cars</a></div></div>
    </article>`).join('') || (CITIES.length ? '<p class="empty">No city matches that search. Try a country name instead.</p>' : '<p class="empty">There are no locations yet. Please check back soon.</p>');
}
$('tabs').innerHTML = REGIONS.map(r => `<button data-r="${r}" class="${r === 'All' ? 'on' : ''}">${r}<sup>${r === 'All' ? CITIES.length : CITIES.filter(c => c[7] === r).length}</sup></button>`).join('');
$('tabs').onclick = e => { const b = e.target.closest('button'); if (!b) return; region = b.dataset.r; document.querySelectorAll('#tabs button').forEach(x => x.classList.toggle('on', x === b)); render(); };
$('q').oninput = e => { query = e.target.value; render(); };
$('routes').innerHTML = ROUTES.map(r => {
  const u = (a, b) => `cars.html?pickup=${encodeURIComponent(a)}&ret=${encodeURIComponent(b)}`, bits = String(r[2] || '').split('·').map(x => x.trim()).filter(Boolean),
    ctry = bits.length > 1 ? bits[0] : '', km = bits.length > 1 ? bits.slice(1).join(' · ') : bits[0] || '', fee = r[4] > 0 ? esc(r[3]).replace(' one-way fee', ' fee') : 'No fee';
  return `<article class="route"><div class="rt-top"><span class="rt-ctry">${esc(ctry)}</span><span class="rt-fee${r[4] > 0 ? '' : ' free'}">${fee}</span></div>
    <h3 class="rt-names"><span>${esc(r[0])}</span><span class="sr">to</span><span>${esc(r[1])}</span></h3>
    <div class="rt-line" aria-hidden="true"><i class="mk"></i></div><p class="rt-km">${esc(km)}</p>
    <div class="rt-go"><a href="${u(r[0], r[1])}" title="Pick up in ${esc(r[0])}, return in ${esc(r[1])}">From ${esc(r[0])}</a><a href="${u(r[1], r[0])}" title="Pick up in ${esc(r[1])}, return in ${esc(r[0])}">From ${esc(r[1])}</a></div></article>`; }).join('');
// ---- Details popover: opens on hover or focus (mouse, keyboard) and on tap (touch). One popover element, moved to the clicked button.
let pop = null, popBtn = null, pinned = false, closeTimer = 0;
function detailsHtml(c) {
  const [air, town, side, licence] = PLACE[c[1]] || ['', '', 'right', ''];
  const row = (icon, title, addr, note) => `<div class="r"><span class="ic">${icon}</span><div><b>${esc(title)}</b><span>${esc(addr)}</span><small>${note}</small></div></div>`;
  return `<h3>${esc(c[1])}</h3><p class="lead">${esc(c[2])}</p>
    ${row(GL.plane, c[3], air, `Open 24 hours · ${HZC.usd(AIRPORT_FEE)} airport surcharge`)}
    ${row(GL.desk, c[4], town, 'Open 07:00–21:00 · after-hours key box available')}
    <ul><li>${GL.wheel}<span>Drive on the ${side}.</span></li><li>${GL.ok}<span>${esc(licence)}</span></li><li>${GL.car}<span>${c[5]} models available, from ${HZC.usd(c[6])} a day.</span></li></ul>`;
}
function placeDetails() {
  const r = popBtn.getBoundingClientRect(), w = pop.offsetWidth, h = pop.offsetHeight;
  const above = r.top - h - 10 >= 8;                       // prefer above the button, else below
  pop.style.left = Math.max(8, Math.min(r.right - w, innerWidth - w - 8)) + 'px';
  pop.style.top = Math.max(8, Math.min(above ? r.top - h - 10 : r.bottom + 10, innerHeight - h - 8)) + 'px';
}
function openDetails(btn) {
  clearTimeout(closeTimer);
  if (popBtn === btn) return;
  closeDetails();
  const c = CITIES.find(x => x[1] === btn.dataset.city); if (!c) return;
  pop = document.createElement('div'); pop.className = 'lc-pop'; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', c[1] + ' pick-up details');
  pop.innerHTML = detailsHtml(c);
  pop.addEventListener('mouseenter', () => clearTimeout(closeTimer));
  pop.addEventListener('mouseleave', () => { if (!pinned) later(); });
  document.body.appendChild(pop); popBtn = btn; btn.setAttribute('aria-expanded', 'true'); placeDetails();
}
function closeDetails() {
  clearTimeout(closeTimer);
  if (popBtn) popBtn.setAttribute('aria-expanded', 'false');
  if (pop) pop.remove();
  pop = popBtn = null; pinned = false;
}
const later = () => { clearTimeout(closeTimer); closeTimer = setTimeout(closeDetails, 150); };   // short grace so the mouse can travel into the popover
const detBtn = e => e.target.closest && e.target.closest('.det');
$('cities').addEventListener('mouseover', e => { const b = detBtn(e); if (b && matchMedia('(hover:hover)').matches) openDetails(b); });
$('cities').addEventListener('mouseout', e => { const b = detBtn(e); if (b && !pinned && !b.contains(e.relatedTarget)) later(); });
$('cities').addEventListener('focusin', e => { const b = detBtn(e); if (b) openDetails(b); });
$('cities').addEventListener('focusout', e => { const b = detBtn(e); if (b && !pinned) later(); });
$('cities').addEventListener('click', e => {
  const b = detBtn(e); if (!b) return;
  e.stopPropagation();
  if (popBtn === b && pinned) return closeDetails();      // second click closes
  openDetails(b); pinned = true;                           // a click keeps it open until you click elsewhere
});
document.addEventListener('click', e => { if (pop && !pop.contains(e.target)) closeDetails(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDetails(); });
document.addEventListener('currencychange', closeDetails);
window.addEventListener('resize', closeDetails);
window.addEventListener('scroll', closeDetails, true);
render();
