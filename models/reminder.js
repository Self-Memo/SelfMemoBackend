const db = require('../db');
const moment = require('moment');

const createReminderTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS Reminders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            type TEXT NOT NULL,
            weekbitmask INTEGER,
            month INTEGER,
            dayofmonth INTEGER,
            hour INTEGER,
            minute INTEGER,
            subject TEXT NOT NULL,
            description TEXT,
            nextExecution TEXT,
            FOREIGN KEY (user_id) REFERENCES Users (id)
        );
    `;

    db.run(query);
};

createReminderTable();

module.exports = {
    getAllReminders: (callback) => {
        const query = 'SELECT * FROM Reminders;';
        db.all(query, callback);
    },

    getReminderById: (id, callback) => {
        const query = 'SELECT * FROM Reminders WHERE id = ?;';
        db.get(query, [id], callback);
    },

    createReminder: (reminderData, callback) => {
        const query = `
            INSERT INTO Reminders
            (user_id, type, weekbitmask, month, dayofmonth, hour, minute, subject, description, nextExecution)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
        const { user_id, type, weekbitmask, month, dayofmonth, hour, minute, subject, description, nextExecution } = reminderData;
        db.run(query, [user_id, type, weekbitmask, month, dayofmonth, hour, minute, subject, description, nextExecution], function (err) {
            if (err) {
                callback(err);
                return;
            }
            const insertedReminderId = this.lastID;
            module.exports.getReminderById(insertedReminderId, callback);
        });
    },

    updateReminder: (id, updatedData, callback) => {
        const query = `
            UPDATE Reminders
            SET user_id = ?, type = ?, weekbitmask = ?, month = ?, dayofmonth = ?, hour = ?, minute = ?,
                subject = ?, description = ?, nextExecution = ?
            WHERE id = ?;
        `;
        const { user_id, type, weekbitmask, month, dayofmonth, hour, minute, subject, description, nextExecution } = updatedData;
        db.run(query, [user_id, type, weekbitmask, month, dayofmonth, hour, minute, subject, description, nextExecution, id], function (err) {
            if (err) {
                callback(err);
                return;
            }
            module.exports.getReminderById(id, callback);
        });
    },

    deleteReminder: (id, callback) => {
        const query = 'DELETE FROM Reminders WHERE id = ?;';
        db.run(query, [id], function (err) {
            if (err) {
                callback(err);
                return;
            }
            const deletedRows = this.changes;
            if (deletedRows === 0) {
                callback(null, null);
                return;
            }
            callback(null, { id });
        });
    },

    getExpiredReminders: (callback) => {
        const currentDateTime = moment().format('YYYY-MM-DD HH:mm:ss');
        const query = 'SELECT * FROM Reminders WHERE nextExecution < ?;';
        db.all(query, [currentDateTime], callback);
    },

    // Add more reminder-related functions as needed
};