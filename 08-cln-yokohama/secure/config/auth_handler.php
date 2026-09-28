<?php 
require 'function.php';

if (isset($_POST['loginBtn'])) {
    $email = validate($_POST['email']);
    $password = validate($_POST['password']);

    if ($email !== '' && $password !== '') {
        try {
            $stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email LIMIT 1");
            $stmt->bindParam(':email', $email);
            $stmt->execute();

            if ($stmt->rowCount() === 1) {
                $user = $stmt->fetch(PDO::FETCH_ASSOC);

       if ((int)$user['status'] === 0) {
    redirect('../../login.php', 'Your account is inactive.', 'error');
}

                // Validate password
                if (!password_verify($password, $user['password'])) {
                    redirect('../../login.php', 'Incorrect password.', 'error');
                }

                // Start session
                session_regenerate_id(true);
                $_SESSION['auth'] = true;
                $_SESSION['auth_user'] = [
                    'id' => $user['id'],
                    'name' => $user['name'],
                    'email' => $user['email'],
                    'role' => $user['role']
                ];

            // Redirect by role
if ($user['role'] === 'admin') {
   redirect('../../private/dashboard.php', 'Welcome Admin!');
} else {
    redirect('../../user_default.php', 'Welcome User!');
}

            } else {
                redirect('../../login.php', 'Account not found.', 'error');
            }

        } catch (PDOException $e) {
            redirect('../../login.php', 'Login error. Please try again.', 'error');
        }

    } else {
        redirect('../../login.php', 'All fields are required.', 'error');
    }

} else {
    redirect('../../login.php', 'Invalid request.', 'error');
}

