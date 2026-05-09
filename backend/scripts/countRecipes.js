const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI no esta definido en backend/.env');
  process.exit(1);
}

async function main() {
  try {
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;
    const docs = await db.collection('recipes').find().limit(5).toArray();
    const count = await db.collection('recipes').countDocuments();
    console.log('count:' + count);
    console.log('sample:' + JSON.stringify(docs, null, 2));
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
