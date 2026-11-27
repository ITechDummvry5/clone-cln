// Isometric "not found" illustration + the shared not-found layout.
// Styles: css/components/isometric.css (black, white and gray, like the rest of the site).
//   isoNotFound(root, opts)  fills root with text on the left and the animated illustration on the right.
//   opts: { eyebrow, title, text, actions: [[label, href, 'ghost'?]], tryTitle, chips: [[label, href]] }
// Needs core/utils.js (esc) loaded first.

const ISO_ART = `<div class="iso-hold-illustration iso-3d">
    <div class="iso-background iso-cf">
      <div class="iso-left-strip"></div>
      <div class="iso-top-bar"><div class="iso-dot"></div><div class="iso-_2 iso-dot"></div><div class="iso-_3 iso-dot"></div></div>

      <div class="iso-text-like-box iso-cf">
        <div class="iso-straight-line" data-ix="arrow-load"></div>
        <div class="iso-straight-line-full" data-ix="loading-line-animation"></div>
        <div class="iso-straight-line-full" data-ix="loading-line-animation-2"></div>
        <div class="iso-straight-line-full" data-ix="loading-line-animation-3"></div>
        <div class="iso-straight-line-full" data-ix="loading-line-animation-6-long"></div>
        <div class="iso-straight-line-full" data-ix="loading-line-animation-5"></div>
        <div class="iso-shortened iso-straight-line-full" data-ix="loading-line-animation-6shorted"></div>
      </div>

      <div class="iso-mountain-photo-parent">
        <div class="iso-mountain-photo__real-deal" data-ix="arrow-load">
          <div class="iso-mountain" data-ix="mountain-slide-in-from-left"></div>
          <div class="iso-_2 iso-mountain" data-ix="mountain-slide-in"></div>
        </div>
        <div class="iso-arrow-line" data-ix="arrow-load"><div class="iso-arrow-line-small"></div><div class="iso-arrow-line-small iso-v2"></div></div>
      </div>

      <div class="iso-square-tower" data-ix="arrow-load">
        <div class="iso-play-box iso-3d">
          <div class="iso-play-box__top-bar"></div>
          <div class="iso-overflow-hidden"><div class="iso-play-box__play-icon" data-ix="play-icon-on-load"></div></div>
        </div>
        <div class="iso-play-box__square-1 iso-3d"></div>
        <div class="iso-play-box__square-2 iso-3d"></div>
        <div class="iso-play-box__square-bottom"></div>
      </div>

      <div class="iso-tri-parent iso-cf">
        <div class="iso-column" data-ix="column-hover">
          <div class="iso-circle" data-ix="pop-in"></div>
          <div class="iso-straight-line-full" data-ix="loading-line-animation"></div>
          <div class="iso-straight-line-full" data-ix="loading-line-animation-2"></div>
          <div class="iso-straight-line-full" data-ix="loading-line-animation-3"></div>
        </div>
        <div class="iso-column" data-ix="column-hover-2">
          <div class="iso-circle" data-ix="pop-in-2"></div>
          <div class="iso-straight-line-full" data-ix="loading-line-animation"></div>
          <div class="iso-straight-line-full" data-ix="loading-line-animation-2"></div>
          <div class="iso-straight-line-full" data-ix="loading-line-animation-3"></div>
        </div>
        <div class="iso-column" data-ix="column-hover-3">
          <div class="iso-circle" data-ix="pop-in-3"></div>
          <div class="iso-straight-line-full" data-ix="loading-line-animation"></div>
          <div class="iso-straight-line-full" data-ix="loading-line-animation-2"></div>
          <div class="iso-straight-line-full" data-ix="loading-line-animation-3"></div>
        </div>
        <div class="iso-string-block" data-ix="hovering-on-load-string-block">
          <div class="iso-square"><div class="iso-connector-bar"></div></div>
          <div class="iso-_2 iso-square"></div>
          <div class="iso-_3 iso-square"><div class="iso-connector-bar"></div></div>
        </div>
        <div class="iso-bottom iso-text-like-box iso-v2 iso-cf" data-ix="column-hover">
          <div class="iso-straight-line-full" data-ix="loading-line-animation"></div>
          <div class="iso-straight-line-full" data-ix="loading-line-animation-2"></div>
          <div class="iso-straight-line-full" data-ix="loading-line-animation-3"></div>
          <div class="iso-straight-line-full" data-ix="loading-line-animation-6-long"></div>
          <div class="iso-shortened iso-straight-line-full" data-ix="loading-line-animation-4-shortened"></div>
          <div class="iso-mountain-photo__real-deal iso-small" data-ix="column-hover">
            <div class="iso-mountain iso-shrunked" data-ix="mountain-slide-in-from-left"></div>
            <div class="iso-_2 iso-mountain iso-shrunked" data-ix="mountain-slide-in"></div>
          </div>
          <div class="iso-mountain-photo__real-deal iso-no-mountains iso-small" data-ix="column-hover"></div>
        </div>
      </div>

      <div class="iso-bottom iso-text-like-box" data-ix="column-hover">
        <div class="iso-straight-line-full" data-ix="loading-line-animation"></div>
        <div class="iso-straight-line-full" data-ix="loading-line-animation-2"></div>
        <div class="iso-straight-line-full" data-ix="loading-line-animation-3"></div>
        <div class="iso-shortened iso-straight-line-full" data-ix="loading-line-animation-4-shortened"></div>
      </div>
      <div class="iso-bottom-line-bar" data-ix="column-hover-3"></div>
      <div class="iso-circle-tower" data-ix="column-hover">
        <div class="iso-circle-top iso-3d"></div>
        <div class="iso-_2 iso-circle-top iso-3d"></div>
        <div class="iso-_3 iso-circle-top"></div>
      </div>
    </div>
  </div>`;

// The illustration inside its black stage. aria-hidden: it is decoration.
const isoStage = () => `<div class="iso-stage iso" data-iso aria-hidden="true">${ISO_ART}</div>`;

// Plays the load-in (lines draw, blocks slide). With reduced motion, or without this call, the illustration just shows.
function isoStart(scope = document) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  scope.querySelectorAll('[data-iso]').forEach(el => {
    if (reduce) return;
    el.querySelectorAll('[data-ix]').forEach((n, i) => { n.style.transitionDelay = i * 35 + 'ms'; });   // stagger
    el.classList.add('pre');
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('ready')));
  });
}

function isoNotFound(root, o) {
  root.innerHTML = `
    <div class="nf"><div>
      ${o.eyebrow ? `<span class="eyebrow">${esc(o.eyebrow)}</span>` : ''}
      <h1>${esc(o.title)}</h1><p>${esc(o.text)}</p>
      <div class="acts">${(o.actions || []).map(a => `<a class="btn${a[2] ? ' ' + a[2] : ''}" href="${esc(a[1])}">${esc(a[0])}</a>`).join('')}</div>
      ${o.chips && o.chips.length ? `<div class="try"><small>${esc(o.tryTitle || 'Try one of these')}</small><div>${o.chips.map(c => `<a href="${esc(c[1])}">${esc(c[0])}</a>`).join('')}</div></div>` : ''}
    </div>${isoStage()}</div>`;
  isoStart(root);
}
