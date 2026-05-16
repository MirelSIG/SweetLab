# Deploy de SweetLab en Render (Gratis)

## Pasos para desplegar SweetLab en Render:

### 1. Configurar MongoDB Atlas (base de datos gratuita)

1. Ve a [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Crea una cuenta gratuita
3. Crea un cluster gratuito (tarda 1-2 minutos)
4. En "Security" → "Database Access": crea un usuario (username/password)
5. En "Security" → "Network Access": agrega `0.0.0.0/0` (acceso global)
6. En "Databases" → "Connect": copia la **connection string** (MongoDB URI)
   - Reemplaza `<username>` y `<password>` con tus credenciales
   - Debe verse así: `mongodb+srv://admin:mypass@cluster0.mongodb.net/sweetlab`

### 2. Desplegar SweetLab en Render

1. Ve a [render.com](https://render.com)
2. Crea una cuenta gratuita (con GitHub es más fácil)
3. Haz click en **"New Web Service"**
4. Selecciona tu repositorio **SweetLab**
5. Completa el formulario:
   - **Name**: `sweetlab`
   - **Runtime**: Node
   - **Build Command**: `cd frontend && npm install && npm run build:prod && cd ../backend && npm install`
   - **Start Command**: `cd backend && node src/server.js`
   - **Instance Type**: Free (gratis)

6. En **"Environment Variables"**, agrega:
   ```
   MONGO_URI = mongodb+srv://admin:mypass@cluster0.mongodb.net/sweetlab
   NODE_ENV = production
   PORT = 4000
   ```

7. Haz click en **"Create Web Service"**
8. Espera 2-3 minutos. Render te mostrará la URL cuando esté listo (algo como `https://sweetlab.onrender.com`)

### 3. Verificar el Frontend

Una vez desplegado el servicio:

1. El frontend se sirve desde el mismo dominio que la API.
2. Las peticiones van a rutas relativas como `/api`.
3. Si cambias algo en Angular o en Express, haz `git push` para que Render vuelva a construir el servicio.

### 4. Probar

Abre la URL pública de Render y prueba registrarte e ingresar. El frontend y la API deben responder desde el mismo servicio.

## Notas

- Render pone servicios gratis en modo sleep después de 15 minutos sin actividad. La primera petición tardará ~30 segundos
- MongoDB Atlas es totalmente gratuito (hasta 512MB de datos)
- El backend además sirve el build de Angular generado en `frontend/dist/sweetlab-frontend`
- Si necesitas resetear datos, siempre puedes borrar la colección desde MongoDB Atlas

## Troubleshooting

Si el backend no conecta a MongoDB:
- Verifica que la connection string sea correcta
- Asegúrate de que `0.0.0.0/0` está agregado en Network Access de MongoDB Atlas
- Revisa los logs en Render para ver el error exacto
