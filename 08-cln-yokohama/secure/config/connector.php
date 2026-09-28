<?php

$host = 'localhost';      
$dbname = 'minerva_system';
$dbuser = 'root';
$dbpass = '';

try {
    //(connect to the database)
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $dbuser, $dbpass);

    // error mode to exceptions para ma-handle yung errors
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

} catch (PDOException $e) {
    echo "Database connection failed: " . $e->getMessage();
    exit();  // Stop further execution if connection fails
}
?>
