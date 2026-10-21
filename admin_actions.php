<?php
require_once 'db.php';
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? '';

if($action === 'update_status'){
    $order_id = $input['order_id']; // Fixed assignment typo here
    $new_status = $input['status'];
    $query = 'UPDATE orders SET status = $1 WHERE id = $2';
    $result = pg_query_params($dbconn, $query, [$new_status, $order_id]);
    echo json_encode(['status' => $result ? 'success' : 'error', 'message' => $result ? 'Order status updated.' : 'Failed to update order status.']);
    exit;
}

if($action === 'delete_order'){
    $order_id = $input['order_id'];
    $query = 'DELETE FROM orders WHERE id = $1';
    $result = pg_query_params($dbconn, $query, [$order_id]);
    echo json_encode(['status' => $result ? 'success' : 'error', 'message' => $result ? 'Order deleted.' : 'Failed to delete order.']);
    exit;
}

if($action === 'archive_and_clear') {
    pg_query($dbconn, 'INSERT INTO order_history (original_order_id, customer_email, order_summary, total_price, phone, location) SELECT id, customer_email, order_summary, total_price, phone, location FROM orders');
    $result = pg_query($dbconn, 'DELETE FROM orders');
    echo json_encode(['status' => $result ? 'success' : 'error', 'message' => $result ? 'Orders archived and cleared.' : 'Failed to archive and clear orders.']);
    exit;
}

if ($action === 'get_history') {
    $result = pg_query($dbconn, "SELECT * FROM order_history ORDER BY archived_at DESC");
    $history = [];
    while ($row = pg_fetch_assoc($result)) {
        $history[] = $row;
    }
    echo json_encode(['status' => 'success', 'history' => $history]);
    exit;
}
?>