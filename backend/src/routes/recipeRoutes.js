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

router.route('/recipes')
    .get(getRecipes)
    .post(createRecipe);

router.route('/recipes/:id')
    .get(getRecipeById)
    .put(updateRecipe)
    .delete(deleteRecipe);

module.exports = router;
