const express = require('express');
const bodyParser = require('body-parser');
const remindersRoutes = require('./reminders_api'); 
const userRoutes = require('./users_api'); 
const smtpSettingsRoutes = require('./smtpSettings_api');
const reminderCheckerRoutes = require('./reminderChecker');
const cors = require('cors')
const cron = require('node-cron');
const http = require('http');

const app = express();
const PORT = 8000;

app.use(cors())

app.use(bodyParser.json());

// Your other routes (e.g., user routes) can go here

// Use the remindersRoutes for all routes starting with '/api/reminders'
app.use('/api/reminders', remindersRoutes);

// Use the userRoutes for all routes starting with '/api/users'
app.use('/api/users', userRoutes);

// Use the smtpSettingsRoutes for all routes starting with '/api/smtpsettings'
app.use('/api/smtpsettings', smtpSettingsRoutes);

// Use the reminderCheckerRoutes for the '/reminderChecker' endpoint
app.use('/api', reminderCheckerRoutes);

const cronOptions = {
    hostname: 'localhost',
    port: 8000,
    path: '/api/reminders/reminderCheck',
    method: 'GET',
};

cron.schedule('* * * * *', async () => {

    const req = http.request(cronOptions, () => {});
    req.on('error', (error) => {
        console.error('Error executing reminder check:', error.message);
    });
    req.end();
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});