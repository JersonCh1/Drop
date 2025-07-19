// backend/src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString() 
  });
});

// Ruta básica para probar la base de datos
app.get('/api/test-db', async (req, res) => {
  try {
    const { Client } = require('pg');
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    await client.connect();
    
    // Crear tabla si no existe
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        "firstName" TEXT NOT NULL,
        "lastName" TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    const result = await client.query('SELECT COUNT(*) as user_count FROM users');
    await client.end();

    res.json({ 
      success: true, 
      message: 'Conexión a Supabase exitosa! 🎉',
      userCount: result.rows[0].user_count,
      provider: 'Supabase PostgreSQL'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error de conexión',
      error: error.message 
    });
  }
});

// Rutas de API básicas
app.use('/api/auth', (req, res) => {
  res.json({ message: 'Rutas de autenticación - próximamente' });
});

app.use('/api/products', (req, res) => {
  res.json({ message: 'Rutas de productos - próximamente' });
});

app.use('/api/orders', (req, res) => {
  res.json({ message: 'Rutas de pedidos - próximamente' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
  });
});

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`🏥 Health check en http://localhost:${PORT}/health`);
  console.log(`🗄️  Test DB en http://localhost:${PORT}/api/test-db`);
  console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;