/* Services isometric background: staggered load-in animation when the section scrolls into view. */
(function(){
  const el=document.querySelector('.svc-iso'),sec=document.getElementById('services');if(!el||!sec)return;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.classList.add('iso-js');
  if(!reduce)sec.classList.add('svc-hold');
  el.querySelectorAll('[data-ix]').forEach((e,i)=>{e.style.transitionDelay=reduce?'0s':i*35+'ms'});
  const go=()=>{el.classList.add('iso-ready');sec.classList.remove('svc-hold')};
  if(reduce||!('IntersectionObserver' in window)){requestAnimationFrame(()=>requestAnimationFrame(go));return}
  new IntersectionObserver((en,o)=>{if(en.some(x=>x.isIntersecting)){requestAnimationFrame(go);o.disconnect()}},{threshold:.15}).observe(sec);
})();
