(function(){
/* ===== EDIT THESE ===== */
const HERO_IMAGE = "assets/images/projects/hero.jpg";       /* the big image at the top (zgHeroImg) */
const HEIGHTS = [197,285,241,115,157,241];            /* tile heights repeat in this pattern */
const PROJECTS = [
  // 200
  {t:"Project 1",  url:"#", img:"assets/images/projects/1.jpg",  h:200},
  {t:"Project 2",  url:"#", img:"assets/images/projects/2.jpg",  h:200},
  {t:"Project 3",  url:"#", img:"assets/images/projects/3.jpg",  h:200},
  {t:"Project 4",  url:"#", img:"assets/images/projects/4.jpg",  h:200},
  {t:"Project 5",  url:"#", img:"assets/images/projects/5.jpg",  h:200},

  // 230
  {t:"Project 6",  url:"#", img:"assets/images/projects/6.jpg",  h:230},
  {t:"Project 7",  url:"#", img:"assets/images/projects/7.jpg",  h:230},
  {t:"Project 8",  url:"#", img:"assets/images/projects/8.jpg",  h:230},
  {t:"Project 9",  url:"#", img:"assets/images/projects/9.jpg",  h:230},
  {t:"Project 10", url:"#", img:"assets/images/projects/10.jpg", h:230},

  // 250
  {t:"Project 11", url:"#", img:"assets/images/projects/11.jpg", h:250},
  {t:"Project 12", url:"#", img:"assets/images/projects/12.jpg", h:250},
  {t:"Project 13", url:"#", img:"assets/images/projects/13.jpg", h:250},
  {t:"Project 14", url:"#", img:"assets/images/projects/14.jpg", h:250},
  {t:"Project 15", url:"#", img:"assets/images/projects/15.jpg", h:250},

  // 270
  {t:"Project 16", url:"#", img:"assets/images/projects/16.jpg", h:270},
  {t:"Project 17", url:"#", img:"assets/images/projects/17.jpg", h:270},
  {t:"Project 18", url:"#", img:"assets/images/projects/18.jpg", h:270},
  {t:"Project 19", url:"#", img:"assets/images/projects/19.jpg", h:270},
  {t:"Project 20", url:"#", img:"assets/images/projects/20.jpg", h:270},

  // 290
  {t:"Project 21", url:"#", img:"assets/images/projects/21.jpg", h:290},
  {t:"Project 22", url:"#", img:"assets/images/projects/22.jpg", h:290},
  {t:"Project 23", url:"#", img:"assets/images/projects/23.jpg", h:290},
  {t:"Project 24", url:"#", img:"assets/images/projects/24.jpg", h:290},
  {t:"Project 25", url:"#", img:"assets/images/projects/25.jpg", h:290},

  // Repeat: 200
  {t:"Project 26", url:"#", img:"assets/images/projects/26.jpg", h:200},
  {t:"Project 27", url:"#", img:"assets/images/projects/27.jpg", h:200},
  {t:"Project 28", url:"#", img:"assets/images/projects/28.jpg", h:200},
  {t:"Project 29", url:"#", img:"assets/images/projects/29.jpg", h:200},
  {t:"Project 30", url:"#", img:"assets/images/projects/30.jpg", h:200},

  // 230
  {t:"Project 31", url:"#", img:"assets/images/projects/31.jpg", h:230},
  {t:"Project 32", url:"#", img:"assets/images/projects/32.jpg", h:230},
  {t:"Project 33", url:"#", img:"assets/images/projects/33.jpg", h:230},
  {t:"Project 34", url:"#", img:"assets/images/projects/34.jpg", h:230},
  {t:"Project 35", url:"#", img:"assets/images/projects/35.jpg", h:230},

  // 250
  {t:"Project 36", url:"#", img:"assets/images/projects/36.jpg", h:250},
  {t:"Project 37", url:"#", img:"assets/images/projects/37.jpg", h:250},
  {t:"Project 38", url:"#", img:"assets/images/projects/38.jpg", h:250},
  {t:"Project 39", url:"#", img:"assets/images/projects/39.jpg", h:250},
  {t:"Project 40", url:"#", img:"assets/images/projects/40.jpg", h:250},

  // 270
  {t:"Project 41", url:"#", img:"assets/images/projects/41.jpg", h:270},
  {t:"Project 42", url:"#", img:"assets/images/projects/42.jpg", h:270}
];                           /* images default to assets/images/blog/2.jpg, 3.jpg, 4.jpg ... in order */
/* ====================== */

  var img=document.getElementById("zgHeroImg");
  img.onerror=function(){img.remove()};img.src=HERO_IMAGE;

  var track=document.getElementById("blTrack"),pin=document.getElementById("work");
  var calm=matchMedia("(prefers-reduced-motion: reduce)").matches;
  var tiles=PROJECTS.map(function(p,i){
    p.img=p.img||"assets/images/blog/"+(i+2)+".jpg";p.h=p.h||HEIGHTS[i%HEIGHTS.length];
    return function(copy){return '<a class="bl-tile" style="height:'+(p.h/285*100).toFixed(1)+'%" href="'+p.url+'"'+(copy?' aria-hidden="true" tabindex="-1"':'')+'><div class="bl-ph" style="filter:hue-rotate('+(i*35)+'deg)"><img src="'+p.img+'" alt="" data-optional></div><span>'+p.t+'</span></a>';};
  });
  /* the list is shown twice so the loop never has a gap */
  track.innerHTML=tiles.map(function(f){return f(false)}).join("")+(calm?"":tiles.map(function(f){return f(true)}).join(""));
  if(calm)pin.classList.add("bl-still");
  var SPEED=60;                                         /* pixels per second: bigger number = faster slider */
  function loop(){track.style.setProperty("--dur",(track.scrollWidth/2/SPEED).toFixed(1)+"s");}
  loop();addEventListener("resize",loop);addEventListener("load",loop);

  /* stats: projects count comes from the list; numbers count up when they appear */
  document.getElementById("statProjects").dataset.count=PROJECTS.length;
  var nums=[].slice.call(document.querySelectorAll(".bl-num"));
  function run(el){
    var to=+el.dataset.count;if(calm||!to){el.textContent=to;return;}
    var t0=performance.now();
    (function f(now){var k=Math.min(1,(now-t0)/1200);el.textContent=Math.round(to*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(f);})(t0);
  }
  if("IntersectionObserver" in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){run(e.target);io.unobserve(e.target);}})},{threshold:.6});
    nums.forEach(function(n){io.observe(n)});
  }else nums.forEach(run);

  if(calm){var cf=document.getElementById("camFocus");cf.style.left="50%";cf.style.top="50%";}   /* still mode: focus box rests in the centre */
  /* camera timecode (counts up like a recording) */
  var tcEl=document.getElementById("camTime");
  if(!calm){var T0=performance.now();setInterval(function(){
    var f=Math.floor((performance.now()-T0)/1000*24),pad=function(n){return(n<10?"0":"")+n};
    tcEl.textContent=pad(Math.floor(f/86400))+":"+pad(Math.floor(f/1440)%60)+":"+pad(Math.floor(f/24)%60)+":"+pad(f%24);
  },42);}

  /* double-click (or double-tap) the big image to zoom in where you clicked; again to zoom out */
  var zh=document.querySelector(".zg-hero"),zEl=document.getElementById("camZoom"),camEl=document.getElementById("zgCam"),z=1,tz=1,ZOOM=2.2,lastTap=0;
  if(calm)camEl.style.opacity=0;                         /* still mode: viewfinder only shows while zoomed */
  function toggleZoom(cx,cy){
    var r=img.getBoundingClientRect();   /* zoom around the spot you clicked on the photo */
    if(tz>1){tz=1;zh.classList.remove("zoomed");}
    else{tz=ZOOM;zh.classList.add("zoomed");
      img.style.transformOrigin=((cx-r.left)/r.width*100).toFixed(1)+"% "+((cy-r.top)/r.height*100).toFixed(1)+"%";}
    if(calm){z=tz;img.style.transform="scale("+z+")";zEl.textContent=z.toFixed(1)+"x";camEl.style.opacity=tz>1?1:0;}
  }
  zh.addEventListener("dblclick",function(e){if(e.target.closest("a,button"))return;toggleZoom(e.clientX,e.clientY);});
  zh.addEventListener("pointerup",function(e){
    if(e.pointerType!=="touch"||e.target.closest("a,button"))return;
    var n=performance.now();if(n-lastTap<300){toggleZoom(e.clientX,e.clientY);lastTap=0;}else lastTap=n;
  });

  if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;

  var hero=document.querySelector(".zg-hero"),first=document.querySelector(".zg-first"),media=document.querySelector(".zg-media"),title=document.getElementById("zgTitle"),cam=document.getElementById("zgCam"),box=document.getElementById("camFocus");
  /* focus box follows the pointer, then locks (turns orange) when it stops */
  var fx=0,fy=0,tx=0,ty=0,lockT;
  function centre(){tx=cam.clientWidth/2;ty=cam.clientHeight/2;}   /* box lives in the sticky frame */
  centre();fx=tx;fy=ty;addEventListener("resize",centre);
  hero.addEventListener("pointermove",function(e){var r=cam.getBoundingClientRect();tx=e.clientX-r.left;ty=e.clientY-r.top;box.classList.remove("lock");clearTimeout(lockT);lockT=setTimeout(function(){box.classList.add("lock")},350);});
  hero.addEventListener("pointerleave",function(){centre();clearTimeout(lockT);lockT=setTimeout(function(){box.classList.add("lock")},380);});
  /* title rises out of its mask when the hero comes into view */
  title.classList.add("pre");
  if("IntersectionObserver" in window){
    new IntersectionObserver(function(es,o){es.forEach(function(e){if(e.isIntersecting){title.classList.add("in");o.disconnect();}})},{threshold:.4}).observe(first);
  }else title.classList.add("in");

  var clamp=function(v){return Math.max(0,Math.min(1,v))};
  var p=0,t=0,pp=0,pt=0,PX=0,PXR=.3;      /* PXR: parallax travel = 30% of the screen height. bigger = stronger */
  hero.classList.add("px");
  function sizePX(){PX=innerHeight*PXR;hero.style.setProperty("--px",PX.toFixed(0)+"px");}
  sizePX();addEventListener("resize",sizePX);
  function read(){var h=hero.getBoundingClientRect();t=clamp(-h.top/innerHeight);pt=clamp((innerHeight-h.top)/(innerHeight+hero.offsetHeight));}   /* clip/rounding eases in over the first screen */
  function apply(){
    var x=(3*p).toFixed(3)+"vw",r=(56*p).toFixed(2)+"px";
    media.style.clipPath="inset(0px "+x+" 0px "+x+" round 0px 0px "+r+" "+r+")";
    img.style.transform="translate3d(0,"+((pp-.5)*PX).toFixed(1)+"px,0) scale("+z.toFixed(3)+")";   /* photo drifts slower than the page = parallax */
    zEl.textContent=z.toFixed(1)+"x";
    cam.style.opacity=(tz>1?1:Math.max(0,1-p*2.2)).toFixed(3);   /* viewfinder hides once you scroll into the content, unless zoomed */
    box.style.transform="translate("+fx.toFixed(1)+"px,"+fy.toFixed(1)+"px)";
    title.style.transform="translateY("+(-70*p).toFixed(3)+"%)";
  }
  function tick(){
    read();
    z+=(tz-z)*.1;if(Math.abs(tz-z)<.002)z=tz;
    p+=(t-p)*.12;pp+=(pt-pp)*.12;if(Math.abs(pt-pp)<.0003)pp=pt;fx+=(tx-fx)*.14;fy+=(ty-fy)*.14;
    if(Math.abs(t-p)<.0005)p=t;
    apply();requestAnimationFrame(tick);
  }
  read();p=t;pp=pt;apply();tick();
})();
