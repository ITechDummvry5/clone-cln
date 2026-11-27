// Location page. Reads ?city=<slug> and renders that city into #city from data/cities.js.
// There is no page per city: add a row to CITIES (and PLACE) and location.html?city=<slug> works.
const root = document.getElementById('city');
const city = CITIES.find(x => slug(x[1]) === new URLSearchParams(location.search).get('city'));

const svg = d => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const GL = {
  plane: svg('<path d="M10.5 13.5 3 11l1-2 8 .5L16 5a1.8 1.8 0 0 1 3 1.5L15.5 11l.5 8-2 1-2.5-7.5z"/>'),
  desk: svg('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h.01M15 8h.01M9 12h.01M15 12h.01M10 21v-3h4v3"/>'),
  wheel: svg('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/><path d="M12 3v6.5M3.5 15l6-2.5M20.5 15l-6-2.5"/>'),
  ok: svg('<circle cx="12" cy="12" r="9"/><path d="m8 12.5 3 3 5-6"/>'),
  pin: svg('<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.400-6.500 11-6.500 11z"/><circle cx="12" cy="10" r="2.300"/>'),
  tag: svg('<path d="M3 12.500V4a1 1 0 0 1 1-1h8.500l8 8.500a1.500 1.500 0 0 1 0 2.100l-6.400 6.400a1.500 1.500 0 0 1-2.100 0z"/><path d="M7.500 7.500h.01"/>'),
  id: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6 16c.6-1.500 1.700-2 3-2s2.400.5 3 2M15 10h3M15 13.500h3"/>'),
  shield: svg('<path d="M12 3 5 6v6c0 4.500 3 7.500 7 9 4-1.500 7-4.500 7-9V6z"/><path d="m9 12 2 2 4-4"/>'),
  clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  car: svg('<path d="M4 17v-4l2-5.5A2 2 0 0 1 7.9 6h8.2A2 2 0 0 1 18 7.5L20 13v4zM4 17v2M20 17v2M4 13h16M7.5 15h.01M16.5 15h.01"/>'),
};
const cityHref = c => 'location.html?city=' + slug(c[1]);
const carsHref = c => 'cars.html?pickup=' + encodeURIComponent(c[1]);

if (!city) notFound(); else render(city);

function notFound() {
  document.title = 'Location not found – Horizone';
  document.querySelector('.nav')?.classList.add('dark');   // no hero image on this state, so use the plain header
  root.innerHTML = '<div class="wrap"><div class="crumbs"><a href="index.html">Home</a> › <a href="locations.html">Locations</a></div><div id="nf"></div></div>';
  isoNotFound(document.getElementById('nf'), {          // components/isometric.js
    eyebrow: 'Location not found', title: 'We couldn’t find that location',
    text: 'The link may be old, or we don’t have a desk in that city yet. Pick one of our cities instead.',
    actions: [['See all locations', 'locations.html'], ['Back to home', 'index.html', 'ghost']],
    tryTitle: 'Our cities', chips: CITIES.map(c => [c[1], cityHref(c)]),
  });
}

