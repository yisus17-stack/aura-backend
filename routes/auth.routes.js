const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/auth.middleware');
const { login, register, getProfile } = require('../controllers/auth.controller');

router.post('/login', login);
router.post('/register', register);
router.get('/profile', verificarToken, getProfile);

module.exports = router;