// Prevent selecting past dates and keep return >= pickup
export function initDateLimits() {
  const today = new Date().toISOString().split('T')[0];
  ['pickupDate', 'returnDate', 'bookPickup', 'bookReturn'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.min = today;
  });

  document.getElementById('pickupDate').addEventListener('change', function () {
    document.getElementById('returnDate').min = this.value;
  });
  document.getElementById('bookPickup').addEventListener('change', function () {
    document.getElementById('bookReturn').min = this.value;
  });
}
