const Recipe = require('../models/Recipe');
const mongoose = require('mongoose');

const isPlainObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

const validateRecipePayload = (body, { requireAllFields = false } = {}) => {
  if (!isPlainObject(body) || Object.keys(body).length === 0) {
    return 'El body debe contener datos validos para procesar la receta.';
  }

  const requiredFields = ['title', 'ingredients', 'steps'];
  if (requireAllFields) {
    const missingFields = requiredFields.filter((field) => !(field in body));
    if (missingFields.length > 0) {
      return `Faltan campos obligatorios: ${missingFields.join(', ')}.`;
    }
  }

  if ('title' in body && (typeof body.title !== 'string' || body.title.trim() === '')) {
    return 'El campo "title" debe ser un texto no vacio.';
  }

  if ('ingredients' in body) {
    if (
      !Array.isArray(body.ingredients) ||
      body.ingredients.length === 0 ||
      body.ingredients.some((ingredient) => typeof ingredient !== 'string' || ingredient.trim() === '')
    ) {
      return 'El campo "ingredients" debe ser un arreglo con al menos un ingrediente valido.';
    }
  }

  if ('steps' in body) {
    if (
      !Array.isArray(body.steps) ||
      body.steps.length === 0 ||
      body.steps.some((step) => typeof step !== 'string' || step.trim() === '')
    ) {
      return 'El campo "steps" debe ser un arreglo con al menos un paso valido.';
    }
  }

  if ('tags' in body) {
    if (!Array.isArray(body.tags) || body.tags.some((tag) => typeof tag !== 'string' || tag.trim() === '')) {
      return 'El campo "tags" debe ser un arreglo de textos validos.';
    }
  }

  return null;
};

const validateRecipeId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return 'El ID de la receta no es valido.';
  }

  return null;
};

// Crear receta
exports.createRecipe = async (req, res) => {
  const validationMessage = validateRecipePayload(req.body, { requireAllFields: true });
  if (validationMessage) {
    return res.status(400).json({ message: validationMessage });
  }

  try {
    const recipe = new Recipe(req.body);
    await recipe.save();
    res.status(201).json(recipe);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Obtener todas las recetas
exports.getRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener receta por ID
exports.getRecipeById = async (req, res) => {
  const idValidationMessage = validateRecipeId(req.params.id);
  if (idValidationMessage) {
    return res.status(400).json({ message: idValidationMessage });
  }

  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Receta no encontrada' });
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar receta
exports.updateRecipe = async (req, res) => {
  const idValidationMessage = validateRecipeId(req.params.id);
  if (idValidationMessage) {
    return res.status(400).json({ message: idValidationMessage });
  }

  const validationMessage = validateRecipePayload(req.body);
  if (validationMessage) {
    return res.status(400).json({ message: validationMessage });
  }

  try {
    const recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!recipe) return res.status(404).json({ message: 'Receta no encontrada' });
    res.json(recipe);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Eliminar receta
exports.deleteRecipe = async (req, res) => {
  const idValidationMessage = validateRecipeId(req.params.id);
  if (idValidationMessage) {
    return res.status(400).json({ message: idValidationMessage });
  }

  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Receta no encontrada' });
    res.json({ message: 'Receta eliminada' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

