<?php

require_once '../db/reminders.php';
require_once '../db/smtp_settings.php';
require_once '../email/PHPMailer.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once '../email/Exception.php';
require_once '../email/PHPMailer.php';
require_once '../email/SMTP.php';

header("Content-Type: application/json");

function sendReminderEmail($reminder)
{
    $smtpSettings = SmtpSettings::getSmtpSettings();

    $mail = new PHPMailer(true);
    
    try {
        // Server settings
        $mail->isSMTP();
        $mail->Host       = $smtpSettings['host'];
        $mail->SMTPAuth   = true;
        $mail->Username   = $smtpSettings['username'];
        $mail->Password   = $smtpSettings['password'];
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // Adjust as needed
        $mail->Port       = $smtpSettings['port'];

        // Sender information
        $mail->setFrom($smtpSettings['from_email'], $smtpSettings['from_name']);
        // Recipient information
        $mail->addAddress($reminder['user']); // Assuming 'user' is the email address of the user

        // Email content
        $mail->isHTML(true);
        $mail->Subject = 'Reminder: ' . $reminder['type'];
        $mail->Body    = 'Description: ' . $reminder['description'];

        // Send the email
        $mail->send();

        // Update the reminder status or perform any other actions
        return true;
    } catch (Exception $e) {
        // Handle email sending failure
        throw $e;
        return false;
    }
}

function checkAndSendEmailReminders()
{
    $reminders = Reminders::getExpiredReminders();

    foreach ($reminders as $reminder) {
        $expirationDate = $reminder['expiration_date'];
        
        $success = sendReminderEmail($reminder);
        
        if ($success)
        {
            if ($reminder['type'] === "once")
                Reminders::deleteReminder($reminder["id"]);
            else {
                switch($reminder['type']) {
                    case "daily": $reminder['expiration_date'] = $expirationDate->modify('+1 day'); break;
                    case "weekly": $reminder['expiration_date'] = $expirationDate->modify('+1 week'); break;
                    case "monthly": $reminder['expiration_date'] = $expirationDate->modify('+1 month'); break;
                    case "yearly": $reminder['expiration_date'] = $expirationDate->modify('+1 year'); break;
                }
                Reminders::updateReminder($reminder["id"],$reminder["user"],$reminder["type"],$reminder["description"],$reminder["expirationDate"]);
            }
        }
    }
}

// API endpoint for checking and sending email reminders
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    checkAndSendEmailReminders();
    echo json_encode(['message' => 'Email reminders checked and sent']);
} else {
    echo json_encode(['error' => 'Invalid request method']);
}

