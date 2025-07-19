// backend/src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fileUpload = require('express-fileupload');
const cron = require('node-cron');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3001;

// =================== IMPORTS ===================
const { 
  initializeDatabase, 
  seedDatabase,
  getDbClient,
  testConnection,
  getTableStats
} = require('./utils/database');

// Servicios
const emailService = require('./services/emailService');
const stripeService = require('./services/stripeService');
const analyticsService = require('./services/analyticsService');
const notificationService = require('./services/notificationService');

// =================== MIDDLEWARES ===================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Id', 'X-Request-Time']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(fileUpload({
  createParentPath: true,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB max
  },
  abortOnLimit: true,
  responseOnLimit: "El archivo es demasiado grande"
}));

// Logging en desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('combined'));
}

// =================== MIDDLEWARE PARA VERIFICAR ADMIN ===================
function verifyAdminToken(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token || !token.startsWith('admin_')) {
    return res.status(401).json({
      success: false,
      message: 'Token de admin requerido'
    });
  }
  
  req.adminToken = token;
  next();
}

// =================== RUTAS BÁSICAS ===================

// Health check mejorado
app.get('/health', async (req, res) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: 'checking...',
      email: emailService.getServiceInfo().isConfigured,
      stripe: !!process.env.STRIPE_SECRET_KEY
    }
  };

  // Test database connection
  try {
    const dbTest = await testConnection();
    healthCheck.services.database = dbTest.success ? 'connected' : 'error';
    if (dbTest.success) {
      healthCheck.database = {
        connected: true,
        time: dbTest.currentTime
      };
    }
  } catch (error) {
    healthCheck.services.database = 'error';
  }

  const statusCode = Object.values(healthCheck.services).every(status => 
    status === 'connected' || status === true || status === 'checking...'
  ) ? 200 : 503;

  res.status(statusCode).json(healthCheck);
});

