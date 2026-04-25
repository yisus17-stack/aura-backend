const mongoose = require('mongoose');

let isConnecting = false;

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.log('⚠️  MONGODB_URI no configurada, corriendo sin base de datos');
      return;
    }

    if (mongoose.connection.readyState === 1) {
      console.log('🟢 Mongo ya conectado');
      return;
    }

    if (isConnecting) {
      console.log('⏳ Conexión a MongoDB en progreso...');
      return;
    }

    isConnecting = true;

    // Configuración OPTIMIZADA para Vercel serverless
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 60000,     // 60s para encontrar servidor (Vercel es lento)
      socketTimeoutMS: 60000,               // 60s para operaciones socket
      connectTimeoutMS: 60000,              // 60s para conectar
      retryWrites: true,                    // Reintentar escrituras automáticamente
      retryReads: true,                     // Reintentar lecturas automáticamente
      maxPoolSize: 5,                       // REDUCIDO: Vercel instancias son efímeras
      minPoolSize: 1,                       // Mínimo 1 conexión siempre lista
      maxIdleTimeMS: 30000,                 // Cerrar conexiones inactivas después de 30s
      waitQueueTimeoutMS: 30000,            // Aumentado: esperar 30s en la cola
      heartbeatFrequencyMS: 10000,          // Heartbeat cada 10s para detectar desconexiones
      appName: 'aura-backend-vercel',       // Para debugging en Atlas
    });

    isConnecting = false;
    console.log('🟢 Mongo conectado - Pool optimizado para Vercel');
    
    // Event listeners para debugging
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  Desconectado de MongoDB');
      isConnecting = false;
    });

    mongoose.connection.on('error', (error) => {
      console.log('🔴 Error en conexión MongoDB:', error.message);
      isConnecting = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 Reconectado a MongoDB');
    });

  } catch (error) {
    isConnecting = false;
    console.log('🔴 Error Mongo en conexión inicial:', error.message);
    console.log('💡 Tip: Verifica que MONGODB_URI sea válida y que la IP esté en whitelist');
    // No hacer process.exit(1) para que el servidor siga corriendo
  }
};

module.exports = connectDB;