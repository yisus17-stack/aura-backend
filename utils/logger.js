const Log = require('../models/Log');

// Verificar si MongoDB está disponible
let mongoAvailable = false;
const mongoose = require('mongoose');

// Verificar conexión cada vez que se intente usar
function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

function registrarLog(accion, usuario, status, detalles = '') {
  // Si no hay conexión a MongoDB, no guardar logs pero no fallar
  if (!isMongoConnected()) {
    console.log(`[LOG] ${accion} - ${usuario} - ${status} - ${detalles}`);
    return;
  }

  const log = {
    accion,
    usuario: usuario || 'desconocido',
    status: status || 'success',
    detalles,
    timestamp: new Date()
  };

  Log.create(log).catch((error) => {
    console.error('Error guardando log en MongoDB:', error.message);
  });
}

async function obtenerLogs(limit = 100) {
  // Si no hay conexión a MongoDB, devolver array vacío
  if (!isMongoConnected()) {
    console.log('MongoDB no disponible, devolviendo logs vacíos');
    return [];
  }

  const safeLimit = Math.max(1, Math.min(Number(limit) || 100, 500));

  return Log.find()
    .sort({ timestamp: -1 })
    .limit(safeLimit)
    .lean();
}

module.exports = { registrarLog, obtenerLogs };
