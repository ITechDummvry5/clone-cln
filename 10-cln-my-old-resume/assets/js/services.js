/* Services page: reveal each chapter when it scrolls into view + top progress bar. */
(function(){
const chs=[...document.querySelectorAll('.ch,.svi')];
if('IntersectionObserver' in window){
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.25});
  chs.forEach(c=>io.observe(c));
}else chs.forEach(c=>c.classList.add('in'));
const bar=document.querySelector('.sv-bar i');
function prog(){const h=document.documentElement.scrollHeight-innerHeight;bar.style.transform='scaleX('+(h>0?Math.min(1,scrollY/h):0)+')'}
addEventListener('scroll',prog,{passive:true});addEventListener('resize',prog);prog();
})();
