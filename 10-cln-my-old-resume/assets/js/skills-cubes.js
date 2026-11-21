/* Skills teaser: scroll progress through .cb-track turns 3D skills cubes (second cube spins in opposite direction). */
(function(){
  const track=document.querySelector('.cb-track');if(!track)return;
  const cubes=[...track.querySelectorAll('.cb-cube')];
  const STOPS=[{rx:90,ry:0},{rx:0,ry:0},{rx:0,ry:-90},{rx:0,ry:-180},{rx:0,ry:-270},{rx:-90,ry:-360}],N=STOPS.length;
  const ease=t=>t<.5?2*t*t:-1+(4-2*t)*t;
  const progress=()=>Math.min(1,Math.max(0,-track.getBoundingClientRect().top/Math.max(1,track.offsetHeight-innerHeight)));
  let sm=progress(),last=performance.now();
  function draw(){const t=sm*(N-1),i=Math.min(Math.floor(t),N-2),f=ease(t-i),a=STOPS[i],b=STOPS[i+1];
  const rx=a.rx+(b.rx-a.rx)*f,ry=a.ry+(b.ry-a.ry)*f;
  cubes.forEach(c=>{const d=+c.dataset.dir||1;c.style.transform='rotateX('+rx+'deg) rotateY('+(ry*d)+'deg)'})}
  (function loop(now){requestAnimationFrame(loop);const r=track.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;
  const dt=Math.min((now-last)/1000,.05);last=now;sm+=(progress()-sm)*(1-Math.exp(-dt*8));draw()})(last);
  draw();
})();
