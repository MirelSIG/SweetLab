# Checklist de validación CRUD - SweetLab

## 1. Servidor
- [x] Arranca sin errores (`node src/server.js`)
- [x] Conexión a MongoDB Atlas confirmada

## 2. Endpoints
- [x] `GET /api/recipes` → devuelve `[]` al inicio
- [x] `POST /api/recipes` → crea receta correctamente
- [x] `GET /api/recipes/:id` → devuelve receta creada
- [x] `PUT /api/recipes/:id` → actualiza receta
- [x] `DELETE /api/recipes/:id` → elimina receta

## 3. Resultados esperados
- Creación → objeto JSON con `_id`
- Lectura → array de recetas
- Actualización → objeto actualizado con `updatedAt`
- Eliminación → `{ "message": "Receta eliminada" }`
