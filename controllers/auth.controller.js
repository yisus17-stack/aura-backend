const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const supabaseClient = require('../config/db');
const { registrarLog } = require('../utils/logger');

const login = async (req, res) => {
  const { email, password } = req.body;
  const supabase = supabaseClient();

  if (!supabase) {
    console.error('🔴 LOGIN FALLIDO: Supabase no inicializado');
    return res.status(503).json({ error: 'La base de datos no está disponible' });
  }

  try {
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('id, nombre, email, password, rol')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

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
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol
      },
      process.env.JWT_SECRET || 'secreto_super_pro',
      { expiresIn: '1h' }
    );

    registrarLog('LOGIN', usuario.email, 'success', 'Inicio de sesión correcto');

    res.json({
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      token
    });
  } catch (error) {
    console.error('🔴 Error en LOGIN:', error.message);
    registrarLog('LOGIN', email, 'error', `Error servidor: ${error.message}`);
    res.status(500).json({ error: 'Error servidor', details: error.message });
  }
};

const register = async (req, res) => {
  const { nombre, email, password } = req.body;
  const supabase = supabaseClient();

  if (!supabase) {
    console.error('🔴 REGISTER FALLIDO: Supabase no inicializado');
    return res.status(503).json({ error: 'La base de datos no está disponible' });
  }

  try {
    const { data: existe, error: queryError } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .single();

    if (queryError && queryError.code !== 'PGRST116') {
      throw queryError;
    }

    if (existe) {
      registrarLog('REGISTER', email, 'warning', 'Intento de registro duplicado');
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    const hash = await bcrypt.hash(password, 10);

    const { data: nuevoUsuario, error: insertError } = await supabase
      .from('usuarios')
      .insert([
        {
          nombre,
          email,
          password: hash,
          rol: 'user'
        }
      ])
      .select('id, nombre, email, rol')
      .single();

    if (insertError) {
      throw insertError;
    }

    registrarLog('REGISTER', nuevoUsuario.email, 'success', 'Usuario creado correctamente');

    res.json({ message: 'Usuario creado correctamente' });
  } catch (error) {
    console.error('🔴 Error en REGISTER:', error.message);
    registrarLog('REGISTER', email, 'error', `Error servidor: ${error.message}`);
    res.status(500).json({ error: 'Error servidor', details: error.message });
  }
};

module.exports = {
  login,
  register
};