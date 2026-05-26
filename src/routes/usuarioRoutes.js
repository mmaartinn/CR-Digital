const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { verificarToken } = require('../middlewares/authMiddleware');

// Ruta POST protegida para crear usuarios
router.post('/crear', verificarToken, usuarioController.crearUsuario);

module.exports = router;