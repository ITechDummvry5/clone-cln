const LISTS = HZFLEET.lists();   // car types, gearboxes and fuels come from Fleet > Lists and defaults in the admin panel
const OPTIONS = {
  type:   ['All', ...LISTS.type],
  trans:  ['Any', ...LISTS.trans],
  fuel:   ['Any', ...LISTS.fuel],
  // Only offer a seats / rating step when at least one car reaches it (nothing is hard-coded: no cars, no steps).
  seats:  ['Any', ...[2, 4, 5, 7].filter(t => FLEET.some(c => c[4] >= t)).map(t => t + '+')],
  rating: ['Any', ...[4.7, 4.8].filter(t => FLEET.some(c => c[5] >= t)).map(t => t + '+')],
};
const DEFAULTS = { type:'All', trans:'Any', fuel:'Any', seats:'Any', rating:'Any' };
let state = { ...DEFAULTS, sort:'rec', view:'grid' };
// Deep links from the home page: cars.html?type=SUV or ?fuel=Electric
{ const u = new URLSearchParams(location.search);
  ['type', 'fuel'].forEach(k => { const v = u.get(k); if (v && OPTIONS[k].includes(v)) state[k] = v; }); }
const $ = (s) => document.querySelector(s);

function renderFilters() {
  document.querySelectorAll('[data-f]').forEach(box => {
    const k = box.dataset.f;
    const grp = box.closest('.fg'); if (grp) grp.style.display = OPTIONS[k].length < 2 ? 'none' : '';   // a filter with nothing to choose from is hidden
    box.innerHTML = OPTIONS[k].map(o => `<button class="chip${state[k] === o ? ' on' : ''}" data-v="${o}">${o}</button>`).join('');
  });
  const side = document.getElementById('filters'); if (side) side.style.display = FLEET.length ? '' : 'none';
  const lay = document.querySelector('.layout'); if (lay) lay.style.gridTemplateColumns = FLEET.length ? '' : '1fr';   // no cars, no filters
}
// A pick-up (and return) place from ?pickup=&ret= limits the list to cars that can do it.
const PU = new URLSearchParams(location.search).get('pickup'), RET = new URLSearchParams(location.search).get('ret');
const PU_OK = typeof SITE !== 'undefined' && SITE.cities.includes(PU);
function reach(c) {
  const cs = HZFLEET.cities(c[0]);
  if (PU_OK && !cs.includes(PU)) return false;
  if (PU_OK && RET && RET !== PU && !(HZFLEET.oneWay(c[0]) && cs.includes(RET) && HZONEWAY.valid(PU, RET))) return false;
  return true;
}
function matches(c) {
  const [, type, trans, fuel, seats, rating] = c;
  return (state.type === 'All' || type === state.type)
    && (state.trans === 'Any' || trans === state.trans)
    && (state.fuel === 'Any' || fuel === state.fuel)
    && (state.seats === 'Any' || seats >= parseInt(state.seats))
    && (state.rating === 'Any' || rating >= parseFloat(state.rating))
    && reach(c);
}
// Search length (from ?from=&to=), default 5 days, used for the "total" in list view
const QS = new URLSearchParams(location.search);
const DAYS = QS.get('from') && QS.get('to') ? Math.max(1, Math.round((new Date(QS.get('to')) - new Date(QS.get('from'))) / 864e5)) : 5;
// Link to a car's page, carrying the search (location, dates) across
const carHref = c => 'car.html?car=' + slug(c[0]) + (location.search ? '&' + location.search.slice(1) : '');
const I = {
  gear: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M7 3v8M12 3v8M17 3v8M7 11h10v4a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3z"/></svg>',
  user: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.500-6 8-6s8 2 8 6"/></svg>',
  bag: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="5" y="8" width="14" height="12" rx="2"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  star: '<svg width="14" height="14" viewBox="0 0 24 24" fill="#e2a21b"><path d="m12 2.500 2.900 6 6.600.9-4.800 4.600 1.200 6.500L12 17.300 6.100 20.500l1.200-6.500L2.500 9.400l6.600-.9z"/></svg>',
  check: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.500" stroke-linecap="round"><path d="m5 12 5 5 9-10"/></svg>',
  shield: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 3 5 6v6c0 4.500 3 7.500 7 9 4-1.500 7-4.500 7-9V6z"/><path d="m9 12 2 2 4-4"/></svg>',
};
const gridCard = c => carCard(c, carHref(c));   // components/car-card.js
const listCard = c => {
  const X = HZFLEET.x(c[0]), feats = X.features && X.features.length ? X.features : FEATURES[c[3] === 'Electric' ? 'Electric' : (FEATURES[c[1]] ? c[1] : '_')];
  const st = HZFORM.stay(DAYS), total = Math.round(c[6] * DAYS * (1 - (st ? st.pct : 0) / 100) * (1 + TAX_RATE));   // base price x days, minus the automatic long-rental rate, + taxes & fees
  return `
    <article class="car lcar" data-href="${carHref(c)}">
      <div class="pic"><span class="tag">${c[1]}</span><img src="${IMG.fleet[c[0]]}" alt="" loading="lazy"></div>
      <div class="mid"><h3><a href="${carHref(c)}">${c[0]}</a></h3>
        <p class="spec">${I.gear}${c[2]} · ${c[3]}${c[7] ? ' · ' + c[7] + ' km' : ''}</p>
        <p class="meta"><span>${I.user}${c[4]}</span><span>${I.bag}${X.bags != null ? X.bags : (BAGS[c[1]] || 3)}</span><span>${I.star}${c[5] || 'New'}</span><span>${(QS.get('from') && QS.get('to') ? HZFLEET.left(c[0], { from: QS.get('from'), ft: QS.get('ft') || '10:00 AM', to: QS.get('to'), tt: QS.get('tt') || '10:00 AM' }) : X.units) || 'Sold out'}${(QS.get('from') && QS.get('to') ? HZFLEET.left(c[0], { from: QS.get('from'), ft: QS.get('ft') || '10:00 AM', to: QS.get('to'), tt: QS.get('tt') || '10:00 AM' }) : X.units) ? ' available' : ''}</span></p>
        <ul class="feat">${feats.map(f => `<li>${I.check}${f}</li>`).join('')}</ul>
        <p class="free">${I.shield}Free cancellation up to 48 h before pick-up</p></div>
      <div class="end"><small>Start from</small><b>${HZC.usd(c[6])}</b><small>/ day</small><small class="tot">${HZC.usd(total)} total · ${DAYS} day${DAYS > 1 ? 's' : ''}</small>${st ? `<small class="tot">${st.label} · ${+st.pct}% off included</small>` : ''}</div>
    </article>`;
};
function renderCars() {
  let list = FLEET.filter(matches);
  if (state.sort === 'lo') list.sort((a, b) => a[6] - b[6]);
  if (state.sort === 'hi') list.sort((a, b) => b[6] - a[6]);
  $('#count').textContent = `${list.length} car${list.length === 1 ? '' : 's'} ${PU_OK ? 'available in ' + PU : 'in the fleet'}`;
  $('#fromPrice').innerHTML = list.length ? `From ${HZC.usd(Math.min(...list.map(c => c[6])))} a day · free cancellation on every car` : '';
  const fleet = $('#fleet');
  fleet.className = state.view === 'list' ? 'grid3 list' : 'grid3';
  fleet.innerHTML = list.map(state.view === 'list' ? listCard : gridCard).join('')
    || (FLEET.length ? '<p class="empty">No cars match these filters. Reset them to see the full fleet.</p>' : '<p class="empty">There are no cars in the fleet yet. Please check back soon.</p>');
}
$('#filters').addEventListener('click', e => {
  const b = e.target.closest('.chip'); if (!b) return;
  state[b.parentElement.dataset.f] = b.dataset.v;
  renderFilters(); renderCars();
});
$('#reset').onclick = () => { state = { ...state, ...DEFAULTS }; renderFilters(); renderCars(); };
$('#sort').onchange = e => { state.sort = e.target.value; renderCars(); };
document.querySelectorAll('.views button').forEach(b => b.onclick = () => {
  state.view = b.dataset.v;
  document.querySelectorAll('.views button').forEach(x => x.classList.toggle('on', x === b));
  renderCars();
});
renderFilters(); renderCars();

// Search summary bar: filled from ?pickup=&from=&to=... (hero search or nav search)
(function () {
  const DT = typeof HZDate !== 'undefined' ? HZDate.DEFAULT_TIME : '10:00 AM';
  const p = new URLSearchParams(location.search), bar = document.querySelector('.bar');
  if (!bar) return;
  if (p.get('pickup')) bar.querySelector('b').textContent = p.get('pickup') + (p.get('ret') ? ' → ' + p.get('ret') : '');
  if (p.get('from') && p.get('to')) {
    const d = s => { const x = new Date(s + 'T00:00'); return `${x.toLocaleDateString('en-US', { weekday: 'short' })}, ${x.getDate()} ${x.toLocaleDateString('en-US', { month: 'short' })}`; };
    const days = Math.max(1, Math.round((new Date(p.get('to')) - new Date(p.get('from'))) / 864e5));
    bar.querySelector('span').textContent = `${d(p.get('from'))}, ${p.get('ft') || DT} → ${d(p.get('to'))}, ${p.get('tt') || DT} · ${days} day${days > 1 ? 's' : ''} · ${p.get('mode') || 'Self-drive'}`;
  }
})();
