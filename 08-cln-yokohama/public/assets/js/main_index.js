document.addEventListener('DOMContentLoaded', function() {
  // ==========================================
  // GENERAL PAGE INTERACTION FUNCTIONALITY
  // ==========================================
  
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 70,
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Header scroll effect
  const header = document.querySelector('header');
  let lastScroll = 0;
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
      header.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
      header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
      header.style.backgroundColor = '#000';
      header.style.boxShadow = 'none';
    }
    
    lastScroll = currentScroll;
  });
  
  // Mobile menu toggle (prepare for future implementation)
  // This will be useful when you want to add a hamburger menu for mobile
  const createMobileMenu = () => {
    const nav = document.querySelector('nav');
    const mobileMenuBtn = document.createElement('div');
    mobileMenuBtn.className = 'mobile-menu-btn';
    mobileMenuBtn.innerHTML = '<span></span><span></span><span></span>';
    
    // Add mobile menu button to DOM when you're ready to implement
    // document.querySelector('header').appendChild(mobileMenuBtn);
    
    // Toggle mobile menu
    // mobileMenuBtn.addEventListener('click', () => {
    //   nav.classList.toggle('active');
    //   mobileMenuBtn.classList.toggle('active');
    // });
  };
  
  // Uncomment the line below when ready to implement mobile menu
  // createMobileMenu();
  
  // Add button hover effect
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(button => {
    button.addEventListener('mouseover', () => {
      button.style.boxShadow = '0 5px 15px rgba(230, 0, 18, 0.4)';
    });
    
    button.addEventListener('mouseout', () => {
      button.style.boxShadow = 'none';
    });
  });
  
  // ==========================================
  // SLIDESHOW FUNCTIONALITY
  // ==========================================
  
  // Get all slides
  const slides = document.querySelectorAll('.slide');
  const slideNavContainer = document.querySelector('.slideshow-nav');
  const prevBtn = document.querySelector('.prev-slide');
  const nextBtn = document.querySelector('.next-slide');
  
  // Initialize current slide index
  let currentSlideIndex = 0;
  
  // Create navigation dots for each slide
  slides.forEach((_, index) => {
    const navDot = document.createElement('button');
    navDot.setAttribute('aria-label', `Go to slide ${index + 1}`);
    navDot.addEventListener('click', () => {
      goToSlide(index);
    });
    slideNavContainer.appendChild(navDot);
  });
  
  // Function to update navigation dots
  const updateNavDots = () => {
    const navDots = slideNavContainer.querySelectorAll('button');
    navDots.forEach((dot, index) => {
      if (index === currentSlideIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  };
  
  // Function to go to a specific slide
  const goToSlide = (index) => {
    // Remove active class from all slides
    slides.forEach(slide => {
      slide.classList.remove('active');
    });
    
    // Add active class to current slide
    slides[index].classList.add('active');
    
    // Update current slide index
    currentSlideIndex = index;
    
    // Update navigation dots
    updateNavDots();
  };
  
  // Function to go to next slide
  const nextSlide = () => {
    const newIndex = (currentSlideIndex + 1) % slides.length;
    goToSlide(newIndex);
  };
  
  // Function to go to previous slide
  const prevSlide = () => {
    const newIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
    goToSlide(newIndex);
  };
  
  // Add event listeners for navigation arrows
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
    });
  }
  
  // Initialize slideshow
  updateNavDots();
  
  // Auto-advance slides every 5 seconds
  setInterval(() => {
    nextSlide();
  }, 5000);
});


    document.addEventListener("DOMContentLoaded", function () {
        const burger = document.getElementById("burger-toggle");
        const nav = document.getElementById("nav-menu");

        burger.addEventListener("click", function () {
            nav.classList.toggle("active");
        });
    });

    // scroll infinity

document.addEventListener('DOMContentLoaded', function () {
  const container = document.querySelector('.animation-wrapper');
  const logoTrack = document.getElementById('logoScroll');
  let speed = 2;
  let posX = 0;

  function animate() {
    posX -= speed;
    logoTrack.style.left = posX + 'px';

    const firstImg = logoTrack.querySelector('img');
    const firstImgRight = firstImg.getBoundingClientRect().right;

    // If first image is completely off screen (left)
    if (firstImgRight < 0) {
      // Move first image to the end
      logoTrack.appendChild(firstImg);
      // Adjust position to prevent gap
      posX += firstImg.offsetWidth + parseInt(getComputedStyle(firstImg).marginRight || 0);
      logoTrack.style.left = posX + 'px';
    }

    requestAnimationFrame(animate);
  }

  animate();
});

document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('main-header');
    const navLinks = document.querySelectorAll('#nav-menu a');
    let lastScrollTop = 0;

    // Shrink or restore padding on scroll
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;

        // Shrink header
        if (scrollTop > 100) {
            header.style.paddingBlock = '5px';
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
        } else {
            header.style.paddingBlock = '15px';
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        }

        // Hide header on scroll down, show on scroll up
        if (scrollTop > lastScrollTop && scrollTop > 150) {
            header.classList.add('hide-header');
        } else {
            header.classList.remove('hide-header');
        }

        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    });

    // Highlight active link based on current page
    const currentPath = window.location.pathname.split('/').pop();
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href').split('/').pop();
        if (linkPath === currentPath) {
            link.classList.add('active-nav');
        }
    });
});


  function updateClock() {
    const now = new Date();
    document.getElementById('clock').innerText =
      now.toLocaleString("en-PH", { timeZone: "Asia/Manila" });
  }
  setInterval(updateClock, 1000);
  updateClock();


    
