/* Page renderers. body[data-page] decides which one runs. */

const propCard = p => `<a class="prop reveal" href="property.html?id=${p.id}">
  <div class="ph"><img data-img="${p.id}" alt="${p.title}"><span class="tag">${TYPE_LABEL[p.type]}</span></div>
  <div class="loc">${ic("pin")}${p.loc}</div><h3>${p.title}</h3>
  <div class="meta"><span>${ic("bed")} ${p.beds}</span><span>${ic("bath")} ${p.baths}</span><span>${ic("area")} ${p.sqft.toLocaleString()} sq.ft</span></div>
  <div class="price">${money(p.price)}</div></a>`;
const agentCard = a => `<div class="agent reveal"><div class="ph"><img data-img="${a.id}" alt="${a.name}"></div><h4>${a.name}</h4><p>${a.role}</p></div>`;

function countUp() {
  $$("[data-count]").forEach(el => {
    const end = parseFloat(el.dataset.count), suf = el.dataset.suf || "", pre = el.dataset.pre || "";
    new IntersectionObserver(([e], io) => { if (!e.isIntersecting) return; io.disconnect();
      const t0 = performance.now(); (function f(t) { const k = Math.min((t - t0) / 1200, 1); el.textContent = pre + Math.round(end * k) + suf; if (k < 1) requestAnimationFrame(f); })(t0);
    }).observe(el);
  });
}

function pageHome() {
  const view = $("#services-slider"); let i = 0;
  const draw = () => {
    const s = SERVICES[i];
    view.innerHTML = `<div class="svc-text">${ic(s.icon)}<h3>${s.title}</h3><p>${s.text}</p></div><div class="svc-track">` +
      SERVICES.map((x, n) => n === i
        ? `<div class="svc-active"><img data-img="${x.img}" alt="${x.title}"><div class="svc-badge"><span>0${n + 1}</span><b>${x.title}</b></div></div>`
        : `<button class="svc-tab" data-i="${n}" aria-label="${x.title}">${ic("arrow-l")}<span class="label"><em>0${n + 1}</em> ${x.title}</span></button>`).join("") + `</div>`;
    renderImages(IMAGES_HOME, view); renderIcons(view);
    $$(".svc-tab", view).forEach(b => b.onclick = () => { i = +b.dataset.i; draw(); });
  };
  draw();
  $("#why-grid").innerHTML = WHY.map(([t, d], n) => `<div class="why reveal"><i>0${n + 1}</i><h3>${t}</h3><p>${d}</p></div>`).join("");
  $("#home-props").innerHTML = PROPERTIES.map(propCard).join("");
  $("#home-team").innerHTML = AGENTS.slice(0, 4).map(agentCard).join("");
  $("#tst-grid").innerHTML = TESTIMONIALS.map(([n, r, t]) => `<div class="tcard reveal"><span class="stars">${ic("star").repeat(5)}</span><p>${t}</p><div class="who-r"><span class="av-i">${n[0]}</span><div><b>${n}</b><small>${r}</small></div></div></div>`).join("");
  countUp();
}

function pageProperties() {
  const grid = $("#prop-grid"), more = $("#load-more"), PAGE = 6; let f = "All", shown = PAGE;
  const draw = () => {
    const list = PROPERTIES.filter(p => f === "All" || p.type === f);
    grid.innerHTML = list.slice(0, shown).map(propCard).join("") || `<p>No properties in this category yet. Try another filter.</p>`;
    more.style.display = list.length > shown ? "" : "none";
    renderImages(IMAGES_PROPERTIES, grid); renderIcons(grid); initReveal();
  };
  $$("#filters button").forEach(b => b.onclick = () => {
    f = b.dataset.f; shown = PAGE; $$("#filters button").forEach(x => x.classList.toggle("on", x === b)); draw();
  });
  more.onclick = () => { shown += PAGE; draw(); };
  draw();
}

