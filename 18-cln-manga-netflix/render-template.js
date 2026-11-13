/* render-template.js
 * Shared site chrome for Kap Manga: the NAV and the FOOTER live here, separate
 * from the page scripts. Every page loads this file before its own script:
 *
 *   <script src="render-template.js"></script>
 *
 * Styling lives in ONE file, kap.css (tokens + all shared CSS). Pages link it
 * in <head>; if a page forgets, this script adds the link itself, so the nav
 * and footer are never unstyled.
 *
 * Both renderers are pure: they take plain data and return an HTML string, so
 * a page decides when and where to insert them.
 *
 *   KapTemplate.renderNav(opts)     -> '<nav>…</nav>'
 *   KapTemplate.renderFooter(opts)  -> '<footer class="fx">…</footer>'
 *   KapTemplate.mountNav(el, opts)  -> fills an element with the nav
 *   KapTemplate.mountFooter(el, o)  -> fills an element with the footer
 *   KapTemplate.autoMount(opts)     -> fills [data-kap-nav] / [data-kap-footer]
 *
 * Everything below in CONFIG and LINKS is data. Edit it once, every page follows.
 * You can also override CONFIG per site before this script loads:
 *   <script>window.KAP_SITE = { name: 'My Site' }</script>
 */
(function (root) {
  'use strict';

  const TYPES = ['Manga', 'Manhwa', 'Manhua', 'One Shot'];

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

  /* ---------- site config (edit text here, once) ---------- */
  const CONFIG = Object.assign({
    name: 'Kap Manga',
    tagline: 'Your home for manga, manhwa, manhua and one shots. Browse, discover and read your favorite series in one clean place.',
    disclaimer: 'Kap Manga is an index of titles, images and links added by the site owner. All titles, characters and artwork are the property of their respective owners and creators.',
    language: 'English (US)',
    logo: 'favicon.png',   /* if the file is missing, the orange "K" box stays */
    css: 'kap.css'         /* the one shared stylesheet (tokens + all UI) */
  }, root.KAP_SITE || {});

  /* ---------- link data (edit links here, once) ---------- */
  const LINKS = {
    home: 'index.html',
    github: 'https://github.com/ITechDummvry5',
    admin: 'admin.html',
    library: [
      ['Admin panel', 'admin.html'],
      ['Import / Export', 'admin.html'],
      ['Add a title', 'admin.html']
    ],
    support: [
      ['Get help', 'help.html'],
      ['Contact us', 'contact.html'],
      ['Report an issue', 'report.html']
    ],
    legal: [
      ['Terms of Service', 'terms.html'],
      ['Privacy Policy', 'privacy.html'],
      ['DMCA', 'dmca.html'],
      ['Cookie Settings', 'cookies.html']
    ]
  };

  const GITHUB_ICON =
    '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">' +
    '<path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.76 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/></svg>';

  /* Logo mark: shows the logo file. If it is missing, the orange "K" box stays. */
  const LOGO_MARK =
    `<i>K<img src="${esc(CONFIG.logo)}" alt="" width="44" height="44" decoding="async" ` +
    `onload="this.parentNode.classList.add('im')" onerror="this.remove()"></i>`;

  const JSON_ICON =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1"/>' +
    '<path d="M16 3h1a2 2 0 0 1 2 2v5a2 2 0 0 0 2 2 2 2 0 0 0-2 2v5a2 2 0 0 1-2 2h-1"/></svg>';

  /* ---------- STYLES ----------
   * All CSS (including the nav colors, now tokens like --nav-bg) lives in
   * kap.css. Pages already link it in <head>. If a page does not, add the link
   * here, resolved next to this script so it works from any folder.
   */
  (function ensureStyles() {
    const has = [].some.call(
      document.querySelectorAll('link[rel="stylesheet"]'),
      l => /(^|\/)kap\.css(\?|#|$)/.test(l.getAttribute('href') || '')
    );
    if (has) return;
    const src = document.currentScript && document.currentScript.src;
    const base = src ? src.replace(/[^/?#]*([?#].*)?$/, '') : '';
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = base + CONFIG.css;
    document.head.appendChild(l);
  })();

  /* Favicon: pages declare it in <head>; if one does not, add it from CONFIG.logo. */
  (function ensureFavicon() {
    if (document.querySelector('link[rel~="icon"]')) return;
    const l = document.createElement('link');
    l.rel = 'icon';
    l.href = CONFIG.logo;
    document.head.appendChild(l);
  })();

  /* Current page file name, used to mark the matching footer link. */
  const here = () => {
    const p = (location.pathname || '').split('/').pop();
    return p || LINKS.home;
  };
  const cur = href => href === here() ? ' aria-current="page"' : '';

  /* ---------- NAV ----------
   * opts.types        array of type names           (default: the four types)
   * opts.filter       active tab, 'All' or a type   (default: 'All')
   * opts.q            current search text           (default: '')
   * opts.jsonMaker    show the JSON-maker button    (default: false)
   * opts.jsonMakerOn  JSON maker is the open view   (default: false)
   */
  function renderNav(opts) {
    const o = opts || {};
    const types = o.types || TYPES;
    const filter = o.filter || 'All';
    const q = o.q || '';
    const jmOn = !!o.jsonMakerOn;

    const tabs = ['All'].concat(types).map(t =>
      `<button data-act="tab" data-t="${esc(t)}" class="${filter === t && !jmOn ? 'on' : ''}">${t === 'All' ? 'Home' : esc(t)}</button>`
    ).join('');

    const search = `<input type="text" id="q" placeholder="Search…" value="${esc(q)}">`;

    const jm = o.jsonMaker
      ? `<button data-act="jm" class="${jmOn ? 'on' : ''}" title="JSON maker: make a JSON import file from your Comix export" aria-label="JSON maker">${JSON_ICON}</button>`
      : '';

    const gear = '<button data-act="admin" title="Admin">⚙</button>';

    return `<nav><a class="logo" href="${LINKS.home}">${LOGO_MARK}<span class="lt">${esc(CONFIG.name)}</span></a>` +
      `<div class="tabs">${tabs}${search}${jm}${gear}</div></nav>`;
  }

  /* ---------- FOOTER ----------
   * opts.types       array of type names            (default: the four types)
   * opts.titles      number of titles to show       (default: 0)
   * opts.chapters    number of chapters to show     (default: 0)
   * opts.jsonMaker   show the "JSON maker" link     (default: false)
   * opts.year        copyright year                 (default: the current year)
   */
  function renderFooter(opts) {
    const o = opts || {};
    const types = o.types || TYPES;
    const n = o.titles || 0;
    const c = o.chapters || 0;
    const year = o.year || new Date().getFullYear();

    const col = (title, items) =>
      `<div><h5>${title}</h5>${items.map(([label, href]) => `<a href="${href}"${cur(href)}>${label}</a>`).join('')}</div>`;

    const browse = `<div><h5>Browse</h5><a data-act="tab" data-t="All">Home</a>` +
      types.map(t => `<a data-act="tab" data-t="${esc(t)}">${esc(t)}</a>`).join('') + `</div>`;

    const lib = LINKS.library.slice();
    const library = o.jsonMaker
      ? `<div><h5>Library</h5>` +
        `<a href="${lib[0][1]}">${lib[0][0]}</a><a data-act="jm">JSON maker</a>` +
        lib.slice(1).map(([l, h]) => `<a href="${h}">${l}</a>`).join('') + `</div>`
      : col('Library', lib);

    return `<footer class="fx"><div class="fi"><div class="fg">` +
      `<div class="fb"><a class="logo" href="${LINKS.home}" data-top>${LOGO_MARK}${esc(CONFIG.name)}</a>` +
      `<p>${esc(CONFIG.tagline)}</p>` +
      `<div class="fs"><span><b>${n}</b>Titles</span><span><b>${c}</b>Chapters</span></div></div>` +
      browse + library + col('Support', LINKS.support) + col('Legal', LINKS.legal) +
      `</div>` +
      `<p class="fd">${esc(CONFIG.disclaimer)}</p>` +
      `<div class="fz"><div>© ${year} ${esc(CONFIG.name)}. All rights reserved.</div>` +
      `<div><a class="gh" href="${LINKS.github}" target="_blank" rel="noopener noreferrer" aria-label="GitHub">${GITHUB_ICON}<span>GitHub</span></a>` +
      `<a>${esc(CONFIG.language)}</a><a data-top>↑ Back to top</a></div></div>` +
      `</div></footer>`;
  }

  /* ---------- optional helpers ---------- */
  const mount = (el, html) => {
    const t = typeof el === 'string' ? document.querySelector(el) : el;
    if (t) t.innerHTML = html;
    return t;
  };

  /* Fill any placeholder on the page without page code:
   *   <div data-kap-nav></div>   <div data-kap-footer></div>
   * opts = { nav: {...renderNav opts}, footer: {...renderFooter opts} } */
  function autoMount(opts) {
    const o = opts || {};
    document.querySelectorAll('[data-kap-nav]').forEach(el => mount(el, renderNav(o.nav)));
    document.querySelectorAll('[data-kap-footer]').forEach(el => mount(el, renderFooter(o.footer)));
  }

  root.KapTemplate = {
    TYPES, LINKS, CONFIG,
    renderNav, renderFooter,
    mountNav: (el, o) => mount(el, renderNav(o)),
    mountFooter: (el, o) => mount(el, renderFooter(o)),
    autoMount
  };
})(window);
