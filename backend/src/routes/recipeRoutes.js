// ¿Qué hace esto?
// Usa router para definir cada ruta.
// Cada ruta llama a una función del controlador.
// Exporta el router para que pueda usarse en app.js.

const express = require('express');
const router = express.Router();

const {
    createRecipe,
    getRecipes,
    getRecipeById,
    updateRecipe,
    deleteRecipe,
    createRawRecipe
} = require('../controllers/recipeController');

const {
    login,
    refresh,
    logout,
    register,
    changePassword   // ← IMPORTACIÓN NECESARIA
} = require('../controllers/authController');

const { authenticateToken, requireRole } = require('../middlewares/auth');

// ---------------- AUTH ----------------

router.post('/auth/login', login);
router.post('/auth/register', register);
router.post('/auth/refresh', refresh);
router.post('/auth/logout', logout);

// Nueva ruta para cambiar contraseña del admin
router.post('/auth/change-password', authenticateToken, requireRole('admin'), changePassword);

// ---------------- RECIPES ----------------

router.route('/recipes')
    .get(getRecipes)
    .post(authenticateToken, requireRole('admin'), createRecipe);

// Ruta para insertar recetas sin validaciones (acepta JSON libre)
router.post('/recipes/raw', authenticateToken, requireRole('admin'), createRawRecipe);

router.route('/recipes/:id')
    .get(getRecipeById)
    .put(authenticateToken, requireRole('admin'), updateRecipe)
    .delete(authenticateToken, requireRole('admin'), deleteRecipe);

module.exports = router;
