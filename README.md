# Página Web Cuenta Regresiva
Aquí está la documentación para poder trabajar en este proyecto todos juntos, evitando la mayor cantidad de problemas de sincronización y todo ese tipo de cosas


## Instalación (MacOS)
1) **Instalar Node.js**

`brew install node$`

2. **Instalar "Node Package Manager"**:

⚠️ **IMPORTANTE** ⚠️ NO instalar `npm`, si quieren busquen [más información](https://medium.com/@_jaydeepkarale/largest-npm-hack-in-history-f953acf82b76) al respecto.
En cambio, utilicen `pnpm`, este si es seguro

`brew install pnpm`

3. **Instalar las dependencias**:

`pnpm install`

De esta forma, se construye la carpeta de `node_modules` localmente en el repositorio de cada uno.

## Configuración Personal
Esto deben hacerlo cada uno en sus computadores

1. Instalar todos los paquetes (visto en el apartado anterior)

2. crear una base de datos para su propio equipo (estaremos trabajando con postgresql): `createdb <bdd_personal>`

3. Sincronizar la base de datos: `pnpm exec prisma db push`

4. Configurar sus credenciales en el archivo `.env`: Pueden utilizar como referencia el archivo .env.example ([click aqui](.env.example))

Luego, cada vez que vayan a trabajar en el proyecto:

4. Abrir "Prisma Studio": `pnpm exec prisma studio` (para cerrarlo, usar `Ctrl + C` en la terminal)


## Configuración General (MacOS)
Esta parte **no es necesaria**, porque entiendo que solamente se hace una vez y luego todo queda registrado en el `package.json`, pero prefiero dejarlo todo registrado en caso de cualquier cosa:

1. `pnpm init`

2. `pnpm add express @prisma/client` : Debería quedar la versión 7.8.0 

3. `pnpm add -D prisma`

4. `pnpm approve-builds`: aceptar ambos paquetes (@prisma/engines, prisma), luego volver a ejecutar `pnpm install` y después avanzar al paso 5

5. `pnpm dlx prisma init`

## Instalación y Configuración (Windows)
Yo trabajo desde MacOS, sorry... pero la instalación de arriba sirve para que tengan una referencia de los comandos que deben buscar en Windows o Linux.

Si alguien quiere agregar la instalación para otros OS, bienvenido sea jeje.

## EDR (Diagrama Entidad-Relación) asociado a la Base de Datos

Se utilizará el entorno de PostreSQL para el modelo de la base de datos, aquí un diagrama para facilitar el entendimiento de cómo trabajaremos:

