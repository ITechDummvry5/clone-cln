/* Scroll-scrubbed hero: scroll progress -> frame index on a canvas, with 4 text chapters.
   Frames: frames/ezgif-frame-001.png ... (set data-frames / data-dir / data-prefix / data-pad / data-ext on .sh) */
(function(){
  const root=document.querySelector('.sh');if(!root)return;
  const cv=root.querySelector('canvas'),ctx=cv.getContext('2d');
  const N=+root.dataset.frames||120,dir=root.dataset.dir||'frames/',ext=root.dataset.ext||'png';
  const caps=[...root.querySelectorAll('.sh-c')],ranges=[[0,.17],[.24,.44],[.5,.7],[.77,1.01]];
  const nEl=root.querySelector('.sh-n b');
  const cue=root.querySelector('.sh-cue'),barI=root.querySelector('.sh-bar i'),load=root.querySelector('.sh-load');
  const imgs=new Array(N);let cw=0,ch=0,cur=0,target=0,raf=0,done=0;
  const prefix=root.dataset.prefix||'frame_',pad=+root.dataset.pad||4;
  const src=i=>dir+prefix+String(i+1).padStart(pad,'0')+'.'+ext;
  function fetchFrame(i){return new Promise(r=>{const im=new Image();im.decoding='async';
    im.onload=()=>{imgs[i]=im;r()};im.onerror=()=>r();im.src=src(i)}).then(()=>{
    done++;load.style.width=(done/N*100)+'%';if(done===N)setTimeout(()=>load.style.opacity=0,400);
    if(i===0||Math.abs(Math.round(cur*(N-1))-i)<2)render(cur)})}
  (async function(){let next=0;await Promise.all(Array.from({length:6},async()=>{while(next<N)await fetchFrame(next++)}))})();
  function size(){const d=Math.min(devicePixelRatio||1,2);cw=cv.clientWidth*d;ch=cv.clientHeight*d;cv.width=cw;cv.height=ch;render(cur)}
  function nearest(i){if(imgs[i])return imgs[i];for(let d=1;d<N;d++){if(imgs[i-d])return imgs[i-d];if(imgs[i+d])return imgs[i+d]}return null}
  function draw(p){const im=nearest(Math.round(p*(N-1)));ctx.fillStyle='#1a1a1a';ctx.fillRect(0,0,cw,ch);
    if(im){const s=Math.max(cw/im.width,ch/im.height),w=im.width*s,h=im.height*s;ctx.drawImage(im,(cw-w)/2,(ch-h)/2,w,h)}
    else{const x=cw*(.55+.3*p),g=ctx.createRadialGradient(x,ch*.45,0,x,ch*.45,Math.max(cw,ch)*.7);g.addColorStop(0,'#5a3a2a');g.addColorStop(1,'#1a1a1a');ctx.fillStyle=g;ctx.fillRect(0,0,cw,ch)}}
  function render(p){draw(p);caps.forEach((c,k)=>{const a=ranges[k];c.classList.toggle('on',p>=a[0]&&p<a[1]);c.classList.toggle('past',p>=a[1])});
    cue.style.opacity=p>.03?0:1;{let k=0;ranges.forEach((a,i)=>{if(p>=a[0])k=i});if(nEl)nEl.textContent=['I','II','III','IV'][k]}barI.style.transform='scaleY('+p+')'}
  function progress(){const t=root.offsetHeight-innerHeight;return Math.min(1,Math.max(0,-root.getBoundingClientRect().top/t))}
  function tick(){cur+=(target-cur)*.14;if(Math.abs(target-cur)<.0004)cur=target;render(cur);raf=cur!==target?requestAnimationFrame(tick):0}
  function onScroll(){const hd=document.querySelector('header');if(hd)hd.classList.toggle('solid',root.getBoundingClientRect().bottom<96);target=progress();if(!raf)raf=requestAnimationFrame(tick)}
  addEventListener('scroll',onScroll,{passive:true});addEventListener('load',lift);addEventListener('resize',()=>{size();onScroll()});
  function lift(){root.style.marginTop='0px';const off=root.getBoundingClientRect().top+scrollY;if(off>.5)root.style.marginTop=-off+'px';onScroll()}
  size();target=cur=progress();render(cur);
  lift();requestAnimationFrame(()=>requestAnimationFrame(lift));setTimeout(lift,300);setTimeout(lift,1000);
})();
