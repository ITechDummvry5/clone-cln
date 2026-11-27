// Small pure helpers shared by every page.

// Escape text before putting it inside an HTML template string
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// "Volkswagen ID. Buzz LWB" -> "volkswagen-id-buzz-lwb" (used in car.html?car=...)
const slug = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
