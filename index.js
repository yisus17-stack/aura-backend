require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');

// Rutas de Aura
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/usuarios.routes');
const personajeRoutes = require('./routes/personajes.routes');
const logsRoutes = require('./routes/logs.routes');

const app = express();

// Inicializamos Supabase
connectDB();

app.set('trust proxy', 1);

// --- SEGURIDAD ---
app.use(helmet({ 
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false 
}));
app.use(express.json());

// Sanitización contra inyecciones
app.use((req, res, next) => {
  if (req.body) {
    const sanitizeStr = (str) => typeof str === 'string' ? str.replace(/\$/g, '') : str;
    for (const key in req.body) {
      req.body[key] = sanitizeStr(req.body[key]);
    }
  }
  next();
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  message: { error: 'Demasiadas peticiones a Aura. Intenta más tarde.' }
});
app.use(limiter);

// Middleware de logs automático
const logsMiddleware = require('./middleware/logs.middleware');
app.use(logsMiddleware);

// --- CORS ---
const allowedOrigins = [
  'http://localhost:5173',
  'https://auraa-nu.vercel.app', // Tu frontend principal
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    const isAllowed = !origin || allowedOrigins.includes(origin) || /^https:\/\/auraa-.*\.vercel\.app$/.test(origin);
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado por CORS - Proyecto Aura'));
    }
  },
  credentials: true
}));

// --- RUTAS ---
app.get('/api/health', (req, res) => {
  res.json({ ok: true, status: '🌌 AURA API Online' });
});

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/personajes', personajeRoutes);
app.use('/api/logs', logsRoutes);

app.use((req, res) => {
  res.status(404).json({ ok: false, message: 'Ruta no encontrada en Aura.' });
});

app.use((err, req, res, next) => {
  console.error('🔴 ERROR AURA:', err.stack);
  res.status(500).json({ ok: false, message: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3001;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🌌 Proyecto AURA corriendo en puerto ${PORT}`);
  });
}

module.exports = app;