const mongoose = require('mongoose');

// Configuración de caché para evitar múltiples conexiones en Vercel
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // 1. Reutilizar conexión si existe
  if (cached.conn) {
    console.log('🟢 Usando conexión existente (caché)');
    return cached.conn;
  }

  // 2. Si no hay promesa de conexión, crearla con lógica de reintento
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // Aumentado a 10s para dar margen
      socketTimeoutMS: 45000,
      family: 4,                      // Forzar IPv4 para evitar errores de DNS en Atlas
      maxPoolSize: 1,                 // Optimizado para Serverless
    };

    console.log('⏳ Estableciendo nueva conexión con MongoDB Atlas...');

    // Lógica de reintento: Si falla, limpia la promesa para que el próximo request intente de nuevo
    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts)
      .then((mongooseInstance) => {
        return mongooseInstance;
      })
      .catch((err) => {
        cached.promise = null; // Limpiar caché si falla
        console.error('🔴 Error crítico al conectar a Mongo:', err.message);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    console.log('🟢 Mongo conectado con éxito');
  } catch (e) {
    cached.conn = null;
    throw e;
  }

  return cached.conn;
};

module.exports = connectDB;