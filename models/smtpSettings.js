const db = require('../db');

const createSmtpSettingsTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS SmtpSettings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            host TEXT NOT NULL,
            port INTEGER NOT NULL,
            username TEXT NOT NULL,
            password TEXT NOT NULL,
            secure BOOLEAN NOT NULL,
            from_email TEXT NOT NULL,
            from_name TEXT NOT NULL
        );
    `;

    db.run(query);
};

createSmtpSettingsTable();

module.exports = {
    getSmtpSettings: (callback) => {
        const query = 'SELECT * FROM SmtpSettings where id = (SELECT MAX(id) FROM SmtpSettings);';
        db.get(query, callback);
    },

    getSmtpSettingsById: (id, callback) => {
        const query = 'SELECT * FROM SmtpSettings WHERE id = ?;';
        db.get(query, [id], callback);
    },
    
    setSmtpSettings: (smtpSettings, callback) => {
        const query = `
            INSERT INTO SmtpSettings (host, port, username, password, secure, from_email, from_name)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id)
            DO UPDATE SET host=excluded.host, port=excluded.port, username=excluded.username,
                         password=excluded.password, secure=excluded.secure, from_email=excluded.from_email,
                         from_name=excluded.from_name;
        `;
        const { host, port, username, password, secure, from_email, from_name } = smtpSettings;
        db.run(query, [host, port, username, password, secure, from_email, from_name], function (err) {
            if (err) {
                callback(err);
                return;
            }
            const insertedSettingsId = this.lastID;
            module.exports.getSmtpSettingsById(insertedSettingsId, callback);
        });
    },

    // Add more SMTP settings-related functions as needed
};
