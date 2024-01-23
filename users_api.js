const express = require('express');
const user = require('./models/user');

const router = express.Router();

// Register a new user
router.post('/register', (req, res) => {
    const newUser = req.body;
    user.registerUser(newUser, (err, insertedUser) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ user: insertedUser });
    });
});

// Get all users
router.get('/', (req, res) => {
    user.getAllUsers((err, users) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ users });
    });
});

// Login
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    user.loginUser(username, password, (err, userData) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!userData) {
            res.status(401).json({ error: 'Invalid username or password' });
            return;
        }
        res.json({ user: userData });
    });
});

router.put('/:id', (req, res) => {
    const userId = req.params.id;
    const userData = req.body;

    user.updateUser(userId, userData, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to update user' });
        }
        res.json({ message: 'User updated successfully' });
    });
});

router.delete('/:id', (req, res) => {
    const userId = req.params.id;

    user.deleteUserById(userId, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to delete user' });
        }
        res.json({ message: 'User deleted successfully' });
    });
});

module.exports = router;
