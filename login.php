<?php
// Enable error reporting for debugging (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($email) || empty($password)) {
        echo json_encode(['status' => 'error', 'message' => 'Please fill in all fields.']);
        exit;
    }

    $query = "SELECT id, fullname, email, password FROM users WHERE email = $1";
    $result = pg_query_params($dbconn, $query, array($email));

    if ($result && pg_num_rows($result) > 0) {
        $row = pg_fetch_assoc($result);
        
        if (password_verify($password, $row['password'])) {
            echo json_encode([
                'status' => 'success',
                'message' => 'Welcome back, ' . $row['fullname'] . '!',
                'user' => [
                    'fullname' => $row['fullname'],
                    'email'    => $row['email']
                ]
            ]);
            exit;
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Incorrect password.']);
            exit;
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Email not found.']);
        exit;
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
    exit;
}
?>