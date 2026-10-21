<?php
require_once 'db.php';
header('Content-Type: application/json');

$query = "SELECT id, customer_email, order_summary, total_price, phone, location, status, created_at FROM orders ORDER BY id DESC";
$result = pg_query($dbconn, $query);

if ($result) {
    $orders = [];
    while ($row = pg_fetch_assoc($result)) {
        $orders[] = $row;
    }
    echo json_encode(['status' => 'success', 'orders' => $orders]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Failed to fetch orders.']);
}
?>