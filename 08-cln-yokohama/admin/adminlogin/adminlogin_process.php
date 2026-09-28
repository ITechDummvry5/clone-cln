<?php
session_start();
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Adjust path up two levels into the dbconnection folder
include '../../dbconnection/connector.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $email    = $_POST['email']    ?? '';
    $password = $_POST['password'] ?? '';

    if (empty($email) || empty($password)) {
        echo "failed";
        exit;
    }

    try {
        // Query the adminlogin table for matching email
        $stmt = $pdo->prepare("SELECT * FROM adminlogin WHERE email = :email LIMIT 1");
        $stmt->bindParam(':email', $email);
        $stmt->execute();

        $admin = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($admin && $password === $admin['pass']) {
            $_SESSION['admin_id'] = $admin['id'];
            echo "success";
        } else {
            echo "failed";
        }
    } catch (PDOException $e) {
        echo "failed";
    }
}
?>
