# Horizone

Car-rental site in plain HTML, CSS and JavaScript. No build step while you work: open `index.html`, or serve the folder. A small build script (`build.js`) produces a faster copy for publishing, see **Build for production**.

## Folder structure

```
index.html, cars.html, car.html, ...     one HTML file per page (kept at the root so URLs stay stable)
_page-template.html                      copy this to start a new page
build.js, package.json                   build script (see Build for production); writes the publishable copy to dist/
assets/
  css/
    main.css                             imports everything below except pages/ (order matters)
    core/        tokens.css  reset.css  base.css
    layout/      container  grid  header  hero  footer          (page skeleton)
    components/  button chip dropdown picker search-box car-card form toast ...   (reusable UI)
    pages/       home cars car location locations deals about help account auth  (one file per page)
  js/
    core/        config  storage  utils  icons  media  currency                  (no DOM side effects, used everywhere)
    data/        images  fleet  cities  routes                                     (content only)
    services/    auth  oneway  sample-images                                                      (accounts, bookings, settings, messages; one-way return rules)
    layout/      header  footer                                                    (render the shared header and footer)
    components/  toast dropdown currency-menu newsletter picker date-picker             (reusable behaviour)
    pages/       home cars car location locations deals about help login account admin not-found (one file per page)
```

## Starts empty, sample data on demand

A fresh install has **no cars, no locations, no bookings and empty dropdown lists** (only the admin account exists). `data/fleet.js` and `data/cities.js` are now the *sample set*: in the admin panel press **Load sample data** in Settings > Sample data to copy them in (cars, locations, demo bookings and the Fleet settings lists). Everything loaded is flagged as sample and can be edited or deleted one by one, or removed together with **Remove sample data**. **Sample images (API):** the same card has *Load sample images*, which finds a real photo for every car, location, "best place to drive" and sample deal that has no picture yet, using the free Wikipedia image API (`services/sample-images.js`, needs internet, no key). Only the image link is saved. Your own pictures are never replaced, and *Remove sample images* (or *Remove sample data*) puts back exactly what it changed. The *Also load real photos* checkbox next to *Load sample data* does both in one click. The Settings > Sample data switch hides the tools when the site goes live.

## Where things go

| I want to...                         | Edit                                                        |
|--------------------------------------|-------------------------------------------------------------|
| change a colour, radius or font      | `css/core/tokens.css` (the only place raw values live)      |
| change nav links, footer, cities, currency rates, tax | `js/core/config.js`                          |
| edit a car or its details            | `js/data/fleet.js`                                          |
| change which cities allow one-way returns, and the fee | Admin > Locations > One-way routes (sample routes live in `js/data/routes.js`; a pair that is not listed can only be returned to the pick-up location) |
| change the demo admin login          | `ADMIN` in `js/services/auth.js` (see Admin account)        |
| swap an image                        | `js/data/images.js`                                         |
| change the calendar or time list     | `js/components/date-picker.js` (used by the home search and the car booking panel) |
| restyle a button, card, dropdown     | the matching file in `css/components/`                      |
| change one page only                 | `css/pages/<page>.css` and `js/pages/<page>.js`             |

## Admin account

The admin panel is `admin.html`. Only signed-in users with the `admin` role can open it; everyone else is sent away.

**Default admin (demo only)**

| Field    | Value                 |
|----------|-----------------------|
| Email    | `admin@horizone.test` |
| Password | `Admin123!`           |

Sign in at `login.html`. The account menu in the header then shows **Admin panel**, or go to `admin.html` directly.

**How it is created.** `services/auth.js` creates this account automatically the first time any page loads and no admin exists yet. The values come from the `ADMIN` constant at the top of that file. Changing them only affects a browser that has no admin yet, so to apply new defaults clear the site's data (localStorage keys `hz-users`, `hz-session`, ...) and reload.

**First thing to do:** sign in, open **My account → Security** and change the password. After you add a real admin, you can ignore the demo address.

**What an admin can do.** The tabs follow the work: Overview, then day-to-day guest work, then one-time setup in the order each step needs the one before it, then system tabs. A "Set up your site" checklist on Overview walks through the setup steps until they are done.

