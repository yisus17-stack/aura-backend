const jwt = require('jsonwebtoken');
const supabaseClient = require('../config/db');
const { registrarLog } = require('../utils/logger');

// Tu función auxiliar está excelente, la mantenemos
const getEmailFromRequest = (req) => {
  if (req.user?.email) return req.user.email;
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return 'desconocido';
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_super_pro');
    return decoded.email || 'desconocido';
  } catch (error) {
    return 'desconocido';
  }
};

const getPersonajes = async (req, res) => {
  const supabase = supabaseClient();

  if (!supabase) {
    return res.status(503).json({ message: 'La base de datos no está disponible' });
  }

  try {
    const { data, error } = await supabase
      .from('personajes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    registrarLog('GET_PERSONAJES', getEmailFromRequest(req), 'success');
    res.json(data);
  } catch (error) {
    console.error('🔴 Error en GET_PERSONAJES:', error.message);
    registrarLog('GET_PERSONAJES', getEmailFromRequest(req), 'error', error.message);
    res.status(500).json({ message: 'Error al obtener personajes', error: error.message });
  }
};

const getPersonajeById = async (req, res) => {
  const supabase = supabaseClient();

  if (!supabase) {
    return res.status(503).json({ message: 'La base de datos no está disponible' });
  }

  try {
    const { data, error } = await supabase
      .from('personajes')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error && error.code === 'PGRST116') {
      return res.status(404).json({ message: 'No existe el personaje' });
    }
    if (error) throw error;

    registrarLog('GET_PERSONAJE_DETAIL', getEmailFromRequest(req), 'success', `Consultado: ${data.nombre}`);
    res.json(data);
  } catch (error) {
    console.error('🔴 Error en GET_PERSONAJE_DETAIL:', error.message);
    registrarLog('GET_PERSONAJE_DETAIL', getEmailFromRequest(req), 'error', error.message);
    res.status(500).json({ message: 'Error servidor', error: error.message });
  }
};

const createPersonaje = async (req, res) => {
  const supabase = supabaseClient();

  if (!supabase) {
    return res.status(503).json({ message: 'La base de datos no está disponible' });
  }

  try {
    const { data, error } = await supabase
      .from('personajes')
      .insert([req.body])
      .select('*')
      .single();

    if (error) throw error;

    registrarLog('CREATE_PERSONAJE', getEmailFromRequest(req), 'success', `Creado: ${data.nombre}`);
    res.status(201).json(data);
  } catch (error) {
    console.error('🔴 Error en CREATE_PERSONAJE:', error.message);
    registrarLog('CREATE_PERSONAJE', getEmailFromRequest(req), 'error', error.message);
    res.status(400).json({ message: 'Error al crear personaje', error: error.message });
  }
};

const deletePersonaje = async (req, res) => {
  const supabase = supabaseClient();

  if (!supabase) {
    return res.status(503).json({ message: 'La base de datos no está disponible' });
  }

  try {
    const { data, error } = await supabase
      .from('personajes')
      .delete()
      .eq('id', req.params.id)
      .single();

    if (error && error.code === 'PGRST116') {
      return res.status(404).json({ message: 'No se encontró el personaje para eliminar' });
    }
    if (error) throw error;

    registrarLog('DELETE_PERSONAJE', getEmailFromRequest(req), 'success', `ID eliminado: ${req.params.id}`);
    res.json({ mensaje: 'Eliminado correctamente', data });
  } catch (error) {
    console.error('🔴 Error en DELETE_PERSONAJE:', error.message);
    registrarLog('DELETE_PERSONAJE', getEmailFromRequest(req), 'error', error.message);
    res.status(500).json({ message: 'Error al eliminar', error: error.message });
  }
};

module.exports = {
  getPersonajes,
  getPersonajeById,
  createPersonaje,
  deletePersonaje
};