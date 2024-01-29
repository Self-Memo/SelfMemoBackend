const db = require('../db');
const moment = require('moment');

const createReminderTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS Reminders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            type INTEGER,
            daysOfWeekBitMask INTEGER,
            month INTEGER,
            dayofmonth INTEGER,
            hour INTEGER,
            minute INTEGER,
            subject TEXT NOT NULL,
            additionalNotes TEXT,
            nextEvent TEXT,
            active INTEGER,
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

    getReminderByUserId: (id, callback) => {
        const query = 'SELECT * FROM Reminders WHERE user_id = ?;';
        db.all(query, [id], callback);
    },

    createReminder: (reminderData, callback) => {
        const query = `
            INSERT INTO Reminders
            (user_id, type, daysOfWeekBitMask, month, dayofmonth, hour, minute, subject, additionalNotes, nextEvent, active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
        const { user_id, type, daysOfWeekBitMask, month, dayofmonth, hour, minute, subject, additionalNotes, nextEvent, active } = reminderData;
        db.run(query, [user_id, type, daysOfWeekBitMask, month, dayofmonth, hour, minute, subject, additionalNotes, nextEvent, active], function (err) {
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
            SET user_id = ?, type = ?, daysOfWeekBitMask = ?, month = ?, dayofmonth = ?, hour = ?, minute = ?,
                subject = ?, additionalNotes = ?, nextEvent = ?, active = ?
            WHERE id = ?;
        `;
        const { user_id, type, daysOfWeekBitMask, month, dayofmonth, hour, minute, subject, additionalNotes, nextEvent, active } = updatedData;
        db.run(query, [user_id, type, daysOfWeekBitMask, month, dayofmonth, hour, minute, subject, additionalNotes, nextEvent, active, id], function (err) {
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
        const currentDateTime = moment().utc().format('YYYY-MM-DD HH:mm:ss');
        console.log(currentDateTime);
        const query = 'SELECT * FROM Reminders WHERE nextEvent <= ?;';
        db.all(query, [currentDateTime], callback);
    },

    // Add more reminder-related functions as needed
};