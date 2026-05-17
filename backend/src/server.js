const app = require('./app');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;
console.log('Starting server with PORT:', PORT);
console.log('MONGO_URI present:', !!MONGO_URI);
console.log('All env vars keys:', Object.keys(process.env).filter(k => k.includes('MONGO') || k.includes('JWT')).join(', '));
const fs = require('fs');

console.log('\n=== SweetLab Server Startup ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('process.cwd():', process.cwd());
console.log('__dirname:', __dirname);
console.log('PORT:', PORT);
console.log('MONGO_URI present:', !!MONGO_URI);

// List current directory and parent
console.log('\nDirectory contents:');
try {
  console.log('  Current dir files:', fs.readdirSync(process.cwd()).slice(0, 10).join(', '));
  const parentDir = path.resolve(process.cwd(), '..');
  if (fs.existsSync(parentDir)) {
    console.log('  Parent dir files:', fs.readdirSync(parentDir).slice(0, 10).join(', '));
  }
} catch (e) {
  console.log('  (Could not read dirs)');
}

if (!MONGO_URI) {
  console.error('ERROR: MONGO_URI no está definido.');
  throw new Error('MONGO_URI no esta definido en el archivo .env del backend');
}

console.log('=== SweetLab Server Startup ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('process.cwd():', process.cwd());

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✓ Conectado a MongoDB');
    app.listen(PORT, () => {
      console.log(`\n✓ Servidor corriendo en http://localhost:${PORT}`);
      console.log('✓ API disponible en /api');
      console.log('✓ Frontend disponible en /\n');
    });
  })
  .catch((err) => {
    console.error('✗ Error al conectar a MongoDB:', err.message);
  });

