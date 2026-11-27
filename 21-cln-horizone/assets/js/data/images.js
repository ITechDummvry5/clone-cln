// ALL IMAGES LIVE HERE. Dummy placeholders for now.
// To use real images later, replace any value with a path, e.g. "assets/hero.jpg"
const ph = (label, bg = '#e8e8e8', w = 800, h = 600) =>
  'data:image/svg+xml;utf8,' + encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'><rect width='100%' height='100%' fill='${bg}'/>` +
    `<text x='50%' y='50%' fill='#8a8a8a' font-family='sans-serif' font-size='${Math.round(w / 20)}' text-anchor='middle' dominant-baseline='middle'>${label}</text></svg>`);

const IMAGES = {
  hero:   ph('Hero 1920x1080', '#4a4038', 1920, 1080),
  banner: ph('Banner 1600x700', '#3d4a52', 1600, 700),
  cars: {
    polo:    ph('VW Polo'),
    idbuzz:  ph('VW ID. Buzz'),
    tiguan:  ph('VW Tiguan'),
    corolla: ph('Toyota Corolla'),
    model3:  ph('Tesla Model 3'),
    rav4:    ph('Toyota RAV4'),
    a6:      ph('Audi A6 Avant'),
    gv80:    ph('Genesis GV80'),
  },
  categories: {
    suv:       ph('SUV', '#efefef', 500, 340),
    sedan:     ph('Sedan', '#efefef', 500, 340),
    hatchback: ph('Hatchback', '#efefef', 500, 340),
    electric:  ph('Electric', '#efefef', 500, 340),
    minivan:   ph('Minivan', '#efefef', 500, 340),
    sport:     ph('Sport', '#efefef', 500, 340),
  },
  cities: {
    bali:   ph('Bali', '#c9b9a6', 600, 800),
    munich: ph('Munich', '#a9b7c4', 600, 800),
    la:     ph('Los Angeles', '#d3a9a0', 600, 800),
    tokyo:  ph('Tokyo', '#a8b0cc', 600, 800),
  },
  deals: {
    promo:   ph('Promo 65%', '#7a4a22', 900, 600),
    weekend: ph('Weekend escape', '#5b6b52', 900, 600),
    airport: ph('Airport pick-up', '#53606b', 900, 600),
  },
  avatars: [ph('MA', '#d8d8d8', 80, 80), ph('TR', '#d8d8d8', 80, 80), ph('HK', '#d8d8d8', 80, 80)],
};

// Cars page: one placeholder per fleet car (key = car name used in cars.js)
const FLEET_NAMES = ['Toyota Corolla Hybrid','Tesla Model 3','Tesla Model Y','Volkswagen Polo','Volkswagen Tiguan Allspace','Porsche 911 Carrera GTS','BMW M240i Coupé','Genesis GV80','Land Rover Defender 110','BMW M3','Land Rover Range Rover Sport','Audi R8 V10','MINI Cooper S','Toyota RAV4 Hybrid','Kia EV6','Audi A5 Sportback','Volvo XC60 Recharge','Volkswagen ID. Buzz LWB','BMW X5 xDrive','Volkswagen ID.3 Pro','Ford Mustang Convertible','Audi Q5','Audi A6 Avant','Jeep Wrangler Unlimited','Fiat 500 Dolcevita','Volkswagen T2 Kombi'];
IMAGES.fleet = Object.fromEntries(FLEET_NAMES.map(n => [n, ph(n)]));

// Other pages: heroes, extra cities, promo cards, supplier photo
IMAGES.heroes = {
  locations: ph('Locations hero 1920x700', '#5a5148', 1920, 700),
  deals:     ph('Deals hero 1920x700', '#4d5a4a', 1920, 700),
  about:     ph('About hero 1920x700', '#4a4f5a', 1920, 700),
  supplier:  ph('Fleet inspection 900x700', '#cfcfcf', 900, 700),
};
Object.assign(IMAGES.cities, {
  sydney: ph('Sydney', '#a9bfcf', 800, 600), newyork: ph('New York', '#b5b0c4', 800, 600),
  seoul: ph('Seoul', '#b8b0a2', 800, 600), jeju: ph('Jeju Island', '#a7bba9', 800, 600),
  berlin: ph('Berlin', '#bdb3a9', 800, 600), glasgow: ph('Glasgow', '#a9b6bd', 800, 600),
  birmingham: ph('Birmingham', '#bfb5a6', 800, 600), lisbon: ph('Lisbon', '#c9b69f', 800, 600),
  dubai: ph('Dubai', '#b9bec6', 800, 600), capetown: ph('Cape Town', '#a8bdbd', 800, 600),
});
IMAGES.promos = {
  weekend: ph('Weekend escape', '#7d8a6f', 800, 520), airport: ph('Airport pick-up', '#7f8c96', 800, 520),
  ev: ph('Go electric', '#555f66', 800, 520), friend: ph('Refer a friend', '#9a8068', 800, 520),
};