function pageProperty() {
  const id = new URLSearchParams(location.search).get("id") || "palazzo-di-amore";
  const p = PROPERTIES.find(x => x.id === id) || PROPERTIES[1], a = AGENTS.find(x => x.id === p.agent);
  const blurb = p.overview.length > 155 ? p.overview.slice(0, 152).replace(/\s+\S*$/, "") + "..." : p.overview;
  const path = "property.html?id=" + p.id, cover = IMAGES_PROPERTY[p.id];
  setSeo({ title: `${p.title}, ${p.loc} | ${TYPE_LABEL[p.type]} | ${SITE.owner}`, description: blurb, path, image: cover });
  addJsonLd("ld-listing", { "@context": "https://schema.org", "@type": "RealEstateListing", name: p.title, url: absUrl(path),
    description: p.overview, image: cover && absUrl(cover),
    offers: { "@type": "Offer", price: p.price, priceCurrency: "USD" },
    contentLocation: { "@type": "Place", name: p.loc, geo: { "@type": "GeoCoordinates", latitude: p.lat, longitude: p.lng } } });
  const d = .012, bbox = [p.lng - d, p.lat - d, p.lng + d, p.lat + d].join("%2C");
  $("#detail").innerHTML = `
  <div class="gallery"><div class="ph main"><img data-img="${p.id}" alt="${p.title}"><span class="tag" style="left:14px;right:auto">${TYPE_LABEL[p.type]}</span></div>
    <div class="gal-side"><div class="ph"><img data-img="${p.id}-2" alt=""></div><div class="ph"><img data-img="${p.id}-3" alt=""></div></div></div>
  <div class="d-grid"><div>
    <h1>${p.title}</h1><div class="loc" style="display:flex;gap:6px;align-items:center">${ic("pin")}${p.loc}</div>
    <div class="meta" style="margin-top:12px"><span>${ic("bed")} ${p.beds} Beds</span><span>${ic("bath")} ${p.baths} Baths</span><span>${ic("area")} ${p.sqft.toLocaleString()} sq.ft</span></div>
    <h3>Overview</h3><p>${p.overview}</p>
    <h3>Features</h3><ul class="feat"><li>${ic("check")}${p.beds} Elegant Bedrooms</li><li>${ic("check")}${p.baths} Modern Bathrooms</li><li>${ic("check")}Seamless Indoor-Outdoor Flow</li><li>${ic("check")}Private Terrace &amp; Garden Space</li><li>${ic("check")}Prime ${p.loc.split(",")[0]} Location</li></ul>
    <h3>Amenities</h3><div class="chips">${AMENITIES.map(x => `<span>${ic(AMENITY_ICON[x])} ${x}</span>`).join("")}</div>
    <h3>Location</h3><div class="map"><iframe title="Map of ${p.title}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
      src="https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${p.lat}%2C${p.lng}"></iframe></div>
  </div>
  <aside class="side"><h3 style="text-transform:none;font-size:22px">Property ${TYPE_LABEL[p.type]}</h3><b class="big">${money(p.price)}</b>
    <small>Get in touch for more about this property</small>
    <div class="ag"><img data-img="${a.id}" alt="${a.name}"><b>${a.name}</b><br><small>${a.role}</small></div>
    <a class="btn btn-solid" href="contact.html?property=${encodeURIComponent(p.title)}#contact-form">Request Info</a></aside></div>`;
}

function pageAbout() {
  $("#about-team").innerHTML = AGENTS.slice(0, 4).map(agentCard).join("");
  $("#principles").innerHTML = [["Honest Pricing","We tell you what a home is really worth, even when a higher number would win the listing."],
    ["Local Knowledge","We work the neighborhoods we live in, so our advice comes from the street, not a spreadsheet."],
    ["Your Pace, Not Ours","Buying a home is a big decision. Our job is to give you room to make it well."],
    ["Here After Closing","We stay in touch long after the keys change hands, for questions, referrals and the next move."]]
    .map(([t, d], n) => `<div class="pr reveal"><small>0${n + 1}</small><h3>${t}</h3><p>${d}</p></div>`).join("");
  countUp();
}

