<?php
// register.php - Handles new user registration
require_once 'db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $fullname = trim($_POST['fullname'] ?? '');
    $email    = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($fullname) || empty($email) || empty($password)) {
        echo json_encode(['status' => 'error', 'message' => 'Please fill in all fields.']);
        exit;
    }

    // Secure password hashing
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Check if email already exists
    $check_query = "SELECT id FROM users WHERE email = $1";
    $check_result = pg_query_params($dbconn, $check_query, array($email));

    if (pg_num_rows($check_result) > 0) {
        echo json_encode(['status' => 'error', 'message' => 'Email is already registered.']);
        exit;
    }

    // Insert new user into PostgreSQL (Make sure $fullname, $email, $hashed_password have $ signs!)
    $insert_query = "INSERT INTO users (fullname, email, password) VALUES ($1, $2, $3)";
    $insert_result = pg_query_params($dbconn, $insert_query, array($fullname, $email, $hashed_password));

    if ($insert_result) {
        echo json_encode(['status' => 'success', 'message' => 'Registration successful! You can now login.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Registration failed. Try again.']);
    }
} else {
    // If someone visits register.php directly in the browser via GET, safely block them
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
}
?>