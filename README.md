# SweetLab

Proyecto de practica para aprender desarrollo web con:

- Backend con Node.js + Express + MongoDB (API REST de recetas)
- Frontend con Angular (interfaz para mostrar recetas)

** Sitio (GitHub Pages):** [https://MirelSIG.github.io/SweetLab/](https://MirelSIG.github.io/SweetLab/)

** Desarrollo local:** Arranca el frontend y abre en el navegador: [http://localhost:4200](http://localhost:4200)

Para iniciar localmente:

```bash
cd frontend
npm install
npm start
```

Nota: el despliegue a GitHub Pages puede tardar 1-2 minutos tras ejecutar el workflow.

Esta guia esta escrita para una persona que empieza en programacion web y tambien empieza con Angular.

## 1) Que hace este proyecto

SweetLab permite trabajar recetas de cocina de dos formas:

- Desde el frontend Angular, que muestra recetas ficticias guardadas en un archivo JSON local.
- Desde el backend API, que permite crear, leer, actualizar y eliminar recetas reales en MongoDB.

En palabras simples:

- El frontend es la parte visual que ves en el navegador.
- El backend es la parte que procesa datos y habla con la base de datos.

## 2) Mapa rapido de carpetas

- [backend](backend)
    API REST con Express y Mongoose.
- [frontend](frontend)
    Aplicacion Angular standalone.
- [docs](docs)
    Notas del proyecto (backlog, checklist, etc.).

### Backend (archivos importantes)

- [backend/src/server.js](backend/src/server.js)
    Arranca el servidor y conecta a MongoDB.
- [backend/src/app.js](backend/src/app.js)
    Configura middlewares y monta rutas.
- [backend/src/routes/recipeRoutes.js](backend/src/routes/recipeRoutes.js)
    Define endpoints de recetas.
- [backend/src/controllers/recipeController.js](backend/src/controllers/recipeController.js)
    Logica de negocio y validaciones de body/id.
- [backend/src/models/Recipe.js](backend/src/models/Recipe.js)
    Esquema de receta en MongoDB.

### Frontend (archivos importantes)

- [frontend/src/main.ts](frontend/src/main.ts)
    Punto de entrada de Angular.
- [frontend/src/app/app.component.ts](frontend/src/app/app.component.ts)
    Componente principal (estado, filtros, seleccion).
- [frontend/src/app/recipe.service.ts](frontend/src/app/recipe.service.ts)
    Servicio que hace llamadas HTTP a la API del backend.
- [frontend/src/assets/recipes.json](frontend/src/assets/recipes.json)
    Datos ficticios locales (como fallback o referencia).

## 3) Requisitos previos

Necesitas tener instalado:

- Node.js 18 o superior
- npm (viene con Node)
- Conexion a internet (para instalar paquetes)

Opcional pero recomendado:

- MongoDB Atlas configurado (ya se usa mediante MONGO_URI en el backend)

## 4) Como ejecutar el backend

Desde la carpeta backend:

```bash
cd backend
npm install
node src/server.js
```

Si todo va bien, deberias ver mensajes de conexion a MongoDB y servidor en puerto 4000.

### Tests del backend

Para ejecutar los tests automatizados de autenticacion:

```bash
cd backend
npm install
npm test
```

Para ver el reporte de cobertura de código:

```bash
cd backend
npm run test:cov
```

Esto genera un reporte HTML en `coverage/lcov-report/index.html` que puedes abrir en el navegador.

## 5) Como ejecutar el frontend Angular

Desde otra terminal, en la carpeta frontend:

```bash
cd frontend
npm install
npm start
```

Angular levanta un servidor de desarrollo (normalmente en puerto 4200).

## 6) Endpoints de la API (CRUD)

Base URL local:

```text
http://localhost:4000/api
```

### Autenticación (JWT con rol + credenciales)

Antes de usar rutas de recetas, inicia sesión en:

- POST /auth/login

Body esperado:

```json
{
    "role": "admin",
    "username": "admin",
    "password": "admin123"
}
```

Credenciales por defecto (desarrollo):

- admin: username `admin`, password `admin123`
- externo: username `externo`, password `externo123`

Permisos:

- admin: lectura + crear + editar + eliminar
- externo: solo lectura

Puedes cambiar credenciales desde variables de entorno del backend:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `EXTERNAL_USERNAME`
- `EXTERNAL_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `JWT_REFRESH_SECRET`
- `JWT_REFRESH_EXPIRES_IN`
- `MAX_LOGIN_ATTEMPTS`
- `LOCK_TIME_MINUTES`

Seed de usuarios en MongoDB (recomendado al iniciar):

```bash
cd backend
npm install
npm run seed:users
```

El login devuelve `token` (acceso) y `refreshToken` (renovación).

Si expira el access token, el frontend intenta renovar automáticamente con `POST /auth/refresh`.

Tras varios intentos de login fallidos, el backend aplica bloqueo temporal por identidad (usuario + IP).

Rutas:

- POST /auth/login
- POST /auth/refresh
- POST /auth/logout
- GET /recipes
    Lista todas las recetas.
- GET /recipes/:id
    Obtiene una receta por id.
- POST /recipes
    Crea una receta nueva.
- PUT /recipes/:id
    Actualiza receta existente.
- DELETE /recipes/:id
    Elimina receta por id.

Ejemplo minimo de body para crear receta:

```json
{
    "title": "Tarta de manzana",
    "ingredients": ["2 manzanas", "harina", "azucar"],
    "steps": ["mezclar", "hornear"],
    "tags": ["postre"]
}
```

## 7) Formas de agregar las recetas de ejemplo

Este proyecto viene con dos recetas de ejemplo en [docs/recipes-example.json](docs/recipes-example.json):

- Brownies Clásicos
- Tiramisú

### Opcion 1: POST directo desde terminal con curl

#### Crear Brownies Clásicos

```bash
curl -X POST http://127.0.0.1:4000/api/recipes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Brownies Clásicos",
    "ingredients": ["200g chocolate", "150g mantequilla", "2 huevos", "1 taza harina", "azúcar"],
    "steps": ["Derretir chocolate y mantequilla", "Mezclar con huevos y azúcar", "Incorporar harina", "Hornear 25 minutos a 180°C"],
    "tags": ["chocolate", "postre", "rápido"]
  }'
```

Respuesta esperada (si todo va bien):

```json
{
  "_id": "665a1b2c3d4e5f6g7h8i9j0k",
  "title": "Brownies Clásicos",
  "ingredients": ["200g chocolate", "150g mantequilla", "2 huevos", "1 taza harina", "azúcar"],
  "steps": ["Derretir chocolate y mantequilla", "Mezclar con huevos y azúcar", "Incorporar harina", "Hornear 25 minutos a 180°C"],
  "tags": ["chocolate", "postre", "rápido"],
  "createdAt": "2026-04-02T08:19:13.000Z",
  "updatedAt": "2026-04-02T08:19:13.000Z"
}
```

#### Crear Tiramisú

```bash
curl -X POST http://127.0.0.1:4000/api/recipes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tiramisú",
    "ingredients": ["Mascarpone", "Café fuerte", "Bizcochos de soletilla", "Cacao en polvo", "Azúcar"],
    "steps": ["Preparar crema mascarpone con azúcar", "Mojar bizcochos en café", "Montar capas: crema, bizcochos, crema", "Refrigerar 4 horas", "Espolvorear cacao antes de servir"],
    "tags": ["frío", "postre", "italiano"]
  }'
