// Site-wide configuration. Edit here and every page updates.
// Each page needs: <body data-page="home|cars|..." data-nav="overlay|dark">
//   <div id="site-header"></div> ... <div id="site-footer"></div>
const SITE = {
  name: 'Horizone',
  tagline: 'Car rental in 14 cities, priced without asterisks. The total you see is the total you pay.',
  nav: [
    { id: 'home',      label: 'Home',      href: 'index.html' },
    { id: 'cars',      label: 'Cars',      href: 'cars.html' },
    { id: 'locations', label: 'Locations', href: 'locations.html' },
    { id: 'deals',     label: 'Deals',     href: 'deals.html' },
    { id: 'about',     label: 'About',     href: 'about.html' },
    { id: 'help',      label: 'Help',      href: 'help.html' },
  ],
  footer: [
    { title: 'Rent',    links: [['Browse cars', 'cars.html'], ['Locations', 'locations.html'], ['Deals', 'deals.html'], ['One-way routes', 'locations.html#routes']] },
    { title: 'Company', links: [['About us', 'about.html'], ['Careers', 'about.html#careers'], ['How we work', 'about.html#work']] },
    { title: 'Support', links: [['Help centre', 'help.html'], ['Manage a booking', 'account.html'], ['Contact us', 'help.html#contact'], ['Rental terms', 'help.html']] },
  ],
  cities: ['Bali','Sydney','New York','Seoul','Jeju Island','Munich','Berlin','Los Angeles','Glasgow','Birmingham','Tokyo','Lisbon','Dubai','Cape Town'],
  // [code, name, units per 1 USD]. Indicative rates: edit here, or replace with a live feed later.
  currencies: [['USD','US dollar',1],['PHP','Philippine peso',63.7],['EUR','Euro',0.92],['GBP','British pound',0.79],['AUD','Australian dollar',1.52],['JPY','Japanese yen',150],['KRW','South Korean won',1380],['IDR','Indonesian rupiah',15900],['AED','UAE dirham',3.67],['ZAR','South African rand',18.2]],
  wholeCurrencies: ['JPY','KRW','IDR'],   // shown without decimals
  legal: ['Privacy Policy', 'Terms of Service', 'Cookies'],
};

// Taxes and fees added to every rental total (list cards and the car page use the same rate)
let TAX_RATE = 0.10;   // default; Admin > Forms > Taxes & fees can change it (applied at the end of storage.js)
