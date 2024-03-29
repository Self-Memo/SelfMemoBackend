const reminder = require('../models/reminder');
const emailService = require('./emailService');
const user = require('../models/user');
const moment = require('moment');


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
                    const emailText = expiredReminder.additionalNotes || '';
    
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
    var currentDay = moment().day();
    let nextDay = 1 << (currentDay);
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

            while ((currentReminder.daysOfWeekBitMask & nextDay) === 0) {
                currentDay = (currentDay + 1) % 7
                nextDay = nextDay << 1;
            }
            const nextWeeklyExecution = moment()
            .set({
                'day': currentDay,
                'hour': currentReminder.hour,
                'minute': currentReminder.minute,
                'second': 0
            });

            if (nextWeeklyExecution.isBefore(moment())) {
                nextWeeklyExecution.add(1, 'week');
            }
            currentReminder.nextEvent = nextWeeklyExecution.utc().format('YYYY-MM-DD HH:mm:ss')
            reminder.updateReminder(currentReminder.id, currentReminder);
            break;
        case 2:
            console.log("ReCalculating Weekly");
            currentReminder.nextEvent = moment().utc(currentReminder.nextEvent).add(1, 'week').format('YYYY-MM-DD HH:mm:ss')
            reminder.updateReminder(currentReminder.id, currentReminder);
            break;
        case 3:
            console.log("ReCalculating Monthly");
            currentReminder.nextEvent = moment().utc(currentReminder.nextEvent).add(1, 'month').format('YYYY-MM-DD HH:mm:ss')
            reminder.updateReminder(currentReminder.id, currentReminder);
            break;            
        case 4:
            console.log("ReCalculating Yearly");
            currentReminder.nextEvent = moment().utc(currentReminder.nextEvent).add(1, 'year').format('YYYY-MM-DD HH:mm:ss')
            reminder.updateReminder(currentReminder.id, currentReminder);
            break;

        default:
            return currentReminder.nextEvent;
    }
};

const calculateInitialExecution = (currentReminder) => {
    var currentDay = moment().day();
    let nextDay = 1 << (currentDay);
    switch (currentReminder.type) {
        case 1:
            console.log("Calculating Initial Daily");

            while ((currentReminder.daysOfWeekBitMask & nextDay) === 0) {
                currentDay = (currentDay + 1) % 7
                nextDay = nextDay << 1;
            }
            const nextEvent = moment()
            .set({
                'day': currentDay,
                'hour': currentReminder.hour,
                'minute': currentReminder.minute,
                'second': 0
            });

            if (nextEvent.isBefore(moment())) {
                nextEvent.add(1, 'day');
            }
            currentReminder.nextEvent = nextEvent.utc().format('YYYY-MM-DD HH:mm:ss')
            reminder.updateReminder(currentReminder.id,currentReminder);
            break;
        case 2:
            console.log("Calculating Initial Weekly");

            while ((currentReminder.daysOfWeekBitMask & nextDay) === 0) {
                currentDay = (currentDay + 1) % 7
                nextDay = nextDay << 1;
            }
            const nextWeeklyExecution = moment()
            .set({
                'day': currentDay,
                'hour': currentReminder.hour,
                'minute': currentReminder.minute,
                'second': 0
            });
            if (nextWeeklyExecution.isBefore(moment())) {
                nextWeeklyExecution.add(1, 'week');
            }
            currentReminder.nextEvent = nextWeeklyExecution.utc().format('YYYY-MM-DD HH:mm:ss')
            reminder.updateReminder(currentReminder.id, currentReminder);
            break;
        case 3:
            console.log("Calculating Initial Monthly");
            const nextMonthlyExecution = moment()
            .set({
                'date': currentReminder.dayofmonth,
                'hour': currentReminder.hour,
                'minute': currentReminder.minute,
                'second' : 0
            });
            if (nextMonthlyExecution.isBefore(moment())) {
                nextMonthlyExecution.add(1, 'month');
            }
            currentReminder.nextEvent = nextMonthlyExecution.utc().format('YYYY-MM-DD HH:mm:ss')
            console.log(currentReminder)
            reminder.updateReminder(currentReminder.id, currentReminder);
            break;
        case 4:
            console.log("Calculating Initial Yearly");
            const nextYearlyExecution = moment()
            .set({
                'month': currentReminder.month,
                'date': currentReminder.dayofmonth,
                'hour': currentReminder.hour,
                'minute': currentReminder.minute,
                'second': 0
            });
            if (nextYearlyExecution.isBefore(moment())) {
                nextYearlyExecution.add(1, 'year');
            }
            currentReminder.nextEvent = nextYearlyExecution.utc().format('YYYY-MM-DD HH:mm:ss')
            reminder.updateReminder(currentReminder.id, currentReminder);
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
