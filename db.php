<?php
// db.php - Cloud & Local Compatible Connection

$host     = getenv('DB_HOST')     ?: "localhost";
$port     = getenv('DB_PORT')     ?: "5432";
$dbname   = getenv('DB_NAME')     ?: "pizza_db";
$user     = getenv('DB_USER')     ?: "postgres";
$password = getenv('DB_PASSWORD') ?: "CAMO";

$conn_string = "host={$host} port={$port} dbname={$dbname} user={$user} password={$password}";

// If connecting to a cloud provider like Render, SSL is usually required
if (getenv('DB_HOST')) {
    $conn_string .= " sslmode=require";
}

$dbconn = pg_connect($conn_string);

if (!$dbconn) {
    die("Connection failed: " . pg_last_error());
}
?>