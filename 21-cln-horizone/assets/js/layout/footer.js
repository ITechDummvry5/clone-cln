// Site footer. Replaces <div id="site-footer">. The newsletter form is wired by components/newsletter.js.
// Needs: core/config.js
(function () {
  const footer = document.getElementById('site-footer');
  if (footer) footer.outerHTML = `
    <footer><div class="wrap">
      <div class="cols">
        <div><a class="logo" href="index.html">${HZ.brand().logo ? `<img class="logo-img" src="${esc(HZ.brand().logo)}" alt="">` : '<i></i>'}${esc(HZ.brand().name)}</a><p style="margin-top:14px;max-width:280px">${SITE.tagline}</p></div>
        ${SITE.footer.map(c => `<div><h4>${c.title}</h4><ul>${c.links.map(l => `<li><a href="${l[1]}">${l[0]}</a></li>`).join('')}</ul></div>`).join('')}
        <div><h4>Get updates</h4>
          <form class="sub-form" id="subForm" novalidate><input type="email" placeholder="Enter your email" aria-label="Email" autocomplete="email"><button>Subscribe</button></form>
          <p id="subNote" role="status" style="margin-top:10px;font-size:12px">Route ideas and price drops. Two emails a month, no more.</p></div>
      </div>
      <div class="legal"><span>© ${new Date().getFullYear()} ${esc(HZ.brand().name)}${HZ.brand().rawName ? '' : ' Car Rental'}</span><span>${SITE.legal.join(' · ')}</span></div>
    </div></footer>`;
})();
