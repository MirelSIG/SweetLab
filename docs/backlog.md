## Paso 1: Backend mínimo (Sprint 1 – CRUD Recetas)
EPIC 1 — Gestión de Recetas Base
• US-01: Como usuario quiero crear una receta base para registrar ingredientes y pasos.
AC: POST /recipes guarda nombre, ingredientes[], pasos[], categoría.
• US-02: Como usuario quiero ver todas mis recetas base.
AC: GET /recipes devuelve lista completa.
• US-03: Como usuario quiero editar una receta base.
AC: PUT /recipes/:id actualiza campos.
• US-04: Como usuario quiero eliminar una receta base.
AC: DELETE /recipes/:id.
EPIC 2 — Variaciones de Recetas
• US-05: Crear variaciones modificando ingredientes, cantidades y tiempos.
• US-06: Listar variaciones por receta base.
EPIC 3 — Evaluación y Comparación
• US-07: Registrar resultados (sabor, textura, apariencia).
• US-08: Comparar versiones y elegir la mejor.
EPIC 4 — UI Angular
• US-09: Formulario dinámico para crear recetas.
• US-10: Tabla/lista para visualizar recetas.
• US-11: Componente para variaciones.
• US-12: Componente para evaluaciones.

    Configurar conexión a MongoDB

        En src/config/db.js crea la función de conexión con mongoose.connect(process.env.MONGO_URI).

        Importa en server.js para levantar la base de datos junto con Express.

## Definir modelo Recipe