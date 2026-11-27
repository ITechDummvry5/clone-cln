/* Shared components: nav, footer, CTA, FAQ + image renderer.
   Every page just has <div id="site-nav">, <div id="site-faq">, <div id="site-cta">, <div id="site-footer">. */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const money = n => "$ " + n.toLocaleString("en-US");

const ARROW = `<span class="ar">${ic("arrow-ur")}</span>`;
const LOGO = ic("logo");

/* Fill every <img data-img="key"> from an IMAGES_* map. Missing files hide cleanly. */
function renderImages(map, root = document) {
  if (!root) return;
  $$("[data-img]", root).forEach(el => {
    const src = map && map[el.dataset.img];
    if (!src) { if (!el.getAttribute("src")) el.classList.add("img-missing"); return; }
    if (el.getAttribute("src") === src) return;           // already handled
    const eager = el.hasAttribute("data-priority");        // above-the-fold images load right away
    el.setAttribute("decoding", "async");
    el.setAttribute("loading", eager ? "eager" : "lazy");   // native lazy loading, no library needed
    if (eager) el.setAttribute("fetchpriority", "high");
    el.onload = () => el.classList.add("loaded");           // fade in (CSS) once decoded
    el.onerror = () => el.classList.add("img-missing");
    el.alt = el.alt || el.dataset.alt || "";
    el.src = src;
    if (el.complete && el.naturalWidth) el.classList.add("loaded");
  });
}

/* ---------- Theme (light / dark) ---------- */
const THEME_KEY = "vh-theme";
function applyTheme(t) {
  document.documentElement.dataset.theme = t;
  const m = $('meta[name="theme-color"]'); if (m) m.content = t === "dark" ? "#0c0c0c" : "#ffffff";
  const b = $("#themeToggle");
  if (b) { b.setAttribute("aria-pressed", t === "dark"); b.setAttribute("aria-label", t === "dark" ? "Switch to light mode" : "Switch to dark mode"); }
}
function initTheme() {
  const b = $("#themeToggle"); if (!b) return;
  applyTheme(document.documentElement.dataset.theme || "light");
  b.onclick = () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(next); try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
  };
  // follow the OS setting until the visitor picks one themselves
  matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", e => {
    let saved = null; try { saved = localStorage.getItem(THEME_KEY); } catch (x) {}
    if (!saved) applyTheme(e.matches ? "dark" : "light");
  });
}

/* ---------- SEO helpers (used by pages whose content depends on the URL) ---------- */
const absUrl = p => SITE.url.replace(/\/$/, "") + "/" + String(p).replace(/^\//, "");
function setTag(sel, attr, val, make) {
  let el = $(sel);
  if (!el && make) { el = document.createElement(make.tag); Object.entries(make.attrs).forEach(([k, v]) => el.setAttribute(k, v)); document.head.appendChild(el); }
  if (el) el.setAttribute(attr, val);
}
function setSeo({ title, description, path, image }) {
  document.title = title;
  const url = absUrl(path), img = image ? absUrl(image) : null;
  setTag('meta[name="description"]', "content", description, { tag: "meta", attrs: { name: "description" } });
  setTag('link[rel="canonical"]', "href", url, { tag: "link", attrs: { rel: "canonical" } });
  [["og:title", title], ["og:description", description], ["og:url", url], img && ["og:image", img]].filter(Boolean).forEach(([p, v]) =>
    setTag(`meta[property="${p}"]`, "content", v, { tag: "meta", attrs: { property: p } }));
  [["twitter:title", title], ["twitter:description", description], img && ["twitter:image", img]].filter(Boolean).forEach(([n, v]) =>
    setTag(`meta[name="${n}"]`, "content", v, { tag: "meta", attrs: { name: n } }));
}
function addJsonLd(id, data) {
  let el = document.getElementById(id);
  if (!el) { el = document.createElement("script"); el.type = "application/ld+json"; el.id = id; document.head.appendChild(el); }
  el.textContent = JSON.stringify(data);
}

function renderNav(active) {
  $("#site-nav").innerHTML = `<div class="wrap nav">
    <a class="logo" href="index.html">${LOGO}${SITE.name}</a>
    <nav class="nav-links" id="navLinks">${NAV_LINKS.map(l =>
      `<a href="${l.href}" class="${[l.page && l.page === active ? "active" : "", l.mobileOnly ? "m-only" : ""].join(" ").trim()}"${l.page && l.page === active ? ' aria-current="page"' : ""}>${l.label}</a>`).join("")}</nav>
    <div class="nav-actions">
      <button class="theme-toggle" id="themeToggle" type="button" aria-label="Switch to dark mode" aria-pressed="false">${ic("moon", "moon")}${ic("sun", "sun")}</button>
      <a class="btn btn-dark" href="contact.html"><span class="dot"></span>Contact Us Now${ARROW}</a>
      <button class="burger" aria-label="Menu" aria-expanded="false" aria-controls="navLinks" id="burger">${ic("menu")}</button></div></div>`;
  renderIcons($("#site-nav"));
  $("#burger").onclick = () => { const o = $("#navLinks").classList.toggle("open"); $("#burger").setAttribute("aria-expanded", o); };
  initTheme();
}

function renderFaq() {
  const el = $("#site-faq"); if (!el) return;
  el.innerHTML = `<section class="sec wrap"><div class="faq"><div><span class="pill">Help Center</span><h2 style="font-size:clamp(26px,2.6vw,34px)">Frequently asked questions</h2></div>
    <div>${FAQS.map(([q, a]) => `<div class="q"><button aria-expanded="false">${q}<span class="pl">${ic("plus")}</span></button><div class="a"><p>${a}</p></div></div>`).join("")}</div></div></section>`;
  renderIcons(el);
  addJsonLd("ld-faq", { "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: FAQS.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) });
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
    <a class="btn btn-light" href="contact.html">Book a Call${ARROW}</a></div></section>`;
  renderIcons(el);
}

function renderFooter() {
  $("#site-footer").innerHTML = `<footer><div class="wrap foot">
    <div><a class="logo" href="index.html">${LOGO}${SITE.name}</a><p><a href="tel:${SITE.phone.replace(/[^+\d]/g, "")}">${SITE.phone}</a></p><p><a href="mailto:${SITE.email}">${SITE.email}</a></p></div>
    <div class="socials"><a href="#" aria-label="Facebook" rel="noopener">${ic("facebook")}</a><a href="#" aria-label="LinkedIn">${ic("linkedin")}</a><a href="#" aria-label="YouTube">${ic("youtube")}</a></div>
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
  const main = $("main"); if (main && !main.id) main.id = "main";
  renderImages(pageImages);
  renderIcons();
  initReveal();
}