```

### Opcion 2: Importar desde JSON (archivo de referencia)

¿Como sería ese flujo?

1. Crear un script Node.js que lea [docs/recipes-example.json](docs/recipes-example.json).
2. Hacer un POST a [`http://127.0.0.1:4000/api/recipes`](http://127.0.0.1:4000/api/recipes) por cada receta.

Ejemplo de script (si quisieras automatizar):

```javascript
// archivo: import-recipes.js
const fs = require('fs');
const recipes = JSON.parse(fs.readFileSync('./docs/recipes-example.json', 'utf8'));

recipes.forEach(recipe => {
  fetch('http://127.0.0.1:4000/api/recipes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recipe)
  })
    .then(r => r.json())
    .then(data => console.log('✅ Creada:', data.title))
    .catch(err => console.error('❌ Error:', err));
});
```

Para ejecutar:

```bash
node import-recipes.js
```

### Opcion 3: Verificar que entraron bien

Una vez creadas, lista todas las recetas:

```bash
curl http://127.0.0.1:4000/api/recipes
```

Deberias ver un array con Brownies y Tiramisú más sus ids.

## 8) Validaciones que ya tiene el backend

En [backend/src/controllers/recipeController.js](backend/src/controllers/recipeController.js) se agregaron validaciones para evitar errores confusos:

- Si el body viene vacio, devuelve 400 con mensaje claro.
- Si faltan campos obligatorios en creacion, devuelve 400.
- Si el id no es un ObjectId valido, devuelve 400 en rutas por id.
- Si no existe receta con ese id valido, devuelve 404.

Esto ayuda mucho cuando estas aprendiendo porque los errores son mas entendibles.

## 9) Como probar rapido la conexion al backend

Con el servidor levantado, prueba:

```bash
curl -i http://127.0.0.1:4000/api/recipes
```

Respuesta esperada inicial:

- HTTP 200
- Body [] (si aun no hay recetas guardadas)

## 10) Flujo de aprendizaje recomendado (paso a paso)

1. Levanta backend y frontend por separado.
2. Entiende la ruta completa de una receta:
     frontend -> servicio -> API -> controlador -> modelo -> MongoDB.
3. Prueba CRUD con Postman o curl.
4. Crea 1 pantalla nueva en Angular (por ejemplo, formulario de alta).
5. Conecta esa pantalla al endpoint POST del backend.

