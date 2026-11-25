/* Shared components: nav, footer, CTA, FAQ + image renderer.
   Every page just has <div id="site-nav">, <div id="site-faq">, <div id="site-cta">, <div id="site-footer">. */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const money = n => "$ " + n.toLocaleString("en-US");

const ARROW = `<span class="ar">${ic("arrow-ur")}</span>`;
const LOGO = ic("logo");

/* Fill every <img data-img="key"> from an IMAGES_* map. Missing files hide cleanly. */
function renderImages(map, root = document) {
  $$("[data-img]", root).forEach(el => {
    const src = map && map[el.dataset.img];
    if (!src) { el.classList.add("img-missing"); return; }
    el.onerror = () => el.classList.add("img-missing");
    el.alt = el.alt || el.dataset.alt || "";
    el.src = src;
  });
}

function renderNav(active) {
  $("#site-nav").innerHTML = `<div class="wrap nav">
    <a class="logo" href="index.html">${LOGO}${SITE.name}</a>
    <nav class="nav-links" id="navLinks">${NAV_LINKS.map(l =>
      `<a href="${l.href}" class="${l.page && l.page === active ? "active" : ""}">${l.label}</a>`).join("")}</nav>
    <a class="btn btn-dark" href="index.html#contact"><span class="dot"></span>Contact Us Now${ARROW}</a>
    <button class="burger" aria-label="Menu" id="burger">${ic("menu")}</button></div>`;
  renderIcons($("#site-nav"));
  $("#burger").onclick = () => $("#navLinks").classList.toggle("open");
}

function renderFaq() {
  const el = $("#site-faq"); if (!el) return;
  el.innerHTML = `<section class="sec wrap"><div class="faq"><div><span class="pill">Help Center</span><h2 style="font-size:clamp(26px,2.6vw,34px)">Frequently asked questions</h2></div>
    <div>${FAQS.map(([q, a]) => `<div class="q"><button aria-expanded="false">${q}<span class="pl">${ic("plus")}</span></button><div class="a"><p>${a}</p></div></div>`).join("")}</div></div></section>`;
  renderIcons(el);
  $$(".q button", el).forEach(b => b.onclick = () => {
    const q = b.parentElement, open = q.classList.toggle("open"), a = $(".a", q);
    b.setAttribute("aria-expanded", open); a.style.maxHeight = open ? a.scrollHeight + "px" : 0;
  });
}

function renderCta() {
  const el = $("#site-cta"); if (!el) return;
  el.innerHTML = `<section class="cta" id="contact"><img data-img="cta" alt=""><div class="wrap"><span class="pill">Get in Touch</span>
    <h2>Let&rsquo;s make your property journey effortless</h2>
    <p>Buying, renting or investing, our team is here to guide you at every step. Tell us what you&rsquo;re looking for and we&rsquo;ll take it from there.</p>
    <a class="btn btn-light" href="mailto:${SITE.email}">Book a Call${ARROW}</a></div></section>`;
  renderIcons(el);
}

function renderFooter() {
  $("#site-footer").innerHTML = `<footer><div class="wrap foot">
    <div><a class="logo" href="index.html">${LOGO}${SITE.name}</a><p>${SITE.phone}</p><p>${SITE.email}</p></div>
    <div class="socials"><a href="#" aria-label="Facebook">${ic("facebook")}</a><a href="#" aria-label="LinkedIn">${ic("linkedin")}</a><a href="#" aria-label="YouTube">${ic("youtube")}</a></div>
    <p>${SITE.address}</p><p class="copy">&copy; Copyright ${SITE.year}. All Rights Reserved by ${SITE.owner}</p></div></footer>`;
  renderIcons($("#site-footer"));
}

function initReveal() {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12 });
  $$(".reveal").forEach(el => io.observe(el));
}

/* Boot the shared parts, then merge IMAGES_COMMON + the page's own IMAGES_* const. */
function bootLayout(page, pageImages) {
  renderNav(page === "property" ? "properties" : page);
  renderFaq(); renderCta(); renderFooter();
  renderImages(IMAGES_COMMON, $("#site-cta"));
  renderImages(pageImages);
  renderIcons();
  initReveal();
}
