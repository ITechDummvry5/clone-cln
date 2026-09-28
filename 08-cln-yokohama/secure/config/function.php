<?php 
session_start();

// Set timezone
if (date_default_timezone_get() != 'Asia/Manila') {
    date_default_timezone_set('Asia/Manila');
}

require 'connector.php'; // Your PDO connection file with $pdo

//  Input validation (no need for DB escaping here)
function validate($inputData) {
    return strtolower(trim(htmlspecialchars($inputData, ENT_QUOTES, 'UTF-8')));
}

//  Redirect with session status
function redirect($url, $status, $status_type = 'success') {
    $_SESSION['status'] = $status;
    $_SESSION['status_type'] = $status_type;
    header("Location: $url");
    exit();
}
//  Alert message function
function alertMessage() {
    if (isset($_SESSION['status'])) {
        $alertClass = 'alert-success'; // default

        if (isset($_SESSION['status_type']) && $_SESSION['status_type'] === 'error') {
            $alertClass = 'alert-error';
        }

        echo '
        <div class="custom-alert ' . $alertClass . '">
            ' . htmlspecialchars($_SESSION['status']) . '
        </div>';

        unset($_SESSION['status']);
        unset($_SESSION['status_type']);
    }
}


//  Insert function (PDO version)
function insert($tableName, $data) {
    global $pdo;

    $table = validate($tableName);
    $columns = array_keys($data);
    $placeholders = array_map(fn($col) => ":$col", $columns);

    $sql = "INSERT INTO $table (" . implode(',', $columns) . ") VALUES (" . implode(',', $placeholders) . ")";
    $stmt = $pdo->prepare($sql);

    foreach ($data as $key => &$value) {
        $stmt->bindParam(":$key", $value);
    }

    return $stmt->execute();
}

//  Update function (PDO version)
function update($tableName, $id, $data) {
    global $pdo;

    $table = validate($tableName);
    $id = validate($id);

    $setPart = implode(', ', array_map(fn($col) => "$col = :$col", array_keys($data)));
    $sql = "UPDATE $table SET $setPart WHERE id = :id";

    $stmt = $pdo->prepare($sql);
    $data['id'] = $id;

    foreach ($data as $key => &$value) {
        $stmt->bindParam(":$key", $value);
    }

    return $stmt->execute();
}

//  Delete function (PDO version)
function getAll($tableName, $status = null) {
    global $pdo;

    $table = validate($tableName);
    $status = validate($status);

    if ($status === 'status') {
        $sql = "SELECT * FROM $table WHERE status = :statusVal";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['statusVal' => 0]); // fetch only inactive records
    } else {
        $sql = "SELECT * FROM $table";
        $stmt = $pdo->query($sql); // no parameter needed
    }

    return $stmt->fetchAll(PDO::FETCH_ASSOC); // return all results as associative array
}

//  Get by ID function (PDO version)
function getById($tableName, $id) {
    global $pdo;

    $table = validate($tableName);
    $id = validate($id);

    try {
        $sql = "SELECT * FROM $table WHERE id = :id LIMIT 1";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            return [
                'status' => 200,
                'data' => $row,
                'message' => 'Record Found!'
            ];
        } else {
            return [
                'status' => 404,
                'message' => 'No Data Found!'
            ];
        }

    } catch (PDOException $e) {
        return [
            'status' => 500,
            'message' => 'Something went wrong!',
            'error' => $e->getMessage() // optional for debugging
        ];
    }
}

//  Delete function (PDO version)
function delete($tableName, $id) {
    global $pdo;

    $table = validate($tableName);
    $id = validate($id);

    try {
        $sql = "DELETE FROM $table WHERE id = :id LIMIT 1";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute(); // true on success, false on failure
    } catch (PDOException $e) {
        // Optional: log or handle the error
        return false;
    }
}


?>
