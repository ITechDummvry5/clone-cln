// Footer newsletter form (#subForm, rendered by layout/footer.js): validate, remember the address in this browser, confirm.
(function () {
  const form = document.getElementById('subForm'); if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const inp = form.querySelector('input'), note = document.getElementById('subNote'), v = inp.value.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { note.textContent = 'Enter a valid email address.'; note.style.color = '#ff8a80'; inp.focus(); return; }
    const list = HZStore.get('hz-subs', []), dup = list.includes(v);
    if (!dup) HZStore.set('hz-subs', [...list, v]);
    note.textContent = dup ? 'You’re already on the list.' : 'Thanks, you’re subscribed.'; note.style.color = '#8be3a0'; inp.value = '';
  });
})();
