# Vgo — Car Rental

A dark, editorial-style car rental website built with vanilla HTML, CSS, and JavaScript (ES modules).

## Features
- Animated preloader, custom cursor, scroll-reveal effects
- Filterable fleet with live booking modal and price summary
- Search bar (location, dates, car type)
- Login / sign-up modals and contact form (front-end validation only)

## Project structure
```
04-cln-car-rental/
├── README.md
├── LICENSE
├── .gitignore
└── src/
    ├── index.html
    ├── css/
    │   ├── style.css         # base, components, sections
    │   └── responsive.css    # media queries
    ├── js/
    │   ├── script.js         # entry point (wires modules together)
    │   └── modules/          # data, fleet, booking, modals, search, ...
    └── assets/
        ├── images/           # put hero.png here
        ├── icons/
        ├── fonts/
        └── videos/
```

## Run locally
The JS uses ES modules, so it must be served over HTTP (opening `index.html` via `file://` will not work).

- VS Code: install **Live Server**, right-click `src/index.html` → *Open with Live Server*
- Or: `cd src && npx serve` / `python -m http.server`

## Notes
Add `hero.png` to `src/assets/images/` for the hero section.
