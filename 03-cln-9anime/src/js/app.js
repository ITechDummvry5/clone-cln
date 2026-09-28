/* ═══════════════════════════════════════
   STORAGE KEY (shared with control panel)
═══════════════════════════════════════ */
const STORAGE_KEY = 'cinemax_titles';

/* ═══════════════════════════════════════
   FALLBACK DATA (used if no control data)
═══════════════════════════════════════ */
const FALLBACK = [];

/* ═══════════════════════════════════════
   LOAD DATA — from control panel storage
   or fall back to FALLBACK array
═══════════════════════════════════════ */
function loadItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return FALLBACK;
    const stored = JSON.parse(raw);
    if (!Array.isArray(stored) || !stored.length) return FALLBACK;

    // Map control panel format → ITEMS format
    return stored.map(s => {
      // genres array → primary genre string
      const genreArr = s.genres || [];
      const genre = genreArr[0] || 'Drama';

      // rating: control stores as number, we display as ★ X.X
      const ratingNum = parseFloat(s.rating) || 7.5;
      const ratingStr = `★ ${ratingNum.toFixed(1)}`;

      // tags: type is first tag, rest from genres
      const tags = [s.type || 'HD', ...genreArr.slice(0, 5)];

      // trending: use explicit field if present, otherwise fall back to Ongoing status
      const trending = typeof s.trending === 'boolean' ? s.trending : s.status === 'Ongoing';

      // top10: rank number (1,2,3…) or false
      const top10 = s.top10 ? (typeof s.top10 === 'number' ? s.top10 : true) : false;

      return {
        title:   s.name || 'Untitled',
        genre,
        genres:  genreArr,           // ← full genres array for filter matching
        desc:    s.desc || '',
        rating:  ratingStr,
        year:    s.year || '',
        runtime: s.runtime || '',
        tags,
        img:     normImg(s.img || ''),
        trending,
        top10,
        link:    s.link || '',
        _raw:    s,
      };
    });
  } catch(e) {
    return FALLBACK;
  }
}

/* Normalize img paths saved from admin (../assets/x.jpg) to root-relative (assets/x.jpg) */
function normImg(p){ return p ? p.replace(/^\.\.\/assets\//, 'assets/') : p; }

let ITEMS = loadItems();

/* ═══════════════════════════════════════
   CACHE DOM
═══════════════════════════════════════ */
const bgBackdrop    = document.getElementById('bgBackdrop');
const stage         = document.getElementById('stage');
const reflStage     = document.getElementById('reflectionStage');
const dotsEl        = document.getElementById('dots');
const heroMeta      = document.getElementById('heroMeta');
const heroTitle     = document.getElementById('heroTitle');
const heroDesc      = document.getElementById('heroDesc');
const heroBadges    = document.getElementById('heroBadges');
const heroStats     = document.getElementById('heroStats');
const topnav        = document.getElementById('topnav');
const trendingRow   = document.getElementById('trendingRow');
const topRatedRow   = document.getElementById('topRatedRow');
const modalBackdrop = document.getElementById('modalBackdrop');
const modalClose    = document.getElementById('modalClose');
const modalHero     = document.getElementById('modalHero');
const modalTitle    = document.getElementById('modalTitle');
const modalDesc     = document.getElementById('modalDesc');
const modalMeta     = document.getElementById('modalMeta');
const modalBadges   = document.getElementById('modalBadges');
const genreFilters  = document.getElementById('genreFilters');


let current = 0;

const cards  = [];
const refls  = [];
const dotEls = [];

/* ═══════════════════════════════════════
   COVERFLOW — BUILD
   Only top-ranked items (sorted by rank number)
═══════════════════════════════════════ */
function getCoverflowItems() {
  const ranked = ITEMS
    .filter(i => i.top10 && typeof i.top10 === 'number')
    .sort((a, b) => a.top10 - b.top10);
  return ranked.length ? ranked : ITEMS; // fallback to all if nothing ranked yet
}

function buildCoverflow() {
  const coverItems = getCoverflowItems();
  coverItems.forEach((item, i) => {
    /* card */
    const card = document.createElement('div');
    card.className = 'cf-card';
    card.tabIndex = 0;
    card.setAttribute('role', 'tab');
    card.setAttribute('aria-label', item.title);
    card.innerHTML = `
      <div class="cf-card-bg" style="background-image:url('${item.img}');"></div>
      <div class="cf-card-overlay"></div>
      <span class="cf-card-num">${String(item.top10 || (i + 1)).padStart(2, '0')}</span>
      <div class="cf-card-content">
        <div class="cf-card-genre">${item.genre}</div>
        <div class="cf-card-name">${item.title}</div>
      </div>`;
    card.addEventListener('click', () => goTo(i));
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goTo(i); } });
    stage.appendChild(card);
    cards.push(card);

    /* reflection */
    const refl = document.createElement('div');
    refl.className = 'cf-reflect';
    refl.innerHTML = `<div style="position:absolute;inset:0;background-image:url('${item.img}');background-size:cover;background-position:center;transform:scaleY(-1);transform-origin:top center;"></div>`;
    reflStage.appendChild(refl);
    refls.push(refl);

    /* dot */
    const dot = document.createElement('button');
    dot.className = 'dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to ${item.title}`);
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
    dotEls.push(dot);
  });
}

