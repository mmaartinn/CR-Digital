const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const login = async (req, res) => {
    try {
        const { correo, password } = req.body;

        // 1. Buscar si el usuario existe
        const usuario = await prisma.usuarioSistema.findUnique({
            where: { correo: correo }
        });

        if (!usuario) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        // 2. Verificar si está activo
        if (!usuario.activo) {
            return res.status(403).json({ error: 'Esta cuenta ha sido desactivada' });
        }

        // 3. Comparar la contraseña ingresada con el hash de la base de datos
        const passwordValida = await bcrypt.compare(password, usuario.password_hash);
        if (!passwordValida) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        // 4. Generar el Token JWT
        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol, nombre: usuario.nombre_completo },
            process.env.JWT_SECRET,
            { expiresIn: '8h' } // El token expira en 8 horas
        );

        res.json({
            mensaje: 'Login exitoso',
            token: token,
            usuario: {
                nombre: usuario.nombre_completo,
                rol: usuario.rol
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = { login };