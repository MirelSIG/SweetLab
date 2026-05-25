const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const User = require('../src/models/User');

async function main(){
  const MONGO_URI = process.env.MONGO_URI;
  if(!MONGO_URI){
    console.error('MONGO_URI not set in backend/.env');
    process.exit(1);
  }
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const users = await User.find({}, { username:1, role:1, createdAt:1 }).lean();
  console.log('Users in DB:\n', users);
  await mongoose.disconnect();
}

main().catch(err=>{ console.error(err); process.exit(1); });
