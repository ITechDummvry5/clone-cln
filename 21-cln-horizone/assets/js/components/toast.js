// Toast notifications at the bottom of the screen. toast('Saved', 'ok' | 'err' | 'info', ms)
function toast(msg, type = 'ok', ms = 5000) {
  let box = document.getElementById('hz-toasts');
  if (!box) { box = document.createElement('div'); box.id = 'hz-toasts'; document.body.appendChild(box); }
  const t = document.createElement('div');
  t.className = 'hz-toast ' + type; t.setAttribute('role', type === 'err' ? 'alert' : 'status'); t.textContent = msg;
  box.appendChild(t); requestAnimationFrame(() => t.classList.add('in'));
  const kill = () => { t.classList.remove('in'); setTimeout(() => t.remove(), 250); };
  t.onclick = kill; setTimeout(kill, ms);
}
