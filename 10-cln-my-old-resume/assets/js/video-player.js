/* Featured Work Videos Section:
   1. Stacked card vertical scroll animation (scroll drives card stack).
   2. Interactive video player (click thumbnail to load HTML5 video or YouTube iframe embed). */

/* Part 1: Stacked Card Scroll Animation */
(function(){
  const sec=document.querySelector('.vsec');if(!sec)return;
  const stage=sec.querySelector('.vstage'),vg=sec.querySelector('.vg');
  const cards=[...vg.children],N=cards.length,rm=matchMedia('(prefers-reduced-motion: reduce)');
  const STEP=.85,clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
  const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  let sm=0,shown=-1,last=performance.now(),pinned=false;

  function progress(){
    const span=sec.offsetHeight-stage.offsetHeight;
    return span>0?clamp(-sec.getBoundingClientRect().top/span,0,1):0;
  }

  function reset(){
    sec.style.height='';
    cards.forEach(c=>{c.style.transform='';c.style.filter='';c.style.zIndex='';c.style.removeProperty('--py')});
  }

  function draw(){
    const t=sm*(N-1);
    cards.forEach((c,i)=>{
      const enter=i===0?1:ease(clamp(t-(i-1),0,1));
      const cover=clamp(t-i,0,1);
      const y=(1-enter)*105-cover*5, s=1-.05*cover;
      c.style.zIndex=i+1;
      c.style.transform='translate3d(0,'+y.toFixed(2)+'%,0) scale('+s.toFixed(4)+')';
      c.style.filter='brightness('+(1-.55*cover).toFixed(3)+')';
      c.style.setProperty('--py',(cover>0?-cover:(1-enter)).toFixed(3));
    });
    shown=sm;
  }

  function measure(){
    const want=!rm.matches&&innerHeight>=520&&N>1;
    if(want!==pinned){pinned=want;sec.classList.toggle('is-pinned',want);if(!want)reset()}
    if(!pinned)return;
    sec.style.height=(stage.offsetHeight*(1+(N-1)*STEP))+'px';
    sm=progress();draw();
  }

  (function loop(now){
    requestAnimationFrame(loop);
    if(!pinned)return;
    const r=sec.getBoundingClientRect();
    if(r.bottom<0||r.top>innerHeight){last=now;return}
    const dt=Math.min((now-last)/1000,.05);last=now;
    sm+=(progress()-sm)*(1-Math.exp(-dt*9));
    if(Math.abs(sm-shown)>.00005)draw();
  })(last);

  addEventListener('resize',measure);
  addEventListener('orientationchange',measure);
  addEventListener('load',measure);
  if(rm.addEventListener)rm.addEventListener('change',measure);
  measure();
})();

/* Part 2: Interactive Video Player (Click thumbnail -> HTML5 Video / YouTube Embed) */
(function(){
  const boxes=document.querySelectorAll('.vsec .v[data-video],.vsec .v[data-embed]');
  function play(box){
    if(box.classList.contains('playing'))return;
    let el;
    if(box.dataset.video){
      el=document.createElement('video');
      el.src=box.dataset.video;
      el.controls=true;el.autoplay=true;el.playsInline=true;
      const img=box.querySelector('img');if(img&&img.src)el.poster=img.src;
    }else{
      el=document.createElement('iframe');
      const u=box.dataset.embed;
      el.src=u+(u.indexOf('?')>-1?'&':'?')+'autoplay=1';
      el.allow='autoplay; fullscreen; picture-in-picture';
      el.allowFullscreen=true;
    }
    box.appendChild(el);
    box.classList.add('playing');
  }
  function stop(box){
    const v=box.querySelector('video,iframe');
    if(!v)return;
    v.remove();box.classList.remove('playing');
  }
  boxes.forEach(function(b){
    b.setAttribute('role','button');b.tabIndex=0;b.setAttribute('aria-label','Play video');
    b.addEventListener('click',function(e){if(!b.classList.contains('playing'))play(b)});
    b.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();play(b)}});
  });

  /* Stop a video when its card leaves the screen */
  if('IntersectionObserver' in window){
    const io=new IntersectionObserver(function(es){
      es.forEach(function(e){if(!e.isIntersecting)stop(e.target)});
    },{threshold:0.15});
    boxes.forEach(function(b){io.observe(b)});
  }

  /* Stop a video when the next stacked card slides over it
     (the card is still "on screen", but no longer the topmost thing) */
  let ticking=false;
  function checkCovered(){
    ticking=false;
    boxes.forEach(function(b){
      if(!b.classList.contains('playing'))return;
      const r=b.getBoundingClientRect();
      const el=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
      if(!el||!b.contains(el))stop(b);
    });
  }
  addEventListener('scroll',function(){
    if(ticking)return;
    ticking=true;requestAnimationFrame(checkCovered);
  },{passive:true});
})();
