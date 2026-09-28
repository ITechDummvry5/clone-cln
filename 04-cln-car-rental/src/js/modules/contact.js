import { showToast } from './toast.js';
import { validateEmail } from './utils.js';

export function handleContact() {
  const name = document.getElementById('contactName').value.trim();
  const email = document.getElementById('contactEmail').value.trim();
  const msg = document.getElementById('contactMsg').value.trim();

  if (!name) { showToast('Please enter your name.', 'error'); return; }
  if (!email || !validateEmail(email)) { showToast('Enter a valid email address.', 'error'); return; }
  if (!msg || msg.length < 10) { showToast('Please write a message (at least 10 characters).', 'error'); return; }

  document.getElementById('contactName').value = '';
  document.getElementById('contactEmail').value = '';
  document.getElementById('contactMsg').value = '';
  showToast(`✅ Message sent! We'll get back to you shortly, ${name.split(' ')[0]}.`, 'success');
}
