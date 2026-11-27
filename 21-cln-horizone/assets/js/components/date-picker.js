// Shared date helpers and the calendar popup. Used by pages/home.js (hero search) and pages/car.js (booking panel).
// Everything lives on one global, HZDate, so it cannot clash with names inside a page script.
//
//   HZDate.today()                 today at 00:00
//   HZDate.add(date, n)            a new date n days later (n can be negative)
//   HZDate.same(a, b)              true when both are the same day
//   HZDate.iso(date)               "2026-07-31"          (what is stored and put in URLs)
//   HZDate.parse("2026-07-31")     back to a Date at 00:00
//   HZDate.fmtUS(date)             "07/31/2026"          (hero search buttons)
//   HZDate.fmtShort(date)          "Jul 31, 2026"        (booking panel buttons)
//   HZDate.TIMES                   ["6:00 AM", "6:30 AM", ... "10:00 PM"]
//   HZDate.calendar(pop, options)  draws a month calendar into an element you created (see below)
//
// The popup element itself (position, open/close, outside clicks) stays with the page, because the two pages
// place it differently. This file only draws the calendar inside it and reports the day that was picked.
const HZDate = (() => {
  const p2 = n => String(n).padStart(2, '0');
  const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const add = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const same = (a, b) => a.getTime() === b.getTime();
  const iso = d => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
  const parse = s => new Date(s + 'T00:00');
  const fmtUS = d => `${p2(d.getMonth() + 1)}/${p2(d.getDate())}/${d.getFullYear()}`;
  const fmtShort = d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Pick-up / return times come from Admin > Forms > Pick-up & return times (default 6:00 AM to 10:00 PM, every 30 minutes).
  const TIMES = [], TC = (HZStore.get('hz-form', {}) || {}).times || {};
  const T0 = Number.isInteger(TC.start) ? TC.start : 6 * 60, T1 = Number.isInteger(TC.end) ? TC.end : 22 * 60, TS = [15, 30, 60].includes(TC.step) ? TC.step : 30;
  for (let t = T0; t <= (T1 >= T0 ? T1 : T0); t += TS) {
    const h = Math.floor(t / 60);
    TIMES.push(`${((h + 11) % 12) + 1}:${p2(t % 60)} ${h < 12 ? 'AM' : 'PM'}`);
  }

  // Draws a calendar into `pop` and calls options.onPick(date) when a day is clicked.
  //   value  Date  the month that is shown first
  //   from   Date  start of the highlighted range (the pick-up day)
  //   to     Date  end of the highlighted range (the return day)
  //   min    Date  days before this one are disabled
  //   onPick fn    receives the chosen Date; the caller closes the popup and updates its own state
  function calendar(pop, { value, from, to, min, onPick }) {
    const now = today();
    let view = new Date(value.getFullYear(), value.getMonth(), 1);
    const draw = () => {
      const y = view.getFullYear(), mo = view.getMonth();
      const first = new Date(y, mo, 1).getDay(), n = new Date(y, mo + 1, 0).getDate();
      let cells = '<span></span>'.repeat(first);
      for (let d = 1; d <= n; d++) {
        const x = new Date(y, mo, d);
        const cls = [same(x, now) && 'today', (same(x, from) || same(x, to)) ? 'sel' : (x > from && x < to ? 'rng' : '')].filter(Boolean).join(' ');
        cells += `<button type="button" data-d="${iso(x)}" class="${cls}"${x < min ? ' disabled' : ''}>${d}</button>`;
      }
      pop.innerHTML = `<div class="cal"><div class="calh"><button type="button" data-n="-1" aria-label="Previous month">‹</button><b>${view.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</b><button type="button" data-n="1" aria-label="Next month">›</button></div>
        <div class="cg">${[...'SMTWTFS'].map(d => `<i>${d}</i>`).join('')}${cells}</div><div class="calf"><button type="button" data-today>Today</button></div></div>`;
    };
    draw();
    pop.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.n) { view = new Date(view.getFullYear(), view.getMonth() + +b.dataset.n, 1); draw(); }
      else if ('today' in b.dataset) { view = new Date(now.getFullYear(), now.getMonth(), 1); draw(); }
      else if (b.dataset.d) onPick(parse(b.dataset.d));
    });
  }

  const DEFAULT_TIME = TIMES.includes('10:00 AM') ? '10:00 AM' : TIMES[Math.floor(TIMES.length / 3)] || TIMES[0];
  return { today, add, same, iso, parse, fmtUS, fmtShort, TIMES, DEFAULT_TIME, calendar };
})();
