const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.log('⚠️  MONGODB_URI no configurada, corriendo sin base de datos');
      return;
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🟢 Mongo conectado');
  } catch (error) {
    console.log('🔴 Error Mongo:', error.message);
    console.log('⚠️  Continuando sin base de datos...');
    // No hacer process.exit(1) para que el servidor siga corriendo
  }
};

module.exports = connectDB;