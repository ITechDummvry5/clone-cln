<?php include 'public/layouts/header.php'; ?>

<!-- Font Awesome (for eye icon) -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

<style>
  body, html {
    height: 100%;
    margin: 0;
  }

  .bg-wrapper {
    background: url('public/assets/images/About-us-Image-cda88a8d.jpeg') no-repeat center center fixed;
    background-size: cover;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  /* Optional: dark overlay for contrast */
  .bg-wrapper::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 0;
  }

  .login-container {
    max-width: 400px;
    width: 100%;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    padding: 30px;
    position: relative;
    color: #cc0010;
    z-index: 1;
  }

  .login-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-bottom: 24px;
  }

  .login-header img {
    width: 52px;
    height: 52px;
    object-fit: contain;
  }

  .login-header h2 {
    font-size: 1.25rem;
    margin: 0;
  }

  .form-group {
    margin-bottom: 18px;
    position: relative;
  }

  .form-label {
    display: block;
    font-weight: 600;
    margin-bottom: 6px;
    font-size: 0.95rem;
  }

  .form-input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.95rem;
    background-color: #fff;
  }

  .form-input:focus {
    border-color: #e60012;
    outline: none;
    box-shadow: 0 0 0 3px rgba(230, 0, 18, 0.1);
  }

  .btn {
    width: 100%;
    padding: 10px 16px;
    background-color: #e60012;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s ease-in-out;
  }

  .btn:hover {
    background-color: #cc0010;
  }

  .forgot-link {
    text-align: right;
    margin-top: 12px;
    font-size: 0.9rem;
  }

  .forgot-link a {
    color: #1d4ed8;
    text-decoration: none;
  }

  .forgot-link a:hover {
    text-decoration: underline;
  }

  .toggle-password {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    color: #999;
    font-size: 1rem;
  }
</style>

<div class="bg-wrapper">
  <div class="login-container">
    <div class="login-header">
      <img src="public/assets/images/Yokohama-Logo.jpg" alt="Logo">
      <h2>YOKOHAMA.inc</h2>
    </div>

    <?php alertMessage(); ?>

    <form action="secure/config/auth_handler.php" method="POST">
      <div class="form-group">
        <label class="form-label">Email</label>
        <input type="email" name="email" class="form-input" required>
      </div>

      <div class="form-group">
        <label class="form-label">Password</label>
        <input type="password" name="password" id="password" class="form-input" required>
        <i class="fa-solid fa-eye toggle-password" onclick="togglePassword()"></i>
        <div class="forgot-link">
          <a href="#">Forgot Password?</a>
        </div>
      </div>

      <button type="submit" name="loginBtn" class="btn">Login</button>
    </form>
  </div>
</div>

<script>
  function togglePassword() {
    const input = document.getElementById('password');
    const icon = document.querySelector('.toggle-password');

    if (input.type === 'password') {
      input.type = 'text';
      icon.classList.remove('fa-eye');
      icon.classList.add('fa-eye-slash');
    } else {
      input.type = 'password';
      icon.classList.remove('fa-eye-slash');
      icon.classList.add('fa-eye');
    }
  }
</script>

<?php include 'public/layouts/footer.php'; ?>
