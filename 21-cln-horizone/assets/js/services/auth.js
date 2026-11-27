// Horizone accounts, bookings, site settings and contact messages, kept in this browser's localStorage.
// Needs: core/storage.js, core/utils.js (esc), core/currency.js (money), components/toast.js (for HZ.toast).
// PROTOTYPE ONLY: anyone who opens dev tools can read or edit this data and make themselves an admin.
// When you add a server, keep this file's function names and move the bodies to API calls.
const HZ = (() => {
  const KEY = { users: 'hz-users', session: 'hz-session', bookings: 'hz-bookings', fails: 'hz-fails' };
  const ADMIN = { name: 'Horizone Admin', email: 'admin@horizone.test', password: 'Admin123!' }; // change after first login
  const read = HZStore.get, write = HZStore.set;   // core/storage.js
  const rid = n => { const a = new Uint8Array(n); (window.crypto || {}).getRandomValues ? crypto.getRandomValues(a) : a.forEach((_, i) => a[i] = Math.random() * 256); return [...a].map(b => b.toString(16).padStart(2, '0')).join(''); };

  async function hash(pw, salt) {
    if (window.crypto && crypto.subtle) {
      const enc = new TextEncoder();
      const k = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']);
      const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: enc.encode(salt), iterations: 100000, hash: 'SHA-256' }, k, 256);
      return 'p1:' + [...new Uint8Array(bits)].map(b => b.toString(16).padStart(2, '0')).join('');
    }
    let h = 5381; for (const ch of salt + pw) h = ((h << 5) + h + ch.charCodeAt(0)) | 0;   // weak fallback for non-secure contexts
    return 'w0:' + h;
  }
  const fail = m => { const e = new Error(m); e.user = true; throw e; };
  const clean = u => { if (!u) return null; const { hash: _h, salt: _s, ...rest } = u; return rest; };
  const norm = e => String(e || '').trim().toLowerCase();
  const okEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
  const okPw = p => typeof p === 'string' && p.length >= 8;

  let seeded;
  const seed = () => seeded || (seeded = (async () => {
    const us = read(KEY.users, []);
    if (!us.some(u => u.role === 'admin')) {
      const salt = rid(16);
      us.push({ id: 'u-admin', name: ADMIN.name, email: ADMIN.email, phone: '', role: 'admin', salt, hash: await hash(ADMIN.password, salt), created: new Date().toISOString() });
      write(KEY.users, us);
    }
  })());
  seed();

  const users = () => read(KEY.users, []);
  const bookings = () => read(KEY.bookings, []);
  const current = () => { const s = read(KEY.session, null); return s ? clean(users().find(u => u.id === s.uid)) : null; };
  const setSession = u => write(KEY.session, { uid: u.id, at: Date.now() });

  async function signUp({ name, email, phone, password }) {
    await seed(); email = norm(email); name = String(name || '').trim();
    if (name.length < 2) fail('Enter your full name.');
    if (!okEmail(email)) fail('Enter a valid email address.');
    if (!okPw(password)) fail('Use a password of at least 8 characters.');
    const us = users();
    if (us.some(u => u.email === email)) fail('An account with that email already exists. Try signing in.');
    const salt = rid(16);
    const u = { id: 'u-' + rid(6), name, email, phone: String(phone || '').trim(), role: 'client', salt, hash: await hash(password, salt), created: new Date().toISOString() };
    us.push(u); write(KEY.users, us); setSession(u); return clean(u);
  }
  async function signIn(email, password) {
    await seed(); email = norm(email);
    const f = read(KEY.fails, {}), rec = f[email] || { n: 0, until: 0 };
    if (rec.until > Date.now()) fail(`Too many attempts. Try again in ${Math.ceil((rec.until - Date.now()) / 1000)} seconds.`);
    const u = users().find(x => x.email === email);
    const good = u && (await hash(String(password || ''), u.salt)) === u.hash;
    if (!good) {
      rec.n += 1; if (rec.n >= 5) { rec.n = 0; rec.until = Date.now() + 30000; }
      f[email] = rec; write(KEY.fails, f); fail('Email or password is incorrect.');
    }
    delete f[email]; write(KEY.fails, f); setSession(u); return clean(u);
  }
  const signOut = () => { HZStore.remove(KEY.session); try { sessionStorage.removeItem('hz-admin-unlock'); } catch (e) { /* ignore */ } };
  const safeNext = n => (/^[\w.-]+\.html(\?[\w=&%.+:-]*)?(#[\w-]*)?$/.test(n || '') ? n : '');
  function guard(role) {
    const u = current();
    if (!u) { location.replace('login.html?next=' + encodeURIComponent(location.pathname.split('/').pop() + location.search)); return null; }
    if (role === 'admin' && u.role !== 'admin') { location.replace('account.html'); return null; }
    return u;
  }

  function addBooking(b) {
    const u = current(); if (!u) fail('Please sign in to reserve.');
    const all = bookings();
    const pick = ['car', 'carSlug', 'pickup', 'ret', 'from', 'ft', 'to', 'tt', 'mode', 'days', 'total', 'lines', 'promo', 'stay'];
    const data = {}; pick.forEach(k => { if (b[k] !== undefined) data[k] = b[k]; });
    if (!data.car || !/^\d{4}-\d{2}-\d{2}$/.test(data.from) || !/^\d{4}-\d{2}-\d{2}$/.test(data.to) || !(data.days >= 1)) fail('That reservation is incomplete. Please try again.');
    // Re-check availability at save time (the car page and the sign-in route both end here), so two guests can't hold the same last car.
    if (typeof HZFLEET !== 'undefined' && !HZFLEET.left(data.car, data)) fail('Sorry, this car was just booked for those dates. Please choose different dates or another car.');
    if (data.promo) {   // re-check the code when the booking is saved, not only when it was typed
      const ev = typeof FLEET !== 'undefined' && (FLEET.find(x => x[0] === data.car) || [])[3] === 'Electric';
      const c = typeof HZDEALS === 'undefined' ? { ok: false, msg: 'Promo codes are not available right now.' } : HZDEALS.check(data.promo.code, { days: data.days, ev, car: data.car, pickup: data.pickup });
      if (!c.ok) fail(c.msg); data.promo = { code: c.deal.code, off: +data.promo.off || 0 };
    }
    if (data.stay) data.stay = { tier: data.stay.tier === 'monthly' ? 'monthly' : 'weekly', pct: +data.stay.pct || 0, off: +data.stay.off || 0 };   // automatic long-rental rate, kept for the admin report
    const rec = { ...data, id: 'HZ-' + rid(3).toUpperCase(), uid: u.id, customer: { name: u.name, email: u.email, phone: u.phone || '' }, status: 'pending', created: new Date().toISOString() };
    all.push(rec); if (!write(KEY.bookings, all)) fail('Could not save the booking (browser storage is full or blocked).'); return rec;
  }
  const mine = uid => bookings().filter(b => b.uid === uid);
  function patchBooking(id, fn) {
    const all = bookings(), b = all.find(x => x.id === id); if (!b) fail('Booking not found.');
    fn(b); write(KEY.bookings, all); return b;
  }
  function cancel(id) {
    const u = current(); if (!u) fail('Please sign in.');
    return patchBooking(id, b => {
      if (b.uid !== u.id && u.role !== 'admin') fail('You can only cancel your own bookings.');
      if (!['pending', 'confirmed'].includes(b.status)) fail('This booking can no longer be cancelled.');
      b.status = 'cancelled';
    });
  }
  function setStatus(id, status) {
    const u = current(); if (!u || u.role !== 'admin') fail('Admins only.');
    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) fail('Unknown status.');
    return patchBooking(id, b => {
      const live = s => s === 'pending' || s === 'confirmed';   // bringing a cancelled/completed booking back must not exceed the stock
      if (live(status) && !live(b.status) && typeof HZFLEET !== 'undefined' && !HZFLEET.left(b.car, b, b.id)) fail(`No ${b.car} is free for ${b.from} to ${b.to}, so this booking can’t be set to ${status}.`);
      b.status = status;
    });
  }
  // Admin: record when the car really came back. Works out the late fee from the rules in force now and completes the booking.
  function markReturned(id, when) {
    adminOnly();
    const t = when ? new Date(when) : new Date();
    if (isNaN(t)) fail('Enter a valid return date and time.');
    if (t > new Date(Date.now() + 6e4)) fail('The return time can’t be in the future.');
    return patchBooking(id, b => {
      if (!['confirmed', 'completed'].includes(b.status)) fail('Only a confirmed booking can be marked as returned.');
      if (t < starts(b)) fail('The car can’t come back before the pick-up time.');
      const c = lateCalc(b, t);
      b.late = { returnedAt: t.toISOString(), over: c.over, hours: c.hours, fee: c.fee }; b.status = 'completed';
    });
  }
  // Admin: change or waive the fee on a booking that has been handed back (usd = 0 waives it).
  function setLateFee(id, usd) {
    adminOnly(); usd = Number(usd);
    if (!(usd >= 0) || !isFinite(usd)) fail('The late fee can’t be negative.');
    return patchBooking(id, b => { if (!b.late) fail('Record the return first.'); b.late = { ...b.late, fee: +usd.toFixed(2), manual: true }; });
  }
  function removeBooking(id) {
    const u = current(); if (!u || u.role !== 'admin') fail('Admins only.');
    write(KEY.bookings, bookings().filter(b => b.id !== id));
  }

  function setRole(id, role) {
    const me = current(); if (!me || me.role !== 'admin') fail('Admins only.');
    const us = users(), t = us.find(u => u.id === id); if (!t) fail('User not found.');
    if (t.id === me.id) fail('You cannot change your own role.');
    if (!['client', 'admin'].includes(role)) fail('Unknown role.');
    t.role = role; write(KEY.users, us);
  }
  function removeUser(id) {
    const me = current(); if (!me || me.role !== 'admin') fail('Admins only.');
    if (id === me.id) fail('You cannot delete your own account here.');
    write(KEY.users, users().filter(u => u.id !== id));
    write(KEY.bookings, bookings().filter(b => b.uid !== id));
  }
  function updateProfile({ name, phone }) {
    const me = current(); if (!me) fail('Please sign in.');
    name = String(name || '').trim(); if (name.length < 2) fail('Enter your full name.');
    const us = users(), u = us.find(x => x.id === me.id); u.name = name; u.phone = String(phone || '').trim(); write(KEY.users, us);
    const all = bookings(); all.forEach(b => { if (b.uid === me.id) b.customer = { ...b.customer, name: u.name, phone: u.phone }; }); write(KEY.bookings, all);
    return clean(u);
  }
  async function changePassword(oldPw, newPw) {
    const me = current(); if (!me) fail('Please sign in.');
    const us = users(), u = us.find(x => x.id === me.id);
    if ((await hash(String(oldPw || ''), u.salt)) !== u.hash) fail('Your current password is incorrect.');
    if (!okPw(newPw)) fail('Use a new password of at least 8 characters.');
    u.salt = rid(16); u.hash = await hash(newPw, u.salt); write(KEY.users, us);
  }
  // ---- bulk removal (Settings > Sample data > Remove data). The admin must type their password again each time.
  async function verifyAdmin(password) {
    const me = current(); if (!me || me.role !== 'admin') fail('Admins only.');
    const u = users().find(x => x.id === me.id);
    const fk = 'unlock:' + me.id, f = read(KEY.fails, {}), rec = f[fk] || { n: 0, until: 0 };
    if (rec.until > Date.now()) fail(`Too many attempts. Try again in ${Math.ceil((rec.until - Date.now()) / 1000)} seconds.`);
    if ((await hash(String(password || ''), u.salt)) !== u.hash) {
      rec.n += 1; if (rec.n >= 5) { rec.n = 0; rec.until = Date.now() + 30000; }
      f[fk] = rec; write(KEY.fails, f); fail('Password is incorrect.');
    }
    if (f[fk]) { delete f[fk]; write(KEY.fails, f); }
  }
  const adminOnly = () => { const me = current(); if (!me || me.role !== 'admin') fail('Admins only.'); return me; };
  function removeCustomers() {   // every account that is not an admin, and the bookings they made
    adminOnly(); const keep = users().filter(u => u.role === 'admin');
    write(KEY.users, keep); write(KEY.bookings, bookings().filter(b => keep.some(u => u.id === b.uid)));
  }
  function removeAllBookings() { adminOnly(); write(KEY.bookings, []); }
  function removeAllMessages() { adminOnly(); write(MSG_KEY, []); }
  async function deleteOwnAccount(password) {
    const me = current(); if (!me) fail('Please sign in.');
    const u = users().find(x => x.id === me.id);
    if ((await hash(String(password || ''), u.salt)) !== u.hash) fail('Password is incorrect.');
    if (u.role === 'admin' && users().filter(x => x.role === 'admin').length < 2) fail('You are the only admin. Make someone else an admin first.');
    write(KEY.users, users().filter(x => x.id !== me.id)); write(KEY.bookings, bookings().filter(b => b.uid !== me.id)); signOut();
  }

  // ---- booking helpers shared by the panels
  const parseTime = t => { const m = /^(\d{1,2}):(\d{2}) (AM|PM)$/.exec(t || ''); if (!m) return [10, 0]; let h = +m[1] % 12; if (m[3] === 'PM') h += 12; return [h, +m[2]]; };
  const at = (d, t) => { const [h, m] = parseTime(t); const x = new Date(d + 'T00:00'); x.setHours(h, m); return x; };
  const starts = b => at(b.from, b.ft), ends = b => at(b.to, b.tt);

  // ---- late returns. One simple rule, set in Admin > Setup > Pricing rules > Late-return charges (HZFORM 'late'):
  //   a free grace period (minutes), then a fee for each started hour, never more than a maximum (cap, 0 = no limit).
  // Fees are kept in USD like every other amount. A booking that has been handed back carries b.late = { returnedAt, over, hours, fee, manual? }, saved at that moment
  // so changing the rules later never rewrites old bookings. A customer can warn the desk with notifyLate(), saved as b.lateNote = { mins, at }.
  // Flat-rate mode: only the grace period and the flat fee count. Fine-tune mode: only the hourly fee and daily limit count (no flat fee, no higher rate later).
  const flatNorm = p => !p ? p : p.mode === 'flat' ? { ...p, rate: 0, cap: 0, s2after: 0, s2rate: 0 } : { ...p, flat: 0, s2after: 0, s2rate: 0 };
  const latePolicy = () => { try { return HZFORM.get('late'); } catch (e) { return { on: false, grace: 0, rate: 0, cap: 0 }; } };
  // Plain words for a number of minutes: "30 minutes", "1 hour", "1 hour 30 min".
  const mins = m => { m = Math.round(m); const d = Math.floor(m / 1440), h = Math.floor(m % 1440 / 60), r = m % 60, u = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
    return [d && u(d, 'day'), h && u(h, 'hour'), r && (d || h ? `${r} min` : u(r, 'minute'))].filter(Boolean).join(' ') || '0 minutes'; };
  // The rule that applies to a trip. `x` is a car name or { car, type?, city? } (a booking works too). The main rule, then any special rules that match:
  // pick-up city first, then car type, then the exact car (the most specific wins field by field).
  const policyFor = (x, p = latePolicy()) => {
    const t = typeof x === 'string' ? { car: x } : (x || {}), car = t.car, f = typeof FLEET !== 'undefined' ? FLEET.find(c => c[0] === car) : null, type = t.type || (f && f[1]), city = t.city || t.pickup;
    const m = { ...p }; delete m.rules; delete m.cars;
    for (const by of ['city', 'type', 'car']) {
      const val = by === 'car' ? car : by === 'type' ? type : city;
      for (const o of (p.rules || [])) if (o.by === by && val && o.value === val) {
        for (const k of ['grace', 'flat', 'rate', 'cap', 's2after', 's2rate']) if (o[k] !== undefined && o[k] !== null) m[k] = o[k];
        if (o.rate !== undefined && o.rate !== null && o.s2after === undefined) m.s2after = 0;   // its own hourly fee replaces the "higher rate later" stage
      }
    }
    return flatNorm(m);
  };
  // Fee in USD for being `overMin` minutes late under policy p. Pure: used by the admin preview too.
  // After the grace period: an optional one-time flat fee, then `rate` for each started hour (`s2rate` once the car is s2after hours late).
  // The maximum (cap) applies to every 24 billed hours, so a car that is days late keeps paying. The flat fee is outside the cap.
  function lateFee(overMin, p = latePolicy()) {
    p = flatNorm(p);
    if (!p.on || !(overMin > 0)) return 0;
    const grace = +p.grace || 0, billable = overMin - grace; if (!(billable > 0)) return 0;
    const n = Math.ceil(billable / 60 - 1e-9), cap = +p.cap > 0 ? +p.cap : Infinity, s2 = +p.s2after > 0 && +p.s2rate >= 0 && p.s2rate !== '' ? { at: +p.s2after * 60, rate: +p.s2rate } : null;
    let fee = +p.flat || 0, day = 0;
    for (let k = 0; k < n; k++) {
      day += (s2 && grace + k * 60 >= s2.at) ? s2.rate : (+p.rate || 0);
      if ((k + 1) % 24 === 0 || k === n - 1) { fee += Math.min(day, cap); day = 0; }
    }
    return +fee.toFixed(2);
  }
  // The rule in short plain sentences for customers. fmt formats an amount.
  const lateSummary = (fmt, p = latePolicy()) => {
    p = flatNorm(p);
    const f = fmt || money, g = +p.grace || 0, r = +p.rate || 0, flat = +p.flat || 0;
    if (!(r > 0) && !(flat > 0)) return 'Late returns are free.';
    const out = [g ? `Return up to ${mins(g)} late and it is free.` : 'There is no free grace period.'];
    if (p.mode === 'flat') return `${g ? `Return up to ${mins(g)} late and it is free.` : 'There is no free grace period.'} After that a flat fee of ${f(flat)} applies, however late the car is.`;
    const rest = [flat > 0 ? `a one-time fee of ${f(flat)}` : '', r > 0 ? `${f(r)} for each hour (or part of an hour)` : ''].filter(Boolean).join(' plus ');
    out.push(`After that: ${rest}${+p.cap > 0 && r > 0 ? `, capped at ${f(p.cap)} per 24 hours` : ''}.`);
    if (+p.s2after > 0 && +p.s2rate >= 0 && p.s2rate !== '' && +p.s2rate !== r) out.push(`From ${mins(p.s2after * 60)} late the hourly fee becomes ${f(p.s2rate)}.`);
    return out.join(' ');
  };
  // What a car handed back at time `at` costs in late fees. over = hours past the return time (to the minute). Uses the car's own rule if it has one.
  function lateCalc(b, at, p = policyFor(b)) {
    const over = Math.round((new Date(at) - ends(b)) / 6e4) / 60;
    if (!p.on || !(over > 0)) return { over: Math.max(0, over || 0), hours: 0, fee: 0 };
    return { over, hours: Math.ceil(over), fee: lateFee(over * 60, p) };
  }

  // ---- "View all late charges" popup: every fee from the return time up to 3 days late, in 30-minute steps (what a car would be charged if it came back then).
  const EYE = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M12 7.5v5.5"/><circle cx="12" cy="16.6" r=".6" fill="currentColor"/></svg>';   // alert icon (circle with exclamation mark)
  const eyeBtn = (attrs, label = 'View all late charges') => `<button type="button" class="ll-eye" aria-haspopup="dialog" aria-expanded="false" ${attrs} aria-label="${label}" title="${label}">${EYE}</button>`;
  function lateList({ policy, fmt, title = 'Late return charges' } = {}) {
    const p = policy || latePolicy(), f = fmt || (v => (typeof HZC !== 'undefined' ? HZC.txt(v, 2) : String(v)));
    const old = document.getElementById('ll-ov'); if (old) old.remove();
    const g = +p.grace || 0, flat = p.mode === 'flat', days = ['First day', 'Second day', 'Third day'];
    let body = '';
    if (!p.on) body = '<p class="ll-none">Late returns are free.</p>';
    else {
      const graceText = g ? mins(g) : 'None';
      const afterText = flat ? `${f(+p.flat || 0)} one-time` : `${f(+p.rate || 0)} / started hour`;
      const capText = !flat && +p.cap > 0 ? `${f(+p.cap)} / 24 hours` : (flat ? 'One-time fee' : 'No daily cap');
      const steps = [
        { label: '30 min late', value: lateFee(30, p) },
        { label: `${mins(Math.max(60, g + 60))} late`, value: lateFee(Math.max(60, g + 60), p) },
        { label: '1 day late', value: lateFee(1440, p) }
      ];
      const unique = steps.filter((x, i) => steps.findIndex(y => y.label === x.label) === i);
      const examples = unique.map(x => `<div class="ll-example"><span>${x.label}</span><b class="${x.value ? '' : 'free'}">${x.value ? f(x.value) : 'Free'}</b></div>`).join('');
      let detail = '';
      for (let d = 0; d < 3; d++) {
        let rows = '';
        for (let m = d * 1440 + 30; m <= (d + 1) * 1440; m += 30) { const fee = lateFee(m, p); rows += `<div class="ll-r${fee ? '' : ' free'}"><span>${mins(m)} late</span><b>${fee ? f(fee) : 'Free'}</b></div>`; }
        detail += `<h4>${days[d]} <small>${d ? mins(d * 1440) + '–' : 'Up to '}${mins((d + 1) * 1440)} late</small></h4><div class="ll-g">${rows}</div>`;
      }
      const foot = flat ? 'The one-time fee does not increase with additional delay.' : (+p.rate > 0 ? 'The daily limit resets every 24 hours.' : '');
      body = `<div class="ll-summary"><div class="ll-rule"><span>Free grace period</span><b>${esc(graceText)}</b></div><div class="ll-rule"><span>After grace</span><b>${afterText}</b></div><div class="ll-rule"><span>Daily maximum</span><b>${capText}</b></div></div><div class="ll-example-wrap"><div class="ll-subtitle">Quick examples</div><div class="ll-examples">${examples}</div></div><details class="ll-details"><summary>See full charge breakdown <span>30-minute intervals · 3 days</span></summary><div class="ll-detail-body">${detail}</div></details>${foot ? `<p class="ll-foot">${foot}</p>` : ''}`;
    }
    const ov = document.createElement('div'); ov.id = 'll-ov'; ov.className = 'll-ov';
    ov.innerHTML = `<div class="ll-box" role="dialog" aria-modal="true" aria-labelledby="ll-t"><div class="ll-h"><div><h3 id="ll-t">${esc(title)}</h3><p>${lateSummary(f, p)}</p></div><button type="button" class="ll-x" aria-label="Close">&times;</button></div><div class="ll-b">${body}</div></div>`;
    const prev = document.activeElement, close = () => { ov.remove(); document.documentElement.classList.remove('ll-lock'); document.removeEventListener('keydown', key); if (prev && prev.focus) prev.focus(); };
    const key = e => { if (e.key === 'Escape') close(); };
    ov.addEventListener('click', e => { if (e.target === ov || e.target.closest('.ll-x')) close(); });
    document.addEventListener('keydown', key); document.body.appendChild(ov); document.documentElement.classList.add('ll-lock'); ov.querySelector('.ll-x').focus();
  }
  // Customer-side eye buttons open a small anchored popover (not a full-screen modal).
  // The full interval breakdown remains available in the admin pricing preview.
  // One small anchored popover at a time. Opening a new one (or the same one again) always closes the old one and removes its listeners.
  let closePop = null;
  function openPop(anchor, title, innerHtml) {
    if (closePop) closePop();
    const pop = document.createElement('div'); pop.id = 'll-pop'; pop.className = 'll-popover';
    pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', title);
    pop.innerHTML = `<div class="ll-pop-head"><b>${esc(title)}</b><button type="button" class="ll-pop-close" aria-label="Close">×</button></div>${innerHtml}`;
    document.body.appendChild(pop);
    const rect = anchor.getBoundingClientRect(), pad = 12, width = Math.min(320, window.innerWidth - pad * 2);
    pop.style.width = `${width}px`;
    const popHeight = pop.offsetHeight;
    const left = Math.min(Math.max(pad, rect.left + rect.width / 2 - width / 2), window.innerWidth - width - pad);
    let top = rect.bottom + 9;
    if (top + popHeight > window.innerHeight - pad && rect.top - popHeight - 9 >= pad) top = rect.top - popHeight - 9;
    pop.style.left = `${left}px`; pop.style.top = `${Math.max(pad, top)}px`;
    anchor.setAttribute('aria-expanded', 'true');
    const close = () => { pop.remove(); anchor.setAttribute('aria-expanded', 'false'); document.removeEventListener('click', outside, true); document.removeEventListener('keydown', key); window.removeEventListener('resize', close); window.removeEventListener('scroll', onScroll, true); if (closePop === close) closePop = null; };
    const outside = e => { if (!pop.contains(e.target) && !anchor.contains(e.target)) close(); };
    const key = e => { if (e.key === 'Escape') { close(); anchor.focus(); } };
    const onScroll = e => { if (!pop.contains(e.target)) close(); };
    pop.querySelector('.ll-pop-close').addEventListener('click', close);
    document.addEventListener('click', outside, true); document.addEventListener('keydown', key);
    window.addEventListener('resize', close); window.addEventListener('scroll', onScroll, true);
    closePop = close;
  }
  // Customer-side alert buttons open this small popover (not a full-screen modal).
  // The full interval breakdown remains available in the admin pricing preview.
  function latePopover(anchor, policy) {
    const p = flatNorm(policy || latePolicy()), f = v => HZC.txt(v, 2);
    const grace = +p.grace || 0, isFlat = p.mode === 'flat';
    const rows = !p.on ? '<p class="ll-pop-free">Late returns are free.</p>' : `
      <div class="ll-pop-row"><span>Free grace period</span><b>${esc(grace ? mins(grace) : 'None')}</b></div>
      <div class="ll-pop-row"><span>After grace</span><b>${isFlat ? `${esc(f(+p.flat || 0))} one-time` : `${esc(f(+p.rate || 0))} per started hour`}</b></div>
      <div class="ll-pop-row"><span>Daily maximum</span><b>${isFlat ? 'One-time fee' : (+p.cap > 0 ? `${esc(f(+p.cap))} per 24 hours` : 'No cap')}</b></div>
      ${(+p.s2after > 0 && +p.s2rate >= 0 && p.s2rate !== '' && +p.s2rate !== (+p.rate || 0)) ? `<p class="ll-pop-note">After ${esc(mins(+p.s2after * 60))} late, the hourly rate changes to ${esc(f(+p.s2rate))}.</p>` : ''}`;
    openPop(anchor, 'Late return charges', rows);
  }
  // A short message behind an alert button. `html` must already be escaped by the caller.
  const notePopover = (anchor, title, html) => openPop(anchor, title, `<p class="ll-pop-msg">${html}</p>`);
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('[data-late-list]'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    if (closePop && b.getAttribute('aria-expanded') === 'true') { closePop(); return; }
    const bk = b.dataset.lateBooking ? bookings().find(x => x.id === b.dataset.lateBooking) : null;
    latePopover(b, bk ? policyFor(bk) : policyFor({ car: b.dataset.lateCar, type: b.dataset.lateType }));
  });
  // Latest time a trip can end without paying anything.
  const freeUntil = (b, p = policyFor(b)) => new Date(ends(b).getTime() + (p.on ? (+p.grace || 0) : 0) * 6e4);
  // Customer: tell the desk how late the car will be (minutes after the return time). Only on your own confirmed trip.
  function notifyLate(id, m) {
    const u = current(); if (!u) fail('Please sign in.'); m = Math.round(Number(m));
    if (!(m > 0 && m <= 7 * 24 * 60)) fail('Choose how late you will be.');
    return patchBooking(id, b => {
      if (b.uid !== u.id) fail('You can only update your own bookings.');
      if (b.status !== 'confirmed' || b.late) fail('This booking is not on the road right now.');
      b.lateNote = { mins: m, at: new Date().toISOString() };
    });
  }
  // The late state of a booking: null when there is nothing to show, { final: true, ... } once it was handed back, { final: false, ... } while a confirmed trip is past its return time.
  function lateInfo(b, now = new Date()) {
    if (b.late) return { ...b.late, final: true };
    if (b.status !== 'confirmed' || !policyFor(b).on || !(new Date(now) > ends(b))) return null;
    return { ...lateCalc(b, now), final: false };
  }
  const lateFeeOf = b => (b.late && +b.late.fee) || 0;
  // Amounts are stored in USD. money() returns HTML that shows them in the selected currency (core/currency.js) and re-formats on change.
  const money = n => HZC.usd(n, 2);
  const fdate = d => new Date(d + 'T00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

  const DEMO_NAMES = [['Maya Andersen', 'maya@example.com'], ['Tomas Reiner', 'tomas@example.com'], ['Hana Kim', 'hana@example.com'], ['James Okafor', 'james@example.com'], ['Sofia Lopes', 'sofia@example.com']];
  function seedDemo() {
    const me = current(); if (!me || me.role !== 'admin') fail('Admins only.');
    if (settings().sampleData === false) fail('Sample data is turned off in Settings.');
    if (typeof FLEET === 'undefined' || !FLEET.length) fail('Add at least one car first.');
    const cities = typeof SITE !== 'undefined' && SITE.cities.length ? SITE.cities.slice(0, 6) : ['Bali', 'Munich', 'Tokyo', 'Lisbon', 'Los Angeles', 'Dubai'];
    const status = ['pending', 'confirmed', 'confirmed', 'completed', 'completed', 'cancelled', 'pending', 'confirmed'];
    const all = bookings(), day = 864e5, now = new Date(); now.setHours(0, 0, 0, 0);
    status.forEach((st, i) => {
      const car = FLEET[(i * 3 + 1) % FLEET.length], [n, e] = DEMO_NAMES[i % DEMO_NAMES.length];
      const off = st === 'completed' || st === 'cancelled' && i % 2 ? -(10 + i * 4) : 2 + i * 3, len = 2 + (i % 5);
      const iso = d => { const x = new Date(now.getTime() + d * day); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };
      const sub = car[6] * len, tax = sub * 0.1, city = cities[i % cities.length];
      all.push({ id: 'HZ-' + rid(3).toUpperCase(), uid: 'demo', demo: true, customer: { name: n, email: e, phone: '' }, status: st, created: new Date(now.getTime() + (off - 5) * day).toISOString(),
        car: car[0], carSlug: typeof slug === 'function' ? slug(car[0]) : '', pickup: city, ret: city, from: iso(off), ft: '10:00 AM', to: iso(off + len), tt: '10:00 AM', mode: 'Self-drive', days: len,
        total: +(sub + tax).toFixed(2), lines: [[`Rental · ${len} days × $${car[6]}`, sub], ['Taxes & fees', +tax.toFixed(2)]] });
    });
    write(KEY.bookings, all);
  }
  function clearDemo() { const me = current(); if (!me || me.role !== 'admin') fail('Admins only.'); write(KEY.bookings, bookings().filter(b => !b.demo)); }

  // ---- site settings + contact messages (prototype: stored in this browser, not emailed)
  const SET_KEY = 'hz-settings', MSG_KEY = 'hz-messages';
  const settings = () => read(SET_KEY, {});
  const isAdmin = () => { const u = current(); return !!u && u.role === 'admin'; };
  const allMessages = () => read(MSG_KEY, []);
  // Site brand shown in the header, footer and admin bar: a name and an optional logo (a small data: image).
  const brand = () => { const s = settings(), raw = String(s.brandName || '').trim().slice(0, 30);
    return { name: raw || (typeof SITE !== 'undefined' ? SITE.name : 'Horizone'), rawName: raw, logo: /^data:image\//.test(s.brandLogo || '') ? s.brandLogo : '' }; };
  function setBrand(name, logo) {
    if (!isAdmin()) fail('Admins only.');
    const s = settings(); s.brandName = String(name || '').trim().slice(0, 30); s.brandLogo = /^data:image\//.test(logo || '') ? logo : '';
    if (!write(SET_KEY, s)) fail('Could not save (browser storage is full or blocked).'); return s;
  }
  function setSupportEmail(email) {
    if (!isAdmin()) fail('Admins only.');
    email = norm(email); if (email && !okEmail(email)) fail('Enter a valid email address.');
    const s = settings(); s.supportEmail = email; if (!write(SET_KEY, s)) fail('Could not save (browser storage is full or blocked).'); return s;
  }
  function setSampleData(on) {
    if (!isAdmin()) fail('Admins only.');
    const s = settings(); s.sampleData = !!on; if (!write(SET_KEY, s)) fail('Could not save (browser storage is full or blocked).'); return s;
  }
  function addMessage({ name, email, topic, ref, message }) {
    if (!settings().supportEmail) fail('Messages can’t be sent right now.');
    name = String(name || '').trim(); email = norm(email); message = String(message || '').trim();
    if (name.length < 2) fail('Enter your name.');
    if (!okEmail(email)) fail('Enter a valid email address.');
    if (message.length < 5) fail('Write a short message so we know how to help.');
    const rec = { id: 'MSG-' + rid(3).toUpperCase(), name: name.slice(0, 80), email, topic: String(topic || '').slice(0, 80), ref: String(ref || '').trim().slice(0, 40),
      message: message.slice(0, 4000), to: settings().supportEmail, created: new Date().toISOString(), read: false };
    const all = allMessages(); all.push(rec); if (!write(MSG_KEY, all)) fail('Could not send your message. Please try again.'); return rec;
  }
  const messages = () => isAdmin() ? allMessages() : [];
  function setMessageRead(id, read) {
    if (!isAdmin()) fail('Admins only.');
    const all = allMessages(), m = all.find(x => x.id === id); if (!m) fail('Message not found.'); m.read = !!read; write(MSG_KEY, all);
  }
  function removeMessage(id) { if (!isAdmin()) fail('Admins only.'); write(MSG_KEY, allMessages().filter(m => m.id !== id)); }

  // ---- Trash support (admin only): read a raw record before it is deleted, and put a trashed record back.
  const rawUser = id => { if (!isAdmin()) fail('Admins only.'); return users().find(u => u.id === id) || null; };
  const saved = ok => { if (!ok) fail('Could not save (browser storage is full or blocked).'); };
  function restoreBooking(b) {
    if (!isAdmin()) fail('Admins only.');
    if (bookings().some(x => x.id === b.id)) fail(`Booking ${b.id} already exists.`);
    saved(write(KEY.bookings, [...bookings(), b]));
  }
  function restoreUser(u, bks) {
    if (!isAdmin()) fail('Admins only.');
    const us = users();
    if (us.some(x => x.id === u.id || norm(x.email) === norm(u.email))) fail(`A customer with ${u.email} already exists.`);
    const have = new Set(bookings().map(x => x.id));
    saved(write(KEY.users, [...us, u]));
    saved(write(KEY.bookings, [...bookings(), ...(bks || []).filter(b => !have.has(b.id))]));
  }
  function restoreMessage(m) {
    if (!isAdmin()) fail('Admins only.');
    if (allMessages().some(x => x.id === m.id)) fail(`Message ${m.id} already exists.`);
    saved(write(MSG_KEY, [...allMessages(), m]));
  }

  return { toast: (...args) => toast(...args), esc, money, fdate, starts, ends, latePolicy, policyFor, lateFee, lateSummary, lateCalc, freeUntil, notifyLate, mins, lateInfo, lateFeeOf, lateList, eyeBtn, notePopover, closePopover: () => { if (closePop) closePop(); }, markReturned, setLateFee, users: () => users().map(clean), bookings, mine, current, signUp, signIn, signOut, guard, safeNext, addBooking, cancel, setStatus, removeBooking,
    setRole, removeUser, updateProfile, changePassword, deleteOwnAccount, verifyAdmin, removeCustomers, removeAllBookings, removeAllMessages, seedDemo, clearDemo, settings, brand, setBrand, setSampleData, setSupportEmail, addMessage, messages, setMessageRead, removeMessage, rawUser, restoreBooking, restoreUser, restoreMessage, ready: seed };
})();
