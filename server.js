const express = require('express');
const path = require('path');
require('dotenv').config();

// Importar rutas
const authRoutes = require('./src/routes/authRoutes');
const asistenciaRoutes = require('./src/routes/asistenciaRoutes');
const estadisticaRoutes = require('./src/routes/estadisticaRoutes');

// Iniciar Express
const app = express();

// Middlewares globales
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Registrar Rutas
app.use('/api/auth', authRoutes);          // Manejará /api/auth/login
app.use('/api', estadisticaRoutes);        // Manejará /api/jovenes, /api/grupos, etc.
app.use('/api', asistenciaRoutes);         // Manejará /api/asistencia-individual/nombre/:nombre
app.use('/api/usuarios', require('./src/routes/usuarioRoutes'));

// Iniciar Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});