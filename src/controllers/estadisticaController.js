const prisma = require('../config/prisma');

const obtenerJovenes = async (req, res) => {
    try {
        const jovenes = await prisma.$queryRawUnsafe(`
            SELECT "idExcel", nombre, rut FROM "Joven";
        `);
        res.json(jovenes);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener jóvenes", detalle: error.message });
    }
};

const contarAsistencias = async (req, res) => {
    try {
        const resultado = await prisma.$queryRawUnsafe(`
            SELECT COUNT(*)::int as total FROM "Asistencia";
        `);
        res.json({ length: resultado[0].total });
    } catch (error) {
        res.status(500).json({ error: "Error al obtener asistencias", detalle: error.message });
    }
};

const contarReuniones = async (req, res) => {
    try {
        const resultado = await prisma.$queryRawUnsafe(`
            SELECT COUNT(*)::int as total FROM "Reunion";
        `);
        res.json({ length: resultado[0].total });
    } catch (error) {
        res.status(500).json({ error: "Error al obtener reuniones", detalle: error.message });
    }
};

const obtenerGrupos = async (req, res) => {
    try {
        const grupos = await prisma.$queryRawUnsafe(`
            SELECT * FROM "Grupo" ORDER BY numero ASC;
        `);
        res.json(grupos);
    } catch (error) {
        res.status(500).json({ error: "Error al cargar los grupos" });
    }
};

const crearGrupo = async (req, res) => {
    try {
        const { numero, descripcion } = req.body;
        const nuevoGrupo = await prisma.grupo.create({
            data: { numero, descripcion }
        });
        res.json(nuevoGrupo);
    } catch (error) {
        res.status(500).json({ error: "Error al guardar el grupo" });
    }
};

module.exports = { obtenerJovenes, contarAsistencias, contarReuniones, obtenerGrupos, crearGrupo };