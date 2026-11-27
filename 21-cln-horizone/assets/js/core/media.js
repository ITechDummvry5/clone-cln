// Image helpers. All image URLs live in data/images.js (IMAGES); load that file first.
const IMG = typeof IMAGES !== 'undefined' ? IMAGES
  : (console.error('data/images.js did not load. Check the script order on this page.'),
     { hero:'', banner:'', cars:{}, categories:{}, cities:{}, deals:{}, avatars:[], fleet:{} });

// pic('cities.bali') -> the URL stored at IMG.cities.bali
const pic = path => {
  // A picture chosen in Admin > Landing images wins over the built-in one.
  try { const o = typeof HZSITE !== 'undefined' ? resolveImg(HZSITE.get(path)) : ''; if (o) return o; } catch (e) { /* use the built-in picture */ }
  return path.split('.').reduce((o, k) => o && o[k], IMG) || '';
};

// <img> markup for a URL
const img = src => `<img src="${src}" alt="" loading="lazy">`;

// Fill every <img data-img="key.path"> inside root
const hydrateImages = (root = document) => root.querySelectorAll('[data-img]').forEach(el => {
  el.src = pic(el.dataset.img);
  // A darkness chosen in Admin > Landing images is passed to the overlay in the picture's box as --dim (0 to 1).
  try { const d = typeof HZSITE !== 'undefined' ? HZSITE.dim(el.dataset.img) : null; if (d != null && el.parentElement) { el.parentElement.style.setProperty('--dim', d / 100); el.parentElement.classList.add('has-dim'); } } catch (e) { /* keep the built-in overlay */ }
});

// ---- Image library (Admin > Images). An image uploaded once lives here and is used anywhere as "lib:<id>"; resolveImg turns that into the picture.
// Prototype note: pictures sit in browser storage (about 5 MB for the whole site). A real site keeps files on a server or file storage and saves only the link.
const HZMEDIA = (() => {
  const KEY = 'hz-media'; let cache = null;
  const fail = m => { const e = new Error(m); e.user = true; throw e; };
  const guard = () => { let u = null; try { u = HZ.current(); } catch (e) { /* not loaded */ } if (!u || u.role !== 'admin') fail('Admins only.'); };
  const read = () => cache || (cache = (() => { const v = HZStore.get(KEY, []); return Array.isArray(v) ? v : []; })());
  window.addEventListener('storage', e => { if (e.key === KEY) cache = null; });
  const write = list => { if (!HZStore.set(KEY, list)) fail('Could not save the image (browser storage is full or blocked).'); cache = list; };
  const all = () => read().slice();
  const find = id => read().find(m => m.id === id) || null;
  const isRef = v => /^lib:/.test(String(v || ''));
  const resolve = v => { v = String(v || ''); if (!isRef(v)) return v; const m = find(v.slice(4)); return m ? m.data : ''; };
  // Same picture uploaded twice is kept once.
  function add(name, data) {
    guard(); if (!/^data:image\//.test(String(data))) fail('Choose an image file.');
    const have = read().find(m => m.data === data); if (have) return have;
    const m = { id: 'M' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), name: String(name || 'Image').replace(/\.[a-z0-9]+$/i, '').slice(0, 60) || 'Image', data, size: Math.round(String(data).length * 0.75), created: new Date().toISOString() };
    write([m, ...read()]); return m;
  }
  function rename(id, name) { guard(); name = String(name || '').trim().slice(0, 60); if (!name) fail('Give the image a name.'); write(read().map(m => m.id === id ? { ...m, name } : m)); }
  const remove = id => { guard(); write(read().filter(m => m.id !== id)); };
  function restore(m) { guard(); if (read().some(x => x.id === m.id)) fail('That image is already back.'); write([m, ...read()]); }
  // Where an image is used: counts per place (a trashed item still counts, because restoring it would need the image).
  function usage(id) {
    const ref = 'lib:' + id, n = k => { const v = HZStore.get(k, []); return Array.isArray(v) ? v.filter(x => JSON.stringify(x).includes(ref)).length : 0; };
    let site = 0; try { site = Object.values(HZStore.get('hz-siteimg', {}) || {}).filter(v => v === ref).length; } catch (e) { /* none */ }
    return { deals: n('hz-deals'), cars: n('hz-fleet'), locations: n('hz-locations'), trash: n('hz-trash'), site };
  }
  const totalSize = () => read().reduce((s, m) => s + (m.size || 0), 0);
  return { all, find, resolve, isRef, add, rename, remove, restore, usage, totalSize };
})();
const resolveImg = v => /^lib:/.test(String(v || '')) ? HZMEDIA.resolve(v) : v;

// ---- Landing images (Admin > Landing images): { 'hero': 'lib:M1x', 'heroes.about': 'https://...' }. Missing key = the built-in picture in data/images.js.
const HZSITE = (() => {
  const KEY = 'hz-siteimg';
  const read = () => { const v = HZStore.get(KEY, {}); return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; };
  const get = k => read()[k] || '';
  const set = map => {
    let u = null; try { u = HZ.current(); } catch (e) { /* not loaded */ }
    if (!u || u.role !== 'admin') { const e = new Error('Admins only.'); e.user = true; throw e; }
    if (!HZStore.set(KEY, map)) { const e = new Error('Could not save (browser storage is full or blocked).'); e.user = true; throw e; }
  };
  // Darkness of the black overlay per picture, 0 to 100. Missing = the overlay the page already has.
  const DKEY = 'hz-sitedim';
  const dimAll = () => { const v = HZStore.get(DKEY, {}); return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; };
  const dim = k => { const v = dimAll()[k]; return typeof v === 'number' && v >= 0 && v <= 100 ? v : null; };
  const setDim = map => {
    let u = null; try { u = HZ.current(); } catch (e) { /* not loaded */ }
    if (!u || u.role !== 'admin') { const e = new Error('Admins only.'); e.user = true; throw e; }
    if (!HZStore.set(DKEY, map)) { const e = new Error('Could not save (browser storage is full or blocked).'); e.user = true; throw e; }
  };
  return { get, all: read, set, dim, dimAll, setDim };
})();
