const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombre: String,
  email: { type: String, unique: true },
  password: String,
  rol: { type: String, default: 'User' }
});

module.exports = mongoose.model('Usuario', userSchema);