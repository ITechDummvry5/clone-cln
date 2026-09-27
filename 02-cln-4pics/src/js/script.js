// ─── STORAGE ───────────────────────────────────
const LK='4pics1word_levels', PK='4pics1word_progress';
let levels=[],idx=0,slots=[],tiles=[],hints=100,on=false;

function loadLvls(){try{levels=JSON.parse(localStorage.getItem(LK))||[];}catch{levels=[];}levels=levels.filter(l=>l.word&&l.images&&l.images.filter(Boolean).length===4);}
function loadProg(){try{const p=JSON.parse(localStorage.getItem(PK));if(p&&p.index!=null)idx=Math.min(p.index,Math.max(0,levels.length-1));}catch{}}
function saveProg(){localStorage.setItem(PK,JSON.stringify({index:idx}));}
function saveLevels(){try{localStorage.setItem(LK,JSON.stringify(levels));return true;}catch{showToast('Storage full! Use smaller images.','#e74c3c');return false;}}

// ─── SCREEN SWITCHING ──────────────────────────
function goAdmin(){document.getElementById('game-screen').classList.remove('active');document.getElementById('admin-screen').classList.add('active');loadAdmin();}
function goGame(){document.getElementById('admin-screen').classList.remove('active');document.getElementById('game-screen').classList.add('active');init();}

// ─── GAME ───────────────────────────────────────
function init(){
  loadLvls();
  const ga=document.getElementById('game-area'),nl=document.getElementById('no-levels');
  if(!levels.length){nl.classList.add('show');ga.classList.remove('active');return;}
  loadProg();nl.classList.remove('show');ga.classList.add('active');
  hints=100;loadLevel(idx);
}

function loadLevel(i){
  idx=i;saveProg();on=true;
  const lvl=levels[i];
  slots=new Array(lvl.word.length).fill(null);
  document.getElementById('nav-badge').textContent=lvl.name||'Level '+(i+1);
  updateProg();
  const grid=document.getElementById('img-grid');grid.innerHTML='';
  lvl.images.forEach(src=>{
    const c=document.createElement('div');c.className='img-cell';
    const img=document.createElement('img');img.src=src;img.alt='';
    c.appendChild(img);grid.appendChild(c);
  });
  buildTiles(lvl);renderAll();
  document.getElementById('win-ov').classList.remove('active');
}

function buildTiles(lvl){
  const w=lvl.word,ex=lvl.extraCount??4,A='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let all=w.split('').map(l=>({l,used:false}));
  for(let i=0;i<ex;i++)all.push({l:A[~~(Math.random()*26)],used:false});
  for(let i=all.length-1;i>0;i--){const j=~~(Math.random()*(i+1));[all[i],all[j]]=[all[j],all[i]];}
  tiles=all;
}

function renderAll(){renderSlots();renderTiles();}
function renderSlots(){
  const row=document.getElementById('ans-row');row.innerHTML='';
  slots.forEach((s,i)=>{
    const d=document.createElement('div');
    d.className='slot'+(s?' filled':'');d.textContent=s?s.l:'';
    d.onclick=()=>returnSlot(i);row.appendChild(d);
  });
}
function renderTiles(){
  const row=document.getElementById('tiles-row');row.innerHTML='';
  tiles.forEach((t,i)=>{
    const d=document.createElement('div');
    d.className='tile'+(t.used?' used':'');d.textContent=t.l;
    if(!t.used)d.onclick=()=>placeTile(i);
    row.appendChild(d);
  });
}
function placeTile(i){if(!on||tiles[i].used)return;const si=slots.indexOf(null);if(si===-1)return;tiles[i].used=true;slots[si]={l:tiles[i].l,ti:i};renderAll();if(slots.every(s=>s!==null))setTimeout(checkAns,220);}
function returnSlot(i){if(!on||!slots[i])return;tiles[slots[i].ti].used=false;slots[i]=null;renderAll();}
function clearAns(){if(!on)return;slots.forEach((s,i)=>{if(s)tiles[s.ti].used=false;slots[i]=null;});renderAll();}

