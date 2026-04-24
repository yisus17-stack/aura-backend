const express = require('express');
const router = express.Router();
const { obtenerLogs } = require('../utils/logger');

router.get('/', async (req, res) => {
  try {
    const logs = await obtenerLogs(req.query.limit);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron obtener los logs' });
  }
});

module.exports = router;
