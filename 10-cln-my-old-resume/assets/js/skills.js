/* Skills section – Franchise-style layout: hero, marquee, figures, pinned wipe, grouped rows.
   Add or remove a row in D and every count, the marquee, the wipe length and the groups follow. */
(() => {
  const sec = document.querySelector('.zg');
  if (!sec) return;

  // [name, category, description, image file, tags]
  const D = [
    ['Laravel', 'Backend', 'Clean, scalable PHP web apps with routing, authentication, database models and Blade views.', 'laravel', ['Routing', 'Auth', 'Eloquent']],
    ['PHP', 'Backend', 'Server-side logic, APIs and form handling written in modern, readable PHP.', 'php', ['APIs', 'Forms', 'Sessions']],
    ['Livewire', 'Backend', 'Reactive interfaces without leaving PHP: live forms, tables and search with little JavaScript.', 'livewire', ['Live forms', 'Tables', 'Search']],
    ['HTML', 'Frontend', 'Semantic, accessible markup that forms the solid base of every page.', 'html', ['Semantic', 'Accessible', 'SEO']],
    ['CSS', 'Frontend', 'Responsive layouts, animations and polished styling that match your brand.', 'css', ['Responsive', 'Animation', 'Branding']],
    ['JavaScript', 'Frontend', 'Interactive behavior: sliders, filters, dashboards and smooth scroll effects.', 'js', ['Sliders', 'Filters', 'Dashboards']],
    ['SQL', 'Data', 'Database design, queries and reports that keep your data organized and fast.', 'sql', ['Schemas', 'Queries', 'Reports']],
    ['Figma', 'Design', 'UI mockups and clickable prototypes designed before a single line of code.', 'figma', ['Mockups', 'Prototypes', 'UI kits']],
    ['Excel', 'Office', 'Spreadsheets, formulas, pivot tables and dashboards that make data useful.', 'excel', ['Formulas', 'Pivots', 'Dashboards']],
    ['PowerPoint', 'Office', 'Clear, good-looking slide decks for pitches and reports.', 'ppt', ['Pitch decks', 'Reports', 'Templates']],
    ['Word', 'Office', 'Well-formatted documents, templates and reports ready to share.', 'word', ['Documents', 'Templates', 'Reports']],
    ['VBA', 'Automation', 'Macros that automate repetitive Excel and Office tasks.', 'vba', ['Macros', 'Excel', 'Office']],
    ['GitHub', 'Workflow', 'Code hosting, collaboration and project tracking in one place.', 'github', ['Hosting', 'Reviews', 'Projects']],
    ['Git', 'Workflow', 'Version control so every change is tracked and easy to roll back.', 'git', ['Branches', 'History', 'Rollback']],
    ['Canva', 'Design', 'Quick social posts, banners and branded graphics.', 'canva', ['Social', 'Banners', 'Branding']],
    ['Inkscape', 'Design', 'Vector logos, icons and illustrations that scale to any size.', 'inkscape', ['Logos', 'Icons', 'Vectors']],
    ['WordPress', 'CMS', 'Custom themes, plugins and easy-to-manage websites you can update yourself.', 'wordpress', ['Themes', 'Plugins', 'Editing']],
    ['Node.js', 'Backend', 'Fast JavaScript back ends: REST APIs, real-time features and server tools.', 'nodejs', ['REST', 'Real-time', 'Tooling']],
    ['Elementor', 'CMS', 'Drag-and-drop WordPress pages, built quickly and styled pixel-perfect.', 'elementor', ['Drag & drop', 'Landing pages', 'Pixel-perfect']],
    ['PostgreSQL', 'Data', 'Reliable, powerful relational databases for structured data, complex queries and growing apps.', 'postgres', ['Relational', 'Queries', 'Scaling']],
    ['Kali Linux', 'Security', 'Security testing and penetration-testing toolkit for finding and fixing weak spots in systems and web apps.', 'kali', ['Pen testing', 'Audits', 'Hardening']],
    ['Antigravity', 'AI', 'Agent-powered coding workspace that plans, writes and tests code alongside me, so builds and fixes ship faster.', 'antigravity', ['Agents', 'Coding', 'Automation']],
    ['Cisco Packet Tracer', 'Networking', 'Network simulation for designing, configuring and troubleshooting routers, switches and LANs before touching real hardware.', 'packettracer', ['Routing', 'Switching', 'Simulation']],
    ['Claude', 'AI', 'AI assistant for writing and reviewing code, planning features, debugging and drafting clear documentation.', 'claude', ['Code review', 'Debugging', 'Docs']],
    ['ChatGPT', 'AI', 'AI chat assistant for brainstorming, quick code help, explaining concepts and drafting content.', 'chatgpt', ['Brainstorming', 'Code help', 'Drafting']],
    ['Gemini', 'AI', 'Google AI assistant for research, summarizing, code suggestions and working through ideas.', 'gemini', ['Research', 'Summaries', 'Code']],
    ['Replit', 'Workflow', 'Browser-based coding environment for building, running and sharing projects quickly, with no setup.', 'replit', ['Online IDE', 'Prototyping', 'Hosting']],
    ['n8n', 'Automation', 'Workflow automation that connects apps, APIs and databases so repetitive tasks run on their own.', 'n8n', ['Workflows', 'Webhooks', 'Integrations']],
    ['Virtual Machines', 'Networking', 'Isolated virtual machines for installing operating systems, testing software and practicing network and security setups safely.', 'vm', ['Isolation', 'Snapshots', 'Testing']],
    ['AWS', 'Cloud', 'Cloud hosting and services for deploying apps, storing files and running databases that scale with demand.', 'aws', ['Hosting', 'Storage', 'Deployment']],
    ['Vercel', 'Cloud', 'Fast, simple hosting that deploys sites straight from a Git repository, with previews and custom domains.', 'vercel', ['Deploys', 'Previews', 'Domains']],
    ['Hostinger', 'Cloud', 'Web hosting and domains for launching and managing websites, including WordPress and PHP projects.', 'hostinger', ['Hosting', 'Domains', 'WordPress']],
    ['Tailwind CSS', 'Frontend', 'Utility-first styling for building responsive, consistent interfaces quickly without leaving the markup.', 'tailwind', ['Utilities', 'Responsive', 'Components']]
  ];

  const N = D.length;
  const SECS_PER_SKILL = 60;                         // vh of scroll for each skill in the wipe
  const src = f => `assets/images/skill/${f}.png`;
  const p2 = n => String(n).padStart(2, '0');
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const cats = [...new Set(D.map(d => d[1]))];
  const byCount = [...cats].sort((x, y) => D.filter(d => d[1] === y).length - D.filter(d => d[1] === x).length || cats.indexOf(x) - cats.indexOf(y));
  const inCat = c => D.filter(d => d[1] === c);
  const names = c => inCat(c).map(d => d[0]).join(', ');
  const img = (f, alt, cls = '') => `<img class="${cls}" src="${src(f)}" alt="${esc(alt)}" loading="lazy">`;

  /* ---------- markup ---------- */
  const wipeL = D.map((d, i) => `<div class="zk-fp zk-im"><div class="zk-img">${img(d[3], d[0], 'zk-main')}</div></div>`).join('');
  const wipeR = D.map((d, i) => `<div class="zk-fp zk-tx ${i % 2 ? 'dk' : 'lt'}">
      <div class="zk-cnt zk-m"><b>${p2(i + 1)}</b>/${p2(N)}</div>
      <h2>${esc(d[0])}</h2>
      <p class="zk-sub">${esc(d[2])}</p>
      <dl><div><dt>Category</dt><dd>${esc(d[1])}</dd></div><div><dt>Covers</dt><dd>${d[4].map(esc).join(', ')}</dd></div></dl>
    </div>`).join('');

  const marq = [0, 1].map(() => D.map(d => `<span>${esc(d[0])}</span><span>✱</span>`).join('')).join('');

  const rows = cats.map((c, i) => `<div class="zk-row" data-r>
      <span class="zk-m">${p2(i + 1)}</span>
      <div><h3>${esc(c)}</h3><p>${esc(names(c))}</p></div>
      <div class="zk-logos">${inCat(c).map(d => `<span class="zk-logo" title="${esc(d[0])}">${img(d[3], d[0])}</span>`).join('')}</div>
    </div>`).join('');

  sec.innerHTML = `
  <div class="zk-hero">
    <div class="zk-hl" data-r>
      <h2>Technical skills</h2>
      <p>The languages, frameworks and tools I use to plan, build and ship web projects.</p>
      <a class="zk-cta" href="#zk-wipe" data-jump>See every skill</a>
    </div>
    <div class="zk-hr" data-r style="--d:.2s">
      <div class="zk-stat"><b>${N}</b><p>Tools and technologies</p></div>
      <div class="zk-stat"><b>${cats.length}</b><p>Categories, from back end to design</p></div>
    </div>
    <div class="zk-3d" aria-hidden="true"></div>
    <div class="zk-giant" id="zk-giant" aria-hidden="true"></div>
  </div>
  <div class="zk-marq" aria-hidden="true"><div>${marq}</div></div>

  <div class="zk-figs">
    <h2 data-r>Where the toolbox leans</h2>
    <div class="zk-bar" id="zk-bar">${byCount.map(c => `<div class="zk-grp" data-c="${esc(c)}" style="flex:${inCat(c).length}">${inCat(c).map(d => `<i class="zk-cell" title="${esc(d[0])}"></i>`).join('')}</div>`).join('')}</div>
    <div class="zk-key">${byCount.map(c => `<button type="button" class="zk-k" data-c="${esc(c)}">${esc(c)}<b>${inCat(c).length}</b></button>`).join('')}</div>
    <p class="zk-read" id="zk-read" aria-live="polite">Each bar is one tool. Hover or tap a category to see what is in it.</p>
  </div>

  <div class="zk-wipe" id="zk-wipe">
    <div class="zk-pin">
      <div class="zk-fc zk-fl">${wipeL}</div>
      <div class="zk-fc zk-fr">${wipeR}</div>
      <div class="zk-prog"></div>
    </div>
  </div>

  <div class="zk-set">
    <h2 data-r>The stack, by category</h2>
    <p class="zk-lead" data-r>Every tool above, grouped by what it is used for.</p>
    ${rows}
  </div>`;

  /* ---------- helpers ---------- */
  const $ = s => sec.querySelector(s);
  const clamp = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // missing image: pinned images get a name placeholder, small logos just disappear
  sec.querySelectorAll('img').forEach(im => im.addEventListener('error', () => {
    if (im.classList.contains('zk-main')) {
      const ph = document.createElement('div');
      ph.className = 'zk-ph';
      ph.textContent = im.alt;
      im.replaceWith(ph);
    } else im.remove();
  }));

  /* category bar: highlight a category and list its tools */
  const bar = $('#zk-bar'), read = $('#zk-read'), idle = read.textContent;
  const pick = c => {
    bar.querySelectorAll('.zk-grp').forEach(g => g.classList.toggle('on', g.dataset.c === c));
    sec.querySelectorAll('.zk-k').forEach(k => k.classList.toggle('on', k.dataset.c === c));
    if (c) { bar.dataset.on = ''; read.textContent = `${c}: ${names(c)}`; }
    else { delete bar.dataset.on; read.textContent = idle; }
  };
  sec.querySelectorAll('.zk-k').forEach(k => {
    k.addEventListener('mouseenter', () => pick(k.dataset.c));
    k.addEventListener('focus', () => pick(k.dataset.c));
    k.addEventListener('mouseleave', () => pick(null));
    k.addEventListener('blur', () => pick(null));
    k.addEventListener('click', () => pick(k.classList.contains('on') && !matchMedia('(hover:hover)').matches ? null : k.dataset.c));
  });
  bar.querySelectorAll('.zk-grp').forEach(g => {
    g.addEventListener('mouseenter', () => pick(g.dataset.c));
    g.addEventListener('mouseleave', () => pick(null));
  });

  /* giant title, letter by letter */
  const giant = $('#zk-giant');
  [...'Skills'].forEach((c, i) => {
    const s = document.createElement('span');
    s.textContent = c;
    s.style.setProperty('--i', i);
    giant.appendChild(s);
  });
  giant.insertAdjacentHTML('beforeend', '<i class="zk-dot"></i>');

  /* reveal on scroll */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .15 });
  sec.querySelectorAll('[data-r]').forEach(el => io.observe(el));
  io.observe(giant);

  /* smooth jump to the pinned section */
  sec.querySelectorAll('[data-jump]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    $(a.getAttribute('href')).scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }));

  /* ---------- pinned wipe ---------- */
  const wipe = $('.zk-wipe'), pin = $('.zk-pin'), prog = $('.zk-prog');
  wipe.style.height = `calc(100vh + ${(N - 1) * SECS_PER_SKILL}vh)`;
  wipe.style.height = `calc(100svh + ${(N - 1) * SECS_PER_SKILL}vh)`;   // ignored where svh is unsupported
  const L = [...sec.querySelectorAll('.zk-fl .zk-fp')];
  const R = [...sec.querySelectorAll('.zk-fr .zk-fp')];

  const range = () => wipe.offsetHeight - pin.offsetHeight;
  const tgt = () => clamp(-wipe.getBoundingClientRect().top / range()) * (N - 1);

  let pos = 0, running = false, snap;
  function render() {
    const base = Math.min(N - 1, Math.floor(pos)), f = pos - base;
    prog.style.width = (pos / (N - 1)) * 100 + '%';
    [L, R].forEach(arr => {
      arr.forEach(el => { el.style.visibility = 'hidden'; el.style.clipPath = 'none'; el.style.zIndex = 0; el.classList.remove('act'); });
      arr[base].style.visibility = 'visible'; arr[base].style.zIndex = 1; arr[base].classList.add('act');
      if (f > .0005 && base + 1 < N) {
        const b = arr[base + 1];
        b.style.visibility = 'visible'; b.style.zIndex = 2;
        b.style.clipPath = `inset(${((1 - f) * 100).toFixed(3)}% 0 0 0)`;
        if (f > .5) b.classList.add('act');
      }
    });
  }
  function tick() {
    const t = tgt(), d = t - pos;
    if (reduce || Math.abs(d) < .0008) { pos = t; running = false; render(); return; }
    pos += d * .12; render();
    requestAnimationFrame(tick);
  }
  function kick() { if (!running) { running = true; requestAnimationFrame(tick); } }

  addEventListener('scroll', () => {
    kick();
    if (reduce) return;
    clearTimeout(snap);                                           // settle on the nearest skill
    snap = setTimeout(() => {
      const r = wipe.getBoundingClientRect(), max = range();
      if (r.top > 0 || -r.top > max) return;
      const y = scrollY + r.top + (Math.round(tgt()) / (N - 1)) * max;
      if (Math.abs(y - scrollY) > 2) scrollTo({ top: y, behavior: 'smooth' });
    }, 180);
  }, { passive: true });
  addEventListener('resize', () => { kick(); render(); });
  render(); kick();

  /* ---------- 3D object in the hero (your local coffee.glb first, built-in cup only as fallback) ---------- */
  const host = $('.zk-3d'), hero = $('.zk-hero');
  const MODEL_URL = 'assets/3d/coffee.glb'; // <- change to your .glb file name
  const loadScript = src => new Promise((ok, no) => { const t = document.createElement('script'); t.src = src; t.onload = ok; t.onerror = no; document.head.appendChild(t); });
  const loadLib = (local, cdn) => loadScript(local).catch(() => loadScript(cdn));   // your local copy first, CDN only as backup
  const loadThree = () => window.THREE ? Promise.resolve() : loadLib('assets/js/vendor/three.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
  loadThree().then(() => {
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); } catch (e) { return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(35, 1, .1, 50);
    cam.position.z = 7;
    scene.add(new THREE.AmbientLight(0xffffff, .6));
    const key = new THREE.DirectionalLight(0xffffff, 1.1); key.position.set(3, 4, 5); scene.add(key);
    const rim = new THREE.PointLight(0xe8541a, 2.2, 30); rim.position.set(-4, 1, -2); scene.add(rim);

    // swap this group for your own model later (see GLTFLoader) – everything else stays the same
    const obj = new THREE.Group();
    const steam = [];
    obj.position.y = -.05;
    scene.add(obj);

    // fallback cup – built only if coffee.glb fails to load
    function buildCup() {
      const dark = new THREE.MeshStandardMaterial({ color: 0x1b1b1b, metalness: .7, roughness: .28, side: THREE.DoubleSide });
      const wmat = () => new THREE.MeshBasicMaterial({ color: 0xe8541a, wireframe: true, transparent: true, opacity: .35 });
      const part = (geo, mat) => {
        const m = new THREE.Mesh(geo, mat); obj.add(m);
        const w = new THREE.Mesh(geo, wmat()); w.scale.setScalar(1.015); obj.add(w);
        return [m, w];
      };
      const V = (x, y) => new THREE.Vector2(x, y);
      part(new THREE.LatheGeometry([V(0, -.8), V(.55, -.8), V(.75, -.65), V(1, -.1), V(1.12, .7), V(1.04, .72), V(.94, .6), V(.6, -.55), V(0, -.62)], 48), dark);
      part(new THREE.LatheGeometry([V(0, -.95), V(.9, -.95), V(1.7, -.82), V(1.8, -.78), V(1.74, -.76), V(.9, -.88), V(0, -.88)], 64), dark);
      part(new THREE.TorusGeometry(.42, .1, 14, 36, Math.PI * 1.25), dark).forEach(m => { m.position.set(1.0, 0, 0); m.rotation.z = -Math.PI * .62; });
      const coffee = new THREE.Mesh(new THREE.CircleGeometry(1.0, 48), new THREE.MeshStandardMaterial({ color: 0x3a1a08, roughness: .15, metalness: .2, emissive: 0x1a0800 }));
      coffee.rotation.x = -Math.PI / 2; coffee.position.y = .6; obj.add(coffee);
      for (let i = 0; i < 9; i++) {
        const p = new THREE.Mesh(new THREE.SphereGeometry(.16, 12, 12), new THREE.MeshBasicMaterial({ color: 0xe8541a, transparent: true, opacity: 0, depthWrite: false }));
        p.userData = { o: i / 9, a: i * 2.4 };
        steam.push(p); obj.add(p);
      }
    }

    // load your own assets/3d/coffee.glb first
    loadLib('assets/js/vendor/GLTFLoader.js', 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js').then(() => {
      new THREE.GLTFLoader().load(MODEL_URL, gltf => {
        const m = gltf.scene;
        const box = new THREE.Box3().setFromObject(m);
        const sz = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
        m.position.sub(c);
        const wrap = new THREE.Group(); wrap.add(m);
        wrap.scale.setScalar(3 / Math.max(sz.x, sz.y, sz.z));
        obj.add(wrap);
        if (reduce) frame(0);
      }, undefined, err => { console.warn('coffee.glb not loaded (use Live Server) – showing fallback cup', err); buildCup(); if (reduce) frame(0); });
    }).catch(() => buildCup());

    function size() {
      const w = host.clientWidth, h = host.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      cam.aspect = w / h; cam.updateProjectionMatrix();
      if (reduce) frame(0);
    }
    new ResizeObserver(size).observe(host);

    let vis = true, raf = 0, mx = 0, my = 0, sx = 0, sy = 0;
    addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });
    function frame(t) {
      raf = 0;
      if (!vis && !reduce) return;
      sx += (mx - sx) * .06; sy += (my - sy) * .06;
      obj.rotation.x = .35 + sy * .6 + (reduce ? 0 : scrollY * .0008);
      obj.rotation.y = (reduce ? .6 : t * .0003 + scrollY * .002) + sx * .9;
      obj.position.y = -.05 + (reduce ? 0 : Math.sin(t / 900) * .08);
      steam.forEach(p => {
        const k = reduce ? p.userData.o : ((t / 4000 + p.userData.o) % 1);
        p.position.set(Math.sin(k * 6 + p.userData.a) * .25, .7 + k * 1.6, Math.cos(k * 5 + p.userData.a) * .25);
        p.scale.setScalar(.6 + k * 1.6);
        p.material.opacity = Math.sin(k * Math.PI) * .22;
      });
      renderer.render(scene, cam);
      if (!reduce) raf = requestAnimationFrame(frame);
    }
    const go = () => { if (!raf) raf = requestAnimationFrame(frame); };
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis) go(); }).observe(hero);
    size(); go();
  }).catch(() => {});
})();