function checkAns(){
  if(!on)return;
  if(slots.some(s=>!s)){showToast('Fill all letters first');return;}
  const guess=slots.map(s=>s.l).join('');
  if(guess===levels[idx].word){
    on=false;
    document.querySelectorAll('.slot').forEach(el=>el.classList.add('correct'));
    setTimeout(showWin,480);
  } else {
    document.querySelectorAll('.slot').forEach(el=>el.classList.add('wrong'));
    setTimeout(()=>{document.querySelectorAll('.slot').forEach(el=>el.classList.remove('wrong'));clearAns();},420);
    showToast('Not quite, try again!');
  }
}

function showWin(){
  document.getElementById('win-word').textContent=levels[idx].word;
  const last=idx>=levels.length-1;
  document.getElementById('win-sub').textContent=last?'All levels complete! Great job!':'Great job!';
  document.getElementById('btn-next').textContent=last?'Play Again':'Next Level →';
  document.getElementById('win-ov').classList.add('active');
  confetti();
}
function nextLevel(){idx++;if(idx>=levels.length)idx=0;hints=100;loadLevel(idx);}

function openHint(){if(!on)return;if(!hints){showToast('No hints remaining');return;}document.getElementById('hints-left').textContent=hints;document.getElementById('hint-ov').classList.add('active');}
function closeHint(){document.getElementById('hint-ov').classList.remove('active');}
function useHint(){
  closeHint();if(!hints)return;hints--;
  const si=slots.indexOf(null);if(si===-1)return;
  const need=levels[idx].word[si];
  const ti=tiles.findIndex(t=>t.l===need&&!t.used);
  if(ti===-1){showToast('Hint unavailable');return;}
  tiles[ti].used=true;slots[si]={l:need,ti};renderAll();
}
function updateProg(){
  const p=levels.length>1?Math.round((idx/(levels.length-1))*100):100;
  document.getElementById('prog-fill').style.width=p+'%';
  document.getElementById('prog-label').textContent='Level '+(idx+1)+' of '+levels.length;
  document.getElementById('prog-pct').textContent=p+'%';
}

// ─── ADMIN ─────────────────────────────────────
let curIdx=-1,imgData=['','','',''];

function loadAdmin(){
  try{levels=JSON.parse(localStorage.getItem(LK))||[];}catch{levels=[];}
  renderSidebar();
  if(levels.length&&curIdx>=0&&curIdx<levels.length)selectLevel(curIdx);
  else if(!levels.length){showEmptyAdmin();}
}

function showEmptyAdmin(){document.getElementById('empty-admin').style.display='flex';document.getElementById('editor').style.display='none';}

function renderSidebar(){
  document.getElementById('lvl-count').textContent=levels.length;
  const list=document.getElementById('lvl-list');list.innerHTML='';
  levels.forEach((lvl,i)=>{
    const d=document.createElement('div');
    d.className='lvl-item'+(i===curIdx?' active':'');
    d.innerHTML=`<div class="lvl-num">${i+1}</div><div class="lvl-info"><div class="lvl-name">${esc(lvl.name||'Level '+(i+1))}</div><div class="lvl-word">${esc(lvl.word||'???')}</div></div><button class="del-lvl-btn" onclick="event.stopPropagation();delAt(${i})"><img src="images/close.png" alt="del" style="width:10px;height:10px;object-fit:contain"></button>`;
    d.onclick=()=>selectLevel(i);list.appendChild(d);
  });
}

function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

function selectLevel(i){
  curIdx=i;const lvl=levels[i];
  imgData=lvl.images?[...lvl.images]:['','','',''];
  document.getElementById('empty-admin').style.display='none';
  document.getElementById('editor').style.display='block';
  document.getElementById('ed-title').textContent=lvl.name||'Level '+(i+1);
  document.getElementById('f-name').value=lvl.name||'';
  document.getElementById('f-word').value=lvl.word||'';
  document.getElementById('f-extra').value=lvl.extraCount??4;
  renderImgGrid();updatePreview();renderSidebar();
}

