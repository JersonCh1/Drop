// backend/src/routes/orders-fixed.js
const express = require('express');
const router = express.Router();
const { getDbClient } = require('../utils/database');

// GET /api/orders/track - Rastrear orden pública
router.get('/track', async (req, res) => {
  const client = await getDbClient();

  try {
    const { orderNumber, email } = req.query;

    if (!orderNumber) {
      return res.status(400).json({
        success: false,
        message: 'Número de orden es requerido'
      });
    }

    await client.connect();

    // Buscar orden con email opcional para seguridad
    let query = `
      SELECT
        id,
        order_number,
        status,
        payment_status,
        customer_first_name,
        customer_last_name,
        customer_email,
        customer_phone,
        shipping_address,
        shipping_city,
        shipping_state,
        shipping_postal_code,
        shipping_country,
        subtotal,
        shipping_cost,
        tax,
        total,
        tracking_number,
        tracking_url,
        shipped_at,
        delivered_at,
        estimated_delivery,
        created_at,
        notes
      FROM orders
      WHERE UPPER(order_number) = UPPER($1)
    `;

    const params = [orderNumber];

    // Si se proporciona email, usarlo para validar
    if (email) {
      query += ' AND LOWER(customer_email) = LOWER($2)';
      params.push(email);
    }

    const orderResult = await client.query(query, params);

    if (orderResult.rows.length === 0) {
      await client.end();
      return res.status(404).json({
        success: false,
        message: 'No se encontró la orden con el número proporcionado'
      });
    }

    const order = orderResult.rows[0];

    // Obtener items de la orden
    const itemsResult = await client.query(`
      SELECT
        product_name,
        product_model,
        product_color,
        quantity,
        price,
        total
      FROM order_items
      WHERE order_id = $1
    `, [order.id]);

    await client.end();

    // Formatear respuesta
    const response = {
      success: true,
      data: {
        id: order.id,
        orderNumber: order.order_number,
        status: order.status.toUpperCase(),
        paymentStatus: order.payment_status.toUpperCase(),
        createdAt: order.created_at,
        total: parseFloat(order.total),
        subtotal: parseFloat(order.subtotal),
        shippingCost: parseFloat(order.shipping_cost),
        tax: parseFloat(order.tax || 0),
        trackingNumber: order.tracking_number,
        trackingUrl: order.tracking_url,
        shippedAt: order.shipped_at,
        deliveredAt: order.delivered_at,
        estimatedDelivery: order.estimated_delivery,
        items: itemsResult.rows.map(item => ({
          productName: item.product_name,
          productModel: item.product_model,
          productColor: item.product_color,
          quantity: item.quantity,
          price: parseFloat(item.price),
          total: parseFloat(item.total)
        })),
        shippingAddress: order.shipping_address,
        shippingCity: order.shipping_city,
        shippingState: order.shipping_state,
        shippingPostalCode: order.shipping_postal_code,
        shippingCountry: order.shipping_country,
        customerEmail: order.customer_email,
        notes: order.notes
      }
    };

    console.log(`🔍 Orden rastreada: ${order.order_number} - Estado: ${order.status}`);

    res.json(response);

  } catch (error) {
    console.error('❌ Error al rastrear orden:', error);

    try {
      await client.end();
    } catch (closeError) {
      console.error('Error cerrando conexión:', closeError);
    }

    res.status(500).json({
      success: false,
      message: 'Error al buscar la orden',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/orders - Crear nueva orden
router.post('/', async (req, res) => {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  try {
    const { customerInfo, items, subtotal, shippingCost, total, paymentMethod = 'manual' } = req.body;

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

    // Generar número de orden único
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Crear orden con Prisma Client (evita problemas de tipos)
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerFirstName: customerInfo.firstName || 'Cliente',
        customerLastName: customerInfo.lastName || 'Apellido',
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone || 'No proporcionado',
        shippingAddress: customerInfo.address || 'No proporcionada',
        shippingCity: customerInfo.city || 'Ciudad',
        shippingState: customerInfo.state || 'Estado',
        shippingPostalCode: customerInfo.postalCode || '00000',
        shippingCountry: customerInfo.country || 'PE',
        notes: customerInfo.notes || null,
        subtotal: subtotal || total,
        shippingCost: shippingCost || 0,
        tax: 0,
        total,
        paymentMethod,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        // Crear items de la orden
        items: {
          create: items.map(item => ({
            productId: String(item.productId), // ✅ Asegurar que sea string
            variantId: item.variantId ? String(item.variantId) : null, // ✅ Asegurar que sea string
            productName: item.name || 'Producto',
            productModel: item.model || '',
            productColor: item.color || '',
            quantity: item.quantity || 1,
            price: item.price || 0,
            total: (item.price || 0) * (item.quantity || 1)
          }))
        }
      },
      include: {
        items: true
      }
    });

    await prisma.$disconnect();

    // 🚀 AUTOMATIZACIÓN DSERS: Procesar orden automáticamente
    try {
      const dsersService = require('../services/dsersOrderService');
      await dsersService.handleNewOrder(order.id);
      console.log(`✅ Orden ${order.orderNumber} enviada a DSers automáticamente`);
    } catch (dsersError) {
      console.error('⚠️  Error procesando orden con DSers (continuando):', dsersError.message);
      // No fallar la orden si DSers falla, solo logear
    }

    // Respuesta exitosa con URL de pago
    const response = {
      success: true,
      message: 'Orden creada exitosamente',
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        total,
        createdAt: order.createdAt,
        status: 'pending',
        // URL de pago para WhatsApp o método manual
        paymentUrl: `https://wa.me/51999888777?text=Hola!%20Acabo%20de%20realizar%20una%20orden%20${order.orderNumber}%20por%20$${total}%20USD`,
        paymentInstructions: 'Te contactaremos por WhatsApp para coordinar el pago y envío.'
      }
    };

    console.log(`✅ Orden creada: ${order.orderNumber} - $${total}`);

    res.status(201).json(response);

  } catch (error) {
    console.error('❌ Error al crear orden:', error);
    console.error('❌ Stack trace:', error.stack);

    // Asegurarse de cerrar la conexión Prisma en caso de error
    try {
      await prisma.$disconnect();
    } catch (closeError) {
      console.error('Error cerrando conexión Prisma:', closeError);
    }

    res.status(500).json({
      success: false,
      message: 'Error al procesar la orden. Por favor intenta nuevamente.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;