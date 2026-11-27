// Home page: content data + rendering. Images come from data/images.js (via core/media.js).
// Everything below that describes cars, cities and guests is built from the admin's data (fleet, locations, bookings, reviews).
// Nothing is hard-coded: with no data the matching sections hide themselves.
const CARS = [...FLEET].sort((a, b) => b[5] - a[5]).slice(0, 8).map(c => [c[0], c[1], [c[2], c[3], c[7] ? c[7] + ' km' : ''].filter(Boolean).join(' · '), c[6], c[0]]);
const CAT_DEF = [['SUV', c => c[1] === 'SUV', 'suv'], ['Sedan', c => c[1] === 'Sedan', 'sedan'], ['Hatchback', c => c[1] === 'Hatchback', 'hatchback'], ['Electric', c => c[3] === 'Electric', 'electric'], ['Minivan & 7-seat', c => c[1] === 'Minivan', 'minivan'], ['Sport & convertible', c => c[1] === 'Sport' || c[1] === 'Convertible', 'sport']];
const CATS = CAT_DEF.map(([n, f, k]) => { const m = FLEET.filter(f); return m.length ? [n, m.length, Math.min(...m.map(c => c[6])), k] : null; }).filter(Boolean);
const STEPS = [['Tell us where and when','Pick a city, choose your dates, and add a driver if you want one.'],['Compare the real price','Every quote shows protection, fees and taxes up front. The total at checkout is the total you pay.'],['Confirm and drive','Cancel free up to 48 hours before pick-up. Check in from your phone and collect the keys.']];
// Featured cities follow the admin's Locations list (these are only preferred when they exist).
const CITIES = (() => {
  const all = HZLOC.all(), pref = ['Bali', 'Munich', 'Los Angeles', 'Tokyo'];
  return [...all.filter(l => pref.includes(l.city)), ...all.filter(l => !pref.includes(l.city))].slice(0, 4).map(l => [l.country, l.city, l.cars, l.from, l.key]);
})();
const CITY_LINKS = SITE.cities;
// Deals come from Admin > Deals: active, not-yet-expired ones only (the big banner deal first), at most three.
const DEALS = HZDEALS.home(3);
const ROWS = [['Free cancellation','Cancel up to 48 hours before pick-up and get every cent back.'],['No hidden fees','Taxes, young-driver charges and airport surcharges are in the first price you see.'],['24/7 roadside support','Real people answer day or night, in eleven languages.']];
const RATED = FLEET.filter(c => c[5] > 0), AVG = RATED.length ? RATED.reduce((t, c) => t + c[5], 0) / RATED.length : 0;
const DONE = typeof HZ !== 'undefined' ? HZ.bookings().filter(b => b.status === 'completed').length : 0;
const STATS = [[String(FLEET.length),'Models in the fleet'],[String(SITE.cities.length * 2),'Pick-up points in ' + SITE.cities.length + (SITE.cities.length === 1 ? ' city' : ' cities')],[AVG ? AVG.toFixed(1) : '–','Average guest rating'],[String(DONE),'Journeys completed']];
const REVIEWS = HZFLEET.reviews().filter(r => r.text).slice(0, 3).map(r => [r.text, r.name, [r.city, r.car].filter(Boolean).join(' · '), r.stars]);
const FAQ = [['Is the price I see the price I pay?','Yes. Taxes, surcharges and fees are in the total shown before you book.'],['What do I need to pick up a car?','A full driving licence held for at least twelve months, a payment card in the main driver’s name, and a passport or national ID. Some countries also need an International Driving Permit.'],['Is insurance included in the price?','Basic protection is included. You can upgrade to lower your excess at checkout.'],['How late can I cancel?','Up to 48 hours before pick-up, free of charge.'],['How old do I need to be?','Most locations rent to drivers aged 21 and over. Young-driver fees may apply under 25.']];

const $ = (id) => document.getElementById(id);

hydrateImages();

function renderCars(type = 'All') {
  $('carGrid').innerHTML = CARS.filter(c => type === 'All' || c[1] === type).map(c => `
    <article class="car" data-href="car.html?car=${slug(c[0])}"><small>${c[1]}</small><h3>${c[0]}</h3><small>${c[2]}</small>
      <div class="pic">${img(IMG.fleet[c[4]])}</div>
      <div class="row"><div><span>From</span><b>${HZC.usd(c[3])} <span>/ day</span></b></div><a class="go" href="car.html?car=${slug(c[0])}" aria-label="View ${c[0]}">→</a></div>
    </article>`).join('');
}
$('carChips').innerHTML = ['All', ...new Set(CARS.map(c => c[1]))].map((t, i) => `<button class="chip${i ? '' : ' on'}">${t}</button>`).join('');
$('carChips').addEventListener('click', e => {
  if (!e.target.matches('.chip')) return;
  $('carChips').querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === e.target));
  renderCars(e.target.textContent);
});
renderCars();

