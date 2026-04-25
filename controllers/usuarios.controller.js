const Usuario = require('../models/Usuario');
const { registrarLog } = require('../utils/logger');

exports.getUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find().select('-password');

    registrarLog("GET_USUARIOS", req.user.email, "success");

    res.json(usuarios);
  } catch (error) {
    console.error('🔴 Error en GET_USUARIOS:', error.message);
    registrarLog("GET_USUARIOS", req.user?.email || 'desconocido', "error", error.message);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

exports.deleteUsuario = async (req, res) => {
  try {
    await Usuario.findByIdAndDelete(req.params.id);

    registrarLog("DELETE_USUARIO", req.user.email, "success");

    res.json({ mensaje: "Eliminado" });
  } catch (error) {
    console.error('🔴 Error en DELETE_USUARIO:', error.message);
    registrarLog("DELETE_USUARIO", req.user?.email || 'desconocido', "error", error.message);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};