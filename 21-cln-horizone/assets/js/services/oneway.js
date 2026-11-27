// One-way rules: can a car picked up in A be returned to B, and what does it cost?
// Reads ROUTES (data/routes.js). The car page sidebar, the cars search and the home search all use this,
// so they cannot disagree. Needs (loaded before it): data/routes.js.
const HZONEWAY = (() => {
  const routes = () => (typeof ROUTES !== 'undefined' && Array.isArray(ROUTES) ? ROUTES : []);
  const find = (a, b) => routes().find(r => (r[0] === a && r[1] === b) || (r[0] === b && r[1] === a)) || null;
  const feeOf = r => { const n = r && r[4] !== undefined && r[4] !== '' ? +r[4] : NaN; if (Number.isFinite(n)) return n; const m = r && /\$\s*([\d.]+)/.exec(r[3] || ''); return m ? +m[1] : 0; };
  // ---- Admin side (Admin > Forms > One-way routes). Saved rows: { id, a, b, km, info, fee(USD) }
  const KEY = 'hz-routes';
  const fail = m => { const e = new Error(m); e.user = true; throw e; };
  const guard = () => { let u = null; try { u = HZ.current(); } catch (e) {} if (!u || u.role !== 'admin') fail('Admins only.'); };
  const stored = () => { const v = HZStore.get(KEY, null); return Array.isArray(v) ? v : null; };
  const kmOf = s => { const m = /about\s+([\d,]+)\s*km/i.exec(s || ''); return m ? +m[1].replace(/,/g, '') : ''; };
  // What the admin sees: the saved list, or (before the first save) the sample routes whose two cities exist as locations.
  function list() {
    const s = stored(); if (s) return s.map(r => ({ ...r }));
    const have = typeof HZLOC !== 'undefined' ? HZLOC.all().map(l => l.city) : [];
    return (typeof ROUTES_DEFAULT !== 'undefined' ? ROUTES_DEFAULT : []).filter(r => have.includes(r[0]) && have.includes(r[1]))
      .map((r, i) => ({ id: 'd' + i, a: r[0], b: r[1], km: kmOf(r[2]), info: r[2], fee: +r[4] || 0 }));
  }
  function save(rows) { guard(); if (!HZStore.set(KEY, rows)) fail('Could not save (browser storage is full or blocked).'); applyRoutes(rows); return rows; }
  function reset() { guard(); HZStore.remove(KEY); applyRoutes(routeDefaultRows()); }
  return {
    list, save, reset, isCustom: () => stored() !== null,
    find,
    valid: (a, b) => !!a && !!b && a !== b && !!find(a, b),            // is there a route between these two?
    fee: (a, b) => { const r = find(a, b); return r ? feeOf(r) : null; }, // USD, or null when there is no route
    // every location reachable from `city`; pass `pool` to keep only locations that car/site actually offers
    from: (city, pool) => { const out = routes().filter(r => r[0] === city || r[1] === city).map(r => r[0] === city ? r[1] : r[0]); return pool ? out.filter(c => pool.includes(c)) : out; },
  };
})();
