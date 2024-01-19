<?php

require_once 'database.php';

class SmtpSettings
{
    public static function getSmtpSettings()
    {
        global $db;
        $stmt = $db->prepare("SELECT * FROM smtp_settings");
        $result = $stmt->execute();
        return $result->fetchArray(SQLITE3_ASSOC);
    }

    public static function updateSmtpSettings($host, $port, $username, $password, $fromEmail, $fromName)
    {
        global $db;

        $stmt = $db->prepare("SELECT * FROM smtp_settings WHERE `id` = 1");
        $result = $stmt->execute();
        $rows = $result->fetchArray();
        if ($rows['count'] == 0) {
            $stmt = $db->prepare("INSERT INTO smtp_settings(`host`,`port`,`username`,`password`,`from_email`,`from_name`) VALUES ('',0,'','','','')");
            $stmt->execute();
        }

        $stmt = $db->prepare("UPDATE smtp_settings SET host = :host, port = :port, username = :username, password = :password, from_email = :from_email, from_name = :from_name WHERE id = 1");
        $stmt->bindValue(':host', $host, SQLITE3_TEXT);
        $stmt->bindValue(':port', $port, SQLITE3_INTEGER);
        $stmt->bindValue(':username', $username, SQLITE3_TEXT);
        $stmt->bindValue(':password', $password, SQLITE3_TEXT);
        $stmt->bindValue(':from_email', $fromEmail, SQLITE3_TEXT);
        $stmt->bindValue(':from_name', $fromName, SQLITE3_TEXT);
        $stmt->execute();
        return $db->changes() > 0;
    }
}