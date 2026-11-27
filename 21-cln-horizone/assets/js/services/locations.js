// Admin-managed locations (prototype: stored in this browser, like bookings and settings).
// Until an admin saves a change, the site uses the built-in rows in data/cities.js. After the first save, the whole
// list lives in localStorage ('hz-locations') and replaces those rows on every page.
// Needs (loaded before it): core/config.js, core/storage.js, core/utils.js (slug), data/images.js (ph).
//
// One location object:
//   { city, country, region, desc, airport, station, cars, from, key, img,
//     airAddr, townAddr, side, licence, about, bestTime, tip,
//     spots: [{ name, tag, desc, time, img }] }          spots = "Best places to drive from"
const HZLOC = (function () {
  const KEY = 'hz-locations';
  const BG = ['#c9b9a6', '#a9b7c4', '#b5b0c4', '#a7bba9', '#d3a9a0', '#a8bdbd'];
  const stored = () => { const v = HZStore.get(KEY, null); return Array.isArray(v) ? v : null; };
  const mine = () => stored() || [];   // starts EMPTY: locations exist only once an admin adds them or loads the sample data
  let builtIn = [];                    // the built-in rows of data/cities.js, kept aside as the sample set
  const isAdmin = () => { try { const u = HZ.current(); return !!u && u.role === 'admin'; } catch (e) { return false; } };

  // Build the list from the built-in data arrays (what data/cities.js defines).
  function snapshot(CITIES, PLACE, INFO, SPOTS) {
    return CITIES.map(c => {
      const [country, city, desc, airport, station, cars, from, region, key] = c;
      const [airAddr, townAddr, side, licence] = PLACE[city] || ['', '', 'right', ''];
      const [about, bestTime, tip] = INFO[city] || ['', '', ''];
      return { city, country, region, desc, airport, station, cars, from, key, img: '', airAddr, townAddr, side, licence, about, bestTime, tip,
        spots: (SPOTS[city] || []).map(s => ({ name: s[0], tag: s[1], desc: s[2], time: s[3], img: s[4] || '' })) };
    });
  }

  // Make sure IMAGES.cities has a picture for every stored location (custom image, or a placeholder).
  function registerImages(list) {
    if (typeof IMAGES === 'undefined') return;
    list.forEach((l, i) => {
      if (!l.key) l.key = slug(l.city);
      const li = (typeof resolveImg === 'function' ? resolveImg : v => v)(l.img);
      if (li) IMAGES.cities[l.key] = li;
      else if (!IMAGES.cities[l.key]) IMAGES.cities[l.key] = ph(l.city, BG[i % BG.length], 800, 600);
    });
  }

  // Replace the contents of the data/cities.js arrays/objects with the stored list (in place, so the consts stay valid).
  function applyData(CITIES, PLACE, INFO, SPOTS, ROUTES) {
    builtIn = snapshot(CITIES, PLACE, INFO, SPOTS).map(l => ({ ...l, sample: true }));
    const list = mine();
    CITIES.length = 0;
    [PLACE, INFO, SPOTS].forEach(o => Object.keys(o).forEach(k => delete o[k]));
    list.forEach(l => {
      CITIES.push([l.country, l.city, l.desc, l.airport, l.station, +l.cars || 0, +l.from || 0, l.region, l.key]);
      PLACE[l.city] = [l.airAddr || '', l.townAddr || '', l.side === 'left' ? 'left' : 'right', l.licence || ''];
      INFO[l.city] = [l.about || '', l.bestTime || '', l.tip || ''];
      SPOTS[l.city] = (l.spots || []).map(s => ((typeof resolveImg === 'function' ? resolveImg : v => v)(s.img)) ? [s.name, s.tag, s.desc, s.time, (typeof resolveImg === 'function' ? resolveImg : v => v)(s.img)] : [s.name, s.tag, s.desc, s.time]);
    });
    const names = list.map(l => l.city);
    for (let i = ROUTES.length - 1; i >= 0; i--) if (!names.includes(ROUTES[i][0]) || !names.includes(ROUTES[i][1])) ROUTES.splice(i, 1);
  }

  function save(list) {
    if (!isAdmin()) { const e = new Error('Admins only.'); e.user = true; throw e; }
    if (!HZStore.set(KEY, list)) { const e = new Error('Could not save (browser storage is full or blocked). Try smaller images.'); e.user = true; throw e; }
    return list;
  }
  const reset = () => { if (isAdmin()) HZStore.remove(KEY); };
  function loadSample() {
    const have = mine().map(l => ({ ...l })), names = have.map(l => l.city);
    const add = builtIn.filter(l => !names.includes(l.city)).map(l => ({ ...l, spots: l.spots.map(x => ({ ...x })) }));
    const all = [...have, ...add]; registerImages(all); return save(all);
  }
  const clearSample = () => save(mine().filter(l => !l.sample));
  const hasSample = () => mine().some(l => l.sample);

  // Run on every page: keep the shared name list (header search, booking pickers, footer text) and images in step.
  const list = mine();
  registerImages(list);
  SITE.cities = list.map(l => l.city);
  SITE.tagline = (SITE.cities.length ? `Car rental in ${SITE.cities.length} ${SITE.cities.length === 1 ? 'city' : 'cities'}, priced without asterisks.` : 'Car rental priced without asterisks.') + ' The total you see is the total you pay.';

  return { all: mine, snapshot, applyData, registerImages, save, reset, loadSample, clearSample, hasSample, get: name => mine().find(l => l.city === name) || null };
})();
