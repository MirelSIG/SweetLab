const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI no esta definido en el archivo .env del backend');
  process.exit(1);
}

async function main() {
  try {
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;

    // Agrupar por título normalizado (trim + lowercase)
    const pipeline = [
      {
        $project: {
          titleNorm: { $toLower: { $trim: { input: '$title' } } },
          createdAt: 1
        }
      },
      {
        $group: {
          _id: '$titleNorm',
          ids: { $push: '$_id' },
          docs: { $push: { id: '$_id', createdAt: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $match: { count: { $gt: 1 } } }
    ];

    const cursor = db.collection('recipes').aggregate(pipeline);
    const groups = await cursor.toArray();

    if (groups.length === 0) {
      console.log('No se encontraron duplicados por título.');
      await mongoose.disconnect();
      process.exit(0);
    }

    let totalRemoved = 0;
    for (const group of groups) {
      // Recuperar documentos completos para decidir cuál conservar (el más antiguo)
      const docs = await db
        .collection('recipes')
        .find({ _id: { $in: group.ids } })
        .project({ _id: 1, createdAt: 1 })
        .toArray();

      // Ordenar por createdAt asc (si no existe createdAt, quedará al final)
      docs.sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : Infinity;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : Infinity;
        return ta - tb;
      });

      const keep = docs[0]._id;
      const remove = docs.slice(1).map((d) => d._id);

      if (remove.length > 0) {
        const res = await db.collection('recipes').deleteMany({ _id: { $in: remove } });
        console.log(`Título '${group._id}': eliminado(s) ${res.deletedCount}, conservado ${keep}`);
        totalRemoved += res.deletedCount || 0;
      }
    }

    console.log(`Proceso completado. Total eliminados: ${totalRemoved}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error durante deduplicación:', err);
    process.exit(1);
  }
}

main();
