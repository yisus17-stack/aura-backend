const Usuario = require('../models/Usuario');
const { registrarLog } = require('../utils/logger');

exports.getUsuarios = async (req, res) => {
  const usuarios = await Usuario.find().select('-password');

  registrarLog("GET_USUARIOS", req.user.email, "success");

  res.json(usuarios);
};

exports.deleteUsuario = async (req, res) => {
  await Usuario.findByIdAndDelete(req.params.id);

  registrarLog("DELETE_USUARIO", req.user.email, "success");

  res.json({ mensaje: "Eliminado" });
};