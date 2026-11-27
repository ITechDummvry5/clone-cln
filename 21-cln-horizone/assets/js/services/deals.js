// Deals and promo codes. Admin > Deals manages them; deals.html lists them; the car page applies a code at checkout.
// Starts EMPTY (nothing hard-coded): the built-in examples below are only copied in by "Load sample data".
// Stored in 'hz-deals': [{ id, title, headline, text, note, code, kind, value, minDays, maxOff, evOnly, validFrom, validUntil, maxUses, active, featured, img, cars, locations, newOnly, onHome, homeOrder, sample }]
//   rules: cars = car names it works on, locations = pick-up cities it works in (empty = any); newOnly = customers with no earlier booking
//   kind: 'percent' (value = % off the rental price, optional cap maxOff in USD) | 'fixed' (value = USD off the booking, before tax)
// Prototype note: this all runs in the browser. A real site does the same checks on the server (see the notes in the admin tab help).
const HZDEALS = (() => {
  const KEY = 'hz-deals';
  const fail = m => { const e = new Error(m); e.user = true; throw e; };
  const isAdmin = () => { try { const u = HZ.current(); return !!u && u.role === 'admin'; } catch (e) { return false; } };
  const guard = () => { if (!isAdmin()) fail('Admins only.'); };
  const raw = () => { const v = HZStore.get(KEY, []); return Array.isArray(v) ? v : []; };
  const norm = d => ({ id: '', title: '', headline: '', text: '', note: '', code: '', kind: 'percent', value: 0, minDays: 1, maxOff: 0, evOnly: false, validFrom: '', validUntil: '', maxUses: 0, active: true, featured: false, img: '', cars: [], locations: [], newOnly: false, onHome: true, homeOrder: 0, sample: false, ...d });
  const all = () => raw().map(norm);
  const pad = n => String(n).padStart(2, '0');
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  const expired = d => !!d.validUntil && d.validUntil < today();   // valid through the whole last day
  const used = code => (typeof HZ !== 'undefined' ? HZ.bookings() : []).filter(b => b.promo && b.promo.code === code && b.status !== 'cancelled').length;
  const notStarted = d => !!d.validFrom && d.validFrom > today();   // scheduled: saved, but not live yet
  const live = () => all().filter(d => d.active && !expired(d) && !notStarted(d));
  const me = () => { try { return HZ.current(); } catch (e) { return null; } };
  const booked = code => (typeof HZ !== 'undefined' ? HZ.bookings() : []).filter(b => b.promo && b.promo.code === code && b.status !== 'cancelled');
  // Numbers for the admin table (all USD): times used, discount given, and the booking totals the code was part of.
  const stats = code => { const l = booked(code); return { uses: l.length, off: l.reduce((s, b) => s + (+b.promo.off || 0), 0), revenue: l.reduce((s, b) => s + (+b.total || 0), 0) }; };
  // The picture of a deal: an uploaded image (data:) or a link wins; the old built-in keys ('weekend', 'ev'...) still work; the big banner deal falls back to the promo placeholder.
  const imgUrl = d => {
    const v = (typeof resolveImg === 'function' ? resolveImg : x => x)(String(d.img || '').trim());
    if (/^(data:image\/|https?:\/\/|assets\/|\.\/|\/)/i.test(v)) return v;
    if (typeof pic === 'function') return (v && (pic('promos.' + v) || pic('deals.' + v))) || (d.featured ? pic('deals.promo') : '') || '';
    return '';
  };
  // The home page list: deals marked "Show on the home page", in the order set in Admin > Deals (ties: the big banner deal, then the order they were added).
  const homeList = () => all().map((d, i) => ({ d, i })).filter(x => x.d.onHome)
    .sort((a, b) => (+a.d.homeOrder || 0) - (+b.d.homeOrder || 0) || (b.d.featured ? 1 : 0) - (a.d.featured ? 1 : 0) || a.i - b.i).map(x => x.d);
  const home = (n = 3) => homeList().filter(d => d.active && !expired(d) && !notStarted(d)).slice(0, n);
  const find = code => all().find(d => d.code === String(code || '').trim().toUpperCase()) || null;
  const fmtDate = iso => { const [y, m, d] = iso.split('-').map(Number); return `${d} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m - 1]} ${y}`; };
  // Plain-English rule, written with USD amounts so pages can convert them (HZC.inText).
  const ruleText = d => (d.kind === 'percent' ? `${+d.value}% off the base rental price${+d.maxOff > 0 ? `, up to $${+d.maxOff} per booking` : ''}` : `$${+d.value} off the booking total`)
    + `${+d.minDays > 1 ? ` on rentals of ${+d.minDays} days or more` : ''}${d.evOnly ? ', electric cars only' : ''}.`;
  // Is this code usable for a trip? ctx = { days, ev }. Returns { ok, deal } or { ok: false, msg }.
  function check(code, ctx = {}) {
    const c = String(code || '').trim().toUpperCase(); if (!c) return { ok: false, msg: 'Enter a promo code.' };
    const d = find(c); if (!d) return { ok: false, msg: 'That code isn’t valid.' };
    if (!d.active) return { ok: false, msg: 'That code isn’t active right now.' };
    if (expired(d)) return { ok: false, msg: `That code expired on ${fmtDate(d.validUntil)}.` };
    if (notStarted(d)) return { ok: false, msg: `That code starts on ${fmtDate(d.validFrom)}.` };
    if (+d.minDays > 1 && !(ctx.days >= +d.minDays)) return { ok: false, msg: `That code needs a rental of ${+d.minDays} days or more.` };
    if (d.evOnly && !ctx.ev) return { ok: false, msg: 'That code only works on electric cars.' };
    if (d.cars.length && ctx.car !== undefined && !d.cars.includes(ctx.car)) return { ok: false, msg: 'That code doesn’t apply to this car.' };
    if (d.locations.length && ctx.pickup !== undefined) {
      if (!ctx.pickup) return { ok: false, msg: 'Choose a pick-up location first, this code only works in some cities.' };
      if (!d.locations.includes(ctx.pickup)) return { ok: false, msg: `That code doesn’t apply to pick-ups in ${ctx.pickup}.` };
    }
    if (d.newOnly) {
      const u = me();
      if (!u) return { ok: false, msg: 'That code is for new customers. Sign in to use it.' };
      if ((HZ.bookings() || []).some(b => b.uid === u.id && b.status !== 'cancelled')) return { ok: false, msg: 'That code is for new customers only.' };
    }
    if (+d.maxUses > 0 && used(d.code) >= +d.maxUses) return { ok: false, msg: 'That code has been fully used.' };
    return { ok: true, deal: d };
  }
  // The discount in USD. ctx = { days, ev, rental (base rental price), subtotal (before tax) }.
  function quote(code, ctx) {
    const r = check(code, ctx); if (!r.ok) return r;
    const d = r.deal; let off = d.kind === 'percent' ? (+ctx.rental || 0) * (+d.value) / 100 : +d.value;
    if (d.kind === 'percent' && +d.maxOff > 0) off = Math.min(off, +d.maxOff);
    off = Math.round(Math.min(off, +ctx.subtotal || 0) * 100) / 100;
    return { ok: true, deal: d, off };
  }
  // ---- admin
  function save(d) {
    guard(); const list = all(), id = d.id;
    const x = norm({ ...d, code: String(d.code || '').trim().toUpperCase(), title: String(d.title || '').trim(), headline: String(d.headline || '').trim(), text: String(d.text || '').trim(), note: String(d.note || '').trim() });
    if (!x.title) fail('Give the deal a short title, like “Weekend escape”.');
    if (!x.headline) fail('Write the headline customers will read.');
    if (!/^[A-Z0-9]{3,20}$/.test(x.code)) fail('The code must be 3 to 20 letters or numbers, with no spaces.');
    if (list.some(o => o.code === x.code && o.id !== id)) fail(`The code ${x.code} is already used by another deal.`);
    x.value = Number(x.value); if (!(x.value > 0)) fail('Enter a discount above 0.');
    if (x.kind === 'percent' && x.value > 100) fail('A percentage can’t be more than 100.');
    x.minDays = Math.max(1, Math.floor(Number(x.minDays) || 1)); x.maxUses = Math.max(0, Math.floor(Number(x.maxUses) || 0)); x.maxOff = x.kind === 'percent' ? Math.max(0, Number(x.maxOff) || 0) : 0;
    x.cars = [...new Set((Array.isArray(x.cars) ? x.cars : []).map(String).filter(Boolean))]; x.locations = [...new Set((Array.isArray(x.locations) ? x.locations : []).map(String).filter(Boolean))];
    x.newOnly = !!x.newOnly; x.onHome = x.onHome !== false;
    if (x.validFrom && !/^\d{4}-\d{2}-\d{2}$/.test(x.validFrom)) fail('Pick a valid start date, or leave it empty to start right away.');
    if (x.validFrom && x.validUntil && x.validFrom > x.validUntil) fail('The start date can’t be after the end date.');
    x.img = String(x.img || '').trim(); if (x.img && !/^(https?:\/\/|data:image\/|lib:|assets\/|\.\/|\/)/i.test(x.img) && !/^[a-z0-9_-]+$/i.test(x.img)) fail('Image links must start with https:// (or upload a file instead).');
    if (x.validUntil && !/^\d{4}-\d{2}-\d{2}$/.test(x.validUntil)) fail('Pick a valid end date, or leave it empty for no end date.');
    if (!x.id) { x.id = 'D' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); x.homeOrder = list.reduce((m, o) => Math.max(m, +o.homeOrder || 0), 0) + 1; }   // new deals go to the end of the home list
    let next = id ? list.map(o => o.id === id ? x : o) : [...list, x];
    if (x.featured) next = next.map(o => o.id === x.id ? o : { ...o, featured: false });   // only one big banner
    if (!HZStore.set(KEY, next)) fail('Could not save (browser storage is full or blocked).');
    return x;
  }
  function write(list) { guard(); if (!HZStore.set(KEY, list)) fail('Could not save (browser storage is full or blocked).'); }
  const setHome = (id, on) => write(all().map(o => o.id === id ? { ...o, onHome: !!on, homeOrder: on ? all().reduce((m, d) => Math.max(m, +d.homeOrder || 0), 0) + 1 : o.homeOrder } : o));
  // Move a deal one place up (-1) or down (+1) in the home list.
  function moveHome(id, dir) {
    const ids = homeList().map(d => d.id), i = ids.indexOf(id), j = i + dir; if (i < 0 || j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]]; write(all().map(o => ids.includes(o.id) ? { ...o, homeOrder: ids.indexOf(o.id) + 1 } : o));
  }
  const setActive = (id, on) => write(all().map(o => o.id === id ? { ...o, active: !!on } : o));
  const remove = id => write(all().filter(o => o.id !== id));
  const removeAll = () => { guard(); HZStore.remove(KEY); };
  // ---- sample set (what the site used to hard-code)
  const SAMPLE = [
    { title: 'Biggest discount', headline: 'Unlock our biggest discount for a seamless booking experience', text: '65% off the base rental price, up to $150 per booking. 2+ day rentals.', code: 'HORIZON65', kind: 'percent', value: 65, minDays: 2, maxOff: 150, validUntil: '2027-06-30', featured: true },
    { title: 'Weekend escape', headline: 'Save 25% on rentals of three days or longer', text: '25% off the base rental price on bookings of three days or more.', note: '3+ day rentals', code: 'WEEKEND25', kind: 'percent', value: 25, minDays: 3, validUntil: '2027-12-31', img: 'weekend' },
    { title: 'Go electric', headline: '15% off your first electric rental', text: '15% off the base rental price on any electric vehicle.', note: 'Electric cars only', code: 'EVFIRST', kind: 'percent', value: 15, evOnly: true, validUntil: '2027-12-31', img: 'ev' },
    { title: 'Refer a friend', headline: 'You both get $30 of driving credit', text: '$30 off the total on bookings of two days or more.', note: '2+ day rentals', code: 'FRIEND30', kind: 'fixed', value: 30, minDays: 2, validUntil: '2027-12-31', img: 'friend' },
  ];
  function loadSample() {
    guard(); const have = all(), codes = have.map(d => d.code);
    write([...have, ...SAMPLE.filter(s => !codes.includes(s.code)).map((s, i) => norm({ ...s, id: 'Ds' + i + Date.now().toString(36), sample: true }))]);
  }
  const clearSample = () => write(all().filter(d => !d.sample));
  const hasSample = () => all().some(d => d.sample);
  return { all, live, home, homeList, setHome, moveHome, stats, notStarted, imgUrl, find, check, quote, used, expired, fmtDate, ruleText, save, setActive, remove, removeAll, loadSample, clearSample, hasSample, today };
})();
