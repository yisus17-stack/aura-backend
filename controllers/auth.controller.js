const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const usuario = await Usuario.findOne({ email });

    if (!usuario) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const match = await bcrypt.compare(password, usuario.password);

    if (!match) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      {
        id: usuario._id,
        email: usuario.email,
        rol: usuario.rol
      },
      process.env.JWT_SECRET || "secreto_super_pro",
      { expiresIn: "1h" }
    );

    res.json({
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      token
    });

  } catch (error) {
    res.status(500).json({ error: "Error servidor" });
  }
};

const register = async (req, res) => {
  const { nombre, email, password } = req.body;

  try {
    const existe = await Usuario.findOne({ email });

    if (existe) {
      return res.status(400).json({ error: "El usuario ya existe" });
    }

    const hash = await bcrypt.hash(password, 10);

    const nuevoUsuario = new Usuario({
      nombre,
      email,
      password: hash,
      rol: "user"
    });

    await nuevoUsuario.save();

    res.json({
      message: "Usuario creado correctamente"
    });

  } catch (error) {
    res.status(500).json({ error: "Error servidor" });
  }
};

module.exports = {
  login,
  register
};