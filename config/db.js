const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.log('⚠️  MONGODB_URI no configurada, corriendo sin base de datos');
      return;
    }

    // Configuración mejorada para Vercel: timeouts más largos y retry automático
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,    // 30 segundos para seleccionar servidor
      socketTimeoutMS: 45000,              // 45 segundos para operaciones
      connectTimeoutMS: 30000,             // 30 segundos para conectar
      retryWrites: true,                   // Reintentar escrituras
      retryReads: true,                    // Reintentar lecturas
      maxPoolSize: 10,                     // Máximo de conexiones en el pool
      waitQueueTimeoutMS: 10000,           // Tiempo de espera en la cola
    });

    console.log('🟢 Mongo conectado - Timeouts configurados para Vercel');
    
    // Manejar desconexión
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  Desconectado de MongoDB, intentando reconectar...');
    });

    mongoose.connection.on('error', (error) => {
      console.log('🔴 Error en conexión MongoDB:', error.message);
    });

  } catch (error) {
    console.log('🔴 Error Mongo en conexión inicial:', error.message);
    console.log('⚠️  Continuando sin base de datos...');
    // No hacer process.exit(1) para que el servidor siga corriendo
  }
};

module.exports = connectDB;