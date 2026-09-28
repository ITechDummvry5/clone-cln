<?php require_once '../secure/config/function.php';
        date_default_timezone_set('Asia/Manila');

?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Admin Dashboard</title>

<link rel="stylesheet" href="assets/css/main.css" />
<link rel="stylesheet" href="assets/css/utilities.css" />
<!-- Add in your fontawesome section -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

    <!-- ICON SECTION -->
    <link rel="icon" type="image/png" href="assets/uploads/favicon.png">
</head>
<body>
  <div class="dashboard">

 <?php include 'sidebar.php' ?>
 
    <!-- Main Panel -->
    <div class="main-panel">
  <?php include 'navbar.php' ?>
  
      <!-- Main Content -->
      <main class="main-content">
        <section class="welcome">


        
