const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI no esta definido en backend/.env');
  process.exit(1);
}

async function main() {
  try {
    const file = path.resolve(__dirname, '..', '..', 'frontend', 'src', 'assets', 'recipes.json');
    const raw = fs.readFileSync(file, 'utf8');
    const recipes = JSON.parse(raw);

    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;

    let inserted = 0;
    let skipped = 0;

    for (const r of recipes) {
      const titleNorm = (r.title || '').trim().toLowerCase();
      if (!titleNorm) {
        skipped++;
        continue;
      }

      // Check existing by normalized title
      const existing = await db.collection('recipes').findOne({
        $expr: { $eq: [ { $toLower: { $trim: { input: '$title' } } }, titleNorm ] }
      });

      if (existing) {
        skipped++;
        continue;
      }

      // Insert document as-is
      await db.collection('recipes').insertOne(r);
      inserted++;
    }

    console.log(`Import completo. Insertadas: ${inserted}, Saltadas: ${skipped}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error importando recetas:', err);
    process.exit(1);
  }
}

main();
