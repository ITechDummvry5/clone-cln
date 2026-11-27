// Safe wrappers around localStorage (it can be blocked or full). Every key in the app goes through here.
//   get/set  : JSON values        raw/setRaw : plain strings        remove : delete a key
const HZStore = {
  get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
  raw(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } },
  setRaw(k, v) { try { localStorage.setItem(k, String(v)); return true; } catch (e) { return false; } },
  remove(k) { try { localStorage.removeItem(k); return true; } catch (e) { return false; } },
};

// Admin > Forms > Taxes & fees: every page uses the saved rate.
{ const f = HZStore.get('hz-form', null), r = f && f.tax && Number(f.tax.rate); if (Number.isFinite(r) && r >= 0 && r <= 100 && typeof TAX_RATE !== 'undefined') TAX_RATE = r / 100; }
