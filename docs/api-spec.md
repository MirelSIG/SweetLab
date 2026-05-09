# SweetLab API — Especificación

Última actualización: 2026-05-09

Base URL (desarrollo): `http://localhost:4000/api`

Resumen
- API mínima para gestionar recetas almacenadas en MongoDB.
- No hay autenticación por defecto en esta implementación.

Formato de errores
- Todos los errores responden con JSON: `{ "message": "Descripción del error" }`.

Modelo `Recipe` (schema)
- `title` (string) — obligatorio
- `ingredients` (string[]) — obligatorio, al menos un elemento
- `steps` (string[]) — obligatorio, al menos un elemento
- `tags` (string[]) — opcional
- `createdAt` / `updatedAt` — generados por el servidor (timestamps)

Endpoints

1) Listar recetas
- Method: `GET`
- Ruta: `/api/recipes`
- Descripción: devuelve una lista de recetas completas.
- Response 200: `[{ Recipe }, ...]`

Ejemplo:
```
curl http://localhost:4000/api/recipes
```

2) Crear receta (validada)
- Method: `POST`
- Ruta: `/api/recipes`
- Descripción: crea una receta validando los campos `title`, `ingredients` y `steps`.
- Request headers: `Content-Type: application/json`
- Body (ejemplo):
```
{
  "title": "Brownies Clásicos",
  "ingredients": ["200g chocolate", "150g mantequilla", "2 huevos"],
  "steps": ["Derretir chocolate y mantequilla", "Mezclar con huevos", "Hornear 25 minutos"],
  "tags": ["postre","chocolate"]
}
```
- Responses:
  - `201` creado: devuelve el documento creado.
  - `400` si falta algún campo obligatorio o la validación falla: `{ message }`.

Ejemplo curl:
```
curl -X POST http://localhost:4000/api/recipes \
  -H "Content-Type: application/json" \
  -d '{"title":"Mi receta","ingredients":["a"],"steps":["1"]}'
```

3) Crear receta (raw, sin validación)
- Method: `POST`
- Ruta: `/api/recipes/raw`
- Descripción: inserta el JSON recibido directamente en la colección Mongo `recipes` sin pasar por las validaciones del modelo Mongoose. Útil para cargas masivas o datos no estándar, pero peligroso en producción.
- Request headers: `Content-Type: application/json`
- Body: cualquier JSON; se insertará tal cual.
- Responses:
  - `201` creado: devuelve el documento insertado (incluye `_id`).
  - `500` si hubo un error en el servidor.

Ejemplo curl (raw):
```
curl -X POST http://localhost:4000/api/recipes/raw \
  -H "Content-Type: application/json" \
  -d '{"title":"Receta libre","weirdField":123}'
```

4) Obtener receta por ID
- Method: `GET`
- Ruta: `/api/recipes/:id`
- Descripción: devuelve el documento si existe.
- Responses:
  - `200` con el objeto.
  - `400` si el ID no tiene formato válido.
  - `404` si no se encuentra.

5) Actualizar receta
- Method: `PUT`
- Ruta: `/api/recipes/:id`
- Descripción: actualiza el documento; las validaciones del modelo se aplican. Acepta campos parciales.
- Responses:
  - `200` con el objeto actualizado.
  - `400` si ID inválido o payload inválido.
  - `404` si no existe.

6) Eliminar receta
- Method: `DELETE`
- Ruta: `/api/recipes/:id`
- Respuestas: `200` con `{ message: 'Receta eliminada' }`, o `404` si no existe.

Pautas y recomendaciones
- En producción **no** expongas `/api/recipes/raw` sin control: añade autenticación y restricciones.
- Siempre valida la entrada en el cliente y en el servidor cuando sea posible.
- Las fechas vienen en formato ISO `YYYY-MM-DDTHH:mm:ss.sssZ` (generadas por Mongoose timestamps).

Ejemplos en Node.js (fetch)
```js
// Crear receta validada
fetch('http://localhost:4000/api/recipes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'X', ingredients: ['a'], steps: ['1'] })
}).then(r => r.json()).then(console.log);

// Crear raw
fetch('http://localhost:4000/api/recipes/raw', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'Raw', extra: true })
}).then(r => r.json()).then(console.log);
```

Versionado y compatibilidad
- Esta especificación describe la API expuesta en `main` (sin versionado). Para cambios incompatibles, introducir prefijo `/v1/` y registrar cambios en el `CHANGELOG`.

Contacto y mantenimiento
- Responsable: equipo SweetLab
- Issues / PRs: gestionar en el repositorio GitHub del proyecto.

Archivos relacionados
- `backend/src/routes/recipeRoutes.js` — rutas definidas.
- `backend/src/controllers/recipeController.js` — lógica y validaciones.
- `backend/src/models/Recipe.js` — definición de schema.
