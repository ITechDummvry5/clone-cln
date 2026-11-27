hydrateImages();
const $ = (id) => document.getElementById(id);

// Promo codes come from Admin > Deals (nothing is hard-coded). Only active, not-yet-expired deals are shown.
const DEALS = HZDEALS.live();
const FEATURED = DEALS.find(d => d.featured), PROMOS = DEALS.filter(d => d !== FEATURED);
const until = d => d.validUntil ? `Valid until ${HZDEALS.fmtDate(d.validUntil)}` : 'No end date';
const txt = d => HZC.inText(esc(d.text || HZDEALS.ruleText(d)));
const big = d => d.kind === 'percent' ? `${+d.value}%` : HZC.usd(+d.value);
// The "Savings that apply on their own" cards come from Admin > Website > Deals page cards. The weekly, monthly and one-way cards
// fill themselves in from the real settings (Long-rental rates, One-way routes), so this page never promises something checkout doesn't give.
const LS = HZFORM.longstay(), CAP = +LS.cap || 0;
const pc = n => `${+n}%`;
const AUTO = HZFORM.savingsCards().filter(c => c.show), HEAD = HZFORM.savingsHead();
$('savTitle').textContent = HEAD.title;
$('savSub').textContent = HEAD.sub; $('savSub').hidden = !HEAD.sub;
const TERMS = [
  ['How promo codes work','Enter one code per booking at checkout, or tap “Use this deal”. Codes stack with the automatic savings: the weekly or monthly rate comes off the base rental first, then your code applies to what is left' + (CAP > 0 ? `. Together they can take off at most ${pc(CAP)} of the base rental price.` : '.') + ' Every discount shows in your total before you pay.'],
  ['Do weekly and monthly rates add together?','No. One automatic rate applies per booking, whichever is bigger for your rental length. It takes a percentage off the base rental price only, not off extras, protection or fees.'],
  ['What if my code isn’t accepted?','Check the minimum rental length, the vehicle type and the valid-until date. If it still fails, send us the code and your booking reference from the help centre.'],
  ['Do cancelled bookings keep the discount?','No. Cancelling releases the code, and you can use it again on a new booking while it is still valid.'],
];
function copy(btn) {
  navigator.clipboard?.writeText(btn.dataset.code);
  const t = btn.innerHTML; btn.textContent = 'Copied';
  setTimeout(() => btn.innerHTML = t, 1500);
}
if (FEATURED) {
  $('bigSec').hidden = false;
  $('big').innerHTML = `<div><span class="tag">${until(FEATURED)}</span><h2>${big(FEATURED)}</h2><h3>${esc(FEATURED.headline)}</h3><p>${txt(FEATURED)}</p></div>
    <div class="codebox"><small>Promo code</small><button class="code" data-code="${esc(FEATURED.code)}">${esc(FEATURED.code)}</button><a class="btn light" href="cars.html?promo=${encodeURIComponent(FEATURED.code)}">Use this deal →</a><small>Tap the code to copy it, or use the deal and we’ll add it at checkout.</small></div>`;
  // Only a picture the admin set is used behind the banner (never the grey placeholder). A dark layer on top keeps the text readable.
  const bg = HZDEALS.imgUrl({ img: FEATURED.img });
  if (bg) $('big').style.backgroundImage = `linear-gradient(120deg,rgba(27,20,16,.88),rgba(138,74,28,.62)),url("${bg.replace(/"/g, '%22')}")`;
}
$('promos').innerHTML = PROMOS.length ? PROMOS.map(p => `<article class="promo"><div class="pic"${HZDEALS.imgUrl(p) ? '' : ' style="background:var(--soft,#eee)"'}>${HZDEALS.imgUrl(p) ? img(HZDEALS.imgUrl(p)) : ''}<span class="badge">${esc(p.title)}</span></div>
  <div class="body"><small>${until(p)}</small><h3>${esc(p.headline)}</h3><p>${txt(p)}</p>${p.note ? `<p>${esc(p.note)}</p>` : ''}
  <div class="act"><button class="code" data-code="${esc(p.code)}">${esc(p.code)}</button><a class="btn" href="cars.html?promo=${encodeURIComponent(p.code)}">Use this deal</a></div></div></article>`).join('')
  : (FEATURED ? '' : '<p class="sub">There are no promo codes right now. Check back soon.</p>');
if (!PROMOS.length && FEATURED) $('promos').closest('section').hidden = true;
if (!AUTO.length) $('auto').closest('section').hidden = true;
const FREE = (AUTO.find(a => a.kind === 'oneway') || {}).pairs || [];
const chips = a => a.kind === 'oneway' && FREE.length ? `<button type="button" class="sv-see" aria-haspopup="dialog">See list</button>` : '';
let dlg = null;
function freeList() {
  if (!dlg) {
    dlg = document.createElement('dialog'); dlg.className = 'sv-dlg'; dlg.setAttribute('aria-label', 'Free one-way routes');
    dlg.innerHTML = `<div class="sv-dh"><div><h3>Free one-way routes</h3><p>${FREE.length} route${FREE.length === 1 ? '' : 's'} with no drop fee. Each works both ways.</p></div><button type="button" class="sv-x" aria-label="Close">×</button></div>
      <ul>${FREE.map(r => `<li><span>${esc(r[0])} ⇄ ${esc(r[1])}</span><a href="cars.html?pickup=${encodeURIComponent(r[0])}&ret=${encodeURIComponent(r[1])}">Search cars</a></li>`).join('')}</ul>`;
    dlg.addEventListener('click', e => { if (e.target === dlg || e.target.closest('.sv-x')) dlg.close(); });
    document.body.appendChild(dlg);
  }
  dlg.showModal();
}
$('auto').addEventListener('click', e => { if (e.target.closest('.sv-see')) freeList(); });
$('auto').innerHTML = AUTO.map(a => {
  const big = a.usd ? (() => { const t = document.createElement('div'); t.innerHTML = HZC.usd(0); return t.textContent; })() : a.big, m = big ? /^([^\d]*)([\d.,]+)(.*)$/.exec(String(big).trim()) : null;
  const num = !big ? '' : m ? `<div class="sv-n" aria-label="${esc(big)}">${m[1] ? `<sup>${esc(m[1])}</sup>` : ''}<span>${esc(m[2])}</span>${m[3] ? `<sup>${esc(m[3])}</sup>` : ''}</div>` : `<div class="sv-n"><span>${esc(big)}</span></div>`;
  return `<div class="sv">${num}<div class="sv-t">${a.title ? `<b>${esc(a.title)}</b>` : ''}${a.text ? `<p>${esc(a.text)}</p>` : ''}${chips(a)}</div></div>`; }).join('');
$('terms').innerHTML = TERMS.map(t => `<details><summary>${t[0]}</summary><p>${t[1]}</p></details>`).join('');
document.addEventListener('click', e => { const b = e.target.closest('.code'); if (b) copy(b); });
$('alert').onsubmit = e => { e.preventDefault(); e.target.innerHTML = '<p class="sub">You’re on the list. Watch your inbox.</p>'; };
