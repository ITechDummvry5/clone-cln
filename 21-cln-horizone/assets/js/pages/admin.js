(function () {
  const me0 = HZ.guard('admin'); if (!me0) return;
  HZINS.install(me0.name || me0.email);   // from here on every save made on this page is written to the activity log
  const { esc, money, fdate } = HZ;
  const $ = s => document.querySelector(s);
  const app = $('#app'), dlg = $('#dlg');

  // ---- Password gate for the Admins list (Customers tab > Admins). It is a normal page section, not a pop-up.
  // After the password is typed it stays open while you keep working, and locks again after 10 minutes without activity.
  const UNLOCK_KEY = 'hz-admin-unlock', IDLE_MS = 10 * 60 * 1000;
  const unlockedNow = () => { try { const v = JSON.parse(sessionStorage.getItem(UNLOCK_KEY) || 'null'); return !!v && v.uid === me0.id && Date.now() - v.at < IDLE_MS; } catch (e) { return false; } };
  const touchUnlock = () => { try { sessionStorage.setItem(UNLOCK_KEY, JSON.stringify({ uid: me0.id, at: Date.now() })); } catch (e) { /* storage blocked */ } };
  { let last = 0; const bump = () => { const n = Date.now(); if (unlockedNow() && n - last > 15000) { last = n; touchUnlock(); } };
    ['click', 'keydown', 'pointerdown'].forEach(ev => document.addEventListener(ev, bump, true)); }
  const STATUS = ['pending', 'confirmed', 'completed', 'cancelled'];
  // Icon-only action buttons: the label lives in data-tip (shown on hover or keyboard focus) and aria-label.
  const ico = d => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  const ICO = {
    eye: ico('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
    edit: ico('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>'),
    trash: ico('<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/>'),
    open: ico('<path d="M14 4h6v6"/><path d="M20 4 10 14"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'),
    plus: ico('<path d="M12 5v14M5 12h14"/>'),
    upload: ico('<path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M4 20h16"/>'),
    x: ico('<path d="M18 6 6 18M6 6l12 12"/>'),
    prev: ico('<path d="m15 6-6 6 6 6"/>'),
    next: ico('<path d="m9 6 6 6-6 6"/>'),
    copy: ico('<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>'),
    up: ico('<path d="m6 15 6-6 6 6"/>'),
    down: ico('<path d="m6 9 6 6 6-6"/>'),
    undo: ico('<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>'),
  };
  const ib = (i, tip, attrs = '', cls = '') => `<button type="button" class="ib ${cls}" data-tip="${tip}" aria-label="${tip}" ${attrs}>${ICO[i]}</button>`;
  const ia = (i, tip, href) => `<a class="ib" data-tip="${tip}" aria-label="${tip}" href="${href}" target="_blank" rel="noopener">${ICO[i]}</a>`;

  // One floating tooltip for every [data-tip]; fixed position so table scroll areas never clip it.
  const tipEl = document.createElement('div'); tipEl.className = 'ac-tip'; tipEl.setAttribute('role', 'tooltip'); tipEl.hidden = true; document.body.appendChild(tipEl);
  const hideTip = () => { tipEl.hidden = true; };
  const showTip = el => {
    tipEl.textContent = el.dataset.tip; tipEl.hidden = false;
    const r = el.getBoundingClientRect(), w = tipEl.offsetWidth, h = tipEl.offsetHeight;
    tipEl.style.left = Math.max(8, Math.min(r.left + r.width / 2 - w / 2, innerWidth - w - 8)) + 'px';
    tipEl.style.top = (r.top - h - 8 < 8 ? r.bottom + 8 : r.top - h - 8) + 'px';
  };
  const tipOf = e => e.target.closest && e.target.closest('[data-tip]');
  document.addEventListener('mouseover', e => { const t = tipOf(e); if (t) showTip(t); });
  document.addEventListener('mouseout', e => { if (tipOf(e)) hideTip(); });
  document.addEventListener('focusin', e => { const t = tipOf(e); if (t) showTip(t); });
  document.addEventListener('focusout', e => { if (tipOf(e)) hideTip(); });
  document.addEventListener('scroll', hideTip, true);
  // Admin navigation is organized by responsibility. Website content is separate from operational setup:
  // Promotions are managed here but are rendered on the public home page through HZDEALS.home().
  const TABS = [['overview', 'Overview'], ['dashboard', 'Reports'], ['bookings', 'Bookings'], ['calendar', 'Calendar'], ['late', 'Returns'], ['customers', 'Customers'], ['reviews', 'Reviews'], ['messages', 'Messages'], ['branding', 'Branding'], ['landing', 'Landing images'], ['deals', 'Promotions'], ['savings', 'Deals page cards'], ['media', 'Media library'], ['locations', 'Locations'], ['fleet', 'Fleet'], ['forms', 'Booking options'], ['pricing', 'Pricing rules'], ['currency', 'Currency'], ['settings', 'Settings'], ['activity', 'Activity'], ['trash', 'Trash']];
  const TAB_GROUPS = [['Overview', ['overview', 'dashboard']], ['Operations', ['bookings', 'calendar', 'late']], ['Customers', ['customers', 'reviews', 'messages']], ['Website', ['branding', 'landing', 'deals', 'savings', 'media']], ['Setup', ['locations', 'fleet', 'forms', 'pricing', 'currency']], ['System', ['settings', 'activity', 'trash']]];
  // Sub-tabs inside a tab (Fleet: Cars | Lists and defaults, Locations: Locations | Countries and cities | One-way routes).
  const subTabs = (t, secs, cur) => `<div class="ac-subtabs" role="tablist">${secs.map(x => `<button type="button" role="tab" data-go="${t}:${x[0]}" aria-selected="${x[0] === cur}">${x[1]}</button>`).join('')}</div>`;
  let fsub = 'cars', lsub = 'list';
  let tab = TABS.some(t => t[0] === location.hash.slice(1)) ? location.hash.slice(1) : 'overview';
  const f = { q: '', status: 'all', city: 'all', sel: null };
  let flash = null;
  let simgBusy = '', simgWith = true;   // sample images: busy text while the API is being called; "also load images" checkbox
  const enh = () => app.querySelectorAll('select:not([data-enh])').forEach(s => enhanceSelect(s, { float: true, compact: !!s.closest('.ac-tbl') }));
  const pill = s => `<span class="ac-pill ${esc(s)}">${esc(s)}</span>`;
  const earns = b => ['confirmed', 'completed'].includes(b.status);
  const route = b => b.ret && b.ret !== b.pickup ? `${esc(b.pickup)} → ${esc(b.ret)}` : esc(b.pickup);
  const rawRoute = b => b.ret && b.ret !== b.pickup ? `${b.pickup} → ${b.ret}` : (b.pickup || '');
  // One-line cell: text is cut with an ellipsis and the full text shows on hover (title).
  const cell = (main, sub, o = {}) => `<div class="tx"${o.w ? ` style="max-width:${o.w}px"` : ''} title="${esc([main, sub].filter(Boolean).join(' · '))}">${o.b ? '<b>' : '<span>'}${esc(main)}${o.b ? '</b>' : '</span>'}${sub ? `<small>${esc(sub)}</small>` : ''}</div>`;
  const sampleOn = () => HZ.settings().sampleData !== false;
  const sorted = () => HZ.bookings().sort((a, b) => new Date(b.created) - new Date(a.created));

  // Small red line under a booking's status: a car that is overdue right now, or the late fee that was charged.
  const lateTag = b => { const l = HZ.lateInfo(b); if (!l) return '';
    if (l.final) return l.fee > 0 ? `<small class="ac-late">Late fee ${money(l.fee)}</small>` : '';
    return `<small class="ac-late">Not returned${l.fee > 0 ? ` · late fee so far ${money(l.fee)}` : ' · no fee yet'}</small>`; };
  const bookingRows = list => list.map(b => `<tr data-id="${esc(b.id)}">
      <td>${cell(b.id, b.demo ? 'demo' : '', { b: 1, w: 130 })}</td>
      <td>${cell(b.customer && b.customer.name, b.customer && b.customer.email, { w: 170 })}</td>
      <td>${cell(b.car, b.mode, { w: 150 })}</td>
      <td>${cell(`${fdate(b.from)} → ${fdate(b.to)}`, rawRoute(b), { w: 210 })}</td>
      <td>${money(b.total)}</td>
      <td><select data-status aria-label="Status for ${esc(b.id)}">${STATUS.map(s => `<option${s === b.status ? ' selected' : ''}>${s}</option>`).join('')}</select>${lateTag(b)}</td>
      <td><div class="act">${ib('eye', 'View booking', 'data-view')}${ib('trash', 'Delete booking', 'data-del', 'd')}</div></td></tr>`).join('');

  // Things waiting for the admin: [go-target, count, label, tone]. Shown as glass chips in the Overview hero.
  function pulse() {
    const pend = HZ.bookings().filter(b => b.status === 'pending').length, un = unread(), od = HZ.bookings().filter(b => { const l = HZ.lateInfo(b); return l && !l.final; }).length;
    return [pend && ['bookings:pending', pend, pend === 1 ? 'booking is waiting for your confirmation' : 'bookings are waiting for your confirmation', 'warn'],
      od && ['late', od, od === 1 ? 'car has not been returned on time' : 'cars have not been returned on time', 'hot'],
      un && ['messages', un, un === 1 ? 'unread message in your inbox' : 'unread messages in your inbox', '']].filter(Boolean);
  }
  // First-run guide: the order matters because cars pick their locations and routes link locations.
  // Each step: [go-target, title, text, done, required]
  function setupSteps() {
    const L = HZFLEET.lists();
    return [
      ['locations:list', 'Add your locations', 'Cars, routes and the booking pickers all depend on them.', locList().length > 0, 1],
      ['fleet:lists', 'Fill the fleet lists', 'Brands, types, gearboxes, fuels and features.', ['brand', 'type', 'trans', 'fuel', 'drive'].every(k => L[k].length), 1],
      ['fleet:cars', 'Add your cars', 'Each car is linked to the locations it can be picked up from.', FLEET.length > 0, 1],
      ['settings:general', 'Set a support email', 'Turns on the contact form on the Help page.', !!HZ.settings().supportEmail, 1],
      ['branding', 'Add your logo and name (optional)', 'Shown in the header and footer of the live site.', !!(HZ.brand().logo || HZ.brand().rawName), 0],
      ['deals', 'Add a promo deal (optional)', 'Promo codes customers can use on the car page.', HZDEALS.all().length > 0, 0]];
  }
  // ---------- Branding (logo + name shown on the live site)
  let brandDraft = null;
  const brMark = logo => logo ? `<img class="br-img" src="${esc(logo)}" alt="">` : '<i class="br-sq"></i>';
  function brandingTab() {
    const b = HZ.brand(); if (!brandDraft) brandDraft = { name: b.rawName, logo: b.logo };
    const d = brandDraft, shown = (d.name || '').trim() || SITE.name, dirty = d.name.trim() !== b.rawName || d.logo !== b.logo;
    return `<div class="mr-grid">
      <section class="mr-card s7"><div class="mr-ch"><div><h2>Logo and name</h2><p>Shown in the header and footer of the live site, and in this panel.</p></div></div>
        <div class="ac-f br-form">
          <div><label for="brName">Brand name</label><input id="brName" type="text" maxlength="30" value="${esc(d.name)}" placeholder="${esc(SITE.name)}" autocomplete="off"><p class="sub" style="margin:6px 0 0">Leave empty to use ${esc(SITE.name)}. Up to 30 characters.</p></div>
          <div><label>Logo</label><div class="br-up"><span class="br-thumb">${brMark(d.logo)}</span>
            <div><label class="ac-b" for="brLogo" style="display:inline-flex;cursor:pointer">${d.logo ? 'Change logo' : 'Upload logo'}</label><input id="brLogo" type="file" accept="image/*" hidden>
            ${d.logo ? '<button type="button" class="ac-b g sm" data-brrm style="margin-left:8px">Remove</button>' : ''}
            <p class="sub" style="margin:8px 0 0">PNG, JPG, SVG or WebP. A transparent PNG looks best. It is shrunk to fit.</p></div></div></div>
        </div>
        <div class="br-act"><button type="button" class="ac-b" data-brsave${dirty ? '' : ' disabled'}>Save branding</button><button type="button" class="ac-b g" data-brreset>Use the default</button></div></section>
      <section class="mr-card gray s5"><div class="mr-ch"><div><h2>Preview</h2><p>How visitors will see it.</p></div></div>
        <div class="br-prev"><div class="br-mock"><span class="br-brand">${brMark(d.logo)}<b data-brtext>${esc(shown)}</b></span><span class="br-nav"><i></i><i></i><i></i></span></div>
        <div class="br-mock dark"><span class="br-brand">${brMark(d.logo)}<b data-brtext>${esc(shown)}</b></span><small>© ${new Date().getFullYear()}</small></div></div></section></div>`;
  }
  function readLogo(file, done) {
    if (!/^image\//.test(file.type)) return HZ.toast('Choose an image file.', 'err');
    const fr = new FileReader();
    fr.onload = () => { const im = new Image(); im.onload = () => {
      const w0 = im.naturalWidth || 200, h0 = im.naturalHeight || 200, k = Math.min(1, 360 / Math.max(w0, h0)), c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(w0 * k)); c.height = Math.max(1, Math.round(h0 * k));
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); done(c.toDataURL('image/png'));
    }; im.onerror = () => HZ.toast('That image could not be read.', 'err'); im.src = fr.result; };
    fr.readAsDataURL(file);
  }

  // Dotted range bar: the first part is filled, a marker sits where the value is.
  const ticks = (ratio, n = 26) => { const on = Math.round(Math.max(0, Math.min(1, ratio)) * n); return `<span class="mr-tk">${Array.from({ length: n }, (_, k) => `<i${k < on ? ' class="on"' : ''}></i>`).join('')}<u style="left:${(on / n * 100).toFixed(1)}%"></u></span>`; };
  const tile = (go, cat, tone, tag, val, unit, label, ratio) => `<button type="button" class="mr-tile" data-go="${go}"><span class="t1"><span>${cat}</span><em class="mr-tag ${tone}">${tag}</em></span><b>${val}<small>${unit}</small></b><span class="lb">${label}</span>${ticks(ratio)}</button>`;
  const arrowI = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  function overview() {
    const bs = HZ.bookings(), n = bs.length || 1, cars = carList(), ms = sortedMsgs();
    const rev = bs.filter(earns).reduce((s, b) => s + b.total + HZ.lateFeeOf(b), 0);
    const pend = bs.filter(b => b.status === 'pending').length, od = bs.filter(b => { const l = HZ.lateInfo(b); return l && !l.final; }).length, un = unread(), won = bs.filter(earns).length;
    let r = null; try { r = HZINS.compute(bs, cars.map(c => ({ units: HZFLEET.x(c.name).units })), '12m', new Date(), b => HZ.lateFeeOf(b)); } catch (e) { /* no chart */ }
    const rows = r ? r.rows : [], maxR = Math.max(...rows.map(x => x.revenue), 1), hiI = rows.reduce((m, x, k) => x.revenue > rows[m].revenue ? k : m, 0);
    const steps = setupSteps(), need = steps.filter(x => x[4]), got = need.filter(x => x[3]).length, setupDone = got === need.length;
    const stat = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 }; bs.forEach(b => { if (b.status in stat) stat[b.status]++; });
    const maxS = Math.max(...Object.values(stat), 1), pct = bs.length ? Math.round(won / bs.length * 100) : 0;
    const top = r ? r.top.slice(0, 4) : [], maxT = Math.max(...top.map(x => x.revenue), 1);
    const card2 = setupDone
      ? `<section class="mr-card s4"><div class="mr-ch"><div><h2>Top cars</h2><p>By revenue over the last 12 months.</p></div><button type="button" class="mr-more" data-go="dashboard">Reports ${arrowI}</button></div>
          <div class="mr-list">${top.length ? top.map(c => `<div class="mr-top"><span><b>${esc(c.name)}</b><small>${plural(c.bookings, 'booking')}</small></span>${ticks(c.revenue / maxT, 18)}<em>${money(c.revenue)}</em></div>`).join('') : '<p class="mr-none">No bookings yet. Your best cars will show up here.</p>'}</div></section>`
      : `<section class="mr-card s4"><div class="mr-ch"><div><h2>Setup plan</h2><p>Do these in order. Each step needs the one before it.</p></div><span class="mr-count">${got}/${need.length}</span></div>
          <div class="mr-list">${steps.map((x, k) => `<button type="button" class="mr-row${x[3] ? ' done' : ''}" data-go="${x[0]}"><span class="ck">${x[3] ? '✓' : ''}</span><span>${x[1]}</span><em>${String(k + 1).padStart(2, '0')}</em></button>`).join('')}</div></section>`;
    const bub = ms.slice(0, 2).map(x => `<div class="mr-bub"><small>${esc(x.topic || 'Message')} · ${esc(x.name)}</small>${esc(x.message)}</div>`).join('') || `<div class="mr-bub">No messages yet. ${HZ.settings().supportEmail ? 'Messages from the Help page will land here.' : 'Set a support email to turn on the Help page form.'}</div>`;
    return `<div class="mr-grid">
      <section class="mr-card s7"><div class="mr-ch"><div><h2>Needs your attention</h2><p>Live from your bookings, returns and inbox.</p></div><button type="button" class="mr-more" data-go="bookings">Open bookings</button></div>
        <div class="mr-tiles">
          ${tile('bookings:pending', 'Bookings', pend ? 'watch' : 'ok', pend ? 'Watch' : 'Clear', pend, 'pending', 'Awaiting confirmation', pend / n)}
          ${tile('late', 'Returns', od ? 'low' : 'ok', od ? 'Late' : 'On time', od, od === 1 ? 'car' : 'cars', 'Not returned on time', od / n)}
          ${tile('messages', 'Inbox', un ? 'watch' : 'ok', un ? 'New' : 'Clear', un, 'unread', 'From the Help page', un / (ms.length || 1))}
          ${tile('bookings', 'Revenue', 'ok', 'Earning', won, 'paid', 'Confirmed and completed', won / n)}</div></section>
      <section class="mr-card dark s5"><div class="mr-ch"><div><h2>Revenue</h2><p>Confirmed and completed bookings, late fees included.</p></div><span class="mr-tag glass">${plural(bs.length, 'booking')}</span></div>
        <div class="mr-big" style="--n:${Math.max(6, money(rev).replace(/<[^>]*>/g, '').length)}">${money(rev)}</div>
        <div class="mr-bars">${rows.length ? rows.map((x, k) => `<i${k === hiI && x.revenue > 0 ? ' class="hi"' : ''} style="height:${Math.max(6, x.revenue / maxR * 100)}%" data-tip="${esc(x.title + ': ' + HZC.txt(x.revenue))}"></i>`).join('') : ''}</div>
        <div class="mr-axis">${rows.length ? `<span>${esc(rows[0].label)}</span><span>${esc(rows[Math.floor(rows.length / 2)].label)}</span><span>${esc(rows[rows.length - 1].label)}</span>` : '<span>Waiting for the first booking</span>'}</div></section>
      <section class="mr-card s4"><div class="mr-ch"><div><h2>Booking mix</h2><p>${bs.length ? `${pct}% of bookings are confirmed or done.` : 'Shows up with your first booking.'}</p></div><span class="mr-tag hi">${pct}%</span></div>
        <div class="mr-mix"><div class="mr-ring" style="--p:${pct}"><span>Paid<b>${pct}%</b></span></div>
          <div class="mr-vb">${Object.keys(stat).map(k => `<span class="c"><i class="${stat[k] === maxS && stat[k] ? 'hi' : ''}" style="height:${Math.max(6, stat[k] / maxS * 100)}%"></i><small>${k.slice(0, 4)}</small></span>`).join('')}</div></div></section>
      ${card2}
      <section class="mr-card gray s4"><div class="mr-ch"><div><h2>Inbox</h2><p>${un ? plural(un, 'message') + ' waiting for a reply.' : 'Nothing waiting for a reply.'}</p></div><span class="ad-av">${esc((me0.name || '?').trim()[0] || '?').toUpperCase()}</span></div>
        <div class="mr-chat">${bub}</div><button type="button" class="mr-input" data-go="${ms.length ? 'messages' : 'settings:general'}"><span>${ms.length ? 'Open your inbox' : 'Open settings'}</span><i>${arrowI}</i></button></section>
      <section class="mr-card s12 flat"><div class="mr-ch"><div><h2>Latest bookings</h2><p>The six most recent reservations made on the site.</p></div>${bs.length ? '<button type="button" class="mr-more" data-go="bookings">See all ' + bs.length + '</button>' : ''}</div>
        ${bs.length ? `<div class="ac-wrapt"><table class="ac-tbl"><thead><tr><th>ID</th><th>Customer</th><th>Car</th><th>Dates</th><th>Total</th><th>Status</th><th></th></tr></thead><tbody>${bookingRows(sorted().slice(0, 6))}</tbody></table></div>`
          : '<div class="ac-empty"><h3>No bookings yet</h3><p>Reservations made on the site appear here.' + (sampleOn() ? ' You can load sample data in Settings to try the panel.' : '') + '</p></div>'}</section></div>`;
  }

  function filtered() {
    const q = f.q.trim().toLowerCase();
    return sorted().filter(b => (f.status === 'all' || b.status === f.status) && (f.city === 'all' || b.pickup === f.city) &&
      (!q || [b.id, b.car, b.pickup, b.ret, b.customer && b.customer.name, b.customer && b.customer.email].join(' ').toLowerCase().includes(q)));
  }
  // Bookings page: city list | table | detail card for the selected booking.
  const bkDays = b => Math.max(1, +b.days || Math.round((new Date(b.to) - new Date(b.from)) / 864e5) || 1);
  const bkPick = list => { if (!list.some(b => b.id === f.sel)) f.sel = list[0] ? list[0].id : null; return list.find(b => b.id === f.sel); };
  const bkRows = list => list.map(b => `<tr data-bk="${esc(b.id)}" class="${b.id === f.sel ? 'sel' : ''}" tabindex="0" aria-selected="${b.id === f.sel}">
      <td>${cell(b.customer && b.customer.name, b.car, { b: 1, w: 220 })}</td><td class="v">${money(b.total)}</td>
      <td><span class="trip">${ticks(bkDays(b) / 14, 18)}<small>${plural(bkDays(b), 'day')} · ${esc(b.pickup || '')}</small></span></td><td>${pill(b.status)}</td></tr>`).join('');
  const bookingsTable = () => { const l = filtered(); return l.length ? `<div class="mr-twrap"><table class="mr-tbl"><thead><tr><th>Customer</th><th>Total</th><th>Trip length</th><th>Status</th></tr></thead><tbody>${bkRows(l)}</tbody></table></div>` : '<div class="ac-empty"><h3>No bookings match</h3><p>Try a different search, status or city.</p></div>'; };
  function bkSide() {
    const all = HZ.bookings(), c = {}; all.forEach(b => { const k = b.pickup || 'No city'; c[k] = c[k] || { n: 0, p: 0 }; c[k].n++; if (b.status === 'pending') c[k].p++; });
    const row = (key, label, n, p) => `<button type="button" class="mr-cat${f.city === key ? ' on' : ''}" data-bkcity="${esc(key)}"><span>${esc(label)}</span><em>${p ? '<i></i>' : ''}${n}</em></button>`;
    return row('all', 'All', all.length, all.some(b => b.status === 'pending')) + Object.keys(c).sort().map(k => row(k, k, c[k].n, c[k].p)).join('');
  }
  function bkDetail() {
    const b = bkPick(filtered());
    if (!b) return '<div class="mr-ch"><div><h2>No booking</h2><p>Pick a booking to see its details here.</p></div></div>';
    const l = HZ.lateInfo(b), cu = b.customer || {}, big = money(b.total).replace(/<[^>]*>/g, '').length;
    return `<div class="mr-ch"><span class="mr-tag glass">${esc(b.mode || 'Booking')}</span><span class="mr-tag ${esc(b.status)}">${esc(b.status)}</span></div>
      <h2 class="bk-title">${esc(b.car)}</h2>
      <div class="mr-big" style="--n:${Math.max(6, big)}">${money(b.total)}</div>
      ${ticks(bkDays(b) / 14, 30)}
      <div class="mr-axis"><span>${fdate(b.from)}</span><span>${plural(bkDays(b), 'day')}</span><span>${fdate(b.to)}</span></div>
      <p class="bk-note"><b>${esc(cu.name || 'Customer')}</b>${cu.email ? ' · ' + esc(cu.email) : ''}<br>${route(b)} · ${esc(b.id)}${l && !l.final ? '<br>This car has not been returned yet.' : ''}</p>
      <div class="bk-st" role="group" aria-label="Change status">${STATUS.map(x => `<button type="button" data-bkst="${x}" class="${x === b.status ? 'on' : ''}">${x}</button>`).join('')}</div>
      <div class="bk-act"><button type="button" class="mr-input" data-bkview><span>Open full details</span><i>${arrowI}</i></button>${ib('trash', 'Delete booking', 'data-bkdel', 'd')}</div>`;
  }
  function refreshBk() {
    bkPick(filtered());
    $('#tbl').innerHTML = bookingsTable(); $('#bkSide').innerHTML = bkSide(); $('#bkDetail').innerHTML = bkDetail();
    app.querySelectorAll('[data-bkf]').forEach(x => x.setAttribute('aria-selected', String(x.dataset.bkf === f.status)));
  }
  const bookingsTab = () => { bkPick(filtered()); return `<div class="mr-bk">
      <aside class="mr-card mr-side"><div class="mr-sh">By pick-up city</div><div id="bkSide">${bkSide()}</div></aside>
      <section class="mr-card mr-mid"><div class="mr-tool"><input id="q" type="search" placeholder="Search ID, customer, car, city" value="${esc(f.q)}" aria-label="Search bookings">
        <div class="mr-seg" id="bkF" role="group" aria-label="Filter by status">${['all', ...STATUS].map(x => `<button type="button" data-bkf="${x}" aria-selected="${f.status === x}">${x === 'all' ? 'All' : x[0].toUpperCase() + x.slice(1)}</button>`).join('')}</div>
        <button type="button" class="mr-more" data-csv>Export CSV</button></div><div id="tbl">${bookingsTable()}</div></section>
      <aside class="mr-card dark mr-detail" id="bkDetail">${bkDetail()}</aside></div>`; };
  app.addEventListener('click', e => {
    const c = e.target.closest('[data-bkcity]'); if (c) { f.city = c.dataset.bkcity; refreshBk(); return; }
    const fl = e.target.closest('[data-bkf]'); if (fl) { f.status = fl.dataset.bkf; refreshBk(); return; }
    const st = e.target.closest('[data-bkst]'); if (st && f.sel) { act(() => { HZ.setStatus(f.sel, st.dataset.bkst); flash = { ok: true, m: `${f.sel} marked ${st.dataset.bkst}.` }; }); return; }
    if (e.target.closest('[data-bkview]') && f.sel) { view(f.sel); return; }
    if (e.target.closest('[data-bkdel]') && f.sel) { act(() => { const b = HZ.bookings().find(x => x.id === f.sel); if (b) toTrash('booking', b.id, [b.customer && b.customer.name, b.car].filter(Boolean).join(' · '), b); HZ.removeBooking(f.sel); flash = { ok: true, m: 'Booking moved to Trash.' }; }); return; }
    const r = e.target.closest('tr[data-bk]'); if (r) { f.sel = r.dataset.bk; refreshBk(); if (innerWidth <= 1280) $('#bkDetail').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
  });
  app.addEventListener('keydown', e => { const r = e.target.closest && e.target.closest('tr[data-bk]'); if (r && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); f.sel = r.dataset.bk; refreshBk(); } });

  // Accounts. The Customers tab lists clients. Admin accounts are access control, so they live in Settings > Admins (behind the password gate).
  function acctBody(kind) {
    const bs = HZ.bookings(), adm = kind === 'admin', list = HZ.users().filter(u => (u.role === 'admin') === adm);
    const help = adm ? 'People who can sign in to this admin panel. Change someone’s role to Client to move them to Customers. You can’t change or delete your own account here.' : 'People who booked or signed up on the site. To give someone access to this panel, change their role to Admin: they then move to Settings > Admins.';
    const head = `<div class="ac-card w" style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap"><div><h2>${adm ? 'Admins' : 'Customers'}</h2><p class="s" style="margin:0">${help}</p></div>${adm ? '' : '<button type="button" class="ac-b g" data-export="customers">Export CSV</button>'}</div></div>`;
    const locked = adm && !unlockedNow();
    const body = locked ? `<form id="fAdminUnlock" class="ac-card w ac-lock" novalidate><h3 style="margin:0 0 4px">Password required</h3><p class="s" style="margin:0 0 14px">Enter your password to view the admin accounts.</p>
        <div class="ac-f" style="max-width:340px"><label for="apw">Your password</label><input id="apw" name="apw" type="password" autocomplete="current-password"></div><button class="ac-b" style="margin-top:12px">Unlock</button></form>` : list.length ? `<div class="ac-wrapt"><table class="ac-tbl"><thead><tr><th>Name</th><th>Email</th><th>Joined</th><th>Bookings</th><th>Role</th><th></th></tr></thead><tbody>${list.map(u => {
      const self = u.id === me0.id, c = bs.filter(b => b.uid === u.id).length;
      return `<tr data-uid="${esc(u.id)}"><td>${cell(u.name, [self ? 'you' : '', u.phone || ''].filter(Boolean).join(' · '), { b: 1, w: 200 })}</td><td>${cell(u.email, '', { w: 260 })}</td><td>${fdate(u.created.slice(0, 10))}</td><td>${c}</td>
        <td>${self ? pill(u.role) : `<select data-role aria-label="Role for ${esc(u.name)}"><option${u.role === 'client' ? ' selected' : ''}>client</option><option${u.role === 'admin' ? ' selected' : ''}>admin</option></select>`}</td>
        <td><div class="act">${self ? '' : ib('trash', 'Delete customer', 'data-deluser', 'd')}</div></td></tr>`; }).join('')}</tbody></table></div>`
      : `<div class="ac-empty"><h3>${adm ? 'No admins' : 'No customers yet'}</h3><p>${adm ? 'Admin accounts will show here.' : 'Customer accounts appear here after someone signs up on the site.'}</p></div>`;
    return head + body;
  }
  // ---------- Customers (Mira "Biomarkers" layout): segment list | table | dark detail card for the selected customer.
  const cu = { q: '', seg: 'all', sel: null };
  const initials = n => (String(n || '?').trim().split(/\s+/).map(x => x[0]).slice(0, 2).join('') || '?').toUpperCase();
  const CU_SEGS = [['all', 'All customers'], ['repeat', 'Repeat guests'], ['booked', 'Booked once'], ['new', 'No bookings yet']];
  const cuTag = s => s === 'repeat' ? ['hi', 'Repeat'] : s === 'booked' ? ['', 'Booked'] : ['watch', 'New'];
  function cuData() {
    const bs = HZ.bookings();
    return HZ.users().filter(u => u.role !== 'admin').map(u => {
      const mine = bs.filter(b => b.uid === u.id).sort((a, b) => new Date(b.created) - new Date(a.created));
      const spent = mine.filter(earns).reduce((s, b) => s + b.total + HZ.lateFeeOf(b), 0);
      return { u, mine, spent, n: mine.length, pend: mine.some(b => b.status === 'pending'), seg: mine.length > 1 ? 'repeat' : mine.length ? 'booked' : 'new' };
    }).sort((a, b) => new Date(b.u.created) - new Date(a.u.created));
  }
  function cuView() {
    const all = cuData(), q = cu.q.trim().toLowerCase(), maxS = Math.max(...all.map(x => x.spent), 1);
    const list = all.filter(x => (cu.seg === 'all' || x.seg === cu.seg) && (!q || [x.u.name, x.u.email, x.u.phone].join(' ').toLowerCase().includes(q)));
    if (!list.some(x => x.u.id === cu.sel)) cu.sel = list[0] ? list[0].u.id : null;
    const sel = list.find(x => x.u.id === cu.sel);
    const side = CU_SEGS.map(([k, label]) => { const sub = all.filter(x => k === 'all' || x.seg === k); return `<button type="button" class="mr-cat${cu.seg === k ? ' on' : ''}" data-cuseg="${k}"><span>${label}</span><em>${sub.some(x => x.pend) ? '<i></i>' : ''}${sub.length}</em></button>`; }).join('');
    const rows = list.map(x => { const t = cuTag(x.seg), id = esc(x.u.id);
      return `<tr data-cu="${id}" class="${x.u.id === cu.sel ? 'sel' : ''}" tabindex="0" aria-selected="${x.u.id === cu.sel}">
        <td><div class="cu-who"><span class="ad-av">${esc(initials(x.u.name))}</span><span><b>${esc(x.u.name)}</b><small>${esc(x.u.email)}</small></span></div></td>
        <td class="v">${money(x.spent)}</td><td><span class="trip">${ticks(x.spent / maxS, 18)}<small>${plural(x.n, 'booking')}</small></span></td><td><span class="mr-tag ${t[0]}">${t[1]}</span></td></tr>`; }).join('');
    const table = list.length ? `<div class="mr-twrap"><table class="mr-tbl"><thead><tr><th>Customer</th><th>Spent</th><th>Activity</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div>`
      : `<div class="ac-empty"><h3>${all.length ? 'No customers match' : 'No customers yet'}</h3><p>${all.length ? 'Try a different search or list.' : 'Customer accounts appear here after someone signs up on the site.'}</p></div>`;
    return { side, table, detail: cuDetail(sel, maxS) };
  }
  function cuDetail(x, maxS) {
    if (!x) return '<div class="mr-ch"><div><h2>No customer</h2><p>Pick a customer to see their trips here.</p></div></div>';
    const u = x.u, t = cuTag(x.seg), self = u.id === me0.id, big = money(x.spent).replace(/<[^>]*>/g, '').length;
    const last = x.mine[0], trips = x.mine.slice(0, 3).map(b => `<div class="cu-bk"><span class="mr-tag ${esc(b.status)}">${esc(b.status)}</span><span><b>${esc(b.car)}</b><small>${fdate(b.from)} → ${fdate(b.to)}</small></span><em>${money(b.total)}</em></div>`).join('');
    return `<div class="dl-d" data-cuid="${esc(u.id)}"><div class="mr-ch"><span class="mr-tag glass">Customer</span><span class="mr-tag ${t[0]}">${t[1]}</span></div>
      <h2 class="bk-title">${esc(u.name)}</h2>
      <div class="mr-big" style="--n:${Math.max(6, big)}">${money(x.spent)}</div><p class="rt-lbl">spent on ${plural(x.mine.filter(earns).length, 'paid booking')}</p>
      ${ticks(x.spent / maxS, 30)}<div class="mr-axis"><span>Joined ${fdate(u.created.slice(0, 10))}</span><span>${plural(x.n, 'trip')}</span><span>${last ? 'Last ' + fdate(last.from) : 'No trips yet'}</span></div>
      <p class="bk-note"><b>${esc(u.email)}</b>${u.phone ? ' · ' + esc(u.phone) : ''}</p>
      <div class="cu-trips">${trips || '<p class="bk-note" style="margin:0">No bookings yet.</p>'}</div>
      ${self ? '' : `<div class="bk-st" role="group" aria-label="Role">${['client', 'admin'].map(r => `<button type="button" data-cu-role="${r}" class="${u.role === r ? 'on' : ''}">${r}</button>`).join('')}</div>`}
      <div class="bk-act"><a class="mr-input" href="mailto:${esc(u.email)}"><span>Email ${esc(u.name.split(' ')[0])}</span><i>${arrowI}</i></a>${self ? '' : ib('trash', 'Delete customer', 'data-cu-del', 'd')}</div></div>`;
  }
  function refreshCu() { const v = cuView(); $('#cuSide').innerHTML = v.side; $('#cuTbl').innerHTML = v.table; $('#cuDetail').innerHTML = v.detail; }
  function customersTab() {
    const v = cuView();
    return `<div class="mr-bk mr-cu">
      <aside class="mr-card mr-side"><div class="mr-sh">Customers</div><div id="cuSide">${v.side}</div>
        <div class="rt-box"><b>Need an admin?</b><span>Change a customer’s role to admin and they move to Settings &gt; Admins.</span><button type="button" class="mr-more" data-go="settings:admins">Open admins</button></div></aside>
      <section class="mr-card mr-mid"><div class="mr-tool"><input id="cuq" type="search" placeholder="Search name, email or phone" value="${esc(cu.q)}" aria-label="Search customers"><button type="button" class="mr-more" data-export="customers">Export CSV</button></div><div id="cuTbl">${v.table}</div></section>
      <aside class="mr-card dark mr-detail" id="cuDetail">${v.detail}</aside></div>`;
  }
  app.addEventListener('click', e => {
    const sg = e.target.closest('[data-cuseg]'); if (sg) { cu.seg = sg.dataset.cuseg; cu.sel = null; refreshCu(); return; }
    const r = e.target.closest('tr[data-cu]'); if (r) { cu.sel = r.dataset.cu; refreshCu(); if (innerWidth <= 1280) $('#cuDetail').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); return; }
    const d = e.target.closest('[data-cuid]'); if (!d) return;
    const u = HZ.users().find(y => y.id === d.dataset.cuid); if (!u) return;
    const rb = e.target.closest('[data-cu-role]');
    if (rb) { const role = rb.dataset.cuRole; if (role === u.role) return; if (role === 'admin' && !confirm(`Give ${u.name} access to this admin panel? They will move to Settings > Admins.`)) return; act(() => { HZ.setRole(u.id, role); flash = { ok: true, m: 'Role updated.' }; }); return; }
    if (e.target.closest('[data-cu-del]')) { if (!confirm(`Move ${u.name} to Trash? Their bookings go with them and can be restored.`)) return; act(() => { const raw = HZ.rawUser(u.id), bks = HZ.bookings().filter(b => b.uid === u.id); if (raw) toTrash('customer', raw.name, `${raw.email} · ${bks.length} booking${bks.length === 1 ? '' : 's'}`, { user: raw, bookings: bks }); HZ.removeUser(u.id); flash = { ok: true, m: 'Customer moved to Trash.' }; }); }
  });
  app.addEventListener('keydown', e => { const r = e.target.closest && e.target.closest('tr[data-cu]'); if (r && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); cu.sel = r.dataset.cu; refreshCu(); } });
  app.addEventListener('input', e => { if (e.target.id === 'cuq') { cu.q = e.target.value; cu.sel = null; const v = cuView(); $('#cuTbl').innerHTML = v.table; $('#cuDetail').innerHTML = v.detail; } });
  // ---------- Fleet (add / edit / delete cars; View opens the car page). Buttons are icon-only: the label shows on hover.
  const CAR_TYPES = ['Hatchback', 'Sedan', 'SUV', 'Wagon', 'Off-road', 'Minivan', 'Sport', 'Convertible'], CAR_TRANS = ['Automatic', 'Manual'], CAR_FUEL = ['Petrol', 'Diesel', 'Hybrid', 'Electric'];
  const DRIVES = ['Front-wheel drive', 'Rear-wheel drive', 'All-wheel drive', 'Four-wheel drive'];
  const blankCar = () => {
    const D = HZFLEET.cfg().defaults, L = HZFLEET.lists(), pick = (k, fb) => L[k].includes(D[k]) ? D[k] : L[k].includes(fb) ? fb : (L[k][0] || '');
    return { name: '', make: '', year: new Date().getFullYear(), type: pick('type', 'Sedan'), trans: pick('trans', 'Automatic'), fuel: pick('fuel', 'Petrol'), seats: D.seats ?? 5, doors: D.doors ?? 4, bags: D.bags ?? 3, drive: pick('drive', 'Front-wheel drive'),
      price: '', deposit: D.deposit ?? '', minAge: D.minAge ?? 21, range: '', intro: '', features: [], img: '', photos: [], seedRating: 0, seedN: 0, locations: [], oneWay: true, units: D.units ?? 1 };
  };
  const carDraft = c => { const cur = curDefault(), cv = v => v === '' ? '' : curRound((+v || 0) * curRate(cur), cur); return { ...c, fromCur: cur, fromAmt: cv(c.price), depAmt: cv(c.deposit) }; };
  const carList = () => HZFLEET.all();
  let ced = null;   // null = list view; { orig: 'Car name' | null, d: draft } = form
  // ---------- Cars (Mira layout): car type list | table | dark detail card for the selected car
  const cr = { type: 'all', q: '', sel: null };
  const crStrip = h => String(h).replace(/<[^>]*>/g, '');
  function crView() {
    const q = cr.q.trim().toLowerCase(), maxU = Math.max(...FLEET.map(c => +HZFLEET.x(c[0]).units || 0), 1);
    const list = FLEET.filter(c => (cr.type === 'all' || c[1] === cr.type) && (!q || [c[0], c[1], c[2], c[3]].join(' ').toLowerCase().includes(q)));
    if (!list.some(c => c[0] === cr.sel)) cr.sel = list[0] ? list[0][0] : null;
    const sel = list.find(c => c[0] === cr.sel), types = [...new Set(FLEET.map(c => c[1]).filter(Boolean))].sort();
    const row = (k, label, n) => `<button type="button" class="mr-cat${cr.type === k ? ' on' : ''}" data-crtype="${esc(k)}"><span>${esc(label)}</span><em>${n}</em></button>`;
    const side = row('all', 'All cars', FLEET.length) + types.map(t => row(t, t, FLEET.filter(c => c[1] === t).length)).join('');
    const rows = list.map(c => { const u = +HZFLEET.x(c[0]).units || 0;
      return `<tr data-crrow="${esc(c[0])}" class="${c[0] === cr.sel ? 'sel' : ''}" tabindex="0" aria-selected="${c[0] === cr.sel}">
        <td><div class="lt"><span class="lthumb"><img src="${esc(IMG.fleet[c[0]] || '')}" alt="" loading="lazy"></span>${cell(c[0], `${c[1]} · ${c[2]} · ${c[4]} seats`, { b: 1, w: 220 })}</div></td>
        <td class="v">${money(c[6])}<small class="lc-pd"> /day</small></td><td><span class="trip">${ticks(u / maxU, 18)}<small>${plural(u, 'car')} in stock</small></span></td>
        <td>${c[5] ? `★ ${c[5]} <small class="lc-pd">(${DETAIL[c[0]][4]})</small>` : '<small class="lc-pd">No reviews</small>'}</td></tr>`; }).join('');
    const table = list.length ? `<div class="mr-twrap"><table class="mr-tbl"><thead><tr><th>Car</th><th>Price</th><th>Stock</th><th>Rating</th></tr></thead><tbody>${rows}</tbody></table></div>`
      : `<div class="ac-empty"><h3>${FLEET.length ? 'No cars match' : 'No cars yet'}</h3><p>${FLEET.length ? 'Try a different search or car type.' : 'Add your first car' + (sampleOn() ? ', or press “Load sample data” in Settings > Sample data to fill in demo cars' : '') + '.'}</p></div>`;
    return { side, table, detail: crDetail(sel, maxU) };
  }
  function crDetail(c, maxU) {
    if (!c) return '<div class="mr-ch"><div><h2>No car</h2><p>Add a car to see it here.</p></div></div>';
    const bs = HZ.bookings().filter(b => b.car === c[0]), xx = HZFLEET.x(c[0]), u = +xx.units || 0;
    const t0 = new Date().toISOString().slice(0, 10), t1 = new Date(Date.now() + 864e5).toISOString().slice(0, 10), free = HZFLEET.left(c[0], { from: t0, ft: '10:00 AM', to: t1, tt: '10:00 AM' });
    const rev = bs.filter(earns).reduce((s, b) => s + b.total, 0), img = IMG.fleet[c[0]];
    return `<div class="dl-d" data-crcar="${esc(c[0])}"><div class="mr-ch"><span class="mr-tag glass">${esc(c[1])}</span><span class="mr-tag ${c[5] ? 'hi' : 'glass'}">${c[5] ? '★ ' + c[5] : 'No reviews'}</span></div>
      ${img ? `<div class="lc-img"><img src="${esc(img)}" alt="" loading="lazy"></div>` : ''}
      <h2 class="bk-title">${esc(c[0])}<small class="lc-co">${esc(c[2])} · ${esc(c[3])} · ${c[4]} seats</small></h2>
      <div class="mr-big" style="--n:${Math.max(6, crStrip(money(c[6])).length)}">${money(c[6])}</div><p class="rt-lbl">per day</p>
      ${ticks(u / maxU, 30)}<div class="mr-axis"><span>${plural(u, 'car')}</span><span>${free} free today</span><span>${plural(bs.length, 'booking')}</span></div>
      <p class="bk-note"><b>${money(rev)}</b> earned<br>${xx.locs && xx.locs.length ? plural(xx.locs.length, 'location') : 'All locations'} · ${xx.oneWay ? 'Different return allowed' : 'Same-location return only'}</p>
      <div class="bk-act"><a class="mr-input" href="car.html?car=${slug(c[0])}" target="_blank" rel="noopener"><span>View car page</span><i>${arrowI}</i></a>${ib('edit', 'Edit car', 'data-cr-edit', '')}${ib('trash', 'Delete car', 'data-cr-del', 'd')}</div></div>`;
  }
  function refreshCr() { const v = crView(); $('#crSide').innerHTML = v.side; $('#crTbl').innerHTML = v.table; $('#crDetail').innerHTML = v.detail; }
  function fleetCars() {
    const v = crView();
    return `<div class="mr-bk mr-lc">
      <aside class="mr-card mr-side"><div class="mr-sh">By car type</div><div id="crSide">${v.side}</div>
        <div class="rt-box"><b>Missing a type or brand?</b><span>Dropdown lists and defaults for new cars.</span><button type="button" class="mr-more" data-go="fleet:lists">Edit lists</button></div></aside>
      <section class="mr-card mr-mid"><div class="mr-tool"><input id="crq" type="search" placeholder="Search car, type or fuel" value="${esc(cr.q)}" aria-label="Search cars"><button type="button" class="mr-more dark" data-car-add>${ICO.plus} Add fleet</button></div><div id="crTbl">${v.table}</div></section>
      <aside class="mr-card dark mr-detail" id="crDetail">${v.detail}</aside></div>`;
  }
  app.addEventListener('click', e => {
    const tp = e.target.closest('[data-crtype]'); if (tp) { cr.type = tp.dataset.crtype; cr.sel = null; refreshCr(); return; }
    const r = e.target.closest('tr[data-crrow]'); if (r) { cr.sel = r.dataset.crrow; refreshCr(); if (innerWidth <= 1280) $('#crDetail').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); return; }
    const d = e.target.closest('[data-crcar]'); if (!d) return;
    if (e.target.closest('[data-cr-edit]')) { const c = carList().find(x => x.name === d.dataset.crcar); if (c) { ced = { orig: c.name, d: carDraft(c) }; render(); scrollTo(0, 0); } return; }
    if (e.target.closest('[data-cr-del]')) act(() => deleteCar(d.dataset.crcar));
  });
  app.addEventListener('keydown', e => { const r = e.target.closest && e.target.closest('tr[data-crrow]'); if (r && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); cr.sel = r.dataset.crrow; refreshCr(); } });
  app.addEventListener('input', e => { if (e.target.id === 'crq') { cr.q = e.target.value; cr.sel = null; const v = crView(); $('#crTbl').innerHTML = v.table; $('#crDetail').innerHTML = v.detail; } });
  function fleetTab() {
    if (ced) return carForm();
    return subTabs('fleet', [['cars', `Cars (${FLEET.length})`], ['lists', 'Lists and defaults']], fsub) + (fsub === 'lists' ? setFleet() : fleetCars());
  }
  const selOpts = (arr, v) => !arr.length ? '<option value="">Add options in Fleet > Lists and defaults first</option>' : arr.map(x => `<option${x === v ? ' selected' : ''}>${esc(x)}</option>`).join('');
  // Location checklist grouped by region, with a select-all button per region.
  function locRegions(sel) {
    const ls = locList(), regs = [...new Set(ls.map(l => l.region || 'Other'))];
    return regs.map(r => `<div class="ac-reg"><div class="rh"><b>${esc(r)}</b><button type="button" class="ac-b g sm" data-reg="${esc(r)}">Select region</button></div><div class="ac-loclist">${ls.filter(l => (l.region || 'Other') === r).map(l => `<label><input type="checkbox" name="loc" value="${esc(l.city)}" data-region="${esc(r)}"${sel.includes(l.city) ? ' checked' : ''}>${esc(l.city)}</label>`).join('')}</div></div>`).join('');
  }
  function carForm() {
    const d = ced.d, L = HZFLEET.lists(), X = ced.orig ? HZFLEET.x(ced.orig) : {}, ph4 = ['Front', 'Interior', 'Rear', 'Detail'];
    const save = `<button class="ib pri" data-tip="Save car" aria-label="Save car">${ico('<path d="M20 6 9 17l-5-5"/>')}</button>`;
    return `<form id="fCar" novalidate>
      <div class="ac-top" style="margin-top:0"><div><h2 style="font-size:24px">${ced.orig ? `Edit ${esc(ced.orig)}` : 'Add a car'}</h2><p>This form follows the car page, top to bottom. Fields marked * are required. Ratings are left by customers after their trip, so there is nothing to enter here.</p></div>
        <div style="display:flex;gap:8px">${ib('x', 'Cancel', 'data-car-back')}${save}</div></div>

      ${!ced.orig && carList().length ? `<section class="ac-card w ac-sec"><h3>Start from a similar car</h3><p class="s">Copies the specs, deposit, features and rules of an existing car, so you only change what differs. Name and photos stay empty.</p>
        <div class="ac-f" style="max-width:360px;margin:0"><label for="lf-clone">Copy from</label><select id="lf-clone" name="clone"><option value="">Start empty</option>${carList().map(c => `<option>${esc(c.name)}</option>`).join('')}</select></div></section>` : ''}
      <section class="ac-card w ac-sec"><h3>Title</h3><p class="s">The line above the car name, the name itself and the “or similar” line.</p>
        <div class="ac-2">${(() => { const mo = !!d._mo || (!!d.make && !L.brand.includes(d.make));
          return `<div class="ac-f"><label for="lf-make">Brand <span class="req">*</span></label><select id="lf-make" name="make"><option value="">Choose a brand</option>${L.brand.map(b => `<option${!mo && b === d.make ? ' selected' : ''}>${esc(b)}</option>`).join('')}<option value="__other"${mo ? ' selected' : ''}>Other (type it)…</option></select><small>Shown as “Brand · Year” above the name. Add brands in Settings.</small></div>${mo ? fld('Brand name', 'makeText', d.make, { req: 1, ph: 'e.g. Škoda' }) : ''}`; })()}${fld('Model year', 'year', d.year, { type: 'number', min: 1950 })}
          ${fld('Car name', 'name', d.name, { req: 1, ph: 'e.g. Toyota Yaris Cross' })}
          <div class="ac-f"><label for="lf-type">Type <span class="req">*</span></label><select id="lf-type" name="type">${selOpts(L.type, d.type)}</select><small>Used for “or similar …” and the Cars page filters.</small></div></div></section>

      <section class="ac-card w ac-sec"><h3>Specs</h3><p class="s">The tiles under the photos. Climate (Air-con) and Mileage (Unlimited) are the same for every car.</p>
        <div class="ac-2">${fld('Seats (passengers)', 'seats', d.seats, { type: 'number', min: 1 })}${fld('Large bags', 'bags', d.bags, { type: 'number', min: 0 })}${fld('Doors (body)', 'doors', d.doors, { type: 'number', min: 2 })}
          <div class="ac-f"><label for="lf-trans">Gearbox</label><select id="lf-trans" name="trans">${selOpts(L.trans, d.trans)}</select></div>
          <div class="ac-f"><label for="lf-fuel">Fuel</label><select id="lf-fuel" name="fuel">${selOpts(L.fuel, d.fuel)}</select></div>
          <div class="ac-f"><label for="lf-drive">Drivetrain</label><select id="lf-drive" name="drive">${selOpts(L.drive, d.drive)}</select></div></div></section>

      <section class="ac-card w ac-sec"><h3>Overview</h3><p class="s">The overview text and the four facts under it. The last two (fuel policy or range, and cities) fill in on their own.</p>
        ${fld('Overview text', 'intro', d.intro, { area: 1, rows: 3, req: 1, ph: 'One or two sentences on who this car suits.' })}
        <div class="ac-2"><div class="ac-f"><label for="lf-from">Price per day <span class="req">*</span></label><div class="ac-price"><select id="lf-fromcur" name="fromCur" data-prev="${esc(d.fromCur)}">${curOpts(d.fromCur)}</select><input id="lf-from" name="from" type="number" min="0" step="any" value="${esc(d.fromAmt)}" autocomplete="off"></div><small id="fromHint">${esc(priceHint(d.fromAmt, d.fromCur))}</small></div>
          <div class="ac-f"><label for="lf-dep">Security deposit <span class="req">*</span></label><input id="lf-dep" name="deposit" type="number" min="0" step="any" value="${esc(d.depAmt)}" autocomplete="off"><small>Held, not charged. Same currency as the price.</small></div>
          ${fld('Minimum driver age', 'minAge', d.minAge, { type: 'number', min: 18 })}${fld('Range (km)', 'range', d.range, { type: 'number', min: 0, hint: 'Electric cars only. Shown instead of the fuel policy.' })}</div></section>

      <section class="ac-card w ac-sec"><h3>Pick-up, return and stock</h3><p class="s">Where this car can be picked up, whether it can be dropped somewhere else, and how many of it you have. The car page and the Cars page follow these rules.</p>
        <label class="sw"><input type="checkbox" name="allloc" id="lf-allloc"${!(d.locations || []).length ? ' checked' : ''}><i></i><span>Available in every location <small style="color:var(--mute)">(new locations are included automatically)</small></span></label>
        <div id="locBox" style="margin-top:12px"${!(d.locations || []).length ? ' hidden' : ''}><p class="s" style="margin:0 0 8px">Pick-up range: choose the locations this car can be picked up in. Use a region’s button to pick the whole region.</p>${locRegions(d.locations || [])}</div>
        <label class="sw" style="margin-top:14px"><input type="checkbox" name="oneway" id="lf-oneway"${d.oneWay !== false ? ' checked' : ''}><i></i><span>Can be returned to a different location <small style="color:var(--mute)">(one-way rentals)</small></span></label>
        <p class="s" style="margin:6px 0 14px;font-size:12px">Off: customers must return the car to the place they picked it up. Return places are limited to this car’s locations.</p>
        <div class="ac-2">${fld('Cars available (in stock)', 'units', d.units, { type: 'number', min: 0, hint: 'The car page shows how many are free for the dates a customer picks, and stops booking at 0.' })}</div></section>

      <section class="ac-card w ac-sec"><h3>Features</h3><p class="s">The tick list on the car page. “${esc(String(d.seats || 5))} seats · ${esc(String(d.doors || 4))} doors” is added automatically.</p>
        ${(() => { const ticked = (d.features || []).filter(f => L.feature.includes(f)), extra = (d.features || []).filter(f => !L.feature.includes(f));
          return `<div class="ac-loclist" style="margin-bottom:12px">${L.feature.map(f => `<label><input type="checkbox" name="featsel" value="${esc(f)}"${ticked.includes(f) ? ' checked' : ''}>${esc(f)}</label>`).join('')}</div>
          ${fld('Other features, one per line', 'features', extra.join('\n'), { area: 1, rows: 3, hint: 'Leave everything empty to use the default list for this type. Add reusable features in Fleet > Lists and defaults.' })}`; })()}</section>

      <section class="ac-card w ac-sec"><h3>Photos</h3><p class="s">The main photo is the card and the first gallery picture. The four below are optional gallery shots; empty ones show a placeholder.</p>
        ${imgField('Main photo', d.img, 1)}
        ${ced.orig && !d.img ? '<p class="s" style="margin:-6px 0 12px;font-size:12px">No custom photo set: the original image for this car is used.</p>' : ''}
        <div class="ac-2">${ph4.map((l, i) => imgField(l, (d.photos || [])[i] || '')).join('')}</div></section>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin:4px 0 20px">${ib('x', 'Cancel', 'data-car-back')}${save}</div>
    </form>`;
  }
  const imgOfBox = box => (box.querySelector('[data-imgdata]').value || box.querySelector('[data-imgurl]').value).trim();
  function collectCar() {
    const f = $('#fCar'), g = n => (f.elements[n] ? f.elements[n].value : '').trim();
    const mSel = f.elements.make ? f.elements.make.value : '', _mo = mSel === '__other';
    return { ...ced.d, name: g('name'), make: _mo ? g('makeText') : mSel, _mo, year: g('year'), type: g('type'), trans: g('trans'), fuel: g('fuel'), seats: g('seats'), doors: g('doors'), bags: g('bags'), drive: g('drive'),
      fromAmt: g('from'), fromCur: g('fromCur') || 'USD', depAmt: g('deposit'), minAge: g('minAge'), range: g('range'), intro: g('intro'),
      features: [...f.querySelectorAll('[name=featsel]:checked')].map(x => x.value).concat(g('features').split('\n').map(x => x.trim()).filter(Boolean)), img: imgOfBox(f.querySelector('[data-imgf][data-main]')),
      photos: [...f.querySelectorAll('[data-imgf]:not([data-main])')].map(imgOfBox),
      locations: f.elements.allloc.checked ? [] : [...f.querySelectorAll('[name=loc]:checked')].map(x => x.value), oneWay: f.elements.oneway.checked, units: g('units') };
  }
  function saveCar() {
    const d = ced.d = collectCar(), num = k => d[k] === '' ? NaN : Number(d[k]);
    if (!d.name) fail('Enter the car name.');
    if (!d.make) fail('Enter the brand.');
    const L = HZFLEET.lists();
    if (!L.type.includes(d.type) || !L.trans.includes(d.trans) || !L.fuel.includes(d.fuel)) fail('Pick a type, gearbox and fuel from the lists.');
    const seats = num('seats'), doors = num('doors'), bags = num('bags'), year = num('year'), minAge = num('minAge'), amt = num('fromAmt'), dep = num('depAmt'), range = num('range');
    if (!Number.isInteger(year) || year < 1950 || year > new Date().getFullYear() + 1) fail('Enter a model year, like 2025.');
    if (!Number.isInteger(seats) || seats < 1 || seats > 12) fail('Seats must be a whole number from 1 to 12.');
    if (!Number.isInteger(doors) || doors < 2 || doors > 6) fail('Doors must be a whole number from 2 to 6.');
    if (!Number.isInteger(bags) || bags < 0 || bags > 10) fail('Large bags must be a whole number from 0 to 10.');
    const units = num('units');
    if (!d.intro) fail('Write a short overview for the car page.');
    if (!Number.isInteger(units) || units < 0 || units > 999) fail('Cars available must be a whole number from 0 to 999.');
    if (!$('#lf-allloc').checked && !d.locations.length) fail('Pick at least one pick-up location, or turn on “Available in every location”.');
    if (!Number.isFinite(amt) || amt <= 0) fail('Enter the daily price as a number above 0.');
    if (!Number.isFinite(dep) || dep < 0) fail('Enter the security deposit (0 if none).');
    if (!Number.isInteger(minAge) || minAge < 18 || minAge > 30) fail('Minimum driver age must be a whole number from 18 to 30.');
    if (d.fuel === 'Electric' && !(range > 0)) fail('Enter the range in km for an electric car.');
    if (!okImg(d.img) || d.photos.some(u => !okImg(u))) fail('Image links must start with https:// (or upload a file instead).');
    const ls = carList().map(x => ({ ...x }));
    if (ls.some(x => x.name !== ced.orig && slug(x.name) === slug(d.name))) fail(`There is already a car called ${d.name}.`);
    const r4 = n => Math.round(n * 1e4) / 1e4, k = curRate(d.fromCur);   // prices are stored in USD
    const car = { name: d.name, make: d.make, year, type: d.type, trans: d.trans, fuel: d.fuel, seats, doors, bags, drive: d.drive, price: r4(amt / k), deposit: r4(dep / k), minAge,
      range: d.fuel === 'Electric' ? Math.round(range) : '', intro: d.intro, features: d.features, img: d.img, photos: d.photos.slice(0, 4), seedRating: d.seedRating || 0, seedN: d.seedN || 0, locations: d.locations, oneWay: d.oneWay, units };
    const i = ced.orig ? ls.findIndex(x => x.name === ced.orig) : -1;
    if (i >= 0) ls[i] = car; else ls.push(car);
    HZFLEET.save(ls); HZFLEET.apply(ls); recountLocs();
    flash = { ok: true, m: ced.orig ? `${car.name} updated.` : `${car.name} added.` };
    ced = null;
  }
  function deleteCar(name) {
    const car = carList().find(x => x.name === name);
    if (car) toTrash('car', name, [car.make, car.type, car.year].filter(Boolean).join(' · '), car);
    const ls = carList().filter(x => x.name !== name);
    HZFLEET.save(ls); HZFLEET.apply(ls); recountLocs();
    flash = { ok: true, m: `${name} moved to Trash.` };
  }

  const sortedMsgs = () => HZ.messages().sort((a, b) => new Date(b.created) - new Date(a.created));
  // ---- Deals: promo codes shown on deals.html and applied on the car page at checkout.
  let dd = null;   // null = list view; { orig: id | null, d: draft } = form (amounts in the main currency while editing)
  const dealUsd = n => Math.round(n / curRate(HZC.base()) * 1e4) / 1e4;
  const dealShow = usd => curRound(usd * curRate(HZC.base()), HZC.base());
  const blankDeal = () => ({ id: '', title: '', headline: '', text: '', note: '', code: '', kind: 'percent', value: '', minDays: 1, maxOff: '', evOnly: false, validFrom: '', validUntil: '', maxUses: 0, active: true, featured: false, img: '', cars: [], locations: [], newOnly: false, onHome: true });
  const dealDraft = x => ({ ...x, img: HZMEDIA.isRef(x.img) ? x.img : HZDEALS.imgUrl({ img: x.img }), value: x.kind === 'fixed' ? dealShow(x.value) : x.value, maxOff: +x.maxOff > 0 ? dealShow(x.maxOff) : '' });
  const dealStatus = x => !x.active ? 'Paused' : HZDEALS.expired(x) ? 'Expired' : HZDEALS.notStarted(x) ? 'Scheduled' : 'Active';
  const dl = { q: '', st: 'all', sel: null };
  const DL_ST = [['all', 'All deals'], ['Active', 'Active'], ['Scheduled', 'Scheduled'], ['Paused', 'Paused'], ['Expired', 'Expired']];
  const dlTag = st => st === 'Active' ? 'hi' : st === 'Expired' ? 'low' : st === 'Paused' || st === 'Scheduled' ? 'watch' : '';
  const dlOff = x => x.kind === 'percent' ? `${+x.value}% off` : `${curFmt(HZC.base(), dealShow(x.value))} off`;
  const dlList = () => { const q = dl.q.trim().toLowerCase(); return HZDEALS.all().filter(x => (dl.st === 'all' || dealStatus(x) === dl.st) && (!q || [x.title, x.code, x.headline].join(' ').toLowerCase().includes(q))); };
  const dlRows = (list, sel) => list.map(x => { const st = dealStatus(x), u = HZDEALS.used(x.code), mx = +x.maxUses || 0;
    return `<tr data-deal="${esc(x.id)}" class="${sel && x.id === sel.id ? 'sel' : ''}" tabindex="0" aria-selected="${!!sel && x.id === sel.id}"><td>${cell(x.title, x.headline, { b: 1, w: 240 })}</td><td><b class="dl-code">${esc(x.code)}</b></td><td class="v">${esc(dlOff(x))}</td>
      <td><span class="trip">${ticks(mx > 0 ? u / mx : Math.min(1, u / 20), 18)}<small>${u}${mx > 0 ? ' / ' + mx : ''} used</small></span></td><td><span class="mr-tag ${dlTag(st)}">${st}</span></td></tr>`; }).join('');
  function dlDetail(x) {
    if (!x) return `<div class="mr-ch"><div><h2>No deal</h2><p>Add a promo code to see it here.</p></div></div>`;
    const st = dealStatus(x), u = HZDEALS.used(x.code), mx = +x.maxUses || 0, sx = HZDEALS.stats(x.code), B = HZC.base();
    const rule = [+x.minDays > 1 ? `${+x.minDays}+ days` : '', x.evOnly ? 'Electric only' : '', x.cars.length ? plural(x.cars.length, 'car') : '', x.locations.length ? plural(x.locations.length, 'city', 'cities') : '', x.newOnly ? 'New customers' : ''].filter(Boolean).join(' · ');
    const big = x.kind === 'percent' ? `${+x.value}%` : curFmt(B, dealShow(x.value));
    return `<div class="dl-d" data-deal="${esc(x.id)}"><div class="mr-ch"><span class="mr-tag glass">${esc(x.code)}</span><span class="mr-tag ${dlTag(st)}">${st}</span></div>
      <h2 class="bk-title">${esc(x.title)}</h2>${bigNum(esc(big), x.kind === 'percent' ? 'off the rental price' + (+x.maxOff > 0 ? ` (max ${esc(curFmt(B, dealShow(x.maxOff)))})` : '') : 'off the booking')}
      ${ticks(mx > 0 ? u / mx : Math.min(1, u / 20), 30)}<div class="mr-axis"><span>${x.validFrom ? esc(HZDEALS.fmtDate(x.validFrom)) : 'Now'}</span><span>${u}${mx > 0 ? ' / ' + mx : ''} used</span><span>${x.validUntil ? esc(HZDEALS.fmtDate(x.validUntil)) : 'No end date'}</span></div>
      <p class="bk-note">${x.headline ? `<b>${esc(x.headline)}</b><br>` : ''}${rule ? esc(rule) + '<br>' : ''}Discount given ${sx.uses ? money(sx.off) : '–'} · Revenue ${sx.uses ? money(sx.revenue) : '–'}${x.featured ? '<br>Shown as the big banner.' : ''}</p>
      <div class="bk-st"><button type="button" data-deal-toggle>${x.active ? 'Pause' : 'Activate'}</button><button type="button" data-deal-dup>Duplicate</button></div>
      <div class="bk-act"><button type="button" class="mr-input" data-deal-edit><span>Edit deal</span><i>${arrowI}</i></button>${ib('trash', 'Delete deal', 'data-deal-del', 'd')}</div></div>`;
  }
  function dlView() {
    const list = dlList(), sel = list.find(x => x.id === dl.sel) || list[0] || null; dl.sel = sel ? sel.id : null;
    const all = HZDEALS.all();
    return { side: DL_ST.map(s => { const n = s[0] === 'all' ? all.length : all.filter(x => dealStatus(x) === s[0]).length; return `<button type="button" class="mr-cat${dl.st === s[0] ? ' on' : ''}" data-dlf="${s[0]}"><span>${s[1]}</span><em>${n}</em></button>`; }).join(''),
      table: list.length ? `<div class="mr-twrap"><table class="mr-tbl"><thead><tr><th>Deal</th><th>Code</th><th>Discount</th><th>Used</th><th>Status</th></tr></thead><tbody>${dlRows(list, sel)}</tbody></table></div>`
        : `<div class="ac-empty"><h3>${all.length ? 'No deals match' : 'No deals yet'}</h3><p>${all.length ? 'Try a different search or status.' : 'Add your first promo code' + (sampleOn() ? ', or press “Load sample data” in Settings > Sample data to fill in demo deals' : '') + '. Customers type the code on the car page when they book.'}</p></div>`,
      detail: dlDetail(sel) };
  }
  function refreshDl() { const v = dlView(); $('#dlSide').innerHTML = v.side; $('#dlTbl').innerHTML = v.table; $('#dlDetail').innerHTML = v.detail; }
  function dealsTab() {
    if (dd) return dealForm();
    const ds = HZDEALS.all(), v = dlView();
        const shown = new Set(HZDEALS.home(3).map(y => y.id)), hl = HZDEALS.homeList();
    const homeBox = ds.length ? `<section class="mr-card mr-home"><div class="mr-ch"><div><h2>Home page</h2><p>The first 3 live deals in this list show on the home page, in this order. Turn “Show on the home page” on or off in each deal’s form.</p></div></div>${hl.length ? hl.map((y, i) => `<div class="ac-hrow${shown.has(y.id) ? '' : ' off'}" data-hdeal="${esc(y.id)}"><span class="n">${i + 1}</span><div class="tx"><b>${esc(y.title)}</b> <small>${esc(y.code)} · ${shown.has(y.id) ? 'Showing on the home page' : dealStatus(y) !== 'Active' ? `Not showing (${dealStatus(y).toLowerCase()})` : 'Not showing (only 3 fit)'}</small></div><div class="act">${i > 0 ? ib('up', 'Move up', 'data-home-up') : ''}${i < hl.length - 1 ? ib('down', 'Move down', 'data-home-down') : ''}${ib('x', 'Remove from the home page', 'data-home-off')}</div></div>`).join('') : '<p class="s" style="margin:0">No deals are set to show on the home page.</p>'}</section>` : '';
    const sb = HZ.bookings().filter(b => b.stay && b.status !== 'cancelled'), ls = HZFORM.longstay();
    const lsBox = `<div class="rt-box"><b>Long-rental rates</b><span>${ls.on ? `Weekly ${ls.weekly.on ? `${+ls.weekly.pct}% from ${+ls.weekly.days} days` : 'off'} · Monthly ${ls.monthly.on ? `${+ls.monthly.pct}% from ${+ls.monthly.days} days` : 'off'}${+ls.cap > 0 ? ` · Combined maximum with a promo ${+ls.cap}%` : ''}.` : 'Switched off.'} ${sb.length ? `${plural(sb.length, 'booking')} used them, ${money(sb.reduce((t, b) => t + (+b.stay.off || 0), 0))} given.` : 'No booking has used them yet.'}</span><button type="button" class="mr-more" data-go="pricing:longstay">Edit rates</button></div>`;
    return `<div class="mr-bk mr-dl">
      <aside class="mr-card mr-side"><div class="mr-sh">Status</div><div id="dlSide">${v.side}</div>${lsBox}</aside>
      <section class="mr-card mr-mid"><div class="mr-tool"><input id="dlq" type="search" placeholder="Search title or code" value="${esc(dl.q)}" aria-label="Search deals"><button type="button" class="mr-more" data-export="deals">Export CSV</button><a class="mr-more" href="deals.html" target="_blank" rel="noopener">View deals page</a><button type="button" class="mr-more dark" data-deal-add>${ICO.plus} Add deal</button></div><div id="dlTbl">${v.table}</div></section>
      <aside class="mr-card dark mr-detail" id="dlDetail">${v.detail}</aside></div>
      ${homeBox}`;
  }
  app.addEventListener('click', e => {
    const f = e.target.closest('[data-dlf]'); if (f) { dl.st = f.dataset.dlf; dl.sel = null; refreshDl(); return; }
    const r = e.target.closest('tr[data-deal]'); if (r && !e.target.closest('button')) { dl.sel = r.dataset.deal; refreshDl(); if (innerWidth <= 1280) $('#dlDetail').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
  });
  app.addEventListener('keydown', e => { const r = e.target.closest && e.target.closest('tr[data-deal]'); if (r && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); dl.sel = r.dataset.deal; refreshDl(); } });
  app.addEventListener('input', e => { if (e.target.id === 'dlq') { dl.q = e.target.value; dl.sel = null; const v = dlView(); $('#dlTbl').innerHTML = v.table; $('#dlDetail').innerHTML = v.detail; } });
  function dealForm() {
    const d = dd.d, B = HZC.base();
    const sw = (n, label, on, hint) => `<label class="sw" style="margin-top:12px"><input type="checkbox" name="${n}"${on ? ' checked' : ''}><i></i><span>${label} <small style="color:var(--mute)">${hint}</small></span></label>`;
    const save = `<button class="ib pri" data-tip="Save deal" aria-label="Save deal">${ico('<path d="M20 6 9 17l-5-5"/>')}</button>`;
    return `<form id="fDeal" novalidate>
      <div class="ac-top" style="margin-top:0"><div><h2 style="font-size:24px">${dd.orig ? `Edit ${esc(dd.d.title || 'deal')}` : 'Add a deal'}</h2><p>Fields marked * are required. The code is checked when a customer books: dates, car type, end date and how many times it has been used.</p></div>
        <div style="display:flex;gap:8px">${ib('x', 'Cancel', 'data-deal-back')}${save}</div></div>
      <section class="ac-card w ac-sec"><h3>What customers read</h3><p class="s">Shown on the Deals page.</p>
        <div class="ac-2">${fld('Short title', 'title', d.title, { req: 1, ph: 'e.g. Weekend escape', hint: 'The badge on the card.' })}${fld('Note under the text', 'note', d.note, { ph: 'e.g. 3+ day rentals', hint: 'Optional.' })}</div>
        ${fld('Headline', 'headline', d.headline, { req: 1, ph: 'e.g. Save 25% on rentals of three days or longer' })}
        ${fld('Description', 'text', d.text, { area: 1, rows: 2, hint: 'Optional. Leave empty and the rule below is written out for you.' })}</section>
      <section class="ac-card w ac-sec"><h3>Picture</h3><p class="s">The photo behind the deal card on the home page and the Deals page. Upload a file or paste a link. Leave it empty and a plain dark card is used. On the big banner deal it is also the background of the banner on the Deals page.</p>
        ${imgField('Deal picture', d.img, 1)}</section>
      <section class="ac-card w ac-sec"><h3>The code and the discount</h3>
        <div class="ac-2">${fld('Promo code', 'code', d.code, { req: 1, ph: 'WEEKEND25', hint: '3 to 20 letters or numbers. Not case sensitive for customers.' })}
          <div class="ac-f"><label for="lf-kind">Discount type</label><select id="lf-kind" name="kind"><option value="percent"${d.kind === 'percent' ? ' selected' : ''}>Percent off the rental price</option><option value="fixed"${d.kind === 'fixed' ? ' selected' : ''}>Fixed amount off the booking</option></select></div></div>
        <div class="ac-2">${fld('Discount', 'value', d.value, { req: 1, type: 'number', min: 0, ph: '25', hint: `Percent: 25 means 25% off. Fixed amount: enter it in ${esc(B)}.` })}
          ${fld(`Maximum discount, ${esc(B)}`, 'maxOff', d.maxOff, { type: 'number', min: 0, ph: 'No limit', hint: 'Optional. Caps a percent deal.' })}</div>
        <div class="ac-2">${fld('Minimum rental, days', 'minDays', d.minDays, { type: 'number', min: 1, hint: '1 = any length.' })}${fld('Total uses allowed', 'maxUses', d.maxUses, { type: 'number', min: 0, hint: '0 = unlimited. Cancelled bookings give the use back.' })}</div>
        <div class="ac-2">${fld('Valid from', 'validFrom', d.validFrom, { type: 'date', hint: 'Optional. Leave empty to start right away. A later date schedules the deal: it goes live that day.' })}${fld('Valid until', 'validUntil', d.validUntil, { type: 'date', hint: 'Optional. The code works through this whole day.' })}</div>
        ${sw('evOnly', 'Electric cars only', d.evOnly, '')}${sw('active', 'Active', d.active, 'Turn off to pause the code without deleting it.')}${sw('featured', 'Show as the big banner on the Deals page', d.featured, 'Only one deal can be the banner.')}</section>
      <section class="ac-card w ac-sec"><h3>Who can use it</h3><p class="s">Limit the code to certain cars or pick-up cities, or to first-time customers. Leave everything on “any” for no limits.</p>
        <label class="sw"><input type="checkbox" name="anycar" id="dl-anycar"${!(d.cars || []).length ? ' checked' : ''}><i></i><span>Works on any car</span></label>
        <div id="dlCars" style="margin:12px 0"${!(d.cars || []).length ? ' hidden' : ''}><div class="ac-loclist">${carList().map(c => `<label><input type="checkbox" name="dcar" value="${esc(c[0])}"${(d.cars || []).includes(c[0]) ? ' checked' : ''}>${esc(c[0])}</label>`).join('') || '<small>No cars yet.</small>'}</div></div>
        <label class="sw" style="margin-top:12px"><input type="checkbox" name="anyloc" id="dl-anyloc"${!(d.locations || []).length ? ' checked' : ''}><i></i><span>Works in any pick-up city</span></label>
        <div id="dlLocs" style="margin:12px 0"${!(d.locations || []).length ? ' hidden' : ''}><div class="ac-loclist">${locList().map(l => `<label><input type="checkbox" name="dloc" value="${esc(l.city)}"${(d.locations || []).includes(l.city) ? ' checked' : ''}>${esc(l.city)}</label>`).join('') || '<small>No locations yet.</small>'}</div></div>
        ${sw('newOnly', 'New customers only', d.newOnly, 'Only people with no earlier booking. They need to be signed in to use it.')}</section>
      <section class="ac-card w ac-sec"><h3>Home page</h3>${sw('onHome', 'Show on the home page', d.onHome !== false, 'Set the order in the Home page box at the top of this tab. Only the first 3 live deals show.')}</section>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin:4px 0 20px">${ib('x', 'Cancel', 'data-deal-back')}${save}</div></form>`;
  }
  function readDeal() {
    const f = $('#fDeal'), g = n => f.elements[n].value.trim(), c = n => f.elements[n].checked;
    return { ...dd.d, title: g('title'), note: g('note'), headline: g('headline'), text: g('text'), code: g('code').toUpperCase(), kind: g('kind'), value: g('value'), maxOff: g('maxOff'), minDays: g('minDays'), maxUses: g('maxUses'), validUntil: g('validUntil'), evOnly: c('evOnly'), active: c('active'), featured: c('featured'), validFrom: g('validFrom'), newOnly: c('newOnly'), onHome: c('onHome'), img: imgOfBox(f.querySelector('[data-imgf]')),
      cars: c('anycar') ? [] : [...f.querySelectorAll('[name=dcar]:checked')].map(x => x.value), locations: c('anyloc') ? [] : [...f.querySelectorAll('[name=dloc]:checked')].map(x => x.value) };
  }
  function saveDeal() {
    dd.d = readDeal(); const d = dd.d, v = Number(d.value);
    if (!$('#dl-anycar').checked && !d.cars.length) fail('Pick at least one car, or turn on “Works on any car”.');
    if (!$('#dl-anyloc').checked && !d.locations.length) fail('Pick at least one city, or turn on “Works in any pick-up city”.');
    HZDEALS.save({ ...d, value: d.kind === 'fixed' ? dealUsd(v) : v, maxOff: d.kind === 'percent' && d.maxOff !== '' ? dealUsd(Number(d.maxOff) || 0) : 0 });
    dd = null; flash = { ok: true, m: 'Deal saved.' };
  }
  // Booking options contains only controls for the Reserve sidebar on the car detail page.
  const FORM_SECS = [['protection', 'Protection', 'Plans and prices'], ['extras', 'Extras', 'Add-ons charged per day'], ['driver', 'Driver options', 'Chauffeur and young driver'], ['tax', 'Taxes & fees', 'Rate and label'], ['longstay', 'Long-rental rates', 'Weekly and monthly savings'], ['savings', 'Deals page cards', 'Savings cards on Deals'], ['times', 'Pick-up & return times', 'Hours offered'], ['late', 'Late returns', 'Grace time and fees'], ['routes', 'One-way routes', 'Drop-off cities and fees'], ['options', 'Booking panel', 'Promo code box']];
  const BOOKING_SECS = [['protection', 'Protection', 'Plans and prices'], ['extras', 'Extras', 'Add-ons charged per day'], ['driver', 'Driver options', 'Chauffeur and young driver'], ['tax', 'Taxes & fees', 'Rate and label'], ['times', 'Pick-up & return times', 'Hours offered'], ['options', 'Booking panel', 'Promo code box']];
  // Pricing and return policies are separate from the Reserve sidebar.
  const PRICING_SECS = [['longstay', 'Long-rental rates', 'Weekly and monthly savings'], ['late', 'Late-return charges', 'Grace time and fees']];
  const FORM_HELP = {
    protection: 'The plans customers choose in the Protection box. The first plan shown is selected by default. A price of 0 shows as “Included”. Only one plan can be marked Recommended.',
    extras: 'Add-ons customers can tick in the Extras box. “Quantity” shows a − / + counter (for example an extra driver); “Yes / no” shows a single tick box.',
    driver: 'Self-drive is always available. Turn on a chauffeur option and a young-driver fee if you offer them.',
    tax: 'Added on top of every rental total: on the cars list, the car page and every booking.',
    savings: 'The “Savings that apply on their own” cards on the Deals page. Choose what shows, in what order, and the wording. Weekly, monthly and one-way cards fill themselves in from your real settings (leave their boxes empty); a custom card is whatever you type, so only promise what you really give. A card is hidden automatically if it would promise something that is switched off.',
    longstay: 'Savings that apply on their own to long rentals, with no code. A rental gets the bigger of the weekly or monthly rate, never both, taken off the base rental price (not extras or fees). Promo codes apply after it. The Deals page shows exactly what you set here.',
    times: 'The pick-up and return times customers can choose on the home page, cars page and car page.',
    late: 'Pick how strict you want to be, then adjust the numbers. Customers read the same rule in plain words before they book.',
    routes: 'Where a customer can pick a car up in one city and return it in another. Any pair not listed must be returned to the pick-up city.',
    options: 'Show or hide parts of the booking panel.',
  };
  let rtOn = null;   // the "Allow one-way returns" switch while the routes section is being edited
  const keepSwitch = () => { const sw = document.querySelector('#fFrm [data-c=oneWay]'); if (sw) rtOn = sw.checked; };
  let ltd = null;   // late-return rows being edited (kept when you add or remove a row)
  let fsec = 'protection', fd = null;   // fd = rows being edited in a list section (kept when you add, remove or reorder)
  const amt = usd => ({ usd: +usd || 0, shown: String(+usd > 0 ? dealShow(+usd) : 0) });
  const readAmt = el => { const t = el.value.trim(), n = Number(t); return { txt: t, val: t === '' ? 0 : n, usd: +el.dataset.usd || 0, shown: el.dataset.shown || '', same: t !== '' && String(n) === el.dataset.shown }; };
  const toUsd = a => a.same ? a.usd : dealUsd(a.val);   // a box that was not touched keeps its exact stored price (no rounding drift)
  const txtIn = (label, c, v, ph, hint) => `<div class="ac-f"><label>${label}</label><input type="text" data-c="${c}" value="${esc(v)}" placeholder="${esc(ph || '')}" aria-label="${esc(label)}">${hint ? `<small>${hint}</small>` : ''}</div>`;
  const numIn = (label, c, v, o = {}) => `<div class="ac-f"><label>${label}</label><input type="number" data-c="${c}" value="${esc(v)}" min="${o.min ?? 0}" step="${o.step || 'any'}" aria-label="${esc(label)}">${o.hint ? `<small>${o.hint}</small>` : ''}</div>`;
  const amtIn = (label, c, a, hint) => `<div class="ac-f"><label>${label}</label><input type="number" min="0" step="any" data-c="${c}" value="${esc(a.txt !== undefined ? a.txt : a.shown)}" data-usd="${a.usd}" data-shown="${esc(a.shown)}" aria-label="${esc(label)}">${hint ? `<small>${hint}</small>` : ''}</div>`;
  const fsw = (c, label, on, hint) => `<label class="sw" style="margin-top:12px"><input type="checkbox" data-c="${c}"${on ? ' checked' : ''}><i></i><span>${label}${hint ? ` <small style="color:var(--mute)">${hint}</small>` : ''}</span></label>`;
  const rowTools = (i, n) => `<span style="flex:1"></span><button type="button" class="ac-b g sm" data-fmove="-1"${i ? '' : ' disabled'} aria-label="Move up">↑</button><button type="button" class="ac-b g sm" data-fmove="1"${i < n - 1 ? '' : ' disabled'} aria-label="Move down">↓</button>${n > 1 ? ib('trash', 'Remove', 'data-fdel', 'd') : ''}`;
  const timeLbl = m => { const h = Math.floor(m / 60); return `${((h + 11) % 12) + 1}:${String(m % 60).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`; };
  const fromStore = k => k === 'savings' ? HZFORM.get('savings').cards.map(x => ({ ...x })) : k === 'protection' ? HZFORM.get('protection').map(p => ({ ...p, price: amt(p.price), excess: p.excess === null || p.excess === undefined ? { usd: 0, shown: '', txt: '' } : amt(p.excess) })) : HZFORM.get('extras').map(x => ({ ...x, price: amt(x.price) }));
  const blankRow = k => k === 'savings' ? { id: 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), kind: 'custom', active: true, value: '', title: '', text: '' } : k === 'routes' ? { id: 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), a: '', b: '', km: '', price: { usd: 0, shown: '', txt: '' } } : ({ id: 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), name: '', price: { usd: 0, shown: '', txt: '' }, excess: { usd: 0, shown: '', txt: '' }, covers: '', recommended: false, kind: 'check', max: 3, active: true });
  const routeRows = () => HZONEWAY.list().map(r => ({ id: r.id, a: r.a, b: r.b, km: r.km === undefined ? '' : r.km, price: amt(r.fee) }));
  function formsTab() {
    if (!BOOKING_SECS.some(x => x[0] === fsec)) fsec = 'protection';
    const F = HZFORM, pr = F.protection(), ex = F.extras(), dr = F.get('driver'), tx = F.get('tax'), tm = F.get('times'), op = F.get('options');
    const stat = { protection: [pr.length + (pr.length === 1 ? ' plan' : ' plans'), 'ok'], extras: [ex.length + ' shown', ex.length ? 'ok' : 'off'], driver: [dr.chauffeur.on || dr.young.on ? 'On' : 'Self-drive only', dr.chauffeur.on || dr.young.on ? 'ok' : 'off'],
      tax: [+tx.rate + '%', 'ok'], times: [timeLbl(+tm.start) + ' – ' + timeLbl(+tm.end), 'ok'], options: [op.promo ? 'Promo on' : 'Promo off', op.promo ? 'ok' : 'off'] };
    const rail = BOOKING_SECS.map(x => `<button type="button" data-fsec="${x[0]}" class="${x[0] === fsec ? 'on' : ''}"><span class="rs-n"><b>${x[1]}</b><small>${x[2]}</small></span><em class="rs-chip ${stat[x[0]][1]}">${esc(stat[x[0]][0])}</em></button>`).join('');
    const rec = pr.find(p => p.recommended) || pr[0], sub = 120, taxAmt = sub * (+tx.rate) / 100;
    const prev = `<aside class="rs-prev" aria-label="Booking panel preview"><div class="rs-pv-top"><span>What customers see</span><em class="rs-chip glass">Live</em></div>
      <h3>Reserve</h3><p class="rs-pv-sub">Sample: 3 days at ${HZC.usd(40)}/day</p>
      <div class="rs-pv-list">${pr.slice(0, 3).map(p => `<div class="${rec && p.id === rec.id ? 'on' : ''}"><span>${esc(p.name)}</span><b>${+p.price > 0 ? '+' + HZC.usd(+p.price) : 'Included'}</b></div>`).join('')}</div>
      <p class="rs-pv-meta">${ex.length ? ex.slice(0, 3).map(x => esc(x.name)).join(' · ') : 'No extras shown'}</p>
      <div class="rs-pv-tot"><span>${esc(tx.label)}<small>${+tx.rate}% of the rental</small></span><b>${HZC.usd(taxAmt)}</b></div>
      <div class="rs-pv-bar" aria-hidden="true">${Array.from({ length: 24 }, (_, i) => `<i${i < Math.min(24, Math.round(24 * (+tx.rate) / 25)) ? ' class="on"' : ''}></i>`).join('')}</div></aside>`;
    return `<div class="rs-wrap"><header class="rs-head"><div class="mr-eyebrow"><i></i>Reserve sidebar</div><h2>Every option customers see. <span>Set it once.</span></h2></header>
      <div class="rs-grid"><nav class="rs-nav" aria-label="Reserve sidebar settings">${rail}</nav><div class="ac-setbody rs-body">${formBody()}</div>${prev}</div></div>`;
  }
  function pricingTab() {
    if (!PRICING_SECS.some(x => x[0] === fsec)) fsec = 'longstay';
    const F = HZFORM, ls = F.get('longstay'), lt = F.get('late');
    const stat = { longstay: [ls.on ? 'On' : 'Off', ls.on ? 'ok' : 'off'], late: [lt.on ? 'On' : 'Off', lt.on ? 'ok' : 'off'] };
    const rail = PRICING_SECS.map(x => `<button type="button" data-fsec="${x[0]}" class="${x[0] === fsec ? 'on' : ''}"><span class="rs-n"><b>${x[1]}</b><small>${x[2]}</small></span><em class="rs-chip ${stat[x[0]][1]}">${stat[x[0]][0]}</em></button>`).join('');
    const tier = (t, n) => `<div class="${t.on ? 'on' : ''}"><span>${n}<small>from ${+t.days} days</small></span><b>${t.on ? '−' + +t.pct + '%' : 'Off'}</b></div>`;
    const prev = fsec === 'late'
      ? `<aside class="rs-prev" aria-label="Late-return preview"><div class="rs-pv-top"><span>What customers read</span><em class="rs-chip glass">${lt.on ? 'Charging' : 'Off'}</em></div><h3>Late returns</h3>
        <p class="rs-pv-sub">${lt.on ? (lt.mode === 'flat' ? 'One flat fee after the free time.' : 'Charged by the hour after the free time.') : 'Late returns are not charged.'}</p>
        <div class="rs-pv-list"><div class="on"><span>Free grace period</span><b>${+lt.grace ? HZ.mins(+lt.grace) : 'None'}</b></div>
        ${lt.mode === 'flat' ? `<div><span>Flat fee</span><b>${HZC.usd(+lt.flat)}</b></div>` : `<div><span>Each hour late</span><b>${HZC.usd(+lt.rate)}</b></div><div><span>Max per day</span><b>${+lt.cap ? HZC.usd(+lt.cap) : 'No limit'}</b></div>`}</div></aside>`
      : `<aside class="rs-prev" aria-label="Long-rental preview"><div class="rs-pv-top"><span>What customers see</span><em class="rs-chip glass">${ls.on ? 'Automatic' : 'Off'}</em></div><h3>Long stays</h3>
        <p class="rs-pv-sub">${+ls.cap ? 'Combined discount capped at ' + +ls.cap + '%.' : 'No cap on the combined discount.'}</p>
        <div class="rs-pv-list">${tier(ls.weekly, 'Weekly')}${tier(ls.monthly, 'Monthly')}</div></aside>`;
    return `<div class="rs-wrap"><header class="rs-head"><div class="mr-eyebrow"><i></i>Pricing &amp; return rules</div><h2>Fair rates. <span>Clear return rules.</span></h2></header>
      <div class="rs-grid"><nav class="rs-nav" aria-label="Pricing and return rules">${rail}</nav><div class="ac-setbody rs-body">${formBody()}</div>${prev}</div></div>`;
  }
  // Public Deals page savings cards are website content, not booking configuration.
  function savingsTab() {
    fsec = 'savings';
    const live = HZFORM.savingsCards().filter(c => c.show);
    const prev = `<section class="mr-card dark sv-prev"><div class="mr-ch"><div><h2>Live preview</h2><p>The cards visitors see on the Deals page right now.</p></div><span class="mr-tag glass">${live.length} showing</span></div>
      ${live.length ? `<div class="sv-cards">${live.map(c => `<div class="sv-c"><b>${esc(c.usd ? '$0' : c.big)}</b><span>${esc(c.title)}</span>${c.text ? `<small>${esc(c.text)}</small>` : ''}</div>`).join('')}</div>` : '<p class="bk-note" style="margin:0">No cards are showing. Turn one on below.</p>'}</section>`;
    return `<div class="sv-wrap">${prev}<div class="ac-setbody">${formBody()}</div></div>`;
  }
  function formBody() {
    const sec = FORM_SECS.find(x => x[0] === fsec), B = HZC.base();
    const head = `<div class="ac-card w" style="margin-bottom:12px"><h2>${sec[1]}</h2><p class="s" style="margin:0">${FORM_HELP[fsec]}</p></div>`;
    let body = '', list = fsec === 'protection' || fsec === 'extras' || fsec === 'savings';
    if (fsec === 'savings') {
      const sv = HZFORM.get('savings'), rows = fd || fromStore('savings'), n = rows.length, live = Object.fromEntries(HZFORM.savingsCards().map(c => [c.id, c]));
      const KINDS = [['weekly', 'Weekly rate (automatic)'], ['monthly', 'Monthly rate (automatic)'], ['oneway', 'One-way, no drop fee (automatic)'], ['custom', 'Custom message']];
      body = `<div class="ac-card w" style="margin-bottom:12px"><div class="ac-2">${txtIn('Section heading', 'savTitle', sv.title, HZFORM.DEFAULTS.savings.title)}${txtIn('Line under the heading', 'savSub', sv.sub, 'Leave empty to hide the line')}</div></div>`
        + rows.map((r, i) => { const w = live[r.id], auto = r.kind !== 'custom';
          return `<div class="ac-card w" data-fi="${i}" data-id="${esc(r.id)}" style="margin-bottom:12px">
        <div class="ac-2"><div class="ac-f"><label>Card type</label><select data-c="kind" aria-label="Card type">${KINDS.map(k => `<option value="${k[0]}"${k[0] === r.kind ? ' selected' : ''}>${k[1]}</option>`).join('')}</select></div>${txtIn('Big text', 'value', r.value, auto ? 'Automatic' : 'e.g. Free', auto ? 'Empty = filled in from your settings.' : '')}</div>
        <div class="ac-2">${txtIn('Title', 'title', r.title, auto ? 'Automatic' : 'e.g. Free cancellation')}${txtIn('Text', 'text', r.text, auto ? 'Automatic' : 'e.g. Up to 48 hours before pick-up.')}</div>
        ${w && r.active ? `<p class="s" style="margin:8px 0 0;font-size:13px">${w.show ? `Shows: <b>${esc([w.usd ? '$0' : w.big, w.title].filter(Boolean).join(' · '))}</b>` : esc(w.why)}</p>` : ''}
        <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;margin-top:6px">${fsw('active', 'Show on the Deals page', r.active)}${rowTools(i, n)}</div></div>`; }).join('');
    } else if (list) {
      const rows = fd || fromStore(fsec), n = rows.length;
      body = rows.map((r, i) => `<div class="ac-card w" data-fi="${i}" data-id="${esc(r.id)}" style="margin-bottom:12px">
        <div class="ac-2">${txtIn(fsec === 'protection' ? 'Plan name' : 'Extra name', 'name', r.name, fsec === 'protection' ? 'e.g. Standard' : 'e.g. Child seat')}${amtIn(`Price per day, ${esc(B)}`, 'price', r.price, fsec === 'protection' ? '0 = Included' : '')}</div>
        ${fsec === 'protection' ? `<div class="ac-2">${amtIn(`Excess, ${esc(B)}`, 'excess', r.excess, '0 = Zero excess. Leave empty to hide it.')}${txtIn('What it covers', 'covers', r.covers, 'e.g. Tyres, glass &amp; mirrors')}</div>`
          : `<div class="ac-2"><div class="ac-f"><label>How customers pick it</label><select data-c="kind" aria-label="How customers pick it"><option value="count"${r.kind === 'count' ? ' selected' : ''}>Quantity (− / +)</option><option value="check"${r.kind !== 'count' ? ' selected' : ''}>Yes / no tick box</option></select></div>${numIn('Most per booking', 'max', r.max, { min: 1, step: 1, hint: 'Only for quantity extras.' })}</div>`}
        <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;margin-top:6px">${fsec === 'protection' ? fsw('recommended', 'Recommended', r.recommended) : ''}${fsw('active', 'Shown to customers', r.active)}${rowTools(i, n)}</div></div>`).join('');
    } else if (fsec === 'driver') {
      const d = HZFORM.get('driver');
      body = `<div class="ac-card w" style="margin-bottom:12px"><h3 style="margin:0 0 2px">Driver provided</h3><p class="s" style="margin:0 0 6px">“Self-drive / With driver” switch at the top of the booking panel.</p>${fsw('chOn', 'Offer a car with a driver', d.chauffeur.on)}
        <div class="ac-2" style="margin-top:12px">${amtIn(`Driver price per day, ${esc(B)}`, 'chPrice', amt(d.chauffeur.price))}</div></div>
        <div class="ac-card w"><h3 style="margin:0 0 2px">Young-driver fee</h3><p class="s" style="margin:0 0 6px">The “Main driver is under …” tick box.</p>${fsw('yOn', 'Charge a young-driver fee', d.young.on)}
        <div class="ac-2" style="margin-top:12px">${numIn('Driver is under (age)', 'yAge', d.young.age, { min: 16, step: 1 })}${amtIn(`Fee per day, ${esc(B)}`, 'yFee', amt(d.young.fee))}</div></div>`;
    } else if (fsec === 'tax') {
      const t = HZFORM.get('tax');
      body = `<div class="ac-card w"><div class="ac-2">${txtIn('Name shown to customers', 'taxLabel', t.label, 'Taxes & fees')}${numIn('Rate, %', 'taxRate', t.rate, { min: 0, hint: 'For example 10 for 10%. Today it is applied as ' + +(TAX_RATE * 100).toFixed(2) + '%.' })}</div></div>`;
    } else if (fsec === 'times') {
      const t = HZFORM.get('times'), opts = []; for (let m = 0; m < 24 * 60; m += 30) opts.push(m);
      const so = (c, v, arr, lbl) => `<div class="ac-f"><label>${lbl[0]}</label><select data-c="${c}" aria-label="${lbl[0]}">${arr.map(m => `<option value="${m}"${+m === +v ? ' selected' : ''}>${c === 'tStep' ? m + ' minutes' : timeLbl(m)}</option>`).join('')}</select></div>`;
      body = `<div class="ac-card w"><div class="ac-2">${so('tStart', t.start, opts, ['First time offered'])}${so('tEnd', t.end, opts, ['Last time offered'])}</div><div class="ac-2">${so('tStep', t.step, [15, 30, 60], ['Time between choices'])}</div></div>`;
    } else if (fsec === 'late') {
      const l = HZFORM.get('late'), blank = () => ({ usd: 0, shown: '', txt: '' }), ov = (o, k) => o[k] === undefined || o[k] === null ? blank() : amt(o[k]);
      const d = ltd || { on: l.on, mode: l.mode === 'flat' ? 'flat' : 'tune', grace: String(l.grace), flat: amt(l.flat), rate: amt(l.rate), cap: amt(l.cap), s2after: String(l.s2after || 0), s2rate: amt(l.s2rate),
        rules: (l.rules || []).map(r => ({ by: r.by, value: r.value, grace: r.grace === undefined ? '' : String(r.grace), flat: ov(r, 'flat'), rate: ov(r, 'rate'), cap: ov(r, 'cap') })) };
      const ai = (c, a, ph) => `<input type="number" min="0" step="any" data-c="${c}" value="${esc(a.txt !== undefined ? a.txt : a.shown)}" data-usd="${a.usd}" data-shown="${esc(a.shown)}" placeholder="${ph || '0'}">`;
      // Grace period dropdown: 30 minutes to 3 days, every 30 minutes.
      const graces = Array.from({ length: 144 }, (_, k) => (k + 1) * 30);
      const gopts = (gv, inherit) => { const has = gv === '' || graces.includes(+gv), list = has ? graces : [...graces, +gv].sort((x, y) => x - y);
        return (inherit ? `<option value=""${gv === '' ? ' selected' : ''}>Same as main</option>` : '') + list.map(m => `<option value="${m}"${gv !== '' && m === +gv ? ' selected' : ''}>${m ? HZ.mins(m) : 'No grace period'}</option>`).join(''); };
      const carNames = typeof FLEET !== 'undefined' ? FLEET.map(c => c[0]) : [], typeNames = [...new Set(typeof FLEET !== 'undefined' ? FLEET.map(c => c[1]) : [])], cityNames = [...new Set(locList().map(x => x.city))];
      const BY = [['car', 'A specific car', 'Choose a car', carNames], ['type', 'A type of car', 'Choose a type', typeNames], ['city', 'A pick-up location', 'Choose a city', cityNames]];
      body = `<div class="ac-card w ac-ltc">
        <div class="ac-lt-top">${fsw('lateOn', 'Charge for late returns', d.on)}</div>
        <div id="ltBody" class="${d.on ? '' : 'off'}${d.mode === 'flat' ? ' lt-flat' : ''}">
          <p class="lt-q">Charging method</p>
          <div class="lt-modebar"><div class="lt-presets lt-modes" role="radiogroup" aria-label="Charging mode">
            <label class="lt-preset${d.mode === 'tune' ? ' on' : ''}"><input type="radio" name="lateMode" data-c="lateMode" value="tune"${d.mode === 'tune' ? ' checked' : ''}><b>Fine-tune it</b></label>
            <label class="lt-preset${d.mode === 'flat' ? ' on' : ''}"><input type="radio" name="lateMode" data-c="lateMode" value="flat"${d.mode === 'flat' ? ' checked' : ''}><b>Flat rate</b></label>
          </div><button type="button" class="ac-b g sm" data-late-view="form">${ICO.eye} View fee list</button><span class="lt-now" id="ltNow">Now using: <b>${d.mode === 'flat' ? 'Flat rate' : 'Fine-tune it'}</b></span></div>
          <p class="lt-q">Amounts <small>(in ${esc(B)})</small></p>
          <div class="lt-fields">
            <div class="ac-f"><label for="ltGrace">Free grace period</label><select id="ltGrace" data-c="grace">${gopts(d.grace)}</select></div>
            <div class="ac-f fl"><label>Flat fee</label>${ai('flat', d.flat)}</div>
            <div class="ac-f tn"><label for="ltRate">Fee for each hour late</label>${ai('rate', d.rate)}</div>
            <div class="ac-f tn"><label for="ltCap">Max per day <small>(0 = no limit)</small></label>${ai('cap', d.cap)}</div>
          </div>
          <p class="lt-hint"><span class="tn">After the free time, each hour (or part of an hour) costs the hourly fee. The daily max applies to every 24 hours, so a car that is days late keeps paying.</span><span class="fl">After the free time, the flat fee is charged once, however late the car is.</span></p>
          <p class="lt-q">Special rules <small>(optional)</small></p>
          <div id="ltCars">${d.rules.length ? d.rules.map((c, i) => { const by = BY.find(x => x[0] === c.by) || BY[0]; return `<div class="lt-car" data-lc="${i}">
            <div class="ac-f"><label>Applies to</label><select data-c="rBy">${BY.map(x => `<option value="${x[0]}"${x[0] === by[0] ? ' selected' : ''}>${x[1]}</option>`).join('')}</select></div>
            <div class="ac-f"><label>Which one</label><select data-c="rValue"><option value="">${by[2]}</option>${by[3].map(n => `<option value="${esc(n)}"${n === c.value ? ' selected' : ''}>${esc(n)}</option>`).join('')}${c.value && !by[3].includes(c.value) ? `<option value="${esc(c.value)}" selected>${esc(c.value)} (removed)</option>` : ''}</select></div>
            <div class="ac-f"><label>Grace</label><select data-c="cGrace">${gopts(c.grace, true)}</select></div>
            <div class="ac-f fl"><label>Flat fee</label>${ai('cFlat', c.flat, 'same')}</div>
            <div class="ac-f tn"><label>Per hour</label>${ai('cRate', c.rate, 'same')}</div>
            <div class="ac-f tn"><label>Max per day</label>${ai('cCap', c.cap, 'same')}</div>
            ${ib('trash', 'Remove this rule', 'data-ltcar-del', 'd')}</div>`; }).join('') : '<p class="lt-none">Everything follows the main rule. Add a rule for one car, a car type or a pick-up location; empty boxes mean “same as main”. Car beats type, type beats location.</p>'}
            <button type="button" class="ac-b g sm" data-ltcar-add>${ICO.plus} Add a rule</button></div>
        </div>
        <p class="lt-foot">Fees are charged from the <button type="button" class="ac-lnk" data-go="late">Returns</button> tab when a car comes back.</p></div>`;
    } else if (fsec === 'routes') {
      const locs = locList(), rows = fd || routeRows(), on = rtOn !== null ? rtOn : HZFORM.get('options').oneWay, short = rows.length === 1 ? 'route' : 'routes';
      const cityOpts = cur => `<option value="">Choose city</option>${locs.map(l => `<option value="${esc(l.city)}"${l.city === cur ? ' selected' : ''}>${esc(l.city)}</option>`).join('')}${cur && !locs.some(l => l.city === cur) ? `<option value="${esc(cur)}" selected>${esc(cur)} (removed)</option>` : ''}`;
      body = !locs.length ? `<div class="ac-empty"><h3>Add locations first</h3><p>Routes link two locations. Add them under Locations first, then come back here.</p></div>`
        : `<div class="ac-card w ac-rtc"><div class="ac-rt-top"><label class="sw"><input type="checkbox" data-c="oneWay"${on ? ' checked' : ''}><i></i><span><b>Allow one-way returns</b> <small style="color:var(--mute)">${on ? `${rows.length} ${short}` : 'off: every car goes back to its pick-up city'}</small></span></label></div>
        <div class="${on ? '' : 'ac-rt-off'}"><div class="ac-rt ac-rt-h"><span>City A</span><span></span><span>City B</span><span>Fee, ${esc(B)}</span><span>km</span><span></span></div>
        ${rows.length ? rows.map((r, i) => `<div class="ac-rt" data-fi="${i}" data-id="${esc(r.id)}"><select data-c="a" aria-label="City A">${cityOpts(r.a)}</select><span class="x" aria-hidden="true">⇄</span><select data-c="b" aria-label="City B">${cityOpts(r.b)}</select>
          <input type="number" min="0" step="any" data-c="price" value="${esc(r.price.txt !== undefined ? r.price.txt : r.price.shown)}" data-usd="${r.price.usd}" data-shown="${esc(r.price.shown)}" placeholder="0" aria-label="Fee in ${esc(B)}, 0 means no fee">
          <input type="number" min="1" step="1" data-c="km" value="${esc(r.km)}" placeholder="optional" aria-label="Distance in km, optional">${ib('trash', 'Remove this route', 'data-fdel', 'd')}</div>`).join('')
          : `<p class="ac-rt-none">No routes yet. Press “Add a route” to let customers drop a car in another city.</p>`}</div>
        <p class="ac-rt-note">A route works both ways. Fee 0 means free. Only link cities in the same region that are joined by road. Single cars can opt out in Fleet.</p></div>`;
    } else if (fsec === 'longstay') {
      const s = HZFORM.get('longstay');
      const tier = (k, title, hint) => `<div class="ac-card w" style="margin-bottom:12px"><h3 style="margin:0 0 2px">${title}</h3><p class="s" style="margin:0 0 6px">${hint}</p>${fsw(k + 'On', 'Offer this rate', s[k].on)}
        <div class="ac-2" style="margin-top:12px">${numIn('From (days)', k + 'Days', s[k].days, { min: 1, step: 1 })}${numIn('Discount, %', k + 'Pct', s[k].pct, { min: 0 })}</div></div>`;
      body = `<div class="ac-card w" style="margin-bottom:12px">${fsw('lsOn', 'Apply long-rental rates automatically', s.on, 'Switch off in peak season to stop discounting without losing your settings.')}
        <div class="ac-2" style="margin-top:12px">${numIn('Highest combined discount, %', 'lsCap', s.cap, { min: 0, hint: 'The most a booking can take off its base rental price from the automatic rate and a promo code together. 0 = no limit.' })}</div></div>`
        + tier('weekly', 'Weekly rate', 'The discount once the rental reaches this many days.') + tier('monthly', 'Monthly rate', 'Should start at more days than the weekly rate.');
    } else {
      const o = HZFORM.get('options');
      body = `<div class="ac-card w">${fsw('promo', 'Promo code box', o.promo, 'Customers can type a code from Admin > Deals.')}
        <div class="ac-2" style="margin-top:14px">${numIn('Gap between rentals, hours', 'buffer', o.buffer ?? 0, { min: 0, step: 1, hint: 'A car is held back this long before and after every booking (cleaning, hand-over). 0 = back-to-back allowed.' })}</div><p class="s" style="margin:12px 0 0;font-size:13px">One-way returns are set up under <button type="button" class="ac-lnk" data-go="locations:routes">Locations &gt; One-way routes</button>.</p></div>`;
    }
    const foot = `<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:14px">${(list || (fsec === 'routes' && locList().length)) ? `<button type="button" class="ac-b g" data-fadd>${ICO.plus} Add ${fsec === 'protection' ? 'a plan' : fsec === 'routes' ? 'a route' : fsec === 'savings' ? 'a card' : 'an extra'}</button>` : ''}${(fsec === 'routes' ? HZONEWAY.isCustom() : HZFORM.isCustom(fsec)) || fd ? '<button type="button" class="ac-b g" data-freset>Reset to defaults</button>' : ''}<span style="flex:1"></span><button class="ac-b">Save changes</button></div>`;
    return `<form id="fFrm" novalidate>${head}${body}${foot}</form>`;
  }
  function readRows() {
    return [...document.querySelectorAll('[data-fi]')].map(el => { const o = { id: el.dataset.id };
      el.querySelectorAll('[data-c]').forEach(f => { o[f.dataset.c] = f.dataset.c === 'price' || f.dataset.c === 'excess' ? readAmt(f) : f.type === 'checkbox' ? f.checked : f.value.trim(); }); return o; });
  }
  function readLate() {
    const F = $('#fFrm'), g = c => F.querySelector(`[data-c=${c}]`);
    return { on: g('lateOn').checked, mode: (F.querySelector('[data-c=lateMode]:checked') || {}).value === 'flat' ? 'flat' : 'tune', grace: g('grace').value, flat: readAmt(g('flat')), rate: readAmt(g('rate')), cap: readAmt(g('cap')), s2after: '', s2rate: { usd: 0, shown: '', txt: '' },
      rules: [...F.querySelectorAll('[data-lc]')].map(el => { const q = c => el.querySelector(`[data-c=${c}]`); return { by: q('rBy').value, value: q('rValue').value, grace: q('cGrace').value, flat: readAmt(q('cFlat')), rate: readAmt(q('cRate')), cap: readAmt(q('cCap')) }; }) };
  }
  const policyOf = d => ({ on: true, mode: d.mode, grace: Number(d.grace) || 0, flat: toUsd(d.flat), rate: toUsd(d.rate), cap: toUsd(d.cap), s2after: Number(d.s2after) || 0, s2rate: d.s2rate.txt === '' ? 0 : toUsd(d.s2rate) });
  // Live sentence + worked examples under the late-return form, so an admin sees the effect of every change before saving.
  function lateLive() {
    const F = $('#fFrm'); if (!F || !F.querySelector('#ltBody')) return;
    const d = readLate(), p = policyOf(d);
    F.querySelector('#ltBody').classList.toggle('off', !d.on); F.querySelector('#ltBody').classList.toggle('lt-flat', d.mode === 'flat');
    { const n = F.querySelector('#ltNow b'); if (n) n.textContent = d.mode === 'flat' ? 'Flat rate' : 'Fine-tune it'; }
    F.querySelectorAll('.lt-modes label').forEach(l => l.classList.toggle('on', l.querySelector('input').checked));
  }
  function saveForm() {
    const F = $('#fFrm'), g = c => F.querySelector(`[data-c=${c}]`), sec = fsec;
    if (sec === 'protection' || sec === 'extras') {
      const rows = fd = readRows(), names = [];
      rows.forEach((r, i) => { if (!r.name) throw Object.assign(new Error(`Give ${sec === 'protection' ? 'plan' : 'extra'} ${i + 1} a name.`), { user: true });
        if (names.includes(r.name.toLowerCase())) throw Object.assign(new Error(`“${r.name}” is listed twice.`), { user: true }); names.push(r.name.toLowerCase());
        if ((r.price.txt !== '' && !(r.price.val >= 0)) || (r.excess && r.excess.txt !== '' && !(r.excess.val >= 0))) throw Object.assign(new Error(`The price for “${r.name}” can’t be negative.`), { user: true });
        if (sec === 'extras' && r.kind === 'count' && !(Number(r.max) >= 1 && Number(r.max) <= 10)) throw Object.assign(new Error(`“${r.name}”: the most per booking is between 1 and 10.`), { user: true }); });
      if (sec === 'protection' && !rows.some(r => r.active)) throw Object.assign(new Error('Show at least one protection plan.'), { user: true });
      let rec = false;
      HZFORM.save(sec, rows.map(r => { const base = { id: r.id, name: r.name, price: toUsd(r.price), active: r.active };
        if (sec === 'protection') { const isRec = r.recommended && !rec; rec = rec || isRec; return { ...base, covers: r.covers, excess: r.excess.txt === '' ? null : toUsd(r.excess), recommended: isRec }; }
        return { ...base, kind: r.kind === 'count' ? 'count' : 'check', max: r.kind === 'count' ? Math.floor(Number(r.max)) : 1 }; }));
    } else if (sec === 'driver') {
      const age = Number(g('yAge').value);
      if (!(age >= 16 && age <= 99)) throw Object.assign(new Error('Enter an age between 16 and 99.'), { user: true });
      for (const c of ['chPrice', 'yFee']) if (g(c).value.trim() !== '' && !(Number(g(c).value) >= 0)) throw Object.assign(new Error('Prices can’t be negative.'), { user: true });
      HZFORM.save('driver', { chauffeur: { on: g('chOn').checked, price: toUsd(readAmt(g('chPrice'))) }, young: { on: g('yOn').checked, age: Math.floor(age), fee: toUsd(readAmt(g('yFee'))) } });
    } else if (sec === 'tax') {
      const rate = Number(g('taxRate').value), label = g('taxLabel').value.trim();
      if (!label) throw Object.assign(new Error('Give the line a name, like “Taxes & fees”.'), { user: true });
      if (!(g('taxRate').value.trim() !== '' && rate >= 0 && rate <= 100)) throw Object.assign(new Error('The rate must be between 0 and 100.'), { user: true });
      HZFORM.save('tax', { label, rate });
    } else if (sec === 'savings') {
      const rows = fd = readRows(), bad = m => { throw Object.assign(new Error(m), { user: true }); }, KINDS = ['weekly', 'monthly', 'oneway', 'custom'];
      rows.forEach((r, i) => {
        if (r.value.length > 24) bad(`Card ${i + 1}: the big text is too long (24 characters at most).`);
        if (r.title.length > 60) bad(`Card ${i + 1}: the title is too long (60 characters at most).`);
        if (r.text.length > 220) bad(`Card ${i + 1}: the text is too long (220 characters at most).`);
        if (r.kind === 'custom' && !r.value && !r.title && !r.text) bad(`Card ${i + 1} is empty. Add some text, or remove the card.`);
      });
      HZFORM.save('savings', { title: g('savTitle').value.trim(), sub: g('savSub').value.trim(), cards: rows.map(r => ({ id: r.id, kind: KINDS.includes(r.kind) ? r.kind : 'custom', active: !!r.active, value: r.value, title: r.title, text: r.text })) });
    } else if (sec === 'longstay') {
      const bad = m => { throw Object.assign(new Error(m), { user: true }); };
      const num = (c, lo, hi, what, whole) => { const v = g(c).value.trim(), x = Number(v); if (v === '' || !(x >= lo && x <= hi) || (whole && !Number.isInteger(x))) bad(`${what} must be ${whole ? 'a whole number' : 'a number'} from ${lo} to ${hi}.`); return x; };
      const tiers = {}; [['weekly', 'Weekly rate'], ['monthly', 'Monthly rate']].forEach(([k, L]) => { tiers[k] = { on: g(k + 'On').checked, days: num(k + 'Days', 1, 365, `${L}: the number of days`, true), pct: num(k + 'Pct', 0, 90, `${L}: the discount`) }; });
      if (tiers.weekly.on && tiers.monthly.on && tiers.monthly.days <= tiers.weekly.days) bad('The monthly rate should start at more days than the weekly rate.');
      const cap = num('lsCap', 0, 100, 'The highest combined discount');
      HZFORM.save('longstay', { on: g('lsOn').checked, weekly: tiers.weekly, monthly: tiers.monthly, cap });
    } else if (sec === 'times') {
      const start = +g('tStart').value, end = +g('tEnd').value, step = +g('tStep').value;
      if (!(end > start)) throw Object.assign(new Error('The last time must be later than the first time.'), { user: true });
      HZFORM.save('times', { start, end, step });
    } else if (sec === 'late') {
      const d = ltd = readLate(), bad = m => { throw Object.assign(new Error(m), { user: true }); };
      const neg = (a, m) => { if (a.txt !== '' && !(a.val >= 0)) bad(m); };
      neg(d.rate, 'The hourly fee can’t be negative.'); neg(d.cap, 'The maximum fee can’t be negative.'); neg(d.flat, 'The one-time fee can’t be negative.');
      const rate = toUsd(d.rate), cap = toUsd(d.cap);
      const flatMode = d.mode === 'flat';
      if (d.on && flatMode && !(toUsd(d.flat) > 0)) bad('Enter the flat fee (more than 0).');
      if (d.on && !flatMode && rate > 0 && cap > 0 && cap < rate) bad('The maximum fee should be at least one hour’s fee.');
      const rules = [], seen = new Set(), BYN = { car: 'car', type: 'car type', city: 'pick-up location' };
      d.rules.forEach((c, i) => { if (!c.value) bad(`Special rule ${i + 1}: choose the ${BYN[c.by]}.`); const key = c.by + '|' + c.value; if (seen.has(key)) bad(`“${c.value}” has two rules. Keep one.`); seen.add(key);
        ['flat', 'rate', 'cap'].forEach(k => neg(c[k], `${c.value}: fees can’t be negative.`));
        const cr = c.rate.txt === '' ? rate : toUsd(c.rate), cc = c.cap.txt === '' ? cap : toUsd(c.cap); if (!flatMode && cr > 0 && cc > 0 && cc < cr) bad(`${c.value}: the maximum should be at least one hour’s fee.`);
        const o = { by: c.by, value: c.value }; if (c.grace !== '') o.grace = Math.round(Number(c.grace)); if (c.flat.txt !== '') o.flat = toUsd(c.flat); if (c.rate.txt !== '') o.rate = toUsd(c.rate); if (c.cap.txt !== '') o.cap = toUsd(c.cap);
        if (Object.keys(o).length === 2) bad(`${c.value}: fill in at least one box, or remove the rule.`); rules.push(o); });
      HZFORM.save('late', { on: d.on, mode: d.mode, grace: Math.round(Number(d.grace) || 0), flat: toUsd(d.flat), rate, cap, s2after: Number(d.s2after) || 0, s2rate: d.s2rate.txt === '' ? 0 : toUsd(d.s2rate), rules });
    } else if (sec === 'routes') {
      const rows = fd = readRows(), seen = [], byCity = Object.fromEntries(locList().map(l => [l.city, l]));
      rows.forEach((r, i) => {
        const n = i + 1;
        if (!r.a || !r.b) fail(`Route ${n}: choose both cities.`);
        if (r.a === r.b) fail(`Route ${n}: the two cities must be different.`);
        const ca = byCity[r.a], cb = byCity[r.b];
        if (!ca || !cb) fail(`Route ${n}: ${!ca ? r.a : r.b} is not a location any more. Choose another city or remove the route.`);
        if (ca.region !== cb.region) fail(`${r.a} (${ca.region}) and ${r.b} (${cb.region}) are in different regions. A car can’t be driven between them, so a one-way return isn’t possible.`);
        const key = [r.a, r.b].sort().join('|'); if (seen.includes(key)) fail(`${r.a} ⇄ ${r.b} is listed twice.`); seen.push(key);
        if (r.price.txt !== '' && !(r.price.val >= 0)) fail(`Route ${n}: the fee can’t be negative.`);
        if (r.km !== '' && !(Number(r.km) > 0)) fail(`Route ${n}: the distance must be more than 0 km.`);
      });
      HZFORM.save('options', { ...HZFORM.get('options'), oneWay: g('oneWay').checked });
      HZONEWAY.save(rows.map(r => {
        const ca = byCity[r.a], cb = byCity[r.b], km = r.km === '' ? '' : Math.round(Number(r.km));
        const where = ca.country === cb.country ? ca.country : `${ca.country} → ${cb.country}`;
        return { id: r.id, a: r.a, b: r.b, km, info: km === '' ? where : `${where} · about ${km.toLocaleString('en-US')} km`, fee: toUsd(r.price) };
      }));
    } else {
      const buf = Number(g('buffer').value);
      if (!(g('buffer').value.trim() !== '' && buf >= 0 && buf <= 48)) throw Object.assign(new Error('The gap must be between 0 and 48 hours.'), { user: true });
      HZFORM.save('options', { ...HZFORM.get('options'), promo: g('promo').checked, buffer: Math.round(buf * 2) / 2 });
    }
    fd = null; ltd = null; rtOn = null; flash = { ok: true, m: sec === 'late' ? 'Saved. The new late-return rules are live.' : sec === 'routes' ? (HZFORM.get('options').oneWay ? 'Routes saved. Customers can only return cars along these routes.' : 'Saved. One-way returns are switched off, so every car goes back to its pick-up city.') : 'Saved. The booking panel is updated.' };
  }
  // ---------- Reviews (Mira "Plan" layout): a dark rating summary beside soft cards, one per review.
  const rv = { st: 'all' };
  const rvKey = s => s >= 3 ? String(s) : 'low';
  const rvWord = s => s >= 5 ? ['hi', 'Excellent'] : s === 4 ? ['', 'Good'] : s === 3 ? ['watch', 'Fair'] : ['low', 'Poor'];
  const stars = n => `<span class="rv-st">${'★'.repeat(n)}<s>${'★'.repeat(5 - n)}</s></span>`;
  function reviewsTab() {
    const rs = HZFLEET.reviews();
    if (!rs.length) return '<div class="ac-empty"><h3>No reviews yet</h3><p>Ratings and comments appear here after a guest rates a finished trip from their account.</p></div>';
    const avg = rs.reduce((t, r) => t + r.stars, 0) / rs.length, dist = [5, 4, 3, 2, 1].map(s => rs.filter(r => r.stars === s).length), maxD = Math.max(...dist, 1);
    const list = rs.filter(r => rv.st === 'all' || rvKey(r.stars) === rv.st), withText = rs.filter(r => r.text).length;
    const seg = [['all', 'All'], ['5', '5★'], ['4', '4★'], ['3', '3★'], ['low', '2★ and below']];
    const dt = d => new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    const cards = list.map(r => { const w = rvWord(r.stars);
      return `<article class="mr-card rv-card" data-rid="${esc(r.id)}"><div class="rv-top"><span class="mr-tag ${w[0]}">${w[1]}</span><span class="rv-ring" style="--p:${r.stars * 20}" aria-label="${r.stars} out of 5"><b>${r.stars}</b></span></div>
        <h3>${esc(r.car)}</h3>${stars(r.stars)}
        ${r.text ? `<p class="rv-text">${esc(r.text)}</p>` : '<p class="rv-text none">No comment left.</p>'}
        <div class="rv-foot"><span class="cu-who"><span class="ad-av">${esc(initials(r.name || 'Guest'))}</span><span><b>${esc(r.name || 'Guest')}</b><small>${r.city ? esc(r.city) + ' · ' : ''}${dt(r.created)}</small></span></span>${ib('trash', 'Delete review', 'data-rdel', 'd')}</div></article>`; }).join('');
    return `<div class="rv">
      <aside class="mr-card dark rv-sum"><div class="mr-ch"><div><h2>Average rating</h2><p>${plural(rs.length, 'review')}, ${withText} with a comment.</p></div><span class="mr-tag glass">${plural(rs.length, 'review')}</span></div>
        <div class="mr-big" style="--n:4">${avg.toFixed(1)}</div><p class="rt-lbl">out of 5 · ${'★'.repeat(Math.round(avg))}</p>
        <div class="rv-dist">${[5, 4, 3, 2, 1].map((s, i) => `<button type="button" class="rv-d${rv.st === rvKey(s) ? ' on' : ''}" data-rvf="${rvKey(s)}"><span>${s}★</span>${ticks(dist[i] / maxD, 20)}<em>${dist[i]}</em></button>`).join('')}</div></aside>
      <div class="rv-main"><div class="mr-tool"><div class="mr-seg" role="group" aria-label="Filter by rating">${seg.map(x => `<button type="button" data-rvf="${x[0]}" aria-selected="${rv.st === x[0]}">${x[1]}</button>`).join('')}</div></div>
        ${list.length ? `<div class="rv-cards">${cards}</div>` : '<div class="ac-empty"><h3>No reviews match</h3><p>Try a different rating.</p></div>'}</div></div>`;
  }
  app.addEventListener('click', e => { const b = e.target.closest('[data-rvf]'); if (b) { rv.st = rv.st === b.dataset.rvf && b.classList.contains('rv-d') ? 'all' : b.dataset.rvf; render(); } });

  // ---------- Messages (Mira "Care" layout): inbox | conversation | message details and quick replies.
  const mg = { sel: null, f: 'all' };
  const mgWhen = d => new Date(d).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  const mgList = () => sortedMsgs().filter(x => mg.f === 'all' || !x.read);
  const mgPick = list => { if (!list.some(x => x.id === mg.sel)) mg.sel = list[0] ? list[0].id : null; return list.find(x => x.id === mg.sel); };
  const mgRows = list => list.length ? list.map(x => `<button type="button" class="mg-row${x.id === mg.sel ? ' on' : ''}" data-msel="${esc(x.id)}"><span class="ad-av">${esc(initials(x.name))}</span><span><b>${esc(x.name)}</b><small>${esc(x.topic || x.message)}</small></span>${x.read ? '' : '<i class="mg-dot" aria-label="Unread"></i>'}</button>`).join('') : '<p class="mr-none">No unread messages.</p>';
  function mgThread(x) {
    if (!x) return '<div class="mg-empty"><h2>No message</h2><p>Pick a conversation to read it here.</p></div>';
    return `<div class="mg-head"><span class="ad-av">${esc(initials(x.name))}</span><div><b>${esc(x.name)}</b><small>${esc(x.email)}</small></div><span class="mr-tag ${x.read ? '' : 'hi'}">${x.read ? 'Read' : 'New'}</span></div>
      <div class="mg-body"><div class="mg-when">${esc(mgWhen(x.created))}</div><div class="mg-bub">${esc(x.message)}</div>
        ${x.ref ? `<div class="mg-ref"><span><b>${esc(x.topic || 'Booking')}</b><small>Reference</small></span><span class="mr-tag glass">${esc(x.ref)}</span></div>` : ''}</div>
      <div class="mg-in"><input id="mgIn" type="text" placeholder="Reply to ${esc(x.name.split(' ')[0])} by email" aria-label="Reply" autocomplete="off"><button type="button" data-mgsend aria-label="Send reply by email">${arrowI}</button></div>`;
  }
  function mgDetail(x) {
    if (!x) return '<div class="mr-ch"><div><h2>No message</h2><p>Messages from the Help page show up here.</p></div></div>';
    return `<div class="mg-d" data-mid="${esc(x.id)}"><div class="mr-ch"><span class="mr-tag glass">${esc(x.id)}</span><span class="mr-tag ${x.read ? 'glass' : 'hi'}">${x.read ? 'Read' : 'New'}</span></div>
      <h2 class="bk-title">${esc(x.topic || 'No topic')}</h2>
      <p class="bk-note"><b>${esc(x.name)}</b> · ${esc(x.email)}<br>Received ${esc(mgWhen(x.created))}${x.ref ? '<br>Reference ' + esc(x.ref) : ''}</p>
      <div class="bk-st"><button type="button" data-mread>${x.read ? 'Mark unread' : 'Mark read'}</button></div>
      <div class="bk-act"><a class="mr-input" href="mailto:${esc(x.email)}?subject=${encodeURIComponent('Re: ' + (x.topic || 'Your message'))}"><span>Reply by email</span><i>${arrowI}</i></a>${ib('trash', 'Delete message', 'data-mdel', 'd')}</div></div>`;
  }
  const MG_QUICK = ['Thanks for getting in touch. We are looking into it now.', 'Could you send us your booking ID so we can check?', 'All sorted. Let us know if anything else comes up.'];
  function refreshMg() {
    const list = mgList(), x = mgPick(list);
    $('#mgList').innerHTML = mgRows(list); $('#mgThread').innerHTML = mgThread(x); $('#mgDetail').innerHTML = mgDetail(x);
    app.querySelectorAll('[data-mgf]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.mgf === mg.f)));
  }
  function messagesTab() {
    const all = sortedMsgs();
    if (!all.length) return `<div class="ac-empty"><h3>No messages yet</h3><p>${HZ.settings().supportEmail ? 'Messages sent from the Help page will appear here.' : 'Set a support email in Settings to turn the Help page form on.'}</p></div>`;
    const list = mgList(), x = mgPick(list);
    return `<div class="mr-bk mg">
      <aside class="mr-card mr-side"><div class="mr-sh">Inbox · ${all.length}</div><div class="mr-seg mg-seg" role="group" aria-label="Filter messages">${[['all', 'All'], ['unread', 'Unread']].map(s => `<button type="button" data-mgf="${s[0]}" aria-selected="${mg.f === s[0]}">${s[1]}</button>`).join('')}</div><div id="mgList">${mgRows(list)}</div></aside>
      <section class="mr-card gray mg-chat" id="mgThread">${mgThread(x)}</section>
      <div class="mr-col"><aside class="mr-card dark mr-detail" id="mgDetail">${mgDetail(x)}</aside>
        <section class="mr-card mg-quick"><div class="mr-ch"><div><h2>Quick replies</h2><p>Tap one to start your reply.</p></div></div><div class="mr-list">${MG_QUICK.map(t => `<button type="button" class="mr-row" data-mgq="${esc(t)}"><span></span><span>${esc(t)}</span></button>`).join('')}</div></section></div></div>`;
  }
  const mgSend = () => { const x = HZ.messages().find(y => y.id === mg.sel), v = ($('#mgIn') || {}).value; if (!x) return; if (!v || !v.trim()) { HZ.toast('Write a reply first.', 'err'); return; } location.href = `mailto:${x.email}?subject=${encodeURIComponent('Re: ' + (x.topic || 'Your message'))}&body=${encodeURIComponent(v.trim())}`; };
  app.addEventListener('click', e => {
    const s = e.target.closest('[data-msel]'); if (s) { mg.sel = s.dataset.msel; refreshMg(); if (innerWidth <= 900) $('#mgThread').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); return; }
    const f = e.target.closest('[data-mgf]'); if (f) { mg.f = f.dataset.mgf; mg.sel = null; refreshMg(); return; }
    const q = e.target.closest('[data-mgq]'); if (q) { const i = $('#mgIn'); if (i) { i.value = q.dataset.mgq; i.focus(); } return; }
    if (e.target.closest('[data-mgsend]')) mgSend();
  });
  app.addEventListener('keydown', e => { if (e.target.id === 'mgIn' && e.key === 'Enter') { e.preventDefault(); mgSend(); } });
  function settingsOld() {
    const em = HZ.settings().supportEmail || '';
    return `<div class="ac-card w" style="max-width:560px"><h2>Support email</h2>
      <p class="s">Where Help page messages go. Until this is set, the Help page hides the contact form and shows a “messaging isn’t available yet” notice.</p>
      <form id="fSet" novalidate><div class="ac-f"><label for="sEmail">Support email</label><input id="sEmail" type="email" value="${esc(em)}" placeholder="support@yourdomain.com" autocomplete="off">
        <small>Contact form is currently <b>${em ? 'on' : 'off (hidden)'}</b>.</small></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="ac-b">Save</button>${em ? '<button type="button" class="ac-b g" data-clearemail>Turn form off</button>' : ''}</div></form>
      <p class="s" style="margin:16px 0 0;font-size:12px">Prototype note: messages are saved in this browser and listed in the Messages tab. Sending real email needs a server.</p></div>
      <div class="ac-card w" style="max-width:560px;margin-top:16px"><h2>Sample data</h2>
      <p class="s">The site starts empty. Fill it with demo locations, cars, deals, bookings and the ready-made dropdown lists, then remove it all again in one click. Everything here lives in this browser only.</p>
      ${(() => { const hasDemo = HZ.bookings().some(b => b.demo) || HZFLEET.hasSampleLists() || HZFLEET.hasSampleCars() || HZLOC.hasSample() || HZDEALS.hasSample();
        return sampleOn() || hasDemo ? `<div style="display:flex;gap:8px;flex-wrap:wrap;margin:14px 0 4px">${sampleOn() ? `<button type="button" class="ac-b" data-demo="add"${simgBusy ? ' disabled' : ''}>Load sample data</button>` : ''}${hasDemo ? `<button type="button" class="ac-b g" data-demo="clear"${simgBusy ? ' disabled' : ''}>Remove sample data</button>` : ''}</div>
        ${sampleOn() ? `<label class="sw" style="margin:10px 0 0"><input type="checkbox" id="simgWith"${simgWith ? ' checked' : ''}><i></i><span>Also load real photos from the image API</span></label>` : ''}` : ''; })()}
      ${sampleOn() || HZIMGAPI.has() ? `<hr style="border:0;border-top:1px solid var(--line);margin:18px 0 14px">
      <h3 style="margin:0 0 4px;font-size:15px">Sample images (API)</h3>
      <p class="s" style="margin:0">Finds a real photo for every car, location, car category, “best place to drive” and sample deal that has no picture yet, from the free Wikipedia image API. Only the image link is saved, so it takes almost no space. Your own pictures are never replaced. Needs an internet connection.</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:12px 0 0">${sampleOn() ? `<button type="button" class="ac-b" data-simg="add"${simgBusy ? ' disabled' : ''}>${simgBusy ? 'Loading…' : 'Load sample images'}</button>` : ''}${HZIMGAPI.has() ? `<button type="button" class="ac-b g" data-simg="clear"${simgBusy ? ' disabled' : ''}>Remove sample images</button>` : ''}<span class="s" id="simgStatus" role="status" style="font-size:12px">${esc(simgBusy)}</span></div>` : ''}
      <hr style="border:0;border-top:1px solid var(--line);margin:18px 0 14px">
      <label class="sw"><input type="checkbox" id="sSample"${sampleOn() ? ' checked' : ''}><i></i><span>Sample data tools are <b>${sampleOn() ? 'on' : 'off'}</b></span></label>
      <p class="s" style="margin:8px 0 0;font-size:12px">Turn the tools off when the site is live. The Load button is hidden, and Remove stays available while sample data is still stored.</p>
      </div>`;
  }
  let setSec = 'general';
  const SET_SECS = [['general', 'General', 'Support email'], ['admins', 'Admins', 'Who can sign in here'], ['sample', 'Sample data', 'Demo locations, cars, deals, bookings'], ['export', 'Export data', 'CSV files of your data']];
  function settingsTab() {
    const parts = settingsOld().split('<div class="ac-card w" style="max-width:560px;margin-top:16px">');
    const body = setSec === 'export' ? exportBody() : setSec === 'admins' ? acctBody('admin') : setSec === 'sample' ? '<div class="ac-card w" style="max-width:560px">' + parts[1] : parts[0];
    const em = HZ.settings().supportEmail || '', nAdm = HZ.users().filter(u => u.role === 'admin').length;
    const chip = { general: [em ? 'Form on' : 'Form off', em ? 'ok' : 'off'], admins: [String(nAdm), 'ok'], sample: [sampleOn() ? 'Tools on' : 'Tools off', sampleOn() ? 'ok' : 'off'], export: [Object.keys(EXPORTS).length + ' files', 'ok'] };
    const rail = SET_SECS.map(x => `<button type="button" data-sec="${x[0]}" class="${x[0] === setSec ? 'on' : ''}"><span class="rs-n"><b>${x[1]}</b><small>${x[2]}</small></span><em class="rs-chip ${chip[x[0]][1]}">${chip[x[0]][0]}</em></button>`).join('');
    const prev = `<aside class="rs-prev" aria-label="Site status"><div class="rs-pv-top"><span>Right now</span><em class="rs-chip glass">Live</em></div><h3>Site status</h3><p class="rs-pv-sub">What is switched on for this site.</p>
      <div class="rs-pv-list"><div class="${em ? 'on' : ''}"><span>Help page form<small>${em ? esc(em) : 'No support email set'}</small></span><b>${em ? 'On' : 'Off'}</b></div>
      <div><span>Admins<small>Can sign in here</small></span><b>${nAdm}</b></div>
      <div><span>Sample data tools<small>Demo cars, deals, bookings</small></span><b>${sampleOn() ? 'On' : 'Off'}</b></div></div></aside>`;
    return `<div class="rs-wrap"><div class="rs-grid${setSec === 'admins' ? ' rs-two' : ''}"><nav class="rs-nav" aria-label="Settings sections">${rail}</nav><div class="ac-setbody rs-body${setSec === 'admins' ? ' wide' : ''}">${body}</div>${setSec === 'admins' ? '' : prev}</div></div>`;
  }

  // ---------- Countries and cities (Locations tab): the lists behind the Country / Region / City dropdowns
  const NONE = '__none__';   // a car limited to no location at all (an empty list would mean "every location")
  const GKEY = 'hz-geo';
  const geoCustom = () => { const v = HZStore.get(GKEY, null) || {}; return { countries: v.countries || {}, cities: v.cities || {}, regions: v.regions || [] }; };
  const geoSave = g => { if (!HZStore.set(GKEY, g)) fail('Could not save (browser storage is full or blocked).'); };
  function geoMap() {   // { country: { region, cities: [..] } } from the built-in list, the admin's own additions and existing locations
    const m = {}, g = geoCustom();
    Object.entries(GEO).forEach(([c, [r, cs]]) => { m[c] = { region: r, cities: [...cs] }; });
    Object.entries(g.countries).forEach(([c, o]) => { m[c] = m[c] || { region: o.region, cities: [] }; });
    Object.entries(g.cities).forEach(([c, cs]) => { m[c] = m[c] || { region: '', cities: [] }; cs.forEach(x => { if (!m[c].cities.includes(x)) m[c].cities.push(x); }); });
    locList().forEach(l => { const e = (m[l.country] = m[l.country] || { region: l.region, cities: [] }); if (!e.cities.includes(l.city)) e.cities.push(l.city); });
    Object.values(m).forEach(e => e.cities.sort((a, b) => a.localeCompare(b)));
    return m;
  }
  const geoRegions = () => [...new Set([...REGION_LIST, ...geoCustom().regions, ...locList().map(l => l.region)].filter(Boolean))];
  const chip = (text, kind, a, b) => `<span class="ac-chip">${esc(text)}<button type="button" class="ib" data-tip="Remove" aria-label="Remove ${esc(text)}" data-geo-del="${kind}" data-a="${esc(a)}"${b != null ? ` data-b="${esc(b)}"` : ''}>${ICO.x}</button></span>`;
  function setLocations() {
    const g = geoCustom(), m = geoMap(), regs = geoRegions(), countries = Object.keys(m).sort();
    const myC = Object.keys(g.countries), myCities = Object.entries(g.cities).filter(([, cs]) => cs.length);
    const nCities = Object.values(m).reduce((t, e) => t + e.cities.length, 0), used = new Set(locList().map(l => l.country)).size;
    return `<div class="mr-grid mr-geo">
      <section class="mr-card dark s4"><div class="mr-ch"><div><h2>Countries and cities</h2><p>These lists fill the Country, Region and City dropdowns when you add a location.</p></div></div>
        <div class="mr-big" style="--n:4">${countries.length}</div><p class="rt-lbl">countries · ${nCities} cities · ${regs.length} regions</p>
        ${ticks(used / (countries.length || 1), 30)}<div class="mr-axis"><span>Built in ${Object.keys(GEO).length}</span><span>Yours ${myC.length}</span><span>In use ${used}</span></div></section>
      <section class="mr-card s4"><div class="mr-ch"><div><h2>Add a country</h2><p>Pick its region, so the Region dropdown fills itself.</p></div></div>
        <form id="fGeoC" novalidate><div class="ac-2">${fld('Country', 'gcname', '', { req: 1, ph: 'e.g. Vanuatu' })}<div class="ac-f"><label for="lf-gcregion">Region <span class="req">*</span></label><select id="lf-gcregion" name="gcregion"><option value="">Choose a region</option>${selOpts(regs, '')}</select></div></div><button class="ac-b">Add country</button></form>
        ${myC.length ? `<p class="geo-h">Your countries</p><div class="geo-chips">${myC.map(c => chip(`${c} · ${g.countries[c].region}`, 'country', c)).join('')}</div>` : ''}</section>
      <section class="mr-card s4"><div class="mr-ch"><div><h2>Add a city</h2><p>It then shows up in the City dropdown for that country.</p></div></div>
        <form id="fGeoCity" novalidate><div class="ac-2"><div class="ac-f"><label for="lf-gccountry">Country <span class="req">*</span></label><select id="lf-gccountry" name="gccountry"><option value="">Choose a country</option>${selOpts(countries, '')}</select></div>${fld('City', 'gccity', '', { req: 1, ph: 'e.g. Port Vila' })}</div><button class="ac-b">Add city</button></form>
        ${myCities.length ? `<p class="geo-h">Your cities</p>${myCities.map(([c, cs]) => `<p class="geo-c">${esc(c)}</p><div class="geo-chips">${cs.map(x => chip(x, 'city', c, x)).join('')}</div>`).join('')}` : ''}</section>
      <section class="mr-card s12"><div class="mr-ch"><div><h2>Regions</h2><p>Locations are grouped by region. The four built-in regions stay; add your own if you need more.</p></div></div>
        <div class="geo-2"><form id="fGeoR" novalidate>${fld('Region name', 'grname', '', { req: 1, ph: 'e.g. Pacific Islands' })}<button class="ac-b">Add region</button></form>
        <div><p class="geo-h" style="margin-top:0">In use</p><div class="geo-chips">${regs.map(r => REGION_LIST.includes(r) || !g.regions.includes(r) ? `<span class="ac-chip" style="padding-right:12px">${esc(r)}</span>` : chip(r, 'region', r)).join('')}</div></div></div></section></div>`;
  }
  // ---------- Lists and defaults (Fleet tab): dropdown lists and defaults used by the Fleet form
  const LIST_LABELS = { brand: 'Brand', type: 'Car type', trans: 'Gearbox', fuel: 'Fuel type', drive: 'Drivetrain', feature: 'Feature' };
  const OPT_PH = { brand: 'e.g. Škoda', type: 'e.g. Pickup', trans: 'e.g. Semi-automatic', fuel: 'e.g. Plug-in hybrid', drive: 'e.g. Rear-wheel drive', feature: 'e.g. Heated steering wheel' };
  const LIST_FIELD = { brand: 'make', type: 'type', trans: 'trans', fuel: 'fuel', drive: 'drive' };
  const optChip = (text, list) => `<span class="ac-chip">${esc(text)}<button type="button" class="ib" data-tip="Remove" aria-label="Remove ${esc(text)}" data-opt-del="${list}" data-b="${esc(text)}">${ICO.x}</button></span>`;
  const listName = k => k === 'trans' ? 'Gearboxes' : LIST_LABELS[k] + 's';
  function setFleet() {
    const L = HZFLEET.lists(), c = HZFLEET.cfg(), D = c.defaults, base = HZC.base();
    const dep = D.deposit === '' || D.deposit == null ? '' : curRound(D.deposit * curRate(base), base);
    const sel = (name, label, arr, cur) => `<div class="ac-f"><label for="lf-${name}">${label}</label><select id="lf-${name}" name="${name}"${arr.length ? '' : ' disabled'}>${arr.length ? arr.map(x => `<option${x === cur ? ' selected' : ''}>${esc(x)}</option>`).join('') : '<option value="">None yet. Add options below.</option>'}</select></div>`;
    const total = Object.keys(LIST_LABELS).reduce((t, k) => t + L[k].length, 0);
    const cars = carList(), keys = Object.keys(LIST_LABELS);
    const useN = (k, v) => k === 'feature' ? cars.filter(x => (x.features || []).includes(v)).length : cars.filter(x => x[LIST_FIELD[k]] === v).length;
    const CK = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-6.5"/></svg>';
    const ring = (a, b) => { const C = 2 * Math.PI * 14, p = b ? a / b : 0;
      return `<span class="fl-ring" role="img" aria-label="${a} of ${b}"><svg viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="14"/><circle class="p" cx="18" cy="18" r="14" stroke-dasharray="${(p * C).toFixed(1)} ${C.toFixed(1)}"/></svg><b>${a}/${b}</b></span>`; };
    const DESC = { brand: 'Fills the Brand dropdown in the Fleet form.', type: 'Fills the Car type dropdown. The home page groups cars by type.', trans: 'Fills the Gearbox dropdown in the Fleet form.', fuel: 'Fills the Fuel dropdown. Electric feeds the Electric category.', drive: 'Fills the Drivetrain dropdown in the Fleet form.', feature: 'The tick-boxes you can switch on for each car.' };
    const NUM = { brand: '02', type: '03', trans: '04', fuel: '05', drive: '06', feature: '07' };
    const lcard = (k, cls, dark) => {
      const items = L[k], used = items.filter(v => useN(k, v) > 0).length;
      const rows = items.map(v => { const n = useN(k, v);
        return `<li class="fl-row${n ? ' on' : ''}"><i class="fl-dot">${n ? CK : ''}</i><span>${esc(v)}</span>${n ? `<em>${plural(n, 'car')}</em>` : `<button type="button" class="fl-x" data-tip="Remove" aria-label="Remove ${esc(v)}" data-opt-del="${k}" data-b="${esc(v)}">${ICO.x}</button>`}</li>`; }).join('');
      return `<section class="mr-card ${dark ? 'dark ' : ''}fl-card ${cls}"><div class="fl-top"><span class="fl-n">${NUM[k]}</span>${ring(used, items.length)}</div>
        <h2>${listName(k)}</h2><p class="fl-d">${DESC[k]}</p>
        ${items.length ? `<ul class="fl-rows">${rows}</ul>` : '<p class="fl-none">None added yet. Use “Add an option”.</p>'}
        <div class="fl-foot"><span>In use</span><b>${used} of ${items.length}</b></div></section>`; };
    const defHead = `<section class="mr-card fl-card fl-c12"><div class="fl-top"><span class="fl-n">08</span></div><h2>Defaults for new cars</h2><p class="fl-d">Used when you press Add fleet. You can still change anything per car.</p>
        <form id="fFleetDef" novalidate><div class="fl-def">${sel('dtype', 'Car type', L.type, D.type)}${sel('dtrans', 'Gearbox', L.trans, D.trans)}${sel('dfuel', 'Fuel', L.fuel, D.fuel)}${sel('ddrive', 'Drivetrain', L.drive, D.drive)}${fld('Seats', 'dseats', D.seats ?? 5, { type: 'number', min: 1 })}
          ${fld('Doors', 'ddoors', D.doors ?? 4, { type: 'number', min: 2 })}${fld('Large bags', 'dbags', D.bags ?? 3, { type: 'number', min: 0 })}${fld('Minimum driver age', 'dminAge', D.minAge ?? 21, { type: 'number', min: 18 })}${fld('Cars in stock', 'dunits', D.units ?? 1, { type: 'number', min: 0 })}${fld(`Security deposit (${esc(base)})`, 'ddeposit', dep, { type: 'number', min: 0, hint: 'Leave empty to type it per car.' })}</div>
          <div class="fl-foot"><span>Pre-fills every new car</span><button class="ac-b">Save defaults</button></div></form></section>`;
    const filled = keys.filter(k => L[k].length).length;
    return `<div class="fl-wrap"><div class="fl-head"><div><span class="fl-eye">Fleet · Lists and defaults</span><h2>Set it once. <em>Reuse it everywhere.</em></h2></div><div class="fl-side"><span class="fl-eye">Total options</span><b>${total}</b></div></div>
      <div class="mr-grid mr-geo fl-grid">
      <section class="mr-card dark fl-card fl-c3 fl-tall"><div class="fl-top"><span class="fl-n">01</span>${ring(filled, keys.length)}</div>
        <h2>Add an option</h2><p class="fl-d">Pick a list, type the new option and press Add. It shows up in the Fleet form right away. An option a car uses can’t be removed.</p>
        <form id="fOpt" novalidate class="fl-add"><div class="ac-f"><label for="lf-olist">List</label><select id="lf-olist" name="olist">${keys.map(k => `<option value="${k}">${listName(k)}</option>`).join('')}</select></div>${fld('New option', 'oval', '', { req: 1, ph: OPT_PH.brand })}<button class="ac-b">Add option</button></form>
        <ul class="fl-rows">${keys.map(k => `<li class="fl-row${L[k].length ? ' on' : ''}"><i class="fl-dot">${L[k].length ? CK : ''}</i><span>${listName(k)}</span><em>${L[k].length}</em></li>`).join('')}</ul>
        <div class="fl-foot"><span>Total</span><b>${total} options</b></div></section>
      ${lcard('type', 'fl-c3 fl-tall')}${lcard('brand', 'fl-c3 fl-tall')}
      <div class="fl-c3 fl-stack">${lcard('trans', 'fl-c12')}${lcard('fuel', 'fl-c12', 1)}</div>
      ${lcard('drive', 'fl-c4')}${lcard('feature', 'fl-c8 fl-wide')}
      ${defHead}
      ${catPicsCard()}</div></div>`;
  }
  function fleetDefSave(f) {
    const v = n => f.elements[n].value.trim(), L = HZFLEET.lists(), c = HZFLEET.cfg();
    const ints = { dseats: ['Seats', 1, 12], ddoors: ['Doors', 2, 6], dbags: ['Large bags', 0, 10], dminAge: ['Minimum driver age', 18, 30], dunits: ['Cars in stock', 0, 999] }, d = {};
    Object.entries(ints).forEach(([k, [lab, lo, hi]]) => { const n = Number(v(k)); if (v(k) === '' || !Number.isInteger(n) || n < lo || n > hi) fail(`${lab} must be a whole number from ${lo} to ${hi}.`); d[k.slice(1)] = n; });
    d.type = v('dtype'); d.trans = v('dtrans'); d.fuel = v('dfuel'); d.drive = v('ddrive');
    if ((d.type && !L.type.includes(d.type)) || (d.trans && !L.trans.includes(d.trans)) || (d.fuel && !L.fuel.includes(d.fuel)) || (d.drive && !L.drive.includes(d.drive))) fail('Pick the type, gearbox, fuel and drivetrain from the lists.');
    const dep = v('ddeposit'); if (dep !== '') { const n = Number(dep); if (!Number.isFinite(n) || n < 0) fail('Security deposit must be 0 or more.'); d.deposit = Math.round(n / curRate(HZC.base()) * 1e4) / 1e4; } else d.deposit = '';
    c.defaults = d; HZFLEET.saveCfg(c); flash = { ok: true, m: 'Defaults saved. New cars start with them.' };
  }
  function optAdd(f) {
    const k = f.elements.olist.value, val = f.elements.oval.value.trim(), c = HZFLEET.cfg();
    if (!LIST_LABELS[k]) fail('Pick a list.'); if (!val) fail('Enter the new option.');
    if (HZFLEET.lists()[k].some(x => x.toLowerCase() === val.toLowerCase())) fail(`${val} is already in the ${LIST_LABELS[k].toLowerCase()} list.`);
    (c.lists[k] = c.lists[k] || []).push(val); HZFLEET.saveCfg(c); flash = { ok: true, m: `${val} added to ${LIST_LABELS[k].toLowerCase()}s.` };
  }
  function optDelete(k, val) {
    const c = HZFLEET.cfg();
    if (LIST_FIELD[k] && carList().some(x => x[LIST_FIELD[k]] === val)) fail(`${val} is used by a car. Change that car first.`);
    c.lists[k] = (c.lists[k] || []).filter(x => x !== val); if (c.defaults[k === 'brand' ? 'make' : k] === val) delete c.defaults[k];
    HZFLEET.saveCfg(c); flash = { ok: true, m: 'Removed.' };
  }
  function geoAdd(kind, f) {
    const g = geoCustom(), m = geoMap(), v = n => (f.elements[n] ? f.elements[n].value : '').trim(), has = (arr, x) => arr.some(y => y.toLowerCase() === x.toLowerCase());
    if (kind === 'country') {
      const name = v('gcname'), region = v('gcregion');
      if (!name) fail('Enter the country name.'); if (!region) fail('Pick the region this country belongs to.');
      if (has(Object.keys(m), name)) fail(`${name} is already in the list.`);
      g.countries[name] = { region }; geoSave(g); flash = { ok: true, m: `${name} added.` };
    } else if (kind === 'city') {
      const country = v('gccountry'), city = v('gccity');
      if (!country) fail('Pick a country first.'); if (!city) fail('Enter the city name.');
      if (has(m[country].cities, city)) fail(`${city} is already listed for ${country}.`);
      (g.cities[country] = g.cities[country] || []).push(city); geoSave(g); flash = { ok: true, m: `${city} added to ${country}.` };
    } else {
      const name = v('grname'); if (!name) fail('Enter the region name.');
      if (has(geoRegions(), name)) fail(`${name} is already a region.`);
      g.regions.push(name); geoSave(g); flash = { ok: true, m: `${name} added.` };
    }
  }
  function geoDelete(kind, a, b) {
    const g = geoCustom();
    if (kind === 'country') { if (locList().some(l => l.country === a)) fail(`${a} is used by a location. Delete that location first.`); delete g.countries[a]; delete g.cities[a]; }
    else if (kind === 'city') { if (locList().some(l => l.city === b)) fail(`${b} is a location. Delete that location first.`); g.cities[a] = (g.cities[a] || []).filter(x => x !== b); }
    else { if (locList().some(l => l.region === a)) fail(`${a} is used by a location. Move or delete those locations first.`); g.regions = g.regions.filter(x => x !== a); }
    geoSave(g); flash = { ok: true, m: 'Removed.' };
  }

  // ---------- Locations (add / edit / delete, with "Best places to drive from")
  const REGION_LIST = ['Asia-Pacific', 'Europe', 'Americas', 'Middle East & Africa'];
  const locList = () => HZLOC.all();
  const blankLoc = () => ({ city: '', country: '', region: '', desc: '', airport: '', station: '', cars: 10, from: 40, key: '', img: '', airAddr: '', townAddr: '', side: 'right', licence: '', about: '', bestTime: '', tip: '', spots: [] });
  const blankSpot = () => ({ name: '', tag: '', desc: '', time: '', img: '' });
  let ed = null;   // null = list view; { orig: 'City name' | null, d: draft } = form
  const fail = m => { const e = new Error(m); e.user = true; throw e; };
  const locImg = l => resolveImg(l.img) || pic('cities.' + l.key);

  // ---------- Locations (Mira layout): region list | table | dark detail card for the selected location
  const lc = { reg: 'all', q: '', sel: null };
  function lcView() {
    const all = locList(), q = lc.q.trim().toLowerCase(), maxC = Math.max(...all.map(l => +l.cars || 0), 1);
    const list = all.filter(l => (lc.reg === 'all' || l.region === lc.reg) && (!q || [l.city, l.country, l.airport, l.station].join(' ').toLowerCase().includes(q)));
    if (!list.some(l => l.city === lc.sel)) lc.sel = list[0] ? list[0].city : null;
    const sel = list.find(l => l.city === lc.sel);
    const regs = [...new Set(all.map(l => l.region).filter(Boolean))].sort();
    const row = (k, label, n) => `<button type="button" class="mr-cat${lc.reg === k ? ' on' : ''}" data-lcreg="${esc(k)}"><span>${esc(label)}</span><em>${n}</em></button>`;
    const side = row('all', 'All regions', all.length) + regs.map(r => row(r, r, all.filter(l => l.region === r).length)).join('');
    const rows = list.map(l => `<tr data-lcrow="${esc(l.city)}" class="${l.city === lc.sel ? 'sel' : ''}" tabindex="0" aria-selected="${l.city === lc.sel}">
      <td><div class="lt"><span class="lthumb">${locImg(l) ? `<img src="${esc(locImg(l))}" alt="" loading="lazy">` : ''}</span>${cell(l.city, l.country, { b: 1, w: 190 })}</div></td>
      <td class="v">${HZC.usd(+l.from || 0)}<small class="lc-pd"> /day</small></td><td><span class="trip">${ticks((+l.cars || 0) / maxC, 18)}<small>${plural(+l.cars || 0, 'car')}</small></span></td><td>${(l.spots || []).length}</td></tr>`).join('');
    const table = list.length ? `<div class="mr-twrap"><table class="mr-tbl"><thead><tr><th>Location</th><th>From</th><th>Cars</th><th>Places</th></tr></thead><tbody>${rows}</tbody></table></div>`
      : `<div class="ac-empty"><h3>${all.length ? 'No locations match' : 'No locations yet'}</h3><p>${all.length ? 'Try a different search or region.' : 'Add your first location so customers can pick a pick-up city' + (sampleOn() ? ', or press “Load sample data” in Settings > Sample data to fill in demo locations' : '') + '.'}</p></div>`;
    return { side, table, detail: lcDetail(sel, maxC) };
  }
  function lcDetail(l, maxC) {
    if (!l) return '<div class="mr-ch"><div><h2>No location</h2><p>Add a location to see it here.</p></div></div>';
    const img = locImg(l), big = String(HZC.usd(+l.from || 0)).replace(/<[^>]*>/g, '').length;
    return `<div class="dl-d" data-lccity="${esc(l.city)}"><div class="mr-ch"><span class="mr-tag glass">${esc(l.region || 'No region')}</span><span class="mr-tag hi">${plural((l.spots || []).length, 'place')}</span></div>
      ${img ? `<div class="lc-img"><img src="${esc(img)}" alt="" loading="lazy"></div>` : ''}
      <h2 class="bk-title">${esc(l.city)}<small class="lc-co">${esc(l.country)}</small></h2>
      <div class="mr-big" style="--n:${Math.max(6, big)}">${HZC.usd(+l.from || 0)}</div><p class="rt-lbl">per day, cheapest car</p>
      ${ticks((+l.cars || 0) / maxC, 30)}<div class="mr-axis"><span>${plural(+l.cars || 0, 'car')}</span><span>${plural((l.spots || []).length, 'pick-up desk')}</span></div>
      <p class="bk-note"><b>${esc(l.airport || 'No airport desk')}</b>${l.station ? '<br>' + esc(l.station) : ''}${l.bestTime ? '<br>Best time: ' + esc(l.bestTime) : ''}</p>
      <div class="bk-act"><a class="mr-input" href="location.html?city=${slug(l.city)}" target="_blank" rel="noopener"><span>View page</span><i>${arrowI}</i></a>${ib('edit', 'Edit location', 'data-lc-edit', '')}${ib('trash', 'Delete location', 'data-lc-del', 'd')}</div></div>`;
  }
  function refreshLc() { const v = lcView(); $('#lcSide').innerHTML = v.side; $('#lcTbl').innerHTML = v.table; $('#lcDetail').innerHTML = v.detail; }
  function locationsList() {
    const v = lcView();
    return `<div class="mr-bk mr-lc">
      <aside class="mr-card mr-side"><div class="mr-sh">By region</div><div id="lcSide">${v.side}</div>
        <div class="rt-box"><b>Missing a city?</b><span>Countries, cities and regions come from your lists.</span><button type="button" class="mr-more" data-go="locations:geo">Edit lists</button></div></aside>
      <section class="mr-card mr-mid"><div class="mr-tool"><input id="lcq" type="search" placeholder="Search city, country or airport" value="${esc(lc.q)}" aria-label="Search locations"><button type="button" class="mr-more dark" data-loc-add>${ICO.plus} Add location</button></div><div id="lcTbl">${v.table}</div></section>
      <aside class="mr-card dark mr-detail" id="lcDetail">${v.detail}</aside></div>`;
  }
  app.addEventListener('click', e => {
    const rg = e.target.closest('[data-lcreg]'); if (rg) { lc.reg = rg.dataset.lcreg; lc.sel = null; refreshLc(); return; }
    const r = e.target.closest('tr[data-lcrow]'); if (r) { lc.sel = r.dataset.lcrow; refreshLc(); if (innerWidth <= 1280) $('#lcDetail').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); return; }
    const d = e.target.closest('[data-lccity]'); if (!d) return;
    if (e.target.closest('[data-lc-edit]')) { const l = locList().find(x => x.city === d.dataset.lccity); if (l) { ed = { orig: l.city, d: priceDraft({ ...l, spots: (l.spots || []).map(x => ({ ...x })) }) }; render(); scrollTo(0, 0); } return; }
    if (e.target.closest('[data-lc-del]')) act(() => deleteLocation(d.dataset.lccity));
  });
  app.addEventListener('keydown', e => { const r = e.target.closest && e.target.closest('tr[data-lcrow]'); if (r && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); lc.sel = r.dataset.lcrow; refreshLc(); } });
  app.addEventListener('input', e => { if (e.target.id === 'lcq') { lc.q = e.target.value; lc.sel = null; const v = lcView(); $('#lcTbl').innerHTML = v.table; $('#lcDetail').innerHTML = v.detail; } });

  function locationsTab() {
    if (ed) return locForm();
    if (lsub === 'routes' && fsec !== 'routes') { fsec = 'routes'; fd = null; rtOn = null; }
    const bar = subTabs('locations', [['list', `Locations (${locList().length})`], ['geo', 'Countries and cities'], ['routes', 'One-way routes']], lsub);
    return bar + (lsub === 'geo' ? setLocations() : lsub === 'routes' ? `<div class="mr-grid mr-rt2">${rtSummary()}<div class="s8">${formBody()}</div></div>` : locationsList());
  }
  // One-way routes: dark summary card beside the (restyled) routes form.
  function rtSummary() {
    const locs = locList(), rows = routeRows(), on = HZFORM.get('options').oneWay, linked = new Set(rows.flatMap(r => [r.a, r.b]).filter(Boolean)).size, free = rows.filter(r => !(+r.price.usd > 0)).length;
    return `<aside class="mr-card dark s4"><div class="mr-ch"><div><h2>One-way routes</h2><p>Which city pairs allow a one-way return, and the fee. A route works both ways.</p></div><span class="mr-tag ${on ? 'hi' : 'glass'}">${on ? 'On' : 'Off'}</span></div>
      <div class="mr-big" style="--n:4">${rows.length}</div><p class="rt-lbl">${rows.length === 1 ? 'route' : 'routes'}${rows.length ? ` · ${free} free` : ''}</p>
      ${ticks(locs.length ? linked / locs.length : 0, 30)}<div class="mr-axis"><span>${linked} of ${locs.length} cities linked</span></div>
      <div class="cu-trips" style="margin:18px 0 0">${rows.slice(0, 4).map(r => `<div class="cu-bk"><span class="mr-tag glass">⇄</span><span><b>${esc(r.a)} · ${esc(r.b)}</b><small>${r.km ? esc(r.km) + ' km' : 'Distance not set'}</small></span><em>${+r.price.usd > 0 ? HZC.usd(+r.price.usd) : 'Free'}</em></div>`).join('')}</div></aside>`;
  }
  const fld = (label, name, val, o = {}) => `<div class="ac-f${o.full ? ' full' : ''}"><label for="lf-${name}">${label}${o.req ? ' <span class="req">*</span>' : ''}</label>${o.area
    ? `<textarea id="lf-${name}" name="${name}" rows="${o.rows || 3}" placeholder="${esc(o.ph || '')}">${esc(val)}</textarea>`
    : `<input id="lf-${name}" name="${name}" type="${o.type || 'text'}"${o.min != null ? ` min="${o.min}"` : ''} value="${esc(val)}" placeholder="${esc(o.ph || '')}"${o.list ? ` list="${o.list}"` : ''} autocomplete="off">`}${o.hint ? `<small>${o.hint}</small>` : ''}</div>`;

  const imgField = (label, val, main) => { const data = /^(data:|lib:)/.test(val || ''); return `<div class="ac-f" data-imgf${main ? ' data-main' : ''}><label>${label}</label><div class="ac-img">
      <div class="th" data-th>${val ? `<img src="${esc(HZMEDIA.resolve(val))}" alt="">` : '<span>No image</span>'}</div>
      <div class="ctl"><input type="text" data-imgurl value="${data ? '' : esc(val || '')}" placeholder="Paste an image link, or upload a file" autocomplete="off"><input type="hidden" data-imgdata value="${data ? esc(val) : ''}">
        <div class="row"><label class="ac-b g sm upl">${ICO.upload} Upload<input type="file" accept="image/*" data-upload hidden></label><button type="button" class="ac-b g sm" data-lib-open>Library</button>${ib('x', 'Remove image', 'data-img-clear')}</div></div></div><div class="ax-libp" data-libp hidden></div></div>`; };

  function spotCard(s, i) {
    return `<div class="ac-spot" data-spot><div class="hd"><b>Place ${i + 1}</b>${ib('trash', 'Remove this place', 'data-spot-del', 'd')}</div>
      <div class="ac-2">
        <div class="ac-f"><label>Place name <span class="req">*</span></label><input data-f="name" value="${esc(s.name)}" placeholder="e.g. Tegallalang Rice Terraces" autocomplete="off"></div>
        <div class="ac-f"><label>Type</label><input data-f="tag" list="dlTag" value="${esc(s.tag)}" placeholder="Nature, Beach, Culture…" autocomplete="off"></div>
        <div class="ac-f"><label>Drive time from the city</label><input data-f="time" value="${esc(s.time)}" placeholder="e.g. 1 h 30 min" autocomplete="off"></div></div>
      <div class="ac-f"><label>Short description</label><textarea data-f="desc" rows="2" placeholder="One or two sentences on why it is worth the drive.">${esc(s.desc)}</textarea></div>
      ${imgField('Photo (optional)', s.img)}</div>`;
  }

  const priceHint = (amt, c) => Number.isFinite(parseFloat(amt)) ? `Saved as ${curFmt('USD', parseFloat(amt) / curRate(c))} a day. Visitors see it in their own currency.` : 'Enter the daily price in any currency.';
  // Country -> Region -> City as dropdowns. Picking a country fills the region and narrows the city list; "Other" lets you type.
  function locBasics(d) {
    const geo = geoMap(), countries = Object.keys(geo).sort(), regs = geoRegions(), all = locList();
    const coOther = !!d._co || (!!d.country && !geo[d.country]);
    const cities = !coOther && geo[d.country] ? geo[d.country].cities.filter(x => x === d.city || x === ed.orig || !all.some(l => l.city === x)) : [];
    const ciOther = !coOther && (!!d._ci || (!!d.city && !cities.includes(d.city)));
    const opt = (v, cur, label) => `<option value="${esc(v)}"${v === cur ? ' selected' : ''}>${esc(label || v)}</option>`;
    const coSel = `<div class="ac-f"><label for="lf-country">Country <span class="req">*</span></label><select id="lf-country" name="country"><option value="">Choose a country</option>${countries.map(c => opt(c, coOther ? '' : d.country)).join('')}${opt('__other', coOther ? '__other' : '', 'Other (type it)…')}</select></div>`;
    const reSel = `<div class="ac-f"><label for="lf-region">Region <span class="req">*</span></label><select id="lf-region" name="region"><option value="">Choose a region</option>${(regs.includes(d.region) || !d.region ? regs : [...regs, d.region]).map(r => opt(r, d.region)).join('')}</select><small>Fills itself when you pick a country. Locations are grouped into tabs by region.</small></div>`;
    const ciSel = coOther ? fld('City', 'city', d.city, { req: 1, ph: 'e.g. Port Vila' })
      : `<div class="ac-f"><label for="lf-city">City <span class="req">*</span></label><select id="lf-city" name="city"><option value="">${d.country ? 'Choose a city' : 'Choose a country first'}</option>${cities.map(c => opt(c, ciOther ? '' : d.city)).join('')}${d.country ? opt('__other', ciOther ? '__other' : '', 'Other (type it)…') : ''}</select>${d.country && !cities.length ? '<small>Every listed city already has a location. Pick “Other” or add cities in Settings.</small>' : ''}</div>`;
    return `${coSel}${coOther ? fld('Country name', 'countryText', d.country, { req: 1, ph: 'e.g. Vanuatu' }) : ''}${reSel}${ciSel}${ciOther ? fld('City name', 'cityText', d.city, { req: 1, ph: 'e.g. Port Vila' }) : ''}`;
  }
  const carSumText = sel => `${sel.length} of ${FLEET.length} model${FLEET.length === 1 ? '' : 's'} selected · ${sel.reduce((n, x) => n + (HZFLEET.x(x).units || 0), 0)} cars in stock`;
  function carPick(sel) {
    const by = {}; FLEET.forEach(c => (by[c[1]] = by[c[1]] || []).push(c));
    return Object.entries(by).map(([t, cs]) => `<div class="ac-reg"><div class="rh"><b>${esc(t)}</b><button type="button" class="ac-b g sm" data-cartype="${esc(t)}">${cs.every(c => sel.includes(c[0])) ? 'Clear type' : 'Select type'}</button></div><div class="ac-loclist">${cs.map(c => `<label><input type="checkbox" name="carsel" value="${esc(c[0])}"${sel.includes(c[0]) ? ' checked' : ''}>${esc(c[0])} <small style="color:var(--mute)">· ${HZFLEET.x(c[0]).units} in stock</small></label>`).join('')}</div></div>`).join('');
  }
  function locForm() {
    if (!ed.d.carSel) ed.d.carSel = ed.orig ? FLEET.filter(c => HZFLEET.cities(c[0]).includes(ed.orig)).map(c => c[0]) : [];
    const d = ed.d, regions = [...new Set([...REGION_LIST, ...locList().map(l => l.region)].filter(Boolean))];
    return `<form id="fLoc" novalidate>
      <div class="ac-top" style="margin-top:0"><div><h2 style="font-size:24px">${ed.orig ? `Edit ${esc(ed.orig)}` : 'Add a location'}</h2><p>Fields marked * are required. Everything else is optional and the page hides what is empty.</p></div>
        <div style="display:flex;gap:8px"><button type="button" class="ac-b g" data-loc-back>Cancel</button><button class="ac-b">Save location</button></div></div>
      <datalist id="dlRegion">${regions.map(r => `<option value="${esc(r)}">`).join('')}</datalist>
      <datalist id="dlTag">${['Nature', 'Beach', 'Coast', 'Culture', 'Mountains', 'Wine', 'Art', 'City', 'Food'].map(r => `<option value="${r}">`).join('')}</datalist>
      <datalist id="dlLic"><option value="Home licences in the Latin alphabet are accepted."><option value="An International Driving Permit is required with your home licence."></datalist>

      <section class="ac-card w ac-sec"><h3>Basics</h3><p class="s">Shown on the Locations list and at the top of the location page.</p>
        <div class="ac-2">${locBasics(d)}<div class="ac-f"><label for="lf-from">Price from, per day <span class="req">*</span></label><div class="ac-price"><select id="lf-fromcur" name="fromCur" data-prev="${esc(d.fromCur)}">${curOpts(d.fromCur)}</select><input id="lf-from" name="from" type="number" min="0" step="any" value="${esc(d.fromAmt)}" autocomplete="off"></div><small id="fromHint">${esc(priceHint(d.fromAmt, d.fromCur))}</small></div></div>
        ${fld('Short description', 'desc', d.desc, { area: 1, rows: 2, req: 1, ph: 'One line that sells the area.' })}
        ${imgField('Cover image', d.img, 1)}
        ${ed.orig && !d.img ? '<p class="s" style="margin:-6px 0 0;font-size:12px">No custom image set: the original image for this location is used.</p>' : ''}</section>

      <section class="ac-card w ac-sec"><h3>Cars available here</h3><p class="s">Pick the car models customers can collect in this location. The number of available cars is worked out from your choice. To set how many of each you own, use the Fleet tab.</p>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:12px"><b id="carSum" style="font-size:14px">${carSumText(d.carSel)}</b><div class="sp"></div><button type="button" class="ac-b g sm" data-carall="1">Select all</button><button type="button" class="ac-b g sm" data-carall="0">Clear all</button></div>
        ${carPick(d.carSel)}</section>

      <section class="ac-card w ac-sec"><h3>Pick-up points</h3><p class="s">Every location has an airport desk and a city or station desk.</p>
        <div class="ac-2">${fld('Airport desk', 'airport', d.airport, { req: 1, ph: 'e.g. Mactan–Cebu International Airport (CEB)' })}${fld('Airport desk address', 'airAddr', d.airAddr, { ph: 'Terminal, street, town' })}
          ${fld('City or station desk', 'station', d.station, { req: 1, ph: 'e.g. Ayala Center' })}${fld('City desk address', 'townAddr', d.townAddr, { ph: 'Street, town' })}</div></section>

      <section class="ac-card w ac-sec"><h3>Driving rules and local info</h3><p class="s">Appears in “Good to know” and in the page’s questions and answers.</p>
        <div class="ac-2"><div class="ac-f"><label for="lf-side">Drives on the</label><select id="lf-side" name="side"><option value="right"${d.side !== 'left' ? ' selected' : ''}>Right</option><option value="left"${d.side === 'left' ? ' selected' : ''}>Left</option></select></div>
          ${fld('Licence rule', 'licence', d.licence, { list: 'dlLic', ph: 'What visitors need to bring' })}
          ${fld('Best time to drive', 'bestTime', d.bestTime, { ph: 'e.g. November to April' })}</div>
        ${fld('About the area', 'about', d.about, { area: 1, rows: 3, ph: 'A short paragraph shown under the description.' })}
        ${fld('Local driving tip', 'tip', d.tip, { area: 1, rows: 2, ph: 'Tolls, parking, road quirks…' })}</section>

      <section class="ac-card w ac-sec"><h3>Best places to drive from here</h3><p class="s">Shown as cards on the location page. Add as many as you like.</p>
        <div id="spots">${d.spots.map(spotCard).join('') || '<p class="s" id="noSpots" style="margin:0 0 12px">No places yet.</p>'}</div>
        <button type="button" class="ac-b g" data-spot-add>${ICO.plus} Add a place</button></section>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin:4px 0 20px"><button type="button" class="ac-b g" data-loc-back>Cancel</button><button class="ac-b">Save location</button></div>
    </form>`;
  }

  // Read the form back into a location object.
  function collect() {
    const f = $('#fLoc'), g = n => (f.elements[n] ? f.elements[n].value : '').trim();
    const imgOf = box => (box.querySelector('[data-imgdata]').value || box.querySelector('[data-imgurl]').value).trim();
    const v = (box, n) => box.querySelector(`[data-f="${n}"]`).value.trim();
    const sel = n => f.elements[n] && f.elements[n].tagName === 'SELECT' ? f.elements[n].value : null, cSel = sel('country'), tSel = sel('city');
    const _co = cSel === '__other', _ci = tSel === '__other';
    const country = cSel === null ? g('country') : (_co ? g('countryText') : cSel), city = tSel === null ? g('city') : (_ci ? g('cityText') : tSel);
    return { ...ed.d, city, country, region: g('region'), _co, _ci, carSel: [...f.querySelectorAll('[name=carsel]:checked')].map(x => x.value), desc: g('desc'), airport: g('airport'), station: g('station'),
      fromAmt: g('from'), fromCur: g('fromCur') || 'USD', airAddr: g('airAddr'), townAddr: g('townAddr'), side: g('side') === 'left' ? 'left' : 'right', licence: g('licence'),
      about: g('about'), bestTime: g('bestTime'), tip: g('tip'), img: imgOf(f.querySelector('[data-imgf][data-main]')),
      spots: [...f.querySelectorAll('[data-spot]')].map(sp => ({ name: v(sp, 'name'), tag: v(sp, 'tag'), desc: v(sp, 'desc'), time: v(sp, 'time'), img: imgOf(sp.querySelector('[data-imgf]')) })) };
  }
  const okImg = u => !u || /^(https?:\/\/|data:image\/|lib:|assets\/|\.\/|\/)/i.test(u);
  function saveLocation() {
    const d = ed.d = collect();
    if (!d.city) fail('Enter the city name.');
    if (!d.country) fail('Enter the country.');
    if (!d.region) fail('Pick a region.');
    if (!d.carSel.length) fail('Pick at least one car model for this location.');
    if (!d.desc) fail('Add a short description.');
    if (!d.airport) fail('Enter the airport desk.');
    if (!d.station) fail('Enter the city or station desk.');
    const amt = Number(d.fromAmt);
    if (d.fromAmt === '' || !Number.isFinite(amt) || amt < 0) fail('Enter the daily price as a number.');
    if (!okImg(d.img) || d.spots.some(s => !okImg(s.img))) fail('Image links must start with https:// (or upload a file instead).');
    const ls = locList().map(l => ({ ...l, spots: (l.spots || []).map(s => ({ ...s })) }));
    if (ls.some(l => l.city !== ed.orig && slug(l.city) === slug(d.city))) fail(`There is already a location called ${d.city}.`);
    d.spots = d.spots.filter(s => s.name || s.tag || s.desc || s.time || s.img);
    if (d.spots.some(s => !s.name)) fail('Give every place a name, or remove the empty ones.');
    const sel = d.carSel; d.cars = sel.length; d.from = Math.round(amt / curRate(d.fromCur) * 1e4) / 1e4;   // stored in USD
    delete d.fromAmt; delete d.fromCur; delete d.carSel; delete d._co; delete d._ci;
    const i = ed.orig ? ls.findIndex(l => l.city === ed.orig) : -1;
    if (i >= 0) ls[i] = d; else ls.push(d);
    HZLOC.registerImages(ls); HZLOC.save(ls);
    SITE.cities = ls.map(l => l.city);
    syncCars(d.city, ed.orig, sel, SITE.cities); recountLocs();
    flash = { ok: true, m: ed.orig ? `${d.city} updated.` : `${d.city} added.` };
    ed = null;
  }
  // The location form decides which car models are offered here; write that back into each car's pick-up list.
  function syncCars(city, orig, sel, cities) {
    const cars = carList().map(x => ({ ...x })); let changed = false;
    cars.forEach(c => {
      const before = JSON.stringify(c.locations || []);
      let explicit = c.locations && c.locations.length ? c.locations.filter(x => x !== NONE).map(x => x === orig ? city : x) : null, next;   // null = every location
      const want = sel.includes(c.name);
      if (explicit === null) next = want ? null : cities.filter(x => x !== city);
      else { next = want ? [...new Set([...explicit, city])] : explicit.filter(x => x !== city); if (cities.every(x => next.includes(x))) next = null; }
      c.locations = next === null ? [] : (next.length ? next : [NONE]);
      if (JSON.stringify(c.locations) !== before) changed = true;
    });
    if (changed) { HZFLEET.save(cars); HZFLEET.apply(cars); }
  }
  // A location's "cars" count is the number of models that can be picked up there; keep it in step with the fleet.
  function recountLocs() {
    SITE.cities = locList().map(l => l.city);
    const ls = locList().map(l => ({ ...l })); let ch = false;
    ls.forEach(l => { const n = FLEET.filter(f => HZFLEET.cities(f[0]).includes(l.city)).length; if (+l.cars !== n) { l.cars = n; ch = true; } });
    if (ch) HZLOC.save(ls);
  }
  function deleteLocation(city) {
    const loc = locList().find(l => l.city === city);
    if (loc) toTrash('location', city, [loc.region, loc.country].filter(Boolean).join(', '), loc);
    HZLOC.save(locList().filter(l => l.city !== city));
    SITE.cities = locList().map(l => l.city); recountLocs();
    flash = { ok: true, m: `${city} moved to Trash.` };
  }

  // Shrink an uploaded photo so it fits in browser storage.
  function readImage(file, done, max = 1000) {
    if (!/^image\//.test(file.type)) return HZ.toast('Choose an image file.', 'err');
    const fr = new FileReader();
    fr.onload = () => { const im = new Image(); im.onload = () => {
      const k = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement('canvas');
      c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); done(c.toDataURL('image/jpeg', 0.78));
    }; im.onerror = () => HZ.toast('That image could not be read.', 'err'); im.src = fr.result; };
    fr.readAsDataURL(file);
  }
  const setImg = (box, data) => {
    box.querySelector('[data-imgdata]').value = data || '';
    if (data) box.querySelector('[data-imgurl]').value = '';
    const url = data || box.querySelector('[data-imgurl]').value.trim();
    box.querySelector('[data-th]').innerHTML = url ? `<img src="${esc(HZMEDIA.resolve(url))}" alt="">` : box.dataset.def ? `<img src="${esc(box.dataset.def)}" alt="">` : '<span>No image</span>';
    const st = box.querySelector('[data-slotst]'); if (st) st.textContent = url ? 'Custom picture' : 'Built-in picture';
  };

  // ---------- Currency (rates, which currencies visitors can pick, converter)
  const curRate = c => { const x = HZC.all().find(y => y.code === c); return x ? (+x.rate || 1) : 1; };
  const curWhole = c => { const x = HZC.all().find(y => y.code === c); return !!(x && x.whole); };
  const curRound = (n, c) => curWhole(c) ? Math.round(n) : Math.round(n * 100) / 100;
  const curFmt = (c, n) => { const d = curWhole(c) ? 0 : 2; try { return new Intl.NumberFormat('en-US', { style: 'currency', currency: c, minimumFractionDigits: d, maximumFractionDigits: d }).format(n); } catch (e) { return `${c} ${n.toFixed(d)}`; } };
  const curDefault = () => { const c = HZC.cur(); return HZC.all().some(x => x.code === c && x.on !== false) ? c : HZC.base(); };
  const relRate = c => curRate(c) / curRate(HZC.base());   // units of c per 1 main currency
  const priceDraft = l => { const c = curDefault(); return { ...l, fromCur: c, fromAmt: curRound((+l.from || 0) * curRate(c), c) }; };
  const curOpts = (sel, all) => HZC.all().filter(x => all || x.on !== false || x.code === sel).map(x => `<option value="${esc(x.code)}"${x.code === sel ? ' selected' : ''}>${esc(x.code)} · ${esc(x.name)}</option>`).join('');
  let cdraft = null;   // currency rows while editing (set when a new row is added)
  // Currency sub-tabs, laid out like Forms: a side menu on the left, one section on the right.
  const CUR_SECS = [['main', 'Main currency', 'What visitors see first'], ['convert', 'Convert', 'Quick check with saved rates'], ['rates', 'Rates & currencies', 'Rates, decimals, visibility']];
  const CUR_HELP = {
    main: 'Pick your main currency. Visitors see it first, and every rate is how many units of the currency you pick here equal 1 unit of it. Car prices keep their real value when you change it.',
    convert: 'A quick check using the saved rates. Nothing here changes any price.',
    rates: 'Change a rate and every price updates for visitors who choose that currency. Rates are per 1 main currency.',
  };
  let csec = 'main';

  function convertOut() {
    const a = parseFloat($('#cvAmt') && $('#cvAmt').value), f = $('#cvFrom').value, t = $('#cvTo').value;
    if (!Number.isFinite(a)) return 'Enter an amount';
    return `${curFmt(f, a)} = ${curFmt(t, a / curRate(f) * curRate(t))}`;
  }
  function currencyTab() {
    const rows = cdraft || HZC.all(), saved = new Set(HZC.all().map(x => x.code)), custom = !!HZStore.get('hz-currencies', null);
    const B = HZC.base(), bName = (HZC.all().find(y => y.code === B) || {}).name || B;
    const body = rows.map(x => { const usd = x.code === B, isNew = !saved.has(x.code); return `<tr data-cur="${esc(x.code)}"${isNew ? ' data-new' : ''}>
      <td><input type="text" data-c="code" value="${esc(x.code)}" maxlength="3" style="width:78px;text-transform:uppercase"${isNew ? '' : ' readonly'} aria-label="Currency code"></td>
      <td><input type="text" data-c="name" value="${esc(x.name)}" style="width:190px" aria-label="Currency name"></td>
      <td><input type="number" data-c="rate" value="${esc(usd ? 1 : (isNew || cdraft ? x.rate : +(relRate(x.code)).toPrecision(6)))}"${usd || isNew || cdraft ? '' : ` data-orig="${esc(+(relRate(x.code)).toPrecision(6))}"`} min="0" step="any" style="width:130px"${usd ? ' disabled' : ''} aria-label="Units per 1 ${esc(B)}"></td>
      <td><label class="sw" data-tip="Show amounts without decimals"><input type="checkbox" data-c="whole"${x.whole ? ' checked' : ''}><i></i></label></td>
      <td><label class="sw" data-tip="${usd ? 'The main currency is always on' : 'Show in the site currency menu'}"><input type="checkbox" data-c="on"${x.on !== false ? ' checked' : ''}${usd ? ' disabled' : ''}><i></i></label></td>
      <td>${isNew ? '<small>not saved yet</small>' : curFmt(B, 100) + ' = ' + curFmt(x.code, 100 * relRate(x.code))}</td>
      <td><div class="act">${usd || x.code === 'USD' ? '' : ib('trash', 'Remove currency', 'data-cur-del', 'd')}</div></td></tr>`; }).join('');
    const dflt = (HZC.all().find(x => x.code !== B && x.code === 'PHP') || HZC.all().find(x => x.code !== B) || { code: B }).code;
    const onN = rows.filter(x => x.on !== false).length;
    let main;
    if (csec === 'main') {
      main = `<div class="mr-grid mr-cur"><section class="mr-card dark s5"><div class="mr-ch"><div><h2>Main currency</h2><p>Visitors see it first. Every rate is per 1 unit of it.</p></div><span class="mr-tag glass">${onN} on site</span></div>
        <div class="mr-big" style="--n:3">${esc(B)}</div><p class="rt-lbl">${esc(bName)}</p>${ticks(onN / (rows.length || 1), 30)}<div class="mr-axis"><span>${onN} of ${rows.length} shown</span><span>${custom ? 'Custom rates' : 'Default rates'}</span></div></section>
        <section class="mr-card s7"><div class="mr-ch"><div><h2>Change main currency</h2><p>${CUR_HELP.main}</p></div></div>
          <div class="ac-f" style="max-width:360px"><label for="baseCur">Main currency</label><select id="baseCur">${curOpts(B, 1)}</select></div>
          <p class="geo-h">What 100 ${esc(B)} is worth</p><div class="cur-exs">${rows.filter(x => x.code !== B && x.on !== false && saved.has(x.code)).slice(0, 5).map(x => `<div class="cur-ex"><b>${esc(x.code)}</b><span>${esc(x.name)}</span><em>${curFmt(x.code, 100 * relRate(x.code))}</em></div>`).join('') || '<p class="mr-none">No other currencies are shown on the site.</p>'}</div></section></div>`;
    } else if (csec === 'convert') {
      main = `<div class="mr-grid mr-cur"><section class="mr-card dark s5"><div class="mr-ch"><div><h2>Result</h2><p>${CUR_HELP.convert}</p></div></div><p class="cur-out" id="cvOut"></p></section>
        <section class="mr-card s7"><div class="mr-ch"><div><h2>Convert</h2><p>Type an amount and pick two currencies.</p></div></div>
          <div class="ac-3"><div class="ac-f"><label for="cvAmt">Amount</label><input id="cvAmt" type="number" min="0" step="any" value="100"></div>
            <div class="ac-f"><label for="cvFrom">From</label><select id="cvFrom">${curOpts('USD', 1)}</select></div>
            <div class="ac-f"><label for="cvTo">To</label><select id="cvTo">${curOpts(dflt, 1)}</select></div></div></section></div>`;
    } else {
      main = `<form id="fCur" novalidate><section class="mr-card mr-mid mr-cur mr-rates"><div class="mr-ch"><div><h2>Rates &amp; currencies</h2><p>${CUR_HELP.rates} ${rows.length} currencies.</p></div>
        <div class="mr-btns">${custom ? '<button type="button" class="mr-more" data-cur-reset>Restore default rates</button>' : ''}<button type="button" class="mr-more" data-cur-add>${ICO.plus} Add currency</button><button class="mr-more dark">Save changes</button></div></div>
        <div class="ac-wrapt"><table class="ac-tbl"><thead><tr><th>Code</th><th>Name</th><th>Rate (per 1 ${esc(B)})</th><th>No decimals</th><th>Show on site</th><th>Example</th><th></th></tr></thead><tbody>${body}</tbody></table></div></section></form>`;
    }
    return main;
  }
  function collectCur() {
    return [...document.querySelectorAll('#fCur tr[data-cur]')].map(tr => { const v = k => tr.querySelector(`[data-c="${k}"]`);
      const code = v('code').value.trim().toUpperCase();
      return { code, orig: v('rate').dataset.orig, name: v('name').value.trim(), rate: code === HZC.base() ? 1 : v('rate').value.trim(), whole: v('whole').checked, on: code === HZC.base() ? true : v('on').checked }; });
  }
  function saveCurrencies(list) {
    list = list || collectCur(); cdraft = list;
    const seen = new Set();
    list.forEach(x => {
      if (!/^[A-Z]{3}$/.test(x.code)) fail('Currency codes are three letters, like EUR.');
      try { new Intl.NumberFormat('en-US', { style: 'currency', currency: x.code }); } catch (e) { fail(`${x.code} is not a valid currency code.`); }
      if (seen.has(x.code)) fail(`${x.code} is listed twice.`); seen.add(x.code);
      if (!x.name) fail(`Give ${x.code} a name.`);
      x.rate = Number(x.rate); if (!(x.rate > 0) || !Number.isFinite(x.rate)) fail(`Enter a rate above 0 for ${x.code}.`);
    });
    if (!seen.has('USD')) fail('US dollar must stay in the list.');
    if (!seen.has(HZC.base())) fail('Your main currency must stay in the list.');
    // A row the admin did not touch keeps its exact stored rate. The box only shows 6 digits, so saving that rounded number
    // would slowly drift every rate (this is what made rates look wrong after switching the main currency and saving).
    list.forEach(x => { if (x.orig !== undefined && x.rate === +x.orig) x.rate = relRate(x.code); delete x.orig; });
    // Rates were typed per 1 main currency; storage is per 1 USD.
    const u = list.find(x => x.code === 'USD').rate;
    list.forEach(x => { x.rate = x.code === 'USD' ? 1 : x.rate / u; });
    HZC.saveList(list); cdraft = null; refreshCurMenu();
  }
  // The header's currency menu is drawn once per page: redraw it after a change.
  function refreshCurMenu() {
    const m = document.querySelector('.curs'); if (!m) return;
    m.innerHTML = SITE.currencies.map(c => `<button data-c="${c[0]}" class="${c[0] === HZC.cur() ? 'on' : ''}"><b>${c[0]}</b><span>${c[1]}</span></button>`).join('');
    const l = document.getElementById('curLabel'); if (l) l.textContent = HZC.cur();
  }

  // ---- Trash: deleting a record moves a copy here first. From Trash it can be restored or deleted for good.
  const TRASH_KEY = 'hz-trash';
  const TRASH_TYPES = [['booking', 'Bookings', 'Booking'], ['customer', 'Customers', 'Customer'], ['car', 'Cars', 'Car'], ['location', 'Locations', 'Location'], ['deal', 'Deals', 'Deal'], ['review', 'Reviews', 'Review'], ['message', 'Messages', 'Message'], ['image', 'Images', 'Image'], ['block', 'Blocked dates', 'Blocked dates']];
  let tsec = 'all';
  // Items stay in Trash for 3 months, then are deleted for good. Items with 3 days or less left are highlighted.
  const TRASH_MONTHS = 3, SOON_DAYS = 3;
  const trashExpiry = t => { const d = new Date(t.at); d.setMonth(d.getMonth() + TRASH_MONTHS); return d; };
  const daysLeft = t => Math.ceil((trashExpiry(t) - Date.now()) / 864e5);
  const leftTxt = n => n <= 0 ? 'Today' : n === 1 ? '1 day' : `${n} days`;
  const trashAll = () => { const v = HZStore.get(TRASH_KEY, []); return Array.isArray(v) ? v : []; };
  const trashWrite = l => { if (!HZStore.set(TRASH_KEY, l)) fail('Could not move it to Trash (browser storage is full or blocked).'); };
  const toTrash = (type, label, sub, data) => trashWrite([{ tid: 'T' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), type, label: label || '(no name)', sub: sub || '', at: new Date().toISOString(), data }, ...trashAll()]);
  const trashDrop = ids => trashWrite(trashAll().filter(x => !ids.includes(x.tid)));
  const trashPurge = () => { const l = trashAll(), keep = l.filter(t => trashExpiry(t) > Date.now()); if (keep.length !== l.length) HZStore.set(TRASH_KEY, keep); };
  const trashView = () => tsec === 'all' ? trashAll() : trashAll().filter(x => x.type === tsec);
  function restoreOne(t) {
    const d = t.data;
    if (t.type === 'booking') HZ.restoreBooking(d);
    else if (t.type === 'customer') HZ.restoreUser(d.user, d.bookings);
    else if (t.type === 'car') {
      if (carList().some(x => x.name === d.name)) fail(`A car named ${d.name} already exists.`);
      HZFLEET.save([...carList(), d]); HZFLEET.apply(HZFLEET.all()); recountLocs();
    } else if (t.type === 'location') {
      if (locList().some(l => l.city === d.city)) fail(`${d.city} already exists in Locations.`);
      HZLOC.save([...locList(), d]); recountLocs();
    } else if (t.type === 'deal') HZDEALS.save({ ...d, id: '' });
    else if (t.type === 'review') HZFLEET.restoreReview(d);
    else if (t.type === 'message') HZ.restoreMessage(d);
    else if (t.type === 'image') HZMEDIA.restore(d);
    else if (t.type === 'block') HZFLEET.saveBlock(d);
  }
  // Restores each item; one that can't come back (for example its name is taken again) stays in Trash and is reported.
  function restoreItems(ids) {
    const out = { ok: 0, fail: [] }, done = [];
    trashAll().filter(x => ids.includes(x.tid)).forEach(t => { try { restoreOne(t); done.push(t.tid); out.ok++; } catch (e) { if (!e.user) throw e; out.fail.push(`${t.label}: ${e.message}`); } });
    if (done.length) trashDrop(done);
    return out;
  }
  function trashTab() {
    const all = trashAll(), cnt = k => all.filter(x => x.type === k).length, list = trashView(), soon = list.filter(x => daysLeft(x) <= SOON_DAYS);
    const secs = [['all', 'All', `${all.length} deleted item${all.length === 1 ? '' : 's'}`], ...TRASH_TYPES.map(x => [x[0], x[1], `${cnt(x[0])} deleted`])];
    const name = tsec === 'all' ? 'All' : TRASH_TYPES.find(x => x[0] === tsec)[1];
    const head = `<div class="ac-card w rs-hd" style="margin-bottom:12px"><h2>Trash · ${name}</h2><p class="s" style="margin:0">Anything you delete in the admin panel lands here first. Restore it to put it back exactly as it was, or delete it permanently. Items stay here for 3 months, then they are deleted automatically. Permanently deleted items can’t be recovered.</p></div>`;
    const banner = soon.length ? `<div class="ac-soon"><div><h2>${soon.length} item${soon.length === 1 ? '' : 's'} will be deleted for good in ${SOON_DAYS} days or less</h2><p>Items stay in Trash for 3 months. Restore anything you still need before it disappears.</p></div><button type="button" class="ac-b" data-trestoresoon>Restore ${soon.length === 1 ? 'it' : 'these'}</button></div>` : '';
    let body;
    if (!list.length) body = `<div class="ac-empty"><h3>${tsec === 'all' ? 'Trash is empty' : `No deleted ${name.toLowerCase()}`}</h3><p>Deleted items will show up here.</p></div>`;
    else body = `<div class="ac-bar"><span class="sub" style="margin:0;align-self:center">${list.length} item${list.length === 1 ? '' : 's'}</span><div class="sp"></div><button type="button" class="ac-b g" data-trestoreall>Restore all</button><button type="button" class="ac-b d" data-tempty>Delete all permanently</button></div>
      <div class="ac-wrapt"><table class="ac-tbl"><thead><tr><th>Item</th><th>Type</th><th>Deleted</th><th>Deletes in</th><th></th></tr></thead><tbody>${list.map(x => `<tr data-tid="${esc(x.tid)}"${daysLeft(x) <= SOON_DAYS ? ' class="soon"' : ''}><td>${cell(x.label, x.sub, { b: 1, w: 320 })}</td><td>${esc((TRASH_TYPES.find(t => t[0] === x.type) || [])[2] || x.type)}</td><td>${fdate(x.at.slice(0, 10))}</td><td>${leftTxt(daysLeft(x))}</td>
        <td><div class="act">${ib('undo', 'Restore', 'data-trestore')}${ib('trash', 'Delete permanently', 'data-tdel', 'd')}</div></td></tr>`).join('')}</tbody></table></div>`;
    const rail = secs.map(x => `<button type="button" data-tsec="${x[0]}" class="${x[0] === tsec ? 'on' : ''}"><span class="rs-n"><b>${x[1]}</b><small>${x[2]}</small></span></button>`).join('');
    const allSoon = all.filter(x => daysLeft(x) <= SOON_DAYS).length, top = TRASH_TYPES.map(x => [x[1], cnt(x[0])]).filter(x => x[1]).sort((u, v) => v[1] - u[1]).slice(0, 3);
    const prev = `<aside class="rs-prev" aria-label="Trash summary"><div class="rs-pv-top"><span>Kept for 3 months</span><em class="rs-chip glass">${allSoon ? allSoon + ' expiring' : 'Safe'}</em></div><h3>${all.length} deleted</h3><p class="rs-pv-sub">Restore an item to put it back exactly as it was.</p>
      <div class="rs-pv-list">${top.length ? top.map((x, i) => `<div class="${i ? '' : 'on'}"><span>${esc(x[0])}</span><b>${x[1]}</b></div>`).join('') : '<div><span>Nothing here</span><b>0</b></div>'}</div></aside>`;
    return `<div class="rs-wrap rs-trash"><div class="rs-grid"><nav class="rs-nav" aria-label="Trash sections">${rail}</nav><div class="ac-setbody wide rs-body">${banner}${head}${body}</div>${prev}</div></div>`;
  }

  const unread = () => HZ.messages().filter(x => !x.read).length;
  // Two-level nav: groups on top (the stage of work), the tabs of the current group underneath.
  const badge = n => n ? `<i class="bd">${n}</i>` : '';
  // ---------- Calendar, Dashboard, Images, Activity and CSV export
  const nowD = new Date();
  let csub = 'timeline', cal = { y: nowD.getFullYear(), m: nowD.getMonth(), car: 'all', day: null }, bd = null;   // bd: null = list, { orig, d } = blocked-dates form
  let dash = { range: '6m' }, actN = 40, actF = { q: '', area: 'all' };
  const REASONS = ['Maintenance', 'Repair', 'Cleaning', 'Inspection', 'Other'];
  const kb = n => n >= 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB';
  const when = t => new Date(t).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const csvSave = (name, rows) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + rows.map(r => r.map(csvCell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); };
  const plural = (n, w, ws) => `${n} ${n === 1 ? w : (ws || w + 's')}`;

  // ---- Calendar > Timeline (Mira layout): car chips + month timeline on the left, selected-day card and a month picker on the right.
  const dayLong = iso => new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const calKind = (b, day) => b.from === day && b.to === day ? ['pickup', 'Pick-up & return'] : b.from === day ? ['pickup', 'Pick-up'] : b.to === day ? ['return', 'Return'] : ['rental', 'On rental'];
  function calEvents(day, bks, blks) {
    const rank = { pickup: 0, return: 1, rental: 2, block: 3 };
    return [...bks.filter(b => b.from <= day && b.to >= day).map(b => ({ type: calKind(b, day)[0], label: calKind(b, day)[1], b })),
      ...blks.filter(k => k.from <= day && k.to >= day).map(k => ({ type: 'block', label: 'Blocked', k }))].sort((a, c) => rank[a.type] - rank[c.type]);
  }
  const calEv = x => x.b
    ? `<button type="button" class="cal-ev" data-tl-view="${esc(x.b.id)}"><i class="k ${x.type}">${x.label}</i><span><b>${esc((x.b.customer && x.b.customer.name) || x.b.id)}</b><small>${esc(x.b.car)}${x.type === 'pickup' && x.b.ft ? ' · ' + esc(x.b.ft) : x.type === 'return' && x.b.tt ? ' · ' + esc(x.b.tt) : ''}</small></span></button>`
    : `<button type="button" class="cal-ev" data-tl-block="${esc(x.k.id)}"><i class="k block">Blocked</i><span><b>${esc(x.k.car)}</b><small>${esc(x.k.reason)}${x.k.note ? ' · ' + esc(x.k.note) : ''}</small></span></button>`;
  function timelineView() {
    const cars = carList();
    if (!cars.length) return `<div class="ac-empty"><h3>No cars yet</h3><p>Add cars in the Fleet tab and their bookings show up here.</p></div>`;
    if (cal.car !== 'all' && !cars.some(c => c.name === cal.car)) cal.car = 'all';
    const N = new Date(cal.y, cal.m + 1, 0).getDate(), iso = d => HZINS.iso(new Date(cal.y, cal.m, d)), ms = iso(1), me = iso(N);
    const title = new Date(cal.y, cal.m, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    const tIso = HZINS.iso(new Date()), tIdx = tIso >= ms && tIso <= me ? HZINS.diffDays(ms, tIso) + 1 : 0;
    const day = cal.day && cal.day >= ms && cal.day <= me ? cal.day : tIdx ? tIso : ms, dIdx = HZINS.diffDays(ms, day) + 1;
    const clip = (a, b) => ({ s: HZINS.diffDays(ms, a < ms ? ms : a) + 1, e: HZINS.diffDays(ms, b > me ? me : b) + 1 });
    const one = x => cal.car === 'all' || x.car === cal.car, shown = cal.car === 'all' ? cars : cars.filter(c => c.name === cal.car);
    const bks = HZ.bookings().filter(b => b.status !== 'cancelled' && b.from <= me && b.to >= ms && one(b)), blks = HZFLEET.blocks().filter(k => k.from <= me && k.to >= ms && one(k));
    const pos = x => `left:${(x.s - 1) / N * 100}%;width:${(x.e - x.s + 1) / N * 100}%;top:${x.lane * 26 + 4}px`;
    const bar = x => x.b
      ? `<button type="button" class="ax-b ${esc(x.b.status)}" style="${pos(x)}" data-tl-view="${esc(x.b.id)}" data-tip="${esc(`${x.b.id} · ${x.b.customer && x.b.customer.name || ''} · ${fdate(x.b.from)} → ${fdate(x.b.to)} · ${x.b.status}`)}"><span>${esc(((x.b.customer && x.b.customer.name) || x.b.id).split(' ')[0])}</span></button>`
      : `<button type="button" class="ax-b block" style="${pos(x)}" data-tl-block="${esc(x.k.id)}" data-tip="${esc(`Blocked · ${x.k.reason}${x.k.note ? ' · ' + x.k.note : ''} · ${fdate(x.k.from)} → ${fdate(x.k.to)}${x.k.qty > 1 ? ' · ' + x.k.qty + ' cars' : ''}`)}"><span>${esc(x.k.reason)}</span></button>`;
    const row = c => {
      const L = HZINS.lanes([...bks.filter(b => b.car === c.name).map(b => ({ b, ...clip(b.from, b.to) })), ...blks.filter(k => k.car === c.name).map(k => ({ k, ...clip(k.from, k.to) }))]);
      return `<div class="ax-row"><div class="ax-car" title="${esc(c.name)}"><b>${esc(c.name)}</b><small>${plural(HZFLEET.x(c.name).units || 0, 'car')} in stock</small></div>
        <div class="ax-track" style="min-height:${L.n * 26 + 8}px"><i class="ax-sel" style="left:${(dIdx - 1) / N * 100}%;width:${100 / N}%"></i>${tIdx ? `<i class="ax-today" style="left:${(tIdx - 1) / N * 100}%;width:${100 / N}%"></i>` : ''}${L.items.map(bar).join('')}</div></div>`;
    };
    const days = Array.from({ length: N }, (_, i) => { const g = new Date(cal.y, cal.m, i + 1).getDay(); return `<button type="button" class="${g === 0 || g === 6 ? 'we' : ''}${i + 1 === tIdx ? ' now' : ''}${i + 1 === dIdx ? ' sel' : ''}" data-cal-day="${iso(i + 1)}" aria-label="${esc(dayLong(iso(i + 1)))}">${i + 1}<small>${'SMTWTFS'[g]}</small></button>`; }).join('');
    const evs = calEvents(day, bks, blks), cnt = t => evs.filter(x => x.type === t).length, pu = cnt('pickup'), rt = cnt('return'), bl = cnt('block');
    const marks = new Set(); for (let d = 1; d <= N; d++) { const v = iso(d); if (bks.some(b => b.from <= v && b.to >= v) || blks.some(k => k.from <= v && k.to >= v)) marks.add(v); }
    const first = new Date(cal.y, cal.m, 1).getDay();
    const mini = `<div class="cm-h">${[...'SMTWTFS'].map(c => `<i>${c}</i>`).join('')}</div><div class="cm-g">${'<span></span>'.repeat(first)}${Array.from({ length: N }, (_, i) => { const v = iso(i + 1); return `<button type="button" class="${v === day ? 'on' : ''}${v === tIso ? ' now' : ''}${marks.has(v) ? ' has' : ''}" data-cal-day="${v}" aria-label="${esc(dayLong(v))}" aria-pressed="${v === day}">${i + 1}</button>`; }).join('')}</div>`;
    return `<div class="mr-cal">
      <section class="mr-card mr-mid mr-tlc"><div class="mr-tool"><div class="mr-nav">${ib('prev', 'Previous month', 'data-cal-prev')}<b class="ax-mon">${esc(title)}</b>${ib('next', 'Next month', 'data-cal-next')}</div><button type="button" class="mr-more" data-cal-today>Today</button><span class="mr-sp"></span><button type="button" class="mr-more dark" data-block-add>${ICO.plus} Block dates</button>
        <div class="mr-seg" role="group" aria-label="Filter by car">${[['all', 'All cars'], ...cars.map(c => [c.name, c.name])].map(x => `<button type="button" data-calcar="${esc(x[0])}" aria-selected="${cal.car === x[0]}">${esc(x[1])}</button>`).join('')}</div></div>
        <div class="ax-legend"><span><i class="pending"></i>Pending</span><span><i class="confirmed"></i>Confirmed</span><span><i class="completed"></i>Completed</span><span><i class="block"></i>Blocked</span><small>${plural(bks.length, 'booking')} this month. Click a bar to open it.</small></div>
        <div class="ax-tl"><div class="ax-in" style="--n:${N}"><div class="ax-row ax-head"><div class="ax-car"></div><div class="ax-days">${days}</div></div>${shown.map(row).join('')}</div></div></section>
      <div class="mr-col">
        <aside class="mr-card dark mr-detail"><div class="mr-ch"><span class="mr-tag glass">Selected day</span><span class="mr-tag ${evs.length ? 'hi' : 'glass'}">${plural(evs.length, 'event')}</span></div>
          <h2 class="bk-title">${esc(dayLong(day))}</h2>
          <p class="cal-sum">${plural(pu, 'pick-up')} · ${plural(rt, 'return')}${bl ? ' · ' + plural(bl, 'block') : ''}</p>
          <div class="cal-evs">${evs.length ? evs.map(calEv).join('') : '<p class="bk-note" style="margin:0">Nothing on this day.</p>'}</div></aside>
        <section class="mr-card cal-mini"><div class="mr-ch"><div><h2>Jump to a day</h2><p>${esc(title)}${cal.car === 'all' ? '' : ' · ' + esc(cal.car)}</p></div></div>${mini}</section>
      </div></div>`;
  }

  // ---- Calendar > Blocked dates: a car out of service (maintenance, repair...) can't be booked on those days.
  const blankBlock = () => ({ id: '', car: '', from: '', to: '', qty: 1, reason: 'Maintenance', note: '' });
  function blocksView() {
    if (bd) return blockForm();
    const l = HZFLEET.blocks().sort((a, b) => b.from.localeCompare(a.from)), t = HZINS.iso(new Date());
    const rows = l.map(k => { const st = k.to < t ? 'Past' : k.from <= t ? 'Now' : 'Upcoming';
      return `<tr data-block="${esc(k.id)}"><td>${cell(k.car, k.note, { b: 1, w: 260 })}</td><td>${fdate(k.from)} → ${fdate(k.to)}<small>${plural(+k.qty || 1, 'car')} out</small></td><td>${esc(k.reason)}</td><td><span class="mr-tag${st === 'Now' ? ' hi' : st === 'Upcoming' ? ' watch' : ''}">${st}</span></td>
        <td><div class="act">${ib('edit', 'Edit blocked dates', 'data-block-edit')}${ib('trash', 'Delete blocked dates', 'data-block-del', 'd')}</div></td></tr>`; }).join('');
    return `<section class="mr-card mr-mid mr-blk"><div class="mr-ch"><div><h2>Blocked dates</h2><p>${plural(l.length, 'block')}. Customers can’t book a car on days it is blocked.</p></div><div class="mr-btns"><button type="button" class="mr-more" data-export="blocks">Export CSV</button><button type="button" class="mr-more dark" data-block-add>${ICO.plus} Block dates</button></div></div>
      ${l.length ? `<div class="mr-twrap"><table class="mr-tbl"><thead><tr><th>Car</th><th>Dates</th><th>Reason</th><th>When</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`
        : `<div class="ac-empty"><h3>No blocked dates</h3><p>Block dates when a car goes to the garage, a cleaning or an inspection.</p></div>`}</section>`;
  }
  function blockForm() {
    const d = bd.d, save = `<button class="ib pri" data-tip="Save" aria-label="Save">${ico('<path d="M20 6 9 17l-5-5"/>')}</button>`;
    return `<form id="fBlock" novalidate>
      <div class="ac-top" style="margin-top:0"><div><h2 style="font-size:24px">${bd.orig ? 'Edit blocked dates' : 'Block dates'}</h2><p>The cars you take out can’t be booked on these days. Bookings that already exist stay as they are.</p></div><div style="display:flex;gap:8px">${ib('x', 'Cancel', 'data-block-back')}${save}</div></div>
      <section class="ac-card w ac-sec"><h3>Which car and when</h3>
        <div class="ac-f"><label for="lf-bcar">Car <span class="req">*</span></label><select id="lf-bcar" name="car"><option value="">Choose a car</option>${carList().map(c => `<option value="${esc(c.name)}"${c.name === d.car ? ' selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>
        <div class="ac-2">${fld('First blocked day', 'from', d.from, { req: 1, type: 'date' })}${fld('Last blocked day', 'to', d.to, { req: 1, type: 'date', hint: 'This whole day is blocked too.' })}</div>
        ${fld('Cars out of service', 'qty', d.qty, { type: 'number', min: 1, hint: 'How many of this car are taken out. Use 1 if you only have one.' })}</section>
      <section class="ac-card w ac-sec"><h3>Why</h3><div class="ac-2"><div class="ac-f"><label for="lf-breason">Reason</label><select id="lf-breason" name="reason">${REASONS.map(r => `<option${r === d.reason ? ' selected' : ''}>${r}</option>`).join('')}</select></div>${fld('Note', 'note', d.note, { ph: 'e.g. Brake service at the garage', hint: 'Optional.' })}</div></section>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin:4px 0 20px">${ib('x', 'Cancel', 'data-block-back')}${save}</div></form>`;
  }
  const readBlock = () => { const f = $('#fBlock'), g = n => f.elements[n].value.trim(); return { ...bd.d, car: g('car'), from: g('from'), to: g('to'), qty: g('qty'), reason: g('reason'), note: g('note') }; };
  const calendarTab = () => subTabs('calendar', [['timeline', 'Timeline'], ['blocks', 'Blocked dates']], csub) + (csub === 'blocks' ? blocksView() : timelineView());

  // ---- Reports (same layout as Activity): dark revenue + occupancy hero, ring panel, stat tiles, top cars.
  function dashboardTab() {
    const cars = carList(), r = HZINS.compute(HZ.bookings(), cars.map(c => ({ units: HZFLEET.x(c.name).units })), dash.range, new Date(), b => HZ.lateFeeOf(b)), T = r.totals;
    const rng = [['30d', 'Last 30 days'], ['6m', 'Last 6 months'], ['12m', 'Last 12 months']], rngName = (rng.find(x => x[0] === dash.range) || rng[1])[1].toLowerCase();
    if (!HZ.bookings().length) return `<div class="ac-empty"><h3>Nothing to chart yet</h3><p>Reports fill in as bookings come in.${sampleOn() ? ' You can load sample data in Settings > Sample data to see it with numbers.' : ''}</p></div>`;
    const tick = i => dash.range === '30d' ? i % 5 === 0 : true, n = r.rows.length;
    const maxRev = Math.max(...r.rows.map(x => x.revenue), 1), maxTop = Math.max(...r.top.map(x => x.revenue), 1);
    const bars = `<div class="av-cols" style="--c:${n}">${r.rows.map((x, i) => `<div class="c" data-tip="${esc(`${x.title}: ${HZC.txt(x.revenue)} · ${plural(x.count, 'booking')}`)}"><span class="bar"><i style="height:${x.revenue > 0 ? Math.max(4, x.revenue / maxRev * 100).toFixed(1) : 0}%"></i></span><small>${tick(i) ? esc(x.label) : ''}</small></div>`).join('')}</div>`;
    const heat = `<div class="av-lane av-heat" style="--c:${n}">${r.rows.map(x => `<i class="c0" style="--o:${x.occ > 0 ? (0.35 + 0.65 * Math.min(100, x.occ) / 100).toFixed(2) : 0}" title="${esc(`${x.title} · ${x.occ}% booked`)}"></i>`).join('')}</div>`;
    const hero = `<section class="av-hero"><div class="av-ht"><h2>Revenue</h2><div class="av-leg"><span><i class="c1"></i>Revenue</span><span><i class="c0"></i>Occupancy</span></div></div>
      ${bars}
      <div class="av-sub"><span>Occupancy by period</span><span>${T.occ}% overall</span></div>${heat}
      <div class="av-axis"><span>${esc(r.rows[0].label)}</span><span>${esc(r.rows[Math.floor(n / 2)].label)}</span><span>${esc(r.rows[n - 1].label)}</span></div></section>`;
    const lit = Math.round(48 * Math.min(100, T.occ) / 100), topCar = r.top[0];
    const ring = `<section class="av-score"><div class="av-ht"><h2>Occupancy</h2><em class="rs-chip ok">${esc(rngName)}</em></div><div class="av-ring"><svg viewBox="0 0 120 120" aria-hidden="true">${Array.from({ length: 48 }, (_, i) => `<line x1="60" y1="6" x2="60" y2="${i < lit ? 16 : 12}" transform="rotate(${i * 7.5} 60 60)" class="${i < lit ? 'on' : ''}"/>`).join('')}</svg><div><b>${T.occ}%</b><span>booked</span></div></div>
      <dl class="av-dl"><div><dt>Cars in stock</dt><dd>${cars.reduce((t, c) => t + (HZFLEET.x(c.name).units || 0), 0)}</dd></div><div><dt>Top car</dt><dd>${esc(topCar ? topCar.name : 'None yet')}</dd></div><div><dt>Cancelled</dt><dd>${T.cancelled}%</dd></div></dl></section>`;
    const tiles = [['Revenue', money(T.revenue), 'late fees included'], ['Bookings', T.bookings, 'not cancelled'], ['Average booking', money(T.avg), 'per booking'], ['Cancelled', T.cancelled + '%', 'of all bookings']].map(t => `<div class="av-tile"><span>${t[0]}</span><b>${t[1]}</b><small>${t[2]}</small></div>`).join('');
    const top = r.top.length ? r.top.map(c => `<div class="ax-hb"><div class="l"><b>${esc(c.name)}</b><small>${plural(c.bookings, 'booking')}</small></div><div class="t"><i style="width:${c.revenue > 0 ? Math.max(2, c.revenue / maxTop * 100) : 0}%"></i></div><span>${money(c.revenue)}</span></div>`).join('') : '<p class="s" style="margin:0">No bookings in this period.</p>';
    return `<div class="av-wrap"><div class="ac-subtabs" role="tablist">${rng.map(x => `<button type="button" role="tab" data-dash="${x[0]}" aria-selected="${x[0] === dash.range}">${x[1]}</button>`).join('')}</div>
      <div class="av-top">${hero}${ring}</div><div class="av-tiles">${tiles}</div>
      <section class="av-log"><div class="av-ht" style="margin-bottom:6px"><h2>Top cars</h2></div><p class="s" style="margin:0 0 14px;color:var(--mute);font-size:14px">By revenue in this period. Revenue counts confirmed and completed bookings on the first day of the trip.</p>${top}</section></div>`;
  }

  // ---- Images: the shared library. Upload once, pick it in any image field with the Library button.
  const usedTxt = u => [u.deals && plural(u.deals, 'deal'), u.cars && plural(u.cars, 'car'), u.locations && plural(u.locations, 'location'), u.site && plural(u.site, 'landing image'), u.trash && `${plural(u.trash, 'item')} in Trash`].filter(Boolean).join(', ');
  const md = { q: '', f: 'all', sel: null };
  const MD_F = [['all', 'All images'], ['used', 'In use'], ['free', 'Not used']];
  function mdView() {
    const all = HZMEDIA.all().map(m => ({ m, u: usedTxt(HZMEDIA.usage(m.id)) })), q = md.q.trim().toLowerCase();
    const cnt = { all: all.length, used: all.filter(x => x.u).length, free: all.filter(x => !x.u).length };
    const list = all.filter(x => (md.f === 'all' || (md.f === 'used') === !!x.u) && (!q || x.m.name.toLowerCase().includes(q)));
    const sel = list.find(x => x.m.id === md.sel) || list[0] || null; md.sel = sel ? sel.m.id : null;
    const tiles = list.map(x => `<button type="button" class="md-t${sel && x.m.id === sel.m.id ? ' sel' : ''}" data-mdpick="${esc(x.m.id)}" aria-pressed="${!!sel && x.m.id === sel.m.id}"><span class="th"><img src="${esc(x.m.data)}" alt="" loading="lazy"></span><b>${esc(x.m.name)}</b><small>${kb(x.m.size)}${x.u ? '' : ' · not used'}</small></button>`).join('');
    const detail = sel ? `<div class="md-d" data-media="${esc(sel.m.id)}"><div class="mr-ch"><span class="mr-tag glass">${kb(sel.m.size)}</span><span class="mr-tag ${sel.u ? 'hi' : 'glass'}">${sel.u ? 'In use' : 'Not used'}</span></div>
        <div class="md-prev"><img src="${esc(sel.m.data)}" alt=""></div>
        <input class="md-name" data-media-name value="${esc(sel.m.name)}" maxlength="60" aria-label="Image name" autocomplete="off">
        <p class="bk-note">Added ${fdate(sel.m.created.slice(0, 10))}<br>${sel.u ? 'Used in ' + esc(sel.u) : 'Not used yet. You can delete it safely.'}</p>
        <div class="bk-act"><span class="md-hint">Pick it from any image field with Library.</span>${ib('trash', 'Delete image', 'data-media-del', 'd')}</div></div>`
      : `<div class="mr-ch"><div><h2>No image</h2><p>Upload a picture to see it here.</p></div></div>`;
    return { side: MD_F.map(s => `<button type="button" class="mr-cat${md.f === s[0] ? ' on' : ''}" data-mdf="${s[0]}"><span>${s[1]}</span><em>${cnt[s[0]]}</em></button>`).join(''),
      grid: list.length ? `<div class="md-grid">${tiles}</div>` : `<div class="ac-empty"><h3>${all.length ? 'No images match' : 'No images yet'}</h3><p>${all.length ? 'Try a different search or filter.' : 'Upload your first picture here, or use Upload in any image field and it is saved to the library automatically.'}</p></div>`, detail };
  }
  function refreshMd() { const v = mdView(); $('#mdSide').innerHTML = v.side; $('#mdGrid').innerHTML = v.grid; $('#mdDetail').innerHTML = v.detail; }
  function mediaTab() {
    const v = mdView(), tot = HZMEDIA.totalSize();
    return `<div class="mr-bk mr-md">
      <aside class="mr-card mr-side"><div class="mr-sh">Library</div><div id="mdSide">${v.side}</div>
        <div class="rt-box"><b>Browser storage</b>${ticks(Math.min(1, tot / 5242880), 18)}<span>${kb(tot)} of about 5 MB for the whole site. Pictures are shrunk to fit.</span></div></aside>
      <section class="mr-card mr-mid"><div class="mr-tool"><input id="mdq" type="search" placeholder="Search images" value="${esc(md.q)}" aria-label="Search images"><label class="mr-more dark" style="cursor:pointer">${ICO.plus} Upload images<input type="file" accept="image/*" multiple data-media-upload hidden></label></div><div id="mdGrid">${v.grid}</div></section>
      <aside class="mr-card dark mr-detail" id="mdDetail">${v.detail}</aside></div>`;
  }
  app.addEventListener('click', e => {
    const f = e.target.closest('[data-mdf]'); if (f) { md.f = f.dataset.mdf; md.sel = null; refreshMd(); return; }
    const p = e.target.closest('[data-mdpick]'); if (p) { md.sel = p.dataset.mdpick; refreshMd(); if (innerWidth <= 1280) $('#mdDetail').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
  });
  app.addEventListener('input', e => { if (e.target.id === 'mdq') { md.q = e.target.value; md.sel = null; const v = mdView(); $('#mdGrid').innerHTML = v.grid; $('#mdDetail').innerHTML = v.detail; } });
  const readImageP = file => new Promise(res => {
    if (!/^image\//.test(file.type)) return res(null);
    const fr = new FileReader();
    fr.onload = () => { const im = new Image(); im.onload = () => { const k = Math.min(1, 1000 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', 0.78)); }; im.onerror = () => res(null); im.src = fr.result; };
    fr.onerror = () => res(null); fr.readAsDataURL(file);
  });

  // ---- Landing images: the big pictures on the live site (home hero, banner, page heroes). Empty = the built-in picture in data/images.js.
  // [key, name, where it shows, size, built-in darkness %, overlay kind: g = fades in from the bottom, f = even over the whole picture]
  const SITE_SLOTS = [
    ['hero', 'Home hero', 'The big picture at the top of the home page. Also shown beside the login form.', '1920 × 1080', 70, 'g'],
    ['banner', 'Home banner', 'The wide picture lower on the home page.', '1600 × 700', 45, 'f'],
    ['heroes.locations', 'Locations hero', 'Top of the Locations page.', '1920 × 700', 70, 'g'],
    ['heroes.deals', 'Deals hero', 'Top of the Deals page.', '1920 × 700', 70, 'g'],
    ['heroes.about', 'About hero', 'Top of the About page.', '1920 × 700', 70, 'g'],
    ['heroes.supplier', 'About photo', 'The side picture next to the fleet text on the About page. It has no overlay unless you add one.', '900 × 700', 0, 'f']];
  // Home page \"Find the right car\" pictures, one per category. Managed in Fleet > Lists and defaults; saved with the landing images (HZSITE keys categories.<key>).
  const CAT_PICS = [['suv', 'SUV', 'Cars of type SUV'], ['sedan', 'Sedan', 'Cars of type Sedan'], ['hatchback', 'Hatchback', 'Cars of type Hatchback'], ['electric', 'Electric', 'Cars with electric fuel'], ['minivan', 'Minivan & 7-seat', 'Cars of type Minivan'], ['sport', 'Sport & convertible', 'Cars of type Sport or Convertible']];
  function catPicsCard() {
    const cur = HZSITE.all(), n = CAT_PICS.filter(c => cur['categories.' + c[0]]).length;
    const box = ([k, name, note]) => { const v = cur['categories.' + k] || '', def = (IMG.categories && IMG.categories[k]) || '';
      return imgField(`${esc(name)} <small style="font-weight:400;color:var(--mute)">· ${esc(note)}</small>`, v, 0).replace('data-imgf', `data-imgf data-catpic="${k}" data-def="${esc(def)}"`).replace('<span>No image</span>', def ? `<img src="${esc(def)}" alt="">` : '<span>No image</span>'); };
    return `<section class="mr-card s12"><div class="mr-ch"><div><h2>Category pictures</h2><p>The pictures in “Find the right car” on the home page, one per category. ${n ? plural(n, 'picture') + ' changed.' : 'Nothing changed yet, the site uses its built-in pictures.'} Upload a file, paste a link, or use <b>Settings > Sample data > Load sample images</b>. The X button goes back to the built-in one.</p></div>
      <div class="mr-btns"><button type="button" class="ac-b g" data-cat-reset>Use all built-in</button><button type="button" class="ac-b" data-cat-save>Save category pictures</button></div></div>
      <div class="ac-3 fl-3">${CAT_PICS.map(box).join('')}</div></section>`;
  }
  function landingTab() {
    const cur = HZSITE.all(), dims = HZSITE.dimAll(), n = SITE_SLOTS.filter(x => cur[x[0]] || (typeof dims[x[0]] === 'number' && dims[x[0]] !== x[4])).length;
    const card = ([key, name, where, size, defDim, kind]) => {
      const v = cur[key] || '', def = key.split('.').reduce((o, k) => o && o[k], IMG) || '', dv = typeof dims[key] === 'number' ? dims[key] : defDim;
      const box = imgField(name, v, 0).replace('data-imgf', `data-imgf data-slot="${esc(key)}" data-def="${esc(def)}"`).replace('<span>No image</span>', def ? `<img src="${esc(def)}" alt="">` : '<span>No image</span>');
      return `<section class="mr-card ac-land-c" data-kind="${kind}" style="--dim:${dv / 100}"><div class="mr-ch"><div><h2>${esc(name)}</h2><p>${esc(where)}</p></div><span class="mr-tag glass">${size}</span></div>${box}
        <div class="ac-dim"><div class="h"><span>Dark overlay</span><b data-dimv>${dv}%</b><button type="button" class="ac-b g sm" data-dim-reset>Default</button></div><input type="range" min="0" max="100" step="5" value="${dv}" data-dim="${esc(key)}" data-defdim="${defDim}" aria-label="Dark overlay for ${esc(name)}"></div>
        <p class="ac-land-st"><span data-slotst>${v ? 'Custom picture' : 'Built-in picture'}</span> · the X button goes back to the built-in one.</p></section>`;
    };
    return `<div class="ac-land"><div class="ac-top" style="margin-top:0"><div><h2 style="font-size:24px">Landing images</h2><p>Upload the big pictures visitors see first and choose how dark the black overlay on top is. ${n ? plural(n, 'picture') + ' changed.' : 'Nothing changed yet, the site uses its built-in pictures.'} Wide photos work best. They are shrunk to fit the browser storage.</p></div>
      <div class="mr-btns"><a class="mr-more" href="index.html" target="_blank" rel="noopener">View site</a><button type="button" class="ac-b g" data-landing-reset>Use all built-in</button><button type="button" class="ac-b" data-landing-save>Save images</button></div></div>
      <div class="ac-land-g">${SITE_SLOTS.map(card).join('')}</div></div>`;
  }
  app.addEventListener('input', e => {
    const r = e.target.closest && e.target.closest('[data-dim]'); if (!r) return;
    const c = r.closest('.ac-land-c'); c.style.setProperty('--dim', r.value / 100); c.querySelector('[data-dimv]').textContent = r.value + '%';
  });
  app.addEventListener('click', e => {
    const rs = e.target.closest('[data-dim-reset]'); if (rs) { const r = rs.closest('.ac-land-c').querySelector('[data-dim]'); r.value = r.dataset.defdim; r.dispatchEvent(new Event('input', { bubbles: true })); return; }
    if (e.target.closest('[data-landing-save]')) act(() => {
      const m = {}, d = {};
      Object.entries(HZSITE.all()).forEach(([k, v]) => { if (k.startsWith('categories.')) m[k] = v; });
      app.querySelectorAll('[data-slot]').forEach(b => { const v = imgOfBox(b); if (v) m[b.dataset.slot] = v; });
      app.querySelectorAll('[data-dim]').forEach(r => { if (r.value !== r.dataset.defdim) d[r.dataset.dim] = +r.value; });
      HZSITE.set(m); HZSITE.setDim(d); flash = { ok: true, m: 'Landing images saved. The live site now uses them.' }; });
    if (e.target.closest('[data-cat-save]')) act(() => {
      const m = { ...HZSITE.all() };
      app.querySelectorAll('[data-catpic]').forEach(b => { const v = imgOfBox(b), k = 'categories.' + b.dataset.catpic; if (v) m[k] = v; else delete m[k]; });
      HZSITE.set(m); flash = { ok: true, m: 'Category pictures saved. The home page now uses them.' }; });
    if (e.target.closest('[data-cat-reset]')) act(() => { const m = { ...HZSITE.all() }; CAT_PICS.forEach(c => delete m['categories.' + c[0]]); HZSITE.set(m); flash = { ok: true, m: 'Category pictures are back to the built-in ones.' }; });
    if (e.target.closest('[data-landing-reset]')) act(() => { { const keep = {}; Object.entries(HZSITE.all()).forEach(([k, v]) => { if (k.startsWith('categories.')) keep[k] = v; }); HZSITE.set(keep); } HZSITE.setDim({}); flash = { ok: true, m: 'Back to the built-in pictures and overlays.' }; });
  });

  // ---- Activity: who changed what and when (written by services/insights.js for every save made on this page).
  const actRows = () => { const q = actF.q.trim().toLowerCase(); return HZINS.list().filter(e => (actF.area === 'all' || e.area === actF.area) && (!q || [e.who, e.area, e.action, e.what, e.detail].join(' ').toLowerCase().includes(q))); };
  function actTable() {
    const l = actRows(), show = l.slice(0, actN);
    if (!l.length) return `<div class="ac-empty"><h3>${HZINS.list().length ? 'Nothing matches' : 'No activity yet'}</h3><p>${HZINS.list().length ? 'Try a different search or area.' : 'Changes you make in this panel, like editing a car or a deal, are listed here with who made them and when.'}</p></div>`;
    return `<div class="ac-wrapt"><table class="ac-tbl"><thead><tr><th>When</th><th>Who</th><th>Area</th><th>Change</th></tr></thead><tbody>${show.map(e => `<tr><td>${esc(when(e.t))}</td><td>${cell(e.who, '', { w: 160 })}</td><td>${esc(e.area)}</td><td>${cell(`${e.action[0].toUpperCase() + e.action.slice(1)}: ${e.what}`, e.detail, { b: 0, w: 460 })}</td></tr>`).join('')}</tbody></table></div>
      ${l.length > show.length ? `<div style="text-align:center;margin-top:14px"><button type="button" class="ac-b g" data-act-more>Show more (${l.length - show.length} older)</button></div>` : ''}`;
  }
  function activityTab() {
    const areas = [...new Set(HZINS.list().map(e => e.area))].sort(), all = HZINS.list(), DAYS = 14, day = d => d.toLocaleDateString('en-CA');
    const cols = Array.from({ length: DAYS }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (DAYS - 1 - i)); return day(d); });
    const byDay = {}, byArea = {}; all.forEach(e => { const k = day(new Date(e.t)); if (cols.includes(k)) { byDay[k] = (byDay[k] || 0) + 1; (byArea[e.area] = byArea[e.area] || {})[k] = (byArea[e.area][k] || 0) + 1; } });
    const lanes = Object.keys(byArea).map(a => [a, Object.values(byArea[a]).reduce((t, n) => t + n, 0)]).sort((x, y) => y[1] - x[1]).slice(0, 4).map(x => x[0]);
    const mx = Math.max(1, ...lanes.flatMap(a => Object.values(byArea[a]))), week = cols.slice(-7).reduce((t, k) => t + (byDay[k] || 0), 0), today = byDay[cols[DAYS - 1]] || 0, active = cols.filter(k => byDay[k]).length;
    const people = new Set(all.map(e => e.who)).size, busy = cols.reduce((m, k) => (byDay[k] || 0) > (byDay[m] || 0) ? k : m, cols[0]), lit = Math.round(48 * active / DAYS);
    const short = k => new Date(k + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const tl = `<section class="av-hero"><div class="av-ht"><h2>Activity timeline</h2><div class="av-leg">${lanes.map((a, i) => `<span><i class="c${i}"></i>${esc(a)}</span>`).join('')}</div></div>
      ${lanes.length ? `<div class="av-lanes">${lanes.map((a, i) => `<div class="av-lane">${cols.map(k => { const n = (byArea[a] || {})[k] || 0; return `<i class="c${i}" style="--o:${n ? (0.35 + 0.65 * n / mx).toFixed(2) : 0}" title="${esc(a)} · ${short(k)} · ${n}"></i>`; }).join('')}</div>`).join('')}</div>` : '<p class="av-none">No changes in the last 14 days. They will appear here as you edit the panel.</p>'}
      <div class="av-axis"><span>${short(cols[0])}</span><span>${short(cols[7])}</span><span>${short(cols[DAYS - 1])}</span></div></section>`;
    const ring = `<section class="av-score"><div class="av-ht"><h2>This week</h2><em class="rs-chip ok">${active} of ${DAYS} days</em></div><div class="av-ring"><svg viewBox="0 0 120 120" aria-hidden="true">${Array.from({ length: 48 }, (_, i) => `<line x1="60" y1="6" x2="60" y2="${i < lit ? 16 : 12}" transform="rotate(${i * 7.5} 60 60)" class="${i < lit ? 'on' : ''}"/>`).join('')}</svg><div><b>${week}</b><span>changes</span></div></div>
      <dl class="av-dl"><div><dt>Last change</dt><dd>${all.length ? esc(when(all[0].t)) : 'None yet'}</dd></div><div><dt>Busiest area</dt><dd>${esc(lanes[0] || 'None yet')}</dd></div><div><dt>People</dt><dd>${people}</dd></div></dl></section>`;
    const tiles = [['Today', today, 'changes'], ['Last 7 days', week, 'changes'], ['Busiest day', byDay[busy] || 0, byDay[busy] ? short(busy) : 'none yet'], ['Areas touched', areas.length, 'of the panel']].map(t => `<div class="av-tile"><span>${t[0]}</span><b>${t[1]}</b><small>${t[2]}</small></div>`).join('');
    return `<div class="av-wrap"><div class="av-top">${tl}${ring}</div><div class="av-tiles">${tiles}</div>
      <section class="av-log"><div class="ac-bar"><input id="aq" type="search" placeholder="Search who, area or change" value="${esc(actF.q)}" aria-label="Search activity"><select id="aa" aria-label="Filter by area"><option value="all">All areas</option>${areas.map(a => `<option${actF.area === a ? ' selected' : ''}>${esc(a)}</option>`).join('')}</select><span class="sp"></span><button type="button" class="ac-b g" data-export="activity">Export CSV</button></div>
      <p class="s" style="margin:-4px 0 14px;color:var(--mute);font-size:14px">Every change made from this admin panel, newest first. The last 1,000 are kept, and entries can’t be edited or deleted here. Values are never shown, only what was changed.</p><div id="alog">${actTable()}</div></section></div>`;
  }

  // ---- CSV export: bookings, customers, deals, blocked dates and the activity log (Settings > Export data has them all in one place).
  const EXPORTS = {
    bookings: ['horizone-bookings.csv', 'Bookings', 'Every booking with customer, dates, route, total and late fee.', () => [['ID', 'Status', 'Customer', 'Email', 'Car', 'Pick-up', 'Return', 'From', 'To', 'Mode', 'Days', 'Promo code', 'Discount (USD)', 'Total (USD)', 'Late fee (USD)', 'Created'],
      ...sorted().map(b => [b.id, b.status, b.customer && b.customer.name, b.customer && b.customer.email, b.car, b.pickup, b.ret, b.from + ' ' + b.ft, b.to + ' ' + b.tt, b.mode, b.days, b.promo ? b.promo.code : '', b.promo ? b.promo.off : '', b.total, HZ.lateFeeOf(b) || '', b.created])]],
    customers: ['horizone-customers.csv', 'Customers', 'Name, email, phone, join date, bookings and amount spent. No passwords.', () => [['Name', 'Email', 'Phone', 'Joined', 'Bookings', 'Spent (USD)'],
      ...HZ.users().filter(u => u.role !== 'admin').map(u => { const mine = HZ.bookings().filter(b => b.uid === u.id); return [u.name, u.email, u.phone || '', (u.created || '').slice(0, 10), mine.length, mine.filter(earns).reduce((s, b) => s + b.total, 0)]; })]],
    deals: ['horizone-deals.csv', 'Deals', 'Every deal with its rules, dates, uses, discount given and revenue.', () => [['Title', 'Code', 'Type', 'Value', 'Max discount (USD)', 'Min days', 'Electric only', 'Cars', 'Pick-up cities', 'New customers only', 'Valid from', 'Valid until', 'Max uses', 'Used', 'Discount given (USD)', 'Revenue (USD)', 'Status', 'On home page', 'Big banner'],
      ...HZDEALS.all().map(x => { const s = HZDEALS.stats(x.code); return [x.title, x.code, x.kind, x.value, x.maxOff || '', x.minDays, x.evOnly ? 'yes' : '', x.cars.join('; '), x.locations.join('; '), x.newOnly ? 'yes' : '', x.validFrom, x.validUntil, x.maxUses || '', s.uses, s.off, s.revenue, dealStatus(x), x.onHome ? 'yes' : '', x.featured ? 'yes' : '']; })]],
    blocks: ['horizone-blocked-dates.csv', 'Blocked dates', 'Cars taken out of service, with dates and reason.', () => [['Car', 'From', 'To', 'Cars out', 'Reason', 'Note'], ...HZFLEET.blocks().map(k => [k.car, k.from, k.to, k.qty, k.reason, k.note])]],
    activity: ['horizone-activity.csv', 'Activity log', 'Who changed what and when.', () => [['When', 'Who', 'Area', 'Action', 'What', 'Detail'], ...HZINS.list().map(e => [e.t, e.who, e.area, e.action, e.what, e.detail])]],
  };
  const exportBody = () => `<div class="ac-card w" style="max-width:640px"><h2 style="font-size:20px;margin-bottom:4px">Export data</h2><p class="s" style="margin:0 0 8px;color:var(--mute)">Download your data as CSV files that open in Excel or Google Sheets. Amounts are in USD, the way they are stored.</p>
    ${Object.entries(EXPORTS).map(([k, x]) => `<div class="ax-exp"><div><b>${x[1]}</b><small>${x[2]}</small></div><button type="button" class="ac-b g sm" data-export="${k}">Export CSV</button></div>`).join('')}</div>`;

  // ---- events for the new sections
  app.addEventListener('click', e => {
    const t = e.target;
    if (t.closest('[data-cal-prev]')) { cal.m--; if (cal.m < 0) { cal.m = 11; cal.y--; } cal.day = null; return render(); }
    if (t.closest('[data-cal-next]')) { cal.m++; if (cal.m > 11) { cal.m = 0; cal.y++; } cal.day = null; return render(); }
    if (t.closest('[data-cal-today]')) { cal.y = new Date().getFullYear(); cal.m = new Date().getMonth(); cal.day = null; return render(); }
    { const c = t.closest('[data-calcar]'); if (c) { cal.car = c.dataset.calcar; return render(); } }
    { const d = t.closest('[data-cal-day]'); if (d) { cal.day = d.dataset.calDay; return render(); } }
    { const v = t.closest('[data-tl-view]'); if (v) return view(v.dataset.tlView); }
    { const k = t.closest('[data-tl-block]'); if (k) { const x = HZFLEET.blocks().find(y => y.id === k.dataset.tlBlock); if (x) { csub = 'blocks'; bd = { orig: x.id, d: { ...x } }; render(); scrollTo(0, 0); } return; } }
    if (t.closest('[data-block-add]')) { csub = 'blocks'; bd = { orig: null, d: blankBlock() }; render(); return scrollTo(0, 0); }
    if (t.closest('[data-block-back]')) { bd = null; return render(); }
    { const r = t.closest('tr[data-block]');
      if (r && t.closest('[data-block-edit]')) { const x = HZFLEET.blocks().find(y => y.id === r.dataset.block); if (x) { bd = { orig: x.id, d: { ...x } }; render(); scrollTo(0, 0); } return; }
      if (r && t.closest('[data-block-del]')) return act(() => { const x = HZFLEET.blocks().find(y => y.id === r.dataset.block); if (x) toTrash('block', x.car, `${x.from} to ${x.to}`, x); HZFLEET.removeBlock(r.dataset.block); flash = { ok: true, m: 'Blocked dates moved to Trash.' }; }); }
    { const d = t.closest('[data-dash]'); if (d) { dash.range = d.dataset.dash; return render(); } }
    if (t.closest('[data-act-more]')) { actN += 40; $('#alog').innerHTML = actTable(); return; }
    { const x = t.closest('[data-export]'); if (x && EXPORTS[x.dataset.export]) { const [file, , , rows] = EXPORTS[x.dataset.export]; csvSave(file, rows()); return; } }
    // image library
    { const del = t.closest('[data-media-del]'), card = t.closest('[data-media]');
      if (del && card) return act(() => { const m = HZMEDIA.find(card.dataset.media), u = usedTxt(HZMEDIA.usage(card.dataset.media)); if (!m) return;
        if (u) fail(`“${m.name}” is still used by ${u}. Change those first, then delete it.`);
        toTrash('image', m.name, kb(m.size), m); HZMEDIA.remove(m.id); flash = { ok: true, m: 'Image moved to Trash.' }; }); }
    { const o = t.closest('[data-lib-open]');
      if (o) { const box = o.closest('[data-imgf]'), p = box.querySelector('[data-libp]'); if (!p.hidden) { p.hidden = true; return; }
        const l = HZMEDIA.all();
        p.innerHTML = l.length ? `<div class="ax-lgrid">${l.map(m => `<button type="button" data-lib-pick="${esc(m.id)}" title="${esc(m.name)}"><img src="${esc(m.data)}" alt=""><small>${esc(m.name)}</small></button>`).join('')}</div>` : '<p class="s" style="margin:0">The library is empty. Upload a picture and it is saved here for next time.</p>';
        p.hidden = false; return; }
      const pk = t.closest('[data-lib-pick]'); if (pk) { const box = pk.closest('[data-imgf]'); setImg(box, 'lib:' + pk.dataset.libPick); box.querySelector('[data-libp]').hidden = true; return; } }
  });
  app.addEventListener('change', async e => {
    const t = e.target;
    if (t.matches && t.matches('[data-media-upload]')) {
      const files = [...t.files]; t.value = ''; if (!files.length) return;
      let ok = 0, bad = 0, err = '';
      for (const f of files) { const data = await readImageP(f); if (!data) { bad++; continue; } try { HZMEDIA.add(f.name, data); ok++; } catch (er) { if (er.user) { err = er.message; break; } throw er; } }
      flash = err ? { ok: false, m: err } : ok ? { ok: true, m: `${plural(ok, 'image')} added${bad ? `, ${bad} skipped (not an image)` : ''}.` } : { ok: false, m: 'Choose image files.' }; return render();
    }
    if (t.matches && t.matches('[data-media-name]')) { const id = t.closest('[data-media]').dataset.media; return act(() => HZMEDIA.rename(id, t.value)); }
    if (t.id === 'aa') { actF.area = t.value; actN = 40; $('#alog').innerHTML = actTable(); }
  });
  app.addEventListener('input', e => { if (e.target.id === 'aq') { actF.q = e.target.value; actN = 40; $('#alog').innerHTML = actTable(); } });
  app.addEventListener('submit', e => {
    if (e.target.id !== 'fBlock') return;
    e.preventDefault();
    act(() => { bd.d = readBlock(); const x = HZFLEET.saveBlock(bd.d), n = HZ.bookings().filter(b => b.car === x.car && ['pending', 'confirmed'].includes(b.status) && b.from <= x.to && b.to >= x.from).length;
      bd = null; flash = { ok: true, m: `Dates blocked.${n ? ` ${plural(n, 'booking')} already overlap${n === 1 ? 's' : ''} these dates, check Bookings.` : ''}` }; });
  });

  const icn = d => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  const IC = { car: icn('<path d="M4 16v-4l2-5h12l2 5v4"/><path d="M3 16h18v3H3z"/><path d="M7 12h10"/>'), chev: icn('<path d="m6 9 6 6 6-6"/>') };
  // Page headline: [dark part, grey part]. Many are driven by live numbers, like "112 biomarkers. 80 optimal."
  function pageHead() {
    const bs = HZ.bookings(), first = esc(String(me0.name || 'there').trim().split(' ')[0]), hr = new Date().getHours();
    const hello = hr < 5 ? 'Working late' : hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
    const pend = bs.filter(b => b.status === 'pending').length, od = bs.filter(b => { const l = HZ.lateInfo(b); return l && !l.final; }).length, todo = pend + od + unread();
    const rev = bs.filter(earns).reduce((s, b) => s + b.total + HZ.lateFeeOf(b), 0), cl = HZ.users().filter(u => u.role === 'client').length;
    return {
      overview: [`${hello}, ${first}.`, todo ? `${todo} ${todo === 1 ? 'thing needs' : 'things need'} a look.` : 'All caught up.'],
      dashboard: [`${money(rev)} earned.`, 'See where it came from.'],
      bookings: [`${plural(bs.length, 'booking')}.`, `${pend} awaiting you.`],
      calendar: ['Fleet calendar.', 'Who has which car, when.'],
      late: [`${od} overdue.`, 'Late returns and their fees.'],
      customers: [`${plural(cl, 'customer')}.`, 'And every trip they took.'],
      reviews: (() => { const r = HZFLEET.reviews(); return r.length ? [plural(r.length, 'review') + '.', `${(r.reduce((t, x) => t + x.stars, 0) / r.length).toFixed(1)}★ on average.`] : ['Customer reviews.', 'Straight from renters.']; })(),
      messages: [`${unread()} unread.`, 'Questions from the Help page.'],
      branding: ['Your brand.', 'Logo and name on the live site.'],
      landing: ['Landing images.', 'Hero and banner pictures on the live site.'],
      deals: ['Promo deals.', 'Codes that bring people back.'],
      savings: ['Deals page cards.', 'What visitors see first.'],
      media: ['Media library.', 'Upload once, use everywhere.'],
      locations: [`${plural(locList().length, 'location')}.`, 'Where your cars start.'],
      fleet: [`${plural(carList().length, 'car')}.`, 'The whole fleet in one place.'],
      forms: ['Booking options.', 'What customers can add.'],
      pricing: ['Pricing rules.', 'Savings and late charges.'],
      currency: ['Currency.', 'What visitors see, and the rates behind it.'],
      settings: ['Site settings.', 'Access, email and data.'],
      activity: ['Activity log.', 'Every change, with a name on it.'],
      trash: [`${trashAll().length} deleted.`, 'Restore them before they are gone.']
    }[tab] || ['Admin.', ''];
  }
  let lastTab = null;
  function navHtml() {
    const cur = TAB_GROUPS.find(g => g[1].includes(tab)) || TAB_GROUPS[0];
    const nBadge = id => id === 'messages' ? badge(unread()) : id === 'trash' ? badge(trashAll().length) : '';
    const gBadge = g => g[0] === 'Customers' ? badge(unread()) : '';
    const groups = TAB_GROUPS.map(g => `<button type="button" data-t="${g[1][0]}" ${g === cur ? 'aria-current="page"' : ''}>${g[0]}${gBadge(g)}</button>`).join('');
    const seg = cur[1].length < 2 ? '' : `<div class="mr-seg" role="tablist" aria-label="${cur[0]}">${cur[1].map(id => `<button type="button" role="tab" data-t="${id}" aria-selected="${id === tab}">${TABS.find(x => x[0] === id)[1]}${nBadge(id)}</button>`).join('')}</div>`;
    // Third level: the sections inside the current page (a pill row under the headline).
    const go3 = (list, cur3) => list.map(x => ({ label: x[1], attr: `data-go="${tab}:${x[0]}"`, on: x[0] === cur3 }));
    const cnt = t => trashAll().filter(x => x.type === t).length;
    const third = tab === 'fleet' ? go3([['cars', 'Cars'], ['lists', 'Lists and defaults']], fsub)
      : tab === 'locations' ? go3([['list', 'Locations'], ['geo', 'Countries and cities'], ['routes', 'One-way routes']], lsub)
      : tab === 'calendar' ? go3([['timeline', 'Timeline'], ['blocks', 'Blocked dates']], csub)
      : tab === 'forms' ? go3(BOOKING_SECS, BOOKING_SECS.some(x => x[0] === fsec) ? fsec : 'protection')
      : tab === 'pricing' ? go3(PRICING_SECS, PRICING_SECS.some(x => x[0] === fsec) ? fsec : 'longstay')
      : tab === 'settings' ? go3(SET_SECS, setSec)
      : tab === 'currency' ? CUR_SECS.map(x => ({ label: x[1], attr: `data-csec="${x[0]}"`, on: x[0] === csec }))
      : tab === 'trash' ? [['all', 'All', trashAll().length], ...TRASH_TYPES.map(x => [x[0], x[1], cnt(x[0])])].map(x => ({ label: x[1] + (x[2] ? ` <small>${x[2]}</small>` : ''), attr: `data-tsec="${x[0]}"`, on: x[0] === tsec })) : [];
    const row3 = third.length ? `<div class="ac-g3" role="tablist" aria-label="Sections of this page">${third.map(x => `<button type="button" role="tab" ${x.attr} aria-selected="${x.on}">${x.label}</button>`).join('')}</div>` : '';
    const ini = esc((me0.name || '?').trim()[0] || '?').toUpperCase(), hd = pageHead();
    const bar = `<header class="mr-bar"><button type="button" class="mr-logo" data-t="overview" aria-label="Admin overview">${HZ.brand().logo ? `<img class="mr-limg" src="${esc(HZ.brand().logo)}" alt="">` : `<span class="ad-mark">${IC.car}</span>`}<b>${esc(HZ.brand().name)}</b></button>
      <nav class="mr-tabs" aria-label="Admin sections">${groups}</nav>
      <div class="mr-right"><details class="mr-user"><summary><span class="ad-av">${ini}</span><b>${esc(String(me0.name || '').trim().split(' ')[0])}</b>${IC.chev}</summary>
        <div class="mr-menu"><a href="account.html">My account</a><a href="index.html" target="_blank" rel="noopener">View live site</a><button type="button" id="adOut">Sign out</button></div></details>
        <a class="mr-cta" href="index.html" target="_blank" rel="noopener">View live site</a></div></header>`;
    const eyebrow = tab === 'overview' ? new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) : `${cur[0]} · ${TABS.find(x => x[0] === tab)[1]}`;
    const head = `<header class="mr-head"><div><div class="mr-eyebrow"><i></i>${esc(eyebrow)}</div><h1>${hd[0]} <span>${hd[1]}</span></h1></div>${seg}</header>`;
    return { bar, head, row3 };
  }
  function render() {
    try { trashPurge(); } catch (e) { /* storage blocked: nothing to purge */ }
    const n = navHtml(), fresh = tab !== lastTab; lastTab = tab;
    app.innerHTML = `<div class="ad-shell${fresh ? ' ad-anim' : ''}">${n.bar}
      <div class="ad-main">${n.head}${n.row3}
      ${{ overview, bookings: bookingsTab, late: lateTab, customers: customersTab, fleet: fleetTab, locations: locationsTab, currency: currencyTab, deals: dealsTab, branding: brandingTab, landing: landingTab, savings: savingsTab, calendar: calendarTab, dashboard: dashboardTab, media: mediaTab, activity: activityTab, forms: formsTab, pricing: pricingTab, reviews: reviewsTab, messages: messagesTab, trash: trashTab, settings: settingsTab }[tab]()}</div></div>`;
    hideTip();
    if ($('#cvOut')) $('#cvOut').textContent = convertOut();
    if ($('#apw')) $('#apw').focus({ preventScroll: true });
    if (flash) HZ.toast(flash.m, flash.ok ? 'ok' : 'err');
    if (tab !== 'branding') brandDraft = null;
    labelTables(); enh(); lateLive();
    flash = null;
  }
  app.addEventListener('change', e => { if (e.target.id !== 'brLogo' || !e.target.files[0]) return; readLogo(e.target.files[0], data => { brandDraft.logo = data; render(); }); });
  app.addEventListener('input', e => { if (e.target.id !== 'brName') return; brandDraft.name = e.target.value; const t = e.target.value.trim() || SITE.name; app.querySelectorAll('[data-brtext]').forEach(x => { x.textContent = t; });
    const sv = app.querySelector('[data-brsave]'); if (sv) sv.disabled = brandDraft.name.trim() === HZ.brand().rawName && brandDraft.logo === HZ.brand().logo; });
  app.addEventListener('click', e => {
    if (e.target.closest('[data-brrm]')) { brandDraft.logo = ''; render(); return; }
    if (e.target.closest('[data-brsave]')) act(() => { HZ.setBrand(brandDraft.name, brandDraft.logo); brandDraft = null; flash = { ok: true, m: 'Branding saved. The live site now uses it.' }; });
    if (e.target.closest('[data-brreset]')) act(() => { HZ.setBrand('', ''); brandDraft = null; flash = { ok: true, m: 'Back to the default name and logo.' }; });
  });
  // Tables turn into stacked cards on small screens: each cell gets its column name.
  function labelTables() {
    app.querySelectorAll('.ac-tbl').forEach(t => { const h = [...t.querySelectorAll('thead th')].map(x => x.textContent.trim());
      t.querySelectorAll('tbody tr').forEach(r => [...r.children].forEach((c, i) => { if (c.tagName === 'TD' && c.colSpan < 2 && h[i]) c.dataset.l = h[i]; })); });
  }
  // Account menu: sign out, and close the menu when you click anywhere else.
  app.addEventListener('click', e => { if (e.target.closest('#adOut')) { HZ.signOut(); location.href = 'index.html'; } });
  document.addEventListener('click', e => { const d = app.querySelector('.mr-user[open]'); if (d && !d.contains(e.target)) d.removeAttribute('open'); });
  // Call the image API (async), show progress in the Sample data card, then report. prefix = text kept in front of the result.
  function loadImages(prefix = '') {
    if (simgBusy) return;
    simgBusy = 'Starting…'; render();
    const step = (d, t) => { simgBusy = `Finding photos ${d} of ${t}…`; const el = app.querySelector('#simgStatus'); if (el) el.textContent = simgBusy; };
    return HZIMGAPI.load(step).then(r => { flash = r.total ? { ok: true, m: `${prefix}Loaded ${r.found} of ${r.total} sample images.${r.found < r.total ? ' The rest keep their placeholder.' : ''}` } : { ok: true, m: `${prefix}Nothing to do: every car, location and deal already has a picture, or there are none yet (press “Load sample data” first).` }; })
      .catch(e => { flash = { ok: false, m: e.user ? e.message : 'Could not load the images.' }; if (!e.user) console.error(e); })
      .finally(() => { simgBusy = ''; render(); });
  }
  const act = fn => { try { fn(); } catch (e) { flash = { ok: false, m: e.user ? e.message : 'Something went wrong.' }; if (!e.user) console.error(e); } render(); };
  const csvCell = v => { let s = String(v ?? ''); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };

  // Jump to a tab and, optionally, a sub-section: data-go="fleet:lists", "locations:routes", "settings:admins", "bookings:pending".
  function go(spec) {
    const [t, sub] = spec.split(':');
    if (t !== tab) { ed = null; ced = null; cdraft = null; dd = null; fd = null; bd = null; tab = t; history.replaceState(null, '', '#' + t); }
    if (sub) {
      if (t === 'fleet') { fsub = sub; ced = null; }
      else if (t === 'locations') { lsub = sub; ed = null; fd = null; rtOn = null; if (sub === 'routes') fsec = 'routes'; }
      else if (t === 'settings') setSec = sub;
      else if (t === 'calendar') { csub = sub; bd = null; }
      else if (t === 'bookings') f.status = sub;
      else if (t === 'forms' || t === 'pricing') { fsec = sub; fd = null; ltd = null; }
    }
    render(); scrollTo(0, 0);
  }
  app.addEventListener('click', e => {
    { const g = e.target.closest('[data-go]'); if (g) { go(g.dataset.go); return; } }
    { const lv = e.target.closest('[data-late-view]'); if (lv) { HZ.lateList({ policy: lv.dataset.lateView === 'form' ? policyOf(readLate()) : HZ.latePolicy(), fmt: money, title: lv.dataset.lateView === 'form' ? 'Late charges (as set now)' : 'Late return charges' }); return; } }
    if (e.target.closest('[data-ltcar-add]')) { ltd = readLate(); ltd.rules.push({ by: 'car', value: '', grace: '', flat: { usd: 0, shown: '', txt: '' }, rate: { usd: 0, shown: '', txt: '' }, cap: { usd: 0, shown: '', txt: '' } }); render(); return; }
    { const cd = e.target.closest('[data-ltcar-del]'); if (cd) { ltd = readLate(); ltd.rules.splice(+cd.closest('[data-lc]').dataset.lc, 1); render(); return; } }
    { const ln = e.target.closest('[data-late-now], [data-late-free]'), r = ln && ln.closest('[data-id]');
      if (r) { const b = HZ.bookings().find(x => x.id === r.dataset.id), c = b && HZ.lateCalc(b, new Date()), free = ln.hasAttribute('data-late-free');
        const fee = free ? 0 : c && c.fee;
        if (b && confirm(`${b.car} is back now.\n\n${fee > 0 ? `A late fee of ${HZC.txt(fee, 2)} will be saved (${lateWord(c.over)} late).` : free ? 'The late fee will be waived.' : 'No late fee applies.'}\n\nThe booking will be marked completed. Continue?`)) act(() => { HZ.markReturned(b.id); if (free) HZ.setLateFee(b.id, 0); flash = { ok: true, m: fee > 0 ? `Saved a late fee of ${HZC.txt(fee, 2)}.` : 'Marked as returned. No late fee.' }; });
        return; } }
    const t = e.target.closest('[data-t]'); if (t) { ed = null; ced = null; cdraft = null; tab = t.dataset.t; dd = null; fd = null; history.replaceState(null, '', '#' + tab); return render(); }
    if (e.target.closest('[data-deal-add]')) { dd = { orig: null, d: blankDeal() }; render(); return scrollTo(0, 0); }
    if (e.target.closest('[data-deal-back]')) { dd = null; render(); return; }
    { const ts = e.target.closest('[data-tsec]'); if (ts) { tsec = ts.dataset.tsec; render(); return; } }
    { const tr = e.target.closest('tr[data-tid]');
      if (tr && e.target.closest('[data-trestore]')) { act(() => { const n = restoreItems([tr.dataset.tid]); if (n.fail.length) fail(n.fail[0]); flash = { ok: true, m: 'Restored.' }; }); return; }
      if (tr && e.target.closest('[data-tdel]')) { if (confirm('Delete this permanently? This cannot be undone.')) act(() => { trashDrop([tr.dataset.tid]); flash = { ok: true, m: 'Deleted permanently.' }; }); return; }
      if (e.target.closest('[data-trestoreall]')) { act(() => { const n = restoreItems(trashView().map(x => x.tid)); flash = n.fail.length ? { ok: false, m: `Restored ${n.ok}. ${n.fail.length} could not be restored: ${n.fail[0]}` } : { ok: true, m: `Restored ${n.ok} item${n.ok === 1 ? '' : 's'}.` }; }); return; }
      if (e.target.closest('[data-trestoresoon]')) { act(() => { const n = restoreItems(trashView().filter(x => daysLeft(x) <= SOON_DAYS).map(x => x.tid)); flash = n.fail.length ? { ok: false, m: `Restored ${n.ok}. ${n.fail.length} could not be restored: ${n.fail[0]}` } : { ok: true, m: `Restored ${n.ok} item${n.ok === 1 ? '' : 's'}.` }; }); return; }
      if (e.target.closest('[data-tempty]')) { const k = trashView().length; if (confirm(`Delete ${k} item${k === 1 ? '' : 's'} permanently? This cannot be undone.`)) act(() => { trashDrop(trashView().map(x => x.tid)); flash = { ok: true, m: 'Deleted permanently.' }; }); return; } }
    { const cs = e.target.closest('[data-csec]'); if (cs) { csec = cs.dataset.csec; render(); return; } }
    { const fs = e.target.closest('[data-fsec]'); if (fs) { fsec = fs.dataset.fsec; fd = null; ltd = null; rtOn = null; render(); return; } }
    if (e.target.closest('[data-fadd]')) { keepSwitch(); fd = [...readRows(), blankRow(fsec)].map(r => r.name === undefined ? r : r); fd = fd.map(r => ({ kind: 'check', max: 3, ...r })); render(); return; }
    { const fm = e.target.closest('[data-fmove]'), fx = e.target.closest('[data-fdel]'), row = e.target.closest('[data-fi]');
      if (row && (fm || fx)) { keepSwitch(); const rows = readRows(), i = +row.dataset.fi; if (fx) rows.splice(i, 1); else { const j = i + +fm.dataset.fmove; if (j >= 0 && j < rows.length) [rows[i], rows[j]] = [rows[j], rows[i]]; } fd = rows; render(); return; } }
    if (e.target.closest('[data-freset]')) { if (confirm('Reset this section to the original defaults?')) act(() => { if (fsec === 'routes') HZONEWAY.reset(); else HZFORM.reset(fsec); fd = null; ltd = null; rtOn = null; flash = { ok: true, m: 'Reset to the defaults.' }; }); return; }
    const dr = e.target.closest('tr[data-deal], .dl-d[data-deal]');
    if (dr && e.target.closest('[data-deal-edit]')) { const x = HZDEALS.all().find(y => y.id === dr.dataset.deal); if (x) { dd = { orig: x.id, d: dealDraft(x) }; render(); scrollTo(0, 0); } return; }
    if (dr && e.target.closest('[data-deal-dup]')) { const x = HZDEALS.all().find(y => y.id === dr.dataset.deal); if (x) { dd = { orig: null, d: { ...dealDraft(x), id: '', title: `${x.title} (copy)`, code: '', featured: false, active: false } }; render(); scrollTo(0, 0); } return; }
    const hr = e.target.closest('[data-hdeal]');
    if (hr && e.target.closest('[data-home-up]')) return act(() => HZDEALS.moveHome(hr.dataset.hdeal, -1));
    if (hr && e.target.closest('[data-home-down]')) return act(() => HZDEALS.moveHome(hr.dataset.hdeal, 1));
    if (hr && e.target.closest('[data-home-off]')) return act(() => { HZDEALS.setHome(hr.dataset.hdeal, false); flash = { ok: true, m: 'Removed from the home page.' }; });
    if (dr && e.target.closest('[data-deal-toggle]')) return act(() => { const x = HZDEALS.all().find(y => y.id === dr.dataset.deal); HZDEALS.setActive(dr.dataset.deal, !x.active); });
    if (dr && e.target.closest('[data-deal-del]')) { act(() => { const d = HZDEALS.all().find(x => x.id === dr.dataset.deal); if (d) toTrash('deal', d.title, d.code, d); HZDEALS.remove(dr.dataset.deal); flash = { ok: true, m: 'Deal moved to Trash.' }; }); return; }
    const rc = e.target.closest('[data-rid]');
    if (rc && e.target.closest('[data-rdel]')) { act(() => { const r = HZFLEET.reviews().find(x => x.id === rc.dataset.rid); if (r) toTrash('review', `${r.car} · ${r.stars}★`, r.name || 'Guest', r); HZFLEET.removeReview(rc.dataset.rid); flash = { ok: true, m: 'Review moved to Trash.' }; }); return; }
    const mc = e.target.closest('[data-mid]');
    if (mc && e.target.closest('[data-mread]')) return act(() => { const x = HZ.messages().find(y => y.id === mc.dataset.mid); HZ.setMessageRead(mc.dataset.mid, !(x && x.read)); });
    if (mc && e.target.closest('[data-mdel]')) { act(() => { const m = HZ.messages().find(x => x.id === mc.dataset.mid); if (m) toTrash('message', m.name, m.topic || m.email, m); HZ.removeMessage(mc.dataset.mid); flash = { ok: true, m: 'Message moved to Trash.' }; }); return; }
    if (e.target.closest('[data-clearemail]')) { if (confirm('Turn the Help page contact form off?')) act(() => { HZ.setSupportEmail(''); flash = { ok: true, m: 'Contact form turned off.' }; }); return; }
    if (e.target.closest('[data-cur-add]')) { cdraft = collectCur(); cdraft.push({ code: '', name: '', rate: '', whole: false, on: true }); render(); const rs = [...app.querySelectorAll('tr[data-cur]')].pop(); if (rs) rs.querySelector('input').focus(); return; }
    if (e.target.closest('[data-cur-reset]')) { if (confirm('Restore the original currencies and rates? Your changes will be lost.')) act(() => { HZC.resetList(); cdraft = null; refreshCurMenu(); flash = { ok: true, m: 'Default currency rates restored.' }; }); return; }
    const cr = e.target.closest('tr[data-cur]');
    if (cr && e.target.closest('[data-cur-del]')) { const code = cr.dataset.cur, isNew = cr.hasAttribute('data-new');
      if (isNew) { const i = [...app.querySelectorAll('tr[data-cur]')].indexOf(cr); cdraft = collectCur(); cdraft.splice(i, 1); render(); return; }
      if (confirm(`Remove ${code}? Visitors will no longer be able to pick it. Prices keep their value, so nothing else changes.`)) act(() => { saveCurrencies(collectCur().filter(x => x.code !== code)); flash = { ok: true, m: `${code} removed.` }; }); return; }
    const sc = e.target.closest('[data-sec]'); if (sc) { setSec = sc.dataset.sec; render(); return; }
    const od = e.target.closest('[data-opt-del]'); if (od) { act(() => optDelete(od.dataset.optDel, od.dataset.b)); return; }
    const gd = e.target.closest('[data-geo-del]'); if (gd) { act(() => geoDelete(gd.dataset.geoDel, gd.dataset.a, gd.dataset.b)); return; }
    const sumUp = () => { const f = $('#fLoc'); if (f) $('#carSum').textContent = carSumText([...f.querySelectorAll('[name=carsel]:checked')].map(x => x.value)); };
    const ca = e.target.closest('[data-carall]'); if (ca) { document.querySelectorAll('#fLoc [name=carsel]').forEach(b => { b.checked = ca.dataset.carall === '1'; }); sumUp(); return; }
    const ct = e.target.closest('[data-cartype]'); if (ct) { const boxes = [...ct.closest('.ac-reg').querySelectorAll('[name=carsel]')], all = boxes.every(b => b.checked); boxes.forEach(b => { b.checked = !all; }); ct.textContent = all ? 'Select type' : 'Clear type'; sumUp(); return; }
    const rg = e.target.closest('[data-reg]');
    if (rg) { const boxes = [...rg.closest('.ac-reg').querySelectorAll('[name=loc]')], all = boxes.every(b => b.checked); boxes.forEach(b => { b.checked = !all; }); rg.textContent = all ? 'Select region' : 'Clear region'; return; }
    if (e.target.closest('[data-car-add]')) { ced = { orig: null, d: carDraft(blankCar()) }; render(); return scrollTo(0, 0); }
    if (e.target.closest('[data-car-back]')) { ced = null; render(); return; }
    const kr = e.target.closest('tr[data-car]');
    if (kr && e.target.closest('[data-car-edit]')) { const c = carList().find(x => x.name === kr.dataset.car); if (c) { ced = { orig: c.name, d: carDraft(c) }; render(); scrollTo(0, 0); } return; }
    if (kr && e.target.closest('[data-car-del]')) { act(() => deleteCar(kr.dataset.car)); return; }
    if (e.target.closest('[data-loc-add]')) { ed = { orig: null, d: priceDraft(blankLoc()) }; render(); return scrollTo(0, 0); }
    if (e.target.closest('[data-loc-back]')) { ed = null; render(); return; }
    const lr = e.target.closest('tr[data-loc]');
    if (lr && e.target.closest('[data-loc-edit]')) { const l = locList().find(x => x.city === lr.dataset.loc); if (l) { ed = { orig: l.city, d: priceDraft({ ...l, spots: (l.spots || []).map(x => ({ ...x })) }) }; render(); scrollTo(0, 0); } return; }
    if (lr && e.target.closest('[data-loc-del]')) { act(() => deleteLocation(lr.dataset.loc)); return; }
    if (e.target.closest('[data-spot-add]')) { ed.d = collect(); ed.d.spots.push(blankSpot()); render(); const last = [...app.querySelectorAll('[data-spot]')].pop(); if (last) { last.scrollIntoView({ block: 'center', behavior: 'smooth' }); last.querySelector('input').focus({ preventScroll: true }); } return; }
    if (e.target.closest('[data-spot-del]')) { const y = scrollY, sp = e.target.closest('[data-spot]'); ed.d = collect(); ed.d.spots.splice([...app.querySelectorAll('[data-spot]')].indexOf(sp), 1); render(); scrollTo(0, y); return; }
    if (e.target.closest('[data-img-clear]')) { const box = e.target.closest('[data-imgf]'); box.querySelector('[data-imgurl]').value = ''; setImg(box, ''); return; }
    const si = e.target.closest('[data-simg]');
    if (si) { if (si.dataset.simg === 'clear') return act(() => { const n = HZIMGAPI.clear(); flash = { ok: true, m: n ? `Removed ${n} sample image${n === 1 ? '' : 's'}.` : 'No sample images to remove.' }; }); return loadImages(); }
    const d = e.target.closest('[data-demo]');
    if (d) { const add = d.dataset.demo === 'add'; let ok = false; act(() => { add ? (HZFLEET.loadSampleLists(), HZLOC.loadSample(), recountLocs(), HZFLEET.loadSampleCars(), recountLocs(), HZDEALS.loadSample(), HZ.seedDemo()) : (HZIMGAPI.clear(), HZ.clearDemo(), HZFLEET.clearSampleLists(), HZFLEET.clearSampleCars(), HZLOC.clearSample(), HZDEALS.clearSample(), recountLocs()); flash = { ok: true, m: add ? 'Sample data loaded.' : 'Sample data removed.' }; ok = true; });
      if (add && ok && simgWith) loadImages('Sample data loaded. '); return; }
    const row = e.target.closest('tr[data-id], .rt-card[data-id], .rt-d[data-id]');
    if (row && e.target.closest('[data-view]')) return view(row.dataset.id);
    if (row && e.target.closest('[data-del]')) { act(() => { const b = HZ.bookings().find(x => x.id === row.dataset.id); if (b) toTrash('booking', b.id, [b.customer && b.customer.name, b.car].filter(Boolean).join(' · '), b); HZ.removeBooking(row.dataset.id); flash = { ok: true, m: 'Booking moved to Trash.' }; }); return; }
    const ur = e.target.closest('tr[data-uid]');
    if (ur && e.target.closest('[data-deluser]')) { act(() => { const u = HZ.rawUser(ur.dataset.uid), bks = HZ.bookings().filter(b => b.uid === ur.dataset.uid); if (u) toTrash('customer', u.name, `${u.email} · ${bks.length} booking${bks.length === 1 ? '' : 's'}`, { user: u, bookings: bks }); HZ.removeUser(ur.dataset.uid); flash = { ok: true, m: 'Customer moved to Trash.' }; }); return; }
    if (e.target.closest('[data-csv]')) {
      const rows = [['ID', 'Status', 'Customer', 'Email', 'Car', 'Pick-up', 'Return', 'From', 'To', 'Mode', 'Days', 'Total', 'Late hours', 'Late fee', 'Created'],
        ...filtered().map(b => [b.id, b.status, b.customer && b.customer.name, b.customer && b.customer.email, b.car, b.pickup, b.ret, b.from + ' ' + b.ft, b.to + ' ' + b.tt, b.mode, b.days, b.total, b.late ? b.late.hours : '', b.late ? b.late.fee : '', b.created])];
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([rows.map(r => r.map(csvCell).join(',')).join('\n')], { type: 'text/csv' }));
      a.download = 'horizone-bookings.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }
  });
  app.addEventListener('change', e => {
    if (e.target.matches && e.target.matches('[data-c=rBy]')) { ltd = readLate(); const i = +e.target.closest('[data-lc]').dataset.lc; ltd.rules[i].value = ''; render(); return; }
    if (e.target.id === 'lf-fromcur') { const sel = e.target, inp = $('#lf-from'), a = parseFloat(inp.value), prev = sel.dataset.prev || 'USD';
      if (Number.isFinite(a)) inp.value = curRound(a / curRate(prev) * curRate(sel.value), sel.value);
      const dep = $('#lf-dep'), dv = dep && parseFloat(dep.value); if (dep && Number.isFinite(dv)) dep.value = curRound(dv / curRate(prev) * curRate(sel.value), sel.value);
      sel.dataset.prev = sel.value; $('#fromHint').textContent = priceHint(inp.value, sel.value); return; }
    if (ced && e.target.closest && e.target.closest('#fCar') && e.target.tagName === 'SELECT' && ['make', 'clone'].includes(e.target.name)) {
      if (e.target.name === 'make') { const was = ced.d._mo; ced.d = collectCar(); if (e.target.value === '__other' || was) render(); return; }
      const src = carList().find(c => c.name === e.target.value);
      if (src) { ced.d = carDraft({ ...src, name: '', img: '', photos: [], seedRating: 0, seedN: 0 }); render(); }
      return;
    }
    if (e.target.id === 'lf-olist') { $('#lf-oval').placeholder = OPT_PH[e.target.value] || ''; return; }
    if (e.target.name === 'carsel') { $('#carSum').textContent = carSumText([...$('#fLoc').querySelectorAll('[name=carsel]:checked')].map(x => x.value)); return; }
    if (ed && e.target.closest && e.target.closest('#fLoc') && e.target.tagName === 'SELECT' && ['country', 'city'].includes(e.target.name)) {
      const wasOther = ed.d._ci; ed.d = collect();
      if (e.target.name === 'country') { const m = geoMap(), c = ed.d.country; ed.d.city = ''; ed.d._ci = false; if (m[c] && m[c].region) ed.d.region = m[c].region; render(); return; }
      if (e.target.value === '__other' || wasOther) { render(); return; }
      return;
    }
    if (e.target.id === 'lf-allloc') { $('#locBox').hidden = e.target.checked; return; }
    if (e.target.id === 'dl-anycar') { $('#dlCars').hidden = e.target.checked; return; }
    if (e.target.id === 'dl-anyloc') { $('#dlLocs').hidden = e.target.checked; return; }
    if (e.target.id === 'baseCur') { const c = e.target.value; return act(() => { HZC.setBase(c); cdraft = null; refreshCurMenu(); flash = { ok: true, m: `Main currency is now ${c}.` }; }); }
    if (e.target.id === 'cvFrom' || e.target.id === 'cvTo') { $('#cvOut').textContent = convertOut(); return; }
    if (e.target.matches('[data-upload]')) { const file = e.target.files[0], box = e.target.closest('[data-imgf]'); e.target.value = ''; if (file) readImage(file, data => { try { setImg(box, 'lib:' + HZMEDIA.add(file.name, data).id); } catch (er) { HZ.toast(er.user ? er.message : 'Could not save the image.', 'err'); } }, box.dataset.slot ? 1920 : 1000); return; }
    const row = e.target.closest('tr[data-id]'), ur = e.target.closest('tr[data-uid]');
    if (e.target.matches('[data-status]') && row) return act(() => { HZ.setStatus(row.dataset.id, e.target.value); flash = { ok: true, m: `${row.dataset.id} marked ${e.target.value}.` }; });
    if (e.target.matches('[data-role]') && ur) return act(() => { HZ.setRole(ur.dataset.uid, e.target.value); flash = { ok: true, m: 'Role updated.' }; });
    if (e.target.id === 'simgWith') { simgWith = e.target.checked; return; }
    if (e.target.id === 'sSample') return act(() => { HZ.setSampleData(e.target.checked); flash = { ok: true, m: e.target.checked ? 'Sample data tools turned on.' : 'Sample data tools turned off.' }; });
    
  });
  app.addEventListener('submit', e => {
    if (e.target.id === 'fCur') { e.preventDefault(); return act(() => { saveCurrencies(); flash = { ok: true, m: 'Currency rates saved.' }; }); }
    if (e.target.id === 'fAdminUnlock') {
      e.preventDefault(); const pw = e.target.elements.apw.value;
      if (!pw) { flash = { ok: false, m: 'Enter your password.' }; return render(); }
      (async () => { try { await HZ.verifyAdmin(pw); touchUnlock(); } catch (err) { flash = { ok: false, m: err.user ? err.message : 'Something went wrong.' }; if (!err.user) console.error(err); } render(); })();
      return;
    }
    if (e.target.id === 'fFrm') { e.preventDefault(); return act(saveForm); }
    if (e.target.id === 'fDeal') { e.preventDefault(); return act(saveDeal); }
    if (e.target.id === 'fCar') { e.preventDefault(); return act(saveCar); }
    if (e.target.id === 'fLoc') { e.preventDefault(); return act(saveLocation); }
    if (e.target.id === 'fFleetDef') { e.preventDefault(); const f = e.target; return act(() => fleetDefSave(f)); }
    if (e.target.id === 'fOpt') { e.preventDefault(); const f = e.target; return act(() => optAdd(f)); }
    const gk = { fGeoC: 'country', fGeoCity: 'city', fGeoR: 'region' }[e.target.id]; if (gk) { e.preventDefault(); const f = e.target; return act(() => geoAdd(gk, f)); }
    if (e.target.id !== 'fSet') return; e.preventDefault();
    const v = $('#sEmail').value;
    act(() => { HZ.setSupportEmail(v); flash = { ok: true, m: v.trim() ? 'Support email saved. The Help page form is now on.' : 'Support email cleared. The Help page form is hidden.' }; });
  });
  app.addEventListener('change', e => { if (e.target.closest && e.target.closest('#ltBody, .ac-lt-top')) lateLive(); });
  app.addEventListener('input', e => { if (e.target.closest && e.target.closest('#ltBody, .ac-lt-top')) lateLive(); if (e.target.id === 'cvAmt') $('#cvOut').textContent = convertOut(); if (e.target.id === 'lf-from') $('#fromHint').textContent = priceHint(e.target.value, $('#lf-fromcur').value); if (e.target.matches('[data-imgurl]')) { const box = e.target.closest('[data-imgf]'); box.querySelector('[data-imgdata]').value = ''; setImg(box, ''); } if (e.target.id === 'q') { f.q = e.target.value; refreshBk(); } });

  const BKD_NOTE = { pending: 'Waiting for you to confirm this booking.', confirmed: 'Confirmed. The car is reserved for this trip.', completed: 'Trip finished. The car is back.', cancelled: 'This booking was cancelled.' };
  function view(id) {
    const b = HZ.bookings().find(x => x.id === id); if (!b) return;
    const c = b.customer || {}, ini = (String(c.name || '?').trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2) || '?').toUpperCase(), d = Number(b.days) || 0;
    const lines = (b.lines || []).map(l => `<div class="bkd-ln"><span>${HZC.inText(esc(l[0]))}</span><b>${money(l[1])}</b></div>`).join('');
    dlg.className = 'bkd';
    dlg.innerHTML = `<div class="bkd-in">
      <header class="bkd-hero"><button type="button" class="bkd-x" aria-label="Close" onclick="this.closest('dialog').close()">${IC.x || '×'}</button>
        <div class="bkd-top"><span class="mr-tag ${esc(b.status)}">${esc(b.status)}</span><span class="bkd-id">${esc(b.id)}</span></div>
        <h3>${esc(b.car)}</h3><p class="bkd-note">${esc(BKD_NOTE[b.status] || '')}</p>
        <div class="bkd-tot"><b>${money(b.total)}</b><span>${d ? d + (d === 1 ? ' day' : ' days') + ' · ' : ''}${esc(b.mode)}</span></div></header>
      <section class="bkd-sec"><h4>Trip</h4>
        <div class="bkd-trip"><div><small>Pick-up</small><b>${fdate(b.from)}</b><span>${esc(b.ft)}</span></div>
          <div class="bkd-way" aria-hidden="true"><i></i><em>${d ? d + (d === 1 ? ' day' : ' days') : ''}</em></div>
          <div><small>Return</small><b>${fdate(b.to)}</b><span>${esc(b.tt)}</span></div></div>
        <p class="bkd-route"><small>Route</small>${route(b)}</p></section>
      <section class="bkd-sec"><h4>Customer</h4>
        <div class="bkd-cu"><span class="bkd-av">${esc(ini)}</span><div><b>${esc(c.name || 'Guest')}</b><a href="mailto:${esc(c.email || '')}">${esc(c.email || '')}</a>${c.phone ? `<small>${esc(c.phone)}</small>` : ''}</div></div></section>
      <section class="bkd-sec"><h4>Price</h4>${lines}<div class="bkd-ln bkd-sum"><span>Total paid</span><b>${money(b.total)}</b></div></section>
      ${lateBlock(b)}
      <div class="bkd-ft">${c.email ? `<a class="ac-b g" href="mailto:${esc(c.email)}?subject=${encodeURIComponent('Your booking ' + b.id)}">Email customer</a>` : ''}<button type="button" class="ac-b" onclick="this.closest('dialog').close()">Done</button></div></div>`;
    if (!dlg.open) dlg.showModal();
  }
  dlg.addEventListener('close', () => { dlg.className = ''; });
  // ---- Returns tab (id 'late'), Mira layout: sections list | cars in that section | dark card with the one thing to do.
  const whenTxt = d => new Date(d).toLocaleString('en-US', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
  const noteTxt = b => b.lateNote ? `Customer says: about ${HZ.mins(b.lateNote.mins)} late (told us ${new Date(b.lateNote.at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}).` : '';
  const RT_SECS = [['out', 'Overdue now', 'Cars past their return time, with the late fee so far.', 'No cars are overdue. Nothing to do here.'],
    ['soon', 'Coming back soon', 'Due back in the next 24 hours, or the customer said they are running late.', 'No returns due in the next 24 hours.'],
    ['done', 'Recent late fees', 'Returns that were charged a fee or changed by you.', 'No late fees yet.']];
  const rt = { sec: null, sel: null };
  function rtData() {
    const all = HZ.bookings(), now = new Date();
    return { out: all.filter(b => { const l = HZ.lateInfo(b); return l && !l.final; }).sort((a, b) => HZ.ends(a) - HZ.ends(b)),
      soon: all.filter(b => b.status === 'confirmed' && !b.late && HZ.ends(b) > now && HZ.starts(b) <= now && (HZ.ends(b) - now < 864e5 || b.lateNote)).sort((a, b) => HZ.ends(a) - HZ.ends(b)),
      done: all.filter(b => b.late && (b.late.fee > 0 || b.late.manual)).sort((a, b) => new Date(b.late.returnedAt) - new Date(a.late.returnedAt)).slice(0, 12) };
  }
  const bigNum = (t, lbl) => `<div class="mr-big" style="--n:${Math.max(6, String(t).replace(/<[^>]*>/g, '').length)}">${t}</div><p class="rt-lbl">${lbl}</p>`;
  function rtRow(b, sec, sel) {
    const l = sec === 'out' ? HZ.lateInfo(b) : null, nm = (b.customer && b.customer.name) || 'Guest', ini = esc(nm.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?');
    const mid = sec === 'out' ? `${lateWord(l.over)} late · was due ${whenTxt(HZ.ends(b))}` : sec === 'soon' ? `Due ${whenTxt(HZ.ends(b))}` : `${lateWord(b.late.over)} late · back ${whenTxt(b.late.returnedAt)}`;
    const end = sec === 'out' ? (l.fee > 0 ? money(l.fee) : 'No fee yet') : sec === 'done' ? (b.late.fee > 0 ? money(b.late.fee) : 'Waived') : '';
    return `<button type="button" class="rt-row${sec === 'out' ? ' bad' : ''}${sel && b.id === sel.id ? ' sel' : ''}" data-rtpick="${esc(b.id)}" aria-pressed="${!!sel && b.id === sel.id}"><span class="rt-av">${ini}</span><span class="rt-who"><b>${esc(nm)}</b><small>${esc(b.car)} · ${esc(b.id)}</small></span><span class="rt-mid">${esc(mid)}</span><em>${end}</em></button>`;
  }
  function rtDetail(b, sec) {
    if (!b) return `<div class="mr-ch"><div><h2>Nothing to show</h2><p>Pick a booking to see what to do next.</p></div></div>`;
    const cu = b.customer || {}, who = `<b>${esc(cu.name || 'Guest')}</b>${cu.email ? ' · ' + esc(cu.email) : ''}<br>${route(b)} · ${esc(b.id)}${noteTxt(b) ? '<br>' + esc(noteTxt(b)) : ''}`;
    const open = (txt) => `<div class="bk-act"><button type="button" class="mr-input" data-view><span>${txt}</span><i>${arrowI}</i></button></div>`;
    let tag, big, bar, axis, extra = '', actions;
    if (sec === 'out') {
      const l = HZ.lateInfo(b) || { over: 0, fee: 0 };
      tag = '<span class="mr-tag low">Overdue</span>'; big = bigNum(lateWord(l.over), 'late so far'); bar = ticks(Math.min(1, l.over / 24), 30);
      axis = `<span>Was due ${esc(whenTxt(HZ.ends(b)))}</span><span>${l.fee > 0 ? 'Fee ' + money(l.fee) : 'No fee yet'}</span>`;
      extra = l.fee > 0 ? '<div class="bk-st"><button type="button" data-late-free>Back · waive fee</button></div>' : '';
      actions = `<div class="bk-act"><button type="button" class="mr-input" data-late-now><span>Car is back${l.fee > 0 ? ' · charge ' + money(l.fee) : ''}</span><i>${arrowI}</i></button>${ib('eye', 'Open booking (set another return time)', 'data-view')}</div>`;
    } else if (sec === 'soon') {
      const m = Math.max(0, Math.round((HZ.ends(b) - new Date()) / 6e4));
      tag = '<span class="mr-tag glass">Due back</span>'; big = bigNum(HZ.mins(m) || '0 min', 'until it is due'); bar = ticks(1 - Math.min(1, m / 1440), 30);
      axis = `<span>Due ${esc(whenTxt(HZ.ends(b)))}</span><span>Free until ${esc(whenTxt(HZ.freeUntil(b)))}</span>`; actions = open('Open booking');
    } else {
      tag = '<span class="mr-tag completed">Returned</span>'; big = bigNum(b.late.fee > 0 ? money(b.late.fee) : 'Waived', `${lateWord(b.late.over)} late`); bar = ticks(Math.min(1, b.late.over / 24), 30);
      axis = `<span>Was due ${esc(whenTxt(HZ.ends(b)))}</span><span>Back ${esc(whenTxt(b.late.returnedAt))}</span>`; actions = open('Change or waive the fee');
    }
    return `<div class="rt-d" data-id="${esc(b.id)}"><div class="mr-ch"><span class="mr-tag glass">${esc(b.mode || 'Booking')}</span>${tag}</div>
      <h2 class="bk-title">${esc(b.car)}</h2>${big}${bar}<div class="mr-axis">${axis}</div>
      <p class="bk-note">${who}</p>${extra}${actions}</div>`;
  }
  function rtView() {
    const d = rtData(), sec = rt.sec || RT_SECS.map(x => x[0]).find(k => d[k].length) || 'out', list = d[sec], sel = list.find(b => b.id === rt.sel) || list[0] || null, meta = RT_SECS.find(x => x[0] === sec);
    rt.sel = sel ? sel.id : null;
    return { side: RT_SECS.map(x => `<button type="button" class="mr-cat${x[0] === sec ? ' on' : ''}" data-rtsec="${x[0]}"><span>${x[1]}</span><em>${x[0] === 'out' && d.out.length ? '<i></i>' : ''}${d[x[0]].length}</em></button>`).join(''),
      main: `<div class="mr-ch"><div><h2>${meta[1]}</h2><p>${meta[2]}</p></div><span class="mr-tag ${sec === 'out' && list.length ? 'low' : 'hi'}">${list.length}</span></div>
        ${list.length ? `<div class="rt-list">${list.map(b => rtRow(b, sec, sel)).join('')}</div>` : `<p class="mr-none">${meta[3]}</p>`}`,
      detail: rtDetail(sel, sec) };
  }
  function refreshRt() { const v = rtView(); $('#rtSide').innerHTML = v.side; $('#rtMain').innerHTML = v.main; $('#rtDetail').innerHTML = v.detail; }
  function lateTab() {
    const P = HZ.latePolicy(), v = rtView();
    const rule = `<div class="rt-box"><b>${P.on ? `Late fees are on <small>(${P.mode === 'flat' ? 'Flat rate' : 'Fine-tune it'})</small> ${ib('eye', 'View fee list', 'data-late-view="saved"')}` : 'Late fees are off'}</b><span>${P.on ? HZ.lateSummary(money) : 'Cars can come back late at no charge.'}${P.on && (P.rules || []).length ? ` <i>${P.rules.length} special rule${P.rules.length === 1 ? '' : 's'} apply.</i>` : ''}</span><button type="button" class="mr-more" data-go="pricing:late">Change the rule</button></div>`;
    return `<div class="mr-bk mr-rt">
      <aside class="mr-card mr-side"><div class="mr-sh">Returns</div><div id="rtSide">${v.side}</div>${rule}</aside>
      <section class="mr-card mr-mid" id="rtMain">${v.main}</section>
      <aside class="mr-card dark mr-detail" id="rtDetail">${v.detail}</aside></div>`;
  }
  app.addEventListener('click', e => {
    const s = e.target.closest('[data-rtsec]'); if (s) { rt.sec = s.dataset.rtsec; rt.sel = null; refreshRt(); return; }
    const r = e.target.closest('[data-rtpick]'); if (r) { rt.sel = r.dataset.rtpick; refreshRt(); if (innerWidth <= 1280) $('#rtDetail').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
  });
  // ---- Late return block inside the booking dialog: when the car is due, when it came back, the fee, and a form to record the return or change the fee.
  const lateWord = h => { const m = Math.round(h * 60); return m <= 0 ? 'On time' : HZ.mins(m); };
  const lateText = c => c.fee > 0 ? `Late fee <b>${money(c.fee)}</b> (${lateWord(c.over)} late)` : c.over > 0 ? 'Inside the free grace period. No fee.' : 'On time. No fee.';
  const localInput = d => { const x = new Date(d.getTime() - d.getTimezoneOffset() * 6e4); return x.toISOString().slice(0, 16); };
  function lateBlock(b) {
    const l = HZ.lateInfo(b), canRecord = !b.late && ['confirmed', 'completed'].includes(b.status) && HZ.starts(b) <= new Date();
    if (!l && !canRecord) return '';
    if (!l && !HZ.latePolicy().on) return '';
    const ln = (k, v, x = '') => `<div class="bkd-ln${x}"><span>${k}</span><b>${v}</b></div>`;
    let tag = '', h = ln('Due back', `${fdate(b.to)}, ${esc(b.tt)}`);
    if (b.late) {
      tag = `<span class="mr-tag ${b.late.fee > 0 ? 'hi' : 'glass'}">${b.late.fee > 0 ? 'Returned late' : 'Returned on time'}</span>`;
      h += ln('Returned', new Date(b.late.returnedAt).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }))
        + ln('Time late', lateWord(b.late.over))
        + ln(`Late fee${b.late.manual ? ' (changed by you)' : ''}`, b.late.fee > 0 ? money(b.late.fee) : 'None')
        + `<form class="bkd-form" data-late-fee data-id="${esc(b.id)}" novalidate><div class="ac-f"><label for="lateAmt">Change the fee, ${esc(HZC.base())}</label><input id="lateAmt" name="amt" type="number" min="0" step="any" value="${esc(dealShow(b.late.fee))}"></div>
          <div class="bkd-btns"><button class="ac-b sm">Save fee</button>${b.late.fee > 0 ? '<button type="button" class="ac-b g sm" data-late-waive>Waive fee</button>' : ''}</div></form>`
        + `<div class="bkd-ln bkd-sum"><span>Total with late fee</span><b>${money(b.total + b.late.fee)}</b></div>`;
    } else {
      if (l && !l.final) { tag = '<span class="mr-tag bad">Not returned</span>'; h += ln('Status', `<span class="bkd-bad">Not returned · ${lateWord(l.over)} late</span>`) + ln('Late fee so far', l.fee > 0 ? money(l.fee) : 'None yet'); }
      const est = HZ.lateCalc(b, new Date());
      h += `<form class="bkd-form" data-late-rec data-id="${esc(b.id)}" novalidate><div class="ac-f"><label for="lateWhen">The car came back on</label><input id="lateWhen" name="when" type="datetime-local" value="${localInput(new Date())}"></div>
        <p class="bkd-est${est.fee > 0 ? ' warn' : ''}" id="lateEst">${lateText(est)}</p>
        <div class="bkd-btns"><button class="ac-b sm">Record return</button><small>Marks the booking completed and saves the fee.</small></div></form>`;
    }
    return `<section class="bkd-sec bkd-ret"><div class="bkd-sh"><h4>Return</h4>${tag}</div>${h}</section>`;
  }
  const lateDo = (id, fn, m) => { act(() => { fn(); flash = { ok: true, m }; }); view(id); };
  dlg.addEventListener('submit', e => {
    const fm = e.target; if (!fm.matches || !(fm.matches('[data-late-rec]') || fm.matches('[data-late-fee]'))) return;
    e.preventDefault(); const id = fm.dataset.id;
    if (fm.matches('[data-late-rec]')) return lateDo(id, () => HZ.markReturned(id, fm.elements.when.value), `${id} recorded as returned.`);
    const v = fm.elements.amt.value.trim(); lateDo(id, () => { if (v === '' || !(Number(v) >= 0)) throw Object.assign(new Error('Enter a fee of 0 or more.'), { user: true }); HZ.setLateFee(id, dealUsd(Number(v))); }, 'Late fee updated.');
  });
  dlg.addEventListener('click', e => { const w = e.target.closest('[data-late-waive]'); if (!w) return; const id = w.closest('form').dataset.id; lateDo(id, () => HZ.setLateFee(id, 0), 'Late fee waived.'); });
  dlg.addEventListener('input', e => {
    if (!e.target.matches || !e.target.matches('#lateWhen')) return;
    const b = HZ.bookings().find(x => x.id === e.target.form.dataset.id), d = new Date(e.target.value), out = $('#lateEst'); if (b && out) { const c = isNaN(d) ? null : HZ.lateCalc(b, d); out.innerHTML = c ? lateText(c) : ''; out.classList.toggle('warn', !!c && c.fee > 0); }
  });
  setInterval(() => { if (tab === 'settings' && setSec === 'admins' && !unlockedNow() && !$('#apw')) render(); }, 30000);
  document.addEventListener('change', e => {
    if (!e.target.matches || !e.target.matches('[data-c=oneWay]')) return;
    const box = e.target.closest('.ac-rtc'), list = box && box.querySelector('.ac-rt-off, .ac-rt-h') && box.children[1], n = box ? box.querySelectorAll('.ac-rt[data-fi]').length : 0;
    if (list) list.classList.toggle('ac-rt-off', !e.target.checked);
    const sm = box && box.querySelector('.sw small'); if (sm) sm.textContent = e.target.checked ? `${n} ${n === 1 ? 'route' : 'routes'}` : 'off: every car goes back to its pick-up city';
  });
  window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (h !== tab && TABS.some(t => t[0] === h)) { ed = null; ced = null; dd = null; tab = h; render(); } });
  render();
})();

// Admin bar: show its background only after the page has scrolled.
addEventListener('scroll', () => { const b = document.querySelector('.mr-bar'); if (b) b.classList.toggle('stuck', scrollY > 24); }, { passive: true });
