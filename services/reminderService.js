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
                            calculateNextExecution(expiredReminder); 
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

const calculateNextExecution = (currentReminder) => {
    switch (currentReminder.type) {
        case 0:
            console.log("Deleting Once");
            reminder.deleteReminder(currentReminder.id, (err) => {
                if (err) {
                    console.error('Error deleting reminder:', err.message);
                } else {
                    console.log('Reminder deleted successfully.');
                }
            });
            break;
        case 1:
            console.log("ReCalculating Daily");
            currentReminder.nextExecution = currentReminder.nextExecution.add(1, 'day')
            reminder.updateReminder(currentReminder);
            break;
        case 2:
            console.log("ReCalculating Weekly");
            const currentDay = moment().utc().day();
            let nextDay = currentDay;
            while ((currentReminder.weekbitmask & (1 << nextDay)) === 0) {
                nextDay = (nextDay + 1) % 7;
            }
            const nextExecution = moment().utc()
                .day(nextDay)
                .set({
                    hour: currentReminder.hour,
                    minute: currentReminder.minute,
                    second: 0,
                    millisecond: 0,
                });

            if (nextExecution.isBefore(moment().utc())) {
                nextExecution.add(1, 'week');
            }
            currentReminder.nextExecution = nextExecution.format('YYYY-MM-DD HH:mm:ss')
            reminder.updateReminder(currentReminder);
            break;
        case 3:
            console.log("ReCalculating Monthly");
            currentReminder.nextExecution = currentReminder.nextExecution.add(1, 'month')
            reminder.updateReminder(currentReminder);
            break;            
        case 4:
            console.log("ReCalculating Yearly");
            currentReminder.nextExecution = currentReminder.nextExecution.add(1, 'year')
            reminder.updateReminder(currentReminder);
            break;

        default:
            return currentReminder.nextExecution;
    }
};

const calculateInitialExecution = (currentReminder) => {
    switch (currentReminder.type) {
        case 1:
            console.log("Calculating Initial Daily");
            const nextExecution = moment().utc()
                .set({
                    hour: currentReminder.hour,
                    minute: currentReminder.minute,
                    second: 0,
                    millisecond: 0,
                });

            if (nextExecution.isBefore(moment().utc())) {
                nextExecution.add(1, 'day');
            }
            currentReminder.nextExecution = nextExecution.format('YYYY-MM-DD HH:mm:ss')
            reminder.updateReminder(currentReminder);
            break;
        case 2:
            console.log("Calculating Initial Weekly");
            const currentDay = moment().utc().day();
            let nextDay = currentDay;
            while ((currentReminder.weekbitmask & (1 << nextDay)) === 0) {
                nextDay = (nextDay + 1) % 7;
            }
            const nextWeeklyExecution = moment().utc()
            .day(nextDay)
            .set({
                hour: currentReminder.hour,
                minute: currentReminder.minute,
                second: 0,
                millisecond: 0,
            });
            if (nextWeeklyExecution.isBefore(moment().utc())) {
                nextWeeklyExecution.add(1, 'week');
            }
            currentReminder.nextExecution = nextWeeklyExecution.format('YYYY-MM-DD HH:mm:ss')
            reminder.updateReminder(currentReminder);
            break;
        case 3:
            console.log("Calculating Initial Monthly");
            const nextMonthlyExecution = moment().utc()
            .day(currentReminder.dayOfMonth)
            .set({
                hour: currentReminder.hour,
                minute: currentReminder.minute,
                second: 0,
                millisecond: 0,
            });
            if (nextMonthlyExecution.isBefore(moment().utc())) {
                nextMonthlyExecution.add(1, 'month');
            }
            currentReminder.nextExecution = nextMonthlyExecution.format('YYYY-MM-DD HH:mm:ss')
            reminder.updateReminder(currentReminder);
            break;           
        case 4:
            console.log("Calculating Initial Yearly");
            const nextYearlyExecution = moment().utc()
            .month(currentReminder.month)
            .day(currentReminder.dayOfMonth)
            .set({
                hour: currentReminder.hour,
                minute: currentReminder.minute,
                second: 0,
                millisecond: 0,
            });
            if (nextYearlyExecution.isBefore(moment().utc())) {
                nextYearlyExecution.add(1, 'year');
            }
            currentReminder.nextExecution = nextYearlyExecution.format('YYYY-MM-DD HH:mm:ss')
            reminder.updateReminder(currentReminder);
            break;  
        default:
            break;
    }
};

module.exports = {
    checkAndProcessReminders,
    calculateNextExecution,
    calculateInitialExecution,
};
