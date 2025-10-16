// SERVIDOR SIMPLE - SIN COMPLEJIDADES
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'dropshipping-super-secret-key-2024';

// =================== MIDDLEWARES ===================
const allowedOrigins = [
  'http://localhost:3000', // Desarrollo local
  'http://localhost:3001', // Backend local
  process.env.FRONTEND_URL, // Frontend en producción
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null, // Vercel preview
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (como mobile apps o curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      console.log('CORS bloqueado para origin:', origin);
      callback(null, true); // En producción, cambiar a: callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}));
app.use(express.json());

// =================== MIDDLEWARE ADMIN ===================
function verifyAdmin(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token requerido'
    });
  }

  try {
    // Verificar JWT
    const decoded = jwt.verify(token, JWT_SECRET);

    // Verificar que el usuario sea ADMIN
    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requieren permisos de administrador.'
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
}

// =================== HEALTH CHECK ===================
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// =================== LOGIN ADMIN ===================
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'admin' && password === 'admin123') {
    // Generar JWT válido
    const token = jwt.sign(
      {
        username: 'admin',
        role: 'ADMIN',
        userId: 'admin-1'
      },
      JWT_SECRET,
      { expiresIn: '7d' } // Token válido por 7 días
    );

    console.log('✅ Login exitoso, token JWT generado');

    res.json({
      success: true,
      token,
      user: { username: 'admin', role: 'ADMIN' }
    });
  } else {
    console.log('❌ Credenciales incorrectas');
    res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
  }
});

// =================== PRODUCTOS ===================

