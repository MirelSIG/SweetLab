const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const User = require('../src/models/User');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error('MONGO_URI no esta definido en backend/.env');
}

const usersToSeed = [
  {
    role: 'admin',
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin123'
  },
  {
    role: 'externo',
    username: process.env.EXTERNAL_USERNAME || 'externo',
    password: process.env.EXTERNAL_PASSWORD || 'externo123'
  }
];

const seed = async () => {
  await mongoose.connect(MONGO_URI);

  for (const user of usersToSeed) {
    const passwordHash = await bcrypt.hash(user.password, 10);

    await User.findOneAndUpdate(
      { username: user.username },
      {
        $set: {
          username: user.username,
          role: user.role,
          passwordHash
        },
        $setOnInsert: { refreshTokens: [] }
      },
      { upsert: true, new: true }
    );

    console.log(`Usuario ${user.username} (${user.role}) listo.`);
  }

  await mongoose.disconnect();
  console.log('Seed de usuarios completado.');
};

seed().catch(async (error) => {
  console.error('Error en seed de usuarios:', error.message);
  await mongoose.disconnect();
  process.exit(1);
});