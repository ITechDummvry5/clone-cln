import { closeModal } from './modals.js';
import { showToast } from './toast.js';
import { validateEmail } from './utils.js';

export function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPassword').value;
  if (!email || !validateEmail(email)) { showToast('Enter a valid email address.', 'error'); return; }
  if (!pass || pass.length < 6) { showToast('Password must be at least 6 characters.', 'error'); return; }
  closeModal('loginModal');
  showToast('✅ Logged in successfully! Welcome back.', 'success');
}

export function handleSignup() {
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const pass = document.getElementById('signupPassword').value;
  if (!name) { showToast('Please enter your full name.', 'error'); return; }
  if (!email || !validateEmail(email)) { showToast('Enter a valid email address.', 'error'); return; }
  if (!pass || pass.length < 6) { showToast('Password must be at least 6 characters.', 'error'); return; }
  closeModal('signupModal');
  showToast(`🎉 Welcome to Vgo, ${name.split(' ')[0]}! Account created.`, 'success');
}
