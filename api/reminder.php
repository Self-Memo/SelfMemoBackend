<?php

require_once '../db/reminders.php';

header("Content-Type: application/json");


// -------
// GET
// -------
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['action'])) {
        $action = $_GET['action'];
        switch ($action) {
            case 'get_all':
                $reminders = Reminders::getAllReminders();
                echo json_encode($reminders);
                break;

            case 'get':
                if (isset($_GET['id'])) {
                    $id = $_GET['id'];
                    $reminder = Reminders::getReminderById($id);
                    echo json_encode($reminder);
                } else {
                    echo json_encode(['error' => 'Missing ID parameter']);
                }
                break;

            // Add more cases for other actions if needed

            default:
                echo json_encode(['error' => 'Invalid action']);
                break;
        }
    } else {
        echo json_encode(['error' => 'Missing action parameter']);
    }
// -------
// POST
// -------
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (isset($data['user'], $data['type'], $data['description'], $data['expiration_date'])) {
        $user = $data['user'];
        $type = $data['type'];
        $description = $data['description'];
        $expirationDate = $data['expiration_date'];
        $success = Reminders::createReminder($user, $type, $description, $expirationDate);
        echo json_encode(['success' => $success]);
    } else {
        echo json_encode(['error' => 'Missing parameters']);
    }
// -------
// PATCH
// -------
} elseif ($_SERVER['REQUEST_METHOD'] === 'PATCH') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (isset($data['id'], $data['user'], $data['type'], $data['description'], $data['expiration_date'])) {
        $id = $data['id'];
        $user = $data['user'];
        $type = $data['type'];
        $description = $data['description'];
        $expirationDate = $data['expiration_date'];
        $success = Reminders::updateReminder($id, $user, $type, $description, $expirationDate);
        echo json_encode(['success' => $success]);
    } else {
        echo json_encode(['error' => 'Missing parameters']);
    }
} 
// -------
// DELETE
// -------
elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"), true);
    // Check for required parameters
    if (isset($data['id'])) {
        $id = $data['id'];
        $success = Reminders::deleteReminder($id);
        echo json_encode(['success' => $success]);
    } else {
        echo json_encode(['error' => 'Missing parameters']);
    }
} else {
    echo json_encode(['error' => 'Invalid request method']);
}