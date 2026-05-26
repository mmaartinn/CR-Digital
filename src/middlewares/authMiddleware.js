const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    // El frontend debe enviar el token en los headers como: "Bearer eyJhbGci..."
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ error: 'Acceso denegado. Se requiere token.' });
    }

    try {
        const decodificado = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decodificado; // Guardamos los datos del usuario en la request
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido o expirado.' });
    }
};

const requiereRol = (rolPermitido) => {
    return (req, res, next) => {
        if (req.usuario.rol !== rolPermitido) {
            return res.status(403).json({ error: 'No tienes los permisos necesarios para esta acción.' });
        }
        next();
    };
};

module.exports = { verificarToken, requiereRol };