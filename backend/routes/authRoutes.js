const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register Route
router.post('/register', authController.register);

// Login Route
router.post('/login', authController.login);
router.post('/logout', authController.logout);

router.get('/check', authController.checkAuth);

module.exports = router;

