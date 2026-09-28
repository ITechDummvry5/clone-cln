/* ============================================================
   VGO CAR RENTAL — script.js (entry point)
   Wires the feature modules together.
============================================================ */
import { initPreloader } from './modules/preloader.js';
import { initCursor } from './modules/cursor.js';
import { initNavbar, closeMobileMenu } from './modules/navbar.js';
import { initReveal, animateCounters } from './modules/animations.js';
import { initFleet } from './modules/fleet.js';
import { scrollToSearch, handleSearch } from './modules/search.js';
import { openModal, closeModal, switchModal, initModals } from './modules/modals.js';
import { handleLogin, handleSignup } from './modules/auth.js';
import { initBooking, confirmBooking } from './modules/booking.js';
import { handleContact } from './modules/contact.js';
import { initDateLimits } from './modules/dates.js';

// index.html uses inline onclick="..." handlers, and ES module functions
// are not global by default, so expose the ones the markup calls.
Object.assign(window, {
  openModal, closeModal, switchModal,
  closeMobileMenu, scrollToSearch, handleSearch,
  handleLogin, handleSignup, handleContact, confirmBooking
});

initPreloader(animateCounters);
initCursor();
initNavbar();
initReveal();   // must run before initFleet (fleet cards use observeReveal)
initFleet();
initModals();
initBooking();
initDateLimits();
