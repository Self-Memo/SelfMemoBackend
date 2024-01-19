const express = require('express');
const reminder = require('./models/reminder');

const router = express.Router();

// Get all reminders
router.get('/', (req, res) => {
    reminder.getAllReminders((err, reminders) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ reminders });
    });
});

// Get reminder by ID
router.get('/:id', (req, res) => {
    const reminderId = req.params.id;
    reminder.getReminderById(reminderId, (err, reminderData) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!reminderData) {
            res.status(404).json({ error: 'Reminder not found' });
            return;
        }
        res.json({ reminder: reminderData });
    });
});

// Create a new reminder
router.post('/', (req, res) => {
    const newReminder = req.body;
    reminder.createReminder(newReminder, (err, insertedReminder) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ reminder: insertedReminder });
    });
});

// Update a reminder by ID
router.put('/:id', (req, res) => {
    const reminderId = req.params.id;
    const updatedReminder = req.body;
    reminder.updateReminder(reminderId, updatedReminder, (err, updatedData) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!updatedData) {
            res.status(404).json({ error: 'Reminder not found' });
            return;
        }
        res.json({ reminder: updatedData });
    });
});

// Delete a reminder by ID
router.delete('/:id', (req, res) => {
    const reminderId = req.params.id;
    reminder.deleteReminder(reminderId, (err, deletedData) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!deletedData) {
            res.status(404).json({ error: 'Reminder not found' });
            return;
        }
        res.json({ message: 'Reminder deleted successfully' });
    });
});

module.exports = router;