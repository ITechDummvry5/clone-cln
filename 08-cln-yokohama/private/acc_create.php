<?php include 'ui/header.php'; ?>

<div class="container">
  <div class="card">
    <h2 class="mb-4">Create Account</h2>

      <form action="post_handler.php" method="POST">

      <div class="form-group">
        <label class="form-label">Name</label>
        <input type="text" name="name" class="form-input">
      </div>
      <div class="form-group">
        <label class="form-label">Email</label>
        <input type="email" name="email" class="form-input">
      </div>
        <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" name="password" class="form-input">
        </div>

        <div class="form-group">
            <label class="form-label">Status User </label>
            <select name="role" class="form-select">
                <option value="user">User</option>
                <option value="admin">Admin</option>
            </select>
        </div>

        <div class="form-group">
            <label class="form-label">Status</label>
            <select name="status" class="form-select">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
            </select>
        </div>
        
      <button type="submit" name="savedAcc" class="btn btn-primary">Submit</button>
    </form>
  </div>
</div>


<?php include 'ui/footer.php'; ?>