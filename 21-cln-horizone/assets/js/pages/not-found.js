// 404 page: shown by the host for any address that does not exist.
isoNotFound(document.getElementById('nf'), {          // components/isometric.js
  eyebrow: 'Error 404', title: 'This page doesn’t exist',
  text: 'The link may be broken or the page may have moved. Head back home or pick up where you left off.',
  actions: [['Back to home', 'index.html'], ['Browse cars', 'cars.html', 'ghost']],
  tryTitle: 'Popular pages', chips: [['Cars', 'cars.html'], ['Locations', 'locations.html'], ['Deals', 'deals.html'], ['Help centre', 'help.html'], ['About', 'about.html']],
});
