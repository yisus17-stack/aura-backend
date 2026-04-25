const jwt = require('jsonwebtoken');
const Personaje = require('../models/Personaje');
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
  try {
    const data = await Personaje.find();
    registrarLog('GET_PERSONAJES', getEmailFromRequest(req), 'success');
    res.json(data);
  } catch (error) {
    console.error('🔴 Error en GET_PERSONAJES:', error.message);
    registrarLog('GET_PERSONAJES', getEmailFromRequest(req), 'error', error.message);
    res.status(500).json({ message: 'Error al obtener personajes', error: error.message });
  }
};

const getPersonajeById = async (req, res) => {
  try {
    const data = await Personaje.findById(req.params.id);
    if (!data) {
      registrarLog('GET_PERSONAJE_DETAIL', getEmailFromRequest(req), 'warning', `No encontrado: ${req.params.id}`);
      return res.status(404).json({ message: 'No existe el personaje' });
    }
    registrarLog('GET_PERSONAJE_DETAIL', getEmailFromRequest(req), 'success', `Consultado: ${data.nombre}`);
    res.json(data);
  } catch (error) {
    console.error('🔴 Error en GET_PERSONAJE_DETAIL:', error.message);
    registrarLog('GET_PERSONAJE_DETAIL', getEmailFromRequest(req), 'error', error.message);
    res.status(500).json({ message: 'Error servidor', error: error.message });
  }
};

const createPersonaje = async (req, res) => {
  try {
    const nuevo = new Personaje(req.body);
    await nuevo.save();
    // Usamos getEmailFromRequest para evitar errores de undefined
    registrarLog('CREATE_PERSONAJE', getEmailFromRequest(req), 'success', `Creado: ${nuevo.nombre}`);
    res.status(201).json(nuevo);
  } catch (error) {
    console.error('🔴 Error en CREATE_PERSONAJE:', error.message);
    registrarLog('CREATE_PERSONAJE', getEmailFromRequest(req), 'error', error.message);
    res.status(400).json({ message: 'Error al crear personaje', error: error.message });
  }
};

const deletePersonaje = async (req, res) => {
  try {
    const eliminado = await Personaje.findByIdAndDelete(req.params.id);
    if (!eliminado) {
      return res.status(404).json({ message: 'No se encontró el personaje para eliminar' });
    }
    registrarLog('DELETE_PERSONAJE', getEmailFromRequest(req), 'success', `ID eliminado: ${req.params.id}`);
    res.json({ mensaje: 'Eliminado correctamente' });
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