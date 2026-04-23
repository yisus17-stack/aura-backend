const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/auth.middleware');
const { getUsuarios, deleteUsuario } = require('../controllers/usuarios.controller');

// 🔥 rutas limpias
router.get('/', verificarToken, getUsuarios);
router.delete('/:id', verificarToken, deleteUsuario);

module.exports = router;