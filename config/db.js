const mongoose = require('mongoose');

/**
 * En Vercel, las funciones se "congelan". Usar global previene que cada 
 * petición abra una nueva conexión (lo que saturaría tu Atlas).
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // 1. Si ya estamos conectados, regresamos la conexión existente
  if (cached.conn) {
    console.log('🟢 Reutilizando conexión de MongoDB (Cache)');
    return cached.conn;
  }

  // 2. Si no hay una promesa de conexión, la creamos
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // ¡CRÍTICO! Si no hay conexión, falla rápido en vez de esperar
      serverSelectionTimeoutMS: 8000,   // 8 segundos para encontrar el servidor
      socketTimeoutMS: 45000,
      family: 4,                        // Fuerza IPv4 (a veces Vercel tarda con IPv6)
      maxPoolSize: 1,                   // En Serverless, 1 es suficiente por instancia
    };

    console.log('⏳ Iniciando nueva conexión a MongoDB...');
    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    // 3. Esperamos a que la promesa se resuelva
    cached.conn = await cached.promise;
    console.log('🟢 Mongo conectado exitosamente');
  } catch (error) {
    cached.promise = null; // Si falló, permitimos reintentar en la próxima petición
    console.log('🔴 Error en conexión MongoDB:', error.message);
    throw error; 
  }

  return cached.conn;
};

module.exports = connectDB;