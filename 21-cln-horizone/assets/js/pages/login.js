(function () {
  const $ = id => document.getElementById(id);
  const P = new URLSearchParams(location.search);
  const next = HZ.safeNext(P.get('next'));
  hydrateImages();

  // A reservation started while signed out is finished right after sign-in.
  let draft = null; try { draft = JSON.parse(sessionStorage.getItem('hz-draft')); } catch (e) {}
  if (draft && draft.car) HZ.toast(`Sign in or create an account to finish reserving the ${draft.car}.`, 'info', 7000);

  function done() {
    if (draft && draft.car) {
      try { const b = HZ.addBooking(draft); sessionStorage.removeItem('hz-draft'); location.replace('account.html?new=' + b.id); return; } catch (e) { /* fall through */ }
    }
    const u = HZ.current();
    location.replace(next || (u && u.role === 'admin' ? 'admin.html' : 'account.html'));
  }
  if (HZ.current()) { done(); return; }

  function tab(up) {
    $('tIn').setAttribute('aria-selected', String(!up)); $('tUp').setAttribute('aria-selected', String(up));
    $('fIn').hidden = up; $('fUp').hidden = !up;
    $('auTitle').textContent = up ? 'Create your Horizone account' : 'Welcome back to Horizone';
    $('auSub').textContent = up ? 'Book faster and keep every trip in one place.' : 'Sign in to manage your bookings.';
    document.title = (up ? 'Sign up' : 'Sign in') + ' – Horizone';
    history.replaceState(null, '', up ? '#signup' : location.pathname + location.search);
  }
  $('tIn').onclick = () => tab(false); $('tUp').onclick = () => tab(true);
  document.querySelectorAll('[data-go]').forEach(b => b.onclick = () => { tab(b.dataset.go === 'up'); $(b.dataset.go === 'up' ? 'uName' : 'iEmail').focus(); });
  if (location.hash === '#signup') tab(true);

  document.querySelectorAll('[data-show]').forEach(b => b.onclick = () => {
    const i = $(b.dataset.show), show = i.type === 'password'; i.type = show ? 'text' : 'password'; b.classList.toggle('on', show); b.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  });
  const err = (id, m) => { if (m) HZ.toast(m, 'err'); };
  async function run(btn, errId, fn) {
    err(errId, ''); btn.disabled = true;
    try { await fn(); done(); } catch (e) { err(errId, e.user ? e.message : 'Something went wrong. Please try again.'); if (!e.user) console.error(e); }
    btn.disabled = false;
  }
  $('fIn').onsubmit = e => { e.preventDefault(); run($('bIn'), 'eIn', () => HZ.signIn($('iEmail').value, $('iPw').value)); };
  $('fUp').onsubmit = e => {
    e.preventDefault();
    if ($('uPw').value !== $('uPw2').value) return err('eUp', 'The two passwords do not match.');
    run($('bUp'), 'eUp', () => HZ.signUp({ name: $('uName').value, email: $('uEmail').value, phone: $('uPhone').value, password: $('uPw').value }));
  };
})();
