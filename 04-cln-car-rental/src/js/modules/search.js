import { showToast } from './toast.js';
import { formatDate } from './utils.js';
import { renderFleet, setActiveFilter } from './fleet.js';

const TYPE_MAP = {
  Sedan: 'sedan', SUV: 'suv', Sports: 'sports',
  Luxury: 'sedan', Electric: 'electric', Van: 'suv'
};

export function scrollToSearch() {
  document.getElementById('searchBar').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

export function handleSearch() {
  const location = document.getElementById('locationSelect').value;
  const pickup = document.getElementById('pickupDate').value;
  const ret = document.getElementById('returnDate').value;
  const type = document.getElementById('carType').value;

  if (!location) { showToast('Please choose a location.', 'error'); return; }
  if (!pickup) { showToast('Please select a pick-up date.', 'error'); return; }
  if (!ret) { showToast('Please select a return date.', 'error'); return; }
  if (new Date(ret) <= new Date(pickup)) { showToast('Return date must be after pick-up date.', 'error'); return; }

  document.getElementById('fleet').scrollIntoView({ behavior: 'smooth' });

  if (type) {
    const mapped = TYPE_MAP[type] || 'all';
    setActiveFilter(mapped);
    renderFleet(mapped);
  }

  showToast(`🔍 Showing cars for ${location} · ${formatDate(pickup)} → ${formatDate(ret)}`, 'success');
}
