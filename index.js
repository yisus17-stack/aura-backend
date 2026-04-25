require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path'); // <--- 1. Importamos path

const connectDB = require('./config/db');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/usuarios.routes');
const personajeRoutes = require('./routes/personajes.routes');
const logsRoutes = require('./routes/logs.routes');

const app = express();

// DB
connectDB();

// Middlewares
app.use(helmet({ crossOriginResourcePolicy: false })); 

// Sanitización básica manual
app.use((req, res, next) => {
  if (req.body) {
    const sanitizeStr = (str) => typeof str === 'string' ? str.replace(/\$/g, '') : str;
    for (const key in req.body) {
      req.body[key] = sanitizeStr(req.body[key]);
    }
  }
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 150, 
  message: { error: 'Demasiadas peticiones desde esta IP.' }
});
app.use(limiter);

app.use(cors({
  origin: 'https://auraa-nu.vercel.app', // <--- TU URL REAL DEL FRONTEND
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 2. CONFIGURACIÓN DE IMÁGENES FINAL
// Esto busca las fotos en: backend/public/images
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Health check
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
  // Importante: Vercel necesita que el error también devuelva cabeceras CORS
  res.header("Access-Control-Allow-Origin", "https://auraa-nu.vercel.app");
  res.status(500).json({ ok: false, message: 'Error del servidor', details: err.message });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🔥 API corriendo en http://localhost:${PORT}`);
});