Si haces eso, vas a entender la base real de una app web full stack.

## 11) Mini glosario para iniciarse

- API REST: interfaz de URLs para pedir o guardar datos.
- Endpoint: cada URL de la API con una accion especifica.
- CRUD: Create, Read, Update, Delete.
- JSON: formato de texto para representar datos.
- Componente (Angular): bloque reutilizable de interfaz y logica.
- Servicio (Angular): clase para centralizar tareas como llamadas HTTP.
- Mongoose: libreria para modelar datos de MongoDB en Node.js.

## 12) Estado actual del proyecto

- Frontend Angular funcionando con recetas ficticias en JSON local.
- Backend Express funcionando en puerto 4000 con MongoDB.
- CRUD de recetas implementado.
- Validaciones mejoradas para body vacio e id invalido.

## 13) Integracion del frontend con la API real (YA COMPLETADO)

El frontend Angular ahora está conectado con la API del backend. Los cambios que se hicieron fueron:

### En el servicio (recipe.service.ts):
- Cambio de URL: de `assets/recipes.json` a `http://localhost:4000/api/recipes`
- Se agregaron métodos para CRUD completo: `getRecipeById()`, `createRecipe()`, `updateRecipe()`, `deleteRecipe()`

### En el modelo (recipe.model.ts):
- Se hicieron todos los campos opcionales (excepto title, ingredients, steps)
- Se agregó soporte para `_id` de MongoDB además de `id`
- Se agregaron campos como `createdAt` y `updatedAt`

### En el componente (app.component.ts):

- Se actualizó el manejo de errores para que avise si el backend no está corriendo
- Se extrae la lógica de carga en método `loadRecipes()`

### En el template (app.component.html)

- Se usan comparaciones condicionales con `_id` y `id`
- Los campos opcionales solo muestran si existen
- Titulo actualizado para reflejar lectura desde MongoDB

### Como probar la integracion

1. Asegúrate que el backend esté corriendo:

```bash
cd backend
node src/server.js
```

1. En otra terminal, arranca el frontend Angular:

```bash
cd frontend
npm start
```

3. Abre Sweetlab en el navegador.

2. Si el backend no responde, verás este mensaje:

```
❌ No se pudo conectar a la API. Verifica que el backend esté corriendo en http://localhost:4000
```

5. Si todo funciona, deberías ver las recetas que agregaste a MongoDB (si es que agregaste algunas).

### Que paso internamente:

1. Angular hace GET a <http://localhost:4000/api/recipes>
2. El backend responde con recetas desde MongoDB
3. El frontend mapea `_id` → `id` internamente
4. Los campos opcionales se muestran solo si existen

### Proximo: Agregar formularios para CRUD

Para seguir aprendiendo, el proximo paso seria construir:

- Input para crear receta nueva
- Botones para actualizar receta seleccionada
- Botones para eliminar receta
- Métodos en el componente que usen `createRecipe()`, `updateRecipe()`, `deleteRecipe()`

Esto te permitirá practicar Angular two-way binding y events.

## 14) Despliegue en GitHub Pages

El frontend está configurado para desplegarse automáticamente en GitHub Pages.

**Para activar:**

1. Ve a Settings → Pages en tu repositorio de GitHub
2. Selecciona "GitHub Actions" como fuente de deploy
3. Haz push a la rama main

Tu app estará disponible en: `https://TU_USUARIO.github.io/SweetLab/`

Ver guía completa en: [docs/github-pages-setup.md](docs/github-pages-setup.md)

## 15) Funcionalidades CRUD completadas (YA IMPLEMENTADAS)

### ✅ 1. Editar recetas

Ahora puedes editar cualquier receta que hayas seleccionado:

1. Selecciona una receta en la lista
2. Presiona el botón **✏️ Editar**
3. Modifica los campos que quieras (título, ingredientes, pasos, tags, tiempo, dificultad)
4. Presiona **Guardar cambios**

Los cambios se envían a la API y se reflejan inmediatamente en la lista.

### ✅ 2. Eliminar recetas

Para eliminar una receta:

1. Selecciona la receta que quieres eliminar
2. Presiona el botón **🗑️ Eliminar**
3. Confirma que quieres eliminarla en el diálogo
4. La receta se eliminará de MongoDB y desaparecerá de la lista

### ✅ 3. Apertura automática del navegador

El frontend ahora abre automáticamente el navegador cuando inicias el servidor:

```bash
cd frontend
npm start
```

El navegador se abrirá automáticamente en `http://localhost:4200` (o en el puerto configurado).

### En resumen: CRUD completo

- ✅ **Create** (Crear): Botón "Añadir receta" con formulario amigable o JSON
- ✅ **Read** (Leer): Lista de recetas con búsqueda y selección
- ✅ **Update** (Editar): Botón "Editar" en cada receta
- ✅ **Delete** (Eliminar): Botón "Eliminar" con confirmación

## 16) Proximo paso sugerido (opcional)

