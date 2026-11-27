// The currency grid inside the header dropdown. Load after layout/header.js and components/dropdown.js.
(function () {
  const menu = document.querySelector('.curs'); if (!menu) return;
  menu.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    HZC.set(b.dataset.c);
    document.getElementById('curLabel').textContent = HZC.cur();
    menu.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
    closeDropdowns();
  });
})();
