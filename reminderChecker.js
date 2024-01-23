const express = require('express');
const checker = require('./services/reminderService');

const router = express.Router();

// Reminder Checker endpoint
router.get('/reminderChecker', async (req, res) => {
    try {
        console.log("Reminder Check Initiated;")
        reminderService.checkAndProcessReminders();
    } catch (error) {
        console.error('Error in Reminder Checker:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;