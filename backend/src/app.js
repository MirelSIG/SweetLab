const express = require('express');
const cors = require('cors');
const recipeRoutes = require('./routes/recipeRoutes');

const app = express();

// Middleware para permitir peticiones desde el frontend
app.use(cors());

// Middleware para leer JSON en el cuerpo de las peticiones
app.use(express.json());

// Usar las rutas definidas
app.use('/api', recipeRoutes);

module.exports = app;

