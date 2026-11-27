// Car page. Reads ?car=<slug> (plus the search carried over from the cars page) and renders into #car.
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const P = new URLSearchParams(location.search);
const MAKES = ['Land Rover', 'Volkswagen', 'Toyota', 'Tesla', 'Porsche', 'BMW', 'Genesis', 'Audi', 'MINI', 'Kia', 'Volvo', 'Ford', 'Jeep', 'Fiat'];
const money = n => HZC.txt(n, 2);   // display currency, plain text
// Price tokens in line-item labels: shown in the display currency, saved to bookings in USD
const T = n => '\u27e6' + n + '\u27e7';
const showLbl = s => s.replace(/\u27e6([\d.]+)\u27e7/g, (_, n) => HZC.txt(+n));
const usdLbl = s => s.replace(/\u27e6([\d.]+)\u27e7/g, '$$$1');
const { iso, add: addDays, parse: pd, fmtShort: dstr, TIMES } = HZDate;   // shared date helpers: components/date-picker.js

const svg = (d, s = 16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const GL = {
  user: svg('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-6 8-6s8 2 8 6"/>', 18),
  bag: svg('<rect x="5" y="8" width="14" height="12" rx="2"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>', 18),
  door: svg('<path d="M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17M6 21h12M14 12h.01"/>', 18),
  gear: svg('<path d="M7 3v8M12 3v8M17 3v8M7 11h10v4a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3z"/>', 18),
  fuel: svg('<path d="M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M5 21h10M15 9h2a2 2 0 0 1 2 2v6a1 1 0 0 0 2 0V8l-3-3M8 8h4"/>', 18),
  snow: svg('<path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9"/>', 18),
  drive: svg('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3v6M3.5 15l5.5-3M20.5 15l-5.5-3"/>', 18),
  gauge: svg('<path d="M4 16a8 8 0 1 1 16 0"/><path d="M12 16l4-5"/>', 18),
  check: svg('<path d="m5 12 5 5 9-10"/>', 14),
  shield: svg('<path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z"/><path d="m9 12 2 2 4-4"/>', 18),
  headset: svg('<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1"/><rect x="17" y="14" width="4" height="6" rx="1"/>', 18),
  cal: svg('<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>', 18),
  info: svg('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>', 16),
  alert: svg('<circle cx="12" cy="12" r="9.5"/><path d="M12 7.5v5.5"/><circle cx="12" cy="16.6" r=".6" fill="currentColor"/>', 18),
  share: svg('<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6"/>', 14),
  plus: svg('<path d="M12 5v14M5 12h14"/>', 16),
  arrow: '→',
};

// Late-return rules come from Admin > Setup > Pricing rules > Late-return charges.
function lateText(car) {
  const l = HZ.policyFor({ car, type: (FLEET.find(x => x[0] === car) || [])[1] });
  if (!l.on) return 'There is no late-return fee. Please still tell the desk if you are running behind so the next guest isn’t kept waiting.';
  return `${HZ.lateSummary(v => HZC.usd(v), l)} Running behind? Tell us from My bookings and we will hold the car for you.`;
}
const POLICIES = [
  ['Fuel and charging', 'Pick up full, return full. Electric cars are handed over with at least 80% charge and should come back with at least 20%. Fuel is otherwise charged at cost plus a small service fee.'],
  ['Deposit and payment', 'A refundable security deposit is held on the main driver’s card at pick-up and released within seven days of return. You pay the rental total at booking; extras added at the desk are charged on return.'],
  ['Driver requirements', 'A full driving licence held for at least twelve months, a payment card in the main driver’s name, and a passport or national ID. Drivers under 25 pay a daily young-driver fee.'],
  ['Late returns', () => lateText(c[0])],
  ['Cancellation', 'Cancel free up to 48 hours before pick-up and get every cent back. Inside 48 hours, the first day is charged.'],
  ['Travel across borders', 'Cross-border travel is allowed in neighbouring countries on request. Tell the desk at pick-up so we can add the right cover and paperwork.'],
];
// Sample reviews, shared by every car for now. Swap in real ones per car when you have them.
const REVIEWS = [
  ['Sofia L.', 'Birmingham', '28 Jul 2026', 'Our flight landed two hours late and the desk still had the car waiting. Great service.'],
  ['James O.', 'Dubai', '25 Jul 2026', 'Everything worked, nothing rattled, and the price was the lowest I found for the week.'],
  ['Hana K.', 'Jeju Island', '25 Jun 2026', 'Booked the day before and the price did not change at the desk. That alone makes me a repeat customer.'],
  ['James O.', 'Glasgow', '15 Jun 2026', 'Had a minor scratch noted at pick-up and they noted it on the handover form. No arguments at return.'],
  ['Maya A.', 'Bali', '02 Jun 2026', 'Handover took five minutes and the car was spotless. Easy return, too.'],
  ['Tomas R.', 'Munich', '19 May 2026', 'One-way to Berlin with no surprise fee. The price on the search page was the price on the invoice.'],
];
// Protection plans, extras, driver options, taxes and times come from Admin > Forms (see services/booking-form.js).
const FM = { drv: HZFORM.driver(), tax: HZFORM.tax(), opt: HZFORM.options(), ls: HZFORM.longstay() };
const PROT = HZFORM.protection().map(p => [p.name, +p.price > 0 ? '+' + HZC.usd(+p.price) + '/day' : 'Included', +p.price,
  [p.excess === null || p.excess === undefined || p.excess === '' ? '' : (+p.excess > 0 ? HZC.usd(+p.excess) + ' excess' : 'Zero excess'), esc(p.covers || '')].filter(Boolean).join(' · '), p.recommended ? 'Recommended' : '']);
const EXTRAS = HZFORM.extras().map(x => [x.name, +x.price, x.kind === 'count' ? 'sel' : 'chk', Math.max(1, +x.max || 3)]);

// The search (location, dates) is carried over from the cars page; keep it on links to other cars and back
const Q = new URLSearchParams(location.search); Q.delete('car');
const carry = Q.toString();
const backHref = 'cars.html' + (carry ? '?' + carry : '');
const carHref = x => 'car.html?car=' + slug(x[0]) + (carry ? '&' + carry : '');

const root = $('#car');
const c = FLEET.find(x => slug(x[0]) === P.get('car'));
if (!c) {
  document.title = 'Car not found – Horizone';
  root.innerHTML = '<div class="crumbs"><a href="index.html">Home</a> › <a href="cars.html">Cars</a></div><div id="nf"></div>';
  isoNotFound(document.getElementById('nf'), {          // components/isometric.js
    eyebrow: 'Car not found', title: 'We couldn’t find that car',
    text: 'The link may be old, or the car is no longer in the fleet. Browse the full fleet instead.',
    actions: [['Browse cars', 'cars.html'], ['See locations', 'locations.html', 'ghost']],
  });
} else render(c);

function render(c) {
  const [name, type, trans, fuel, seats, rating, price, range] = c;
  const [doors, drive, deposit, minAge, reviewCount, year, intro] = DETAIL[name];
  const X = HZFLEET.x(name), make = X.make || MAKES.find(m => name.startsWith(m)) || name.split(' ')[0], mine = X.mine || [], seedN = X.seedN || 0;
  const ev = fuel === 'Electric';
  const feats = [...(X.features && X.features.length ? X.features : FEATURES[ev ? 'Electric' : (FEATURES[type] ? type : '_')]), `${seats} seats · ${doors} doors`];
  const starStr = n => '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n)), stars = starStr(rating);
  const rtxt = rating ? rating.toFixed(1) : 'New';
  const hasPh = typeof ph === 'function';
  // Gallery: the first image is the fleet image from images.js. Replace the other four with real photos later.
  const gallery = [
    IMG.fleet[name],
    ...['Front', 'Interior', 'Rear', 'Detail'].map((l, i) => (X.photos && X.photos[i]) || (hasPh ? ph(`${name} · ${l}`, ['#dedede', '#d2d2d2', '#e3e3e3', '#d8d8d8'][i]) : IMG.fleet[name])),
  ];
  const sims = FLEET.filter(x => x[0] !== name)
    .sort((a, b) => (b[1] === type) - (a[1] === type) || Math.abs(a[6] - price) - Math.abs(b[6] - price)).slice(0, 4);
  const today = HZDate.today();
  const from = P.get('from') || iso(addDays(today, 2)), to = P.get('to') || iso(addDays(today, 7));
  const cities = HZFLEET.cities(name), oneWay = HZFLEET.oneWay(name);
  const cityOpts = sel => '<option value="">Choose a location</option>' + cities.map(x => `<option${x === sel ? ' selected' : ''}>${x}</option>`).join('');
  const timeOpts = sel => TIMES.map(t => `<option${t === sel ? ' selected' : ''}>${t}</option>`).join('');
  const startLoc = cities.includes(P.get('pickup')) ? P.get('pickup') : '', startRet = startLoc && cities.includes(P.get('ret')) && HZONEWAY.valid(startLoc, P.get('ret')) ? P.get('ret') : '';
  const startFt = TIMES.includes(P.get('ft')) ? P.get('ft') : HZDate.DEFAULT_TIME, startTt = TIMES.includes(P.get('tt')) ? P.get('tt') : HZDate.DEFAULT_TIME;
  const withDriver = P.get('mode') === 'With driver';
  const specs = [[GL.user, `${seats} seats`, 'Passengers'], [GL.bag, `${X.bags != null ? X.bags : (BAGS[type] || 3)}`, 'Large bags'], [GL.door, `${doors} doors`, 'Body'], [GL.gear, trans, 'Gearbox'],
    [GL.fuel, fuel, 'Fuel'], [GL.snow, 'Air-con', 'Climate'], [GL.drive, drive, 'Drivetrain'], [GL.gauge, 'Unlimited', 'Mileage']];
  const dist = [.83, .12, .03, .01, .01];
  const shortName = n => { const p = String(n || 'Guest').trim().split(/\s+/); return p.length > 1 ? p[0] + ' ' + p[p.length - 1][0] + '.' : p[0]; };
  const dshort = iso => new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const revItems = [...mine.map(r => ({ n: shortName(r.name), c: r.city || 'Horizone guest', d: dshort(r.created), s: r.stars, t: r.text })),
    ...(seedN > 0 ? REVIEWS.map(r => ({ n: r[0], c: r[1], d: r[2], s: 5, t: r[3] })) : [])];
  const counts = [5, 4, 3, 2, 1].map((st, i) => seedN * dist[i] + mine.filter(r => r.stars === st).length), total = counts.reduce((a, b) => a + b, 0) || 1;

  document.title = `${name} – Horizone`;
  root.innerHTML = `
  <div class="crumbs"><a href="index.html">Home</a> › <a href="${backHref}">Cars</a> › ${name}</div>
  <div class="cd">
   <div>
    <div class="cd-main"><span class="cd-badge">${type}</span><img id="mainImg" src="${gallery[0]}" alt="${name}"></div>
    <div class="cd-thumbs" id="thumbs">${gallery.map((g, i) => `<button class="${i ? '' : 'on'}" data-src="${g}" aria-label="Photo ${i + 1}"><img src="${g}" alt="" loading="lazy"></button>`).join('')}</div>

    <div class="cd-title">
      <span class="cd-eye">${make} · ${year}</span>
      <h1>${name}</h1>
      <p>or similar ${type.toLowerCase()} · you’ll get this model or one of equal spec</p>
      <div class="cd-meta"><div class="r"><span class="stars">${stars}</span><b>${rtxt}</b><u>${reviewCount ? reviewCount + ' reviews' : 'No reviews yet'}</u></div>
        <button class="cd-share" id="share">${GL.share}Share</button></div>
    </div>

    <div class="cd-specs">${specs.map(s => `<div>${s[0]}<p><b>${s[1]}</b><span>${s[2]}</span></p></div>`).join('')}</div>

    <div class="cd-tabs" id="tabs"><button data-t="over">Overview</button><button data-t="feat">Features</button><button data-t="incl">What’s included</button><button data-t="pick">Pick-up</button><button data-t="pol">Policies</button><button data-t="rev">Reviews</button></div>

    <section class="cd-blk" id="over"><h2>Overview</h2><p class="cd-lead">${intro}</p>
      <div class="cd-facts">
        <div><span>Security deposit</span><b>${HZC.usd(deposit)}</b><small>held, not charged</small></div>
        <div><span>Minimum driver age</span><b>${minAge}</b><small>under-25s pay a daily young-driver fee</small></div>
        <div><span>${ev ? 'Range' : 'Fuel policy'}</span><b>${ev ? range + ' km' : 'Full-to-full'}</b><small>${ev ? 'on a full charge' : 'return it as full as you found it'}</small></div>
        <div><span>Available in</span><b>${cities.length || 14} cities</b><small>${cities.slice(0, 3).join(', ')}…</small></div>
      </div></section>

    <section class="cd-blk" id="feat"><h2>Features</h2><ul class="cd-feat">${feats.map(f => `<li>${GL.check}${f}</li>`).join('')}</ul></section>

    <section class="cd-blk" id="incl"><h2>What’s included in every rental</h2><div class="cd-incl">
      <div>${GL.gauge}<p><b>Unlimited mileage</b><span>Drive as far as the trip takes you.</span></p></div>
      <div>${GL.shield}<p><b>Collision &amp; theft cover</b><span>Every rental includes basic protection. Upgrade it in the booking panel to reduce your excess.</span></p></div>
      <div>${GL.headset}<p><b>24/7 roadside assistance</b><span>One number, eleven languages, anywhere on the road.</span></p></div>
      <div>${GL.cal}<p><b>Free cancellation</b><span>Up to 48 hours before pick-up, refunded in full.</span></p></div></div></section>

    <section class="cd-blk" id="pick"><h2>Pick-up &amp; return</h2>
      <p class="cd-note" id="pickNote">${GL.info}<span>Choose a pick-up location in the booking panel to see desk details, opening hours and directions.</span></p>
      <p class="cd-label">Available in</p><div class="chips">${cities.map(x => `<a class="chip" href="cars.html?pickup=${encodeURIComponent(x)}">${x}</a>`).join('')}</div></section>

    <section class="cd-blk" id="pol"><h2>Rental policies</h2>${POLICIES.map(p => `<details class="cd-pol"><summary>${p[0]}</summary><p>${typeof p[1] === 'function' ? p[1]() : p[1]}</p></details>`).join('')}</section>

    <section class="cd-blk" id="rev"><div class="cd-rhead"><h2>Reviews</h2><div class="r"><span class="n">${rtxt}</span><span class="stars">${stars}</span><small>${reviewCount ? reviewCount + ' verified trips' : 'No reviews yet'}</small></div></div>
      ${revItems.length ? `<div class="cd-rgrid"><div class="cd-bars">${counts.map((n, i) => `<div><span>${5 - i} ★</span><i><s style="width:${n / total * 100}%"></s></i><span>${Math.round(n)}</span></div>`).join('')}</div>
        <div id="revs">${revItems.map((r, i) => `<div class="cd-rev"${i > 3 ? ' hidden' : ''}><div class="w"><span class="av">${HZ.esc(r.n[0] || '?')}</span><div><b>${HZ.esc(r.n)}</b><small>${HZ.esc(r.c)} · ${HZ.esc(r.d)}</small></div><span class="stars">${starStr(r.s)}</span></div>${r.t ? `<p>${HZ.esc(r.t)}</p>` : ''}</div>`).join('')}
          ${revItems.length > 4 ? '<div class="cd-more"><button class="btn ghost" id="moreRev">Show more reviews</button></div>' : ''}</div></div>`
        : '<p class="cd-note">' + GL.info + '<span>No reviews yet. Guests can rate this car from their account after a trip.</span></p>'}</section>
   </div>

   <aside class="cd-book" id="book">
     <div class="cd-price"><b>${HZC.usd(price)}</b> <span>/ day</span></div>
     <p class="cd-total"><b id="bTot"></b><small>incl. taxes &amp; fees</small></p>

     <span class="cd-l">Pick-up location</span>
     <div class="cd-host"><button type="button" class="cd-pick" id="pLoc" aria-haspopup="listbox" aria-expanded="false"><span></span></button><input type="hidden" id="bLoc" value="${startLoc}"></div>
     ${!FM.opt.oneWay ? '' : oneWay ? `<label class="cd-check"><input type="checkbox" id="bDiff"${startRet ? ' checked' : ''}>Return to a different location</label>
     <div class="cd-host" id="bRetW" style="margin-top:8px"${startRet ? '' : ' hidden'}><button type="button" class="cd-pick" id="pRet" aria-haspopup="listbox" aria-expanded="false"><span></span></button><input type="hidden" id="bRet" value="${startRet}"></div>
     <div class="cd-nodiff" id="oneNote" hidden></div>`
       : `<label class="cd-check cd-off"><input type="checkbox" disabled>Return to a different location</label>
     <div class="cd-late-hint cd-nodiff"><span class="cd-late-label">One-way returns</span>${HZ.eyeBtn('data-note-pop data-note-msg="This car can’t be returned to a different location. Please return it where you picked it up."', 'About one-way returns')}</div>`}

     <div class="cd-two">
       <div class="cd-host"><span class="cd-l">Pick-up</span><button type="button" class="cd-pick dt" id="pFrom" aria-haspopup="dialog" aria-expanded="false"><span></span></button><button type="button" class="cd-pick" id="pFromT" title="Pick-up time" aria-haspopup="listbox" aria-expanded="false"><span></span></button><input type="hidden" id="bFrom" value="${from}"><input type="hidden" id="bFromT" value="${startFt}"></div>
       <div class="cd-host"><span class="cd-l">Return</span><button type="button" class="cd-pick dt" id="pTo" aria-haspopup="dialog" aria-expanded="false"><span></span></button><button type="button" class="cd-pick" id="pToT" title="Return time" aria-haspopup="listbox" aria-expanded="false"><span></span></button><input type="hidden" id="bTo" value="${to}"><input type="hidden" id="bToT" value="${startTt}"></div>
     </div>
     ${HZ.policyFor({ car: c[0], type: c[1] }).on ? `<div class="cd-late-hint"><span class="cd-late-label">Late-return grace</span>${HZ.eyeBtn(`data-late-list data-late-car="${esc(c[0])}" data-late-type="${esc(c[1])}"`, 'View late-return policy')}${HZFORM.late().rules.some(r => r.by === 'city') ? '<small>Location-specific rules may apply.</small>' : ''}</div>` : ''}
     ${FM.drv.chauffeur.on ? `<div class="segc"><label><input type="radio" name="mode" value="Self-drive"${withDriver ? '' : ' checked'}><span>Self-drive</span></label><label><input type="radio" name="mode" value="With driver"${withDriver ? ' checked' : ''}><span>With driver<small>${HZC.usd(+FM.drv.chauffeur.price)}/day</small></span></label></div>` : '<input type="radio" name="mode" value="Self-drive" checked hidden>'}

     <span class="cd-l">Protection</span>
     ${PROT.map((p, i) => `<label class="cd-opt${i ? '' : ' on'}"><input type="radio" name="prot" value="${p[2]}" data-n="${esc(p[0])}"${i ? '' : ' checked'}><span class="t"><span class="row"><span>${esc(p[0])}${p[4] ? `<span class="cd-rec">${p[4].toUpperCase()}</span>` : ''}</span><span>${p[1]}</span></span><small>${p[3]}</small></span></label>`).join('')}

     <span class="cd-l">Extras</span>
     ${EXTRAS.map(x => `<div class="cd-ex"><span class="ic">${GL.plus}</span><span class="t"><b>${esc(x[0])}</b><small>${HZC.usd(x[1])}/day</small></span>${x[2] === 'sel'
        ? `<span class="cd-step"><button type="button" data-step="-1" aria-label="Fewer: ${esc(x[0])}">−</button><b>0</b><button type="button" data-step="1" aria-label="More: ${esc(x[0])}">+</button></span><input type="hidden" class="ex" data-n="${esc(x[0])}" data-p="${x[1]}" data-max="${x[3]}" value="0">`
        : `<input class="ex" type="checkbox" data-n="${esc(x[0])}" data-p="${x[1]}" aria-label="${esc(x[0])}">`}</div>`).join('')}
     ${FM.drv.young.on ? `<label class="cd-check"><input type="checkbox" id="bU25">Main driver is under ${+FM.drv.young.age} <small>(+${HZC.usd(+FM.drv.young.fee)}/day)</small></label>` : ''}

     ${FM.opt.promo ? `<div class="cd-promo"><span class="cd-l">Promo code</span><div class="cd-promo-row"><input id="bPromo" type="text" placeholder="Enter a code" maxlength="20" autocomplete="off" aria-label="Promo code"><button type="button" id="bPromoBtn">Apply</button></div><p id="promoMsg" class="cd-promo-msg" role="status"></p></div>` : ''}
     <details class="cd-price-d"><summary>Price details</summary><div id="bLines"></div></details>
     <p class="cd-avail" id="avail" aria-live="polite"></p>
     <button class="btn cd-reserve" id="reserve" type="button">Reserve</button>
     <div class="cd-msg" id="msg" role="status" aria-live="polite"></div>
   </aside>
  </div>

  <section class="cd-sim"><h2>Similar cars</h2><p>Same class, or close on price.</p>
    <div class="grid4">${sims.map(x => `
      <article class="car" data-href="${carHref(x)}"><div><small>${x[1]}</small><h3>${x[0]}</h3><small>${x[2]} · ${x[3]}${x[7] ? ' · ' + x[7] + ' km' : ''}</small></div>
        <div class="pic"><img src="${IMG.fleet[x[0]]}" alt="" loading="lazy"></div>
        <div class="row"><div><span>From</span><b>${HZC.usd(x[6])} <span>/ day</span></b></div><a class="go" href="${carHref(x)}" aria-label="View ${x[0]}">→</a></div>
      </article>`).join('')}</div></section>`;

  // gallery
  $('#thumbs').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $('#mainImg').src = b.dataset.src;
    $$('#thumbs button').forEach(x => x.classList.toggle('on', x === b));
  });
  // tabs scroll to their section
  $('#tabs').addEventListener('click', e => {
    const b = e.target.closest('button'); if (b) document.getElementById(b.dataset.t).scrollIntoView({ block: 'start' });
  });
  // share: copy the link
  $('#share').onclick = () => {
    const b = $('#share'), t = b.innerHTML;
    const done = s => { b.textContent = s; setTimeout(() => b.innerHTML = t, 1800); };
    try { navigator.clipboard.writeText(location.href).then(() => done('Link copied'), () => done('Copy from the address bar')); }
    catch (e) { done('Copy from the address bar'); }
  };
  const mr = $('#moreRev'); if (mr) mr.onclick = e => { $$('#revs [hidden]').forEach(x => x.hidden = false); e.target.parentElement.remove(); };

  // booking panel
  const days = () => {
    const n = Math.round((new Date($('#bTo').value + 'T00:00') - new Date($('#bFrom').value + 'T00:00')) / 864e5);
    return isNaN(n) ? 0 : n;
  };
  let promo = '';   // the applied code, or ''
  const promoSay = (m, err) => { const el = $('#promoMsg'); el.className = 'cd-promo-msg' + (err ? ' err' : m ? ' ok' : ''); el.textContent = m || ''; };
  function applyPromo() {
    if (promo) { promo = ''; $('#bPromo').value = ''; $('#bPromoBtn').textContent = 'Apply'; promoSay(''); return calc(); }   // button reads "Remove" while applied
    const code = $('#bPromo').value.trim().toUpperCase(), n = days();
    const r = typeof HZDEALS === 'undefined' ? { ok: false, msg: 'Promo codes are not available right now.' } : HZDEALS.check(code, { days: n, ev: fuel === 'Electric', car: name, pickup: $('#bLoc').value });
    if (!r.ok) return promoSay(r.msg, true);
    promo = code; $('#bPromo').value = code; $('#bPromoBtn').textContent = 'Remove'; calc();
  }
  function calc() {
    const n = Math.max(days(), 0), lines = [];
    lines.push([`Rental · ${n} day${n === 1 ? '' : 's'} × ${T(price)}`, price * n]);
    // Automatic long-rental rate (Admin > Setup > Pricing rules > Long-rental rates): % off the base rental only, one rate per booking.
    const baseRental = price * n, st = n > 0 ? HZFORM.stay(n) : null, autoOff = st ? Math.round(baseRental * st.pct) / 100 : 0;
    if (st && autoOff > 0) lines.push([`${st.label} · ${+st.pct}% off`, -autoOff]);
    if ($('[name=mode]:checked').value === 'With driver') lines.push(['Driver · ' + T(+FM.drv.chauffeur.price) + '/day', +FM.drv.chauffeur.price * n]);
    const pr = +$('[name=prot]:checked').value;
    if (pr) lines.push([`Protection · ${$('[name=prot]:checked').dataset.n} · ${T(pr)}/day`, pr * n]);
    $$('.ex').forEach(e => {
      const q = e.type === 'checkbox' ? (e.checked ? 1 : 0) : +e.value;
      if (q) lines.push([e.dataset.n + (q > 1 ? ' × ' + q : ''), q * +e.dataset.p * n]);
    });
    if ($('#bU25') && $('#bU25').checked) lines.push(['Young-driver fee · ' + T(+FM.drv.young.fee) + '/day', +FM.drv.young.fee * n]);
    // One-way drop-off fee (only when the return place is on a route from the pick-up place)
    const oPu = $('#bLoc').value, oRt = $('#bDiff') && $('#bDiff').checked ? $('#bRet').value : '', oFee = oRt ? HZONEWAY.fee(oPu, oRt) : null;
    if (oFee > 0) lines.push([`One-way drop-off · ${oPu} → ${oRt}`, oFee]);
    // Promo code: checked again on every change (days, car, usage), so a code that stops qualifying drops off.
    let off = 0;
    if (promo && n > 0) {
      // The promo works on the rental AFTER the automatic rate, and rate + promo together can't pass the combined maximum (% of the base rental).
      const q = HZDEALS.quote(promo, { days: n, ev: fuel === 'Electric', car: name, pickup: $('#bLoc').value, rental: baseRental - autoOff, subtotal: lines.reduce((s, l) => s + l[1], 0) });
      if (q.ok) {
        const capPct = +FM.ls.cap || 0, room = capPct > 0 ? Math.max(0, Math.round(baseRental * capPct) / 100 - autoOff) : Infinity, capped = q.off > room;
        off = Math.round(Math.min(q.off, room) * 100) / 100;
        if (off > 0) { lines.push([`Promo ${promo}`, -off]); promoSay(`${promo} applied: you save ${money(off)}${capped ? ' (maximum combined discount reached)' : ''}.`); }
        else promoSay(`${promo} can’t be added on top of the ${st ? st.label.toLowerCase() : 'discount'} for these dates.`, true);
      }
      else { promoSay(q.msg, true); promo = ''; $('#bPromoBtn').textContent = 'Apply'; }
    }
    const sub = lines.reduce((s, l) => s + l[1], 0), tax = sub * TAX_RATE, total = sub + tax;
    $('#bTot').textContent = n > 0 ? `${money(total)} total · ${n} day${n === 1 ? '' : 's'}` : 'Choose valid dates';
    $('#bLines').innerHTML = lines.map(l => `<div class="cd-line"><span>${showLbl(esc(l[0]))}</span><span>${money(l[1])}</span></div>`).join('')
      + `<div class="cd-line"><span>${esc(FM.tax.label)} · ${+(TAX_RATE * 100).toFixed(2)}%</span><span>${money(tax)}</span></div><div class="cd-line t"><span>Total</span><span>${money(total)}</span></div>`
      + (HZC.cur() !== HZC.base() ? `<div class="cd-line"><span>Billed in ${esc(HZC.baseName())}</span><span>${HZC.fmtIn(HZC.base(), total, 2)}</span></div>` : '');
    return { n, total, tax, lines, off, stay: st && autoOff > 0 ? { tier: st.tier, pct: +st.pct, off: autoOff } : null };
  }
  // One-way rules (services/oneway.js): "Return to a different location" is only offered on a real route from the chosen
  // pick-up, e.g. Munich to Berlin. Bali to New York (or any pair with no route) is never offered.
  const retChoices = pu => pu ? HZONEWAY.from(pu, cities) : [];
  const feeTxt = f => f > 0 ? '+' + money(f) : 'No fee';
  function refreshOneWay() {
    const box = $('#bDiff'); if (!box) return;
    const pu = $('#bLoc').value, opts = retChoices(pu), note = $('#oneNote');
    const attr = x => String(x).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
    // warn = true: a short label with an alert button, the message opens on click. Otherwise a plain grey info note.
    const tell = (t, warn) => { note.hidden = !t; note.className = (warn ? 'cd-late-hint' : 'cd-note') + ' cd-nodiff';
      note.innerHTML = !t ? '' : warn ? `<span class="cd-late-label">One-way returns</span>${HZ.eyeBtn(`data-note-pop data-note-msg="${attr(t)}"`, 'About one-way returns')}` : `${GL.info}<span>${t}</span>`; };
    box.disabled = !opts.length; box.parentElement.classList.toggle('cd-off', !opts.length);
    if (!opts.length) {
      box.checked = false; $('#bRet').value = '';
      tell(pu ? `One-way returns aren’t available from ${esc(pu)}. Please return the car to ${esc(pu)}.` : 'Choose a pick-up location to see where this car can be returned.', true);
    } else {
      if ($('#bRet').value && !opts.includes($('#bRet').value)) $('#bRet').value = '';   // pick-up changed: the old return place may no longer be reachable
      const ret = $('#bRet').value, r = ret && HZONEWAY.find(pu, ret);
      tell(box.checked && r ? `One-way ${esc(pu)} → ${esc(ret)}: ${esc(r[2])}. ${HZONEWAY.fee(pu, ret) > 0 ? 'Drop-off fee ' + money(HZONEWAY.fee(pu, ret)) + ' added to your total.' : 'No drop-off fee.'}` : '');
    }
    $('#bRetW').hidden = !box.checked;
  }
  document.addEventListener('currencychange', () => { calc(); refreshOneWay(); });
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('[data-note-pop]'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    if (b.getAttribute('aria-expanded') === 'true') { HZ.closePopover(); return; }
    HZ.notePopover(b, 'One-way returns', b.dataset.noteMsg || '');
  });
  const say = (html, err) => { $('#msg').className = 'cd-msg ' + (err ? 'err' : 'ok'); $('#msg').innerHTML = html; };
  const showAvail = () => { const el = $('#avail'); if (!el) return; const u = HZFLEET.x(name).units, n = HZFLEET.left(name, { from: $('#bFrom').value, ft: $('#bFromT').value, to: $('#bTo').value, tt: $('#bToT').value });
    el.className = 'cd-avail' + (n ? '' : ' out'); el.textContent = n ? `${n} of ${u} car${u === 1 ? '' : 's'} available for these dates` : 'Fully booked for these dates. Try different dates.'; };
  $('#book').addEventListener('change', e => {
    if (e.target.name === 'prot') $$('.cd-opt').forEach(o => o.classList.toggle('on', o.querySelector('input').checked));
    if (e.target.id === 'bFrom' && days() < 1) $('#bTo').value = iso(addDays(new Date($('#bFrom').value + 'T00:00'), 1));
    if (e.target.id === 'bLoc') {
      const v = e.target.value;
      $('#pickNote').innerHTML = v ? `${GL.info}<span>Picking up in ${v}. Desk addresses and opening hours are on the <a href="locations.html">Locations</a> page.</span>`
        : `${GL.info}<span>Choose a pick-up location in the booking panel to see desk details, opening hours and directions.</span>`;
    }
    refreshOneWay();
    showAvail();
    $('#msg').className = 'cd-msg'; $('#msg').innerHTML = '';
    calc();
  });
  if (FM.opt.promo) {
  $('#bPromoBtn').onclick = applyPromo;
  $('#bPromo').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); applyPromo(); } });
  $('#bPromo').addEventListener('input', () => { if (!promo) promoSay(''); });
  { const q = new URLSearchParams(location.search).get('promo'); if (q) { $('#bPromo').value = q.toUpperCase(); setTimeout(applyPromo); } }   // "Use this deal" on the Deals page
  }
  $('#reserve').onclick = () => {
    const r = calc(), loc = $('#bLoc').value;
    if (!loc) return say('Choose a pick-up location first.', true);
    if (!cities.includes(loc)) return say(`This car can’t be picked up in ${loc}.`, true);
    if (r.n < 1) return say('The return date must be after the pick-up date.', true);
    const wantDiff = !!($('#bDiff') && $('#bDiff').checked), want = $('#bRet') ? $('#bRet').value : '';
    if (wantDiff && !want) return say('Choose a return location, or untick “Return to a different location”.', true);
    if (wantDiff && !HZONEWAY.valid(loc, want)) return say(`This car can’t be picked up in ${esc(loc)} and returned in ${esc(want)}. Please choose another return location.`, true);
    const retLoc = wantDiff ? want : loc;
    if (!HZFLEET.left(name, { from: $('#bFrom').value, ft: $('#bFromT').value, to: $('#bTo').value, tt: $('#bToT').value })) return say('Sorry, this car is fully booked for those dates. Try different dates.', true);
    const booking = { car: name, carSlug: slug(name), pickup: loc, ret: retLoc, from: $('#bFrom').value, ft: $('#bFromT').value, to: $('#bTo').value, tt: $('#bToT').value,
      mode: $('[name=mode]:checked').value, days: r.n, total: +r.total.toFixed(2), ...(promo && r.off > 0 ? { promo: { code: promo, off: +r.off.toFixed(2) } } : {}), ...(r.stay ? { stay: { tier: r.stay.tier, pct: r.stay.pct, off: +r.stay.off.toFixed(2) } } : {}),
      lines: [...r.lines.map(l => [usdLbl(l[0]), +l[1].toFixed(2)]), [`${FM.tax.label} · ${+(TAX_RATE * 100).toFixed(2)}%`, +r.tax.toFixed(2)]] };
    if (typeof HZ === 'undefined') return say('auth.js did not load. Put it in the same folder as the HTML files.', true);
    if (!HZ.current()) {   // sign in first; login.js finishes the booking afterwards
      try { sessionStorage.setItem('hz-draft', JSON.stringify(booking)); } catch (e) { return say('Please <a href="login.html">sign in</a> to reserve.', true); }
      location.href = 'login.html?next=' + encodeURIComponent('account.html');
      return;
    }
    try { const b = HZ.addBooking(booking); location.href = 'account.html?new=' + encodeURIComponent(b.id); }
    catch (e) { say(e.user ? e.message : 'Could not save the booking.', true); }
  };
  // ---- custom pickers: the browser's own select and date popups can't be styled, so these replace them
  const hv = id => $('#' + id);
  let pop = null;
  const closePop = () => { if (pop) { pop.btn.setAttribute('aria-expanded', 'false'); pop.remove(); pop = null; } };
  function openPop(btn, cls, fill, right) {
    const again = pop && pop.btn === btn; closePop(); if (again) return;
    const el = document.createElement('div'); el.className = 'pop ' + cls; el.btn = btn;
    if (right) { el.style.left = 'auto'; el.style.right = '0'; }
    el.addEventListener('click', ev => ev.stopPropagation());   // keep clicks inside from closing it
    btn.parentElement.appendChild(el); btn.setAttribute('aria-expanded', 'true'); pop = el; fill(el);
  }
  const setVal = (id, v) => { const el = hv(id); if (el.value !== v) { el.value = v; el.dispatchEvent(new Event('change', { bubbles: true })); } };
  const sync = () => {
    const put = (id, text, ph) => { const b = hv(id); b.firstElementChild.textContent = text; b.classList.toggle('ph', !!ph); };
    put('pLoc', hv('bLoc').value || 'Choose a location', !hv('bLoc').value);
    if (hv('pRet')) put('pRet', hv('bRet').value || 'Return location', !hv('bRet').value);
    put('pFrom', dstr(pd(hv('bFrom').value))); put('pTo', dstr(pd(hv('bTo').value)));
    put('pFromT', hv('bFromT').value); put('pToT', hv('bToT').value);
  };
  const listPick = (btnId, valId, items) => hv(btnId).addEventListener('click', e => {
    e.stopPropagation();
    openPop(e.currentTarget, 'list', p => {
      const cur = hv(valId).value, rows = typeof items === 'function' ? items() : items;
      p.innerHTML = rows.map(([v, l]) => `<button type="button" class="opt${v === cur ? ' on' : ''}" data-v="${v}">${l}</button>`).join('');
      p.addEventListener('click', ev => { const o = ev.target.closest('.opt'); if (o) { setVal(valId, o.dataset.v); closePop(); } });
      const on = p.querySelector('.on'); if (on) p.scrollTop = on.offsetTop - p.clientHeight / 2 + 18;
    });
  });
  const calPick = which => {
    const valId = which === 'from' ? 'bFrom' : 'bTo', btn = hv(which === 'from' ? 'pFrom' : 'pTo');
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openPop(btn, '', p => HZDate.calendar(p, {
        value: pd(hv(valId).value),
        from: pd(hv('bFrom').value), to: pd(hv('bTo').value),
        min: which === 'from' ? today : addDays(pd(hv('bFrom').value), 1),
        onPick: x => {
          if (which === 'from' && pd(hv('bTo').value) <= x) setVal('bTo', iso(addDays(x, 1)));
          setVal(valId, iso(x)); closePop();
          if (which === 'from') hv('pTo').click();   // move on to the return date
        },
      }), which === 'to');
    });
  };
  listPick('pLoc', 'bLoc', [['', 'Choose a location'], ...cities.map(c => [c, c])]);
  if (oneWay && FM.opt.oneWay) listPick('pRet', 'bRet', () => { const pu = hv('bLoc').value; return retChoices(pu).map(c => [c, `${esc(c)} <small>· ${feeTxt(HZONEWAY.fee(pu, c))}</small>`]); });
  listPick('pFromT', 'bFromT', TIMES.map(t => [t, t]));
  listPick('pToT', 'bToT', TIMES.map(t => [t, t]));
  calPick('from'); calPick('to');
  document.addEventListener('click', closePop);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePop(); });
  $('#book').addEventListener('change', sync); showAvail();   // registered after the handler above, so it sees any date it adjusted
  $('#book').addEventListener('click', e => {      // extras: − / + steppers
    const b = e.target.closest('[data-step]'); if (!b) return;
    const inp = b.closest('.cd-ex').querySelector('.ex'), v = Math.min(+inp.dataset.max || 3, Math.max(0, +inp.value + +b.dataset.step));
    inp.value = v; b.parentElement.querySelector('b').textContent = v; inp.dispatchEvent(new Event('change', { bubbles: true }));
  });
  refreshOneWay(); sync();
  calc();
}
