const express = require('express');
const router = express.Router();
const { obtenerLogs } = require('../utils/logger');

// 🔥 ruta limpia
router.get('/', (req, res) => {
  res.json(obtenerLogs());
});

module.exports = router;