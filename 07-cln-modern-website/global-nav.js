(function() {
  // 1. Inject Styles dynamically into the head
  const css = `
    /* ==========================================================================
       GLOBAL NAV & AUTH MODAL STYLING (Self-contained and premium)
       ========================================================================== */
    :root {
      --ease-premium: cubic-bezier(0.16, 1, 0.3, 1);
      --border-light: rgba(255, 255, 255, 0.08);
      --border-active: rgba(255, 255, 255, 0.2);
      --accent-blue: hsl(200, 100%, 70%);
      --bg-card: hsla(240, 10%, 6%, 0.55);
      --font-display: 'Outfit', sans-serif;
      --font-body: 'Inter', sans-serif;
      --text-primary: hsl(0, 0%, 98%);
      --text-secondary: hsl(240, 3%, 70%);
      --text-tertiary: hsl(240, 2%, 45%);
    }

    /* Fixed floating navbar at the bottom left */
    .main-header {
      position: fixed !important;
      bottom: 2rem !important;
      left: 2rem !important;
      height: 52px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: flex-start !important;
      gap: 1.5rem !important;
      padding: 0 1.5rem !important;
      z-index: 2000 !important;
      background: rgba(12, 13, 16, 0.35) !important;
      backdrop-filter: blur(25px) !important;
      -webkit-backdrop-filter: blur(25px) !important;
      border: 1px solid rgba(255, 255, 255, 0.06) !important;
      border-radius: 26px !important;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;
      transition: background 0.3s ease, border-color 0.3s ease, transform 0.3s ease !important;
      width: auto !important;
      pointer-events: auto !important;
      right: auto !important;
      top: auto !important;
    }

    .main-header:hover {
      background: rgba(12, 13, 16, 0.5) !important;
      border-color: rgba(255, 255, 255, 0.12) !important;
    }

    .header-logo {
      font-family: var(--font-display) !important;
      font-size: 0.95rem !important;
      font-weight: 800 !important;
      letter-spacing: 0.2rem !important;
      color: var(--text-primary) !important;
      cursor: pointer !important;
      border-right: 1px solid rgba(255, 255, 255, 0.08) !important;
      padding-right: 1.2rem !important;
      height: 20px !important;
      display: flex !important;
      align-items: center !important;
      text-decoration: none !important;
    }

    .header-nav {
      display: flex !important;
      gap: 1.5rem !important;
      align-items: center !important;
      list-style: none !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    .nav-link {
      font-family: var(--font-display) !important;
      font-size: 0.65rem !important;
      font-weight: 600 !important;
      letter-spacing: 0.1rem !important;
      text-transform: uppercase !important;
      color: var(--text-secondary) !important;
      text-decoration: none !important;
      transition: color 0.3s ease !important;
      position: relative !important;
      padding: 0.4rem 0 !important;
      display: inline-block !important;
    }

    .nav-link::after {
      content: '' !important;
      position: absolute !important;
      bottom: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 1px !important;
      background: var(--accent-blue) !important;
      transform: scaleX(0) !important;
      transform-origin: right !important;
      transition: transform 0.3s var(--ease-premium) !important;
    }

    .nav-link:hover {
      color: var(--text-primary) !important;
    }

    .nav-link:hover::after,
    .nav-link.active::after {
      transform: scaleX(1) !important;
      transform-origin: left !important;
    }

    .nav-link.active {
      color: var(--text-primary) !important;
    }

    .header-actions {
      display: flex !important;
      align-items: center !important;
    }

    .auth-btn {
      background: rgba(255, 255, 255, 0.04) !important;
      border: 1px solid var(--border-light) !important;
      border-radius: 16px !important;
      padding: 0.4rem 1rem !important;
      color: var(--text-primary) !important;
      font-family: var(--font-display) !important;
      font-size: 0.6rem !important;
      font-weight: 700 !important;
      letter-spacing: 0.05rem !important;
      text-transform: uppercase !important;
      cursor: pointer !important;
      transition: background 0.3s, border-color 0.3s, transform 0.2s !important;
      outline: none !important;
      display: inline-flex !important;
      align-items: center !important;
    }

    .auth-btn:hover {
      background: rgba(255, 255, 255, 0.09) !important;
      border-color: var(--border-active) !important;
      transform: translateY(-1px) !important;
    }

    .auth-btn:active {
      transform: translateY(0) !important;
    }

    /* Hamburger Menu Button */
    .hamburger-btn {
      display: none !important;
      flex-direction: column !important;
      justify-content: space-between !important;
      width: 20px !important;
      height: 14px !important;
      background: none !important;
      border: none !important;
      cursor: pointer !important;
      padding: 0 !important;
      z-index: 2001 !important;
      outline: none !important;
    }

    .hamburger-line {
      width: 100% !important;
      height: 2px !important;
      background-color: var(--text-primary) !important;
      border-radius: 2px !important;
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease, background-color 0.4s ease !important;
      transform-origin: center !important;
    }

    /* Hamburger Morphing to 'X' */
    .hamburger-btn.active .hamburger-line:nth-child(1) {
      transform: translateY(6px) rotate(45deg) !important;
    }

    .hamburger-btn.active .hamburger-line:nth-child(2) {
      opacity: 0 !important;
      transform: scaleX(0) !important;
    }

    .hamburger-btn.active .hamburger-line:nth-child(3) {
      transform: translateY(-6px) rotate(-45deg) !important;
    }

    /* Glassmorphic Mobile Drawer Overlay */
    .mobile-nav-overlay {
      position: fixed !important;
      inset: 0 !important;
      background: rgba(4, 4, 6, 0.45) !important;
      backdrop-filter: blur(25px) !important;
      -webkit-backdrop-filter: blur(25px) !important;
      z-index: 1999 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      opacity: 0 !important;
      pointer-events: none !important;
      transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1) !important;
    }

    .mobile-nav-overlay.active {
      opacity: 1 !important;
      pointer-events: auto !important;
    }

    .mobile-nav-content {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      gap: 2rem !important;
      transform: translateY(30px) scale(0.95) !important;
      transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) !important;
    }

    .mobile-nav-overlay.active .mobile-nav-content {
      transform: translateY(0) scale(1) !important;
    }

    .mobile-nav-link {
      font-family: var(--font-display) !important;
      font-size: 1.75rem !important;
      font-weight: 700 !important;
      letter-spacing: 0.15rem !important;
      text-transform: uppercase !important;
      color: var(--text-secondary) !important;
      text-decoration: none !important;
      transition: color 0.3s ease, transform 0.3s ease !important;
      position: relative !important;
      padding: 0.4rem 0 !important;
    }

    .mobile-nav-link::after {
      content: '' !important;
      position: absolute !important;
      bottom: -4px !important;
      left: 0 !important;
      width: 100% !important;
      height: 2px !important;
      background: var(--accent-blue) !important;
      transform: scaleX(0) !important;
      transform-origin: right !important;
      transition: transform 0.3s var(--ease-premium) !important;
    }

    .mobile-nav-link:hover,
    .mobile-nav-link.active {
      color: var(--text-primary) !important;
      transform: translateY(-2px) !important;
    }

    .mobile-nav-link:hover::after,
    .mobile-nav-link.active::after {
      transform: scaleX(1) !important;
      transform-origin: left !important;
    }

    .mobile-auth-btn {
      margin-top: 1rem !important;
      font-size: 0.85rem !important;
      padding: 0.8rem 2.2rem !important;
      border-radius: 22px !important;
    }

    /* ==========================================================================
       GLOBAL AUTH MODAL DIALOG STYLING
       ========================================================================== */
    .premium-modal {
      border: none !important;
      background: transparent !important;
      width: 100vw !important;
      height: 100vh !important;
      max-width: 100% !important;
      max-height: 100% !important;
      inset: 0 !important;
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      z-index: 3000 !important;
      opacity: 0 !important;
      pointer-events: none !important;
      transition: opacity 0.5s var(--ease-premium) !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    .premium-modal[open] {
      opacity: 1 !important;
      pointer-events: auto !important;
    }

    .premium-modal::backdrop {
      background: rgba(0, 0, 0, 0.8) !important;
      backdrop-filter: blur(15px) !important;
      -webkit-backdrop-filter: blur(15px) !important;
    }

    .auth-split-modal {
      display: flex !important;
      flex-direction: row !important;
      padding: 0 !important;
      max-width: 720px !important;
      width: 85% !important;
      border-radius: 20px !important;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;
      overflow: hidden !important;
      background: rgba(12, 13, 16, 0.25) !important;
      min-height: 520px !important;
      backdrop-filter: blur(25px) !important;
      -webkit-backdrop-filter: blur(25px) !important;
      border: 1px solid var(--border-light) !important;
      transform: scale(0.9) !important;
      transition: transform 0.5s var(--ease-premium) !important;
    }

    .premium-modal[open] .auth-split-modal {
      transform: scale(1) !important;
    }

    .auth-modal-left {
      width: 260px !important;
      flex-shrink: 0 !important;
      position: relative !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: flex-end !important;
      padding: 1.5rem !important;
    }

    .auth-modal-left-img {
      position: absolute !important;
      inset: 0 !important;
      background: url('/card02.png') center / cover no-repeat !important;
      opacity: 0.55 !important;
    }

    .auth-modal-left-overlay {
      position: absolute !important;
      inset: 0 !important;
      opacity: 0.6 !important;
      z-index: 1 !important;
      background: linear-gradient(135deg, rgba(13, 26, 29, 0.22) 0%, rgba(8, 47, 73, 0.1) 40%, rgba(10, 11, 14, 0.82) 100%) !important;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(6, 182, 212, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.15) !important;
    }

    .auth-modal-left-top {
      position: absolute !important;
      top: 1.25rem !important;
      left: 1.25rem !important;
      right: 1.25rem !important;
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      z-index: 2 !important;
    }

    .auth-modal-brand {
      font-family: var(--font-display) !important;
      font-size: 14px !important;
      font-weight: 800 !important;
      color: #fff !important;
      letter-spacing: 2px !important;
    }

    .auth-back-btn {
      font-family: var(--font-body) !important;
      font-size: 11px !important;
      color: rgba(255, 255, 255, 0.85) !important;
      background: rgba(255, 255, 255, 0.12) !important;
      border: 1px solid rgba(255, 255, 255, 0.22) !important;
      border-radius: 20px !important;
      padding: 5px 12px !important;
      cursor: pointer !important;
      transition: background 0.2s ease !important;
      white-space: nowrap !important;
      outline: none !important;
    }

    .auth-back-btn:hover {
      background: rgba(255, 255, 255, 0.22) !important;
    }

    .auth-modal-caption {
      position: relative !important;
      z-index: 2 !important;
    }

    .auth-modal-caption h3 {
      font-family: var(--font-display) !important;
      font-size: 19px !important;
      font-weight: 700 !important;
      color: #fff !important;
      line-height: 1.35 !important;
    }

    .auth-modal-caption h3 small {
      font-size: 13px !important;
      font-weight: 400 !important;
      opacity: 0.7 !important;
    }

    .auth-modal-dots {
      display: flex !important;
      gap: 6px !important;
      margin-top: 12px !important;
    }

    .auth-modal-dots span {
      width: 20px !important;
      height: 3px !important;
      border-radius: 2px !important;
      background: rgba(255, 255, 255, 0.28) !important;
    }

    .auth-modal-dots span.active {
      width: 28px !important;
      background: #fff !important;
    }

    .auth-modal-right {
      flex: 1 !important;
      padding: 2rem 1.85rem !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: center !important;
      overflow-y: auto !important;
    }

    .auth-modal-title {
      font-family: var(--font-display) !important;
      font-size: 1.65rem !important;
      font-weight: 700 !important;
      color: #f0eeff !important;
      margin-bottom: 5px !important;
    }

    .auth-modal-sub {
      font-size: 13px !important;
      color: rgba(200, 196, 230, 0.62) !important;
      margin-bottom: 1.4rem !important;
      font-family: var(--font-body) !important;
    }

    .auth-modal-sub a {
      color: var(--accent-blue) !important;
      text-decoration: none !important;
      transition: opacity 0.2s !important;
    }

    .auth-modal-sub a:hover {
      opacity: 0.8 !important;
    }

    .auth-form {
      display: flex !important;
      flex-direction: column !important;
      gap: 10px !important;
      margin-top: 0 !important;
    }

    .auth-name-row {
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
      gap: 10px !important;
    }

    .auth-split-modal .form-input {
      background: rgba(255, 255, 255, 0.06) !important;
      border: 1px solid rgba(255, 255, 255, 0.11) !important;
      border-radius: 9px !important;
      height: 42px !important;
      padding: 0 14px !important;
      color: #e8e4ff !important;
      font-size: 13.5px !important;
      font-family: var(--font-body) !important;
      width: 100% !important;
      outline: none !important;
      transition: border-color 0.2s ease, background 0.2s ease !important;
      box-shadow: none !important;
    }

    .auth-split-modal .form-input::placeholder {
      color: rgba(180, 175, 215, 0.4) !important;
    }

    .auth-split-modal .form-input:focus {
      border-color: rgba(102, 204, 255, 0.5) !important;
      background: rgba(255, 255, 255, 0.09) !important;
    }

    .auth-pass-wrap {
      position: relative !important;
    }

    .auth-pass-wrap .form-input {
      padding-right: 44px !important;
    }

    .auth-eye-btn {
      position: absolute !important;
      right: 12px !important;
      top: 50% !important;
      transform: translateY(-50%) !important;
      background: none !important;
      border: none !important;
      cursor: pointer !important;
      color: rgba(180, 175, 215, 0.5) !important;
      display: flex !important;
      align-items: center !important;
      padding: 0 !important;
      outline: none !important;
      opacity: 0.5 !important;
      transition: opacity 0.2s !important;
    }

    .auth-eye-btn svg {
      pointer-events: none !important;
    }

    .auth-eye-btn:hover {
      opacity: 1 !important;
    }

    .auth-forgot-row {
      text-align: right !important;
      margin-top: -4px !important;
    }

    .auth-forgot-row a {
      font-size: 12px !important;
      color: var(--accent-blue) !important;
      text-decoration: none !important;
      font-family: var(--font-body) !important;
      transition: opacity 0.2s !important;
    }

    .auth-forgot-row a:hover {
      opacity: 0.75 !important;
    }

    .auth-terms-row {
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      margin: 2px 0 2px !important;
    }

    .auth-terms-row input[type="checkbox"] {
      width: 15px !important;
      height: 15px !important;
      accent-color: var(--accent-blue) !important;
      cursor: pointer !important;
      flex-shrink: 0 !important;
    }

    .auth-terms-row label {
      font-size: 12px !important;
      color: white !important;
      font-family: var(--font-body) !important;
      cursor: pointer !important;
    }

    .auth-terms-row a {
      color: var(--accent-blue) !important;
      text-decoration: none !important;
    }

    .auth-submit-btn {
      width: 100% !important;
      padding: 0 !important;
      height: 42px !important;
      background: var(--accent-blue) !important;
      border: none !important;
      border-radius: 9px !important;
      color: #fff !important;
      font-family: var(--font-display) !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      letter-spacing: 0.02rem !important;
      transition: background 0.2s ease, transform 0.15s ease !important;
      outline: none !important;
      margin-top: 2px !important;
    }

    .auth-submit-btn:hover {
      background: var(--bg-card) !important;
      transform: translateY(-1px) !important;
    }

    .auth-submit-btn:active {
      transform: translateY(0) !important;
    }

    .auth-divider {
      display: flex !important;
      align-items: center !important;
      gap: 10px !important;
      margin: 1rem 0 !important;
    }

    .auth-divider-line {
      flex: 1 !important;
      height: 0.5px !important;
      background: rgba(255, 255, 255, 0.1) !important;
      display: block !important;
    }

    .auth-divider-text {
      font-size: 11px !important;
      color: rgba(180, 175, 215, 0.42) !important;
      white-space: nowrap !important;
      font-family: var(--font-body) !important;
    }

    .auth-social-row {
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
      gap: 10px !important;
    }

    .auth-social-btn {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 8px !important;
      padding: 9px 12px !important;
      background: rgba(255, 255, 255, 0.05) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      border-radius: 9px !important;
      color: #ddd9ff !important;
      font-size: 13px !important;
      font-family: var(--font-body) !important;
      cursor: pointer !important;
      transition: background 0.2s ease, border-color 0.2s ease !important;
      outline: none !important;
    }

    .auth-social-btn:hover {
      background: rgba(255, 255, 255, 0.1) !important;
      border-color: rgba(255, 255, 255, 0.2) !important;
    }

    /* ==========================================
       RESPONSIVE NAV BAR (<= 800px breakpoints)
       ========================================== */
    @media (max-width: 800px) {
      .main-header {
        bottom: 1.5rem !important;
        left: 1.5rem !important;
        right: 1.5rem !important;
        width: auto !important;
        justify-content: space-between !important;
        padding: 0 1.25rem !important;
        border-radius: 26px !important;
        gap: 1rem !important;
      }

      .header-nav, .header-actions {
        display: none !important;
      }

      .hamburger-btn {
        display: flex !important;
      }

      .auth-split-modal {
        flex-direction: column !important;
        max-width: 95% !important;
        min-height: unset !important;
        height: auto !important;
        max-height: 90vh !important;
      }

      .auth-modal-left {
        width: 100% !important;
        height: 160px !important;
        min-height: 160px !important;
        padding: 1.25rem !important;
        justify-content: flex-end !important;
      }

      .auth-modal-left-top {
        top: 1rem !important;
        left: 1rem !important;
        right: 1rem !important;
      }

      .auth-modal-caption h3 {
        font-size: 15px !important;
      }

      .auth-modal-right {
        padding: 1.5rem !important;
      }

      .auth-name-row {
        grid-template-columns: 1fr !important;
      }
    }

    @media (max-width: 480px) {
      .main-header {
        height: 48px !important;
        bottom: 1rem !important;
        left: 1rem !important;
        right: 1rem !important;
        border-radius: 24px !important;
      }
      .header-logo {
        font-size: 0.85rem !important;
        letter-spacing: 0.15rem !important;
        padding-right: 0.8rem !important;
      }
    }
  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // 2. Determine active page and target hrefs
  const path = window.location.pathname.toLowerCase();
  let activePage = 'home';
  if (path.includes('product.html')) {
    activePage = 'shop';
  } else if (path.includes('about.html')) {
    activePage = 'about';
  } else if (path.includes('contact.html')) {
    activePage = 'contact';
  }

  const isHomePage = activePage === 'home';
  const homeHref = isHomePage ? '#slide-1' : './index.html';
  const shopHref = './product.html';
  const aboutHref = './about.html';
  const contactHref = './contact.html';

  const headerHtml = `
    <a href="./index.html" class="header-logo">TOPKEYS</a>
    <nav class="header-nav" aria-label="Header Links">
      <a href="${homeHref}" class="nav-link ${activePage === 'home' ? 'active' : ''}" data-link="home">Home</a>
      <a href="${shopHref}" class="nav-link ${activePage === 'shop' ? 'active' : ''}" data-link="shop">Shop</a>
      <a href="${aboutHref}" class="nav-link ${activePage === 'about' ? 'active' : ''}" data-link="about">About</a>
      <a href="${contactHref}" class="nav-link ${activePage === 'contact' ? 'active' : ''}" data-link="contact">Contact</a>
    </nav>
    <div class="header-actions">
      <button class="auth-btn" id="auth-trigger">Login / Sign Up</button>
    </div>
    <button class="hamburger-btn" aria-label="Toggle menu" aria-expanded="false">
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    </button>
  `;

  // 3. Find or create the header
  let header = document.querySelector('.main-header');
  if (!header) {
    header = document.createElement('header');
    header.className = 'main-header';
    header.setAttribute('aria-label', 'Main Navigation');
    document.body.prepend(header);
  }
  header.innerHTML = headerHtml;

  // 4. Inject mobile overlay nav
  const mobileOverlayHtml = `
    <div class="mobile-nav-overlay" id="mobile-nav-overlay" aria-hidden="true">
      <div class="mobile-nav-content">
        <a href="${homeHref}" class="mobile-nav-link ${activePage === 'home' ? 'active' : ''}" data-link="home">Home</a>
        <a href="${shopHref}" class="mobile-nav-link ${activePage === 'shop' ? 'active' : ''}" data-link="shop">Shop</a>
        <a href="${aboutHref}" class="mobile-nav-link ${activePage === 'about' ? 'active' : ''}" data-link="about">About</a>
        <a href="${contactHref}" class="mobile-nav-link ${activePage === 'contact' ? 'active' : ''}" data-link="contact">Contact</a>
        <button class="mobile-auth-btn auth-btn">Login / Sign Up</button>
      </div>
    </div>
  `;
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = mobileOverlayHtml;
  document.body.appendChild(tempDiv.firstElementChild);

  // 5. Inject global auth modal
  const authModalHtml = `
    <dialog id="auth-modal" class="premium-modal">
      <div class="modal-content auth-split-modal">
        <!-- Left Panel: Image + Branding -->
        <div class="auth-modal-left">
          <div class="auth-modal-left-img"></div>
          <div class="auth-modal-left-overlay"></div>
          <div class="auth-modal-left-top">
            <span class="auth-modal-brand">TOPKEYS</span>
            <button class="auth-back-btn" id="close-auth-modal" aria-label="Close modal">Back to website →</button>
          </div>
          <div class="auth-modal-caption">
            <h3>Access your secure workspace,<br><small>Continue securely.</small> </h3>
            <div class="auth-modal-dots">
              <span></span><span></span><span class="active"></span>
            </div>
          </div>
        </div>
        <!-- Right Panel: Forms -->
        <div class="auth-modal-right">
          <!-- Sign Up View -->
          <div id="auth-signup-view">
            <h2 class="auth-modal-title">Create an account</h2>
            <p class="auth-modal-sub">Already have an account? <a href="#" id="auth-to-login">Log in</a></p>
            <form id="auth-signup-form" class="auth-form" onsubmit="event.preventDefault();">
              <div class="auth-name-row">
                <input type="text" class="form-input" placeholder="First name" autocomplete="given-name">
                <input type="text" class="form-input" placeholder="Last name" autocomplete="family-name">
              </div>
              <input type="email" class="form-input" placeholder="Email" autocomplete="email">
              <div class="auth-pass-wrap">
                <input type="password" id="auth-signup-password" class="form-input" placeholder="Enter your password" autocomplete="new-password">
                <button type="button" class="auth-eye-btn" data-target="auth-signup-password" aria-label="Toggle password visibility">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
              <div class="auth-terms-row">
                <input type="checkbox" id="auth-terms" checked>
                <label for="auth-terms">I agree to the <a href="#">Terms &amp; Conditions</a></label>
              </div>
              <button type="submit" class="auth-submit-btn">Create account</button>
            </form>
            <div class="auth-divider">
              <span class="auth-divider-line"></span>
              <span class="auth-divider-text">Or register with</span>
              <span class="auth-divider-line"></span>
            </div>
            <div class="auth-social-row">
              <button class="auth-social-btn">
                <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google
              </button>
              <button class="auth-social-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.36.07 2.29.74 3.08.8c1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.56-1.32 3.1-2.54 3.99zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                Apple
              </button>
            </div>
          </div>
          <!-- Login View (hidden by default) -->
          <div id="auth-login-view" style="display:none;">
            <h2 class="auth-modal-title">Welcome back</h2>
            <p class="auth-modal-sub">Don't have an account? <a href="#" id="auth-to-signup">Sign up</a></p>
            <form id="auth-login-form" class="auth-form" onsubmit="event.preventDefault();">
              <input type="email" class="form-input" placeholder="Email address" autocomplete="email">
              <div class="auth-pass-wrap">
                <input type="password" id="auth-login-password" class="form-input" placeholder="Password" autocomplete="current-password">
                <button type="button" class="auth-eye-btn" data-target="auth-login-password" aria-label="Toggle password visibility">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
              <div class="auth-forgot-row">
                <a href="#">Forgot password?</a>
              </div>
              <button type="submit" class="auth-submit-btn">Log in</button>
            </form>
            <div class="auth-divider">
              <span class="auth-divider-line"></span>
              <span class="auth-divider-text">Or sign in with</span>
              <span class="auth-divider-line"></span>
            </div>
            <div class="auth-social-row">
              <button class="auth-social-btn">
                <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google
              </button>
              <button class="auth-social-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.36.07 2.29.74 3.08.8c1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.56-1.32 3.1-2.54 3.99zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                Apple
              </button>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  `;
  const modalDiv = document.createElement('div');
  modalDiv.innerHTML = authModalHtml;
  document.body.appendChild(modalDiv.firstElementChild);

  // 6. Set up Event Listeners
  setupEventListeners();

  function setupEventListeners() {
    const hamburgerBtn = header.querySelector('.hamburger-btn');
    const mobileOverlay = document.getElementById('mobile-nav-overlay');
    const authModal = document.getElementById('auth-modal');

    // Toggle mobile menu
    if (hamburgerBtn && mobileOverlay) {
      hamburgerBtn.addEventListener('click', () => {
        const isOpen = hamburgerBtn.classList.toggle('active');
        hamburgerBtn.setAttribute('aria-expanded', isOpen);
        mobileOverlay.classList.toggle('active', isOpen);
        mobileOverlay.setAttribute('aria-hidden', !isOpen);
      });

      // Close mobile menu on overlay background click
      mobileOverlay.addEventListener('click', (e) => {
        if (e.target === mobileOverlay) {
          hamburgerBtn.classList.remove('active');
          hamburgerBtn.setAttribute('aria-expanded', 'false');
          mobileOverlay.classList.remove('active');
          mobileOverlay.setAttribute('aria-hidden', 'true');
        }
      });
    }

    // Close mobile menu when links are clicked
    const mobileLinks = mobileOverlay ? mobileOverlay.querySelectorAll('.mobile-nav-link') : [];
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (hamburgerBtn && mobileOverlay) {
          hamburgerBtn.classList.remove('active');
          hamburgerBtn.setAttribute('aria-expanded', 'false');
          mobileOverlay.classList.remove('active');
          mobileOverlay.setAttribute('aria-hidden', 'true');
        }
      });
    });

    // Auth trigger binding (handles both header buttons and mobile overlay buttons)
    document.addEventListener('click', (e) => {
      const authTrigger = e.target.closest('.auth-btn');
      if (authTrigger) {
        e.preventDefault();

        // Close mobile overlay if open
        if (hamburgerBtn && mobileOverlay && mobileOverlay.classList.contains('active')) {
          hamburgerBtn.classList.remove('active');
          hamburgerBtn.setAttribute('aria-expanded', 'false');
          mobileOverlay.classList.remove('active');
          mobileOverlay.setAttribute('aria-hidden', 'true');
        }

        if (authModal) {
          const signupView = document.getElementById('auth-signup-view');
          const loginView = document.getElementById('auth-login-view');
          if (signupView && loginView) {
            signupView.style.display = 'block';
            loginView.style.display = 'none';
          }
          authModal.showModal();
        }
      }
    });

    // Toggle password eye visibility
    document.addEventListener('click', (e) => {
      const eyeBtn = e.target.closest('.auth-eye-btn');
      if (eyeBtn) {
        e.preventDefault();
        const targetId = eyeBtn.dataset.target;
        const input = document.getElementById(targetId);
        if (input) {
          const isHidden = input.type === 'password';
          input.type = isHidden ? 'text' : 'password';
          eyeBtn.style.opacity = isHidden ? '1' : '0.5';
        }
      }
    });

    // Dialog close buttons
    const closeBtn = document.getElementById('close-auth-modal');
    if (closeBtn && authModal) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        authModal.close();
      });
    }

    if (authModal) {
      authModal.addEventListener('click', (e) => {
        if (e.target === authModal) authModal.close();
      });
    }

    // Toggle between login and signup in modal
    const toLogin = document.getElementById('auth-to-login');
    const toSignup = document.getElementById('auth-to-signup');
    const signupView = document.getElementById('auth-signup-view');
    const loginView = document.getElementById('auth-login-view');

    if (toLogin && signupView && loginView) {
      toLogin.addEventListener('click', (e) => {
        e.preventDefault();
        signupView.style.display = 'none';
        loginView.style.display = 'block';
      });
    }

    if (toSignup && signupView && loginView) {
      toSignup.addEventListener('click', (e) => {
        e.preventDefault();
        loginView.style.display = 'none';
        signupView.style.display = 'block';
      });
    }
  }
})();