/* Preload */
function preloadImages() {
  ITEMS.forEach(item => { if (item.img) { const img = new Image(); img.src = item.img; } });
}

preloadImages();
buildCoverflow();

/* ═══════════════════════════════════════
   COVERFLOW — LAYOUT CONSTANTS
═══════════════════════════════════════ */
const SPREAD      = 158;
const SIDE_SPREAD = 78;
const ROT_Y       = 52;
const SCALE_1     = 0.75;
const SCALE_2     = 0.57;

/* ═══════════════════════════════════════
   RENDER
═══════════════════════════════════════ */
function render(skipHero) {
  cards.forEach((card, i) => {
    const off  = i - current;
    const abs  = Math.abs(off);
    const sign = Math.sign(off) || 1;
    const isActive = abs === 0;

    let tx, ry, scale, opacity, zIndex;
    if (abs === 0)      { tx = 0;                                  ry = 0;                    scale = 1;       opacity = 1;    zIndex = 20; }
    else if (abs === 1) { tx = sign * SPREAD;                      ry = -sign * ROT_Y;        scale = SCALE_1; opacity = 0.7;  zIndex = 10; }
    else if (abs === 2) { tx = sign * (SPREAD + SIDE_SPREAD);      ry = -sign * (ROT_Y + 10); scale = SCALE_2; opacity = 0.35; zIndex = 5;  }
    else                { tx = sign * (SPREAD + SIDE_SPREAD + 60); ry = -sign * 65;           scale = 0.44;    opacity = 0;    zIndex = 1;  }

    card.style.transform     = `translateX(${tx}px) rotateY(${ry}deg) scale(${scale})`;
    card.style.opacity       = opacity;
    card.style.zIndex        = zIndex;
    card.style.pointerEvents = abs <= 2 ? 'auto' : 'none';
    card.classList.toggle('is-active', isActive);
    card.setAttribute('aria-selected', isActive);

    const refl = refls[i];
    refl.style.transform = `translateX(${tx}px) rotateY(${ry}deg) scale(${scale}) scaleY(-0.24)`;
    refl.style.opacity   = isActive ? 0.28 : abs === 1 ? 0.12 : 0;
    refl.style.zIndex    = zIndex;
  });

  dotEls.forEach((dot, i) => {
    dot.classList.toggle('active', i === current);
    dot.setAttribute('aria-selected', i === current);
  });

  updateBackdrop();
  if (!skipHero) updateHero();
}

/* ═══════════════════════════════════════
   BACKDROP
═══════════════════════════════════════ */
let backdropImg = '';
function updateBackdrop() {
  const cf = getCoverflowItems();
  if (!cf[current]) return;
  const newImg = cf[current].img;
  if (newImg === backdropImg) return;
  backdropImg = newImg;
  bgBackdrop.classList.remove('loaded');
  const tmp = new Image();
  tmp.onload = () => {
    bgBackdrop.style.backgroundImage = `url('${newImg}')`;
    bgBackdrop.classList.add('loaded');
  };
  tmp.src = newImg;
}

