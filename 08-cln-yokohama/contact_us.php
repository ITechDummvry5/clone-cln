<?php include 'public/layouts/header.php'; ?>

<div class="contact-banner">
  <img src="public/assets/images/Alignment.jpg" alt="Contact Us Banner">

  <div class="contact-overlay">
    <h1 data-aos="zoom-in-up">CONTACT US</h1>

    <div class="card-container">
      <!-- Sidebar -->
      <div class="card sidebar" data-aos="zoom-in-right">
        <div class="sidebar-content">
          <div class="sidebar-logo">
            <img src="public/assets/images/Yokohama-text.png" alt="Minerva Logo">
          </div>
          <form class="service-form">
            <ul class="service-list">
              <li><label><input type="checkbox" value="Alignment"> Alignment</label></li>
              <li><label><input type="checkbox" value="Balancing"> Balancing</label></li>
              <li><label><input type="checkbox" value="Mounting"> Mounting</label></li>
              <li><label><input type="checkbox" value="Tune Up"> Tune Up</label></li>
              <li><label><input type="checkbox" value="Change Oil"> Change Oil</label></li>
              <li><label><input type="checkbox" value="Underchasis"> Underchasis</label></li>
              <li><label><input type="checkbox" value="Brakes"> Brakes</label></li>
            </ul>
          </form>
        </div>
      </div>

      <!-- Main Panel -->
      <div class="card main-panel" data-aos="zoom-in-left">
        <form>
          <label for="name">Name</label>
          <input type="text" id="name" placeholder="Enter your name" />

          <label for="email">Email</label>
          <input type="email" id="email" placeholder="Enter your email" />

          <label for="message">Message</label>
          <textarea id="message" rows="4" placeholder="Enter your message"></textarea>

          <button type="submit">Message Submit</button>
        </form>
      </div>
    </div>
  </div>
</div>



<?php include 'public/layouts/footer.php'; ?>
