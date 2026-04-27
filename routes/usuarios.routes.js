const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/auth.middleware');
const { getUsuarios, deleteUsuario, updateRol } = require('../controllers/usuarios.controller');

// 🔥 rutas limpias
router.get('/', verificarToken, getUsuarios);
router.delete('/:id', verificarToken, deleteUsuario);
router.put('/:id/rol', verificarToken, updateRol); // 🔐 Solo accesible internamente por validación de email en el controlador

module.exports = router;