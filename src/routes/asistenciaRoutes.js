const express = require('express');
const router = express.Router();
const asistenciaController = require('../controllers/asistenciaController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.get('/asistencia-individual/nombre/:nombre', asistenciaController.obtenerAsistenciaPorNombre);
router.get('/informes/reuniones', verificarToken, asistenciaController.obtenerReuniones);
router.get('/informes/semanal', verificarToken, asistenciaController.obtenerInformeSemanal);

module.exports = router;