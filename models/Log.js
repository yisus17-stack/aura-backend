const mongoose = require('mongoose');

const logSchema = new mongoose.Schema(
  {
    accion: {
      type: String,
      required: true,
      trim: true
    },
    usuario: {
      type: String,
      default: 'desconocido',
      trim: true
    },
    status: {
      type: String,
      default: 'success',
      trim: true
    },
    detalles: {
      type: String,
      default: '',
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    versionKey: false
  }
);

module.exports = mongoose.model('Log', logSchema);
