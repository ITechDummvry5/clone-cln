// Admin insights. No DOM in here, so every part can be tested on its own.
//   1. Activity log: install() watches the admin's own saves and writes "who changed what and when" to 'hz-activity'.
//   2. Dashboard: compute() turns bookings and cars into revenue, occupancy and top-car numbers for a date range.
//   3. Timeline: lanes() stacks overlapping bookings of one car so they never sit on top of each other.
// Prototype note: the log lives in this browser only. A real site writes it on the server, where nobody can edit it.
const HZINS = (() => {
  const LOG = 'hz-activity', CAP = 1000;
  const pad = n => String(n).padStart(2, '0');
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const day = s => new Date(s + 'T00:00:00');
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const diffDays = (a, b) => Math.round((day(b) - day(a)) / 864e5);   // between two YYYY-MM-DD strings

  // ---------- 1. activity log
  // key -> [area shown in the log, how to name one item, the field that identifies it]
  const AREAS = {
    'hz-bookings': ['Bookings', b => `Booking ${b.id}${b.car ? ' (' + b.car + ')' : ''}`, 'id'],
    'hz-users': ['Customers', u => `${u.role === 'admin' ? 'Admin' : 'Customer'} ${u.name || u.email}`, 'id'],
    'hz-deals': ['Deals', d => `Deal ${d.code || d.title}`, 'id'],
    'hz-fleet': ['Fleet', c => c.name, 'name'],
    'hz-locations': ['Locations', l => l.city, 'city'],
    'hz-blocks': ['Blocked dates', b => `${b.car}, ${b.from} to ${b.to}`, 'id'],
    'hz-reviews': ['Reviews', r => `Review of ${r.car} by ${r.name}`, 'id'],
    'hz-messages': ['Messages', m => `Message from ${m.name || m.email || 'a visitor'}`, 'id'],
    'hz-media': ['Images', m => m.name || m.id, 'id'],
  };
  // whole-object settings: [area, what]
  const SINGLE = {
    'hz-form': ['Booking options', 'Booking options'], 'hz-settings': ['Settings', 'Settings'], 'hz-currencies': ['Currency', 'Currency rates'],
    'hz-fleetcfg': ['Fleet', 'Fleet lists and defaults'], 'hz-routes': ['Locations', 'One-way routes'], 'hz-geo': ['Locations', 'Countries and cities'], 'hz-siteimg': ['Landing images', 'Landing images'], 'hz-sitedim': ['Landing images', 'Picture darkness'],
  };
  const SHOW = ['status', 'role', 'active', 'featured', 'onHome'];   // only these values are printed; any other field is named, never shown
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const changed = (o, n) => [...new Set([...Object.keys(o || {}), ...Object.keys(n || {})])].filter(k => !same((o || {})[k], (n || {})[k]));
  const slim = (key, x) => key === 'hz-media' && x ? { id: x.id, name: x.name, size: x.size } : x;   // never compare the picture data itself
  const more = (l, n = 5) => l.slice(0, n).join(', ') + (l.length > n ? '…' : '');

  // The entries one save produces: [{ area, action: added | edited | removed, what, detail }]
  function diff(key, oldV, newV) {
    if (SINGLE[key]) {
      if (same(oldV, newV)) return [];
      const obj = v => v && typeof v === 'object' && !Array.isArray(v), f = obj(oldV) && obj(newV) ? changed(oldV, newV) : [];
      return [{ area: SINGLE[key][0], action: 'edited', what: SINGLE[key][1], detail: more(f) }];
    }
    const A = AREAS[key]; if (!A) return [];
    const [area, label, idf] = A, o = Array.isArray(oldV) ? oldV : [], n = Array.isArray(newV) ? newV : [];
    const om = new Map(o.map(x => [x && x[idf], x])), nm = new Map(n.map(x => [x && x[idf], x])), out = [];
    n.forEach(x => {
      const p = om.get(x && x[idf]);
      if (!p) return out.push({ area, action: 'added', what: label(x), detail: '' });
      if (same(slim(key, p), slim(key, x))) return;
      const f = changed(slim(key, p), slim(key, x));
      out.push({ area, action: 'edited', what: label(x), detail: more(f.map(k => SHOW.includes(k) ? `${k}: ${p[k]} → ${x[k]}` : k)) });
    });
    o.forEach(x => { if (!nm.has(x && x[idf])) out.push({ area, action: 'removed', what: label(x), detail: '' }); });
    if (out.length > 6) {   // loading or clearing sample data touches dozens of items: one line per kind of change
      const by = {}; out.forEach(e => (by[e.action] = by[e.action] || []).push(e));
      return Object.entries(by).map(([a, l]) => ({ area, action: a, what: `${l.length} items`, detail: more(l.map(e => e.what), 3) }));
    }
    return out;
  }
  const list = () => { const v = HZStore.get(LOG, []); return Array.isArray(v) ? v : []; };
  function record(who, entries) {
    if (!entries.length) return;
    const t = new Date().toISOString(), tag = Date.now().toString(36);
    const add = entries.map((e, i) => ({ id: 'A' + tag + i + Math.random().toString(36).slice(2, 4), t, who, ...e }));
    HZStore.set(LOG, [...add, ...list()].slice(0, CAP));
  }
  // Watch every save the signed-in admin makes from this page (the services all save through HZStore).
  let on = false;
  function install(who) {
    if (on) return; on = true;
    const set0 = HZStore.set.bind(HZStore), raw0 = HZStore.setRaw.bind(HZStore);
    HZStore.set = (k, v) => {
      if (!(k in AREAS) && !(k in SINGLE)) return set0(k, v);
      const old = HZStore.get(k, null), ok = set0(k, v);
      if (ok) { try { record(who, diff(k, old, v)); } catch (e) { /* the log must never break a save */ } }
      return ok;
    };
    HZStore.setRaw = (k, v) => {
      if (k !== 'hz-base') return raw0(k, v);
      const old = HZStore.raw(k, ''), ok = raw0(k, v);
      if (ok && old !== String(v)) { try { record(who, [{ area: 'Currency', action: 'edited', what: 'Main currency', detail: `${old || 'default'} → ${v}` }]); } catch (e) { /* ignore */ } }
      return ok;
    };
  }

  // ---------- 2. dashboard
  // Buckets: 30 days, one per day; 6 or 12 months, one per month. s = first day, e = first day after it (YYYY-MM-DD).
  function buckets(range, now = new Date()) {
    const today = day(iso(now)), out = [];
    if (range === '30d') {
      for (let i = 29; i >= 0; i--) { const s = addDays(today, -i); out.push({ s: iso(s), e: iso(addDays(s, 1)), label: String(s.getDate()), title: s.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) }); }
    } else {
      const n = range === '12m' ? 12 : 6;
      for (let i = n - 1; i >= 0; i--) {
        const s = new Date(today.getFullYear(), today.getMonth() - i, 1), e = new Date(s.getFullYear(), s.getMonth() + 1, 1);
        out.push({ s: iso(s), e: iso(e), label: s.toLocaleDateString('en-GB', { month: 'short' }), title: s.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) });
      }
    }
    return out;
  }
  // Revenue counts confirmed + completed bookings (plus late fees via extra(b)), placed in the bucket of the trip's first day.
  // Occupancy = booked car-days / (cars in stock x days). Cancelled bookings count for nothing, except in the cancel rate.
  function compute(bookings, cars, range, now = new Date(), extra = () => 0) {
    const bk = buckets(range, now), units = cars.reduce((s, c) => s + (+c.units || 0), 0), from = bk[0].s, to = bk[bk.length - 1].e;
    const live = bookings.filter(b => b.status !== 'cancelled'), earn = b => b.status === 'confirmed' || b.status === 'completed';
    const rows = bk.map(x => {
      const inB = live.filter(b => b.from >= x.s && b.from < x.e), span = diffDays(x.s, x.e);
      let used = 0; live.forEach(b => { const d = diffDays(b.from > x.s ? b.from : x.s, b.to < x.e ? b.to : x.e); if (d > 0) used += d; });
      const cap = units * span;
      return { ...x, count: inB.length, revenue: inB.filter(earn).reduce((s, b) => s + (+b.total || 0) + (+extra(b) || 0), 0), used, cap, occ: cap ? Math.min(100, Math.round(used / cap * 100)) : 0 };
    });
    const inRange = bookings.filter(b => b.from >= from && b.from < to), active = inRange.filter(b => b.status !== 'cancelled'), paid = active.filter(earn);
    const revenue = rows.reduce((s, r) => s + r.revenue, 0), used = rows.reduce((s, r) => s + r.used, 0), cap = rows.reduce((s, r) => s + r.cap, 0);
    const per = {}; active.forEach(b => { const c = per[b.car] = per[b.car] || { name: b.car, bookings: 0, revenue: 0 }; c.bookings++; if (earn(b)) c.revenue += (+b.total || 0) + (+extra(b) || 0); });
    return {
      rows, from, to,
      totals: { revenue, bookings: active.length, avg: paid.length ? revenue / paid.length : 0, occ: cap ? Math.min(100, Math.round(used / cap * 100)) : 0, cancelled: inRange.length ? Math.round((inRange.length - active.length) / inRange.length * 100) : 0 },
      top: Object.values(per).sort((a, b) => b.revenue - a.revenue || b.bookings - a.bookings).slice(0, 8),
    };
  }

  // ---------- 3. timeline
  // events: [{ s, e }] day numbers (first and last day, inclusive). Each event gets a .lane (0, 1, ...) so overlaps sit in separate lanes.
  function lanes(events) {
    const items = [...events].sort((a, b) => a.s - b.s || a.e - b.e), ends = [];
    items.forEach(x => { let i = ends.findIndex(e => e < x.s); if (i < 0) { i = ends.length; ends.push(0); } ends[i] = x.e; x.lane = i; });
    return { items, n: Math.max(1, ends.length) };
  }
  return { iso, day, addDays, diffDays, diff, record, list, install, buckets, compute, lanes, AREAS };
})();