| Group | Tab | Purpose |
|-------|-----|---------|
| | Overview | Counts, confirmed + completed revenue, a "needs attention" row (pending bookings, unread messages) and the setup checklist. |
| Operations | Bookings | Search and filter bookings, change status, delete, open details, **Export CSV**. |
| Customers | Customers | Customer accounts. Change a role to Admin to move someone to Settings > Admins. |
| Customers | Reviews | Ratings and comments left after a trip. Delete moves one to Trash. |
| Customers | Messages | Help page contact form messages: Reply, mark read/unread, Delete. |
| Setup | Currency | Main currency, exchange rates and currency list (units per 1 USD, saved in `hz-currencies`), converter. |
| Setup | Locations | **Locations** (add, edit, delete, pick-up desks, driving rules, local info), **Countries and cities** (the Country / Region / City dropdown lists), **One-way routes** (which city pairs allow a one-way return, and the fee). Needs no other tab first. |
| Setup | Fleet | **Cars** (add, edit, delete, linked to locations) and **Lists and defaults** (brands, car types, gearboxes, fuels, features, defaults for new cars). Fill the lists first; add locations before cars. |
| Setup | Booking options | **Reserve sidebar only:** Protection plans, Extras, Driver options, Taxes and fees, Pick-up and return times, Promo code box and booking-panel display controls. |
| Setup | Pricing rules | Long-rental rates and late-return charges. These affect rental totals or returns, not the Reserve sidebar controls. |
| Website | Deals page cards | Savings cards shown on the public Deals page. |
| Website | Promotions | Promo codes and discounts shown on the Deals page and applied on the car page. |
| Website | Media library | Shared images used across the public site. |
| System | Settings | **General** (support email, turns the Help form on), **Admins** (who can sign in here, behind the password gate), **Sample data** (load/remove demo data, hide the tool when live). |
| System | Trash | Restore or permanently delete removed items. |

**Double-booking protection.** A car is free only if its stock minus pending/confirmed bookings (plus the gap) is above 0. It is checked on the car page and again when the booking is saved (including the sign-in route). An admin cannot set a cancelled or completed booking back to pending/confirmed if no unit is free. The gap between rentals (default 2 hours, 0 = back-to-back) is set in Booking options > Booking panel. Browser storage cannot lock, so a real backend must do this check inside a database transaction.

**Late returns (v41, simplified).** One rule instead of an hour-range table: a **free grace period**, then a **fee per started hour**, with an optional **maximum**. Admin > Setup > Pricing rules > Late-return charges: pick *Flexible / Standard / Strict* as a starting point, fine-tune the three numbers, and read the live preview ("customers will read…" plus worked examples) before saving. Defaults live in `DEFAULTS.late` in `services/booking-form.js` (`{ on, grace, rate, cap }`; an old saved tier table is ignored and replaced by these defaults).

**Customers** see the rule as two plain sentences on the car page. In **My bookings**, a trip that is on the road shows its return time and a *Running late?* row (30 min / 1 h / 2 h / 3 h), each button showing what that delay would cost. Overdue trips show a red card with the fee so far and how it grows. A tap saves `booking.lateNote` and tells the desk.

**Admin > Guests > Returns** (was "Late returns") lists *Overdue now*, *Coming back soon* and *Recent late fees* as cards, with the customer's own estimate shown. Buttons: **Car is back · charge $X** or **Back · waive fee** (both ask to confirm). The eye icon opens the booking to set another return time or change the fee. The fee is saved on the booking (`booking.late`), so changing the rule never changes old bookings.

**Adding another admin**
1. The person creates a normal account on `login.html` (Create account).
2. An admin opens **Customers** and changes that person's role from `client` to `admin`.

**Built-in safeguards**
- You cannot change your own role or delete yourself from the Customers tab.
- The last remaining admin cannot delete their own account (make someone else an admin first).
- Repeated wrong passwords temporarily lock sign-in for that email.
- Admin-only actions are checked again inside `services/auth.js`, not only hidden in the UI.

**Icon buttons.** Action buttons in the admin tables are icons only; the label appears on hover or keyboard focus (`data-tip`).

**Support email and the Help form.** In **Settings**, save an email address to turn the Help page contact form on. Clear it (or use "Turn form off") to hide the form and show the "Messaging isn't available yet" notice instead. Messages are saved in this browser and appear in the Messages tab; real email delivery needs a server.

> **Prototype warning.** Accounts, the admin role and all data live in the browser's localStorage. Anyone with dev tools can read or edit them, including giving themselves the admin role. Treat this as a demo. Before going live, move `services/auth.js` to a real backend (server-side sessions, hashed passwords, role checks on every request) and remove the default admin.