/* ═══════════════════════════════════════
   HERO
═══════════════════════════════════════ */
function updateHero() {
  heroMeta.classList.add('fading');
  setTimeout(() => {
    const item = getCoverflowItems()[current];

    heroBadges.innerHTML =
      `<span class="badge gold">${item.rating}</span>` +
      item.tags.map((t, idx) => `<span class="badge${idx === 0 ? ' accent' : ''}">${t}</span>`).join('');

    heroTitle.textContent = item.title;
    heroDesc.textContent  = item.desc;
    heroStats.innerHTML   = `
      <span class="rating">${item.rating}</span>
      <span class="dot-sep">·</span>
      <span>${item.year}</span>
      ${item.runtime ? `<span class="dot-sep">·</span><span>${item.runtime}</span>` : ''}
      <span class="dot-sep">·</span>
      <span>${item.genre}</span>`;

    heroMeta.classList.remove('fading');

    /* Hero bookmark + heart state */
    const cf   = getCoverflowItems();
    const cur  = cf[current];
    const hid  = cur?._raw?.id;
    const hbBtn = document.getElementById('heroBookmarkBtn');
    const hbIco = document.getElementById('heroBookmarkIcon');
    const hhBtn = document.getElementById('heroHeartBtn');
    const hhIco = document.getElementById('heroHeartIcon');
    if (hbBtn && hid) {
      const saved = inList(MY_LIST_KEY, hid);
      hbIco.className = saved ? 'ti ti-bookmark-filled' : 'ti ti-bookmark';
      hbBtn.style.color = saved ? 'var(--accent2)' : '';
      hbBtn.onclick = () => {
        const added = toggleList(MY_LIST_KEY, hid);
        hbIco.className = added ? 'ti ti-bookmark-filled' : 'ti ti-bookmark';
        hbBtn.style.color = added ? 'var(--accent2)' : '';
        showCxToast(added ? `"${cur.title}" added to My List` : `"${cur.title}" removed from My List`, added ? 'success' : 'info');
      };
    }
    if (hhBtn && hid) {
      const saved = inList(PTW_KEY, hid);
      hhIco.className = saved ? 'ti ti-heart-filled' : 'ti ti-heart';
      hhBtn.style.color = saved ? 'var(--accent)' : '';
      hhBtn.onclick = () => {
        const added = toggleList(PTW_KEY, hid);
        hhIco.className = added ? 'ti ti-heart-filled' : 'ti ti-heart';
        hhBtn.style.color = added ? 'var(--accent)' : '';
        showCxToast(added ? `"${cur.title}" added to Plan to Watch ❤️` : `"${cur.title}" removed from Plan to Watch`, added ? 'heart' : 'info');
      };
    }
  }, 250);
}

/* ─── Wire hero buttons ─── */
document.querySelector('.btn-info').addEventListener('click', () => openModal(getCoverflowItems()[current]));
document.querySelector('.btn-play').addEventListener('click', () => {
  const link = getCoverflowItems()[current]?.link;
  if (link) window.open(link, '_blank');
});

/* ═══════════════════════════════════════
   NAVIGATION
═══════════════════════════════════════ */
function goTo(index) {
  const n = getCoverflowItems().length;
  current = ((index % n) + n) % n;
  render();
}
function prev() { goTo(current - 1); }
function next() { goTo(current + 1); }

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft')  { e.preventDefault(); prev(); }
  if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
  if (e.key === 'Escape')     closeModal();
});

/* Touch — scoped to coverflow only */
const cfRoot = document.getElementById('coverflow');
let touchX = null;
cfRoot.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
cfRoot.addEventListener('touchend', e => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (dx < -45) next(); else if (dx > 45) prev();
  touchX = null;
});

