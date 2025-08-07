// backend/src/routes/tracking.js
const express = require('express');
const router = express.Router();
const { getDbClient } = require('../utils/database');

// POST /api/tracking/:orderNumber - Obtener estado de orden
router.post('/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { email } = req.body;

    console.log(`📦 Buscando orden: ${orderNumber} para email: ${email}`);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email es requerido para verificar la orden'
      });
    }

    const client = await getDbClient();
    await client.connect();

    // Buscar la orden
    const orderResult = await client.query(`
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
      WHERE o.order_number = $1 AND LOWER(o.customer_email) = LOWER($2)
      GROUP BY o.id
    `, [orderNumber, email]);

    if (orderResult.rows.length === 0) {
      await client.end();
      console.log(`❌ Orden no encontrada: ${orderNumber}`);
      return res.status(404).json({
        success: false,
        message: 'No se encontró la orden. Verifica el número de orden y email.'
      });
    }

    await client.end();

    console.log(`✅ Orden encontrada: ${orderNumber}`);
    res.json({
      success: true,
      data: orderResult.rows[0]
    });

  } catch (error) {
    console.error('❌ Error en tracking:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar la orden',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/tracking/public/:orderNumber - Tracking público (sin email)
router.get('/public/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;

    console.log(`📦 Tracking público para orden: ${orderNumber}`);

    const client = await getDbClient();
    await client.connect();

    // Buscar la orden (información limitada sin email)
    const orderResult = await client.query(`
      SELECT 
        order_number,
        status,
        created_at,
        shipped_at,
        delivered_at,
        tracking_number,
        tracking_url
      FROM orders
      WHERE order_number = $1
    `, [orderNumber]);

    if (orderResult.rows.length === 0) {
      await client.end();
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    await client.end();

    res.json({
      success: true,
      data: orderResult.rows[0]
    });

  } catch (error) {
    console.error('❌ Error en tracking público:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar la orden'
    });
  }
});

module.exports = router;