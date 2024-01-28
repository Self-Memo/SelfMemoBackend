const reminder = require('../models/reminder');
const emailService = require('./emailService');
const user = require('../models/user');


const checkAndProcessReminders = async () => {
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
                            calculateNextExecution(expiredReminder, true); 
                            console.log(`Email sent to ${recipientEmail}`);
                        })
                        .catch((emailError) => {
                            console.error('Error sending email:', emailError);
                        });
                });                          
            }
        });
    } catch (error) {
        console.error('Error checking and processing reminders:', error.message);
    }
};

const calculateNextExecution = (currentReminder, afterExecution) => {
    switch (currentReminder.type) {
        case 0:
            console.log("Calculating Once");
            if (afterExecution) {
                currentReminder.deleteReminder(currentReminder.id, (err) => {
                    if (err) {
                        console.error('Error deleting reminder:', err.message);
                    } else {
                        console.log('Reminder deleted successfully.');
                    }
                });
            }
            else{
            // check  
            }
            break;
        case 1:
            console.log("Calculating Daily");
            const currentDay = moment().day();
            let nextDay = currentDay;
            while ((currentReminder.weekbitmask & (1 << nextDay)) === 0) {
                nextDay = (nextDay + 1) % 7;
            }
            const nextExecution = moment()
                .day(nextDay)
                .set({
                    hour: currentReminder.hour,
                    minute: currentReminder.minute,
                    second: 0,
                    millisecond: 0,
                });

            if (nextExecution.isBefore(moment())) {
                nextExecution.add(1, 'week');
            }
            currentReminder.nextExecution = nextExecution.format('YYYY-MM-DD HH:mm:ss')
            reminder.updateReminder(currentReminder);
            break;
        case 2:
            console.log("Calculating Weekly");
            currentReminder.nextExecution = currentReminder.nextExecution.add(1, 'week')
            reminder.updateReminder(currentReminder);
            break;
        case 3:
            console.log("Calculating Monthly");
            currentReminder.nextExecution = currentReminder.nextExecution.add(1, 'month')
            reminder.updateReminder(currentReminder);
            break;            
        case 4:
            console.log("Calculating Yearly");
            currentReminder.nextExecution = currentReminder.nextExecution.add(1, 'year')
            reminder.updateReminder(currentReminder);
            break;

        default:
            return currentReminder.nextExecution;
    }
};

module.exports = {
    checkAndProcessReminders,
    calculateNextExecution,
};
