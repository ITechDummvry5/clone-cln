import { cars } from './data.js';
import { openModal, closeModal } from './modals.js';
import { showToast } from './toast.js';

let selectedCar = null;

export function openBookingModal(carId) {
  selectedCar = cars.find(c => c.id === carId);
  if (!selectedCar) return;

  document.getElementById('bookingCarName').textContent = selectedCar.name;
  document.getElementById('bookingCarPrice').textContent = `₱${selectedCar.price.toLocaleString()} / day`;

  // Pre-fill dates from the search bar if available
  const pickup = document.getElementById('pickupDate').value;
  const ret = document.getElementById('returnDate').value;
  if (pickup) document.getElementById('bookPickup').value = pickup;
  if (ret) document.getElementById('bookReturn').value = ret;

  updateBookingSummary();
  openModal('bookingModal');
}

export function updateBookingSummary() {
  if (!selectedCar) return;
  const pickup = document.getElementById('bookPickup').value;
  const ret = document.getElementById('bookReturn').value;
  const summaryEl = document.getElementById('bookingSummary');

  if (!pickup || !ret) {
    summaryEl.innerHTML = '<em style="color:var(--text-muted)">Select pickup and return dates to see your total.</em>';
    return;
  }

  const days = Math.max(1, Math.round((new Date(ret) - new Date(pickup)) / (1000 * 60 * 60 * 24)));
  const subtotal = days * selectedCar.price;
  const tax = Math.round(subtotal * 0.12);
  const total = subtotal + tax;

  summaryEl.innerHTML = `
    <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>Vehicle</span><span style="color:var(--text)">${selectedCar.name}</span></div>
    <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>Duration</span><span style="color:var(--text)">${days} day${days > 1 ? 's' : ''}</span></div>
    <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>Rate</span><span style="color:var(--text)">₱${selectedCar.price.toLocaleString()}/day</span></div>
    <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>Subtotal</span><span style="color:var(--text)">₱${subtotal.toLocaleString()}</span></div>
    <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>Tax (12%)</span><span style="color:var(--text)">₱${tax.toLocaleString()}</span></div>
    <div style="display:flex;justify-content:space-between;border-top:1px solid var(--border);padding-top:10px;margin-top:4px">
      <span style="font-weight:600;color:var(--white)">Total</span>
      <span style="font-family:var(--font-display);font-size:22px;color:var(--accent)">₱${total.toLocaleString()}</span>
    </div>
  `;
}

export function confirmBooking() {
  const name = document.getElementById('bookName').value.trim();
  const phone = document.getElementById('bookPhone').value.trim();
  const pickup = document.getElementById('bookPickup').value;
  const ret = document.getElementById('bookReturn').value;

  if (!name) { showToast('Please enter your full name.', 'error'); return; }
  if (!phone) { showToast('Please enter your phone number.', 'error'); return; }
  if (!pickup) { showToast('Please select a pickup date.', 'error'); return; }
  if (!ret) { showToast('Please select a return date.', 'error'); return; }
  if (new Date(ret) <= new Date(pickup)) { showToast('Return date must be after pickup date.', 'error'); return; }

  const bookingRef = 'VGO' + Date.now().toString().slice(-6).toUpperCase();
  closeModal('bookingModal');
  showToast(`✅ Booking confirmed! Ref: ${bookingRef}. ${selectedCar.name} booked for ${name.split(' ')[0]}.`, 'success');
}

// Attach live-summary listeners once (not on every modal open)
export function initBooking() {
  ['bookPickup', 'bookReturn', 'bookLocation', 'bookPayment'].forEach(id => {
    document.getElementById(id).addEventListener('change', updateBookingSummary);
  });
}
