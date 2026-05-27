Sprint 1 – Backend mínimo + UI base (CRUD Recetas)
Este backlog describe el primer incremento funcional del proyecto SweetLab.
El objetivo del Sprint 1 es construir un sistema capaz de crear, leer, actualizar y eliminar recetas, con una interfaz Angular mínima que permita interactuar con el backend.
---
## EPIC 1 — Gestión de Recetas Base (CRUD completo)
Funcionalidad esencial para registrar recetas en MongoDB y manipularlas desde la API.
---
US-01 — Crear receta base
Como usuaria, quiero registrar una receta con su nombre, ingredientes y pasos,
para poder guardar mis preparaciones de cocina.
Acceptance Criteria (AC):
• Endpoint: POST /recipes
• Guarda:
	◦ title (string, obligatorio)
	◦ ingredients[] (array de strings)
	◦ steps[] (array de strings)
	◦ tags[] (opcional)
• Devuelve la receta creada con _id, createdAt, updatedAt
• Si faltan campos obligatorios → 400 Bad Request
---
US-02 — Ver todas las recetas
Como usuaria, quiero ver una lista completa de mis recetas,
para poder consultarlas fácilmente.
AC:
• Endpoint: GET /recipes
• Devuelve un array con todas las recetas
• Si no hay recetas → devuelve []
• Respuesta en menos de 200 ms en entorno local
---
US-03 — Editar receta base
Como usuaria, quiero modificar una receta existente,
para corregir errores o mejorarla.
AC:
• Endpoint: PUT /recipes/:id
• Permite actualizar cualquier campo
• Si el ID no existe → 404 Not Found
• Si el ID es inválido → 400 Bad Request
---
US-04 — Eliminar receta base
Como usuaria, quiero borrar una receta,
para mantener mi cuaderno digital limpio.
AC:
• Endpoint: DELETE /recipes/:id
• Si la receta existe → eliminar y devolver mensaje de confirmación
• Si no existe → 404 Not Found
---
## EPIC 2 — Variaciones de Recetas (Futuro Sprint)
Permite experimentar con versiones alternativas de una receta base.
---
US-05 — Crear variaciones
Como usuaria, quiero crear variaciones de una receta base,
para probar cambios en ingredientes, cantidades o tiempos.
AC:
• Endpoint: POST /recipes/:id/variations
• Cada variación debe guardar:
	◦ Cambios en ingredientes
	◦ Cambios en pasos
	◦ Notas adicionales
---
US-06 — Listar variaciones
Como usuaria, quiero ver todas las variaciones de una receta,
para comparar mis experimentos.
AC:
• Endpoint: GET /recipes/:id/variations
• Devuelve lista de variaciones asociadas a la receta base
---
## EPIC 3 — Evaluación y Comparación (Futuro Sprint)
Permite evaluar resultados y elegir la mejor versión.
---
US-07 — Registrar evaluación
Como usuaria, quiero evaluar una receta o variación,
para recordar qué tal quedó.
AC:
• Campos: sabor, textura, apariencia, notas
• Endpoint: POST /recipes/:id/evaluations
---
US-08 — Comparar versiones
Como usuaria, quiero comparar varias versiones de una receta,
para elegir la mejor.
AC:
• Endpoint: GET /recipes/:id/comparison
• Devuelve tabla comparativa de evaluaciones
---
## EPIC 4 — UI Angular (Sprint 1 y Sprint 2)
Interfaz mínima para interactuar con el backend.
---
US-09 — Formulario dinámico para crear recetas
Como usuaria, quiero un formulario simple e intuitivo,
para registrar recetas sin conocimientos técnicos.
AC:
• Inputs grandes y accesibles
• Ingredientes y pasos agregados uno a uno
• Botón “Guardar receta”
• Validación visual clara
---
US-10 — Lista de recetas
Como usuaria, quiero ver mis recetas en una lista,
para acceder a ellas rápidamente.
AC:
• Lista con título y fecha
• Botones: Ver, Editar, Eliminar
---
US-11 — Componente de variaciones
Como usuaria, quiero gestionar variaciones desde la UI.
---
US-12 — Componente de evaluaciones
Como usuaria, quiero registrar evaluaciones desde la UI.
---
🧩 Tareas técnicas del Sprint 1 (Backend mínimo)
✔ Configurar conexión a MongoDB Atlas
• Crear archivo backend/.env con MONGO_URI
• Crear función de conexión con mongoose.connect()
• Importar conexión en server.js
• Manejar errores de conexión
---
✔ Definir modelo `Recipe`
Archivo: backend/src/models/Recipe.js
Campos:
title: String,
ingredients: [String],
steps: [String],
tags: [String]
✔ Implementar rutas CRUD
Archivo: backend/src/routes/recipeRoutes.js
---
✔ Implementar controladores
Archivo: backend/src/controllers/recipeController.js
• Validación de body vacío
• Validación de ObjectId
• Manejo de errores 400/404/500
---
## Cómo probar los endpoints (QA del Sprint 1)
# GET todas las recetas
curl http://localhost:4000/api/recipes
POST nueva receta
curl -X POST http://localhost:4000/api/recipes \
-H "Content-Type: application/json" \
-d '{
"title": "Tortilla de patatas",
"ingredients": ["2 patatas", "4 huevos", "1 cebolla"],
"steps": ["Pelar y cortar las patatas", "Freír las patatas y la cebolla", "Batir los huevos y mezclar con las patatas", "Cocinar la mezcla en una sartén"]
}'
# PUT actualizar receta
curl -X PUT http://localhost:4000/api/recipes/RECETA_ID \
-H "Content-Type: application/json" \
-d '{
"title": "Tortilla de patatas mejorada",
"ingredients": ["2 patatas", "4 huevos", "1 cebolla", "Sal"],
"steps": ["Pelar y cortar las patatas", "Freír las patatas y la cebolla", "Batir los huevos y mezclar con las patatas", "Cocinar la mezcla en una sartén", "Añadir sal al gusto"]
}'
# DELETE receta
curl -X DELETE http://local host:4000/api/recipes/RECETA_ID  
# Sprint 1 — Resultado esperado
Al finalizar el Sprint 1, la aplicación debe permitir:
• Crear recetas
• Listarlas
• Editarlas
• Eliminarlas
• Guardarlas en MongoDB Atlas
• Visualizarlas desde Angular
Con una UI simple y accesible.