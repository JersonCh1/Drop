// backend/src/routes/dsers.js
const express = require('express');
const router = express.Router();
const dsersService = require('../services/dsersOrderService');
const fs = require('fs').promises;
const path = require('path');

/**
 * GET /api/dsers/pending
 * Obtener lista de órdenes pendientes de procesar
 */
router.get('/pending', async (req, res) => {
  try {
    const pendingOrders = await dsersService.getPendingDSersOrders();

    res.json({
      success: true,
      data: pendingOrders,
      count: pendingOrders.length,
      message: `${pendingOrders.length} órdenes pendientes`
    });
  } catch (error) {
    console.error('Error obteniendo órdenes pendientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo órdenes pendientes',
      error: error.message
    });
  }
});

/**
 * GET /api/dsers/csv
 * Descargar CSV con órdenes pendientes para importar en DSers
 */
router.get('/csv', async (req, res) => {
  try {
    const result = await dsersService.generateDSersCSV();

    if (!result.success) {
      return res.status(404).json(result);
    }

    // Configurar headers para descarga de archivo CSV
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="dsers-orders-${Date.now()}.csv"`);
    res.send(result.csv);

  } catch (error) {
    console.error('Error generando CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Error generando CSV',
      error: error.message
    });
  }
});

/**
 * POST /api/dsers/process/:orderId
 * Procesar una orden específica para DSers
 */
router.post('/process/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const result = await dsersService.processDSersOrder(orderId);

    res.json(result);
  } catch (error) {
    console.error('Error procesando orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error procesando orden',
      error: error.message
    });
  }
});

/**
 * POST /api/dsers/complete
 * Marcar orden como completada con tracking number
 */
router.post('/complete', async (req, res) => {
  try {
    const { orderNumber, trackingNumber, carrier } = req.body;

    if (!orderNumber || !trackingNumber) {
      return res.status(400).json({
        success: false,
        message: 'orderNumber y trackingNumber son requeridos'
      });
    }

    const result = await dsersService.markDSersOrderComplete(
      orderNumber,
      trackingNumber,
      carrier || 'AliExpress Standard Shipping'
    );

    res.json(result);
  } catch (error) {
    console.error('Error completando orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error completando orden',
      error: error.message
    });
  }
});

/**
 * POST /api/dsers/webhook/new-order
 * Webhook para procesar automáticamente órdenes nuevas
 */
router.post('/webhook/new-order', async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'orderId es requerido'
      });
    }

    const result = await dsersService.handleNewOrder(orderId);

    res.json(result);
  } catch (error) {
    console.error('Error en webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Error procesando webhook',
      error: error.message
    });
  }
});

/**
 * GET /api/dsers/instructions
 * Obtener instrucciones de uso del sistema DSers
 */
router.get('/instructions', (req, res) => {
  res.json({
    success: true,
    instructions: {
      step1: {
        title: 'Ver Órdenes Pendientes',
        description: 'Usa GET /api/dsers/pending para ver todas las órdenes que necesitan ser procesadas',
        example: 'curl http://localhost:3001/api/dsers/pending'
      },
      step2: {
        title: 'Descargar CSV',
        description: 'Usa GET /api/dsers/csv para descargar un archivo CSV con todas las órdenes',
        example: 'curl http://localhost:3001/api/dsers/csv > orders.csv'
      },
      step3: {
        title: 'Importar en DSers',
        description: 'Abre DSers, ve a Import List, y sube el archivo CSV descargado'
      },
      step4: {
        title: 'Procesar Órdenes en DSers',
        description: 'En DSers, selecciona las órdenes y haz click en "Push to AliExpress"'
      },
      step5: {
        title: 'Actualizar Tracking',
        description: 'Cuando recibas los tracking numbers, usa POST /api/dsers/complete',
        example: {
          url: 'POST http://localhost:3001/api/dsers/complete',
          body: {
            orderNumber: 'ORD-1234567890',
            trackingNumber: 'LT123456789CN',
            carrier: 'AliExpress Standard Shipping'
          }
        }
      }
    }
  });
});

module.exports = router;
