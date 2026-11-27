// Booking panel settings (the sidebar on the car page). Admin > Forms edits them; car.js reads them.
// These are SETTINGS, not data, so they start with sensible defaults. Every section can be reset to those defaults.
// Amounts (prices, excess, fees) are typed in the MAIN currency in the admin and kept as a fixed value internally, so a visitor always sees them converted from the main currency to the currency they picked.
// Stored in 'hz-form': { protection:[], extras:[], driver:{}, tax:{}, times:{}, late:{}, options:{}, longstay:{} }  (only the parts an admin changed)
const HZFORM = (() => {
  const KEY = 'hz-form';
  const fail = m => { const e = new Error(m); e.user = true; throw e; };
  const guard = () => { let u = null; try { u = HZ.current(); } catch (e) {} if (!u || u.role !== 'admin') fail('Admins only.'); };
  const DEFAULTS = {
    protection: [
      { id: 'basic', name: 'Basic', price: 0, excess: 1200, covers: 'Collision & theft cover', recommended: false, active: true },
      { id: 'standard', name: 'Standard', price: 12, excess: 300, covers: 'Tyres, glass & mirrors, Roadside assistance plus', recommended: true, active: true },
      { id: 'full', name: 'Full', price: 22, excess: 0, covers: 'Lost keys & lock-out, Personal accident cover', recommended: false, active: true },
    ],
    extras: [
      { id: 'driver', name: 'Additional driver', price: 6, kind: 'count', max: 3, active: true },
      { id: 'child', name: 'Child seat', price: 8, kind: 'count', max: 3, active: true },
      { id: 'gps', name: 'GPS navigation', price: 5, kind: 'check', max: 1, active: true },
      { id: 'wifi', name: 'Mobile Wi-Fi hotspot', price: 7, kind: 'check', max: 1, active: true },
    ],
    driver: { chauffeur: { on: true, price: 45 }, young: { on: true, age: 25, fee: 15 } },
    tax: { label: 'Taxes & fees', rate: 10 },
    times: { start: 360, end: 1320, step: 30 },   // minutes after midnight
    late: { on: true, mode: 'tune', grace: 60, flat: 0, rate: 10, cap: 80, s2after: 0, s2rate: 0, rules: [] },   // late returns: free grace (minutes), optional one-time flat fee, then 'rate' USD per started hour (after s2after hours late: s2rate), max 'cap' USD per day (0 = none). rules = [{ by: 'car' | 'type' | 'city', value, grace?, flat?, rate?, cap? }] special rules; a car beats a car type, which beats a pick-up city
    // Automatic long-rental rates (Admin > Setup > Pricing rules > Long-rental rates). The better of weekly / monthly applies, never both.
    // pct = % off the base rental (price x days) once the rental reaches 'days'. cap = most a booking can get off its base rental from the automatic rate PLUS a promo code together (% , 0 = no limit).
    longstay: { on: true, weekly: { on: true, days: 7, pct: 7 }, monthly: { on: true, days: 28, pct: 15 }, cap: 70 },
    // The "Savings that apply on their own" cards on the Deals page (Admin > Website > Deals page cards).
    // kind: 'weekly' | 'monthly' | 'oneway' fill themselves in from the real settings (empty value / title / text = automatic); 'custom' is fully typed by the admin.
    savings: { title: 'Savings that apply on their own', sub: 'No code needed. They show up in the price the moment they apply.', cards: [
      { id: 'weekly', kind: 'weekly', active: true, value: '', title: '', text: '' },
      { id: 'monthly', kind: 'monthly', active: true, value: '', title: '', text: '' },
      { id: 'oneway', kind: 'oneway', active: true, value: '', title: '', text: '' },
    ] },
    options: { promo: true, oneWay: true, buffer: 2 },   // buffer = hours a car is held back after each rental (cleaning, hand-over)
  };
  const clone = x => JSON.parse(JSON.stringify(x));
  const stored = () => { const v = HZStore.get(KEY, {}); return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; };
  function get(k) {
    const s = stored()[k], d = DEFAULTS[k];
    if (s === undefined) return clone(d);
    if (Array.isArray(d)) return Array.isArray(s) && s.length ? clone(s).map(r => k === 'protection' && r.covers === undefined ? { ...r, covers: r.detail || '', excess: r.excess === undefined ? null : r.excess } : r) : clone(d);
    if (k === 'driver') return { chauffeur: { ...d.chauffeur, ...(s.chauffeur || {}) }, young: { ...d.young, ...(s.young || {}) } };
    if (k === 'late') { if (Array.isArray(s.tiers)) return { ...clone(d), on: s.on !== false };   /* old hour-range table: use the simple defaults, keep the on/off switch */ { const m = { ...clone(d), ...s }; delete m.cars; m.rules = Array.isArray(s.rules) ? s.rules : []; if (s.cars && typeof s.cars === 'object' && !Array.isArray(s.cars) && !m.rules.length) m.rules = Object.entries(s.cars).map(([value, o]) => ({ by: 'car', value, ...o })); return m; } }
    if (k === 'savings') return { ...clone(d), ...s, cards: Array.isArray(s.cards) ? clone(s.cards) : clone(d.cards) };
    if (k === 'longstay') return { ...d, ...s, weekly: { ...d.weekly, ...(s.weekly || {}) }, monthly: { ...d.monthly, ...(s.monthly || {}) } };
    return { ...d, ...s };
  }
  // The Deals page cards, resolved: [{ id, kind, big, usd, title, text, active, show, why }]. 'show' is what the page really displays:
  // a card is hidden when it is switched off, or when it would promise something that is not true right now (a rate that is off, a one-way route that has no free fee).
  function savingsCards() {
    const c = get('savings'), L = get('longstay'), pc = n => `${+n}%`, str = v => String(v == null ? '' : v).trim();
    // Only routes checkout would really offer: a free fee AND both cities are locations on the site (the same rule the booking panel uses).
    const have = typeof SITE !== 'undefined' && Array.isArray(SITE.cities) ? SITE.cities : [];
    const free = typeof ROUTES !== 'undefined' && typeof HZONEWAY !== 'undefined' ? ROUTES.filter(r => have.includes(r[0]) && have.includes(r[1]) && HZONEWAY.fee(r[0], r[1]) === 0).map(r => [r[0], r[1]]) : [];
    return c.cards.map(x => {
      const o = { id: x.id, kind: x.kind, big: str(x.value), title: str(x.title), text: str(x.text), usd: false, active: x.active !== false, show: x.active !== false, why: '' };
      const hide = m => { o.show = false; if (o.active) o.why = m; };
      if (x.kind === 'weekly' || x.kind === 'monthly') {
        const t = L[x.kind], live = !!(L.on && t && t.on && +t.pct > 0), wk = x.kind === 'weekly';
        if (!live) hide('Hidden: this rate is switched off in Long-rental rates.');
        o.big = o.big || (live ? pc(t.pct) : '');
        o.title = o.title || (wk ? 'Weekly rate' : 'Monthly rate');
        o.text = o.text || (!live ? '' : wk ? `Book ${+t.days} days or more and the base rental price drops by ${pc(t.pct)}.` : `${+t.days} days or more, the cheapest way to keep a car for a season. Takes ${pc(t.pct)} off the base rental price.`);
      } else if (x.kind === 'oneway') {
        if (!free.length) hide('Hidden: no one-way route has a $0 fee right now (Locations > One-way routes).');
        o.usd = !o.big; o.title = o.title || 'One-way on select routes';
        o.pairs = free;   // [[A, B], ...] shown as chips on the Deals page (first 3, the rest behind "+N more")
        o.text = o.text || (free.length ? `No drop fee on ${free.length} route${free.length === 1 ? '' : 's'}. Choose a different return location when you book to see if yours qualifies.` : '');
      } else if (!o.big && !o.title && !o.text) hide('Hidden: the card is empty.');
      return o;
    });
  }
  // Heading and line under it; an empty heading falls back to the default, an empty line is hidden.
  const savingsHead = () => { const c = get('savings'); return { title: str1(c.title) || DEFAULTS.savings.title, sub: str1(c.sub) }; };
  const str1 = v => String(v == null ? '' : v).trim();
  // The automatic long-rental discount for a rental of `days` days: { tier, label, pct, days } or null.
  // One discount per booking: when both tiers qualify the bigger one wins. Used by the car page, the cars list and the Deals page.
  function stay(days) {
    const c = get('longstay'), n = Math.floor(+days || 0); if (!c.on || n < 1) return null;
    const pick = k => { const t = c[k]; if (!t || !t.on) return null; const pct = +t.pct; return pct > 0 && n >= +t.days ? { tier: k, label: k === 'monthly' ? 'Monthly rate' : 'Weekly rate', pct, days: +t.days } : null; };
    return [pick('monthly'), pick('weekly')].filter(Boolean).sort((a, b) => b.pct - a.pct)[0] || null;
  }
  const protection = () => { const a = get('protection').filter(p => p.active); return a.length ? a : clone(DEFAULTS.protection).slice(0, 1); };
  const extras = () => get('extras').filter(x => x.active);
  function save(k, v) { guard(); if (!(k in DEFAULTS)) fail('Unknown settings section.'); const s = stored(); s[k] = v; if (!HZStore.set(KEY, s)) fail('Could not save (browser storage is full or blocked).'); }
  function reset(k) { guard(); const s = stored(); delete s[k]; if (!HZStore.set(KEY, s)) fail('Could not save (browser storage is full or blocked).'); }
  const isCustom = k => stored()[k] !== undefined;
  return { get, protection, extras, driver: () => get('driver'), tax: () => get('tax'), late: () => get('late'), options: () => get('options'), longstay: () => get('longstay'), stay, savingsCards, savingsHead, save, reset, isCustom, DEFAULTS };
})();
