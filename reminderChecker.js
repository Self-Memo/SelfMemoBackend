const express = require('express');
const reminder = require('./models/reminder');
const emailService = require('./services/emailService');
const user = require('./models/user');

const router = express.Router();

// Reminder Checker endpoint
router.get('/reminderChecker', async (req, res) => {
    try {
        // Get all expired reminders
        reminder.getExpiredReminders((err, expiredReminders) => {
            if (err) {
                console.error('Error fetching expired reminders:', err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }

            // Process each expired reminder
            for (const expiredReminder of expiredReminders) {
                // Get user email by user_id
                const userId = expiredReminder.user_id;
                var success = false;
                user.getUserById(userId, (err, userData) => {
                    if (err) {
                        console.error('Error fetching user data:', err);
                        return;
                    }

                    const recipientEmail = userData.email;

                    // Send email using emailService
                    const emailSubject = expiredReminder.subject;
                    const emailText = expiredReminder.description || '';

                    emailService.sendEmail(recipientEmail, emailSubject, emailText)
                        .then(() => {
                            success = true;
                            console.log(`Email sent to ${recipientEmail}`);
                        })
                        .catch((emailError) => {
                            console.error('Error sending email:', emailError);
                        });
                });

                if (success) {
                    switch(reminder.type) {
                        case "once": 
                            reminder.deleteReminder(reminder.id, (err) => {
                                if (err) {
                                    console.error('Error deleting reminder:', err.message);
                                } else {
                                    console.log('Reminder deleted successfully.');
                                }
                            });
                            break;
                        default: break;
                    }
                }
                
            }

            res.json({ message: 'Reminder Checker executed successfully.' });
        });
    } catch (error) {
        console.error('Error in Reminder Checker:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;