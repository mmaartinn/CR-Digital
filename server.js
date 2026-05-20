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
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


// --- RUTAS DE CONSULTA DIRECTA OPTIMIZADAS ---

app.get('/api/jovenes', async (req, res) => {
    try {
        const jovenes = await prisma.$queryRawUnsafe(`
            SELECT "idExcel", nombre, rut FROM "Joven";
        `);
        res.json(jovenes);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener jóvenes", detalle: error.message });
    }
});

app.get('/api/asistencias', async (req, res) => {
    try {
        const resultado = await prisma.$queryRawUnsafe(`
            SELECT COUNT(*)::int as total FROM "Asistencia";
        `);
        res.json({ length: resultado[0].total });
    } catch (error) {
        res.status(500).json({ error: "Error al obtener asistencias", detalle: error.message });
    }
});

app.get('/api/reuniones', async (req, res) => {
    try {
        const resultado = await prisma.$queryRawUnsafe(`
            SELECT COUNT(*)::int as total FROM "Reunion";
        `);
        res.json({ length: resultado[0].total });
    } catch (error) {
        res.status(500).json({ error: "Error al obtener reuniones", detalle: error.message });
    }
});

// NUEVA API: Obtiene la matriz de asistencia filtrando por NOMBRE parcial e incluye datos extendidos y ministerios
app.get('/api/asistencia-individual/nombre/:nombre', async (req, res) => {
    try {
        const { nombre } = req.params;

        // Query robusta unificada: une Ficha, Grupo y concatena Ministerios agrupando explícitamente todos los campos nativos
        const jovenes = await prisma.$queryRawUnsafe(`
            SELECT 
                j.id,
                j.nombre,
                j.rut,
                j.telefono,
                j.estudio,
                g.descripcion AS "edad_grupo",
                COALESCE(string_agg(m.nombre, ', '), 'Sin Ministerio') AS "ministerios_activos"
            FROM "Joven" j
            LEFT JOIN "Grupo" g ON j."grupoId" = g.id
            LEFT JOIN "JovenMinisterio" jm ON j.id = jm."jovenId"
            LEFT JOIN "Ministerio" m ON jm."ministerioId" = m.id
            WHERE j.nombre ILIKE $1
            GROUP BY j.id, j.nombre, j.rut, j.telefono, j.estudio, g.descripcion;
        `, `%${nombre.trim()}%`);

        if (!jovenes || jovenes.length === 0) {
            return res.status(404).json({ error: "Ningún joven coincide con ese nombre." });
        }
        
        // Tomamos el primer resultado que calce
        const joven = jovenes[0];

        // Traer las reuniones cronológicamente desde la tabla "Reunion"
        const reuniones = await prisma.$queryRawUnsafe(`
            SELECT id, fecha FROM "Reunion" ORDER BY fecha ASC;
        `);

        // Traer las asistencias de este joven
        const asistencias = await prisma.$queryRawUnsafe(`
            SELECT "reunionId" FROM "Asistencia" WHERE "jovenId" = $1;
        `, joven.id);

        // Envío exacto en estructura plural esperada por el JavaScript del Front
        res.json({
            joven,
            reuniones,
            asistencias: asistencias.map(a => a.reunionId)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/grupos', async (req, res) => {
    try {
        const grupos = await prisma.$queryRawUnsafe(`
            SELECT * FROM "Grupo" ORDER BY numero ASC;
        `);
        res.json(grupos);
    } catch (error) {
        res.status(500).json({ error: "Error al cargar los grupos" });
    }
});

app.post('/api/grupos', async (req, res) => {
    try {
        const { numero, descripcion } = req.body;
        const nuevoGrupo = await prisma.grupo.create({
            data: { numero, descripcion }
        });
        res.json(nuevoGrupo);
    } catch (error) {
        res.status(500).json({ error: "Error al guardar el grupo" });
    }
});

// --- INICIAR SERVIDOR ---
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});