// GET /api/products - Listar productos
app.get('/api/products', async (req, res) => {
  try {
    const { limit = 20, featured, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Verificar si el usuario es admin (sin requerir token)
    let isAdmin = false;
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role === 'ADMIN') {
          isAdmin = true;
        }
      } catch (error) {
        // Token inválido o expirado, continuar como usuario público
      }
    }

    // Si es admin, mostrar todos los productos; si no, solo los activos
    const where = {};
    if (!isAdmin) {
      where.isActive = true;
    }
    if (featured === 'true') where.isFeatured = true;

    // Mapear sortBy a los campos correctos del modelo
    const sortFieldMap = {
      'price': 'basePrice',
      'createdAt': 'createdAt',
      'name': 'name',
      'stockCount': 'stockCount'
    };

    const actualSortField = sortFieldMap[sortBy] || 'createdAt';
    const actualSortOrder = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const products = await prisma.product.findMany({
      where,
      take: parseInt(limit),
      include: {
        category: { select: { name: true, slug: true } },
        images: { orderBy: { position: 'asc' } },
        variants: { where: { isActive: true }, orderBy: { price: 'asc' } }
      },
      orderBy: { [actualSortField]: actualSortOrder }
    });

    res.json({
      success: true,
      data: products.map(p => ({
        ...p,
        basePrice: parseFloat(p.basePrice),
        category_name: p.category?.name,
        variants: p.variants.map(v => ({
          ...v,
          price: parseFloat(v.price),
          comparePrice: v.comparePrice ? parseFloat(v.comparePrice) : null
        }))
      }))
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/products/:slug - Un producto
app.get('/api/products/:slug', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: {
        category: true,
        images: { orderBy: { position: 'asc' } },
        variants: { where: { isActive: true } }
      }
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'No encontrado' });
    }

    res.json({
      success: true,
      data: {
        ...product,
        basePrice: parseFloat(product.basePrice),
        variants: product.variants.map(v => ({
          ...v,
          price: parseFloat(v.price)
        }))
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/products - Crear producto (ADMIN)
app.post('/api/products', verifyAdmin, async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      basePrice,
      categoryId,
      brand,
      model,
      compatibility,
      isFeatured,
      inStock,
      stockCount
    } = req.body;

    if (!name || !slug || !basePrice || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Campos requeridos: name, slug, basePrice, categoryId'
      });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { slug }
    });

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'El slug ya existe'
      });
    }

    // Verificar que la categoría existe
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: `La categoría ${categoryId} no existe. Ejecuta: node prisma/seed.js`
      });
    }

    // Preparar compatibility
    let compatibilityString = '[]';
    if (compatibility) {
      if (typeof compatibility === 'string') {
        compatibilityString = compatibility;
      } else if (Array.isArray(compatibility)) {
        compatibilityString = JSON.stringify(compatibility);
      }
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || null,
        basePrice: parseFloat(basePrice),
        categoryId,
        brand: brand || null,
        model: model || null,
        compatibility: compatibilityString,
        isFeatured: isFeatured || false,
        inStock: inStock !== false,
        stockCount: stockCount || 0,
        isActive: true
      },
      include: { category: true }
    });

    console.log(`✅ Producto creado: ${product.name}`);
    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      product: product,  // Frontend expects 'product' field
      data: product
    });
  } catch (error) {
    console.error('❌ Error creando producto:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// PUT /api/products/:id - Actualizar producto (ADMIN)
app.put('/api/products/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Actualizando producto:', id, 'con datos:', req.body);

    const updateData = {};

    const allowedFields = ['name', 'slug', 'description', 'basePrice', 'categoryId', 'brand',
                           'model', 'compatibility', 'isActive', 'isFeatured', 'inStock', 'stockCount'];

    for (const field of allowedFields) {
      const camelField = field.charAt(0).toLowerCase() + field.slice(1);
      if (req.body[field] !== undefined || req.body[camelField] !== undefined) {
        const value = req.body[field] !== undefined ? req.body[field] : req.body[camelField];

        if (field === 'basePrice') {
          const parsedValue = parseFloat(value);
          if (!isNaN(parsedValue)) {
            updateData[field] = parsedValue;
          }
        } else if (field === 'stockCount') {
          const parsedValue = parseInt(value);
          if (!isNaN(parsedValue)) {
            updateData[field] = parsedValue;
          }
        } else if (field === 'compatibility') {
          // Asegurar que compatibility sea un string JSON
          if (typeof value === 'string') {
            updateData[field] = value;
          } else if (Array.isArray(value)) {
            updateData[field] = JSON.stringify(value);
          } else {
            updateData[field] = '[]';
          }
        } else if (field === 'description') {
          updateData[field] = value || null;
        } else if (field === 'categoryId') {
          // Verificar que la categoría existe antes de actualizar
          const categoryExists = await prisma.category.findUnique({
            where: { id: value }
          });
          if (categoryExists) {
            updateData[field] = value;
          } else {
            return res.status(400).json({
              success: false,
              message: `La categoría ${value} no existe`
            });
          }
        } else {
          updateData[field] = value;
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay campos para actualizar'
      });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        images: true,
        variants: true
      }
    });

    console.log(`✅ Producto actualizado: ${product.name}`);
    res.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: product
    });
  } catch (error) {
    console.error('❌ Error actualizando producto:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// DELETE /api/products/:id - Eliminar producto
app.delete('/api/products/:id', verifyAdmin, async (req, res) => {
  try {
    await prisma.product.update({
      where: { id: req.params.id },
      data: { isActive: false }
    });
    res.json({ success: true, message: 'Eliminado' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/products/:id/images - Agregar imagen a producto (ADMIN)
app.post('/api/products/:id/images', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { url, altText, position, isMain } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL de imagen requerida'
      });
    }

    // Verificar que el producto existe
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Si esta será la imagen principal, desmarcar otras
    if (isMain) {
      await prisma.productImage.updateMany({
        where: { productId: id },
        data: { isMain: false }
      });
    }

    // Crear imagen
    const image = await prisma.productImage.create({
      data: {
        productId: id,
        url,
        altText: altText || product.name,
        position: position !== undefined ? position : 0,
        isMain: isMain || false
      }
    });

    console.log(`✅ Imagen agregada al producto ${product.name}`);
    res.status(201).json({
      success: true,
      message: 'Imagen agregada exitosamente',
      data: image
    });
  } catch (error) {
    console.error('❌ Error agregando imagen:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE /api/products/:productId/images/:imageId - Eliminar imagen (ADMIN)
app.delete('/api/products/:productId/images/:imageId', verifyAdmin, async (req, res) => {
  try {
    const { imageId } = req.params;

    await prisma.productImage.delete({
      where: { id: imageId }
    });

    res.json({
      success: true,
      message: 'Imagen eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando imagen:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =================== ÓRDENES ===================

// GET /api/orders - Listar órdenes (ADMIN)
app.get('/api/orders', verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        skip,
        take: parseInt(limit),
        include: { items: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count()
    ]);

    res.json({
      success: true,
      data: orders.map(order => ({
        ...order,
        subtotal: parseFloat(order.subtotal),
        shippingCost: parseFloat(order.shippingCost),
        total: parseFloat(order.total),
        items: order.items.map(item => ({
          ...item,
          price: parseFloat(item.price),
          total: parseFloat(item.total)
        }))
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error órdenes:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/orders - Crear orden
app.post('/api/orders', async (req, res) => {
  try {
    const { customerInfo, items, subtotal, shippingCost, total, paymentMethod, operationCode } = req.body;

    if (!customerInfo || !items || !items.length) {
      return res.status(400).json({ success: false, message: 'Faltan datos' });
    }

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Obtener o crear un producto por defecto para los items
    let defaultProduct = await prisma.product.findFirst({
      where: { slug: 'default-product' }
    });

    if (!defaultProduct) {
      // Obtener la primera categoría disponible
      let defaultCategory = await prisma.category.findFirst();

      if (!defaultCategory) {
        // Si no hay categorías, crear una por defecto
        defaultCategory = await prisma.category.create({
          data: {
            name: 'General',
            slug: 'general',
            description: 'Categoría general'
          }
        });
      }

      // Crear producto por defecto si no existe
      defaultProduct = await prisma.product.create({
        data: {
          name: 'Producto General',
          slug: 'default-product',
          description: 'Producto por defecto del sistema',
          basePrice: 0,
          categoryId: defaultCategory.id,
          isActive: false
        }
      });
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerFirstName: customerInfo.firstName,
        customerLastName: customerInfo.lastName,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        shippingAddress: customerInfo.address,
        shippingCity: customerInfo.city,
        shippingState: customerInfo.state,
        shippingPostalCode: customerInfo.postalCode,
        shippingCountry: customerInfo.country,
        notes: operationCode ? `${customerInfo.notes || ''}\n\nCódigo de operación ${paymentMethod || 'Yape/Plin'}: ${operationCode}`.trim() : customerInfo.notes || null,
        subtotal: subtotal || total,
        shippingCost: shippingCost || 0,
        tax: 0,
        total,
        paymentMethod: paymentMethod || 'manual',
        status: 'PENDING',
        paymentStatus: operationCode ? 'PENDING' : 'PENDING',
        items: {
          create: items.map(item => ({
            productId: defaultProduct.id, // Usar el ID del producto por defecto (String)
            productName: item.name,
            productModel: item.model || '',
            productColor: item.color || '',
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity
          }))
        }
      },
      include: {
        items: true
      }
    });

    const whatsappNumber = process.env.WHATSAPP_NUMBER || '51917780708';
    const message = encodeURIComponent(
      `¡Hola! 🛍️\nOrden: ${orderNumber}\nTotal: $${total}\nEmail: ${customerInfo.email}\n\n¿Cómo puedo pagar?`
    );
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

    if (operationCode) {
      console.log(`✅ Orden creada con ${paymentMethod?.toUpperCase() || 'YAPE/PLIN'}: ${orderNumber} - Código: ${operationCode}`);
    } else {
      console.log(`✅ Orden creada: ${orderNumber}`);
    }

    res.status(201).json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        total: parseFloat(order.total),
        paymentUrl: whatsappUrl
      }
    });
  } catch (error) {
    console.error('Error crear orden:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/orders/:orderNumber - Una orden
app.get('/api/orders/:orderNumber', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber: req.params.orderNumber },
      include: { items: true }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'No encontrada' });
    }

    res.json({
      success: true,
      data: {
        ...order,
        subtotal: parseFloat(order.subtotal),
        shippingCost: parseFloat(order.shippingCost),
        total: parseFloat(order.total),
        items: order.items.map(item => ({
          ...item,
          price: parseFloat(item.price),
          total: parseFloat(item.total)
        }))
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/orders/:id/status - Cambiar estado
app.patch('/api/orders/:id/status', verifyAdmin, async (req, res) => {
  try {
    const { status, trackingNumber, trackingUrl } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status.toUpperCase())) {
      return res.status(400).json({ success: false, message: 'Estado inválido' });
    }

    const updateData = { status: status.toUpperCase(), updatedAt: new Date() };
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (trackingUrl) updateData.trackingUrl = trackingUrl;
    if (status.toUpperCase() === 'SHIPPED') updateData.shippedAt = new Date();
    if (status.toUpperCase() === 'DELIVERED') updateData.deliveredAt = new Date();

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =================== ANALYTICS (SIMPLE) ===================
app.post('/api/analytics/track', async (req, res) => {
  try {
    const { type, event, data, sessionId } = req.body;

    await prisma.analytics.create({
      data: {
        type: type || 'USER_ACTION',
        event: event || 'unknown',
        data: data || {},
        sessionId: sessionId || null,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    res.json({ success: true, message: 'OK' });
  } catch (error) {
    console.error('Error analytics:', error);
    res.json({ success: true }); // No fallar por analytics
  }
});

// =================== AUTH (CLIENTES) ===================
const authRoutes = require('./src/routes/auth');
app.use('/api/auth', authRoutes);

// =================== MERCADOPAGO ===================
const mercadopagoRoutes = require('./src/routes/mercadopago');
app.use('/api/mercadopago', mercadopagoRoutes);

// =================== STRIPE ===================
const stripeRoutes = require('./src/routes/stripe');
app.use('/api/stripe', stripeRoutes);

// =================== SUPPLIERS (DROPSHIPPING) ===================
const supplierRoutes = require('./src/routes/suppliers');
app.use('/api/suppliers', supplierRoutes);

// =================== WEBHOOKS ===================
const webhookRoutes = require('./src/routes/webhooks');
app.use('/api/webhooks', webhookRoutes);

// =================== TRACKING ===================
app.get('/api/tracking/:orderNumber', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber: req.params.orderNumber },
      select: {
        orderNumber: true,
        status: true,
        trackingNumber: true,
        trackingUrl: true,
        createdAt: true,
        shippedAt: true,
        deliveredAt: true,
        customerEmail: true
      }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'No encontrada' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =================== 404 ===================
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

// =================== ERROR HANDLER ===================
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, error: err.message });
});

// =================== INICIAR ===================
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor SIMPLE corriendo en http://localhost:${PORT}`);
  console.log(`📦 Productos: http://localhost:${PORT}/api/products`);
  console.log(`🛒 Órdenes: http://localhost:${PORT}/api/orders`);
  console.log(`🔑 Admin login: admin / admin123\n`);
});
