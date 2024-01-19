const db = require('../db');

const createUserTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS Users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            password TEXT NOT NULL,
            email TEXT NOT NULL
        );
    `;

    db.run(query);
};

createUserTable();

module.exports = {
    getAllUsers: (callback) => {
        const query = 'SELECT `id`,`username`,`email` FROM Users;';
        db.all(query, callback);
    },

    getUserById: (id, callback) => {
        const query = 'SELECT * FROM Users WHERE id = ?;';
        db.get(query, [id], callback);
    },

    registerUser: (userData, callback) => {
        const query = 'INSERT INTO Users (username, password, email) VALUES (?, ?, ?);';
        const { username, password, email } = userData;
        db.run(query, [username, password, email], function (err) {
            if (err) {
                callback(err);
                return;
            }
            const insertedUserId = this.lastID;
            module.exports.getUserById(insertedUserId, callback);
        });
    },

    loginUser: (username, password, callback) => {
        const query = 'SELECT * FROM Users WHERE username = ? AND password = ?;';
        db.get(query, [username, password], callback);
    },
    
    getUserEmailById: (userId, callback) => {
        const query = 'SELECT email FROM Users WHERE id = ?;';
        db.get(query, [userId], callback);
    },

    // Add more user-related functions as needed
};