## Conventions

- **Tokens first.** Use `var(--ink)`, `var(--line)`, `var(--r-md)` etc. instead of `#111` or `10px`. Add a token before adding a new shade.
- **One responsibility per file.** A component's CSS lives in `components/<name>.css`; its media queries sit in the same file, right after its base rules.
- **Page CSS only styles that page.** If a second page needs it, move the rule into `components/`.
- **Prices:** always `HZC.usd(n)` in templates (or `HZC.txt(n)` for plain text). Amounts are stored in USD and converted for display.
- **Storage:** go through `HZStore`, never `localStorage` directly.
- **Escaping:** wrap any user-supplied text in `esc()` before putting it in a template string.
- **Images:** `img(src)`, `pic('cities.bali')` and `hydrateImages()` come from `core/media.js`; do not redefine them in a page.

## City pages (location.html)

`location.html?city=<slug>` is one template that renders any city, the same way `car.html?car=<slug>` renders any car. There is no page per city.
The slug is the city name run through `slug()`: `Jeju Island` -> `location.html?city=jeju-island`.

- Data: `assets/js/data/cities.js` (`CITIES`, `PLACE`, `ROUTES`), shared with `locations.html`. **Add a city:** one row in `CITIES`, one in `PLACE`, one image key in `data/images.js`. Both pages pick it up.
- Page: `assets/js/pages/location.js` and `assets/css/pages/location.css` (loaded after `locations.css`).
- Cars on a city page use `carCard()` from `components/car-card.js`, the same card as the cars page.
- Unknown or missing `?city=` shows a "couldn't find that location" state with every city listed.
- Placeholder: the fleet has no per-city stock yet, so each city shows a fixed slice of `FLEET` (see the comment in `location.js`). Swap in real availability when you have it.

## Not-found pages (isometric illustration)

Anything that cannot be found shows the same black, white and gray isometric illustration (`components/isometric.js` + `css/components/isometric.css`, adapted from `isometric.html`).

- `404.html`: static hosts (Netlify, GitHub Pages, Cloudflare Pages, ...) serve it for any address that does not exist. It is built like every other page.
- `location.html?city=nope` and `car.html?car=nope`: the unknown-city and unknown-car states use the same component.
- Use it anywhere: load `components/isometric.js` after `core/utils.js`, then `isoNotFound(element, { eyebrow, title, text, actions: [[label, href, 'ghost'?]], chips: [[label, href]] })`.
- Recolour it in `isometric.css`: the stage is `var(--ink)`, the rest are plain hex grays. Class names all start with `iso-`.
- With `prefers-reduced-motion`, or if the script does not run, the illustration just shows without the load-in.
- Note: `404.html` uses relative asset paths like the rest of the site. If your host serves it on deep URLs (for example `/a/b/missing`), set the host's 404 page at the site root or add `<base href="/">`.

## Script order (matters, classic scripts share one global scope)

1. `core/config, storage, utils, icons`
2. `data/images`, then `core/media`, then `core/currency`
3. `components/toast`, `services/auth`, `layout/header`, `layout/footer`, `components/dropdown`, `components/currency-menu`, `components/newsletter`
4. page extras: `components/date-picker` (home, car: it must load before the page script), `data/fleet` (cars, car, home, account, admin), then `pages/<page>`; `components/picker` goes after the page script when the page only uses `<select data-pick>`, but before it when the page calls `enhanceSelect()` itself (admin)

`_page-template.html` already has this order.

## Build for production

```
node build.js            # or: npm run build
node build.js --watch    # or: npm run watch   (rebuilds when you save a file)
```

Nothing to install; it only needs Node. It writes a copy of the site to `dist/` where every page loads **one CSS file and one JS file** instead of about 30 and 15. Upload the contents of `dist/` to your host. Keep editing the source files, never `dist/` (it is deleted and rebuilt each time).

How it works:
- It reads each page's `<link>` and `<script src>` tags, so the script order you set in the HTML (it matters, see above) is kept exactly. A new page or a new script needs no change to the build.
- CSS: every `@import` in `main.css` is inlined, then the page's own css follows. JS: files are joined in order.
- Each bundle gets a content hash in its URL (`bundle-home.js?v=1a2b3c4d`), so visitors get the new file after a rebuild and keep the cached one when nothing changed.
- Files in `assets/` that are not css or js (images, fonts) are copied unchanged. Pages starting with `_` are skipped.
- If a page lists a file that does not exist, the build stops and names it.