const CAT_LINK = { 'SUV': 'type=SUV', 'Sedan': 'type=Sedan', 'Hatchback': 'type=Hatchback', 'Electric': 'fuel=Electric', 'Minivan & 7-seat': 'type=Minivan', 'Sport & convertible': 'type=Sport' };
$('catGrid').innerHTML = CATS.map(c => `<a class="cat" href="cars.html?${CAT_LINK[c[0]] || ''}"><div class="pic">${img(IMG.categories[c[3]])}</div><b>${c[0]}</b><span>${c[1]} models · from ${HZC.usd(c[2])}/day</span></a>`).join('');
$('steps').innerHTML = STEPS.map((s, i) => `<div class="step"><span>${i + 1}</span><h3>${s[0]}</h3><p>${s[1]}</p></div>`).join('');
$('cityGrid').innerHTML = CITIES.map(c => `<a class="city" href="cars.html?pickup=${encodeURIComponent(c[1])}">${img(IMG.cities[c[4]])}<div><small>${c[0]}</small><b>${c[1]}</b><span>${c[2]} cars · from ${HZC.usd(c[3])}/day</span></div></a>`).join('');
$('cityLinks').innerHTML = CITY_LINKS.map(c => `<a href="cars.html?pickup=${encodeURIComponent(c)}">Car rental in ${c}</a>`).join('');
$('dealGrid').innerHTML = DEALS.map(d => { const src = HZDEALS.imgUrl(d);
  return `<article class="deal${src ? '' : ' noimg'}">${src ? img(src) : ''}<small>${esc(d.title)}${d.validUntil ? ' · until ' + HZDEALS.fmtDate(d.validUntil) : ''}</small><h3>${esc(d.headline)}</h3><button class="code" data-code="${esc(d.code)}">${esc(d.code)}</button></article>`; }).join('');
$('dealGrid').addEventListener('click', e => {
  const b = e.target.closest('.code'); if (!b) return;
  navigator.clipboard?.writeText(b.dataset.code); b.textContent = 'Copied';
  setTimeout(() => b.textContent = b.dataset.code, 1500);
});
$('rows').innerHTML = ROWS.map(r => `<div><b>${r[0]}</b><p>${r[1]}</p></div>`).join('');
$('stats').innerHTML = STATS.map(s => `<div><b>${s[0]}</b><span>${s[1]}</span></div>`).join('');
$('reviews').innerHTML = REVIEWS.map(r => `<article class="rev"><div><div class="stars">${'★'.repeat(r[3] || 5)}</div><p style="margin-top:10px">${esc(r[0])}</p></div><div class="who"><div style="display:grid;place-items:center;background:var(--soft, #eee);font-weight:600">${esc((r[1] || '?').trim().charAt(0).toUpperCase())}</div><div><b>${esc(r[1])}</b><small>${esc(r[2])}</small></div></div></article>`).join('');
// Sections with nothing to show are hidden instead of showing made-up content.
const hideSec = (id, empty) => { const sec = $(id).closest('section'); if (sec) sec.hidden = !!empty; };
hideSec('dealGrid', !DEALS.length); hideSec('carGrid', !CARS.length); hideSec('catGrid', !CATS.length); hideSec('cityGrid', !CITIES.length); hideSec('reviews', !REVIEWS.length);
{ const n = SITE.cities.length;
  $('locSub').textContent = `${n} cit${n === 1 ? 'y' : 'ies'}, one simple booking. Pick up in one city and drop off in another on select routes.`;
  $('revAvg').innerHTML = AVG ? `${AVG.toFixed(1)} <span class="stars">★</span>` : '';
  $('revSub').textContent = `${REVIEWS.length} recent review${REVIEWS.length === 1 ? '' : 's'} from guests, left after their trip.`; }
$('faq').innerHTML = FAQ.map(f => `<details><summary>${f[0]}</summary><p>${f[1]}</p></details>`).join('');

