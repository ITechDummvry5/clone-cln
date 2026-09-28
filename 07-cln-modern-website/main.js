/* ==========================================================================
   TOPRIUM Veo - Interactive Engine & Experience Controller
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  // ---------------------------------------------------------
  // 1. STATE & CORE CONFIGURATION
  // ---------------------------------------------------------
  const CONFIG = {
    frameCount: 96,
    framePath: (index) => `/Frames/frame_${String(index).padStart(3, '0')}.webp`,
    lerpFactor: 0.08, // Buttery cinematic inertia
    particleCount: 45,
    maxTilt: 6 // Degrees for card hover tilt
  };

  const STATE = {
    images: [],
    loadedCount: 0,
    targetScrollProgress: 0,
    currentScrollProgress: 0,
    activeSectionIndex: 0,
    currentSectionIndex: 0,
    isScrollLocked: false,
    audioInitialized: false,
    audioPlaying: false,
    hoveredCardIndex: -1,
    cardTilt: {}, // Track relative card tilt { x, y }
    cardParallaxY: {} // Track vertical scroll offset
  };

  // DOM Cache
  const preloader = document.getElementById('preloader');
  const loaderBar = document.getElementById('loader-bar');
  const loaderPercentage = document.getElementById('loader-percentage');
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d');
  const heroVideoContainer = document.getElementById('hero-video-container');
  const heroVideo = document.getElementById('hero-video');
  const scrollHint = document.getElementById('scroll-hint');
  const sideNav = document.getElementById('side-nav');
  const navLinks = document.querySelectorAll('.side-nav a');
  const sections = document.querySelectorAll('.narrative-section');
  const cards = document.querySelectorAll('.content-card, .hero-title-container');
  const cursorGlow = document.getElementById('cursor-glow');
  const hudProgressCircle = document.getElementById('hud-progress-circle');
  const gaugePercent = document.getElementById('gauge-percent');
  const hudBigHeading = document.querySelector('.hud-big-heading');
  const brandLogo = document.getElementById('brand-logo');

  // ---------------------------------------------------------
  // 2. FRAME SEQUENCE PRELOADER
  // ---------------------------------------------------------
  async function preloadFrames() {
    const loadPromises = [];

    for (let i = 1; i <= CONFIG.frameCount; i++) {
      const imgPath = CONFIG.framePath(i);
      const img = new Image();
      
      const promise = new Promise((resolve, reject) => {
        img.onload = () => {
          STATE.loadedCount++;
          const pct = Math.floor((STATE.loadedCount / CONFIG.frameCount) * 100);
          
          // Smooth UI progress update
          loaderBar.style.width = `${pct}%`;
          loaderPercentage.textContent = pct;
          
          resolve(img);
        };
        img.onerror = () => {
          console.error(`Failed to load frame: ${imgPath}`);
          // Resolve anyway to prevent blocking the loader in case of a single corrupted frame
          resolve(null);
        };
      });
      
      img.src = imgPath;
      STATE.images.push(img);
      loadPromises.push(promise);
    }

    try {
      await Promise.all(loadPromises);
      revealExperience();
    } catch (err) {
      console.error('Error preloading frames:', err);
      revealExperience(); // Fail-safe reveal
    }
  }

  function revealExperience() {
    // Small delay to ensure transitions look elegant
    setTimeout(() => {
      preloader.classList.add('fade-out');
      document.body.classList.remove('loading-active');
      canvas.style.opacity = 0; // Starts hidden, fades in on scroll

      // Trigger initial resize & drawing
      resizeCanvas();
      
      // Warm up canvas drawing with first frame
      if (STATE.images[0]) {
        drawFrame(STATE.images[0]);
      }
      
      // Start main animation loop
      requestAnimationFrame(animationLoop);
    }, 800);
  }

  // ---------------------------------------------------------
  // 3. CINEMATIC SCROLL ENGINE (LERP)
  // ---------------------------------------------------------
  function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    STATE.targetScrollProgress = maxScroll > 0 ? scrollTop / maxScroll : 0;
  }

  // Cover-style aspect ratio canvas scaling
  function drawImageProp(ctx, img, x, y, w, h, offsetX = 0.5, offsetY = 0.5) {
    const iw = img.width;
    const ih = img.height;
    const r = Math.min(w / iw, h / ih);
    let nw = iw * r;
    let nh = ih * r;
    let cx, cy, cw, ch, ar = 1;

    // Decide which side needs scaling to fit layout
    if (nw < w) ar = w / nw;
    if (Math.abs(nh - h) < 0.001) ar = h / nh;
    
    const newIw = iw * ar;
    const newIh = ih * ar;

    cx = (iw - newIw) * offsetX;
    cy = (ih - newIh) * offsetY;

    if (cx < 0) cx = 0;
    if (cy < 0) cy = 0;

    ctx.drawImage(img, cx, cy, Math.min(iw, newIw), Math.min(ih, newIh), x, y, w, h);
  }

  function drawFrame(image) {
    if (!image) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawImageProp(ctx, image, 0, 0, canvas.width, canvas.height);
  }

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.scale(dpr, dpr);
    
    // Re-draw current frame after resize
    const currentFrame = STATE.images[Math.min(
      CONFIG.frameCount - 1,
      Math.floor(STATE.currentScrollProgress * CONFIG.frameCount)
    )];
    if (currentFrame) {
      drawFrame(currentFrame);
    }
  }

  // Debounced Resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeCanvas, 150);
  }, { passive: true });

  // Main Render Loop
  function animationLoop() {
    // Lerp-based smooth progress interpolation
    const diff = STATE.targetScrollProgress - STATE.currentScrollProgress;
    STATE.currentScrollProgress += diff * CONFIG.lerpFactor;

    // Clamp value very close to target to avoid infinite small updates
    if (Math.abs(diff) < 0.0001) {
      STATE.currentScrollProgress = STATE.targetScrollProgress;
    }

    // Determine current image frame based on interpolated scroll progress
    const rawFrame = Math.floor(STATE.currentScrollProgress * CONFIG.frameCount);
    const frameIndex = Math.max(0, Math.min(CONFIG.frameCount - 1, rawFrame));
    const imageToDraw = STATE.images[frameIndex];

    if (imageToDraw) {
      drawFrame(imageToDraw);
    }

    // --- Cinematic Opacity Interpolation ---
    // Slide 1 (Overview) has the high-res hero video looping in the background.
    // As we scroll down, the video fades out and the Canvas fades in.
    let videoOpacity = 0.45;
    let canvasOpacity = 0;

    // Fades between Section 1 and Section 2 (Scroll progress 0% to 15%)
    if (STATE.currentScrollProgress < 0.15) {
      const t = STATE.currentScrollProgress / 0.15;
      videoOpacity = 0.45 * (1 - t);
      canvasOpacity = t;
    } else if (STATE.currentScrollProgress > 0.85) {
      // Fades out Canvas near the bottom (Section 6 CTA) for an atmospheric exit
      const t = (STATE.currentScrollProgress - 0.85) / 0.15;
      canvasOpacity = 1 - t;
    } else {
      videoOpacity = 0;
      canvasOpacity = 1;
    }

    heroVideoContainer.style.opacity = videoOpacity;
    canvas.style.opacity = canvasOpacity;

    // Hide scroll hint indicator after minor scroll
    if (STATE.currentScrollProgress > 0.05) {
      scrollHint.classList.add('hidden');
    } else {
      scrollHint.classList.remove('hidden');
    }

    // Hide top-right brand logo after scrolling past intro slide
    if (brandLogo) {
      if (STATE.currentScrollProgress > 0.05) {
        brandLogo.classList.add('hidden-on-scroll');
      } else {
        brandLogo.classList.remove('hidden-on-scroll');
      }
    }

    // Update the center-left HUD progress ring gauge dynamically
    if (hudProgressCircle && gaugePercent) {
      const offset = 301.59 - (STATE.currentScrollProgress * 301.59);
      hudProgressCircle.style.strokeDashoffset = offset;
      gaugePercent.textContent = Math.round(STATE.currentScrollProgress * 100);
    }

    // --- Scroll-Driven Card Parallax Motion ---
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const currentScrollY = STATE.currentScrollProgress * maxScroll;

    sections.forEach((section, index) => {
      const card = cards[index];
      if (!card) return;

      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const rangeStart = sectionTop - window.innerHeight;
      const rangeEnd = sectionTop + sectionHeight;

      let factor = (currentScrollY - rangeStart) / (rangeEnd - rangeStart);
      factor = Math.max(0, Math.min(1, factor));

      // Calculate translation (parallax Y drift)
      // We drift the cards vertically by 140px over their viewport lifespan
      const translateY = (0.5 - factor) * 140;
      STATE.cardParallaxY[index] = translateY;

      // Calculate scale (subtle 0.95 to 1.0 curve)
      const distFromCenter = Math.abs(factor - 0.5);
      const scale = Math.max(0.96, 1.0 - (distFromCenter * 0.08));

      // Check if mouse hover/tilt is active
      const tilt = STATE.cardTilt[index] || { x: 0, y: 0 };
      const isHovered = STATE.hoveredCardIndex === index;

      if (isHovered) {
        // Combined hover tilt and scroll parallax
        card.style.transform = `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.02) translate3d(0, ${translateY}px, 10px)`;
      } else {
        // Pure scroll-linked translation & scale
        card.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale})`;
      }
    });

    // Modulate audio synthesizer frequency based on scroll movements
    modulateSynthFrequency(STATE.currentScrollProgress);

    requestAnimationFrame(animationLoop);
  }

  // Passive Scroll Listener
  window.addEventListener('scroll', updateScrollProgress, { passive: true });

  // ---------------------------------------------------------
  // 4. VIEWPORT FOCUS DETECTION SYSTEM
  // ---------------------------------------------------------
  const HUD_TITLES = [
    "BEAST<br>AI POWER<br>KEYBOARD",
    "EXPLODED<br>ACOUSTIC<br>LAYERS",
    "PRECISION<br>LINEAR<br>SWITCHES",
    "RESONANT<br>LEAF-SPRING<br>CAVITY",
    "GRADIENT<br>DOUBLE-SHOT<br>KEYCAPS",
    "TAILOR<br>YOUR CUSTOM<br>KEYBOARD"
  ];

  function updateHudTitle(index) {
    if (!hudBigHeading) return;
    const newTitleText = HUD_TITLES[index] || HUD_TITLES[0];
    if (hudBigHeading.innerHTML === newTitleText) return;
    
    // Add class to trigger fade-out & slide-down
    hudBigHeading.classList.add('text-changing');
    
    // Wait for fade-out to complete before changing text and fading back in
    setTimeout(() => {
      hudBigHeading.innerHTML = newTitleText;
      hudBigHeading.classList.remove('text-changing');
    }, 350);
  }

  function checkViewportFocus() {
    if (window.innerWidth > 900) {
      // Desktop: Driven directly by our section snapping logic
      sections.forEach((section, index) => {
        const card = cards[index];
        const navLink = navLinks[index];
        if (index === STATE.currentSectionIndex) {
          card.classList.add('active');
          if (navLink) navLink.classList.add('active');
        } else {
          card.classList.remove('active');
          if (navLink) navLink.classList.remove('active');
        }
      });
      STATE.activeSectionIndex = STATE.currentSectionIndex;
    } else {
      // Mobile/Tablet: Driven by scroll proximity
      const viewportHeight = window.innerHeight;
      const middleStart = viewportHeight * 0.275;
      const middleEnd = viewportHeight * 0.725;
      let currentActive = 0;

      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const isFocused = center >= middleStart && center <= middleEnd;
        const card = cards[index];
        const navLink = navLinks[index];

        if (isFocused) {
          currentActive = index;
          card.classList.add('active');
          if (navLink) navLink.classList.add('active');
        } else {
          card.classList.remove('active');
          if (navLink) navLink.classList.remove('active');
        }
      });

      const activeCards = document.querySelectorAll('.content-card.active');
      if (activeCards.length === 0) {
        let closestIndex = 0;
        let minDistance = Infinity;
        sections.forEach((section, index) => {
          const rect = section.getBoundingClientRect();
          const center = rect.top + rect.height / 2;
          const dist = Math.abs(center - (viewportHeight / 2));
          if (dist < minDistance) {
            minDistance = dist;
            closestIndex = index;
          }
        });
        cards[closestIndex].classList.add('active');
        if (navLinks[closestIndex]) navLinks[closestIndex].classList.add('active');
        currentActive = closestIndex;
      }

      STATE.activeSectionIndex = currentActive;
      STATE.currentSectionIndex = currentActive;
    }

    // Dynamic floating title switch
    updateHudTitle(STATE.currentSectionIndex);
  }

  window.addEventListener('scroll', checkViewportFocus, { passive: true });

  // Magnetic Snap-Scrolling Engine (Desktop Only)
  function scrollToSection(index) {
    if (index < 0 || index >= sections.length) return;
    STATE.isScrollLocked = true;
    
    const targetSection = sections[index];
    const targetScrollTop = targetSection.offsetTop;
    const startScrollTop = window.scrollY;
    const distance = targetScrollTop - startScrollTop;
    
    // Duration is adjusted dynamically based on distance for a responsive feel
    const duration = Math.min(Math.max(Math.abs(distance) * 0.5, 600), 1000); 
    let startTime = null;

    function smoothScrollStep(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Cubic ease-out deceleration
      const ease = 1 - Math.pow(1 - progress, 3);
      
      window.scrollTo(0, startScrollTop + distance * ease);
      
      if (progress < 1) {
        requestAnimationFrame(smoothScrollStep);
      } else {
        // Cooldown prevents fast mouse flicks from registering as multiple slide skips
        setTimeout(() => {
          STATE.isScrollLocked = false;
        }, 150); 
      }
    }
    
    // Instantly highlight target card/nav dot
    checkViewportFocus();
    
    requestAnimationFrame(smoothScrollStep);
  }

  function handleWheelScroll(e) {
    if (window.innerWidth <= 900) return; // Fallback on tablet/mobile
    
    e.preventDefault();
    if (STATE.isScrollLocked) return;
    
    const delta = e.deltaY;
    if (Math.abs(delta) < 20) return; // Sensitivity threshold to ignore micro-scroll noise
    
    if (delta > 0) {
      if (STATE.currentSectionIndex < sections.length - 1) {
        STATE.currentSectionIndex++;
        scrollToSection(STATE.currentSectionIndex);
      }
    } else {
      if (STATE.currentSectionIndex > 0) {
        STATE.currentSectionIndex--;
        scrollToSection(STATE.currentSectionIndex);
      }
    }
  }

  window.addEventListener('wheel', handleWheelScroll, { passive: false });

  // Smooth Scroll on Dot Click
  navLinks.forEach((link, idx) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      STATE.currentSectionIndex = idx;
      scrollToSection(idx);
    });
  });

  // ---------------------------------------------------------
  // 5. IMMERSIVE WEB AUDIO SYNTHESIZER
  // ---------------------------------------------------------
  let audioCtx, padOsc, subOsc, filterNode, lfoNode, mainGain;

  function initAudio() {
    if (STATE.audioInitialized) return;

    try {
      // Create Audio Context
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();

      // Create Master Volume Control
      mainGain = audioCtx.createGain();
      mainGain.gain.setValueAtTime(0, audioCtx.currentTime); // Start fully muted for fade-in
      mainGain.connect(audioCtx.destination);

      // 1. Warm Triangle Pad Oscillator (Mid-range)
      padOsc = audioCtx.createOscillator();
      padOsc.type = 'triangle';
      padOsc.frequency.setValueAtTime(110, audioCtx.currentTime); // A2 Note (110 Hz)
      
      // 2. Rich Sine Sub Oscillator (Deep bass drone)
      subOsc = audioCtx.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(55, audioCtx.currentTime); // A1 Note (55 Hz, one octave below)

      // 3. Resonant Lowpass Filter
      filterNode = audioCtx.createBiquadFilter();
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(250, audioCtx.currentTime); // Dark, atmospheric cutoff
      filterNode.Q.setValueAtTime(4, audioCtx.currentTime); // Soft resonance

      // 4. Low Frequency LFO to gently swirl/modulate filter cutoff
      lfoNode = audioCtx.createOscillator();
      lfoNode.type = 'sine';
      lfoNode.frequency.setValueAtTime(0.08, audioCtx.currentTime); // Modulate extremely slowly (every 12.5s)
      
      const lfoGain = audioCtx.createGain();
      lfoGain.gain.setValueAtTime(70, audioCtx.currentTime); // Modulate within 70Hz amplitude

      // Connect LFO to filter frequency
      lfoNode.connect(lfoGain);
      lfoGain.connect(filterNode.frequency);

      // Connect Oscillators to Filter
      const padGain = audioCtx.createGain();
      padGain.gain.setValueAtTime(0.65, audioCtx.currentTime);
      padOsc.connect(padGain);
      padGain.connect(filterNode);

      const subGain = audioCtx.createGain();
      subGain.gain.setValueAtTime(0.35, audioCtx.currentTime);
      subOsc.connect(subGain);
      subGain.connect(filterNode);

      // Connect Filter to Master output
      filterNode.connect(mainGain);

      // Start Synthesizers
      padOsc.start();
      subOsc.start();
      lfoNode.start();

      STATE.audioInitialized = true;
      console.log('Procedural audio engine initialized.');
    } catch (e) {
      console.error('Web Audio API not supported or failed to initialize:', e);
    }
  }

  function toggleAudio() {
    if (!STATE.audioInitialized) {
      initAudio();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const audioToggle = document.getElementById('audio-toggle');

    if (!STATE.audioPlaying) {
      // Fade In soundscape
      mainGain.gain.cancelScheduledValues(audioCtx.currentTime);
      mainGain.gain.setValueAtTime(mainGain.gain.value, audioCtx.currentTime);
      mainGain.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 2.0); // Caps volume at a safe low level (0.08)
      
      audioToggle.classList.add('playing');
      STATE.audioPlaying = true;
    } else {
      // Fade Out soundscape
      mainGain.gain.cancelScheduledValues(audioCtx.currentTime);
      mainGain.gain.setValueAtTime(mainGain.gain.value, audioCtx.currentTime);
      mainGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.0);
      
      audioToggle.classList.remove('playing');
      STATE.audioPlaying = false;
    }
  }

  function modulateSynthFrequency(scrollProgress) {
    if (!STATE.audioInitialized || !STATE.audioPlaying) return;
    
    // As the user scrolls, open up the lowpass filter slightly to make it feel responsive & light
    // Cutoff varies from 200 Hz (at top) to 550 Hz (at bottom)
    const baseFreq = 200 + scrollProgress * 350;
    
    // Smooth transition of filter frequency
    filterNode.frequency.setTargetAtTime(baseFreq, audioCtx.currentTime, 0.2);
  }

  // Procedural Mechanical "Thock" Keyboard Switch Synthesizer
  function playKeyboardSound(noteName) {
    if (!STATE.audioInitialized) {
      initAudio();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    // Convert notes to frequencies for testing variation
    const freqs = {
      'C3': 130.81,
      'D3': 146.83,
      'E3': 164.81,
      'F3': 174.61,
      'G3': 196.00,
      'A3': 220.00
    };
    
    const baseFreq = freqs[noteName] || 150;

    const now = audioCtx.currentTime;

    // Component 1: The transient high-mid clack (plastic snap)
    const snapOsc = audioCtx.createOscillator();
    const snapGain = audioCtx.createGain();
    const snapFilter = audioCtx.createBiquadFilter();

    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(800, now);
    snapOsc.frequency.exponentialRampToValueAtTime(200, now + 0.03); // Sweeping down

    snapFilter.type = 'bandpass';
    snapFilter.frequency.setValueAtTime(1200, now);
    snapFilter.Q.setValueAtTime(2, now);

    snapGain.gain.setValueAtTime(0.4, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03); // Instant decay

    snapOsc.connect(snapFilter);
    snapFilter.connect(snapGain);
    snapGain.connect(audioCtx.destination);

    // Component 2: The deep acoustic "thock" (resonance of keycap + switches + case)
    const thockOsc = audioCtx.createOscillator();
    const thockGain = audioCtx.createGain();
    const thockFilter = audioCtx.createBiquadFilter();

    thockOsc.type = 'sine';
    // Frequency sweeps down rapidly to simulate a hollow chamber impact
    thockOsc.frequency.setValueAtTime(baseFreq, now);
    thockOsc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, now + 0.08);

    thockFilter.type = 'lowpass';
    thockFilter.frequency.setValueAtTime(180, now);
    thockFilter.Q.setValueAtTime(3, now);

    thockGain.gain.setValueAtTime(0.65, now);
    thockGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16); // Decays over 0.16 seconds

    thockOsc.connect(thockFilter);
    thockFilter.connect(thockGain);
    thockGain.connect(audioCtx.destination);

    // Component 3: Soft ambient structural decay (chassis vibration)
    const vibeOsc = audioCtx.createOscillator();
    const vibeGain = audioCtx.createGain();
    const vibeFilter = audioCtx.createBiquadFilter();

    vibeOsc.type = 'sine';
    vibeOsc.frequency.setValueAtTime(90, now); // Low sub drone

    vibeFilter.type = 'lowpass';
    vibeFilter.frequency.setValueAtTime(100, now);

    vibeGain.gain.setValueAtTime(0.2, now);
    vibeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22); // Slightly longer vibration decay

    vibeOsc.connect(vibeFilter);
    vibeFilter.connect(vibeGain);
    vibeGain.connect(audioCtx.destination);

    // Start & instant stop of audio generators
    snapOsc.start(now);
    snapOsc.stop(now + 0.04);
    
    thockOsc.start(now);
    thockOsc.stop(now + 0.18);

    vibeOsc.start(now);
    vibeOsc.stop(now + 0.25);
  }

  // Attach Event Listeners for Audio
  document.getElementById('audio-toggle').addEventListener('click', toggleAudio);

  // Lazy initialize audio on first scroll or hover just in case
  const lazyAudioTrigger = () => {
    if (!STATE.audioInitialized) {
      initAudio();
      window.removeEventListener('scroll', lazyAudioTrigger);
      window.removeEventListener('mousemove', lazyAudioTrigger);
      window.removeEventListener('click', lazyAudioTrigger);
    }
  };
  window.addEventListener('scroll', lazyAudioTrigger, { passive: true });
  window.addEventListener('mousemove', lazyAudioTrigger, { passive: true });
  window.addEventListener('click', lazyAudioTrigger, { passive: true });

  // Attach sound buttons in keyboard virtual test
  const keys = document.querySelectorAll('.sound-key');
  keys.forEach(key => {
    key.addEventListener('click', (e) => {
      e.stopPropagation();
      const note = key.getAttribute('data-note');
      
      // Synthesis thock sound
      playKeyboardSound(note);

      // Trigger micro-animation state
      key.classList.add('key-active');
      setTimeout(() => key.classList.remove('key-active'), 120);
    });
  });

  // ---------------------------------------------------------
  // 6. ADVANCED INTERACTIVE LAYERS (CURSOR & TILT)
  // ---------------------------------------------------------
  
  // Radial Cursor Glow Tracking
  window.addEventListener('mousemove', (e) => {
    // Update global variables for HSL gradient center tracking
    document.documentElement.style.setProperty('--glow-x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--glow-y', `${e.clientY}px`);
    
    // Physically move cursor glow element on screen via GPU translations
    cursorGlow.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
  }, { passive: true });

  // Card Tilt Interactive System
  cards.forEach((card, index) => {
    card.addEventListener('mousemove', (e) => {
      // Only tilt if this card is currently active/highlighted in viewport
      if (!card.classList.contains('active')) return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // x coordinate inside the card
      const y = e.clientY - rect.top;  // y coordinate inside the card
      
      const px = x / rect.width;
      const py = y / rect.height;
      
      // Calculate rotation angles (relative from card center)
      const tiltX = (CONFIG.maxTilt / 2 - py * CONFIG.maxTilt).toFixed(2);
      const tiltY = (px * CONFIG.maxTilt - CONFIG.maxTilt / 2).toFixed(2);
      
      STATE.hoveredCardIndex = index;
      STATE.cardTilt[index] = { x: tiltX, y: tiltY };
      
      card.style.transition = 'none'; // Lock card smoothly to mouse position
    });

    card.addEventListener('mouseleave', () => {
      STATE.hoveredCardIndex = -1;
      STATE.cardTilt[index] = { x: 0, y: 0 };
      
      // Apply smooth transition back to center
      card.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
      
      // Reset transition list after animation completes to avoid scroll-update lag
      setTimeout(() => {
        if (STATE.hoveredCardIndex !== index) {
          card.style.transition = '';
        }
      }, 600);
    });
  });

  // ---------------------------------------------------------
  // 7. BACKGROUND DRIFT PARTICLES
  // ---------------------------------------------------------
  const partCanvas = document.getElementById('particle-canvas');
  const pCtx = partCanvas.getContext('2d');
  const particles = [];

  function resizeParticleCanvas() {
    partCanvas.width = window.innerWidth;
    partCanvas.height = window.innerHeight;
  }
  
  window.addEventListener('resize', resizeParticleCanvas, { passive: true });
  resizeParticleCanvas();

  // Particle Blueprint
  class Particle {
    constructor() {
      this.reset();
      this.y = Math.random() * partCanvas.height; // Random starting height
    }

    reset() {
      this.x = Math.random() * partCanvas.width;
      this.y = partCanvas.height + Math.random() * 20;
      this.size = Math.random() * 1.5 + 0.5;
      this.speedY = Math.random() * 0.4 + 0.1;
      this.speedX = Math.random() * 0.2 - 0.1;
      this.alpha = Math.random() * 0.4 + 0.1;
      this.fadeSpeed = Math.random() * 0.003 + 0.001;
    }

    update() {
      this.y -= this.speedY;
      this.x += this.speedX;
      
      // Bounce off sides
      if (this.x < 0 || this.x > partCanvas.width) {
        this.speedX = -this.speedX;
      }

      // Reset when particle drifts off-screen
      if (this.y < 0) {
        this.reset();
      }
    }

    draw() {
      pCtx.beginPath();
      pCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      pCtx.fillStyle = `rgba(102, 204, 255, ${this.alpha})`;
      pCtx.fill();
    }
  }

  // Populate particle list
  for (let i = 0; i < CONFIG.particleCount; i++) {
    particles.push(new Particle());
  }

  function animateParticles() {
    pCtx.clearRect(0, 0, partCanvas.width, partCanvas.height);
    
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    
    requestAnimationFrame(animateParticles);
  }
  
  // Start particle simulation
  animateParticles();

  // ---------------------------------------------------------
  // 8. INTERACTIVE CONFIGURATOR MODAL
  // ---------------------------------------------------------
  const configModal = document.getElementById('configurator-modal');
  const openModalBtn = document.getElementById('config-btn');
  const closeModalBtn = document.getElementById('close-modal');
  const configOpts = document.querySelectorAll('.config-opt');

  openModalBtn.addEventListener('click', () => {
    configModal.showModal();
  });

  closeModalBtn.addEventListener('click', () => {
    configModal.close();
  });

  // Close modal when clicking on the backdrop area
  configModal.addEventListener('click', (e) => {
    if (e.target === configModal) {
      configModal.close();
    }
  });

  // Modal configurator selector logic
  configOpts.forEach(opt => {
    opt.addEventListener('click', () => {
      const group = opt.getAttribute('data-group');
      
      // Deselect existing in same option group
      document.querySelectorAll(`.config-opt[data-group="${group}"]`).forEach(btn => {
        btn.classList.remove('active');
      });
      
      // Select clicked option
      opt.classList.add('active');

      // Synthesize keyclick sounds for tactile menu selection
      playKeyboardSound('F3');
    });
  });

  // Configurator Checkout / Reservation Action
  const checkoutBtn = document.getElementById('checkout-btn');
  const stockText = document.querySelector('.stock-hud .hud-text');
  
  if (checkoutBtn && configModal) {
    checkoutBtn.addEventListener('click', () => {
      playKeyboardSound('C3'); // Play mechanical tap tone
      checkoutBtn.textContent = "RESERVING SLOT...";
      checkoutBtn.disabled = true;
      checkoutBtn.style.opacity = 0.8;
      
      setTimeout(() => {
        playKeyboardSound('G3');
        checkoutBtn.textContent = "SLOT SECURED";
        checkoutBtn.style.background = "var(--accent-blue)";
        checkoutBtn.style.color = "var(--bg-deep)";
        
        // Update stock HUD dynamically
        if (stockText) {
          stockText.innerHTML = `BATCH 03: <span class="highlight">87% ALLOCATED</span> (13 BUILD SLOTS REMAINING)`;
          
          // Flash the HUD box to indicate live update
          const hud = document.getElementById('stock-hud');
          hud.style.borderColor = "var(--accent-blue)";
          hud.style.boxShadow = "0 10px 30px rgba(102, 204, 255, 0.3)";
          hud.style.transform = "scale(1.05)";
          
          setTimeout(() => {
            hud.style.borderColor = "rgba(255, 255, 255, 0.04)";
            hud.style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.4)";
            hud.style.transform = "scale(1)";
          }, 800);
        }
        
        // Close modal after success
        setTimeout(() => {
          configModal.close();
          // Reset button state for future customization
          checkoutBtn.disabled = false;
          checkoutBtn.textContent = "RESERVE BUILD SLOT";
          checkoutBtn.style.background = "";
          checkoutBtn.style.color = "";
          checkoutBtn.style.opacity = "";
        }, 1500);
      }, 1500);
    });
  }

  // ---------------------------------------------------------
  // 9. AUTH MODAL (LOGIN / SIGN UP) CONTROL
  // ---------------------------------------------------------
  const authModal = document.getElementById('auth-modal');
  const openAuthBtn = document.getElementById('auth-trigger');
  const closeAuthBtn = document.getElementById('close-auth-modal');
  const authForm = document.getElementById('auth-form');
  const authToggleMode = document.getElementById('auth-toggle-mode');

  if (openAuthBtn && authModal) {
    openAuthBtn.addEventListener('click', () => {
      authModal.showModal();
      playKeyboardSound('D3'); // Synthesize elegant key sound on open
    });
  }

  if (closeAuthBtn && authModal) {
    closeAuthBtn.addEventListener('click', () => {
      authModal.close();
    });
  }

  if (authModal) {
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) {
        authModal.close();
      }
    });
  }

  if (authForm) {
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      playKeyboardSound('C3'); // Synthesize key sound
      
      // Simulate login success response
      const emailInput = document.getElementById('auth-email');
      const continueBtn = authForm.querySelector('button[type="submit"]');
      continueBtn.textContent = "CONNECTED";
      continueBtn.style.background = "var(--accent-blue)";
      continueBtn.style.color = "var(--bg-deep)";
      
      setTimeout(() => {
        authModal.close();
        // Update header button to show profile name
        if (openAuthBtn) {
          openAuthBtn.textContent = emailInput.value.split('@')[0].toUpperCase();
          openAuthBtn.style.borderColor = "var(--accent-blue)";
          openAuthBtn.style.background = "rgba(102, 204, 255, 0.08)";
        }
      }, 1000);
    });
  }

  if (authToggleMode) {
    authToggleMode.addEventListener('click', (e) => {
      e.preventDefault();
      playKeyboardSound('E3');
      const isLogin = authModal.querySelector('h2').textContent === "Access Portal";
      if (isLogin) {
        authModal.querySelector('h2').textContent = "Join Toprium";
        authModal.querySelector('.modal-description').textContent = "Create your premium mechanical build profile.";
        authToggleMode.textContent = "Log in";
        authModal.querySelector('.modal-footer p').childNodes[0].textContent = "Already have an account? ";
      } else {
        authModal.querySelector('h2').textContent = "Access Portal";
        authModal.querySelector('.modal-description').textContent = "Connect to your TOPRIUM Build Profile.";
        authToggleMode.textContent = "Sign up";
        authModal.querySelector('.modal-footer p').childNodes[0].textContent = "Don't have an account? ";
      }
    });
  }

  // Smooth Scroll on Header Links
const headerLinks = document.querySelectorAll('.header-nav .nav-link');
headerLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');

    if (!href.startsWith('#')) return; // ← let /about.html navigate normally

    e.preventDefault();
    const targetSection = document.querySelector(href);
    if (targetSection) {
      const idx = Array.from(sections).indexOf(targetSection);
      if (idx !== -1) {
        STATE.currentSectionIndex = idx;
        scrollToSection(idx);
      }
    }
    playKeyboardSound('G3');
  });
});

  // Interactive Carousel Dots Snapping
  document.querySelectorAll('.card-carousel-dots').forEach((dotsContainer) => {
    const dots = dotsContainer.querySelectorAll('.dot');
    dots.forEach((dot, dotIdx) => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        // Snapping target slide is dotIdx + 1 (since slide-2 is index 1)
        const targetIdx = dotIdx + 1;
        if (targetIdx < sections.length) {
          STATE.currentSectionIndex = targetIdx;
          scrollToSection(targetIdx);
          playKeyboardSound('C4'); // Synthesize elegant mechanical click
        }
      });
    });
  });

  // ---------------------------------------------------------
  // 10. LAUNCH PRELOADING
  // ---------------------------------------------------------
  preloadFrames();

});