// Database test expandido
app.get('/api/test-db', async (req, res) => {
  try {
    const client = await getDbClient();
    await client.connect();
    
    const result = await client.query('SELECT COUNT(*) as user_count FROM users');
    const ordersCount = await client.query('SELECT COUNT(*) as order_count FROM orders');
    
    // Obtener estadísticas de todas las tablas
    const tableStats = await getTableStats();
    
    await client.end();

    res.json({ 
      success: true, 
      message: 'Conexión a Supabase exitosa! 🎉',
      stats: {
        users: parseInt(result.rows[0].user_count),
        orders: parseInt(ordersCount.rows[0].order_count),
        allTables: tableStats
      },
      provider: 'Supabase PostgreSQL',
      timestamp: new Date().toISOString()
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
    console.log('🔑 Intento de login admin:', { username: req.body.username });
    const { username, password } = req.body;

    // Credenciales hardcodeadas (en producción usar base de datos hash)
    const ADMIN_USERNAME = 'admin';
    const ADMIN_PASSWORD = 'admin123';

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const token = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('✅ Login exitoso, token generado');
      
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

// =================== RUTAS DE ÓRDENES (INTEGRADAS) ===================

// POST /api/orders - Crear nueva orden
app.post('/api/orders', async (req, res) => {
  try {
    const { customerInfo, items, subtotal, shippingCost, total, paymentMethod = 'manual', tax = 0 } = req.body;

    console.log('📦 Nueva orden recibida:', { 
      email: customerInfo?.email, 
      total, 
      items: items?.length,
      paymentMethod 
    });

    // Validar datos requeridos
    if (!customerInfo || !items || !items.length) {
      return res.status(400).json({
        success: false,
        message: 'Información de cliente y productos son requeridos'
      });
    }

    // Validar información del cliente
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'postalCode', 'country'];
    for (const field of requiredFields) {
      if (!customerInfo[field]) {
        return res.status(400).json({
          success: false,
          message: `Campo requerido: ${field}`
        });
      }
    }

    const client = await getDbClient();
    await client.connect();

    // Generar número de orden único
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Insertar orden principal
    const orderResult = await client.query(`
      INSERT INTO orders (
        order_number, customer_first_name, customer_last_name, customer_email, 
        customer_phone, shipping_address, shipping_city, shipping_state, 
        shipping_postal_code, shipping_country, notes, subtotal, shipping_cost, 
        tax, total, payment_method, status, payment_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
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
      tax,
      total,
      paymentMethod,
      paymentMethod === 'stripe' ? 'pending' : 'confirmed',
      paymentMethod === 'stripe' ? 'pending' : 'pending'
    ]);

    const orderId = orderResult.rows[0].id;

    // Insertar items de la orden
    for (const item of items) {
      await client.query(`
        INSERT INTO order_items (
          order_id, product_id, product_name, product_model, product_color, 
          quantity, price, total
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        orderId,
        item.productId || 1,
        item.name,
        item.model || '',
        item.color || '',
        item.quantity,
        item.price,
        item.price * item.quantity
      ]);
    }

    // Registrar en historial de estados si la tabla existe
    try {
      await client.query(`
        INSERT INTO order_status_history (order_id, status, notes, created_by)
        VALUES ($1, $2, $3, $4)
      `, [orderId, paymentMethod === 'stripe' ? 'pending' : 'confirmed', 'Orden creada', 'system']);
    } catch (historyError) {
      console.log('⚠️  Tabla de historial no disponible');
    }

    await client.end();

    let response = {
      success: true,
      message: 'Orden creada exitosamente',
      data: {
        orderId,
        orderNumber: orderResult.rows[0].order_number,
        total,
        createdAt: orderResult.rows[0].created_at,
        status: paymentMethod === 'stripe' ? 'pending' : 'confirmed'
      }
    };

    // Si el método de pago es Stripe, crear sesión de checkout
    if (paymentMethod === 'stripe' && process.env.STRIPE_SECRET_KEY) {
      try {
        const checkoutSession = await stripeService.createCheckoutSession({
          customerInfo,
          items,
          orderId,
          orderNumber: orderResult.rows[0].order_number,
          subtotal,
          shippingCost,
          total
        });

        response.data.stripeSessionId = checkoutSession.sessionId;
        response.data.checkoutUrl = checkoutSession.url;
        
        console.log('💳 Sesión de Stripe creada:', checkoutSession.sessionId);
      } catch (stripeError) {
        console.error('❌ Error creando sesión de Stripe:', stripeError);
        response.message += ' (Pago manual requerido - Error en Stripe)';
      }
    } else {
      // Para pagos manuales, enviar notificación inmediatamente
      setTimeout(async () => {
        try {
          await notificationService.sendOrderConfirmation(orderId);
        } catch (notificationError) {
          console.error('❌ Error enviando notificación:', notificationError);
        }
      }, 1000);
    }

    // Track analytics si hay session ID
    if (req.headers['x-session-id']) {
      try {
        await analyticsService.trackPurchase(
          req.headers['x-session-id'],
          orderId,
          orderResult.rows[0].order_number,
          total,
          items
        );
      } catch (analyticsError) {
        console.error('⚠️  Error en analytics:', analyticsError);
      }
    }

    console.log(`✅ Orden creada: ${orderResult.rows[0].order_number} - $${total}`);

    res.status(201).json(response);

  } catch (error) {
    console.error('❌ Error al crear orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
});

// GET /api/orders - Obtener todas las órdenes (admin)
app.get('/api/orders', verifyAdminToken, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      status, 
      country,
      dateFrom,
      dateTo,
      search
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const client = await getDbClient();
    await client.connect();

    let whereClause = 'WHERE 1=1';
    let params = [];
    let paramCount = 0;

    // Filtros
    if (status) {
      paramCount++;
      whereClause += ` AND o.status = $${paramCount}`;
      params.push(status);
    }

    if (country) {
      paramCount++;
      whereClause += ` AND o.shipping_country = $${paramCount}`;
      params.push(country);
    }

    if (dateFrom) {
      paramCount++;
      whereClause += ` AND o.created_at >= $${paramCount}::date`;
      params.push(dateFrom);
    }

    if (dateTo) {
      paramCount++;
      whereClause += ` AND o.created_at <= $${paramCount}::date + INTERVAL '1 day'`;
      params.push(dateTo);
    }

    if (search) {
      paramCount++;
      whereClause += ` AND (
        o.order_number ILIKE $${paramCount} OR 
        o.customer_email ILIKE $${paramCount} OR 
        CONCAT(o.customer_first_name, ' ', o.customer_last_name) ILIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
    }

    const result = await client.query(`
      SELECT 
        o.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'product_name', oi.product_name,
              'product_model', oi.product_model,
              'product_color', oi.product_color,
              'quantity', oi.quantity,
              'price', oi.price,
              'total', oi.total
            )
          ) FILTER (WHERE oi.id IS NOT NULL), 
          '[]'::json
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      ${whereClause}
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `, [...params, parseInt(limit), offset]);

    // Contar total para paginación
    const countResult = await client.query(`
      SELECT COUNT(DISTINCT o.id) as total
      FROM orders o
      ${whereClause}
    `, params);

    const total = parseInt(countResult.rows[0].total);

    await client.end();

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener órdenes:', error);
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

    const client = await getDbClient();
    await client.connect();

    const result = await client.query(`
      SELECT 
        o.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'product_name', oi.product_name,
              'product_model', oi.product_model,
              'product_color', oi.product_color,
              'quantity', oi.quantity,
              'price', oi.price,
              'total', oi.total
            )
          ) FILTER (WHERE oi.id IS NOT NULL), 
          '[]'::json
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.order_number = $1
      GROUP BY o.id
    `, [orderNumber]);

    if (result.rows.length === 0) {
      await client.end();
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    const order = result.rows[0];

    // Obtener historial de estados si la tabla existe
    try {
      const historyResult = await client.query(`
        SELECT * FROM order_status_history 
        WHERE order_id = $1 
        ORDER BY created_at ASC
      `, [order.id]);
      order.status_history = historyResult.rows;
    } catch (historyError) {
      order.status_history = [];
    }

    // Obtener notificaciones si la tabla existe
    try {
      const notificationsResult = await client.query(`
        SELECT * FROM order_notifications 
        WHERE order_id = $1 
        ORDER BY created_at DESC
      `, [order.id]);
      order.notifications = notificationsResult.rows;
    } catch (notificationError) {
      order.notifications = [];
    }

    await client.end();

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('❌ Error al obtener orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// PATCH /api/orders/:id/status - Actualizar estado de orden (admin)
app.patch('/api/orders/:id/status', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, trackingNumber, trackingUrl } = req.body;

    // Validar estado
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido. Estados válidos: ' + validStatuses.join(', ')
      });
    }

    const client = await getDbClient();
    await client.connect();

    // Obtener estado actual
    const currentOrder = await client.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (currentOrder.rows.length === 0) {
      await client.end();
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    const oldStatus = currentOrder.rows[0].status;

    // Actualizar orden
    let updateQuery = 'UPDATE orders SET status = $1, updated_at = NOW()';
    let updateParams = [status];
    let paramCount = 1;

    if (trackingNumber) {
      paramCount++;
      updateQuery += `, tracking_number = $${paramCount}`;
      updateParams.push(trackingNumber);
    }

    if (trackingUrl) {
      paramCount++;
      updateQuery += `, tracking_url = $${paramCount}`;
      updateParams.push(trackingUrl);
    }

    if (status.toLowerCase() === 'shipped' && !currentOrder.rows[0].shipped_at) {
      updateQuery += ', shipped_at = NOW()';
    }

    if (status.toLowerCase() === 'delivered' && !currentOrder.rows[0].delivered_at) {
      updateQuery += ', delivered_at = NOW()';
    }

    paramCount++;
    updateQuery += ` WHERE id = $${paramCount} RETURNING *`;
    updateParams.push(id);

    const result = await client.query(updateQuery, updateParams);

    // Registrar cambio en historial si la tabla existe
    try {
      await client.query(`
        INSERT INTO order_status_history (order_id, status, notes, created_by)
        VALUES ($1, $2, $3, $4)
      `, [id, status, notes || `Estado cambiado de ${oldStatus} a ${status}`, 'admin']);
    } catch (historyError) {
      console.log('⚠️  No se pudo guardar en historial (tabla no existe)');
    }

    await client.end();

    // Enviar notificaciones según el nuevo estado (asíncrono)
    setTimeout(async () => {
      try {
        switch (status.toLowerCase()) {
          case 'confirmed':
            await notificationService.sendOrderConfirmation(id);
            break;
          case 'shipped':
            await notificationService.sendShippingNotification(id, trackingNumber, trackingUrl);
            break;
          case 'delivered':
            await notificationService.sendDeliveryNotification(id);
            break;
          case 'cancelled':
            await notificationService.sendCancellationNotification(id, notes);
            break;
        }
      } catch (notificationError) {
        console.error('❌ Error enviando notificación:', notificationError);
      }
    }, 1000);

    console.log(`✅ Estado de orden ${id} actualizado: ${oldStatus} → ${status}`);

    res.json({
      success: true,
      message: 'Estado actualizado correctamente',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error al actualizar estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// =================== CRON JOBS ===================

// Solo ejecutar cron jobs en producción o si está habilitado
if (process.env.NODE_ENV === 'production' || process.env.ENABLE_CRON === 'true') {
  
  // Enviar emails pendientes cada 5 minutos
  cron.schedule('*/5 * * * *', async () => {
    try {
      await notificationService.processPendingNotifications();
      console.log('📧 Notificaciones pendientes procesadas');
    } catch (error) {
      console.error('❌ Error procesando notificaciones:', error);
    }
  });

  // Limpiar carritos abandonados diariamente a las 2 AM
  cron.schedule('0 2 * * *', async () => {
    try {
      const client = await getDbClient();
      await client.connect();
      
      const result = await client.query(`
        DELETE FROM cart_items 
        WHERE created_at < NOW() - INTERVAL '7 days'
        RETURNING *
      `);
      
      await client.end();
      console.log(`🧹 ${result.rowCount} items de carrito abandonados limpiados`);
    } catch (error) {
      console.error('❌ Error limpiando carritos:', error);
    }
  });

  // Generar reporte diario a las 3 AM
  cron.schedule('0 3 * * *', async () => {
    try {
      await analyticsService.generateDailyReport();
      console.log('📊 Reporte diario de analytics generado');
    } catch (error) {
      console.error('❌ Error generando analytics:', error);
    }
  });

  console.log('⏰ Cron jobs iniciados');
}

// =================== RUTAS ADICIONALES ===================

// Test email endpoint (admin)
app.post('/api/admin/test-email', verifyAdminToken, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email requerido'
      });
    }

    const result = await emailService.sendTestEmail(email);
    
    res.json({
      success: result.success,
      message: result.success ? 'Email de prueba enviado' : 'Error enviando email',
      error: result.error
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// Stats endpoint (admin)
app.get('/api/admin/stats', verifyAdminToken, async (req, res) => {
  try {
    const tableStats = await getTableStats();
    
    res.json({
      success: true,
      data: {
        tables: tableStats,
        services: {
          email: emailService.getServiceInfo(),
          database: await testConnection()
        },
        server: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          version: process.version,
          environment: process.env.NODE_ENV
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas',
      error: error.message
    });
  }
});

// =================== RUTAS HEREDADAS ===================

// Rutas básicas de API (compatibilidad)
app.use('/api/auth', (req, res) => {
  res.json({ 
    message: 'Rutas de autenticación - próximamente',
    endpoints: ['/login', '/register', '/verify', '/reset-password']
  });
});

app.use('/api/products', (req, res) => {
  res.json({ 
    message: 'Rutas de productos - próximamente',
    endpoints: ['/products', '/products/:slug', '/categories']
  });
});

// =================== ERROR HANDLING ===================

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error del servidor:', err.stack);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'JSON inválido en el cuerpo de la petición'
    });
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'El archivo o datos enviados son demasiado grandes'
    });
  }
  
  res.status(500).json({ 
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`❌ Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    success: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      'GET /health',
      'GET /api/test-db',
      'POST /api/admin/login',
      'GET /api/admin/verify',
      'POST /api/orders',
      'GET /api/orders (admin)',
      'GET /api/orders/:orderNumber',
      'PATCH /api/orders/:id/status (admin)'
    ]
  });
});

