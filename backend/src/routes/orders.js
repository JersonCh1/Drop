// backend/src/routes/orders.js
const express = require('express');
const router = express.Router();
const { getDbClient } = require('../utils/database');
const stripeService = require('../services/stripeService');
const notificationService = require('../services/notificationService');
const analyticsService = require('../services/analyticsService');

// Middleware para verificar admin
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

// POST /api/orders - Crear nueva orden
router.post('/', async (req, res) => {
  try {
    const { customerInfo, items, subtotal, shippingCost, total, paymentMethod = 'stripe' } = req.body;

    // Validar datos requeridos
    if (!customerInfo || !items || !items.length) {
      return res.status(400).json({
        success: false,
        message: 'Información de cliente y productos son requeridos'
      });
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
        total, payment_method, status, payment_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
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
      total,
      paymentMethod,
      'PENDING',
      'PENDING'
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
        item.productId || 1, // Usar ID real del producto si está disponible
        item.name,
        item.model,
        item.color,
        item.quantity,
        item.price,
        item.price * item.quantity
      ]);
    }

    // Registrar en historial de estados
    await client.query(`
      INSERT INTO order_status_history (order_id, status, notes, created_by)
      VALUES ($1, $2, $3, $4)
    `, [orderId, 'PENDING', 'Orden creada', 'system']);

    await client.end();

    let response = {
      success: true,
      message: 'Orden creada exitosamente',
      data: {
        orderId,
        orderNumber: orderResult.rows[0].order_number,
        total,
        createdAt: orderResult.rows[0].created_at
      }
    };

    // Si el método de pago es Stripe, crear sesión de checkout
    if (paymentMethod === 'stripe') {
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
      } catch (stripeError) {
        console.error('❌ Error creando sesión de Stripe:', stripeError);
        // No fallar la orden si Stripe falla, solo log el error
        response.message += ' (Pago manual requerido)';
      }
    }

    // Track analytics
    if (req.headers['x-session-id']) {
      await analyticsService.trackPurchase(
        req.headers['x-session-id'],
        orderId,
        orderResult.rows[0].order_number,
        total,
        items
      );
    }

    // Enviar notificación de confirmación (asíncrono)
    if (paymentMethod !== 'stripe') {
      // Solo para pagos manuales, Stripe manejará esto en el webhook
      setTimeout(() => {
        notificationService.sendOrderConfirmation(orderId);
      }, 1000);
    }

    console.log(`✅ Orden creada: ${orderResult.rows[0].order_number} - $${total}`);

    res.status(201).json(response);

  } catch (error) {
    console.error('Error al crear orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// GET /api/orders - Obtener todas las órdenes (admin)
router.get('/', verifyAdminToken, async (req, res) => {
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
      whereClause += ` AND o.created_at >= $${paramCount}`;
      params.push(dateFrom);
    }

    if (dateTo) {
      paramCount++;
      whereClause += ` AND o.created_at <= $${paramCount}`;
      params.push(dateTo);
    }

    if (search) {
      paramCount++;
      whereClause += ` AND (o.order_number ILIKE $${paramCount} OR o.customer_email ILIKE $${paramCount} OR CONCAT(o.customer_first_name, ' ', o.customer_last_name) ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    const result = await client.query(`
      SELECT 
        o.*,
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
    console.error('Error al obtener órdenes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// GET /api/orders/:orderNumber - Obtener orden específica
router.get('/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;

    const client = await getDbClient();
    await client.connect();

    const result = await client.query(`
      SELECT 
        o.*,
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

    // Obtener historial de estados
    const historyResult = await client.query(`
      SELECT * FROM order_status_history 
      WHERE order_id = $1 
      ORDER BY created_at ASC
    `, [order.id]);

    order.status_history = historyResult.rows;

    // Obtener notificaciones
    const notificationsResult = await client.query(`
      SELECT * FROM order_notifications 
      WHERE order_id = $1 
      ORDER BY created_at DESC
    `, [order.id]);

    order.notifications = notificationsResult.rows;

    await client.end();

    res.json({
      success: true,
      data: order
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

// PATCH /api/orders/:id/status - Actualizar estado de orden (admin)
router.patch('/:id/status', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, trackingNumber, trackingUrl } = req.body;

    // Validar estado
    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido'
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

    if (status === 'SHIPPED' && !currentOrder.rows[0].shipped_at) {
      updateQuery += ', shipped_at = NOW()';
    }

    if (status === 'DELIVERED' && !currentOrder.rows[0].delivered_at) {
      updateQuery += ', delivered_at = NOW()';
    }

    paramCount++;
    updateQuery += ` WHERE id = $${paramCount} RETURNING *`;
    updateParams.push(id);

    const result = await client.query(updateQuery, updateParams);

    // Registrar cambio en historial
    await client.query(`
      INSERT INTO order_status_history (order_id, status, notes, created_by)
      VALUES ($1, $2, $3, $4)
    `, [id, status, notes || `Estado cambiado de ${oldStatus} a ${status}`, 'admin']);

    await client.end();

    // Enviar notificaciones según el nuevo estado
    setTimeout(async () => {
      try {
        switch (status) {
          case 'CONFIRMED':
            await notificationService.sendOrderConfirmation(id);
            break;
          case 'SHIPPED':
            await notificationService.sendShippingNotification(id, trackingNumber, trackingUrl);
            break;
          case 'DELIVERED':
            await notificationService.sendDeliveryNotification(id);
            break;
          case 'CANCELLED':
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
    console.error('Error al actualizar estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// POST /api/orders/:id/refund - Procesar reembolso (admin)
router.post('/:id/refund', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;

    const client = await getDbClient();
    await client.connect();

    // Obtener orden
    const orderResult = await client.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (orderResult.rows.length === 0) {
      await client.end();
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    const order = orderResult.rows[0];

    if (order.payment_status !== 'PAID') {
      await client.end();
      return res.status(400).json({
        success: false,
        message: 'La orden no ha sido pagada'
      });
    }

    // Procesar reembolso en Stripe si es necesario
    let refundResult = null;
    if (order.stripe_payment_id) {
      try {
        refundResult = await stripeService.createRefund(order.stripe_payment_id, amount);
      } catch (stripeError) {
        console.error('❌ Error procesando reembolso en Stripe:', stripeError);
        await client.end();
        return res.status(500).json({
          success: false,
          message: 'Error procesando reembolso en Stripe',
          error: stripeError.message
        });
      }
    }

    // Actualizar orden
    await client.query(`
      UPDATE orders 
      SET payment_status = 'REFUNDED', status = 'REFUNDED', updated_at = NOW()
      WHERE id = $1
    `, [id]);

    // Registrar en historial
    await client.query(`
      INSERT INTO order_status_history (order_id, status, notes, created_by)
      VALUES ($1, $2, $3, $4)
    `, [id, 'REFUNDED', `Reembolso procesado. ${reason ? `Motivo: ${reason}` : ''}`, 'admin']);

    await client.end();

    console.log(`💰 Reembolso procesado para orden ${order.order_number}: $${amount || order.total}`);

    res.json({
      success: true,
      message: 'Reembolso procesado exitosamente',
      data: {
        refundId: refundResult?.id,
        amount: refundResult?.amount ? refundResult.amount / 100 : amount || order.total
      }
    });

  } catch (error) {
    console.error('Error procesando reembolso:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// GET /api/orders/stats/dashboard - Estadísticas para dashboard (admin)
router.get('/stats/dashboard', verifyAdminToken, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    const client = await getDbClient();
    await client.connect();

    let dateFilter = '';
    switch (period) {
      case '7d':
        dateFilter = "AND created_at >= NOW() - INTERVAL '7 days'";
        break;
      case '30d':
        dateFilter = "AND created_at >= NOW() - INTERVAL '30 days'";
        break;
      case '90d':
        dateFilter = "AND created_at >= NOW() - INTERVAL '90 days'";
        break;
      default:
        dateFilter = "AND created_at >= NOW() - INTERVAL '30 days'";
    }

    // Estadísticas generales
    const statsResult = await client.query(`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'PROCESSING' THEN 1 END) as processing_orders,
        COUNT(CASE WHEN status = 'SHIPPED' THEN 1 END) as shipped_orders,
        COUNT(CASE WHEN status = 'DELIVERED' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as cancelled_orders,
        COALESCE(SUM(CASE WHEN status NOT IN ('CANCELLED', 'REFUNDED') THEN total END), 0) as total_revenue,
        COALESCE(AVG(CASE WHEN status NOT IN ('CANCELLED', 'REFUNDED') THEN total END), 0) as avg_order_value
      FROM orders