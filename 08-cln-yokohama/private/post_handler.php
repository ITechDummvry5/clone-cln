<?php 
include '../secure/config/function.php';


if (isset($_POST['savedAcc'])) {
    $name = validate($_POST['name']);
    $email = validate($_POST['email']);
    $password = password_hash(validate($_POST['password']), PASSWORD_DEFAULT); // secure hash
    $role = validate($_POST['role']);
    $status = validate($_POST['status']) === 'active' ? 0 : 1; // 0 = active, 1 = inactive

    $data = [
        'name' => $name,
        'email' => $email,
        'password' => $password,
        'role' => $role,
        'status' => $status
    ];

    $inserted = insert('users', $data); // assuming the table name is `users`

    if ($inserted) {
        redirect('acc_manage.php', 'Account created successfully');
    } else {
        redirect('acc_manage.php', 'Failed to create account', 'error');
    }
}

