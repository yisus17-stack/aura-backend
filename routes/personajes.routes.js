const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/auth.middleware');
const { getPersonajes, createPersonaje, deletePersonaje } = require('../controllers/personajes.controller');

// 🔥 RUTAS LIMPIAS
router.get('/', getPersonajes);
router.post('/', verificarToken, createPersonaje);
router.delete('/:id', verificarToken, deletePersonaje);

module.exports = router;