/* ═══════════════════════════════════════════════════════════
   components.js — CinemaX shared UI components
   Usage: add <script src="components.js"></script> to any
   page, then call the render functions you need.
═══════════════════════════════════════════════════════════ */

/* ─── Active nav link helper ─── */
function _setActiveNavLink() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link[data-page]').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });
}

/* ═══════════════════════════════════════
   NAVBAR
═══════════════════════════════════════ */
function renderNavbar(mountId = 'navbar-mount') {
  const el = document.getElementById(mountId);
  if (!el) return;
  el.innerHTML = `
    <nav class="topnav" id="topnav">
      <a href="index.html" class="nav-logo">CINEMA<em>X</em></a>
      <div class="nav-links">
        <a href="index.html"       class="nav-link" data-page="index.html">Home</a>
        <a href="movies.html"      class="nav-link" data-page="movies.html">Movies</a>
        <a href="series.html"      class="nav-link" data-page="series.html">Series</a>
        <a href="mylist.html"      class="nav-link" data-page="mylist.html">My List</a>
        <a href="plantowatch.html" class="nav-link" data-page="plantowatch.html">Plan to Watch</a>
      </div>
      <div class="nav-right">
        <button class="nav-icon-btn" aria-label="Search">
          <i class="ti ti-search" aria-hidden="true"></i>
        </button>
        <button class="nav-icon-btn" aria-label="Notifications">
          <i class="ti ti-bell" aria-hidden="true"></i>
        </button>
        <div class="nav-avatar" aria-label="Profile">
          <a href="admin/control.html">C</a>
        </div>
      </div>
    </nav>`;
  _setActiveNavLink();

  /* Sticky scroll effect */
  const nav = document.getElementById('topnav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

/* ═══════════════════════════════════════
   FOOTER
═══════════════════════════════════════ */
function renderFooter(mountId = 'footer-mount') {
  const el = document.getElementById(mountId);
  if (!el) return;
  el.innerHTML = `
    <footer class="site-footer">
      <div class="footer-top">
        <div class="footer-brand">
          <span class="footer-logo">CINEMA<em>X</em></span>
          <p class="footer-tagline">Watch. Experience. Feel.</p>
          <div class="footer-socials">
            <a href="#" aria-label="Facebook"><i class="ti ti-brand-facebook" aria-hidden="true"></i></a>
            <a href="#" aria-label="Instagram"><i class="ti ti-brand-instagram" aria-hidden="true"></i></a>
            <a href="#" aria-label="YouTube"><i class="ti ti-brand-youtube" aria-hidden="true"></i></a>
            <a href="https://github.com/ITechDummvry5" aria-label="GitHub"><i class="ti ti-brand-github" aria-hidden="true"></i></a>
          </div>
        </div>
        <div class="footer-cols">
          <div class="footer-col">
            <h4>Browse</h4>
            <a href="index.html">Home</a>
            <a href="movies.html">Movies</a>
            <a href="series.html">Series</a>
            <a href="mylist.html">My List</a>
            <a href="plantowatch.html">Plan to Watch</a>
          </div>
          <div class="footer-col">
            <h4>Account</h4>
            <a href="#">My Profile</a>
            <a href="mylist.html">Watchlist</a>
            <a href="#">Downloads</a>
            <a href="#">Settings</a>
            <a href="#">Help Center</a>
          </div>
          <div class="footer-col">
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Careers</a>
            <a href="#">Press</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms</a>
          </div>
        </div>
      </div>

      <div class="footer-top10-strip">
        <h4 class="footer-top10-heading">Popular This Week</h4>
        <div id="footerTop10"></div>
      </div>

      <div class="footer-bottom">
        <p>© 2025 CinemaX. All rights reserved.</p>
        <div class="footer-bottom-links">
          <a href="#">Cookie Preferences</a>
          <a href="#">Accessibility</a>
          <a href="#">Legal</a>
        </div>
      </div>
    </footer>

    <style>
      /* ── Top This Week full-width strip ── */
      .footer-top10-strip {
        border-top: 1px solid var(--border, rgba(255,255,255,.1));
        border-bottom: 1px solid var(--border, rgba(255,255,255,.1));
        padding: 20px 40px 24px;
        margin: 0;
      }

      .footer-top10-heading {
        font-size: 0.65rem;
        font-family: var(--font-mono, monospace);
        letter-spacing: .12em;
        text-transform: uppercase;
        color: var(--text-muted, rgba(255,255,255,.45));
        margin: 0 0 14px;
      }

      #footerTop10 {
        display: flex;
        flex-direction: row;
        gap: 14px;
        overflow-x: auto;
        scrollbar-width: none;   /* Firefox */
        -ms-overflow-style: none;
        padding-bottom: 4px;     /* prevent clipping shadows */
      }
      #footerTop10::-webkit-scrollbar { display: none; }

      .ft10-card {
        flex: 0 0 auto;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 7px;
        transition: transform .2s ease;
      }
      .ft10-card:hover { transform: translateY(-3px); }

      .ft10-poster {
        width: 80px;
        height: 114px;
        border-radius: 6px;
        background: var(--surface2, #1e1e2a) center / cover;
        border: 1px solid var(--border, rgba(255,255,255,.1));
        position: relative;
        overflow: hidden;
        box-shadow: 0 4px 14px rgba(0,0,0,.5);
      }

      .ft10-rank {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 22px 5px 5px;
        background: linear-gradient(to top, rgba(0,0,0,.85) 0%, transparent 100%);
        font-family: var(--font-mono, monospace);
        font-size: 1.05rem;
        font-weight: 700;
        color: var(--accent, #e50914);
        line-height: 1;
        text-align: center;
      }

      .ft10-title {
        font-family: var(--font-display, sans-serif);
        font-size: 0.68rem;
        color: var(--text, #fff);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 80px;
        text-align: center;
        opacity: .8;
      }
    </style>`;
}

/* ═══════════════════════════════════════
   FOOTER TOP 10
═══════════════════════════════════════ */
function renderFooterTop10() {
  const el = document.getElementById('footerTop10');
  if (!el) return;
  try {
    const items = JSON.parse(localStorage.getItem('cinemax_titles') || '[]')
      .filter(i => i.top10 && typeof i.top10 === 'number')
      .sort((a, b) => a.top10 - b.top10)
      .slice(0, 10);

    if (!items.length) {
      const strip = el.closest('.footer-top10-strip');
      if (strip) strip.style.display = 'none';
      return;
    }

    el.innerHTML = items.map(i => {
      const img = (i.img || '').replace(/^\.\.\/assets\//, 'assets/');
      return `
        <div class="ft10-card">
          <div class="ft10-poster" style="background-image:url('${img}')">
            <div class="ft10-rank">#${i.top10}</div>
          </div>
          <div class="ft10-title">${i.name || 'Untitled'}</div>
        </div>`;
    }).join('');
  } catch(e) {}
}

/* ═══════════════════════════════════════
   MOVIE DETAIL MODAL
═══════════════════════════════════════ */
function renderModal(mountId = 'modal-mount') {
  const el = document.getElementById(mountId);
  if (!el) return;
  el.innerHTML = `
    <div class="modal-backdrop" id="modalBackdrop" aria-hidden="true">
      <div class="modal" id="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
        <button class="modal-close" id="modalClose" aria-label="Close">
          <i class="ti ti-x" aria-hidden="true"></i>
        </button>
        <div class="modal-hero" id="modalHero"></div>
        <div class="modal-body">
          <div class="modal-badges" id="modalBadges"></div>
          <h2 class="modal-title" id="modalTitle"></h2>
          <div class="modal-meta" id="modalMeta"></div>
          <p class="modal-desc" id="modalDesc"></p>
          <div class="modal-actions">
            <button class="btn-play btn-play-lg" id="modalPlayBtn">
              <i class="ti ti-player-play-filled" aria-hidden="true"></i> Play
            </button>
            <button class="btn-icon-round" id="modalBookmarkBtn" aria-label="Bookmark">
              <i class="ti ti-bookmark" aria-hidden="true" id="modalBookmarkIcon"></i>
            </button>
            <button class="btn-icon-round" id="modalHeartBtn" aria-label="Like">
              <i class="ti ti-heart" aria-hidden="true" id="modalHeartIcon"></i>
            </button>
            <button class="btn-icon-round" aria-label="Share">
              <i class="ti ti-share" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>
    </div>`;
}
