const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const User = require('../src/models/User');

async function main(){
  const MONGO_URI = process.env.MONGO_URI;
  if(!MONGO_URI){
    console.error('MONGO_URI not set in backend/.env');
    process.exit(1);
  }

  const newPassword = 'AdminPass123';
  console.log('Connecting to DB...');
  await mongoose.connect(MONGO_URI);
  const user = await User.findOne({ username: 'admin' });
  if(!user){
    console.error('User `admin` not found');
    await mongoose.disconnect();
    process.exit(2);
  }

  const hash = await bcrypt.hash(newPassword, 10);
  user.passwordHash = hash;
  await user.save();
  console.log('Password for user `admin` updated to:', newPassword);
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
