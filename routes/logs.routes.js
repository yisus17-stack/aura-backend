const express = require('express');
const router = express.Router();
const { obtenerLogs } = require('../utils/logger');
const verificarToken = require('../middleware/auth.middleware'); // <-- Importalo

// Agrégale el middleware aquí
router.get('/', verificarToken, async (req, res) => {
  // PLUS: Solo deja pasar si el rol es admin
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'No tienes permisos de administrador' });
  }

  try {
    const logs = await obtenerLogs(req.query.limit);
    res.json(logs);
  } catch (error) {
    console.error('🔴 Error en GET_LOGS:', error.message);
    res.status(500).json({ error: 'No se pudieron obtener los logs', message: error.message });
  }
});

module.exports = router;