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
  const client = await getDbClient();
  
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

    await client.connect();

    // Generar número de orden único
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Insertar orden principal con valores por defecto para campos opcionales
    const orderResult = await client.query(`
      INSERT INTO orders (
        order_number, 
        customer_first_name, 
        customer_last_name, 
        customer_email, 
        customer_phone, 
        shipping_address, 
        shipping_city, 
        shipping_state, 
        shipping_postal_code, 
        shipping_country, 
        notes, 
        subtotal, 
        shipping_cost, 
        tax,
        total, 
        payment_method, 
        status, 
        payment_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING id, order_number, created_at
    `, [
      orderNumber,
      customerInfo.firstName || 'Cliente',
      customerInfo.lastName || 'Apellido',
      customerInfo.email,
      customerInfo.phone || 'No proporcionado',
      customerInfo.address || 'No proporcionada',
      customerInfo.city || 'Ciudad',
      customerInfo.state || 'Estado',
      customerInfo.postalCode || '00000',
      customerInfo.country || 'PE',
      customerInfo.notes || null,
      subtotal || total,
      shippingCost || 0,
      0, // tax
      total,
      paymentMethod,
      'pending',
      'pending'
    ]);

    const orderId = orderResult.rows[0].id;

    // Insertar items de la orden
    for (const item of items) {
      await client.query(`
        INSERT INTO order_items (
          order_id, 
          product_id, 
          product_name, 
          product_model, 
          product_color, 
          quantity, 
          price, 
          total
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        orderId,
        item.productId || 1,
        item.name || 'Producto',
        item.model || '',
        item.color || '',
        item.quantity || 1,
        item.price || 0,
        (item.price || 0) * (item.quantity || 1)
      ]);
    }

    await client.end();

    // Respuesta exitosa con URL de pago
    const response = {
      success: true,
      message: 'Orden creada exitosamente',
      data: {
        orderId,
        orderNumber: orderResult.rows[0].order_number,
        total,
        createdAt: orderResult.rows[0].created_at,
        status: 'pending',
        // URL de pago para WhatsApp o método manual
        paymentUrl: `https://wa.me/51999888777?text=Hola!%20Acabo%20de%20realizar%20una%20orden%20${orderResult.rows[0].order_number}%20por%20$${total}%20USD`,
        paymentInstructions: 'Te contactaremos por WhatsApp para coordinar el pago y envío.'
      }
    };

    console.log(`✅ Orden creada: ${orderResult.rows[0].order_number} - $${total}`);

    res.status(201).json(response);

  } catch (error) {
    console.error('❌ Error al crear orden:', error);
    
    // Asegurarse de cerrar la conexión en caso de error
    try {
      await client.end();
    } catch (closeError) {
      console.error('Error cerrando conexión:', closeError);
    }

    res.status(500).json({
      success: false,
      message: 'Error al procesar la orden. Por favor intenta nuevamente.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;