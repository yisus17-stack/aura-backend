let logsAuditoria = [];

function registrarLog(accion, usuario, status, detalles = "") {
  const log = {
    id: Date.now(),
    accion,
    usuario,
    status,
    detalles,
    timestamp: new Date().toISOString()
  };

  logsAuditoria.unshift(log);
  if (logsAuditoria.length > 100) logsAuditoria.pop();
}

function obtenerLogs() {
  return logsAuditoria;
}

module.exports = { registrarLog, obtenerLogs };