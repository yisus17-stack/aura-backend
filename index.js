require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/usuarios.routes');
const personajeRoutes = require('./routes/personajes.routes');
const logsRoutes = require('./routes/logs.routes');

const app = express();

// DB
connectDB();

// Middlewares
// Seguridad Básica S-SDLC
app.use(helmet({ crossOriginResourcePolicy: false })); // Para poder cargar imágenes si es necesario

// Sanitización básica manual para req.body (prevenir inyecciones NoSQL simples)
app.use((req, res, next) => {
  if (req.body) {
    const sanitizeStr = (str) => typeof str === 'string' ? str.replace(/\$/g, '') : str;
    for (const key in req.body) {
      req.body[key] = sanitizeStr(req.body[key]);
    }
  }
  next();
});

// Rate limiting (evitar fuerza bruta y DDoS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // Límite de peticiones por IP
  message: { error: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo más tarde.' }
});
app.use(limiter);

app.use(cors({
  origin: ['http://localhost:5173'], // Vite dev
  credentials: true
}));
app.use(express.json());
app.use('/images', express.static('images'));

// Health check (útil para debug/deploy)
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'API funcionando 🚀' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/personajes', personajeRoutes);
app.use('/api/logs', logsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ ok: false, message: 'Error del servidor' });
});

// Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🔥 API corriendo en http://localhost:${PORT}`);
});