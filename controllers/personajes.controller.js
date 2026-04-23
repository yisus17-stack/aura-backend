const Personaje = require('../models/Personaje');
const { registrarLog } = require('../utils/logger');

exports.getPersonajes = async (req, res) => {
  const data = await Personaje.find();
  registrarLog("GET_PERSONAJES", "sistema", "success");
  res.json(data);
};

exports.createPersonaje = async (req, res) => {
  const nuevo = new Personaje(req.body);
  await nuevo.save();

  registrarLog("CREATE_PERSONAJE", req.user.email, "success");

  res.json(nuevo);
};

exports.deletePersonaje = async (req, res) => {
  await Personaje.findByIdAndDelete(req.params.id);

  registrarLog("DELETE_PERSONAJE", req.user.email, "success");

  res.json({ mensaje: "Eliminado" });
};