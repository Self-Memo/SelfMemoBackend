const express = require('express');
const reminder = require('./models/reminder');
const emailService = require('./services/emailService');

const router = express.Router();

// Reminder Checker endpoint
router.get('/reminderChecker', async (req, res) => {
    try {
        // Get all expired reminders
        const expiredReminders = await reminder.getExpiredReminders();

        // Process each expired reminder
        for (const expiredReminder of expiredReminders) {
            // Get user email by user_id
            const userId = expiredReminder.user_id;
            const user = await reminder.getUserEmailById(userId);

            // Send email using emailService
            const recipientEmail = user.email;
            const emailSubject = expiredReminder.subject;
            const emailText = expiredReminder.description || ''; // Use description if available

            await emailService.sendEmail(recipientEmail, emailSubject, emailText);
        }

        res.json({ message: 'Reminder Checker executed successfully.' });
    } catch (error) {
        console.error('Error in Reminder Checker:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;