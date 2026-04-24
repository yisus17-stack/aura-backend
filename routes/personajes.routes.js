const express = require('express');
const router = express.Router();

const verificarToken = require('../middleware/auth.middleware');
const optionalAuth = require('../middleware/optionalAuth.middleware');

const {
  getPersonajes,
  getPersonajeById,
  createPersonaje,
  deletePersonaje
} = require('../controllers/personajes.controller');

router.get('/', optionalAuth, getPersonajes);
router.get('/:id', optionalAuth, getPersonajeById);

router.post('/', verificarToken, createPersonaje);
router.delete('/:id', verificarToken, deletePersonaje);

module.exports = router;
