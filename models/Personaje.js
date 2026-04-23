const mongoose = require('mongoose');

const personajeSchema = new mongoose.Schema({
  nombre: String,
  pelicula: String,
  anio: Number,
  categoria: String,
  imagen: String,
  descripcion: String
});

module.exports = mongoose.model('Personaje', personajeSchema);