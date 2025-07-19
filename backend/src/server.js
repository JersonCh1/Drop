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

// =================== FUNCIÓN PARA INICIALIZAR BASE DE DATOS ===================
async function initializeDatabase() {
  try {
    const { Client } = require('pg');
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    await client.connect();

    // Crear tabla de usuarios (existente)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        "firstName" TEXT NOT NULL,
        "lastName" TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Crear tabla de órdenes
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        customer_first_name VARCHAR(100) NOT NULL,
        customer_last_name VARCHAR(100) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50) NOT NULL,
        shipping_address TEXT NOT NULL,
        shipping_city VARCHAR(100) NOT NULL,
        shipping_state VARCHAR(100) NOT NULL,
        shipping_postal_code VARCHAR(20) NOT NULL,
        shipping_country VARCHAR(10) NOT NULL,
        notes TEXT,
        subtotal DECIMAL(10,2) NOT NULL,
        shipping_cost DECIMAL(10,2) NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Crear tabla de items de orden
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_name VARCHAR(255) NOT NULL,
        product_model VARCHAR(100) NOT NULL,
        product_color VARCHAR(50) NOT NULL,
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.end();
    console.log('✅ Base de datos inicializada correctamente');

  } catch (error) {
    console.error('❌ Error al inicializar base de datos:', error);
  }
}

// =================== RUTAS BÁSICAS ===================

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

// =================== RUTAS DE AUTENTICACIÓN ADMIN ===================

// POST /api/admin/login - Login de administrador
app.post('/api/admin/login', async (req, res) => {
  try {
    console.log('🔑 Intento de login admin:', req.body);
    const { username, password } = req.body;

    // Credenciales hardcodeadas (en producción usar base de datos)
    const ADMIN_USERNAME = 'admin';
    const ADMIN_PASSWORD = 'admin123';

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Generar token simple (en producción usar JWT real)
      const token = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('✅ Login exitoso, token generado:', token);
      
      res.json({
        success: true,
        message: 'Login exitoso',
        token,
        user: {
          username: 'admin',
          role: 'administrator'
        }
      });
    } else {
      console.log('❌ Credenciales incorrectas');
      res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas'
      });
    }
  } catch (error) {
    console.error('❌ Error en login admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// Middleware para verificar token de admin
function verifyAdminToken(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token || !token.startsWith('admin_')) {
    return res.status(401).json({
      success: false,
      message: 'Token de admin requerido'
    });
  }
  
  next();
}

// GET /api/admin/verify - Verificar token de admin
app.get('/api/admin/verify', verifyAdminToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token válido',
    user: {
      username: 'admin',
      role: 'administrator'
    }
  });
});

// =================== RUTAS DE ÓRDENES ===================

// POST /api/orders - Crear nueva orden
app.post('/api/orders', async (req, res) => {
  try {
    const { customerInfo, items, subtotal, shippingCost, total } = req.body;

    // Validar datos requeridos
    if (!customerInfo || !items || !items.length) {
      return res.status(400).json({
        success: false,
        message: 'Información de cliente y productos son requeridos'
      });
    }

    const { Client } = require('pg');
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    await client.connect();

    // Generar número de orden único
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Insertar orden principal
    const orderResult = await client.query(`
      INSERT INTO orders (
        order_number, customer_first_name, customer_last_name, customer_email, 
        customer_phone, shipping_address, shipping_city, shipping_state, 
        shipping_postal_code, shipping_country, notes, subtotal, shipping_cost, total
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id, order_number, created_at
    `, [
      orderNumber,
      customerInfo.firstName,
      customerInfo.lastName,
      customerInfo.email,
      customerInfo.phone,
      customerInfo.address,
      customerInfo.city,
      customerInfo.state,
      customerInfo.postalCode,
      customerInfo.country,
      customerInfo.notes || null,
      subtotal,
      shippingCost,
      total
    ]);

    const orderId = orderResult.rows[0].id;

    // Insertar items de la orden
    for (const item of items) {
      await client.query(`
        INSERT INTO order_items (
          order_id, product_name, product_model, product_color, quantity, price, total
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        orderId,
        item.name,
        item.model,
        item.color,
        item.quantity,
        item.price,
        item.price * item.quantity
      ]);
    }

    await client.end();

    // Respuesta exitosa
    res.status(201).json({
      success: true,
      message: 'Orden creada exitosamente',
      data: {
        orderId,
        orderNumber: orderResult.rows[0].order_number,
        total,
        createdAt: orderResult.rows[0].created_at
      }
    });

  } catch (error) {
    console.error('Error al crear orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// GET /api/orders - Obtener todas las órdenes (para admin)
app.get('/api/orders', verifyAdminToken, async (req, res) => {
  try {
    const { Client } = require('pg');
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    await client.connect();

    const result = await client.query(`
      SELECT 
        o.*,
        json_agg(
          json_build_object(
            'product_name', oi.product_name,
            'product_model', oi.product_model,
            'product_color', oi.product_color,
            'quantity', oi.quantity,
            'price', oi.price,
            'total', oi.total
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT 50
    `);

    await client.end();

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// GET /api/orders/:orderNumber - Obtener orden específica
app.get('/api/orders/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;

    const { Client } = require('pg');
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    await client.connect();

    const result = await client.query(`
      SELECT 
        o.*,
        json_agg(
          json_build_object(
            'product_name', oi.product_name,
            'product_model', oi.product_model,
            'product_color', oi.product_color,
            'quantity', oi.quantity,
            'price', oi.price,
            'total', oi.total
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.order_number = $1
      GROUP BY o.id
    `, [orderNumber]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    await client.end();

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error al obtener orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// PATCH /api/orders/:id/status - Actualizar estado de orden
app.patch('/api/orders/:id/status', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validar estado
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido'
      });
    }

    const { Client } = require('pg');
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    await client.connect();

    const result = await client.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );

    await client.end();

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Estado actualizado correctamente',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// =================== OTRAS RUTAS ===================

// Rutas básicas de API
app.use('/api/auth', (req, res) => {
  res.json({ message: 'Rutas de autenticación - próximamente' });
});

app.use('/api/products', (req, res) => {
  res.json({ message: 'Rutas de productos - próximamente' });
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
  console.log(`❌ Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    message: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`🏥 Health check en http://localhost:${PORT}/health`);
  console.log(`🗄️  Test DB en http://localhost:${PORT}/api/test-db`);
  console.log(`📦 Orders API en http://localhost:${PORT}/api/orders`);
  console.log(`🔑 Admin Login en http://localhost:${PORT}/api/admin/login`);
  console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
  
  // Inicializar base de datos al arrancar el servidor
  await initializeDatabase();
});

module.exports = app;