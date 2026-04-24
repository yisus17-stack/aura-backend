const Log = require('../models/Log');

function registrarLog(accion, usuario, status, detalles = '') {
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
  const safeLimit = Math.max(1, Math.min(Number(limit) || 100, 500));

  return Log.find()
    .sort({ timestamp: -1 })
    .limit(safeLimit)
    .lean();
}

module.exports = { registrarLog, obtenerLogs };
