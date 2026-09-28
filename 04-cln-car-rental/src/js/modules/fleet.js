import { cars } from './data.js';
import { capitalize } from './utils.js';
import { observeReveal } from './animations.js';
import { openBookingModal } from './booking.js';

function buildCarSVG(car) {
  return `
    <svg viewBox="0 0 400 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="180" fill="${car.color}"/>
      <ellipse cx="200" cy="165" rx="160" ry="10" fill="rgba(0,0,0,0.4)"/>
      <path d="M50 125 L70 90 L120 70 L180 64 L240 64 L300 70 L340 90 L355 125 L355 145 L50 145 Z"
            fill="#111" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
      <path d="M115 72 L140 66 L220 62 L250 66 L265 85 L105 85 Z"
            fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.12)" stroke-width="0.8"/>
      <path d="M268 66 L310 74 L328 88 L268 88 Z"
            fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" stroke-width="0.8"/>
      <line x1="266" y1="62" x2="270" y2="88" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>
      <ellipse cx="340" cy="116" rx="14" ry="7" fill="${car.accentColor}"/>
      <ellipse cx="340" cy="116" rx="8" ry="4" fill="rgba(255,240,180,0.7)"/>
      <rect x="52" y="112" width="12" height="5" rx="2" fill="rgba(220,50,50,0.7)"/>
      <circle cx="115" cy="145" r="26" fill="#0a0a0a" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>
      <circle cx="115" cy="145" r="17" fill="#111" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
      <circle cx="115" cy="145" r="6" fill="rgba(255,255,255,0.1)"/>
      <line x1="115" y1="128" x2="115" y2="162" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"/>
      <line x1="98" y1="145" x2="132" y2="145" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"/>
      <circle cx="295" cy="145" r="26" fill="#0a0a0a" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>
      <circle cx="295" cy="145" r="17" fill="#111" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
      <circle cx="295" cy="145" r="6" fill="rgba(255,255,255,0.1)"/>
      <line x1="295" y1="128" x2="295" y2="162" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"/>
      <line x1="278" y1="145" x2="312" y2="145" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"/>
      <rect x="168" y="108" width="20" height="3" rx="1.5" fill="rgba(255,255,255,0.12)"/>
      <rect x="268" y="108" width="16" height="3" rx="1.5" fill="rgba(255,255,255,0.08)"/>
    </svg>
  `;
}

export function renderFleet(filter = 'all') {
  const grid = document.getElementById('fleetGrid');
  grid.innerHTML = '';
  const filtered = filter === 'all' ? cars : cars.filter(c => c.category === filter);

  filtered.forEach((car, i) => {
    const card = document.createElement('div');
    card.className = 'car-card';
    card.dataset.delay = i * 60;
    card.innerHTML = `
      <div class="car-card-img">
        <div class="car-tag">${capitalize(car.category)}</div>
        ${buildCarSVG(car)}
      </div>
      <div class="car-card-body">
        <div class="car-card-header">
          <div class="car-name">${car.name}</div>
          <div class="car-price">
            <span class="amount">₱${car.price.toLocaleString()}</span>
            <span class="period">/ day</span>
          </div>
        </div>
        <div class="car-specs">
          <div class="car-spec"><span class="car-spec-icon">💺</span>${car.seats} Seats</div>
          <div class="car-spec"><span class="car-spec-icon">⛽</span>${car.fuel}</div>
          <div class="car-spec"><span class="car-spec-icon">⚙️</span>${car.transmission}</div>
        </div>
        <button class="book-car-btn" data-car-id="${car.id}">Book This Car</button>
      </div>
    `;
    grid.appendChild(card);
    observeReveal(card);
  });
}

// Highlights the matching filter button (used by filters and by search)
export function setActiveFilter(filter) {
  document.querySelectorAll('.filter-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.filter === filter);
  });
}

export function initFleet() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setActiveFilter(btn.dataset.filter);
      renderFleet(btn.dataset.filter);
    });
  });

  // One delegated listener for every "Book This Car" button
  document.getElementById('fleetGrid').addEventListener('click', e => {
    const btn = e.target.closest('.book-car-btn');
    if (btn) openBookingModal(Number(btn.dataset.carId));
  });

  renderFleet();
}
