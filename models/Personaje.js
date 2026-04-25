const mongoose = require('mongoose');

const personajeSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  pelicula: { type: String, required: true },
  anio: { type: Number, required: true },
  categoria: { type: String, enum: ['Pixar', 'Disney'], default: 'Disney' },
  imagen: { type: String, required: true },
  descripcion: { type: String, maxLength: 500 }
}, { timestamps: true });

module.exports = mongoose.model('Personaje', personajeSchema);