# Despliegue en GitHub Pages

Esta guía explica cómo configurar y desplegar el frontend de SweetLab en GitHub Pages de forma automática.

## 1. Prerrequisitos

- Tener el repositorio pusheado a GitHub
- Permisos de administrador en el repositorio

## 2. Configurar GitHub Pages

Sigue estos pasos **una sola vez** en tu repositorio:

1. Ve a **Settings** del repositorio (en GitHub)
2. En la barra lateral izquierda, busca **Pages**
3. Bajo "Build and deployment":
   - **Source**: Selecciona **GitHub Actions**
   - Presiona **Save**

¡Eso es todo! El workflow se encargará del resto.

## 3. ¿Cómo funciona?

### Despliegue automático
Cada vez que hagas push a la rama `main` y modifiques archivos en la carpeta `frontend/`, el workflow:

1. ✅ Instala dependencias de Node.js
2. ✅ Compila el Angular app en producción
3. ✅ Sube los archivos compilados a GitHub Pages
4. ✅ Tu app estará disponible en: `https://TU_USUARIO.github.io/SweetLab/`

### Despliegue manual
Si quieres desplegar sin hacer push:

1. Ve a **Actions** en tu repositorio
2. Selecciona el workflow **"Deploy Frontend to GitHub Pages"**
3. Presiona el botón **"Run workflow"**

## 4. Variables importantes

- **Repository**: `MirelSIG/SweetLab`
- **Base URL en producción**: `https://MirelSIG.github.io/SweetLab/`
- **Rama de despliegue**: `main`
- **Carpeta de deploy**: `frontend/dist/sweetlab-frontend`

## 5. Configuración Angular

El proyecto ya está configurado con:

- **baseHref**: `/SweetLab/` (necesario para que las rutas funcionen en GitHub Pages)
- **Build script**: `npm run build:prod` en la carpeta `frontend/`

## 6. Verificar que funciona

Después del primer push:

1. Ve a **Actions** en GitHub
2. Verifica que el workflow se ejecutó correctamente (debe estar verde ✅)
3. Abre: `https://TU_USUARIO.github.io/SweetLab/`

Si ves tu aplicación Angular, ¡el despliegue funciona perfectamente!

## 7. Solucionar problemas

### El workflow falla
- Verifica el log de ejecución en **Actions**
- Asegúrate de que `frontend/package.json` tiene el script `build:prod`
- Verifica que `angular.json` tiene `"baseHref": "/SweetLab/"`

### La página dice "404 - Not Found"
- Espera 2-3 minutos después del despliegue
- Limpia el caché del navegador (Ctrl+Shift+Delete)
- Verifica que GitHub Pages esté habilitado en **Settings → Pages**

### Las rutas no funcionan
- Verifica que `baseHref` esté correctamente configurado en `angular.json`
- En desarrollo usa `npm start` (sin baseHref)
- En producción se usa automáticamente con `npm run build:prod`

## 8. Siguiente paso

Una vez funcione el despliegue, puedes:

- Conectar el frontend a un backend real (en lugar de MongoDB local)
- Agregar más funcionalidades al frontend
- Actualizar el frontend solo con hacer push a `main`

