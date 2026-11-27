// Admin-managed fleet and customer ratings (prototype: stored in this browser, like locations and currencies).
// Until an admin saves a change, the site uses the built-in rows in data/fleet.js. After the first save, the whole
// list lives in localStorage ('hz-fleet') and replaces those rows on every page, in place, so FLEET and DETAIL stay valid.
// Customer reviews live in 'hz-reviews'. A car's rating is NOT typed by an admin: it is worked out from the built-in
// starting rating (built-in cars only) plus the stars customers leave after a trip.
// Needs (loaded before it): core/storage.js, data/images.js (IMAGES, ph), services/auth.js (HZ), data/fleet.js (FLEET, DETAIL, BAGS).
//
// One car object:
//   { name, make, year, type, trans, fuel, seats, doors, bags, drive, price (USD/day), deposit (USD), minAge, range (km, electric),
//     intro, features: [text], img, photos: [up to 4 extra image urls], seedRating, seedN,
//     locations: [city names] (empty = every location), oneWay (true = can be returned to a different location), units (cars in stock) }
// One review: { id, booking, car, uid, name, city, stars (1-5), text, created }
const HZFLEET = (function () {
  const KEY = 'hz-fleet', RKEY = 'hz-reviews';
  const MAKES = ['Land Rover', 'Volkswagen', 'Toyota', 'Tesla', 'Porsche', 'BMW', 'Genesis', 'Audi', 'MINI', 'Kia', 'Volvo', 'Ford', 'Jeep', 'Fiat'];
  const makeOf = n => MAKES.find(m => n.startsWith(m)) || n.split(' ')[0];
  const BUILT_IN = FLEET.map(c => c.slice());
  const BUILT_IMG = typeof IMAGES !== 'undefined' ? { ...IMAGES.fleet } : {};
  const SEED = JSON.parse(JSON.stringify(DETAIL));
  const X = {};   // extra per-car info for the pages: { make, bags, features, photos, seedN, mine }
  const fail = m => { const e = new Error(m); e.user = true; throw e; };
  const stored = () => { const v = HZStore.get(KEY, null); return Array.isArray(v) ? v : null; };
  const isAdmin = () => { try { const u = HZ.current(); return !!u && u.role === 'admin'; } catch (e) { return false; } };

  function snapshot() {
    return BUILT_IN.map(c => { const d = SEED[c[0]] || [4, 'Front-wheel drive', 300, 21, 0, new Date().getFullYear(), ''];
      return { name: c[0], make: makeOf(c[0]), year: d[5], type: c[1], trans: c[2], fuel: c[3], seats: c[4], doors: d[0], bags: BAGS[c[1]] || 3, drive: d[1], price: c[6], deposit: d[2], minAge: d[3],
        range: c[7] || '', intro: d[6], features: [], img: '', photos: [], seedRating: c[5], seedN: d[4], locations: [], oneWay: true, units: 3 }; });
  }
  const SNAP = Object.fromEntries(snapshot().map(s => [s.name, s]));
  // Fill anything an older saved list is missing.
  const norm = x => { const b = SNAP[x.name] || {};
    return { make: makeOf(x.name), year: new Date().getFullYear(), doors: 4, bags: BAGS[x.type] || 3, drive: 'Front-wheel drive', deposit: 0, minAge: 21, intro: '', features: [], photos: [], img: '', range: '', locations: [], oneWay: true, units: 3, ...b, ...x,
      seedRating: x.seedRating ?? x.rating ?? b.seedRating ?? 0, seedN: x.seedN ?? b.seedN ?? 0 }; };
  const all = () => (stored() || []).map(norm);   // starts EMPTY: cars exist only once an admin adds them or loads the sample data
  const current = () => all();
  const row = (x, rating) => { const r = [x.name, x.type, x.trans, x.fuel, +x.seats || 1, rating, +x.price || 0]; if (+x.range > 0) r.push(+x.range); return r; };

  // Reusable dropdown lists and defaults for the admin form (Settings > Fleet settings), kept beside the cars.
  const CFG = 'hz-fleetcfg';
  const BUILT = {
    brand: [...new Set([...MAKES, 'Honda', 'Hyundai', 'Mazda', 'Mercedes-Benz', 'Nissan', 'Mitsubishi', 'Suzuki', 'Subaru', 'Lexus', 'Peugeot', 'Renault', 'Škoda', 'Chevrolet', 'Mercedes'])].sort((a, b) => a.localeCompare(b)),
    type: ['Hatchback', 'Sedan', 'SUV', 'Wagon', 'Off-road', 'Minivan', 'Sport', 'Convertible'],
    trans: ['Automatic', 'Manual'],
    fuel: ['Petrol', 'Diesel', 'Hybrid', 'Electric'],
    drive: ['Front-wheel drive', 'Rear-wheel drive', 'All-wheel drive', 'Four-wheel drive'],
    feature: ['Apple CarPlay', 'Android Auto', 'Adaptive cruise', 'Lane assist', 'Rear camera', 'Bluetooth', 'GPS navigation', 'Heated seats', 'Sunroof', 'Keyless entry', 'USB-C charging', 'Parking sensors', 'Child seat ready', 'Roof rails'],
  };
  const cfg = () => { const v = HZStore.get(CFG, null) || {}; return { lists: v.lists || {}, defaults: v.defaults || {}, sample: v.sample || {} }; };
  const saveCfg = c => { if (!isAdmin()) fail('Admins only.'); if (!HZStore.set(CFG, c)) fail('Could not save (browser storage is full or blocked).'); };
  // The lists start EMPTY: only what the admin added (or loaded with "Load sample data") + any value an existing car already uses.
  // BUILT is the sample set that "Load sample data" copies into the admin's own lists, where every option can be removed.
  function lists() {
    const c = cfg(), out = {};
    Object.keys(BUILT).forEach(k => { out[k] = [...new Set(c.lists[k] || [])]; });
    current().forEach(x => { [['type', 'type'], ['trans', 'trans'], ['fuel', 'fuel'], ['drive', 'drive'], ['brand', 'make']].forEach(([k, f]) => { if (x[f] && !out[k].includes(x[f])) out[k].push(x[f]); }); });
    out.brand.sort((a, b) => a.localeCompare(b));
    return out;
  }

  function loadSampleLists() {
    const c = cfg();
    Object.keys(BUILT).forEach(k => { const have = c.lists[k] = c.lists[k] || []; const add = BUILT[k].filter(x => !have.includes(x));
      have.push(...add); c.sample[k] = [...new Set([...(c.sample[k] || []), ...add])]; });
    saveCfg(c);
  }
  function clearSampleLists() {
    const c = cfg();
    Object.keys(c.sample).forEach(k => { c.lists[k] = (c.lists[k] || []).filter(x => !c.sample[k].includes(x)); });
    c.sample = {}; saveCfg(c);
  }
  const hasSampleLists = () => Object.values(cfg().sample).some(a => a && a.length);

  const reviews = () => { const v = HZStore.get(RKEY, []); return Array.isArray(v) ? v : []; };
  const reviewFor = booking => reviews().find(r => r.booking === booking) || null;
  const canReview = b => b.status === 'completed' || (b.status === 'confirmed' && HZ.ends(b) < new Date());

  // Every car needs a picture in IMAGES.fleet: its own upload/link, the built-in one, or a placeholder.
  function registerImages(list) {
    if (typeof IMAGES === 'undefined') return;
    list.forEach(x => { IMAGES.fleet[x.name] = (typeof resolveImg === 'function' ? resolveImg : v => v)(x.img) || BUILT_IMG[x.name] || ph(x.name); });
  }
  // Put a list into FLEET and DETAIL in place, so every page that reads them sees it. Rating = built-in start + customer stars.
  function apply(list) {
    const rv = reviews();
    registerImages(list);
    FLEET.length = 0; Object.keys(DETAIL).forEach(k => delete DETAIL[k]); Object.keys(X).forEach(k => delete X[k]);
    list.forEach(x => {
      const mine = rv.filter(r => r.car === x.name), sn = +x.seedN || 0, n = sn + mine.length;
      const sum = (+x.seedRating || 0) * sn + mine.reduce((s, r) => s + r.stars, 0);
      FLEET.push(row(x, n ? Math.round(sum / n * 10) / 10 : 0));
      DETAIL[x.name] = [+x.doors || 4, x.drive || 'Front-wheel drive', +x.deposit || 0, +x.minAge || 21, n, +x.year || new Date().getFullYear(), x.intro || ''];
      X[x.name] = { make: x.make || makeOf(x.name), bags: +x.bags >= 0 && x.bags !== '' ? +x.bags : (BAGS[x.type] || 3), features: (x.features || []).filter(Boolean), photos: (x.photos || []).map((typeof resolveImg === 'function' ? resolveImg : v => v)).filter(Boolean), seedN: sn, mine,
        locs: (x.locations || []).filter(Boolean), oneWay: x.oneWay !== false, units: x.units === '' || !Number.isFinite(+x.units) ? 3 : Math.max(0, Math.floor(+x.units)) };
    });
  }
  function save(list) {
    if (!isAdmin()) fail('Admins only.');
    if (!HZStore.set(KEY, list)) fail('Could not save (browser storage is full or blocked). Try smaller or fewer images.');
    return list;
  }
  const restore = () => { if (!isAdmin()) return; HZStore.remove(KEY); apply([]); };
  // Sample cars = the built-in rows of data/fleet.js. They are copied into the admin's own fleet (flagged sample: true) and can be edited or deleted like any car.
  function loadSampleCars() {
    if (!isAdmin()) fail('Admins only.');
    const have = all(), names = have.map(x => x.name);
    save([...have, ...snapshot().filter(x => !names.includes(x.name)).map(x => ({ ...x, sample: true }))]); apply(all());
  }
  function clearSampleCars() { if (!isAdmin()) fail('Admins only.'); save(all().filter(x => !x.sample)); apply(all()); }
  const hasSampleCars = () => all().some(x => x.sample);

  // A customer rates a finished trip: one review per booking.
  function addReview({ booking, stars, text }) {
    const u = HZ.current(); if (!u) fail('Sign in to leave a review.');
    const b = HZ.mine(u.id).find(x => x.id === booking); if (!b) fail('That booking was not found.');
    if (!canReview(b)) fail('You can rate a trip once it has ended.');
    if (reviewFor(booking)) fail('You already rated this trip.');
    stars = Math.round(+stars); if (!(stars >= 1 && stars <= 5)) fail('Choose 1 to 5 stars.');
    const list = reviews();
    list.unshift({ id: 'R' + Date.now().toString(36), booking, car: b.car, uid: u.id, name: u.name, city: b.pickup || '', stars, text: String(text || '').trim().slice(0, 500), created: new Date().toISOString() });
    if (!HZStore.set(RKEY, list)) fail('Could not save your review (browser storage is full or blocked).');
    apply(current());
  }

  // An admin can remove an inappropriate review; ratings are recalculated.
  function removeReview(id) {
    if (!isAdmin()) fail('Admins only.');
    if (!HZStore.set(RKEY, reviews().filter(r => r.id !== id))) fail('Could not save (browser storage is full or blocked).');
    apply(current());
  }

  // Put a trashed review back (admin Trash tab); ratings are recalculated.
  function restoreReview(r) {
    if (!isAdmin()) fail('Admins only.');
    const list = reviews(); if (list.some(x => x.id === r.id)) fail('That review is already back.');
    if (!HZStore.set(RKEY, [r, ...list])) fail('Could not save (browser storage is full or blocked).');
    apply(current());
  }

  // Where a car can be picked up (and returned): its own list, or every site location when the list is empty.
  const cities = name => { const all = (typeof SITE !== 'undefined' && SITE.cities) || [], x = X[name]; return !x || !x.locs.length ? all.slice() : all.filter(c => x.locs.includes(c)); };
  const oneWay = name => !X[name] || X[name].oneWay;
  // How many of this car are free for a trip { from, ft, to, tt }: units in stock minus pending/confirmed bookings that overlap it.
  // A gap (Admin > Booking options > Booking panel, in hours) is kept before and after every rental. skipId leaves one booking out (re-activating it).
  const gapMs = () => { try { return Math.max(0, +HZFORM.options().buffer || 0) * 36e5; } catch (e) { return 0; } };
  function left(name, trip, skipId) {
    const x = X[name]; if (!x) return 0;
    const s = HZ.starts(trip), e = HZ.ends(trip), g = gapMs();
    const used = HZ.bookings().filter(k => k.id !== skipId && k.car === name && (k.status === 'pending' || k.status === 'confirmed') && +HZ.starts(k) < +e + g && +HZ.ends(k) + g > +s).length;
    // Blocked dates (maintenance, repairs...) take cars out of stock for whole days, from the start of the first day to the end of the last.
    const out = blocks().filter(k => k.car === name && +dayStart(k.from) < +e && +dayStart(k.to, 1) > +s).reduce((t, k) => t + (+k.qty || 1), 0);
    return Math.max(0, x.units - used - out);
  }
  // ---- Blocked dates: { id, car, from, to, qty, reason, note }. Admin > Calendar > Blocked dates manages them.
  const BKEY = 'hz-blocks';
  const dayStart = (iso, plus = 0) => { const d = new Date(iso + 'T00:00:00'); d.setDate(d.getDate() + plus); return d; };
  const blocks = () => { const v = HZStore.get(BKEY, []); return Array.isArray(v) ? v : []; };
  function saveBlock(b) {
    if (!isAdmin()) fail('Admins only.');
    const x = { id: b.id || '', car: String(b.car || ''), from: String(b.from || ''), to: String(b.to || ''), qty: Math.floor(Number(b.qty) || 0), reason: String(b.reason || 'Maintenance'), note: String(b.note || '').trim().slice(0, 120) };
    if (!X[x.car]) fail('Choose a car.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(x.from) || !/^\d{4}-\d{2}-\d{2}$/.test(x.to)) fail('Pick the first and the last blocked day.');
    if (x.to < x.from) fail('The last day can’t be before the first day.');
    if (!(x.qty >= 1)) fail('Enter how many cars are out, at least 1.');
    if (x.qty > X[x.car].units) fail(`You only have ${X[x.car].units} of this car in stock.`);
    const list = blocks(); if (!x.id) x.id = 'B' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const next = list.some(o => o.id === x.id) ? list.map(o => o.id === x.id ? x : o) : [...list, x];
    if (!HZStore.set(BKEY, next)) fail('Could not save (browser storage is full or blocked).');
    return x;
  }
  function removeBlock(id) { if (!isAdmin()) fail('Admins only.'); if (!HZStore.set(BKEY, blocks().filter(o => o.id !== id))) fail('Could not save (browser storage is full or blocked).'); }

  apply(current());
  return { cities, oneWay, left, blocks, saveBlock, removeBlock, cfg, saveCfg, lists, BUILT, loadSampleLists, clearSampleLists, hasSampleLists, loadSampleCars, clearSampleCars, hasSampleCars, all, snapshot, apply, save, restore, x: n => X[n] || {}, reviews, reviewFor, canReview, addReview, removeReview, restoreReview, makeOf };
})();
