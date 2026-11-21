/* ===== Developer Quotes & Mindset Carousel Script ===== */
document.addEventListener('DOMContentLoaded', () => {
  const quotes = [
    {
      text: "Simplicity is prerequisite for reliability.",
      author: "Edsger W. Dijkstra",
      image: "assets/images/quotes/edsger-dijkstra.png",
      role: "Turing Award Winner & CS Pioneer",
      category: "ARCHITECTURE"
    },
    {
      text: "First, solve the problem. Then, write the code.",
      author: "John Johnson",
      image: "assets/images/quotes/john-johnson.png",
      role: "Software Engineer & Author",
      category: "METHODOLOGY"
    },
    {
      text: "Make it work, make it right, make it fast.",
      author: "Kent Beck",
      image: "assets/images/quotes/kent-beck.png",
      role: "Creator of Extreme Programming & Agile Pioneer",
      category: "CRAFT"
    },
    {
      text: "Talk is cheap. Show me the code.",
      author: "Linus Torvalds",
      image: "assets/images/quotes/linus-torvalds.png",
      role: "Creator of Linux & Git",
      category: "EXECUTION"
    },
    {
      text: "Clean code always looks like it was written by someone who cares.",
      author: "Robert C. Martin (Uncle Bob)",
      image: "assets/images/quotes/uncle-bob.png",
      role: "Author of Clean Code",
      category: "QUALITY"
    },
    {
      text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
      author: "Martin Fowler",
      image: "assets/images/quotes/martin-fowler.png",
      role: "Software Architect & Thought Leader",
      category: "READABILITY"
    }
  ];

  let currentIndex = 0;
  let autoTimer = null;

  const textEl = document.getElementById('quoteText');
  const authorEl = document.getElementById('quoteAuthor');
  const roleEl = document.getElementById('quoteRole');
  const catEl = document.getElementById('quoteCategory');
  const dotsContainer = document.getElementById('quoteDots');
  const prevBtn = document.getElementById('quotePrevBtn');
  const nextBtn = document.getElementById('quoteNextBtn');
  const cardEl = document.getElementById('quotesSlider');
  const imgEl = document.getElementById('quoteImage');
  const indexEl = document.getElementById('quoteIndex');
  const totalEl = document.getElementById('quoteTotal');
  const progressEl = document.getElementById('quoteProgress') && document.getElementById('quoteProgress').parentElement;
  const signEl = document.getElementById('quoteSign');
  const signImgEl = document.getElementById('quoteSignImg');
  // Signature: uses q.signature (image path) if set, else the name in a script font
  function setSignature(q) {
    if (!signEl) return;
    signEl.textContent = q.author.replace(/\s*\(.*\)/, '');
    if (!signImgEl) return;
    if (q.signature) {
      signImgEl.src = q.signature;
      signImgEl.hidden = false;
      signEl.hidden = true;
    } else {
      signImgEl.hidden = true;
      signEl.hidden = false;
    }
  }
  const pad = n => String(n).padStart(2, '0');

  function restartProgress() {
    if (!progressEl) return;
    progressEl.classList.remove('run', 'paused');
    void progressEl.offsetWidth; // restart animation
    progressEl.classList.add('run');
  }
  if (totalEl) totalEl.textContent = '/' + pad(quotes.length);

  if (!textEl || !authorEl || !cardEl) return;
  if (imgEl && !quotes[0].image) { imgEl.removeAttribute('src'); imgEl.alt = ''; imgEl.style.visibility = 'hidden'; }

  // Build dots (optional)
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    quotes.forEach((_, idx) => {
      const dot = document.createElement('button');
      dot.className = `quote-dot ${idx === 0 ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Go to quote ${idx + 1}`);
      dot.addEventListener('click', () => {
        currentIndex = idx;
        updateQuote();
        resetTimer();
      });
      dotsContainer.appendChild(dot);
    });
  }

  // Shrink font until the quote fits its fixed box (section height never changes)
  function fitQuote() {
    textEl.style.fontSize = '';
    let fs = parseFloat(getComputedStyle(textEl).fontSize);
    while (textEl.scrollHeight > textEl.clientHeight + 1 && fs > 14) {
      fs -= 1;
      textEl.style.fontSize = fs + 'px';
    }
  }

  function updateQuote() {
    const q = quotes[currentIndex];
    restartProgress();
    
    // Animate out
    cardEl.classList.add('is-changing');

    setTimeout(() => {
      textEl.textContent = `"${q.text}"`;
      fitQuote();
      setSignature(q);
      if (indexEl) indexEl.textContent = pad(currentIndex + 1);
      authorEl.textContent = q.author;
      roleEl.textContent = q.role;
      if (imgEl) {
        if (q.image) { imgEl.src = q.image; imgEl.alt = q.author; imgEl.style.visibility = ''; }
        else { imgEl.removeAttribute('src'); imgEl.alt = ''; imgEl.style.visibility = 'hidden'; }
      }
      if (catEl) catEl.textContent = q.category;

      // Update active dot
      if (dotsContainer) {
        dotsContainer.querySelectorAll('.quote-dot').forEach((d, i) => {
          d.classList.toggle('active', i === currentIndex);
        });
      }

      cardEl.classList.remove('is-changing');
    }, 250);
  }

  function nextQuote() {
    currentIndex = (currentIndex + 1) % quotes.length;
    updateQuote();
  }

  function prevQuote() {
    currentIndex = (currentIndex - 1 + quotes.length) % quotes.length;
    updateQuote();
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextQuote();
      resetTimer();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevQuote();
      resetTimer();
    });
  }

  function startTimer() {
    clearInterval(autoTimer);
    autoTimer = setInterval(nextQuote, 6000);
    restartProgress();
  }

  function resetTimer() {
    clearInterval(autoTimer);
    startTimer();
  }

  // Pause on hover
  cardEl.addEventListener('mouseenter', () => {
    clearInterval(autoTimer);
    if (progressEl) progressEl.classList.add('paused');
  });
  cardEl.addEventListener('mouseleave', startTimer);

  window.addEventListener('resize', fitQuote);
  window.addEventListener('load', fitQuote);
  fitQuote();
  startTimer();
});
