const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const Recipe = require('../src/models/Recipe');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI no esta definido en el archivo .env del backend');
  process.exit(1);
}

const recipesFile = path.resolve(__dirname, '..', '..', 'docs', 'recipes-example.json');

async function main() {
  try {
    const data = fs.readFileSync(recipesFile, 'utf8');
    const recipes = JSON.parse(data);

    await mongoose.connect(MONGO_URI);
    console.log('Conectado a MongoDB');

    // Si se pasa --wipe, borramos todas las recetas antes de insertar
    if (process.argv.includes('--wipe')) {
      await Recipe.deleteMany({});
      console.log('Colección `recipes` vaciada.');
    }

    const result = await Recipe.insertMany(recipes, { ordered: false });
    console.log(`Insertadas ${result.length} recetas.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error al insertar recetas:', err.message || err);
    process.exit(1);
  }
}

main();
