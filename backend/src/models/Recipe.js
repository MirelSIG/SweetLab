const mongoose = require('mongoose');
const RecipeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    ingredients: [{ type: String, required: true }],
    steps: [{ type: String, required: true }],
    tags: [{ type: String }]
}, { timestamps: true });
module.exports = mongoose.model('Recipe', RecipeSchema);