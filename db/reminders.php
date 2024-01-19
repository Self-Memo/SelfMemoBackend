<?php

require('database.php');

class Reminders
{
    // ... (existing functions)

    public static function getAllReminders()
    {
        global $db;
        $stmt = $db->prepare("SELECT * FROM reminders");
        $result = $stmt->execute();

        $reminders = [];
        while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
            $reminders[] = $row;
        }

        return $reminders;
    }

    public static function getExpiredReminders()
    {
        global $db;

        // Get the current date and time in the format used in the database
        $currentDateTime = date('Y-m-d H:i:s');

        // Query for all reminders where the expiration_date is in the past
        $stmt = $db->prepare("SELECT * FROM reminders WHERE expiration_date < :current_date");
        $stmt->bindValue(':current_date', $currentDateTime, SQLITE3_TEXT);
        
        $result = $stmt->execute();

        $expiredReminders = array();
        while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
            $expiredReminders[] = $row;
        }

        return $expiredReminders;
    }

    public static function getReminderById($id)
    {
        global $db;
        $stmt = $db->prepare("SELECT * FROM reminders WHERE id = :id");
        $stmt->bindValue(':id', $id, SQLITE3_INTEGER);
        $result = $stmt->execute();
        return $result->fetchArray(SQLITE3_ASSOC);
    }

    public static function createReminder($user, $type, $description, $expirationDate)
    {
        global $db;
        $stmt = $db->prepare("INSERT INTO reminders (user, type, description, expiration_date) VALUES (:user, :type, :description, :expiration_date)");
        $stmt->bindValue(':user', $user, SQLITE3_TEXT);
        $stmt->bindValue(':type', $type, SQLITE3_TEXT);
        $stmt->bindValue(':description', $description, SQLITE3_TEXT);
        $stmt->bindValue(':expiration_date', $expirationDate, SQLITE3_TEXT);
        $stmt->execute();
        return $db->changes() > 0;
    }

    public static function updateReminder($id, $user, $type, $description, $expirationDate)
    {
        global $db;
        $stmt = $db->prepare("UPDATE reminders SET user = :user, type = :type, description = :description, expiration_date = :expiration_date WHERE id = :id");
        $stmt->bindValue(':id', $id, SQLITE3_INTEGER);
        $stmt->bindValue(':user', $user, SQLITE3_TEXT);
        $stmt->bindValue(':type', $type, SQLITE3_TEXT);
        $stmt->bindValue(':description', $description, SQLITE3_TEXT);
        $stmt->bindValue(':expiration_date', $expirationDate, SQLITE3_TEXT);
        $stmt->execute();
        return $db->changes() > 0;
    }

    public static function deleteReminder($id)
    {
        global $db;
        $stmt = $db->prepare("DELETE FROM reminders WHERE id = :id");
        $stmt->bindValue(':id', $id, SQLITE3_INTEGER);
        $stmt->execute();
        return $db->changes() > 0;
    }
}