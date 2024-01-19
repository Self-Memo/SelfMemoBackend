const express = require('express');
const smtpSettings = require('./models/smtpSettings');

const router = express.Router();

// Get SMTP server settings
router.get('/', (req, res) => {
    smtpSettings.getSmtpSettings((err, settings) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ smtpSettings: settings });
    });
});

// Set SMTP server settings
router.post('/', (req, res) => {
    const newSmtpSettings = req.body;
    smtpSettings.setSmtpSettings(newSmtpSettings, (err, insertedSettings) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ smtpSettings: insertedSettings });
    });
});

module.exports = router;