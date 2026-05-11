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
const { login, refresh, logout, register } = require('../controllers/authController');
const { authenticateToken, requireRole } = require('../middlewares/auth');

const { createRawRecipe } = require('../controllers/recipeController');

router.post('/auth/login', login);
router.post('/auth/register', register);
router.post('/auth/refresh', refresh);
router.post('/auth/logout', logout);

router.route('/recipes')
    .get(authenticateToken, getRecipes)
    .post(authenticateToken, requireRole('admin'), createRecipe);

// Ruta para insertar recetas sin validaciones (acepta JSON libre)
router.post('/recipes/raw', authenticateToken, requireRole('admin'), createRawRecipe);

router.route('/recipes/:id')
    .get(authenticateToken, getRecipeById)
    .put(authenticateToken, requireRole('admin'), updateRecipe)
    .delete(authenticateToken, requireRole('admin'), deleteRecipe);

module.exports = router;
