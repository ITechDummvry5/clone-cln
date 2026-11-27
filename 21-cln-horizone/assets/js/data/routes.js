// One-way routes: the ONLY pairs of locations where a car may be picked up in one and returned in the other.
// Every other return must go back to the pick-up location. A route works in both directions.
//
// You normally manage these in the admin: Admin > Forms > One-way routes. What you save there is kept in this
// browser ('hz-routes') and replaces the sample routes below on every page. "Reset to defaults" brings these back.
//
// Only link pairs that can really be driven: the same region and joined by road. Never island-to-island or
// overseas pairs (Manila to Cebu, Bali to New York): the car cannot drive back.
// Each sample row: [location A, location B, distance text, fee text, one-way fee in USD (0 = free)]
const ROUTES_DEFAULT = [
  ['Munich','Berlin','Germany · about 585 km','No one-way fee',0],
  ['Glasgow','Birmingham','United Kingdom · about 470 km','No one-way fee',0],
  ['New York','Los Angeles','United States · about 4,490 km','$140 one-way fee',140],
];
const ROUTES = [];   // the live list every page reads; filled just below, and again after an admin saves

// rows: [{ a, b, info, fee }]  ->  ROUTES rows. Changes ROUTES in place so every const that points at it stays valid.
function applyRoutes(rows) {
  ROUTES.length = 0;
  rows.forEach(r => ROUTES.push([r.a, r.b, r.info || '', +r.fee > 0 ? '$' + +(+r.fee).toFixed(2) + ' one-way fee' : 'No one-way fee', +r.fee || 0]));
}
const routeDefaultRows = () => ROUTES_DEFAULT.map(r => ({ a: r[0], b: r[1], info: r[2], fee: r[4] }));
{ const s = typeof HZStore !== 'undefined' ? HZStore.get('hz-routes', null) : null; applyRoutes(Array.isArray(s) ? s : routeDefaultRows()); }
