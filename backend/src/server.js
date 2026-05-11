const app = require('./app');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;
console.log('Starting server with PORT:', PORT);
console.log('MONGO_URI present:', !!MONGO_URI);
console.log('All env vars keys:', Object.keys(process.env).filter(k => k.includes('MONGO') || k.includes('JWT')).join(', '));
if (!MONGO_URI) {
  console.error('ERROR: MONGO_URI no está definido. Env vars disponibles:', Object.keys(process.env).filter(k => k.includes('MONGO') || k.includes('JWT')));
  throw new Error('MONGO_URI no esta definido en el archivo .env del backend');
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Conectado a MongoDB');
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error al conectar a MongoDB:', err.message);
  });

