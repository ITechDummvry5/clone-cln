// Fleet data shared by the home page, the cars page and the car page.
// Edit a car here and every page updates.

// [name, type, transmission, fuel, seats, rating, price/day, range km]
const FLEET = [
  ['Toyota Corolla Hybrid','Sedan','Automatic','Hybrid',5,4.8,48],
  ['Tesla Model 3','Sedan','Automatic','Electric',5,4.9,79,513],
  ['Tesla Model Y','SUV','Automatic','Electric',5,4.9,92,533],
  ['Volkswagen Polo','Hatchback','Manual','Petrol',5,4.6,42],
  ['Volkswagen Tiguan Allspace','SUV','Automatic','Diesel',7,4.7,78],
  ['Porsche 911 Carrera GTS','Sport','Automatic','Petrol',2,4.9,340],
  ['BMW M240i Coupé','Sport','Automatic','Petrol',4,4.8,110],
  ['Genesis GV80','SUV','Automatic','Petrol',5,4.8,145],
  ['Land Rover Defender 110','Off-road','Automatic','Diesel',5,4.7,175],
  ['BMW M3','Sport','Automatic','Petrol',5,4.8,210],
  ['Land Rover Range Rover Sport','SUV','Automatic','Petrol',5,4.8,225],
  ['Audi R8 V10','Sport','Automatic','Petrol',2,4.9,420],
  ['MINI Cooper S','Hatchback','Automatic','Petrol',4,4.7,58],
  ['Toyota RAV4 Hybrid','SUV','Automatic','Hybrid',5,4.8,72],
  ['Kia EV6','SUV','Automatic','Electric',5,4.8,84,528],
  ['Audi A5 Sportback','Sedan','Automatic','Petrol',5,4.7,96],
  ['Volvo XC60 Recharge','SUV','Automatic','Hybrid',5,4.8,98],
  ['Volkswagen ID. Buzz LWB','Minivan','Automatic','Electric',7,4.9,118,470],
  ['BMW X5 xDrive','SUV','Automatic','Diesel',5,4.8,138],
  ['Volkswagen ID.3 Pro','Hatchback','Automatic','Electric',5,4.6,55,426],
  ['Ford Mustang Convertible','Convertible','Automatic','Petrol',4,4.7,96],
  ['Audi Q5','SUV','Automatic','Petrol',5,4.7,102],
  ['Audi A6 Avant','Wagon','Automatic','Diesel',5,4.8,104],
  ['Jeep Wrangler Unlimited','Off-road','Automatic','Petrol',5,4.6,115],
  ['Fiat 500 Dolcevita','Hatchback','Manual','Hybrid',4,4.5,36],
  ['Volkswagen T2 Kombi','Minivan','Manual','Petrol',7,4.6,92],
];

const BAGS = { Hatchback: 2, Sedan: 3, SUV: 4, Wagon: 4, 'Off-road': 4, Minivan: 5, Sport: 1, Convertible: 2 };
const FEATURES = {
  Electric: ['Apple CarPlay', 'Heated seats', 'Fast charging', 'Lane assist', 'Rear camera'],
  Sport: ['Sport mode', 'Launch control', 'Premium audio', 'Rear camera'],
  'Off-road': ['4x4 drive', 'Apple CarPlay', 'Tow bar', 'Rear camera'],
  Convertible: ['Soft top', 'Apple CarPlay', 'Heated seats', 'Rear camera'],
  Minivan: ['Sliding doors', 'Apple CarPlay', 'Roof rails', 'Rear camera'],
  _: ['Apple CarPlay', 'Android Auto', 'Adaptive cruise', 'Lane assist', 'Rear camera'],
};

