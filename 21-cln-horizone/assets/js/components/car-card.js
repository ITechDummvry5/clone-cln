// Grid car card, shared by the cars page and the location page. Styles: css/components/car-card.css
// carCard(car, href) -> HTML string. href is the car page link (each page decides what search to carry over).
const carCard = (c, href) => `
    <article class="car" data-href="${href}"><div><small>${c[1]}</small><h3>${c[0]}</h3><small>${c[2]} · ${c[3]}${c[7] ? ' · ' + c[7] + ' km' : ''}</small></div>
      <div class="pic"><img src="${IMG.fleet[c[0]]}" alt="" loading="lazy"></div>
      <div class="row"><div><span>From</span><b>${HZC.usd(c[6])} <span>/ day</span></b></div><a class="go" href="${href}" aria-label="View ${c[0]}">→</a></div>
    </article>`;
