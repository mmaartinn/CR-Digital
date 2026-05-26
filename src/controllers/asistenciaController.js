const prisma = require('../config/prisma');

/**
 * 1. Obtener la ficha de asistencia individual de un joven buscando por coincidencia parcial de nombre
 */
const obtenerAsistenciaPorNombre = async (req, res) => {
    try {
        const { nombre } = req.params;

        const jovenes = await prisma.$queryRawUnsafe(`
            SELECT 
                j.id, j.nombre, j.rut, j.telefono, j.estudio,
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
        
        const joven = jovenes[0];

        const reuniones = await prisma.$queryRawUnsafe(`
            SELECT id, fecha FROM "Reunion" ORDER BY fecha ASC;
        `);

        const asistencias = await prisma.$queryRawUnsafe(`
            SELECT "reunionId" FROM "Asistencia" WHERE "jovenId" = $1;
        `, joven.id);

        res.json({
            joven,
            reuniones,
            asistencias: asistencias.map(a => a.reunionId)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * 2. Obtener lista completa de reuniones filtradas por categoría "Reunión" para el menú del historial
 */
const obtenerReuniones = async (req, res) => {
    try {
        const reuniones = await prisma.$queryRawUnsafe(`
            SELECT id, fecha, tipo 
            FROM "Reunion" 
            WHERE categoria = 'Reunión'
            ORDER BY fecha DESC;
        `);
        res.json(reuniones);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener lista de reuniones", detalle: error.message });
    }
};

/**
 * 3. Generar matriz analítica de inasistencias y tendencias filtrando estrictamente por categoría "Reunión"
 */
const obtenerInformeSemanal = async (req, res) => {
    try {
        const fechaLimiteStr = req.query.fecha ? new Date(req.query.fecha) : new Date();

        const reunionesDesc = await prisma.$queryRaw`
            SELECT id, fecha 
            FROM "Reunion" 
            WHERE fecha <= ${fechaLimiteStr} AND categoria = 'Reunión'
            ORDER BY fecha DESC 
            LIMIT 9;
        `;
        const reuniones = reunionesDesc.reverse(); 

        if (reuniones.length === 0) {
            return res.json({ reuniones: [], jovenes: [] });
        }

        const reunionIds = reuniones.map(r => r.id);

        // EXTRAEMOS LOS MINISTERIOS Y EL NÚMERO DE GRUPO
        const jovenes = await prisma.$queryRawUnsafe(`
            SELECT 
                j.id, 
                j.nombre, 
                g.descripcion as grupo,
                g.numero as numero_grupo,
                COALESCE(string_agg(m.nombre, ', '), 'Sin Ministerio') AS ministerios
            FROM "Joven" j
            LEFT JOIN "Grupo" g ON j."grupoId" = g.id
            LEFT JOIN "JovenMinisterio" jm ON j.id = jm."jovenId"
            LEFT JOIN "Ministerio" m ON jm."ministerioId" = m.id
            GROUP BY j.id, j.nombre, g.descripcion, g.numero
            ORDER BY g.numero ASC, j.nombre ASC;
        `);

        const inClause = reunionIds.join(',');
        const asistencias = await prisma.$queryRawUnsafe(`
            SELECT "jovenId", "reunionId" 
            FROM "Asistencia" 
            WHERE "reunionId" IN (${inClause});
        `);

        const asistenciaMap = {};
        asistencias.forEach(a => {
            if (!asistenciaMap[a.jovenId]) asistenciaMap[a.jovenId] = new Set();
            asistenciaMap[a.jovenId].add(a.reunionId);
        });

        const reporteJovenes = jovenes.map(joven => {
            const historial = reuniones.map(r => asistenciaMap[joven.id]?.has(r.id) ? 1 : 0);
            const total = historial.length;
            
            const inicioActuales = Math.max(0, total - 8);
            const faltasActuales = historial.slice(inicioActuales).filter(v => v === 0).length;

            const inicioAnteriores = Math.max(0, total - 9);
            const finAnteriores = Math.max(0, total - 1);
            const faltasAnteriores = historial.slice(inicioAnteriores, finAnteriores).filter(v => v === 0).length;

            let racha = '';
            if (total >= 4) {
                const ultimas4 = historial.slice(-4).join(',');
                if (ultimas4 === '1,1,1,1') racha = '🔥';
                else if (ultimas4 === '0,0,0,0') racha = '🌧️';
                else if (ultimas4 === '1,1,0,0') racha = '📉';
                else if (ultimas4 === '0,0,1,1') racha = '📈';
            }

            return {
                id: joven.id,
                numero_grupo: joven.numero_grupo, 
                grupo: joven.grupo || 'Sin grupo',
                nombre: joven.nombre,
                faltas: faltasActuales,
                racha: racha,
                anteriores: faltasAnteriores,
                historial: historial,
                ministerios: joven.ministerios 
            };
        });

        const fechasFormateadas = reuniones.map(r => {
            const fecha = new Date(r.fecha);
            const dia = fecha.getUTCDate();
            const mes = fecha.toLocaleDateString('es-CL', { month: 'short', timeZone: 'UTC' }).replace('.', '');
            return `${dia}-${mes}`;
        });

        res.json({
            reuniones: fechasFormateadas,
            jovenes: reporteJovenes
        });

    } catch (error) {
        res.status(500).json({ error: "Error al generar matriz", detalle: error.message });
    }
};

module.exports = { 
    obtenerAsistenciaPorNombre, 
    obtenerReuniones,
    obtenerInformeSemanal 
};