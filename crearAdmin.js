const bcrypt = require('bcrypt');
// Importamos la conexión de Prisma 
const prisma = require('./src/config/prisma'); 

async function main() {
    try {
        console.log("Iniciando creación de administrador...");

        const correoAdmin = "admincr@gmail.com";
        const passwordPlana = "clavecr123"; 

        // Encriptamos la contraseña (10 saltos es el estándar seguro)
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(passwordPlana, saltRounds);

        // Insertamos el usuario en PostgreSQL
        const nuevoAdmin = await prisma.usuarioSistema.create({
            data: {
                nombre_completo: "Admin",
                correo: correoAdmin,
                password_hash: passwordHash,
                rol: "editor", // Rol máximo
                activo: true
            }
        });

        console.log("✅ Usuario administrador creado con éxito:");
        console.log(`ID: ${nuevoAdmin.id} | Nombre: ${nuevoAdmin.nombre_completo} | Correo: ${nuevoAdmin.correo}`);
        
    } catch (error) {
        // Por si se ejecuta el script dos veces y el correo ya existe
        if (error.code === 'P2002') {
            console.error("❌ Error: Ya existe un usuario con ese correo en la base de datos.");
        } else {
            console.error("❌ Error inesperado:", error);
        }
    } finally {
        // Cerramos la conexión a la base de datos para que el script termine correctamente
        await prisma.$disconnect();
    }
}

main();