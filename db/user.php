<?php
require('database.php');

class Users {
    public static function createUser($username, $password) {
        global $db;
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $db->prepare("INSERT INTO users (username, password) VALUES (:username, :password)");
        $stmt->bindValue(':username', $username, SQLITE3_TEXT);
        $stmt->bindValue(':password', $hashedPassword, SQLITE3_TEXT);
        $stmt->execute();
        return $db->changes() > 0;
    }

    public static function loginUser($username, $password) {
        global $db;
        $stmt = $db->prepare("SELECT * FROM users WHERE username = :username");
        $stmt->bindValue(':username', $username, SQLITE3_TEXT);
        $result = $stmt->execute();
        $user = $result->fetchArray(SQLITE3_ASSOC);

        if ($user && password_verify($password, $user['password'])) {
            return true;
        }

        return false;
    }

}
?>

