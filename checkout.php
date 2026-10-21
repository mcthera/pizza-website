<?php
    require_once 'db.php';

    header('Content-Type: application/json');

    if($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);

        $email    = trim($input['email'] ?? 'guest@manupizza.com');
        $phone    = trim($input['phone'] ?? '0597787700');
        $location = trim($input['location'] ?? 'Kumasi');
        $cart     = $input['cart'] ?? [];
        $total    = $input['total'] ?? 0;

        if(empty($cart) || $total <= 0) {
            echo json_encode(['status' => 'error', 'message' => 'Cart is empty or total is invalid.']);
            exit;
        }

        $summary_parts = [];
        foreach($cart as $item) {
            $summary_parts[] = $item['title'] . ' (x ' . $item['quantity'] . ')';
        }
        $summary = implode(', ', $summary_parts);

        // Matches database columns: phone & location
        $query = "INSERT INTO orders (customer_email, order_summary, total_price, phone, location, status) VALUES ($1, $2, $3, $4, $5, 'Pending')";
        $result = pg_query_params($dbconn, $query, [$email, $summary, $total, $phone, $location]);

        if($result) {
            echo json_encode(['status' => 'success', 'message' => 'Order placed successfully.']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to place order.']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
    }
?>