// =================== STARTUP ===================

async function startServer() {
  try {
    console.log('🚀 Iniciando servidor...');
    console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
    
    // Inicializar base de datos
    await initializeDatabase();
    
    // Seed inicial (solo en desarrollo o si está habilitado)
    if (process.env.NODE_ENV === 'development' || process.env.ENABLE_SEED === 'true') {
      await seedDatabase();
    }
    
    // Inicializar servicios
    await emailService.initialize();
    
    if (process.env.STRIPE_SECRET_KEY) {
      await stripeService.initialize();
    } else {
      console.log('⚠️  Stripe no configurado - STRIPE_SECRET_KEY no encontrada');
    }
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('\n🎉 ¡Servidor iniciado correctamente!\n');
      console.log(`🌐 Servidor: http://localhost:${PORT}`);
      console.log(`🏥 Health: http://localhost:${PORT}/health`);
      console.log(`🗄️  DB Test: http://localhost:${PORT}/api/test-db`);
      console.log(`📦 Orders: http://localhost:${PORT}/api/orders`);
      console.log(`🔑 Admin: http://localhost:${PORT}/api/admin/login`);
      console.log(`📊 Stats: http://localhost:${PORT}/api/admin/stats`);
      
      if (process.env.STRIPE_SECRET_KEY) {
        console.log(`💳 Stripe: Configurado`);
      }
      
      if (emailService.getServiceInfo().isConfigured) {
        console.log(`📧 Email: Configurado (${emailService.getServiceInfo().host})`);
      } else {
        console.log(`📧 Email: No configurado`);
      }
      
      console.log('\n🔐 Credenciales de Admin:');
      console.log('   Usuario: admin');
      console.log('   Contraseña: admin123');
      
      console.log('\n✅ Todos los servicios están listos!\n');
    });
    
  } catch (error) {
    console.error('❌ Error crítico al iniciar servidor:', error);
    process.exit(1);
  }
}

// Manejo graceful de cierre del servidor
process.on('SIGTERM', async () => {
  console.log('\n🛑 Recibida señal SIGTERM, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n🛑 Recibida señal SIGINT, cerrando servidor...');
  process.exit(0);
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Excepción no capturada:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
  process.exit(1);
});

// Iniciar el servidor
startServer();

module.exports = app;