/* Drag */
let dragX = null;
cfRoot.addEventListener('mousedown', e => { dragX = e.clientX; });
document.addEventListener('mouseup', e => {
  if (dragX === null) return;
  const dx = e.clientX - dragX;
  if (Math.abs(dx) > 60) dx < 0 ? next() : prev();
  dragX = null;
});

/* Auto-play */
let autoTimer = setInterval(next, 5000);
cfRoot.addEventListener('mouseenter', () => clearInterval(autoTimer));
cfRoot.addEventListener('mouseleave', () => {
  clearInterval(autoTimer);
  autoTimer = setInterval(next, 5000);
});

/* ═══════════════════════════════════════
   STICKY NAVBAR
═══════════════════════════════════════ */
window.addEventListener('scroll', () => {
  topnav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ═══════════════════════════════════════
   BUILD MOVIE ROWS
═══════════════════════════════════════ */
function buildMovieCard(item, rank) {
  const card = document.createElement('div');
  card.className = 'movie-card';
  card.innerHTML = `
    <div class="mc-thumb">
      <div class="mc-img" style="background-image:url('${item.img}');"></div>
      ${rank ? `<span class="mc-rank">#${rank}</span>` : ''}
      <span class="mc-badge-quality">${item.tags[0] || 'HD'}</span>
      <div class="mc-overlay">
        <div class="mc-play-btn"><i class="ti ti-player-play-filled" aria-hidden="true"></i></div>
      </div>
    </div>
    <div class="mc-title">${item.title}</div>
    <div class="mc-meta">
      <span class="rating">${item.rating}</span>
      <span>·</span>
      <span>${item.year}</span>
      <span>·</span>
      <span class="mc-genre-tag">${item.genre}</span>
    </div>`;
  card.addEventListener('click', () => openModal(item));
  return card;
}

function buildTrendingRow(items) {
  trendingRow.innerHTML = '';
  const list = items
    .filter(i => i.trending)
    .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
  const section = document.getElementById('trendingSection');
  if (!list.length) { section.style.display = 'none'; return; }
  section.style.display = '';
  list.forEach((item) => {
    trendingRow.appendChild(buildMovieCard(item, null));
  });
}

function buildTopRatedRow(items) {
  topRatedRow.innerHTML = '';
  // Items that have a top10 rank number — sort by that rank
  const ranked = items
    .filter(i => i.top10 && typeof i.top10 === 'number')
    .sort((a, b) => a.top10 - b.top10);

  // If using fallback booleans (old format), fall back to rating sort
  const boolTop = items.filter(i => i.top10 === true);

  const list = ranked.length ? ranked : boolTop.length ? boolTop : items.slice(0, 8);

  list.forEach((item, idx) => {
    const rank = typeof item.top10 === 'number' ? item.top10 : idx + 1;
    topRatedRow.appendChild(buildMovieCard(item, rank));
  });
}

/* ═══════════════════════════════════════
   GENRE FILTER — built dynamically
═══════════════════════════════════════ */
let activeGenre = 'all';

function buildGenrePills() {
  let genres = [];
  try {
    const raw = localStorage.getItem('cinemax_genres');
    if (raw) {
      genres = JSON.parse(raw)
        .filter(g => g.status === 'active')
        .map(g => g.name)
        .sort((a, b) => a.localeCompare(b));
    }
  } catch(e) {}

  // Fallback: collect unique genres from items
  if (!genres.length) {
    const set = new Set();
    ITEMS.forEach(i => (i.genres || []).forEach(g => set.add(g)));
    genres = [...set].sort((a, b) => a.localeCompare(b));
  }

  genreFilters.innerHTML = '<button class="genre-pill active" data-genre="all">All</button>';
  genres.forEach(g => {
    const btn = document.createElement('button');
    btn.className = 'genre-pill';
    btn.dataset.genre = g;
    btn.textContent = g;
    genreFilters.appendChild(btn);
  });
}

genreFilters.addEventListener('click', e => {
  const pill = e.target.closest('.genre-pill');
  if (!pill) return;
  activeGenre = pill.dataset.genre;
  document.querySelectorAll('.genre-pill').forEach(p => p.classList.remove('active'));
  pill.classList.add('active');
  applyFilter();
});

function applyFilter() {
  const filtered = activeGenre === 'all'
    ? ITEMS
    : ITEMS.filter(i => {
        const allGenres = i.genres || [i.genre];
        return allGenres.includes(activeGenre) || i.tags.includes(activeGenre);
      });
  const src = filtered.length ? filtered : ITEMS;
  buildTrendingRow(src);
  buildTopRatedRow(src);
}

/* ═══════════════════════════════════════
   MODAL
═══════════════════════════════════════ */
/* ═══════════════════════════════════════
   MY LIST & PLAN TO WATCH HELPERS
═══════════════════════════════════════ */
const MY_LIST_KEY = 'cinemax_mylist';
const PTW_KEY     = 'cinemax_plantowatch';

function _getList(key)       { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch(e) { return []; } }
function _saveList(key, arr) { localStorage.setItem(key, JSON.stringify(arr)); }

function toggleList(key, id) {
  const list = _getList(key);
  const idx  = list.indexOf(id);
  if (idx > -1) { list.splice(idx, 1); _saveList(key, list); return false; }
  else          { list.push(id);       _saveList(key, list); return true; }
}
function inList(key, id) { return _getList(key).includes(id); }

/* Toast */
let _cxToastTimer;
function showCxToast(msg, type = 'success') {
  clearTimeout(_cxToastTimer);
  let toast = document.getElementById('cxToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'cxToast';
    toast.style.cssText = 'position:fixed;bottom:1.75rem;right:1.75rem;z-index:999;background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:0.85rem 1.25rem;display:flex;align-items:center;gap:10px;font-family:var(--font-body);font-size:0.84rem;box-shadow:0 8px 32px rgba(0,0,0,0.5);transform:translateY(120%);opacity:0;transition:transform 0.35s var(--ease),opacity 0.35s;max-width:300px;pointer-events:none;';
    toast.innerHTML = '<i id="cxToastIcon" style="font-size:1.1rem"></i><span id="cxToastMsg"></span>';
    document.body.appendChild(toast);
  }
  const icons = { success:'ti ti-check', error:'ti ti-alert-circle', info:'ti ti-info-circle', heart:'ti ti-heart-filled' };
  const colors= { success:'#22c55e', error:'#e50914', info:'#3b82f6', heart:'#e50914' };
  const icon  = document.getElementById('cxToastIcon');
  icon.className = icons[type] || 'ti ti-check';
  icon.style.color = colors[type] || '#22c55e';
  document.getElementById('cxToastMsg').textContent = msg;
  toast.style.transform = 'translateY(0)';
  toast.style.opacity   = '1';
  _cxToastTimer = setTimeout(() => { toast.style.transform = 'translateY(120%)'; toast.style.opacity = '0'; }, 3000);
}

function openModal(item) {
  modalHero.style.backgroundImage = `url('${item.img}')`;
  modalTitle.textContent = item.title;
  modalDesc.textContent  = item.desc;
  modalMeta.innerHTML    = `
    <span class="rating">${item.rating}</span>
    <span class="dot-sep">·</span>
    <span>${item.year}</span>
    ${item.runtime ? `<span class="dot-sep">·</span><span>${item.runtime}</span>` : ''}
    <span class="dot-sep">·</span>
    <span>${item.genre}</span>`;
  modalBadges.innerHTML  = item.tags
    .map((t, i) => `<span class="badge${i === 0 ? ' accent' : ''}">${t}</span>`).join('');
  modalBackdrop.classList.add('open');
  modalBackdrop.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  /* Play button */
  const playBtn = document.getElementById('modalPlayBtn');
  if (playBtn) {
    playBtn.onclick = () => { if (item.link) window.open(item.link, '_blank'); };
    playBtn.style.opacity = item.link ? '1' : '0.4';
    playBtn.style.cursor  = item.link ? 'pointer' : 'not-allowed';
  }

  /* Bookmark button — My List */
  const bookmarkBtn  = document.getElementById('modalBookmarkBtn');
  const bookmarkIcon = document.getElementById('modalBookmarkIcon');
  if (bookmarkBtn && item._raw) {
    const id = item._raw.id;
    const updateBookmark = () => {
      const saved = inList(MY_LIST_KEY, id);
      bookmarkIcon.className = saved ? 'ti ti-bookmark-filled' : 'ti ti-bookmark';
      bookmarkBtn.style.color = saved ? 'var(--accent2)' : '';
    };
    updateBookmark();
    bookmarkBtn.onclick = () => {
      const added = toggleList(MY_LIST_KEY, id);
      updateBookmark();
      showCxToast(added ? `"${item.title}" added to My List` : `"${item.title}" removed from My List`, added ? 'success' : 'info');
    };
  }

  /* Heart button — Plan to Watch */
  const heartBtn  = document.getElementById('modalHeartBtn');
  const heartIcon = document.getElementById('modalHeartIcon');
  if (heartBtn && item._raw) {
    const id = item._raw.id;
    const updateHeart = () => {
      const saved = inList(PTW_KEY, id);
      heartIcon.className = saved ? 'ti ti-heart-filled' : 'ti ti-heart';
      heartBtn.style.color = saved ? 'var(--accent)' : '';
    };
    updateHeart();
    heartBtn.onclick = () => {
      const added = toggleList(PTW_KEY, id);
      updateHeart();
      showCxToast(added ? `"${item.title}" added to Plan to Watch ❤️` : `"${item.title}" removed from Plan to Watch`, added ? 'heart' : 'info');
    };
  }
}

function closeModal() {
  modalBackdrop.classList.remove('open');
  modalBackdrop.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', e => { if (e.target === modalBackdrop) closeModal(); });

/* ═══════════════════════════════════════
   LIVE SYNC — reload when control panel saves
   (storage event only fires in OTHER tabs/windows
   that share the same origin)
═══════════════════════════════════════ */
window.addEventListener('storage', e => {
  if (e.key === 'cinemax_genres') { buildGenrePills(); return; }
  if (e.key !== STORAGE_KEY) return;
  ITEMS = loadItems();

  // Rebuild coverflow
  stage.innerHTML    = '';
  reflStage.innerHTML = '';
  dotsEl.innerHTML   = '';
  cards.length  = 0;
  refls.length  = 0;
  dotEls.length = 0;
  buildCoverflow();
  current = 0;
  render(true);

  const cfItems = getCoverflowItems();
  if (cfItems.length) {
    const first = cfItems[0];
    heroBadges.innerHTML =
      `<span class="badge gold">${first.rating}</span>` +
      first.tags.map((t, idx) => `<span class="badge${idx === 0 ? ' accent' : ''}">${t}</span>`).join('');
    heroTitle.textContent = first.title;
    heroDesc.textContent  = first.desc;
    heroStats.innerHTML   = `
      <span class="rating">${first.rating}</span>
      <span class="dot-sep">·</span>
      <span>${first.year}</span>
      ${first.runtime ? `<span class="dot-sep">·</span><span>${first.runtime}</span>` : ''}
      <span class="dot-sep">·</span>
      <span>${first.genre}</span>`;
  }
  applyFilter();
});

/* ═══════════════════════════════════════
   INIT
═══════════════════════════════════════ */
render(true);

/* Set initial hero without animation */
const _cfInit = getCoverflowItems();
if (_cfInit.length) {
  const first = _cfInit[0];
  heroBadges.innerHTML =
    `<span class="badge gold">${first.rating}</span>` +
    first.tags.map((t, i) => `<span class="badge${i === 0 ? ' accent' : ''}">${t}</span>`).join('');
  heroTitle.textContent = first.title;
  heroDesc.textContent  = first.desc;
  heroStats.innerHTML   = `
    <span class="rating">${first.rating}</span>
    <span class="dot-sep">·</span>
    <span>${first.year}</span>
    ${first.runtime ? `<span class="dot-sep">·</span><span>${first.runtime}</span>` : ''}
    <span class="dot-sep">·</span>
    <span>${first.genre}</span>`;
}

buildTrendingRow(ITEMS);
buildTopRatedRow(ITEMS);

buildGenrePills();
