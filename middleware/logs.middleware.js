const logsMiddleware = (req, res, next) => {
  // Actualmente vacío para evitar exceso de logs.
  // Solo dependemos de los logs manuales hermosos que ya tienes en tus controladores.
  next();
};

module.exports = logsMiddleware;