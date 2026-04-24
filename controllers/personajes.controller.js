const jwt = require('jsonwebtoken');
const Personaje = require('../models/Personaje');
const { registrarLog } = require('../utils/logger');

const getEmailFromRequest = (req) => {
  if (req.user?.email) {
    return req.user.email;
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return 'desconocido';
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secreto_super_pro'
    );

    return decoded.email || 'desconocido';
  } catch (error) {
    return 'desconocido';
  }
};

const getPersonajes = async (req, res) => {
  const data = await Personaje.find();
  registrarLog('GET_PERSONAJES', getEmailFromRequest(req), 'success');
  res.json(data);
};

const getPersonajeById = async (req, res) => {
  try {
    const data = await Personaje.findById(req.params.id);

    if (!data) {
      registrarLog(
        'GET_PERSONAJE_DETAIL',
        getEmailFromRequest(req),
        'warning',
        `Personaje no encontrado: ${req.params.id}`
      );
      return res.status(404).json({ message: 'No existe el personaje' });
    }

    registrarLog(
      'GET_PERSONAJE_DETAIL',
      getEmailFromRequest(req),
      'success',
      `Detalle consultado: ${data.nombre}`
    );

    res.json(data);
  } catch (error) {
    registrarLog(
      'GET_PERSONAJE_DETAIL',
      getEmailFromRequest(req),
      'error',
      `Error consultando personaje: ${req.params.id}`
    );
    res.status(500).json({ message: 'Error servidor' });
  }
};

const createPersonaje = async (req, res) => {
  const nuevo = new Personaje(req.body);
  await nuevo.save();

  registrarLog('CREATE_PERSONAJE', req.user.email, 'success');

  res.json(nuevo);
};

const deletePersonaje = async (req, res) => {
  await Personaje.findByIdAndDelete(req.params.id);

  registrarLog('DELETE_PERSONAJE', req.user.email, 'success');

  res.json({ mensaje: 'Eliminado' });
};

module.exports = {
  getPersonajes,
  getPersonajeById,
  createPersonaje,
  deletePersonaje
};
