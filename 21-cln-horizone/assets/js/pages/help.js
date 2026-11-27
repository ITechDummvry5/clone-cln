hydrateImages();
const $ = (id) => document.getElementById(id);
// The contact form only exists once an admin has set a support email (Admin → Settings)
const supportEmail = HZ.settings().supportEmail || '';
const contactOn = !!supportEmail;

const TOPICS = ['Booking & payment','Pick-up & return','Insurance & protection','Changes & cancellations','Drivers & licences'];
// [topic, question, answer]
const QA = [
  [0,'When is my card charged?','You pay at booking for the rental total. Any extras added at the desk are charged when you return the car.'],
  [0,'What is the security deposit?','A hold placed on your card at pick-up, released within seven days of return. The amount depends on the car and the protection plan.'],
  [0,'Can I use a debit card?','Yes for the rental payment. Some locations need a credit card for the deposit hold, and the booking page tells you which.'],
  [1,'What do I need to pick up a car?','A full driving licence held for at least twelve months, a payment card in the main driver’s name, and a passport or national ID. Some countries also need an International Driving Permit.'],
  [1,'Can I pick up outside opening hours?','Airport desks are open 24 hours. At stations, ask us before you book and we’ll arrange a key handover.'],
  [1,'Can I return the car to a different location?','Yes on select one-way routes, such as Munich ↔ Berlin and Glasgow ↔ Birmingham, with no extra fee. The price is shown at search.'],
  [1,'What is the fuel policy?','Full to full. Pick up with a full tank and return it full, or we charge fuel at cost plus a small service fee.'],
  [2,'Is insurance included in the price?','Basic protection is included. Upgrade plans lower your excess, and each plan is explained in one sentence at checkout.'],
  [2,'What is an excess?','The most you pay if the car is damaged. A higher protection plan reduces it.'],
  [2,'Does my credit card insurance cover me?','Often, but it varies by card and country. Check the policy first, and note you may still need to pay the excess up front.'],
  [3,'How late can I cancel?','Up to 48 hours before pick-up, free of charge.'],
  [3,'How do I change my dates or car?','Open Manage a booking, pick the change, and we’ll show the new total before you confirm.'],
  [3,'What if my flight is delayed?','Add your flight number at booking. We track it and hold the car for you.'],
  [4,'How old do I need to be?','Most locations rent to drivers aged 21 and over. Young-driver fees may apply under 25.'],
  [4,'Can I add a second driver?','Yes, at the desk or in Manage a booking. They need to bring their own licence.'],
  [4,'What does “With Driver” include?','A professional driver for the rental period, at $45 a day. Fuel and the driver’s own costs are included.'],
  [4,'Do I need an International Driving Permit?','Only in some countries, such as Japan and South Korea if your licence isn’t in the local script. The location page tells you.'],
];
let topic = -1, query = '';
function render() {
  const q = query.trim().toLowerCase();
  const list = QA.filter(r => (topic < 0 || r[0] === topic) && (!q || (r[1] + r[2]).toLowerCase().includes(q)));
  $('faqs').innerHTML = list.map(r => `<details class="qa"><summary><span>${r[1]}<small>${TOPICS[r[0]]}</small></span></summary><p>${r[2]}</p></details>`).join('')
    || `<p class="empty">No answer found. ${contactOn ? 'Send us a message below and a person will reply.' : 'Try different words, or see the contact details below.'}</p>`;
}
$('topics').innerHTML = ['All topics', ...TOPICS].map((t, i) => `<button data-t="${i - 1}" class="${i ? '' : 'on'}">${t}</button>`).join('');
$('topics').onclick = e => { const b = e.target.closest('button'); if (!b) return; topic = +b.dataset.t; document.querySelectorAll('#topics button').forEach(x => x.classList.toggle('on', x === b)); render(); };
$('q').oninput = e => { query = e.target.value; render(); };
$('quick').innerHTML = ['Cancel a booking','Pick-up hours','Contact us'].map(t => `<button class="chip">${t}</button>`).join('');
$('quick').onclick = e => { const b = e.target.closest('.chip'); if (!b) return; if (b.textContent === 'Contact us') return $('contact').scrollIntoView(); $('q').value = query = b.textContent === 'Cancel a booking' ? 'cancel' : 'hours'; render(); };
$('ftopic').innerHTML = '<option value="">Choose a topic…</option>' + TOPICS.map(t => `<option>${t}</option>`).join('');
if (contactOn) {
  $('form').hidden = false;
  $('cSub').textContent = 'We answer every message, usually within five minutes.';
  $('cBook').textContent = 'Use the form. Median reply: 4 minutes';
  $('cEmail').hidden = false; $('cEmailVal').textContent = supportEmail;
} else {
  $('formOff').hidden = false;
  const me = HZ.current();
  if (me && me.role === 'admin') $('formOffAdmin').hidden = false;
}
$('form').onsubmit = e => {
  e.preventDefault();
  const ok = $('ok'), f = e.target, d = Object.fromEntries(new FormData(f));
  ok.style.color = '';
  try {
    if (!d.topic) { const x = new Error('Choose a topic so we can route your message.'); x.user = true; throw x; }
    HZ.addMessage(d);
    ok.textContent = 'Message sent. We’ll reply by email.';
    f.reset(); $('ftopic').dispatchEvent(new Event('change'));
  } catch (err) { ok.style.color = '#c0392b'; ok.textContent = err.user ? err.message : 'Something went wrong. Please try again.'; if (!err.user) console.error(err); }
};
render();