function renderImgGrid(){
  const grid=document.getElementById('img-upload-grid');grid.innerHTML='';
  for(let s=0;s<4;s++){
    const has=!!imgData[s];
    const d=document.createElement('div');
    d.className='img-slot'+(has?' has-img':' empty');
    d.innerHTML=`<span class="img-slot-num">#${s+1}</span>${has?`<img src="${imgData[s]}" alt="">`:''}<div class="img-slot-overlay"><div class="img-slot-icon"><img src="${has?'assets/images/edit.png':'assets/images/camera.png'}" alt="" style="width:24px;height:24px;object-fit:contain"></div><div class="img-slot-hint">${has?'Replace':'Upload'}</div></div><button class="rm-img-btn" onclick="rmImg(event,${s})"><img src="images/close.png" alt="" style="width:10px;height:10px;object-fit:contain"></button><input type="file" accept="image/*" onchange="onImgUpload(event,${s})">`;
    d.onclick=e=>{if(!e.target.classList.contains('rm-img-btn'))d.querySelector('input[type=file]').click();};
    grid.appendChild(d);
  }
  updateStats();
}

function onImgUpload(e,s){
  const f=e.target.files[0];if(!f)return;
  showToast('Compressing…');
  compressImage(f,data=>{imgData[s]=data;renderImgGrid();showToast('Image loaded ✓');});
}
function rmImg(e,s){e.stopPropagation();imgData[s]='';renderImgGrid();}

function compressImage(file,cb){
  const reader=new FileReader();
  reader.onload=ev=>{
    const img=new Image();
    img.onload=()=>{
      const MAX=600;let w=img.width,h=img.height;
      if(w>MAX||h>MAX){if(w>h){h=Math.round(h*MAX/w);w=MAX;}else{w=Math.round(w*MAX/h);h=MAX;}}
      const c=document.createElement('canvas');c.width=w;c.height=h;
      c.getContext('2d').drawImage(img,0,0,w,h);cb(c.toDataURL('image/jpeg',.72));
    };img.src=ev.target.result;
  };reader.readAsDataURL(file);
}

function updateStats(){
  const word=document.getElementById('f-word')?.value||'';
  const extra=parseInt(document.getElementById('f-extra')?.value)||4;
  const imgs=imgData.filter(Boolean).length;
  document.getElementById('s-imgs').textContent=imgs+'/4';
  document.getElementById('s-len').textContent=word.length;
  document.getElementById('s-tiles').textContent=word.length+extra;
}

let prevTimer=null;
function updatePreview(){
  clearTimeout(prevTimer);
  prevTimer=setTimeout(()=>{
    const word=(document.getElementById('f-word')?.value||'').toUpperCase();
    const extra=parseInt(document.getElementById('f-extra')?.value)||4;
    updateStats();
    const box=document.getElementById('preview-tiles');if(!box)return;
    box.innerHTML='';if(!word)return;
    const ABC='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const ans=word.split('');const extras=[];
    for(let i=0;i<extra;i++)extras.push(ABC[~~(Math.random()*26)]);
    const all=[...ans,...extras];
    for(let i=all.length-1;i>0;i--){const j=~~(Math.random()*(i+1));[all[i],all[j]]=[all[j],all[i]];}
    const ac={};ans.forEach(l=>ac[l]=(ac[l]||0)+1);const uc={};
    all.forEach(l=>{uc[l]=(uc[l]||0)+1;const d=document.createElement('div');d.className='prev-tile'+(uc[l]<=(ac[l]||0)?' ans':'');d.textContent=l;box.appendChild(d);});
  },120);
}

function saveCurrent(){
  if(curIdx<0)return;
  const name=document.getElementById('f-name').value.trim()||'Level '+(curIdx+1);
  const word=document.getElementById('f-word').value.trim().toUpperCase();
  const extra=parseInt(document.getElementById('f-extra').value)||4;
  if(!word){showToast('Enter an answer word');return;}
  if(imgData.filter(Boolean).length<4){showToast('Upload all 4 images');return;}
  levels[curIdx]={name,word,extraCount:extra,images:[...imgData]};
  if(saveLevels()){renderSidebar();document.getElementById('ed-title').textContent=name;showToast('Level saved ✓');}
}
function delCurrent(){if(curIdx<0)return;if(!confirm('Delete this level?'))return;delAt(curIdx);}
function delAt(i){levels.splice(i,1);saveLevels();if(curIdx>=levels.length)curIdx=levels.length-1;if(curIdx<0)showEmptyAdmin();else selectLevel(curIdx);renderSidebar();}