`dist/` works the same way as the source: you can open `dist/index.html` straight from disk.

### Why does the project have Node and npm?

Short answer: **only the build script needs Node, and your website itself does not.**

- **Node.js** is a program that runs JavaScript on your computer, outside the browser. The build script (`build.js`) is a small JavaScript file that reads your files and joins them together. A browser cannot read or write files on your disk, so something like Node has to run it. You already have Node on your Linux Mint, so there is nothing to install.
- **npm** is Node's package manager (it installs libraries). Here it is only used as a **shortcut**: `package.json` says `npm run build` means `node build.js`. No library is installed, there is no `node_modules` folder, and you can ignore npm completely and just type `node build.js`.
- **The website does not use Node.** `dist/` (and your source folders) are plain HTML, CSS and JS. You can open them straight in the browser, and any normal host can serve them.
- **Optional.** If you do not want the build step, delete `build.js`, `package.json` and `.gitignore`. The site in the source folders keeps working exactly as before; it will just load many small files.
- It also fits your plan: Next.js and PostgreSQL both run on Node, so this is a small first step with the same tool.

## Known limits / next steps

- Accounts, bookings and messages are stored in the browser (`services/auth.js`). Replace the function bodies with API calls when a server exists.

---

# Change report (23 Nov 2026)

This report covers two items from the to-do list:

| # | Item | Status |
|---|------|--------|
| 1 | Data lives in the browser (localStorage) | **Skipped on purpose.** You are not planning a live website yet, so nothing was changed. |
| 2 | Calendar code written twice | **Fixed** |
| 3 | Many small files = many requests | **Fixed** |

The site looks and behaves the same as before. The changes are all behind the scenes.

---

### Fix 2: One shared date picker

#### The problem
The calendar popup (pick-up and return dates) existed twice: once in `pages/home.js` (search box on the home page) and once in `pages/car.js` (booking panel on the car page). The date helper functions (`iso`, `addDays`, the list of times) were also copied in both files. A bug fix or design change had to be done in two places.

#### What was done
- **New file:** `assets/js/components/date-picker.js`. It holds everything about dates in one place, under one name, `HZDate`:
  - helpers: `today`, `add`, `same`, `iso`, `parse`, `fmtUS`, `fmtShort`
  - the list of pick-up/return times (`HZDate.TIMES`, 6:00 AM to 10:00 PM)
  - the calendar itself: `HZDate.calendar(popup, options)`
- **`pages/home.js`:** the calendar code was removed and replaced by a short call to `HZDate.calendar`. About 25 lines less.
- **`pages/car.js`:** same. The copied helper functions and the times loop were removed. About 25 lines less.
- **`index.html` and `car.html`:** one new `<script>` line for `date-picker.js`, placed before the page script.
- **`_page-template.html` and `README.md`:** updated so new pages know about it.

The popup box itself (where it opens, closing when you click outside) still belongs to each page, because the two pages position it differently. The shared file only draws the calendar and tells the page which day was picked.

#### The benefit
- **One place to fix.** A bug in the calendar, a new rule (for example "minimum 1 day rental"), or a design change is done once and both pages get it.
- **The two pages can no longer drift apart.** Before, a fix on one page could be forgotten on the other.
- **Less code in the page files**, so `home.js` and `car.js` are easier to read.
- **Reusable.** If you add a date field to another page (for example the admin panel), you call `HZDate.calendar(...)` instead of copying code a third time.
- The helpers live inside one name (`HZDate`), so they cannot clash with variables in other scripts.

#### How it was checked
I ran the original site and the new site in a real browser (Chromium) and did the same clicks on both: open calendar, go to next month, "Today", pick a pick-up day (the return calendar opens by itself), pick a return day, pick a pick-up day after the return day (the return day moves), pick a time, press Search, and on the car page check the price total.
- Labels, selected dates, the price total and the search link were **identical**.
- Screenshots of all 10 pages were **pixel-identical**.
- The only difference found is some spaces inside the calendar's generated HTML. They are invisible on screen.

---

### Fix 3: Build script (many files to one file per page)

#### The problem
`main.css` loaded about 27 small CSS files with `@import`, and every page loaded around 16 script files. Each file is a separate request. Worse, the `@import` files are only discovered after `main.css` has downloaded, so they load one step later. On a real website over the internet, this makes the first load slow.

