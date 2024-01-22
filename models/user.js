const db = require('../db');

const createUserTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS Users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            password TEXT NOT NULL,
            email TEXT NOT NULL,
            role INT NOT NULL
        );
    `;

    db.run(query);
};

const createAdminUser = async () => {
    const query = 'INSERT INTO Users (username, password, email, role) VALUES (?, ?, ?, ?);';
    const username = 'admin';
    const password = 'pw';
    const email = 'admin@example.com';
    const role = '0';

    console.log('Going to wait before I\'ll insert the admin user');
    await new Promise(resolve => setTimeout(resolve, 1000));
    db.run(query, [username, password, email, role]);
    console.log('Inserted the admin user');
};

createUserTable();
createAdminUser();

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
        const query = 'INSERT INTO Users (username, password, email, role) VALUES (?, ?, ?, ?);';
        const { username, password, email } = userData;
        const role = 1;
        db.run(query, [username, password, email, role], function (err) {
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