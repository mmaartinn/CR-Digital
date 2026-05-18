# Página Web Cuenta Regresiva

## Instalación (MacOS)
1) **Instalar Node.js**

`brew install node$`

2. **Instalar "Node Package Manager"**:

⚠️ **IMPORTANTE** ⚠️ NO instalar `npm`, si quieren busquen [más información](https://medium.com/@_jaydeepkarale/largest-npm-hack-in-history-f953acf82b76) al respecto.
En cambio, utilicen `pnpm`, este si es seguro

`brew install pnpm`

3. **Instalar las dependencias**:

`pnpm install`

## Configuración (MacOS)
Esta parte no es necesaria, porque entiendo que solamente se hace una vez y luego todo queda registrado en el `package.json`, pero prefiero dejarlo todo registrado en caso de cualquier cosa:

1. `pnpm init`

2. `pnpm add express @prisma/client` 

3. `pnpm add -D prisma`

4. `pnpm approve-builds`: aceptar ambos paquetes (@prisma/engines, prisma), luego volver a ejecutar `pnpm install` y después avanzar al paso 5

5. `pnpm dlx prisma init`

## Instalación y Configuración (Windows)
Yo trabajo desde MacOS, sorry... pero la instalación de arriba sirve para que tengan una referencia de los comandos que deben buscar en Windows o Linux.

Si alguien quiere agregar la instalación para otros OS, bienvenido sea jeje.
