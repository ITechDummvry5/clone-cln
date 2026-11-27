// City data shared by the locations page (the list) and the location page (location.html?city=<slug>).
// Edit a city here and both pages update. Add a city: one row in CITIES, one in PLACE, and an image key in data/images.js.

// [country, city, desc, airport, station, cars, from$, region, imageKey]
const CITIES = [
  ['Indonesia','Bali','Rice terraces, temple roads and beach towns, best explored at your own pace.','Ngurah Rai International Airport (DPS)','Seminyak',8,42,'Asia-Pacific','bali'],
  ['Australia','Sydney','Harbour city to Blue Mountains in two hours, or the coast road south.','Sydney Airport (SYD)','Circular Quay',17,42,'Asia-Pacific','sydney'],
  ['United States','New York','Skip the subway for a weekend upstate. The Hudson Valley is ninety minutes away.','John F. Kennedy International Airport (JFK)','Midtown Manhattan',12,42,'Americas','newyork'],
  ['South Korea','Seoul','City lights one day, the east-coast beaches of Gangwon the next.','Incheon International Airport (ICN)','Seoul Station',11,36,'Asia-Pacific','seoul'],
  ['South Korea','Jeju Island','Volcanic coastline, tangerine farms and one of the best road loops in Asia.','Jeju International Airport (CJU)','Jeju City',10,42,'Asia-Pacific','jeju'],
  ['Germany','Munich','Alpine lakes and the Romantic Road, all within a morning’s drive.','Munich Airport (MUC)','München Hauptbahnhof',20,36,'Europe','munich'],
  ['Germany','Berlin','Lakes, castles and the autobahn south to Munich, one-way at no extra charge.','Berlin Brandenburg Airport (BER)','Berlin Hauptbahnhof',19,36,'Europe','berlin'],
  ['United States','Los Angeles','The city that was built for the car. Pacific Coast Highway starts here.','Los Angeles International Airport (LAX)','Santa Monica',21,42,'Americas','la'],
  ['United Kingdom','Glasgow','Gateway to Loch Lomond, Glencoe and the North Coast 500.','Glasgow Airport (GLA)','Glasgow Central',13,36,'Europe','glasgow'],
  ['United Kingdom','Birmingham','The middle of England: Cotswolds, Peak District and Wales are all close.','Birmingham Airport (BHX)','Birmingham New Street',13,36,'Europe','birmingham'],
  ['Japan','Tokyo','Mount Fuji, Hakone and the Izu Peninsula make the case for leaving the trains behind.','Haneda Airport (HND)','Shinjuku',11,36,'Asia-Pacific','tokyo'],
  ['Portugal','Lisbon','Sintra’s palaces and the Alentejo coast, with sunshine most of the year.','Humberto Delgado Airport (LIS)','Cais do Sodré',19,36,'Europe','lisbon'],
  ['United Arab Emirates','Dubai','Sheikh Zayed Road by night, Hatta’s mountains by day.','Dubai International Airport (DXB)','Dubai Marina',17,42,'Middle East & Africa','dubai'],
  ['South Africa','Cape Town','Chapman’s Peak, the winelands and the start of the Garden Route.','Cape Town International Airport (CPT)','V&A Waterfront',13,42,'Middle East & Africa','capetown'],
];
// ROUTES (the one-way pairs) now lives in data/routes.js. Load that file before this one.
// Details popover (hover or tap "Details" on a card). Sample text: replace with your real desk addresses and rules.
// [airport desk address, city desk address, drives on, licence rule]
const LAT = 'Home licences in the Latin alphabet are accepted.', IDP = 'An International Driving Permit is required with your home licence.';
const PLACE = {
  'Bali': ['International Terminal, Tuban', 'Jl. Kayu Aya, Seminyak', 'left', IDP],
  'Sydney': ['T1 International, Mascot NSW', 'Alfred St, Sydney NSW', 'left', LAT],
  'New York': ['Federal Circle, Jamaica NY', 'W 42nd St, New York NY', 'right', LAT],
  'Seoul': ['Terminal 1, Incheon', 'Hangang-daero, Yongsan-gu', 'right', IDP],
  'Jeju Island': ['Gonghang-ro, Jeju City', 'Yeon-dong, Jeju City', 'right', IDP],
  'Munich': ['Rental Car Center, Freising', 'Bayerstraße, Munich', 'right', LAT],
  'Berlin': ['Terminal 1, Schönefeld', 'Europaplatz, Berlin', 'right', LAT],
  'Los Angeles': ['Century Blvd, Los Angeles CA', 'Ocean Ave, Santa Monica CA', 'right', LAT],
  'Glasgow': ['Abbotsinch, Paisley', 'Gordon St, Glasgow', 'left', LAT],
  'Birmingham': ['Terminal Rd, Solihull', 'Station St, Birmingham', 'left', LAT],
  'Tokyo': ['Terminal 3, Ōta City', 'Nishi-Shinjuku, Tokyo', 'left', IDP],
  'Lisbon': ['Terminal 1, Lisbon', 'Av. 24 de Julho, Lisbon', 'right', LAT],
  'Dubai': ['Terminal 3, Garhoud', 'Marina Walk, Dubai Marina', 'right', 'Most home licences are accepted; otherwise bring an International Driving Permit.'],
  'Cape Town': ['Airport Approach Rd, Matroosfontein', 'Dock Rd, V&A Waterfront', 'left', LAT],
};
const AIRPORT_FEE = 25;   // USD, shown through HZC.usd so it follows the selected currency

// Landing-page text, one row per city (key = city name, same as PLACE).
// INFO: [about (a second paragraph under the short description), best time to drive, local driving tip]
const INFO = {
  'Bali': ['Most visitors base themselves on the south coast and head out by car at sunrise, when the rice terraces and temples are quiet. A car lets you string together beaches, waterfalls and mountain villages on your own schedule.', 'April to October (dry season)', 'Traffic around Canggu and Ubud is heavy at rush hour, so start day trips early.'],
  'Sydney': ['Sydney is a harbour city with a national park on its doorstep. Pick up at the airport or Circular Quay and you can be on a coastal road or in eucalyptus forest within the hour.', 'September to November and March to May', 'Many motorways are electronic toll roads. Ask the desk how tolls are charged on your car.'],
  'New York': ['The city is easy without a car and far better with one once you leave it. Pick up at JFK or in Midtown and head for the Hudson Valley, the Catskills or the Long Island shore.', 'September to November', 'Garages in Manhattan are expensive, so keep the car for the days you leave the city.'],
  'Seoul': ['Seoul’s metro is excellent, but the mountains and east coast are a different story. Two hours out of the city you are on empty coastal roads, fishing ports and national parks.', 'April to May and September to October', 'Naver Map and Kakao Map work better than Google Maps for driving directions in Korea.'],
  'Jeju Island': ['Jeju is built for a car: one ring road around the coast, a volcano in the middle and viewpoints, cafés and beaches at almost every turn. Most visitors never use a bus.', 'March to May and October to November', 'Set off early for Seongsan Ilchulbong; the car park fills up by mid-morning.'],
  'Munich': ['Bavaria is a morning’s drive in every direction: lakes to the south, castles to the south-west and the Alps along the whole horizon. Munich is the best starting point in Germany for a road trip.', 'May to September, and December for Christmas markets', 'Parts of the autobahn have no speed limit, but many stretches do. Watch the signs.'],
  'Berlin': ['Berlin is flat, green and surrounded by lakes and palaces. A car turns a long list of day trips into easy half-days, and the autobahn south to Munich is free of one-way fees.', 'May to September', 'Many autobahn sections around Berlin have speed limits. Keep an eye on the signs and the cameras.'],
  'Los Angeles': ['Los Angeles is the home of the road trip. Pick up at LAX or Santa Monica and you are minutes from Pacific Coast Highway, with deserts, mountains and beach towns all within a day’s drive.', 'March to June and September to November', 'Avoid the freeways between 7 and 10 am and 3 and 7 pm if you can.'],
  'Glasgow': ['Glasgow is the gateway to the Highlands. Within an hour you can be on the shore of Loch Lomond, and a day trip reaches Glencoe, castles and the start of the North Coast 500.', 'May to September', 'Many Highland roads are single-track with passing places. Let faster traffic by.'],
  'Birmingham': ['Birmingham sits in the middle of England, so every classic British drive is close: honey-coloured Cotswold villages, the moors of the Peak District and the mountains of Wales.', 'May to September', 'Country lanes in the Cotswolds are narrow. A smaller car makes them easier.'],
  'Tokyo': ['Tokyo’s trains are famous, but the places people photograph, from Fuji to Hakone to the Izu coast, are easier by car. Leave the city on the expressway and the pace changes fast.', 'March to May and October to November', 'Expressway tolls are common. Ask the desk about an ETC card.'],
  'Lisbon': ['Lisbon has some of the best weather in Europe and a coast that starts within half an hour. Palaces, surf beaches and a national park are all an easy morning from the city.', 'April to October', 'The historic centre has steep, narrow streets. Park outside it and walk in.'],
  'Dubai': ['Dubai’s wide roads make it easy to leave the skyline behind. Within an hour or two you can be in the desert, in the Hajar Mountains or in the capital.', 'November to March', 'Speed cameras are common and fines are issued electronically. Stick to the posted limits.'],
  'Cape Town': ['Cape Town packs mountains, two oceans and a wine region into one small area. The coast roads are among the most scenic anywhere, and the winelands are under an hour away.', 'November to March for beaches; September and October for whales', 'Do not leave bags visible in a parked car, especially at viewpoints.'],
};
// SPOTS: best places to drive to from the city. [name, type, description, approx. drive time, optional image path]
// Images are placeholders until you add a real path as the fifth value (or in data/images.js).
const SPOTS = {
  'Bali': [
    ['Tegallalang Rice Terraces', 'Nature', 'Stepped paddies north of Ubud. Go early, before the tour buses arrive.', '1 h 30 min'],
    ['Uluwatu Temple', 'Culture', 'A sea temple on a clifftop with a long view over the Indian Ocean at sunset.', '50 min'],
    ['Ulun Danu Beratan Temple', 'Culture', 'A temple on the edge of a mountain lake, cool and misty even at midday.', '2 h'],
    ['Canggu beaches', 'Beach', 'Surf breaks, beach cafés and a relaxed evening scene close to the city.', '25 min'],
  ],
  'Sydney': [
    ['Blue Mountains', 'Nature', 'Lookouts over eucalyptus valleys, waterfalls and the Three Sisters rock formation.', '1 h 45 min'],
    ['Sea Cliff Bridge', 'Coast', 'A bridge built into the cliffs on the coast road south of the city.', '1 h 15 min'],
    ['Hunter Valley', 'Wine', 'Cellar doors, vineyards and long lunches, a full day out of the city.', '2 h 15 min'],
    ['Palm Beach', 'Beach', 'The end of the Northern Beaches peninsula, with a lighthouse walk above the sea.', '1 h'],
  ],
  'New York': [
    ['Storm King Art Center', 'Art', 'Large outdoor sculptures spread over rolling Hudson Valley hills.', '1 h 15 min'],
    ['Bear Mountain State Park', 'Nature', 'Hiking, lake views and a summit road, an easy escape from the city.', '1 h'],
    ['Woodstock and the Catskills', 'Mountains', 'Small-town shops, mountain roads and swimming holes in summer.', '2 h'],
    ['Montauk Point', 'Coast', 'The lighthouse and beaches at the far tip of Long Island.', '3 h'],
  ],
  'Seoul': [
    ['Suwon Hwaseong Fortress', 'Culture', 'An 18th-century walled fortress you can walk the whole length of.', '1 h'],
    ['Nami Island', 'Nature', 'A tree-lined island in the Han River, famous for its autumn colours.', '1 h 30 min'],
    ['Gangneung beaches', 'Coast', 'Long sandy beaches and coffee streets on the east coast.', '2 h 30 min'],
    ['Seoraksan National Park', 'Mountains', 'Granite peaks and temple trails in one of Korea’s best-loved parks.', '2 h 30 min'],
  ],
  'Jeju Island': [
    ['Hallasan National Park', 'Mountains', 'Korea’s tallest mountain, with trails that start from a road halfway up.', '50 min'],
    ['Seongsan Ilchulbong', 'Coast', 'A volcanic crater rising from the sea at the island’s eastern tip.', '1 h'],
    ['Hamdeok Beach', 'Beach', 'Clear, shallow water on the north coast, easy to reach from Jeju City.', '30 min'],
    ['Cheonjiyeon Waterfall', 'Nature', 'A short walk through subtropical forest to a waterfall near Seogwipo.', '50 min'],
  ],
  'Munich': [
    ['Neuschwanstein Castle', 'Castle', 'The fairy-tale castle above the Alps, best visited on a weekday morning.', '2 h'],
    ['Lake Tegernsee', 'Lake', 'A mountain lake with lakeside inns and walks for all levels.', '1 h'],
    ['Garmisch and the Zugspitze', 'Mountains', 'Germany’s highest peak, reached by cable car from Garmisch-Partenkirchen.', '1 h 30 min'],
    ['Lake Starnberg', 'Lake', 'A quick swim, a boat trip or a beer garden on the water.', '40 min'],
  ],
  'Berlin': [
    ['Potsdam and Sanssouci', 'Palace', 'Frederick the Great’s summer palace and its terraced gardens.', '40 min'],
    ['Spreewald', 'Nature', 'A maze of canals you can explore by punt, with pickled-cucumber stalls on shore.', '1 h 30 min'],
    ['Dresden', 'City', 'A rebuilt old town on the Elbe with major museums and a riverside promenade.', '2 h'],
    ['Wannsee and the Havel lakes', 'Lake', 'Swimming spots and boat rides at the western edge of the city.', '30 min'],
  ],
  'Los Angeles': [
    ['Malibu and Pacific Coast Highway', 'Coast', 'The classic coast road, with beaches and seafood shacks every few miles.', '30 min'],
    ['Griffith Observatory', 'Views', 'A free observatory with a view of the Hollywood sign and the whole basin.', '35 min'],
    ['Santa Barbara', 'Coast', 'A Spanish-style town between the mountains and the Pacific.', '1 h 45 min'],
    ['Joshua Tree National Park', 'Desert', 'Boulder fields, Joshua trees and very dark night skies.', '2 h 45 min'],
  ],
  'Glasgow': [
    ['Loch Lomond', 'Lake', 'The largest lake in Britain by surface area, with walks along its shore.', '45 min'],
    ['Stirling Castle', 'Castle', 'A hilltop castle with views to the Wallace Monument.', '45 min'],
    ['Inveraray Castle', 'Castle', 'A castle on Loch Fyne, reached by a scenic road past Loch Lomond.', '1 h 30 min'],
    ['Glencoe', 'Mountains', 'A dramatic glen, often called the most beautiful drive in Scotland.', '2 h 15 min'],
  ],
  'Birmingham': [
    ['Stratford-upon-Avon', 'Culture', 'Shakespeare’s birthplace, with a riverside theatre and half-timbered streets.', '50 min'],
    ['Bourton-on-the-Water', 'Countryside', 'A classic Cotswold village with a stream running through the centre.', '1 h 15 min'],
    ['Peak District', 'Nature', 'Moorland edges, limestone dales and quiet pub lunches.', '1 h 30 min'],
    ['Snowdonia', 'Mountains', 'Wales’s mountain national park, a long but rewarding day trip.', '2 h 30 min'],
  ],
  'Tokyo': [
    ['Kamakura and Enoshima', 'Coast', 'Temples, the Great Buddha and a beach island, all in one day.', '1 h 15 min'],
    ['Hakone', 'Onsen', 'Hot springs, a volcanic valley and views of Mount Fuji from a lake.', '1 h 45 min'],
    ['Lake Kawaguchiko', 'Mountains', 'The classic Mount Fuji viewpoint, with lakeside cafés and trails.', '1 h 45 min'],
    ['Nikko', 'Culture', 'Ornate shrines in a cedar forest, with waterfalls and a mountain lake nearby.', '2 h 30 min'],
  ],
  'Lisbon': [
    ['Sintra and Pena Palace', 'Palace', 'A colourful hilltop palace and misty forests, best reached early.', '40 min'],
    ['Cascais and Cabo da Roca', 'Coast', 'A seaside town and the westernmost point of mainland Europe.', '45 min'],
    ['Arrábida Natural Park', 'Nature', 'Limestone hills dropping to turquoise coves south of the Tagus.', '50 min'],
    ['Comporta', 'Beach', 'Wide, empty beaches and rice fields on the Alentejo coast.', '1 h 15 min'],
  ],
  'Dubai': [
    ['Dubai Desert Conservation Reserve', 'Desert', 'Dunes, oryx and sunset drives away from the city lights.', '50 min'],
    ['Sheikh Zayed Grand Mosque', 'Culture', 'The white marble mosque in Abu Dhabi, open to visitors most days.', '1 h 15 min'],
    ['Hatta', 'Mountains', 'A mountain town with a dam, kayaks and hiking trails in the Hajar range.', '1 h 30 min'],
    ['Jebel Jais', 'Mountains', 'The tallest peak in the UAE, with a long switchback road to the top.', '1 h 30 min'],
  ],
  'Cape Town': [
    ['Chapman’s Peak Drive', 'Coast', 'A road cut into the cliffs above the Atlantic, one of the best in the world.', '35 min'],
    ['Stellenbosch and Franschhoek', 'Wine', 'Oak-lined streets and wine estates in the winelands.', '50 min'],
    ['Cape Point', 'Nature', 'The rocky tip of the Cape Peninsula, with a lighthouse and wild beaches.', '1 h 30 min'],
    ['Hermanus', 'Coast', 'A seaside town where whales come close to shore between June and November.', '1 h 45 min'],
  ],
};

// Admin-saved locations (admin.html > Locations) replace the rows above in this browser.
if (typeof HZLOC !== 'undefined') HZLOC.applyData(CITIES, PLACE, INFO, SPOTS, ROUTES);
