const express = require('express');
const path = require('path');
require('dotenv').config(); // Carga las variables de tu archivo .env

// Configuración de Prisma v7.8.0
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Iniciar Express
const app = express();

// --- MIDDLEWARES ---
// Le permite al servidor leer datos en formato JSON
app.use(express.json());
// Le dice al servidor que muestre el index.html cuando alguien entre a la raíz "/"
app.use(express.static(path.join(__dirname, 'public')));


// --- RUTAS ---

// Ruta GET: Para leer los datos (Equivalente a index)
app.get('/api/grupos', async (req, res) => {
    try {
        // Busca todos los grupos en PostgreSQL ordenados por número
        const grupos = await prisma.grupo.findMany({
            orderBy: { numero: 'asc' }
        });
        res.json(grupos);
    } catch (error) {
        res.status(500).json({ error: "Error al cargar los grupos" });
    }
});

// Ruta POST: Para crear datos (Equivalente a create)
app.post('/api/grupos', async (req, res) => {
    try {
        const { numero, descripcion } = req.body;
        const nuevoGrupo = await prisma.grupo.create({
            data: { 
                numero: numero, 
                descripcion: descripcion 
            }
        });
        res.json(nuevoGrupo);
    } catch (error) {
        res.status(500).json({ error: "Error al guardar el grupo" });
    }
});


// --- INICIAR SERVIDOR ---
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor y página web corriendo en http://localhost:${PORT}`);
});