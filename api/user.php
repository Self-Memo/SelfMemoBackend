<?php
header("Content-Type: application/json");

require('../db/user.php');

// API endpoints
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if ($_GET['action'] === 'register') {
        $username = $data['username'];
        $password = $data['password'];
        $success = Users::createUser($username, $password);
        echo json_encode(['success' => $success]);
    } elseif ($_GET['action'] === 'login') {
        $username = $data['username'];
        $password = $data['password'];
        $loggedIn = Users::loginUser($username, $password);
        echo json_encode(['success' => $loggedIn]);
    }
}
?>
