// Currency: prices are stored in USD and converted for display. Rates come from SITE.currencies (core/config.js).
//   HZC.usd(n)  -> HTML <span> that re-formats itself when the currency changes (use inside templates)
//   HZC.txt(n)  -> plain text in the current currency        HZC.set('PHP') -> switch currency
//   HZC.all() -> the full list (incl. hidden ones) for the admin Currency tab; HZC.saveList(list) saves it
//   HZC.inText(s) -> converts every "$79" inside an (already escaped) USD string, e.g. saved booking line labels
const HZC = (() => {
  // Currency list: built-in rows from config.js, or the list an admin saved (admin.html > Currency) in this browser.
  // Stored list rows: { code, name, rate (units per 1 USD), whole (no decimals), on (shown to visitors) }.
  const KEY = 'hz-currencies';
  const DEFAULTS = SITE.currencies.map(c => ({ code: c[0], name: c[1], rate: c[2], whole: SITE.wholeCurrencies.includes(c[0]), on: true }));
  const all = () => {
    const v = HZStore.get(KEY, null);
    const list = Array.isArray(v) && v.length ? v.map(x => ({ ...x })) : DEFAULTS.map(x => ({ ...x }));
    if (!list.some(x => x.code === 'USD')) list.unshift({ code: 'USD', name: 'US dollar', rate: 1, whole: false, on: true });
    return list;
  };
  // Main (base) currency: the one admins think in. Prices stay stored in USD internally, so changing it never changes what a car is worth.
  const BASE = 'hz-base';
  const base = () => { const c = HZStore.raw(BASE, 'USD'); return all().some(x => x.code === c) ? c : 'USD'; };
  const live = () => all().filter(x => x.code === 'USD' || x.code === base() || x.on !== false);
  const apply0 = () => { SITE.currencies = live().map(x => [x.code, x.name, +x.rate || 1]); SITE.wholeCurrencies = all().filter(x => x.whole).map(x => x.code); };
  apply0();
  const RATES = Object.fromEntries(SITE.currencies.map(c => [c[0], c[2]]));
  const isAdmin = () => { try { const u = HZ.current(); return !!u && u.role === 'admin'; } catch (e) { return false; } };
  const guard = () => { if (!isAdmin()) { const e = new Error('Admins only.'); e.user = true; throw e; } };
  function saveList(list) {
    guard();
    if (!HZStore.set(KEY, list)) { const e = new Error('Could not save (browser storage is full or blocked).'); e.user = true; throw e; }
    refresh();
  }
  const resetList = () => { guard(); HZStore.remove(KEY); HZStore.remove(BASE); refresh(); };
  function setBase(code) {
    guard();
    if (!all().some(x => x.code === code)) { const e = new Error(code + ' is not in the currency list.'); e.user = true; throw e; }
    HZStore.setRaw(BASE, code); refresh();
  }
  // Re-read the list into RATES and re-price everything on the page.
  function refresh() {
    apply0();
    Object.keys(RATES).forEach(k => delete RATES[k]);
    SITE.currencies.forEach(c => { RATES[c[0]] = c[2]; });
    document.dispatchEvent(new CustomEvent('currencychange', { detail: cur() }));
  }
  const cur = () => { const c = HZStore.raw('hz-currency', ''); return RATES[c] ? c : (RATES[base()] ? base() : 'USD'); };
  const set = code => { if (!RATES[code]) return; HZStore.setRaw('hz-currency', code); document.dispatchEvent(new CustomEvent('currencychange', { detail: code })); };
  const txt = (usd, dec) => {
    const c = cur(), v = (+usd || 0) * RATES[c], d = SITE.wholeCurrencies.includes(c) ? 0 : (dec || 0);
    try { return new Intl.NumberFormat('en-US', { style: 'currency', currency: c, minimumFractionDigits: d, maximumFractionDigits: d }).format(v); }
    catch (e) { return c + ' ' + v.toFixed(d); }
  };
  // Format a stored (USD) amount in one particular currency, e.g. the main currency: fmtIn(HZC.base(), 198)
  const fmtIn = (code, usdAmt, dec) => { const v = (+usdAmt || 0) * (RATES[code] || 1), d = SITE.wholeCurrencies.includes(code) ? 0 : (dec || 0);
    try { return new Intl.NumberFormat('en-US', { style: 'currency', currency: code, minimumFractionDigits: d, maximumFractionDigits: d }).format(v); } catch (e) { return code + ' ' + v.toFixed(d); } };
  const baseName = () => { const x = all().find(y => y.code === base()); return x ? x.name : base(); };
  const usd = (n, dec) => `<span data-usd="${+n || 0}"${dec ? ` data-dec="${dec}"` : ''}>${txt(n, dec)}</span>`;
  const inText = s => String(s).replace(/\$([\d,]+(?:\.\d+)?)/g, (_, n) => usd(+n.replace(/,/g, ''), n.includes('.') ? 2 : 0));
  const apply = () => document.querySelectorAll('[data-usd]').forEach(el => {
    const t = txt(el.dataset.usd, +el.dataset.dec || 0); if (el.textContent !== t) el.textContent = t;
  });
  document.addEventListener('currencychange', apply);
  new MutationObserver(apply).observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', apply);
  apply();
  return { RATES, cur, base, baseName, fmtIn, setBase, set, txt, usd, inText, apply, all, defaults: DEFAULTS, saveList, resetList };
})();