function pageContact() {
  countUp();
  const form = $("#contact-form"); if (!form) return;
  const status = $("#form-status"), btn = $("button[type=submit]", form);
  const prop = new URLSearchParams(location.search).get("property");
  if (prop) $("#message").value = `Hi, I'd like more information about ${prop.slice(0, 80)}.`;

  const rules = {
    first:   v => v.trim() ? "" : "Please enter your first name.",
    last:    v => v.trim() ? "" : "Please enter your last name.",
    email:   v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Please enter a valid email address.",
    phone:   v => !v.trim() || /^\+?[\d\s().-]{7,20}$/.test(v.trim()) ? "" : "Please enter a valid phone number.",
    message: v => v.trim().length >= 10 ? "" : "Tell us a little more (at least 10 characters)."
  };
  const check = id => {
    const el = $("#" + id), msg = rules[id](el.value);
    el.setAttribute("aria-invalid", !!msg); $("#err-" + id).textContent = msg; return !msg;
  };
  Object.keys(rules).forEach(id => {
    const el = $("#" + id);
    el.addEventListener("blur", () => check(id));
    el.addEventListener("input", () => { if (el.getAttribute("aria-invalid") === "true") check(id); });
  });
  const show = (cls, html) => { status.className = "form-status " + cls; status.innerHTML = html; status.focus(); };

  form.addEventListener("submit", async e => {
    e.preventDefault();
    status.className = "form-status"; status.textContent = "";
    const bad = Object.keys(rules).filter(id => !check(id));
    if (bad.length) { $("#" + bad[0]).focus(); return; }
    if ($("#website").value) return;                       // honeypot: bots fill this, people never see it
    const f = new FormData(form), data = {
      firstName: f.get("first").trim(), lastName: f.get("last").trim(), email: f.get("email").trim(),
      phone: (f.get("phone") || "").trim(), interest: f.get("interest"), message: f.get("message").trim()
    };
    btn.disabled = true; const label = btn.textContent; btn.textContent = "Sending...";
    try {
      if (SITE.formEndpoint) {
        const r = await fetch(SITE.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) });
        if (!r.ok) throw new Error("HTTP " + r.status);
        form.reset(); $$("[aria-invalid]", form).forEach(el => el.removeAttribute("aria-invalid"));
        show("ok", `Thank you, ${data.firstName}! We received your message and will get back to you within one business day.`);
      } else {
        // No backend yet: hand the message to the visitor's email app, ready to send.
        const body = `${data.message}\n\n${data.firstName} ${data.lastName}\n${data.email}${data.phone ? "\n" + data.phone : ""}\nInterested in: ${data.interest}`;
        location.href = `mailto:${SITE.email}?subject=${encodeURIComponent("Call request: " + data.firstName + " " + data.lastName)}&body=${encodeURIComponent(body)}`;
        show("ok", `Thanks, ${data.firstName}! Your email app should open with your message ready to send. If nothing opened, write to <a href="mailto:${SITE.email}"><u>${SITE.email}</u></a>.`);
      }
    } catch (err) {
      show("bad", `Sorry, something went wrong sending your message. Please try again, or call us on ${SITE.phone}.`);
    } finally { btn.disabled = false; btn.textContent = label; }
  });
}

function pageAgents() { $("#agents-grid").innerHTML = AGENTS.map(agentCard).join(""); }

const PAGES = {
  home:       { run: pageHome,       images: () => IMAGES_HOME },
  properties: { run: pageProperties, images: () => IMAGES_PROPERTIES },
  property:   { run: pageProperty,   images: () => IMAGES_PROPERTY },
  about:      { run: pageAbout,      images: () => IMAGES_ABOUT },
  agents:     { run: pageAgents,     images: () => IMAGES_AGENTS },
  contact:    { run: pageContact,    images: () => IMAGES_CONTACT }
};
document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page, cfg = PAGES[page];
  cfg.run();
  bootLayout(page, cfg.images());
});