function render(c) {
  const [country, name, desc, airport, station, count, from, region, imgKey] = c;
  const [airAddr, townAddr, side, licence] = PLACE[name] || ['', '', 'right', ''];
  const [about, bestTime, tip] = INFO[name] || ['', '', ''];
  const spots = SPOTS[name] || [];
  document.title = `Car rental in ${name} – Horizone`;

  // Sample selection: the fleet has no per-city stock yet, so each city shows a fixed slice of it, shifted per city.
  // Replace with real availability when you have it.
  const at = CITIES.indexOf(c);
  const offered = FLEET.filter(f => HZFLEET.cities(f[0]).includes(name));   // only cars that can be picked up here
  const here = Array.from({ length: Math.min(count, offered.length) }, (_, i) => offered[(at * 3 + i) % offered.length]);
  const carHref = x => 'car.html?car=' + slug(x[0]) + '&pickup=' + encodeURIComponent(name);

  const routes = ROUTES.filter(r => r[0] === name || r[1] === name);
  const nearby = CITIES.filter(x => x[7] === region && x !== c);

  const spec = (icon, v, k) => `<div>${icon}<p><b>${v}</b><span>${k}</span></p></div>`;
  const licenceShort = /required/i.test(licence) ? 'IDP required' : /^most/i.test(licence) ? 'Usually accepted' : 'Home licence OK';
  const desk = (icon, title, addr, hours, note) => `
    <div class="lp-desk"><span class="ic">${icon}</span><div><small>${note}</small><h3>${esc(title)}</h3><p>${esc(addr)}</p><p class="hrs">${hours}</p></div></div>`;
  const know = (k, v) => v ? `<div class="r"><small>${k}</small><span>${esc(v)}</span></div>` : '';
  // Best-spots card. Placeholder image per spot until a real path is given as the fifth value in SPOTS.
  const SPOT_BG = ['#c9b9a6', '#a9b7c4', '#b5b0c4', '#a7bba9', '#d3a9a0', '#a8bdbd'];
  const spot = (x, i) => `
    <article class="lp-spot"><div class="pic"><img src="${esc(x[4] || ph(x[0], SPOT_BG[(at + i) % SPOT_BG.length], 800, 600))}" alt="${esc(x[0])}" loading="lazy"><span class="tag">${esc(x[1])}</span></div>
      <div class="body"><h3>${esc(x[0])}</h3><p>${esc(x[2])}</p>
        <div class="foot"><span>${GL.clock}About ${esc(x[3])} drive</span><a href="${carsHref(c)}">Drive there →</a></div></div></article>`;
  const step = (n, t, d) => `<div class="lp-step"><i>${n}</i><h3>${t}</h3><p>${d}</p></div>`;

  const oneWay = routes.length
    ? `One-way rentals are available: ${routes.map(r => `${r[0] === name ? r[1] : r[0]} (${r[3].toLowerCase()})`).join(', ')}.`
    : `One-way rentals from ${name} are not available on a fixed route at the moment. Contact us and we will check for you.`;
  // Answers are HTML (so the price can follow the selected currency): escape every plain-text part with esc().
  const FAQ = [
    [`Where do I pick up my car in ${name}?`, esc(`At ${airport} (open 24 hours) or at ${station} (07:00–21:00). Both desks have the same prices and cars.`)],
    [`Do I need an International Driving Permit in ${country}?`, esc(licence)],
    [`Is there an airport surcharge?`, `Pick-up at the airport desk adds a ${HZC.usd(AIRPORT_FEE)} surcharge. Picking up in the city has no surcharge.`],
    [`When is the best time to drive in ${name}?`, esc(bestTime ? `${bestTime}. ${tip}` : tip)],
    [`Can I return the car in another city?`, esc(oneWay)],
  ];

  root.innerHTML = `
  <div class="hero sm"><img src="${pic('cities.' + imgKey)}" alt=""><div class="wrap">
    <div class="crumbs"><a href="index.html">Home</a> › <a href="locations.html">Locations</a> › ${esc(name)}</div>
    <h1>Car rental in ${esc(name)}</h1><p>${esc(desc)}</p>
    <div class="lp-cta"><a class="btn light" href="${carsHref(c)}">See cars in ${esc(name)}</a>
      <ul class="lp-pills"><li>${esc(country)}</li><li>Free cancellation</li><li>24/7 support</li></ul></div>
  </div></div>

  <section class="lp-facts"><div class="wrap"><div class="lp-specs">
    ${spec(GL.car, `${count} models`, 'Available cars')}${spec(GL.tag, `${HZC.usd(from)} / day`, 'Prices from')}
    ${spec(GL.pin, '2 pick-up points', 'Airport and city')}${spec(GL.wheel, `Drive on the ${side}`, 'Traffic side')}
    ${spec(GL.plane, '24 hours', 'Airport desk')}${spec(GL.desk, '07:00–21:00', 'City desk')}
    ${spec(GL.id, licenceShort, 'Driving licence')}${spec(GL.shield, 'Free cancellation', 'Up to 48 h before')}
  </div></div></section>

  <section><div class="wrap lp-about">
    <div><h2>About ${esc(name)}</h2><p class="lead">${esc(about)}</p><p>${esc(`Collect your car at ${airport} or ${station}. Prices include protection and 24/7 support, and you can cancel free up to 48 hours before pick-up.`)}</p>
      <a class="btn ghost" href="${carsHref(c)}">Browse ${count} cars</a></div>
    <aside class="lp-know"><h3>Good to know</h3>
      ${know('Best time to drive', bestTime)}${know('Traffic', `Drive on the ${side}`)}${know('Licence', licence)}${know('Local tip', tip)}
    </aside>
  </div></section>

  <section style="padding-top:0"><div class="wrap">
    <div class="lp-head"><div><h2>Best places to drive from ${esc(name)}</h2><p class="sub">Four trips our customers love, all easy by car.</p></div></div>
    <div class="lp-spots">${spots.map(spot).join('')}</div>
  </div></section>

  <section style="padding-top:0"><div class="wrap">
    <div class="lp-head"><div><h2>Cars in ${esc(name)}</h2><p class="sub">A selection of the ${count} models available, from ${HZC.usd(from)} a day.</p></div>
      <a class="btn ghost" href="${carsHref(c)}">See all ${count} cars</a></div>
    <div class="grid3 lp-cars" id="fleet">${here.slice(0, 6).map(x => carCard(x, carHref(x))).join('')}</div>
  </div></section>

  <section class="lp-band"><div class="wrap">
    <h2>Pick-up points</h2><p class="sub">Same prices, protection and 24/7 support at both desks.</p>
    <div class="lp-desks">
      ${desk(GL.plane, airport, airAddr, `Open 24 hours · ${HZC.usd(AIRPORT_FEE)} airport surcharge`, 'Airport')}
      ${desk(GL.desk, station, townAddr, 'Open 07:00–21:00 · after-hours key box available', 'City')}
    </div>
    <div class="lp-steps">
      ${step(1, 'Choose your car', `Pick from ${count} models in ${esc(name)}. Free cancellation up to 48 hours before pick-up.`)}
      ${step(2, 'Pick up', `Show your licence and card at the desk, check the car with us and drive away in minutes.`)}
      ${step(3, 'Drive and return', `Return it full to the same desk, or to another city on a one-way route.`)}
    </div>
  </div></section>

  <section><div class="wrap lp-faq">
    <div><h2>Questions about ${esc(name)}</h2><p class="sub">Not here? Visit the <a href="help.html" style="text-decoration:underline">help centre</a>.</p></div>
    <div class="faq">${FAQ.map(q => `<details><summary>${esc(q[0])}</summary><p>${q[1]}</p></details>`).join('')}</div>
  </div></section>
  ${routes.length ? `
  <section style="padding-top:0"><div class="wrap">
    <h2>One-way from ${esc(name)}</h2><p class="sub" style="margin-bottom:20px">Pick up here and leave the car in another city.</p>
    <div class="routes">${routes.map(r => {
      const other = r[0] === name ? r[1] : r[0];
      return `<div class="route"><h3>${esc(name)} → ${esc(other)}</h3><p>${esc(r[2])} · <b>${esc(r[3])}</b></p>
        <div class="chips"><a href="cars.html?pickup=${encodeURIComponent(name)}&ret=${encodeURIComponent(other)}">Search ${esc(name)} → ${esc(other)}</a></div></div>`;
    }).join('')}</div>
  </div></section>` : ''}
  ${nearby.length ? `
  <section style="padding-top:0"><div class="wrap">
    <h2>More in ${esc(region)}</h2>
    <div class="chips lp-more">${nearby.map(x => `<a href="${cityHref(x)}">${esc(x[1])}</a>`).join('')}</div>
  </div></section>` : ''}`;
}
