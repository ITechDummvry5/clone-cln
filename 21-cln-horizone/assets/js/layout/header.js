// Site header (logo, nav, search/currency/account/menu buttons). Replaces <div id="site-header">.
// Needs: core/config.js, core/icons.js, core/utils.js, core/currency.js, services/auth.js
(function () {
  const page = document.body.dataset.page || 'home';
  const acct = HZ.current();   // signed-in user or null (services/auth.js)
  const acctBtn = acct
    ? `<div class="dd"><button class="tbtn acct" data-dd="acct" aria-label="Account menu" aria-expanded="false"><span class="av">${esc(acct.name.trim()[0] || '?').toUpperCase()}</span><b>${esc(acct.name.trim().split(' ')[0])}</b>${ICON.chev}</button>
          <div class="panel acctp" id="dd-acct" hidden>
            <div class="ah"><span class="av lg">${esc(acct.name.trim()[0] || '?').toUpperCase()}</span><div class="ai"><h3>${esc(acct.name)}</h3><p class="who">${esc(acct.email)}</p>${acct.role === 'admin' ? '<span class="role">Admin</span>' : ''}</div></div>
            <div class="ml">
              <a class="m" href="account.html"><i>${ICON.bookings}</i><span>My bookings</span></a>
              ${acct.role === 'admin' ? `<a class="m" href="admin.html"><i>${ICON.admin}</i><span>Admin panel</span></a>` : ''}
            </div>
            <div class="ml sep"><button class="m out" id="signOut" type="button"><i>${ICON.signout}</i><span>Sign out</span></button></div></div></div>`
    : `<a class="tbtn acct" href="login.html">${ICON.user}<b>Sign in</b></a>`;
  const mode = document.body.dataset.nav === 'dark' ? ' dark' : '';

  const header = document.getElementById('site-header');
  if (header) header.outerHTML = `
    <header class="nav${mode}"><div class="wrap">
      <a class="logo" href="index.html">${HZ.brand().logo ? `<img class="logo-img" src="${esc(HZ.brand().logo)}" alt="">` : '<i></i>'}${esc(HZ.brand().name)}</a>
      <nav class="pill" aria-label="Main">
        ${SITE.nav.map(n => `<a${n.id === page ? ' class="on" aria-current="page"' : ''} href="${n.href}">${n.label}</a>`).join('')}
      </nav>
      <div class="tools">
        <div class="dd"><button class="tbtn round" data-dd="search" aria-label="Search pick-up location" aria-expanded="false">${ICON.search}</button>
          <div class="panel" id="dd-search" hidden><h3>Where are you picking up?</h3><p>${SITE.cities.length ? `${SITE.cities.length} cit${SITE.cities.length === 1 ? 'y' : 'ies'} · ${SITE.cities.length * 2} airport, station and city desks. Pick one to see what’s available.` : 'No locations yet. Check back soon.'}</p>
            <div class="cities">${SITE.cities.map(c => `<a href="cars.html?pickup=${encodeURIComponent(c)}">${ICON.pin}${c}</a>`).join('')}</div></div></div>
        <div class="dd"><button class="tbtn" data-dd="cur" aria-label="Currency" aria-expanded="false">${ICON.globe}<b id="curLabel">${HZC.cur()}</b>${ICON.chev}</button>
          <div class="panel wide" id="dd-cur" hidden><h4>Currency</h4>
            <div class="curs">${SITE.currencies.map(c => `<button data-c="${c[0]}" class="${c[0] === HZC.cur() ? 'on' : ''}"><b>${c[0]}</b><span>${c[1]}</span></button>`).join('')}</div>
            <p>Prices convert at indicative rates. Bookings are billed in ${esc(HZC.baseName())}.</p></div></div>
        ${acctBtn}
        <div class="dd burger"><button class="tbtn round" data-dd="menu" aria-label="Menu" aria-expanded="false">${ICON.menu}</button>
          <div class="panel" id="dd-menu" hidden>${SITE.nav.map(n => `<a class="m" href="${n.href}">${n.label}</a>`).join('')}${acct ? '' : '<a class="m" href="login.html">Sign in</a>'}</div></div>
      </div>
    </div></header>`;

  document.getElementById('signOut')?.addEventListener('click', () => { HZ.signOut(); location.href = 'index.html'; });
})();