// Extra detail for the car page: name -> [doors, drivetrain, deposit $, min driver age, review count, model year, intro]
const DETAIL = {
  'Toyota Corolla Hybrid':[4,'Front-wheel drive',250,21,402,2024,'The sensible choice that never feels like a compromise: silent in traffic, easy on fuel, and a boot that swallows three suitcases.'],
  'Tesla Model 3':[4,'Rear-wheel drive',400,23,288,2025,'Quick, quiet and easy to charge. A big touchscreen runs everything, and the range covers most weekend trips without a stop.'],
  'Tesla Model Y':[5,'All-wheel drive',450,23,214,2025,'Family-sized and fully electric, with a deep boot, a glass roof and the same fast charging as the Model 3.'],
  'Volkswagen Polo':[5,'Front-wheel drive',200,21,511,2023,'Small enough to park anywhere, big enough for four adults. The easy, low-cost way around a city.'],
  'Volkswagen Tiguan Allspace':[5,'All-wheel drive',350,21,176,2024,'Seven seats and a long list of safety kit, so the whole group fits and the luggage does too.'],
  'Porsche 911 Carrera GTS':[2,'Rear-wheel drive',3000,25,63,2024,'A weekend car with a flat-six soundtrack. Book it for mountain roads and an early start.'],
  'BMW M240i Coupé':[2,'Rear-wheel drive',1000,25,88,2024,'A compact coupé with a straight-six and rear-wheel drive. Great fun for two people and a small bag.'],
  'Genesis GV80':[5,'All-wheel drive',600,25,92,2024,'A quiet, well-finished luxury SUV with a calm cabin and plenty of room for long drives.'],
  'Land Rover Defender 110':[5,'Four-wheel drive',700,25,121,2024,'Tall, tough and ready for gravel, snow or a ferry crossing. Seats five with room for gear.'],
  'BMW M3':[4,'Rear-wheel drive',1500,25,97,2024,'A four-door that can carry the family and still embarrass most sports cars. Book it for the drive, not the commute.'],
  'Land Rover Range Rover Sport':[5,'All-wheel drive',900,25,84,2024,'Commanding seating, air suspension and a hushed cabin, built for long trips in comfort.'],
  'Audi R8 V10':[2,'All-wheel drive',5000,25,41,2023,'A V10 supercar you can drive every day. Best for confident drivers who want a trip to remember.'],
  'MINI Cooper S':[3,'Front-wheel drive',300,21,142,2024,'Go-kart handling and a cabin with real character. Ideal for two people and a weekend away.'],
  'Toyota RAV4 Hybrid':[5,'All-wheel drive',350,21,236,2025,'Room for the whole group and the luggage, with hybrid economy that keeps long drives cheap.'],
  'Kia EV6':[5,'All-wheel drive',450,23,158,2025,'Fast charging, a flat floor and a roomy rear seat. Easy to live with on a long trip.'],
  'Audi A5 Sportback':[5,'Quattro all-wheel drive',500,25,164,2024,'A sleek fastback with a calm cabin, sharp handling and the grip of all-wheel drive when the weather turns.'],
  'Volvo XC60 Recharge':[5,'All-wheel drive',500,25,109,2024,'A plug-in hybrid with a Scandinavian cabin and enough electric range for city driving.'],
  'Volkswagen ID. Buzz LWB':[5,'Rear-wheel drive',500,23,76,2025,'Seven seats, sliding doors and retro looks. The easy way to move a group.'],
  'BMW X5 xDrive':[5,'All-wheel drive',800,25,131,2024,'A diesel SUV with long-distance comfort, a big boot and strong towing ability.'],
  'Volkswagen ID.3 Pro':[5,'Rear-wheel drive',300,21,119,2024,'A compact electric hatchback that is cheap to run and easy to park.'],
  'Ford Mustang Convertible':[2,'Rear-wheel drive',700,25,103,2024,'V8 sound, a soft top and an open road. Pick a sunny week.'],
  'Audi Q5':[5,'Quattro all-wheel drive',500,25,147,2024,'A balanced, comfortable SUV that suits family trips and business travel alike.'],
  'Audi A6 Avant':[5,'Quattro all-wheel drive',500,25,138,2024,'A long-legged wagon with a huge boot and a quiet, refined ride.'],
  'Jeep Wrangler Unlimited':[4,'Four-wheel drive',600,23,95,2024,'Doors and roof come off. A genuine off-roader for beaches and back roads.'],
  'Fiat 500 Dolcevita':[3,'Front-wheel drive',200,21,184,2023,'A city car with a glass roof and a lot of charm. Park it anywhere.'],
  'Volkswagen T2 Kombi':[4,'Rear-wheel drive',600,25,52,2022,'A restored classic for trips where the pace is the point. Seats seven.'],
};

// Click anywhere on a car card to open its page (the arrow and the title are real links too)
document.addEventListener('click', e => {
  const card = e.target.closest('[data-href]');
  if (card && !e.target.closest('a, button')) location.href = card.dataset.href;
});
