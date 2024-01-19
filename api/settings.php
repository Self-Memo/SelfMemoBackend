<?php

require_once '../db/smtp_settings.php';

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['action']) && $_GET['action'] === 'get_smtp_settings') {
        $smtpSettings = SmtpSettings::getSmtpSettings();
        echo json_encode(['smtp_settings' => $smtpSettings]);
    } else {
        echo json_encode(['error' => 'Invalid action']);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (isset($data['host'], $data['port'], $data['username'], $data['password'], $data['from_email'], $data['from_name'])) {
        $host = $data['host'];
        $port = $data['port'];
        $username = $data['username'];
        $password = $data['password'];
        $fromEmail = $data['from_email'];
        $fromName = $data['from_name'];
        $success = SmtpSettings::updateSmtpSettings($host, $port, $username, $password, $fromEmail, $fromName);
        echo json_encode(['success' => $success]);
    } else {
        echo json_encode(['error' => 'Missing parameters']);
    }
} else {
    echo json_encode(['error' => 'Invalid request method']);
}