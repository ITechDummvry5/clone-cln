(function () {
  const me0 = HZ.guard(); if (!me0) return;
  const { esc, money, fdate } = HZ;
  const $ = (s, r) => (r || document).querySelector(s);
  const app = $('#app');
  const P = new URLSearchParams(location.search);
  let tab = ['bookings', 'profile', 'security'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'bookings';
  let flash = P.get('new') ? { ok: true, m: `Reservation request ${P.get('new')} received. We’ll confirm it shortly. You can follow its status below.` } : null;

  const me = () => HZ.current();
  const msg = (el, m, ok) => { if (m) HZ.toast(m, ok ? 'ok' : 'err'); };
  const pill = s => `<span class="ac-pill ${esc(s)}">${esc(s)}</span>`;

  // Customers rate a car after the trip: 1 to 5 stars and an optional comment, once per booking.
  const stars = n => '★'.repeat(n) + '☆'.repeat(5 - n);
  function rateBtn(b) {
    const r = HZFLEET.reviewFor(b.id);
    if (r) return `<small class="rated">You rated this trip ${stars(r.stars)}</small>${r.text ? `<small class="rated" style="display:block;margin-top:4px;white-space:pre-wrap">“${esc(r.text)}”</small>` : ''}`;
    return HZFLEET.canReview(b) ? '<button class="ac-b g sm" data-rate>Rate this trip</button>' : '';
  }
  // ---- Late returns, in plain words. Three states: handed back late (fee added), overdue right now, and "on the road" (a way to warn the desk).
  const CHIPS = [30, 60, 120, 180, 360, 720, 1440, 2880];
  const asOf = d => new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  function lateBlock(b, li) {
    const P = HZ.policyFor(b);
    if (li && li.final) return li.fee > 0 ? `<div class="late-card info"><b>Late return fee: ${HZ.money(li.fee)}</b><span>The car came back ${HZ.mins(li.over * 60)} after the return time.</span></div>` : '';
    if (li) {   // overdue right now
      const left = li.fee;
      const grows = P.on && +P.rate > 0 ? `The fee goes up by ${HZ.money(P.rate)} each hour${+P.cap > 0 ? `, up to ${HZ.money(P.cap)} for each day` : ''}.` : '';
      return `<div class="late-card bad" role="alert"><b>Your car is ${HZ.mins(li.over * 60)} overdue</b>
        <span>${li.fee > 0 ? `Late fee so far: <b>${HZ.money(left)}</b>. ` : 'You are still inside the free grace period. '}${grows}</span>
        <span>Please bring it back as soon as you can, or tell us when you will arrive.</span>${lateChips(b)}</div>`;
    }
    if (b.status === 'confirmed' && !b.late && HZ.starts(b) <= new Date() && HZ.ends(b) > new Date() && P.on)
      return `<div class="late-card ok"><b>Return by ${HZ.fdate(b.to)}, ${esc(b.tt)}</b><span>${esc(HZ.lateSummary(v => HZC.txt(v, 2), P))} ${HZ.eyeBtn(`data-late-list data-late-booking="${esc(b.id)}"`)}</span>${lateChips(b)}</div>`;
    return '';
  }
  // "Running late?" quick buttons. Each shows what that delay would cost, so there are no surprises.
  function lateChips(b) {
    const n = b.lateNote, P = HZ.policyFor(b);
    const cost = m => { const f = HZ.lateFee(Math.max(0, (new Date(HZ.ends(b).getTime() + m * 6e4) - HZ.ends(b)) / 6e4), P); return f > 0 ? HZ.money(f) : 'Free'; };
    const done = n ? `<span class="late-sent">✓ You told us you would be about <b>${HZ.mins(n.mins)}</b> late (${asOf(n.at)}).</span>` : '';
    return `<div class="late-ask"><span class="q">${n ? 'Change your estimate' : 'Running late? Tell us by how much:'}</span><div class="late-chips">${CHIPS.map(m => `<button type="button" class="late-chip${n && n.mins === m ? ' on' : ''}" data-late-say="${m}"><b>${HZ.mins(m)}</b><small>${cost(m)}</small></button>`).join('')}</div>${done}</div>`;
  }
  function bookingCard(b) {
    const live = ['pending', 'confirmed'].includes(b.status) && HZ.ends(b) > new Date();
    const li = HZ.lateInfo(b);
    const lateMsg = lateBlock(b, li);
    const route = b.ret && b.ret !== b.pickup ? `${esc(b.pickup)} → ${esc(b.ret)}` : esc(b.pickup);
    return `<article class="bk" data-id="${esc(b.id)}">
      <div class="pic">${IMG.fleet[b.car] ? `<img src="${IMG.fleet[b.car]}" alt="" loading="lazy">` : ''}</div>
      <div><span class="id">${esc(b.id)} ${pill(b.status)}</span><h3>${esc(b.car)}</h3>
        <small>${route} · ${esc(b.mode)}</small>
        <small>${fdate(b.from)}, ${esc(b.ft)} → ${fdate(b.to)}, ${esc(b.tt)} · ${b.days} day${b.days === 1 ? '' : 's'}</small>
        ${lateMsg}
        <details><summary>Price details</summary>${(b.lines || []).map(l => `<div class="ln"><span>${HZC.inText(esc(l[0]))}</span><span>${money(l[1])}</span></div>`).join('')}${li && li.final && li.fee > 0 ? `<div class="ln"><span>Late return fee</span><span>${money(li.fee)}</span></div>` : ''}</details></div>
      <div class="end"><b>${money(b.total + (li && li.final ? li.fee : 0))}</b>${live ? '<button class="ac-b d sm" data-cancel>Cancel</button>' : ''}${rateBtn(b)}</div>
    </article>`;
  }

  function bookingsTab() {
    const all = HZ.mine(me().id).sort((a, b) => HZ.starts(b) - HZ.starts(a));
    const up = all.filter(b => ['pending', 'confirmed'].includes(b.status) && (HZ.ends(b) > new Date() || (HZ.lateInfo(b) && !HZ.lateInfo(b).final))).reverse();
    const past = all.filter(b => !up.includes(b));
    if (!all.length) return `<div class="ac-empty"><h3>No bookings yet</h3><p>When you reserve a car it shows up here.</p><a class="btn" href="cars.html">Browse cars</a></div>`;
    return `<h2 style="font-size:20px;margin-bottom:12px">Upcoming</h2><div class="ac-list" style="margin-bottom:28px">${up.length ? up.map(bookingCard).join('') : '<p class="sub">Nothing upcoming.</p>'}</div>
      <h2 style="font-size:20px;margin-bottom:12px">Past &amp; cancelled</h2><div class="ac-list">${past.length ? past.map(bookingCard).join('') : '<p class="sub">Nothing here yet.</p>'}</div>`;
  }
  const profileTab = () => { const u = me(); return `<div class="ac-card" style="max-width:560px"><h2>Your details</h2><p class="s">Used on bookings and at the desk.</p>
    <form id="fProf" novalidate><div class="ac-msg" id="mProf" role="status"></div>
      <div class="ac-f"><label for="pName">Full name</label><input id="pName" value="${esc(u.name)}" autocomplete="name"></div>
      <div class="ac-f"><label for="pEmail">Email</label><input id="pEmail" value="${esc(u.email)}" disabled><small>Email can’t be changed in this prototype.</small></div>
      <div class="ac-f"><label for="pPhone">Phone</label><input id="pPhone" type="tel" value="${esc(u.phone || '')}" autocomplete="tel"></div>
      <button class="ac-b">Save changes</button></form></div>`; };
  const securityTab = () => `<div class="ac-cols"><div class="ac-card"><h2>Change password</h2><p class="s">Use at least 8 characters.</p>
      <form id="fPw" novalidate><div class="ac-msg" id="mPw" role="status"></div>
        <div class="ac-f"><label for="cOld">Current password</label><input id="cOld" type="password" autocomplete="current-password"></div>
        <div class="ac-f"><label for="cNew">New password</label><input id="cNew" type="password" autocomplete="new-password"></div>
        <button class="ac-b">Update password</button></form></div>
    <div class="ac-card w"><h2>Delete account</h2><p class="s">Removes your account and all your bookings from this browser. This can’t be undone.</p>
      <form id="fDel" novalidate><div class="ac-msg" id="mDel" role="alert"></div>
        <div class="ac-f"><label for="dPw">Confirm with your password</label><input id="dPw" type="password" autocomplete="current-password"></div>
        <button class="ac-b d">Delete my account</button></form></div></div>`;

  function render() {
    const u = me(); if (!u) return location.replace('login.html');
    app.innerHTML = `<div class="ac-top"><div><h1>Hi, ${esc(u.name.split(' ')[0])}</h1><p>${esc(u.email)}</p></div>
        <div class="chips">${u.role === 'admin' ? '<a class="btn ghost" href="admin.html">Admin panel</a>' : ''}<a class="btn" href="cars.html">Book a car</a></div></div>
      <div class="ac-tabs" role="tablist">${[['bookings', 'My bookings'], ['profile', 'Profile'], ['security', 'Security']].map(t => `<button role="tab" data-t="${t[0]}" aria-selected="${t[0] === tab}">${t[1]}</button>`).join('')}</div>
      <div id="pane">${tab === 'bookings' ? bookingsTab() : tab === 'profile' ? profileTab() : securityTab()}</div>`;
    if (flash) HZ.toast(flash.m, flash.ok ? 'ok' : 'err');
    flash = null;
  }

  app.addEventListener('click', e => {
    const t = e.target.closest('[data-t]');
    if (t) { tab = t.dataset.t; history.replaceState(null, '', '#' + tab); return render(); }
    const rt = e.target.closest('[data-rate]');
    if (rt) { const art = rt.closest('.bk'); if (art.querySelector('.rate')) return; rt.hidden = true;
      art.insertAdjacentHTML('beforeend', `<form class="rate" data-rate-form novalidate><b>How was ${esc(HZ.mine(me().id).find(x => x.id === art.dataset.id).car)}?</b>
        <div class="st" role="radiogroup" aria-label="Stars">${[1, 2, 3, 4, 5].map(n => `<button type="button" data-star="${n}" role="radio" aria-checked="false" aria-label="${n} star${n > 1 ? 's' : ''}">★</button>`).join('')}</div><input type="hidden" name="stars" value="">
        <label style="font-size:13px;font-weight:500">Your comment <span style="color:var(--mute);font-weight:400">(optional, shown on the car page)</span></label><textarea name="text" rows="3" maxlength="500" placeholder="Tell other guests about the trip: the car, the pick-up, anything that stood out."></textarea>
        <div style="display:flex;gap:8px"><button class="ac-b sm">Submit rating</button><button type="button" class="ac-b g sm" data-rate-cancel>Cancel</button></div></form>`); return; }
    if (e.target.closest('[data-rate-cancel]')) { const art = e.target.closest('.bk'); art.querySelector('.rate').remove(); art.querySelector('[data-rate]').hidden = false; return; }
    const sb = e.target.closest('[data-star]');
    if (sb) { const f = sb.closest('form'), n = +sb.dataset.star; f.elements.stars.value = n; f.querySelectorAll('[data-star]').forEach(x => { const on = +x.dataset.star <= n; x.classList.toggle('on', on); x.setAttribute('aria-checked', +x.dataset.star === n); }); return; }
    { const ls = e.target.closest('[data-late-say]');
      if (ls) { const id = ls.closest('.bk').dataset.id; try { HZ.notifyLate(id, +ls.dataset.lateSay); flash = { ok: true, m: 'Thanks, we have told the desk. The estimate above shows what it would cost.' }; } catch (err) { flash = { ok: false, m: err.message }; } render(); return; } }
    const c = e.target.closest('[data-cancel]');
    if (c) {
      const id = c.closest('.bk').dataset.id, b = HZ.mine(me().id).find(x => x.id === id); if (!b) return;
      const hrs = (HZ.starts(b) - new Date()) / 36e5;
      const warn = hrs < 48 ? '\n\nThis is inside 48 hours of pick-up, so the first day may be charged under the cancellation policy.' : '\n\nFree cancellation applies.';
      if (!confirm(`Cancel ${b.car} (${b.id})?${warn}`)) return;
      try { HZ.cancel(id); flash = { ok: true, m: `Booking ${id} cancelled.` }; } catch (err) { flash = { ok: false, m: err.message }; }
      render();
    }
  });
  app.addEventListener('submit', async e => {
    e.preventDefault();
    try {
      if (e.target.matches('[data-rate-form]')) { const f = e.target; HZFLEET.addReview({ booking: f.closest('.bk').dataset.id, stars: f.elements.stars.value, text: f.elements.text.value }); flash = { ok: true, m: 'Thanks for rating your trip.' }; return render(); }
      if (e.target.id === 'fProf') { HZ.updateProfile({ name: $('#pName').value, phone: $('#pPhone').value }); flash = { ok: true, m: 'Profile saved.' }; return render(); }
      if (e.target.id === 'fPw') { await HZ.changePassword($('#cOld').value, $('#cNew').value); tab = 'security'; flash = { ok: true, m: 'Password updated.' }; return render(); }
      if (e.target.id === 'fDel') {
        if (!confirm('Delete your account and all of your bookings? This cannot be undone.')) return;
        await HZ.deleteOwnAccount($('#dPw').value); location.replace('index.html');
      }
    } catch (err) {
      const id = { fProf: 'mProf', fPw: 'mPw', fDel: 'mDel' }[e.target.id];
      if (e.target.matches('[data-rate-form]')) return HZ.toast(err.user ? err.message : 'Something went wrong.', 'err');
      msg($('#' + id), err.user ? err.message : 'Something went wrong.', false); if (!err.user) console.error(err);
    }
  });
  render();
})();
