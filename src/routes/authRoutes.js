const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Ruta POST para /api/auth/login
router.post('/login', authController.login);

module.exports = router;