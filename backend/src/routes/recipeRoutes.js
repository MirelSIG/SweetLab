// ¿Qué hace esto?

//     Usa router para definir cada ruta.

//     Cada ruta llama a una función del controlador (recipeController.js).

//     Exporta el router para que pueda usarse en app.js.


const express = require('express');
const router = express.Router();
const {
    createRecipe,
    getRecipes,
    getRecipeById,
    updateRecipe,
    deleteRecipe
} = require('../controllers/recipeController');

// Crear nueva receta
router.post('/recipes', createRecipe);

// Obtener todas las recetas
router.get('/recipes', getRecipes);

// Obtener una receta por ID
router.get('/recipes/:id', getRecipeById);

// Actualizar receta por ID
router.put('/recipes/:id', updateRecipe);

// Eliminar receta por ID
router.delete('/recipes/:id', deleteRecipe);

module.exports = router;
