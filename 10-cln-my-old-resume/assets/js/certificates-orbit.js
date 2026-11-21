/* Certificates scroll story: outline title splits -> globe of certificates grows out -> text inside the globe.
   Globe = cards on a sphere (Fibonacci lattice), drag / flick to spin, slow idle spin, scroll also turns it. */
(() => {
  const sec = document.getElementById('certificates');
  if (!sec) return;
  const world = sec.querySelector('.cg-world');
  const ring  = sec.querySelector('.cg-ring');
  const cards = [...ring.querySelectorAll('.cg-card')];
  const tl = sec.querySelector('.cg-l'), tr = sec.querySelector('.cg-r');
  const copy = sec.querySelector('.cg-copy');
  const stick = sec.querySelector('.cg-stick');
  const hint = sec.querySelector('.cg-hint'), dragHint = sec.querySelector('.cg-drag');
  const avatars = sec.querySelector('.cg-avatars');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- settings ---------- */
  const AUTO_SPIN = 0.0025;   // idle spin (rad/frame). 0 = none
  const DRAG_SPEED = 0.0065;  // rad per pixel dragged
  const FRICTION = 0.95;      // glide after release
  const MAX_PITCH = 1.2;
  /* scroll timeline (0 = top of section, 1 = end): open -> hold -> close */
  const SPLIT_AT = [0.05, 0.28];   // OPEN : Certi | ficates move apart
  const GROW_AT  = [0.10, 0.36];   // OPEN : globe grows out
  const TEXT_AT  = [0.34, 0.46];   // OPEN : text fades in
  const TEXT_OUT = [0.60, 0.68];   // CLOSE: text fades out
  const CLOSE_AT = [0.66, 0.92];   // CLOSE: globe shrinks away, halves join back into "Certificates"
  const TITLE_FADE = 0.85;          // how much the split title fades when the globe is open
  const SPLIT_VW = 34;             // how far each half travels (vw)
  const BG_IMAGES = ['orange', 'blue', 'violet', 'crimson'];
  const BG_HOLD = 0.3;
  const BG_START = 0;
  const BG_END   = 100;
  const BG_ZOOM  = 0.04;

  /* ---------- helpers ---------- */
  const N = cards.length;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = t => t * t * (3 - 2 * t);
  const seg = (p, [a, b]) => ease(clamp((p - a) / (b - a), 0, 1));
  const progress = () => {
    const r = sec.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    return total > 0 ? clamp(-r.top / total, 0, 1) : 0;
  };

  /* ---------- cards on a sphere ---------- */
  const golden = Math.PI * (3 - Math.sqrt(5));
  const pts = cards.map((_, i) => {
    const y = 1 - (i + 0.5) / N * 2;
    const lat = Math.asin(y), lon = i * golden;
    return { lat, lon, dir: [Math.sin(lon) * Math.cos(lat), -Math.sin(lat), Math.cos(lon) * Math.cos(lat)] };
  });

  /* ---------- state ---------- */
  let sp = progress(), lastSp = sp;
  let yaw = 0.4, pitch = -0.2, vYaw = 0, vPitch = 0;
  let dragging = false, lastX = 0, lastY = 0, hovered = null, active = true;

  /* ---------- drag to spin ---------- */
  world.addEventListener('pointerdown', e => {
    dragging = true; lastX = e.clientX; lastY = e.clientY; vYaw = vPitch = 0;
    world.classList.add('is-dragging');
  });
  window.addEventListener('pointermove', e => {
    if (!dragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    vYaw = -dx * DRAG_SPEED; vPitch = dy * DRAG_SPEED;
    yaw += vYaw; pitch = clamp(pitch + vPitch, -MAX_PITCH, MAX_PITCH);
  }, { passive: true });
  const endDrag = () => { dragging = false; world.classList.remove('is-dragging'); };
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);
  cards.forEach(c => {
    c.addEventListener('pointerenter', () => { if (!dragging) hovered = c; });
    c.addEventListener('pointerleave', () => { if (hovered === c) hovered = null; });
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(es => { active = es[0].isIntersecting; }, { rootMargin: '100px' }).observe(sec);
  }

  /* ---------- scroll-colour background layers ---------- */
  const bgWrap = document.createElement('div'); bgWrap.className = 'cg-bgs';
  const bgs = BG_IMAGES.map(n => { const d = document.createElement('div'); d.className = 'cg-bg cg-bg-' + n; bgWrap.append(d); return d; });
  stick.prepend(bgWrap);

  /* ---------- editorial layout ---------- */
  const pad2 = n => String(n).padStart(2, '0');
  const names = cards.map(c => c.querySelector('b').textContent);
  const status = cards.map(c => (c.dataset.status || '').toLowerCase());
  const dates = cards.map(c => c.dataset.date || '');
  const edFrame = document.createElement('div'); edFrame.className = 'cg-frame';
  const ed = document.createElement('div');    ed.className = 'cg-ed';
  ed.innerHTML =
    `<div class="cg-status" data-s=""></div>` +
    `<div class="cg-meta"><span>Selected credentials</span><b>${pad2(N)} entries</b></div>` +
    `<div class="cg-now"><span class="cg-now-d"></span><small>Now showing</small><strong class="cg-now-n">01</strong>` +
    `<span class="cg-now-t">${names[0]}</span><em>of ${pad2(N)}</em></div>` +
    `<ol class="cg-index">${names.map((n, i) => `<li data-s="${status[i]}"><i>${pad2(i + 1)}</i><span>${n}</span><u></u></li>`).join('')}</ol>`;
  stick.append(edFrame, ed);
  const nowN = ed.querySelector('.cg-now-n'), nowT = ed.querySelector('.cg-now-t');
  const nowD = ed.querySelector('.cg-now-d');
  const statusEl = ed.querySelector('.cg-status');
  const rows = [...ed.querySelectorAll('.cg-index li')];
  let cur = -1;
  const showCard = i => {
    if (i === cur) return;
    cur = i;
    nowN.textContent = pad2(i + 1); nowT.textContent = names[i];
    const st = status[i];
    nowD.textContent = dates[i] ? (st === 'ongoing' ? 'Started · ' : 'Acquired · ') + dates[i] : '';
    statusEl.dataset.s = st; statusEl.textContent = st === 'ongoing' ? 'Ongoing' : st === 'completed' ? 'Completed' : '';
    rows.forEach((r, k) => r.classList.toggle('on', k === i));
  };
  showCard(0);

  /* ---------- render loop ---------- */
  function frame() {
    requestAnimationFrame(frame);
    if (!active) return;

    sp += (progress() - sp) * 0.14;
    const close = seg(sp, CLOSE_AT);
    const split = seg(sp, SPLIT_AT) * (1 - close);
    const grow  = seg(sp, GROW_AT)  * (1 - close);
    const txt   = seg(sp, TEXT_AT)  * (1 - seg(sp, TEXT_OUT));
    const av    = clamp((grow - 0.9) / 0.1, 0, 1);
    
    tl.style.transform = `translate3d(${(-split * SPLIT_VW).toFixed(2)}vw,0,0)`;
    tr.style.transform = `translate3d(${(split * SPLIT_VW).toFixed(2)}vw,0,0)`;
    tl.style.opacity = tr.style.opacity = ((1 - split * 0.55) * (1 - av * TITLE_FADE)).toFixed(3);

    if (bgs.length > 1) {
      const pos = sp * (bgs.length - 1);
      bgs.forEach((el, i) => {
        el.style.opacity = i === 0 ? 1 : ease(clamp((pos - (i - 1) - BG_HOLD / 2) / (1 - BG_HOLD), 0, 1)).toFixed(3);
      });
    }

    if (!reduce) {
      stick.style.setProperty('--by', (BG_START + (BG_END - BG_START) * sp).toFixed(2) + '%');
      stick.style.setProperty('--ps', (1 + BG_ZOOM * 1.2 - BG_ZOOM * sp).toFixed(3));
    }

    copy.style.opacity = txt.toFixed(3);
    copy.style.transform = `translate(-50%,-50%) scale(${(0.96 + 0.04 * txt).toFixed(3)})`;
    hint.style.opacity = (1 - seg(sp, [0, 0.08])).toFixed(3);
    dragHint.style.opacity = (seg(sp, [0.40, 0.50]) * (1 - seg(sp, TEXT_OUT))).toFixed(3);
    world.classList.toggle('live', grow > 0.6);

    if (avatars) {
      avatars.style.opacity = av.toFixed(3);
      avatars.style.transform = `translateY(${((1 - av) * 14).toFixed(1)}px)`;
    }
    ed.style.opacity = av.toFixed(3);

    if (!dragging) {
      yaw += vYaw; pitch = clamp(pitch + vPitch, -MAX_PITCH, MAX_PITCH);
      vYaw *= FRICTION; vPitch *= FRICTION;
      if (!reduce && !hovered) yaw += AUTO_SPIN;
    }
    yaw += (sp - lastSp) * 5; lastSp = sp;

    const w = window.innerWidth, h = window.innerHeight;
    const small = w < 760;
    const R = (small ? Math.min(w * 0.36, h * 0.30) : Math.min(w * 0.27, h * 0.34)) * grow;

    ring.style.transform = `rotateX(${pitch}rad) rotateY(${yaw}rad)`;
    const cY = Math.cos(yaw), sY = Math.sin(yaw), cP = Math.cos(pitch), sP = Math.sin(pitch);

    let best = 0, bestDepth = -1;
    for (let i = 0; i < N; i++) {
      const p = pts[i], card = cards[i];
      card.style.transform = `rotateY(${p.lon}rad) rotateX(${p.lat}rad) translateZ(${R.toFixed(1)}px)`;
      const [dx, dy, dz] = p.dir;
      const z1 = -dx * sY + dz * cY;
      const z2 = dy * sP + z1 * cP;
      const depth = (z2 + 1) / 2;
      if (depth > bestDepth) { bestDepth = depth; best = i; }
      card.style.opacity = ((0.15 + depth * 0.85) * Math.min(1, grow * 1.4)).toFixed(3);
    }
    showCard(best);
  }
  requestAnimationFrame(frame);
})();
