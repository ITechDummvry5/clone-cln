/* ---- DATA: edit text/prices here, images live in section_img/<section>/ ---- */
const types=[
 ['Tote Bag','Roomy and easy for daily errands.'],['Cross Body Bag','Light and hands-free for the city.'],['Backpack','Padded for all-day comfort.'],['Hand Bag','Polished shapes for work and evenings.']
];
const featured=[
 ['Trailmate 30L Hiking Backpack',70,80,3,'Casual',1],
 ['Metro Slim Laptop Backpack',55,60,4,'Casual',1],
 ['Everyday Canvas Tote',45,60,0,'Casual',1],
 ['Voyager Carry-On Duffel',35,55,0,'Travel',1]
];
const popular=[
 ['Daypack Series (3 sizes)','$35.00 – $45.00',5,'Casual',1,'View products'],
 ['Summit Roll-Top Backpack','$45.00',5,'Casual'],
 ['Urban Crossbody Sling','$25.00',4,'Casual'],
 ['Weekender Travel Pouch','$25.00',4,'Travel']
];
const trending=['Trailmate 30L Hiking Backpack','Metro Slim Laptop Backpack','Everyday Canvas Tote','Summit Roll-Top Backpack'];

const stars=n=>n?`<div class="stars">${[1,2,3,4,5].map(i=>`<i data-lucide="star" class="${i>n?'off':''}"></i>`).join('')}</div>`:'<div class="stars"></div>';

document.getElementById('types').innerHTML=types.map((t,i)=>`
 <a href="#" class="type"><img src="section_img/types/${i+1}.jpg" alt=""><span class="zin" role="button" tabindex="0" aria-label="Zoom image"><i data-lucide="zoom-in"></i></span>
 <h3>${t[0]}</h3><p>${t[1]}</p></a>`).join('');

document.getElementById('featuredGrid').innerHTML=featured.map((p,i)=>`
 <article class="prod"><a href="#" class="pimg"><span class="tag">SALE</span><img src="section_img/featured/${i+1}.jpg" alt=""><span class="zin" role="button" tabindex="0" aria-label="Zoom image"><i data-lucide="zoom-in"></i></span></a>
 <h3>${p[0]}</h3><div class="price">$${p[1]}.00 <s>$${p[2]}.00</s></div>${stars(p[3])}
 <div class="cat">${p[4]}</div><button class="btn add">Add to cart</button></article>`).join('');

document.getElementById('popularGrid').innerHTML=popular.map((p,i)=>`
 <article class="prod"><a href="#" class="pimg">${i==0?'<span class="tag">SALE</span>':''}<img src="section_img/popular/${i+1}.jpg" alt=""><span class="zin" role="button" tabindex="0" aria-label="Zoom image"><i data-lucide="zoom-in"></i></span></a>
 <h3>${p[0]}</h3><div class="price">${p[1]}</div>${stars(p[2])}
 <div class="cat">${p[3]}</div><button class="btn add">${p[5]||'Add to cart'}</button></article>`).join('');

const reviews=[
 ['Maya Santos','Weekend hiker','I have worn my Trailmate on three treks this year and it still looks new. The back padding is the best I have tried.'],
 ['Daniel Reyes','Software engineer','The Metro fits my laptop, charger and lunch without feeling bulky. It survived a rainy commute without a single wet page.'],
 ['Priya Nair','Travel blogger','I carried the Voyager through six airports in two weeks. Light, tough, and it always fits under the seat.']
];
document.getElementById('clients').innerHTML=reviews.map((r,i)=>`
 <div class="quote"><p>${r[2]}</p>
 <div class="who"><div class="av"><img src="section_img/clients/${i+1}.jpg" alt=""></div><div><b>${r[0]}</b><span>${r[1]}</span></div></div></div>`).join('');

document.getElementById('trending').innerHTML=trending.map((t,i)=>`
 <a href="#" class="ti"><span class="th"><img src="section_img/trending/${i+1}.jpg" alt=""></span><span>${t}</span></a>`).join('');

/* simple cart feedback */
document.querySelectorAll('.btn.add').forEach(b=>b.onclick=()=>{
 if(b.textContent.trim()!=='Add to cart')return;
 b.textContent='Added';setTimeout(()=>b.textContent='Add to cart',1200);
});

/* mega menu: hover intent (small open delay, longer close delay) so fast passes never flicker */
const menus=[...document.querySelectorAll('.has-mega')],canHover=matchMedia('(hover:hover)');
menus.forEach(li=>{
 let ot,ct;
 const open=()=>{clearTimeout(ct);clearTimeout(ot);
  const other=menus.some(m=>m!==li&&m.classList.contains('open'));
  ot=setTimeout(()=>{menus.forEach(m=>m!==li&&m.classList.remove('open'));li.classList.add('open')},other?0:90)};
 const close=()=>{clearTimeout(ot);clearTimeout(ct);ct=setTimeout(()=>li.classList.remove('open'),220)};
 li.addEventListener('mouseenter',()=>canHover.matches&&open());
 li.addEventListener('mouseleave',()=>canHover.matches&&close());
 li.addEventListener('focusin',open);
 li.addEventListener('focusout',e=>{if(!li.contains(e.relatedTarget))close()});
 li.querySelector(':scope>a').addEventListener('click',e=>{if(!canHover.matches){e.preventDefault();li.classList.toggle('open')}});
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')menus.forEach(m=>m.classList.remove('open'))});

lucide.createIcons();

/* ---- click-to-zoom: GLightbox ---- */
const lbOpts={openEffect:'zoom',closeEffect:'fade',slideEffect:'slide',loop:true,touchNavigation:true,zoomable:true,draggable:true};
/* product images: the whole image link opens the viewer, grouped so you can swipe through */
document.querySelectorAll('.pimg').forEach(a=>{
 const img=a.querySelector('img'),card=a.closest('.prod');
 a.href=img.getAttribute('src');
 a.classList.add('glightbox');
 a.dataset.gallery=a.closest('#featuredGrid')?'featured':'popular';
 a.dataset.title=card.querySelector('h3').textContent;
 a.dataset.description=card.querySelector('.price').textContent;
});
GLightbox({selector:'.glightbox',...lbOpts});
/* backpack types: small zoom button, the card link itself stays a link */
const typeBox=GLightbox({...lbOpts,elements:types.map((t,i)=>({href:`section_img/types/${i+1}.jpg`,type:'image',title:t[0],description:t[1]}))});
document.querySelectorAll('.type .zin').forEach((b,i)=>{
 const go=e=>{e.preventDefault();e.stopPropagation();typeBox.openAt(i)};
 b.addEventListener('click',go);
 b.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')go(e)});
});

/* ---- gentle scroll reveal ---- */
if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion:reduce)').matches){
 const io=new IntersectionObserver(en=>en.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
 document.querySelectorAll('.head,.feature,.deal,.prod,.type,.quote,.cols>div,.ti,.trend h4').forEach(el=>{
  el.style.transitionDelay=([...el.parentElement.children].indexOf(el)%4)*.12+'s';
  el.classList.add('reveal');io.observe(el);
 });
}
