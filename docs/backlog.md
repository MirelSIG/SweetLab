## Paso 1: Backend mínimo (Sprint 1 – CRUD Recetas)

    Configurar conexión a MongoDB

        En src/config/db.js crea la función de conexión con mongoose.connect(process.env.MONGO_URI).

        Importa en server.js para levantar la base de datos junto con Express.

## Definir modelo Recipe