// ── New Level Modal ──
function openModal(){document.getElementById('m-name').value='Level '+(levels.length+1);document.getElementById('m-word').value='';document.getElementById('modal-bg').classList.add('show');setTimeout(()=>document.getElementById('m-name').focus(),60);}
function closeModal(){document.getElementById('modal-bg').classList.remove('show');}
function createLevel(){
  const name=document.getElementById('m-name').value.trim()||'Level '+(levels.length+1);
  const word=document.getElementById('m-word').value.trim().toUpperCase();
  if(!word){showToast('Enter an answer word');return;}
  levels.push({name,word,extraCount:4,images:['','','','']});
  saveLevels();closeModal();renderSidebar();selectLevel(levels.length-1);
}

// ── Export / Import ──
function exportLevels(){
  const b=new Blob([JSON.stringify(levels,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='kpop_4pics1word_levels.json';a.click();
  showToast('Exported ✓');
}
function importLevels(e){
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=ev=>{
    try{
      const d=JSON.parse(ev.target.result);
      if(!Array.isArray(d))throw 0;
      // Merge or replace
      const action=confirm(`Import ${d.length} level(s)?\n\nOK = Add to existing levels\nCancel = Replace all levels`);
      if(action){levels=[...levels,...d];}else{levels=d;}
      saveLevels();curIdx=-1;
      showEmptyAdmin();renderSidebar();
      showToast('Imported '+d.length+' levels ✓');
    }catch{showToast('Invalid JSON file');}
  };
  r.readAsText(f);e.target.value='';
}

// ─── SHARED ────────────────────────────────────
function showToast(m,bg=''){
  const t=document.getElementById('toast');
  t.textContent=m;if(bg)t.style.background=bg;else t.style.background='';
  t.classList.add('show');setTimeout(()=>{t.classList.remove('show');},2200);
}
function confetti(){
  const c=document.getElementById('cf');c.innerHTML='';
  const cols=['#4a7ff5','#2ecc71','#f39c12','#e74c3c','#a78bfa','#5ac8fa','#ff2d55','#ffcc00'];
  for(let i=0;i<80;i++){
    const p=document.createElement('div');p.className='cp';
    const sz=5+Math.random()*9;
    p.style.cssText=`left:${Math.random()*100}%;width:${sz}px;height:${sz}px;background:${cols[~~(Math.random()*cols.length)]};border-radius:${Math.random()>.5?'50%':'3px'};animation-duration:${1.2+Math.random()*2}s;animation-delay:${Math.random()*.5}s;`;
    c.appendChild(p);
  }
  setTimeout(()=>c.innerHTML='',4500);
}

// ─── KEYBOARD ──────────────────────────────────
document.addEventListener('keydown',e=>{
  const screen=document.getElementById('game-screen');
  if(!screen.classList.contains('active'))return;
  if(!on)return;
  const k=e.key.toUpperCase();
  if(/^[A-Z]$/.test(k)){const ti=tiles.findIndex(t=>t.l===k&&!t.used);if(ti!==-1)placeTile(ti);}
  else if(e.key==='Backspace'){for(let i=slots.length-1;i>=0;i--){if(slots[i]){returnSlot(i);break;}}}
  else if(e.key==='Enter')checkAns();
  else if(e.key==='Escape')closeHint();
});
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='s'){e.preventDefault();if(document.getElementById('admin-screen').classList.contains('active'))saveCurrent();}if(e.key==='Escape')closeModal();});
document.getElementById('hint-ov').addEventListener('click',e=>{if(e.target===e.currentTarget)closeHint();});
document.getElementById('modal-bg').addEventListener('click',e=>{if(e.target===e.currentTarget)closeModal();});

// ─── INIT ──────────────────────────────────────
init();
let _snap='';
setInterval(()=>{try{const r=localStorage.getItem(LK)||'[]';if(r!==_snap){_snap=r;if(document.getElementById('game-screen').classList.contains('active'))init();}}catch{}},1500);
