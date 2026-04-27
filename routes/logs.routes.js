const express = require('express');
const router = express.Router();
const { obtenerLogs } = require('../utils/logger');
const verificarToken = require('../middleware/auth.middleware');
const OWNER_EMAIL = 'esquivelyisus17@gmail.com';

// Agrégale el middleware aquí
router.get('/', verificarToken, async (req, res) => {
  // 🛡️ Solo los admins pueden ver los logs
  if (!req.user.rol || req.user.rol.toLowerCase() !== 'admin') {
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

// Ruta para limpiar todos los logs (Botón de borrar logs)
router.delete('/', verificarToken, async (req, res) => {
  const requesterEmail = req.user.email;

  // 🛡️ SOLO EL DUEÑO PUEDE LIMPIAR LOS LOGS
  if (requesterEmail !== OWNER_EMAIL) {
    const { registrarLog: regLogViolation } = require('../utils/logger');
    regLogViolation('SECURITY_VIOLATION', requesterEmail, 'warning', 'Intento de limpieza de logs sin ser Super Admin');
    return res.status(403).json({ error: 'Solo el Super Admin puede limpiar el historial' });
  }

  try {
    const supabase = require('../config/db')();
    if (!supabase) return res.status(503).json({ error: 'DB no disponible' });

    // Borra todo lo que tenga un ID mayor a 0 (es decir, todo)
    const { error } = await supabase.from('logs').delete().gt('id', 0);
    
    if (error) throw error;

    const { registrarLog } = require('../utils/logger');
    registrarLog('CLEAR_LOGS', requesterEmail, 'success', 'Limpió el historial de logs');

    res.json({ message: 'Logs limpiados' });
  } catch (error) {
    console.error('🔴 Error al limpiar logs:', error.message);
    res.status(500).json({ error: 'Error al limpiar' });
  }
});

module.exports = router;