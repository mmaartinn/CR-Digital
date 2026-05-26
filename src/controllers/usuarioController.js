const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');

const crearUsuario = async (req, res) => {
    try {
        const { nombre_completo, correo, password, rol } = req.body;

        // 1. Verificar si el correo ya está en uso
        const usuarioExistente = await prisma.usuarioSistema.findUnique({
            where: { correo: correo }
        });

        if (usuarioExistente) {
            return res.status(400).json({ error: "Ya existe un líder registrado con este correo." });
        }

        // 2. Encriptar la contraseña (tal como lo hicimos en tu script inicial)
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // 3. Guardar en PostgreSQL
        const nuevoUsuario = await prisma.usuarioSistema.create({
            data: {
                nombre_completo,
                correo,
                password_hash: passwordHash,
                rol: rol || 'lider', // Por defecto será 'lider' si no envían rol
                activo: true
            }
        });

        res.status(201).json({ 
            mensaje: "Usuario creado con éxito.",
            usuario: { id: nuevoUsuario.id, nombre: nuevoUsuario.nombre_completo }
        });

    } catch (error) {
        res.status(500).json({ error: "Error interno al crear el usuario.", detalle: error.message });
    }
};

module.exports = { crearUsuario };