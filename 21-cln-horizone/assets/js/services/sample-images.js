// Sample images from a public API (Admin > Settings > Sample data > Sample images).
// Uses the free Wikipedia / Wikimedia API: no key, no sign-up, and it allows calls straight from the browser.
// It finds a real photo for every car, location, "best place to drive" and sample deal that has no picture yet,
// and saves only the image LINK (a few bytes), not the file, so it does not fill the browser storage.
// Your own pictures are never touched: only items with an empty image get one.
// "Remove sample images" puts back exactly what it changed (and only if the picture was not changed since).
// Needs (loaded before it): core/storage.js, services/auth.js (HZ), services/locations.js (HZLOC), services/fleet.js (HZFLEET), services/deals.js (HZDEALS).
//
// Saved record in 'hz-sampleimg': { cars: { name: [url, previous] }, locations: { city: [url, previous] },
//                                   spots: { 'city|spot': [url, previous] }, deals: { id: [url, previous] } }
const HZIMGAPI = (() => {
  const KEY = 'hz-sampleimg';
  const API = 'https://en.wikipedia.org/w/api.php';
  const WIDTH = 900;          // picture width asked from the API (px)
  const PARALLEL = 5;         // lookups at the same time
  const fail = m => { const e = new Error(m); e.user = true; throw e; };
  const isAdmin = () => { try { const u = HZ.current(); return !!u && u.role === 'admin'; } catch (e) { return false; } };
  const guard = () => { if (!isAdmin()) fail('Admins only.'); };
  const rec = () => { const v = HZStore.get(KEY, null) || {}; return { cars: v.cars || {}, locations: v.locations || {}, spots: v.spots || {}, deals: v.deals || {}, cats: v.cats || {} }; };
  const saveRec = r => { if (!HZStore.set(KEY, r)) fail('Could not save (browser storage is full or blocked).'); };
  const count = r => Object.keys(r.cars).length + Object.keys(r.locations).length + Object.keys(r.spots).length + Object.keys(r.deals).length + Object.keys(r.cats).length;
  const has = () => count(rec()) > 0;

  // Words the sample deals are searched with (the deal code decides the picture).
  // Home page "Find the right car" categories (landing-image keys categories.<key>).
  const CAT_QUERY = { suv: 'Sport utility vehicle', sedan: 'Sedan (automobile)', hatchback: 'Hatchback', electric: 'Electric car', minivan: 'Minivan', sport: 'Sports car' };
  const DEAL_QUERY = { HORIZON65: 'Car rental', WEEKEND25: 'Road trip', EVFIRST: 'Electric car', FRIEND30: 'Carpool' };
  // A deal picture can be empty or an old built-in key like 'weekend'; both count as "no picture yet". A link or upload does not.
  const noPic = v => { v = String(v || '').trim(); return !v || (/^[a-z0-9_-]+$/i.test(v) && !/^lib:/.test(v)); };
  // Skip logos, flags, maps and vector drawings: they make poor photos.
  const BAD = /logo|flag|coat[_ ]of[_ ]arms|locator|location[_ ]map|\.svg/i;

  const cache = new Map();
  // One search: the best-ranked result that has a usable picture. Returns a URL or ''.
  async function find(query) {
    if (cache.has(query)) return cache.get(query);
    const url = API + '?' + new URLSearchParams({ action: 'query', format: 'json', origin: '*', generator: 'search', gsrsearch: query, gsrlimit: '6',
      gsrnamespace: '0', prop: 'pageimages', piprop: 'thumbnail', pithumbsize: String(WIDTH), pilimit: '6' });
    const res = await fetch(url);
    if (!res.ok) throw new Error('API ' + res.status);
    const data = await res.json();
    const pages = Object.values((data && data.query && data.query.pages) || {}).sort((a, b) => (a.index || 0) - (b.index || 0));
    const hit = pages.find(p => p.thumbnail && p.thumbnail.source && !BAD.test(p.thumbnail.source));
    const out = hit ? hit.thumbnail.source : '';
    cache.set(query, out);
    return out;
  }

  // Run async jobs a few at a time; onStep(done, total) after each one.
  async function pool(jobs, onStep) {
    let next = 0, done = 0;
    const worker = async () => { while (next < jobs.length) { const j = jobs[next++]; try { await j(); } catch (e) { /* one miss is fine: that item keeps its placeholder */ } onStep && onStep(++done, jobs.length); } };
    await Promise.all(Array.from({ length: Math.min(PARALLEL, jobs.length) }, worker));
  }

  // Find and save pictures. Resolves { found, total }. Rejects with a user message if the API cannot be reached at all.
  async function load(onStep) {
    guard();
    const cars = HZFLEET.all().filter(x => !x.img);
    const locs = HZLOC.all();
    const deals = HZDEALS.all().filter(d => d.sample && noPic(d.img) && DEAL_QUERY[d.code]);
    const got = { cars: {}, locations: {}, spots: {}, deals: {}, cats: {} };
    const site = HZSITE.all();
    const jobs = [];
    cars.forEach(x => jobs.push(async () => { const u = await find(x.name + ' car'); if (u) got.cars[x.name] = u; }));
    locs.forEach(l => {
      if (!l.img) jobs.push(async () => { const u = await find(l.city + ' ' + l.country); if (u) got.locations[l.city] = u; });
      (l.spots || []).forEach(s => { if (!s.img) jobs.push(async () => { const u = await find(s.name + ' ' + l.city); if (u) got.spots[l.city + '|' + s.name] = u; }); });
    });
    deals.forEach(d => jobs.push(async () => { const u = await find(DEAL_QUERY[d.code]); if (u) got.deals[d.id] = u; }));
    Object.keys(CAT_QUERY).forEach(k => { if (!site['categories.' + k]) jobs.push(async () => { const u = await find(CAT_QUERY[k]); if (u) got.cats[k] = u; }); });
    const total = jobs.length;
    if (!total) return { found: 0, total: 0 };

    // If the very first lookups all fail, the API is unreachable (offline, blocked): say so instead of "0 found".
    let errors = 0, tries = 0;
    const wrapped = jobs.map(j => async () => { tries++; try { await j(); } catch (e) { errors++; throw e; } });
    await pool(wrapped, onStep);
    if (errors === tries) fail('Could not reach the image service. Check your internet connection and try again.');

    // Save: only fill pictures that are still empty (the admin may have edited things while we were loading).
    const r = rec(); let found = 0;
    const cl = HZFLEET.all().map(x => { const u = got.cars[x.name]; if (u && !x.img) { r.cars[x.name] = [u, '']; found++; return { ...x, img: u }; } return x; });
    if (Object.keys(got.cars).length) { HZFLEET.save(cl); HZFLEET.apply(HZFLEET.all()); }
    const ll = HZLOC.all().map(l => { const lu = got.locations[l.city]; let o = l;
      if (lu && !l.img) { r.locations[l.city] = [lu, '']; found++; o = { ...o, img: lu }; }
      o = { ...o, spots: (l.spots || []).map(s => { const su = got.spots[l.city + '|' + s.name]; if (su && !s.img) { r.spots[l.city + '|' + s.name] = [su, '']; found++; return { ...s, img: su }; } return s; }) };
      return o; });
    if (Object.keys(got.locations).length || Object.keys(got.spots).length) { HZLOC.save(ll); HZLOC.registerImages(ll); }
    const dm = {};
    HZDEALS.all().forEach(d => { const u = got.deals[d.id]; if (u && noPic(d.img)) { r.deals[d.id] = [u, String(d.img || '')]; dm[d.id] = u; found++; } });
    if (Object.keys(dm).length) HZDEALS.setImgs(dm);
    const sm = { ...HZSITE.all() };
    Object.keys(got.cats).forEach(k => { if (!sm['categories.' + k]) { sm['categories.' + k] = got.cats[k]; r.cats[k] = [got.cats[k], '']; found++; } });
    if (Object.keys(got.cats).length) HZSITE.set(sm);
    saveRec(r);
    return { found, total };
  }

  // Put back what load() changed. A picture the admin replaced in the meantime is left alone. Returns how many were removed.
  function clear() {
    guard();
    const r = rec(); let n = 0;
    const cl = HZFLEET.all().map(x => { const e = r.cars[x.name]; if (e && x.img === e[0]) { n++; return { ...x, img: e[1] }; } return x; });
    if (Object.keys(r.cars).length) { HZFLEET.save(cl); HZFLEET.apply(HZFLEET.all()); }
    const ll = HZLOC.all().map(l => { const e = r.locations[l.city]; let o = l;
      if (e && l.img === e[0]) { n++; o = { ...o, img: e[1] }; if (!e[1] && typeof IMAGES !== 'undefined' && l.key) delete IMAGES.cities[l.key]; }
      return { ...o, spots: (l.spots || []).map(s => { const k = r.spots[l.city + '|' + s.name]; if (k && s.img === k[0]) { n++; return { ...s, img: k[1] }; } return s; }) }; });
    if (Object.keys(r.locations).length || Object.keys(r.spots).length) { HZLOC.save(ll); HZLOC.registerImages(ll); }
    const dm = {};
    HZDEALS.all().forEach(d => { const e = r.deals[d.id]; if (e && d.img === e[0]) { n++; dm[d.id] = e[1]; } });
    if (Object.keys(dm).length) HZDEALS.setImgs(dm);
    const sm = { ...HZSITE.all() }; let ch = false;
    Object.keys(r.cats).forEach(k => { if (sm['categories.' + k] === r.cats[k][0]) { delete sm['categories.' + k]; n++; ch = true; } });
    if (ch) HZSITE.set(sm);
    HZStore.remove(KEY);
    return n;
  }

  return { load, clear, has, find };
})();
