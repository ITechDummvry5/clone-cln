/* Icon library. Usage:
   - in HTML:        <span class="ic" data-icon="bed"></span>
   - in JS strings:  ${ic("bed")}
   Then call renderIcons(root?) after injecting markup (bootLayout and the page renderers already do). */
const _svg = (vb, body, fill) =>
  `<svg viewBox="${vb}" aria-hidden="true" ${fill ? 'fill="currentColor"' : 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"'}>${body}</svg>`;

const ICONS = {
  /* brand + ui */
  logo:      _svg("0 0 44 36", `<path d="M3 34V14L22 3l19 11v20M11 34V18h6v16M27 34V20h6v14M3 34h38"/><path d="M19 12h2m2 0h2"/>`),
  "arrow-ur":_svg("0 0 24 24", `<path d="M7 17L17 7M8 7h9v9"/>`),
  "arrow-l": _svg("0 0 24 24", `<path d="M19 12H5m6-6l-6 6 6 6"/>`),
  menu:      _svg("0 0 24 24", `<path d="M4 7h16M4 12h16M4 17h16"/>`),
  plus:      _svg("0 0 24 24", `<path d="M12 5v14M5 12h14"/>`),
  check:     _svg("0 0 24 24", `<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>`),
  star:      _svg("0 0 24 24", `<path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z"/>`, true),
  pin:       _svg("0 0 24 24", `<path d="M12 2a7 7 0 00-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1112 6a2.5 2.5 0 010 5.5z"/>`, true),
  /* property meta */
  bed:       _svg("0 0 24 24", `<path d="M3 18V6M3 14h18v4M21 14v-2a3 3 0 00-3-3h-7v5"/><circle cx="7" cy="11" r="1.5"/>`),
  bath:      _svg("0 0 24 24", `<path d="M3 12h18v2a5 5 0 01-5 5H8a5 5 0 01-5-5zM6 12V6a2 2 0 013.5-1.3M7 19l-1 2m11-2l1 2"/>`),
  area:      _svg("0 0 24 24", `<path d="M4 9V4h5M20 9V4h-5M4 15v5h5m11-5v5h-5"/>`),
  /* services */
  house:     _svg("0 0 44 44", `<path d="M6 40V18l14-9v31zM20 40h18V12h-8"/><path d="M10 24h6M10 30h6" stroke="#fff" stroke-width="2"/>`, true),
  leaf:      _svg("0 0 44 44", `<path d="M8 38C8 20 20 8 38 8c0 18-10 28-26 28"/><path d="M8 38l16-16" stroke="#fff" stroke-width="2"/>`, true),
  tree:      _svg("0 0 44 44", `<path d="M22 3l12 16h-6l8 12H24v10h-4V31H8l8-12h-6z"/>`, true),
  /* socials */
  facebook:  _svg("0 0 24 24", `<path d="M14 8h3V4h-3a4 4 0 00-4 4v2H7v4h3v6h4v-6h3l1-4h-4V8z"/>`, true),
  linkedin:  _svg("0 0 24 24", `<path d="M5 9h3v10H5zM6.5 4.5a1.8 1.8 0 110 3.6 1.8 1.8 0 010-3.6zM10 9h3v1.5c.6-1 1.7-1.7 3.2-1.7 3 0 3.8 2 3.8 4.6V19h-3v-5c0-1.3-.1-2.5-1.6-2.5S13 12.700 13 14v5h-3z"/>`, true),
  youtube:   _svg("0 0 24 24", `<path d="M21.5 7.2a2.5 2.5 0 00-1.8-1.8C18.100 5 12 5 12 5s-6.100 0-7.700.4a2.500 2.500 0 00-1.800 1.800C2 8.800 2 12 2 12s0 3.200.5 4.800a2.500 2.500 0 001.800 1.800C5.900 19 12 19 12 19s6.100 0 7.700-.4a2.500 2.500 0 001.800-1.800C22 15.200 22 12 22 12s0-3.200-.5-4.800zM10 15V9l5 3z"/>`, true),
  /* amenities */
  tv:        _svg("0 0 24 24", `<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/>`),
  ac:        _svg("0 0 24 24", `<rect x="3" y="5" width="18" height="7" rx="2"/><path d="M7 16c0 2 2 2 2 4m4-4c0 2 2 2 2 4m2-4"/>`),
  washer:    _svg("0 0 24 24", `<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="13" r="4"/><path d="M8 6.500h1"/>`),
  wifi:      _svg("0 0 24 24", `<path d="M2.500 9a14 14 0 0119 0M5.500 12.500a9.500 9.500 0 0113 0M9 16a4.500 4.500 0 016 0"/><circle cx="12" cy="19.500" r=".8" fill="currentColor"/>`),
  heater:    _svg("0 0 24 24", `<path d="M10 14V5a2 2 0 014 0v9a4 4 0 11-4 0z"/><path d="M12 10v6"/>`),
  fridge:    _svg("0 0 24 24", `<rect x="6" y="2.500" width="12" height="19" rx="2"/><path d="M6 10h12M9 6v1.500M9 13v3"/>`),
  sofa:      _svg("0 0 24 24", `<path d="M5 11V8a3 3 0 013-3h8a3 3 0 013 3v3M3 13a2 2 0 014 0v2h10v-2a2 2 0 014 0v4H3zM6 17v2m12-2v2"/>`),
  wardrobe:  _svg("0 0 24 24", `<path d="M12 4a2 2 0 11-1 3.700L3 14h18l-8-6.300"/><path d="M3 14v4h18v-4"/>`)
};
const AMENITY_ICON = {
  "TV": "tv", "Air Conditioner": "ac", "Washing Machine": "washer", "Internet": "wifi",
  "Water Heater": "heater", "Refrigerator": "fridge", "Sofa": "sofa", "Wardrobe": "wardrobe"
};

/* string helper for templates */
const ic = (name, cls = "") => `<span class="ic ${cls}" data-icon="${name}"></span>`;

/* fill every [data-icon] that is still empty */
function renderIcons(root = document) {
  root.querySelectorAll("[data-icon]").forEach(el => {
    if (el.firstElementChild) return;
    const svg = ICONS[el.dataset.icon];
    if (svg) el.innerHTML = svg; else console.warn("Unknown icon:", el.dataset.icon);
  });
}
