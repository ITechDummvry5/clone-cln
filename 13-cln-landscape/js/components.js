/* ========================================
   SHARED COMPONENTS  (navbar + footer + video modal)
   Edit the navbar / footer HERE once - every page updates.
   Each page needs:
     <body data-page="home">  (or "services", ...)
     <div id="site-header"></div>
     <div id="site-footer"></div>
     <script src="js/components.js"></script>   <- BEFORE script.js
======================================== */
(function () {
  const page = document.body.dataset.page || 'home';
  const p = page === 'home' ? '' : 'index.html';   // home-page anchors: #about on index, index.html#about elsewhere

  const header = `<header class="nav-wrap">
  <nav class="nav" aria-label="Main">
    <a href="${p}#home" class="logo"><span class="logo-mark"><i class="fa-solid fa-seedling"></i></span>Landscape</a>
    <ul class="nav-links" id="navLinks">
      <li><a href="${p}#home" data-nav="home">Home</a></li>
      <li class="has-dd">
        <a href="services.html" class="dd-toggle" data-nav="services">Services <i class="fa-solid fa-chevron-down"></i></a>
        <div class="mega">
          <div class="mega-left">
            <div class="mega-cards">
              <a href="services.html" class="mega-card"><span class="mi"><i class="fa-solid fa-seedling"></i></span><h4>Soil Testing</h4><p>Detailed lab analysis of nutrients, pH, and soil health for every field.</p><b>Read More</b></a>
              <a href="services.html" class="mega-card"><span class="mi"><i class="fa-solid fa-helicopter"></i></span><h4>Precision Farming</h4><p>Drone mapping and sensor data to guide planting, watering, and harvesting.</p><b>Read More</b></a>
              <a href="services.html" class="mega-card"><span class="mi"><i class="fa-solid fa-bullseye"></i></span><h4>Crop Consulting</h4><p>One-to-one advice on crop choice, rotation, and yield growth.</p><b>Read More</b></a>
            </div>
            <div class="mega-news">
              <h5>Latest News</h5>
              <div class="mn-slider" id="mnSlider">
                <button class="mn-arrow prev" aria-label="Previous news"><i class="fa-solid fa-arrow-left"></i></button>
                <div class="mn-viewport">
                  <div class="mn-track">
                  <a href="news.html#post-01" class="mn"><img src="images/news-page/post-01.jpg" alt=""><span><strong>How Smart Sensors Are Reshaping Crop Monitoring</strong><em>September 3, 2025</em></span></a>
                  <a href="news.html#post-02" class="mn"><img src="images/news-page/post-02.jpg" alt=""><span><strong>Harvest Season Outlook: What Farmers Can Expect</strong><em>September 3, 2025</em></span></a>
                  <a href="news.html#post-03" class="mn"><img src="images/news-page/post-03.jpg" alt=""><span><strong>Precision Tractors Cut Fuel Use Across Large Farms</strong><em>September 3, 2025</em></span></a>
                  <a href="news.html#post-04" class="mn"><img src="images/news-page/post-04.jpg" alt=""><span><strong>Starting Small: Healthy Seedlings Build Healthy Soil</strong><em>September 3, 2025</em></span></a>
                  <a href="news.html#post-05" class="mn"><img src="images/news-page/post-05.jpg" alt=""><span><strong>Modern Machinery Meets Traditional Farming Knowledge</strong><em>September 3, 2025</em></span></a>
                  </div>
                </div>
                <button class="mn-arrow next" aria-label="Next news"><i class="fa-solid fa-arrow-right"></i></button>
              </div>
            </div>
          </div>
          <div class="mega-right">
            <div class="mr-head"><h4>Soil Testing &amp; Analysis</h4><a href="services.html" class="circle" aria-label="Open"><i class="fa-solid fa-arrow-right"></i></a></div>
            <p>Understand your soil’s nutrients, pH, and structure to plan healthier harvests.</p>
            <div class="mr-img"><img src="images/megamenu/service-card.jpg" alt="Green tractor"><button class="play" data-video="videos/intro.mp4" aria-label="Play video"><i class="fa-solid fa-play"></i></button></div>
          </div>
        </div>
      </li>
      <li><a href="about.html" data-nav="about">About</a></li>
      <li><a href="news.html" data-nav="news">News</a></li>
      <li><a href="contact.html" data-nav="contact">Contact</a></li>
    </ul>
    <div class="nav-actions">
      <button class="icon-btn" aria-label="Search"><i class="fa-solid fa-magnifying-glass"></i></button>
      <a href="contact.html" class="btn">Get Started <span class="btn-ic"><i class="fa-solid fa-arrow-right"></i></span></a>
      <button class="burger" id="burger" aria-label="Menu"><i class="fa-solid fa-bars"></i></button>
    </div>
  </nav>
</header>`;

  const footer = `<footer class="footer" id="contact">
  <div class="container">
    <div class="f-top">
      <a href="${p}#home" class="logo"><span class="logo-mark"><i class="fa-solid fa-seedling"></i></span>Landscape</a>
      <ul class="f-nav"><li><a href="${p}#home" data-nav="home">Home</a></li><li><a href="services.html" data-nav="services">Services</a></li><li><a href="about.html" data-nav="about">About</a></li><li><a href="news.html" data-nav="news">News</a></li><li><a href="#contact">Contact</a></li></ul>
    </div>
    <div class="f-mid">
      <div class="f-info">
        <div><span class="ficon dk"><i class="fa-solid fa-location-dot"></i></span><p><b>Address:</b>Street Name, NY 38954</p></div>
        <div><span class="ficon dk"><i class="fa-solid fa-phone-volume"></i></span><p><b>Phone:</b>578-393-4937</p></div>
        <div><span class="ficon dk"><i class="fa-solid fa-mobile-screen"></i></span><p><b>Mobile:</b>578-393-4937</p></div>
        <div><span class="ficon dk"><i class="fa-regular fa-clock"></i></span><p><b>Opening hours</b>9AM - 5PM</p></div>
      </div>
      <div class="socials">
        <a href="#" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a><a href="#" aria-label="X"><i class="fa-brands fa-x-twitter"></i></a>
        <a href="#" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a><a href="#" aria-label="LinkedIn"><i class="fa-brands fa-linkedin-in"></i></a>
      </div>
    </div>
    <div class="f-bot"><span>Copyright © 2026 - WordPress Theme by CreativeThemes</span><span><a href="#">Privacy Policy</a> <a href="#">Terms of Use</a></span></div>
  </div>
</footer>`;

  const modal = `<div class="modal" id="modal" aria-hidden="true">
  <button class="modal-x" id="modalX" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
  <video id="modalVideo" controls playsinline></video>
</div>`;

  const h = document.getElementById('site-header');
  const f = document.getElementById('site-footer');
  if (h) h.outerHTML = header;
  if (f) f.outerHTML = footer;
  document.body.insertAdjacentHTML('beforeend', modal);

  /* Mark the current page in the navbar and footer */
  document.querySelectorAll('[data-nav="' + page + '"]').forEach(a => {
    a.classList.add(a.classList.contains('dd-toggle') ? 'current' : 'active');
  });
})();
