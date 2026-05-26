const express = require('express');
const router = express.Router();
const estadisticaController = require('../controllers/estadisticaController');

router.get('/jovenes', estadisticaController.obtenerJovenes);
router.get('/asistencias', estadisticaController.contarAsistencias);
router.get('/reuniones', estadisticaController.contarReuniones);
router.get('/grupos', estadisticaController.obtenerGrupos);
router.post('/grupos', estadisticaController.crearGrupo);

module.exports = router;