// Hero search bar: custom date and list pickers (instead of the browser's default ones)
(function () {
  const today = HZDate.today();
  const { add, fmtUS: fmt, iso, TIMES: times } = HZDate;
  const s = { loc: '', ret: '', from: add(today, 2), to: add(today, 7), ft: HZDate.DEFAULT_TIME, tt: HZDate.DEFAULT_TIME };
  const sync = () => {
    $('bLoc').textContent = s.loc || 'City, airport or station';
    $('bRet').textContent = s.ret || 'Return location';
    $('bFrom').textContent = fmt(s.from); $('bTo').textContent = fmt(s.to);
    $('bFromT').textContent = s.ft; $('bToT').textContent = s.tt;
  };

  let pop = null;
  const close = () => { if (pop) pop.remove(); pop = null; };
  function show(host, cls, wire) {
    close(); pop = document.createElement('div'); pop.className = 'pop ' + cls;
    pop.addEventListener('click', e => e.stopPropagation());   // clicks inside (e.g. month arrows) must not count as outside clicks
    host.appendChild(pop); wire(pop);
    const r = pop.getBoundingClientRect();
    if (r.right > innerWidth - 8) { pop.style.left = 'auto'; pop.style.right = '0'; }
  }
  function list(host, items, cur, pick) {
    show(host, 'list', p => {
      p.innerHTML = items.map(i => { const v = Array.isArray(i) ? i[0] : i, l = Array.isArray(i) ? i[1] : i; return `<button type="button" class="opt${v === cur ? ' on' : ''}" data-v="${v}">${l}</button>`; }).join('');
      p.onclick = e => { const b = e.target.closest('.opt'); if (b) { pick(b.dataset.v); sync(); close(); } };
      const on = p.querySelector('.on'); if (on) p.scrollTop = on.offsetTop - p.clientHeight / 2 + 18;
    });
  }
  function calendar(host, which) {
    show(host, '', p => HZDate.calendar(p, {
      value: which === 'from' ? s.from : s.to,
      from: s.from, to: s.to,
      min: which === 'from' ? today : add(s.from, 1),
      onPick: x => {
        if (which === 'from') { s.from = x; if (s.to <= x) s.to = add(x, 1); } else s.to = x;
        sync(); close();
        if (which === 'from') calendar($('bTo').closest('.f'), 'to');   // move on to the return date
      },
    }));
  }
  const on = (id, fn) => $(id).addEventListener('click', e => { e.stopPropagation(); fn(); });
  const cities = ['Any location', ...CITY_LINKS];
  on('bLoc', () => list($('bLoc').closest('.f'), cities, s.loc || 'Any location', v => { s.loc = v === 'Any location' ? '' : v; if (s.ret && !HZONEWAY.valid(s.loc, s.ret)) s.ret = ''; }));   // a new pick-up can make the old return place unreachable
  // Return places come from the one-way routes (services/oneway.js), never the whole city list
  on('bRet', () => {
    const e = x => HZ.esc(x), opts = s.loc ? HZONEWAY.from(s.loc, CITY_LINKS) : [], host = $('bRet').parentElement;
    if (!opts.length) return show(host, 'list', p => { p.innerHTML = `<div class="opt" style="cursor:default;opacity:.7">${s.loc ? 'No one-way returns from ' + e(s.loc) + '. Return it to the same place.' : 'Choose a pick-up location first'}</div>`; });
    list(host, opts.map(c => { const f = HZONEWAY.fee(s.loc, c); return [c, `${e(c)} <small>· ${f > 0 ? '+' + HZC.txt(f, 2) : 'No fee'}</small>`]; }), s.ret, v => s.ret = v);
  });
  on('bFrom', () => calendar($('bFrom').closest('.f'), 'from'));
  on('bTo', () => calendar($('bTo').closest('.f'), 'to'));
  on('bFromT', () => list($('bFromT').closest('.f'), times, s.ft, v => s.ft = v));
  on('bToT', () => list($('bToT').closest('.f'), times, s.tt, v => s.tt = v));
  document.addEventListener('click', e => { if (!e.target.closest('.pop')) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  $('sDiff').onchange = e => { $('bRet').hidden = !e.target.checked; close(); };
  $('search').onsubmit = e => {
    e.preventDefault();
    const q = new URLSearchParams({ pickup: s.loc, from: iso(s.from), ft: s.ft, to: iso(s.to), tt: s.tt, mode: document.querySelector('[name=mode]:checked').value });
    if ($('sDiff').checked && s.ret) q.set('ret', s.ret);
    location.href = 'cars.html?' + q;
  };
  sync();
})();
