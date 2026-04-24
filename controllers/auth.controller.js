const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');
const { registrarLog } = require('../utils/logger');

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const usuario = await Usuario.findOne({ email });

    if (!usuario) {
      registrarLog('LOGIN', email, 'error', 'Usuario no encontrado');
      return res.status(401).json({ error: 'Credenciales invalidas' });
    }

    const match = await bcrypt.compare(password, usuario.password);

    if (!match) {
      registrarLog('LOGIN', usuario.email, 'error', 'Password incorrecto');
      return res.status(401).json({ error: 'Credenciales invalidas' });
    }

    const token = jwt.sign(
      {
        id: usuario._id,
        email: usuario.email,
        rol: usuario.rol
      },
      process.env.JWT_SECRET || 'secreto_super_pro',
      { expiresIn: '1h' }
    );

    registrarLog('LOGIN', usuario.email, 'success', 'Inicio de sesion correcto');

    res.json({
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      token
    });
  } catch (error) {
    registrarLog('LOGIN', email, 'error', 'Error servidor');
    res.status(500).json({ error: 'Error servidor' });
  }
};

const register = async (req, res) => {
  const { nombre, email, password } = req.body;

  try {
    const existe = await Usuario.findOne({ email });

    if (existe) {
      registrarLog('REGISTER', email, 'warning', 'Intento de registro duplicado');
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    const hash = await bcrypt.hash(password, 10);

    const nuevoUsuario = new Usuario({
      nombre,
      email,
      password: hash,
      rol: 'user'
    });

    await nuevoUsuario.save();

    registrarLog('REGISTER', nuevoUsuario.email, 'success', 'Usuario creado correctamente');

    res.json({
      message: 'Usuario creado correctamente'
    });
  } catch (error) {
    registrarLog('REGISTER', email, 'error', 'Error servidor');
    res.status(500).json({ error: 'Error servidor' });
  }
};

module.exports = {
  login,
  register
};