#### What was done
- **New file:** `build.js` (plain Node, nothing to install).
- **New file:** `package.json` with two shortcuts.
- **New file:** `.gitignore` (so `dist/` is not committed if you use git).
- This README has a new section, "Build for production".

How to use it (Node is already on your Linux Mint):

```bash
cd horizone
node build.js            # or: npm run build
node build.js --watch    # or: npm run watch   (rebuilds every time you save)
```

It creates a `dist/` folder. That is the folder you upload when you publish. You keep working in the normal source folders.

What the build does:
1. Reads each page's own `<link>` and `<script src>` tags, in order. So the script order you set in the HTML (which matters on this site) is kept exactly. If you add a page or a script later, **the build needs no change**.
2. **CSS:** puts all the `@import` files of `main.css` and the page's own CSS into one file.
3. **JS:** joins the page's scripts into one file, in the same order. They already shared one global scope, so nothing changes.
4. Rewrites the HTML so each page has **one CSS tag and one script tag**.
5. Adds a short code to each file URL (`bundle-home.js?v=1a2b3c4d`). When a file changes, the code changes, so visitors always get the new version. When it did not change, their browser keeps the saved copy.
6. Copies other files in `assets/` (images, fonts) unchanged. Skips `_page-template.html`.
7. If a page points to a file that does not exist, the build **stops and tells you which file** instead of making a broken site.

#### The benefit

Measured by loading the pages in a browser (number of local files requested):

| Page | Before | After |
|------|--------|-------|
| Home (`index.html`) | 46 | 3 (HTML + 1 CSS + 1 JS) |
| Car page | 46 | 3 |
| Login | 46 | 3 |

Across the site, 181 source files are loaded by the pages and now become 20 bundles (10 CSS + 10 JS).

- **Faster first load on a real host.** Far fewer requests, and no waiting for `main.css` to reveal the `@import` files.
- **No more stale files.** The `?v=` code solves the "I changed the file but the browser shows the old one" problem.
- **You keep the neat folders.** Editing stays easy; only `dist/` is combined.
- **A safety net.** A wrong file path is caught at build time, not by a visitor.
- **Your first Node tool**, as suggested in the notes. `--watch` mode rebuilds on save.

#### How it was checked
- Opened the built `dist/` pages in Chromium: all 10 pages were **pixel-identical** to the original, and the home and car page click tests gave the same results.
- Tested watch mode (it rebuilt after a file change and did not loop).
- Tested a missing file (build stops with a clear message).

#### Things to know
- **Do not edit `dist/`.** It is deleted and rebuilt each time. Edit the source files.
- **The bundles are joined, not shrunk.** File sizes stay the same; the gain is fewer requests. If you want smaller files later, a tool such as esbuild can minify the bundles (`npm install esbuild` is easy since you have npm). I did not add this because it could not be tested here without internet access, and it is not needed for a prototype.
- **One bundle per page**, not one for the whole site. The pages have page scripts that use the same variable names (for example `$` and `REVIEWS`), so a single shared file would break. The shared code (config, header, and so on) is repeated inside each page's bundle. This is a good trade for a site this size.
- Because the files are now one script, an error in an early file would stop the rest of that page's code. Before, later files still ran. This only matters when there is a bug, and the browser console shows the file name in the comment lines (`/* ---- assets/js/... ---- */`) to help you find it.
- Test `dist/` once with your real data in the browser (log in, make a booking, open the admin panel) before uploading. The automatic checks above cover loading, styling and the date pickers, not every feature of the site.

---

### Files changed

**New**
- `assets/js/components/date-picker.js`
- `build.js`
- `package.json`
- `.gitignore`
- `dist/` (the built site; you can delete it and run the build again anytime)

**Edited**
- `assets/js/pages/home.js` (shared calendar, 139 to 115 lines)
- `assets/js/pages/car.js` (shared calendar, 339 to 315 lines)
- `index.html`, `car.html` (new script tag)
- `_page-template.html` (note about the date picker)
- `README.md` (this file: new files, script order, build section, updated "next steps", and this report)

**Not touched:** all CSS source files, all other pages and scripts, and `services/auth.js` (item 1 is skipped).

### When you come back to item 1
It still stands: when you build the real backend (Next.js + PostgreSQL), keep the function names in `services/auth.js` and change what is inside them. Note that a move to Next.js will replace this static build step, because Next.js bundles CSS and JS for you. The shared date picker, however, will still be useful as a component.
