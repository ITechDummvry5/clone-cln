// Navbar scroll state, active link highlight, mobile menu
const SECTIONS = ['home', 'services', 'fleet', 'how', 'contact'];

function updateActiveNav() {
  const scrollY = window.scrollY + 120;
  SECTIONS.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const link = document.querySelector(`.nav-links a[href="#${id}"]`);
    if (!link) return;
    const top = el.offsetTop, bottom = top + el.offsetHeight;
    link.classList.toggle('active', scrollY >= top && scrollY < bottom);
  });
}

export function closeMobileMenu() {
  document.getElementById('mobileMenu').classList.remove('open');
}

export function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    updateActiveNav();
  });

  hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
}
