// backend/src/routes/webhooks.js
const express = require('express');
const router = express.Router();
const { updateSupplierOrderTracking, syncSupplierOrderStatus } = require('../services/supplierOrderService');

/**
 * Webhooks para recibir actualizaciones automáticas de proveedores
 * Permite que los proveedores nos notifiquen sobre cambios en el estado de las órdenes
 */

/**
 * POST /api/webhooks/tracking - Webhook genérico para actualizaciones de tracking
 * Recibe información de tracking desde proveedores externos
 */
router.post('/tracking', async (req, res) => {
  try {
    const {
      supplierOrderId, // ID de la orden en nuestro sistema
      trackingNumber,
      carrier,
      trackingUrl,
      status,
      apiKey // API key del proveedor para verificar autenticidad
    } = req.body;

    console.log('📨 Webhook recibido - Actualización de tracking:', {
      supplierOrderId,
      trackingNumber,
      status
    });

    // Validar campos requeridos
    if (!supplierOrderId || !trackingNumber) {
      return res.status(400).json({
        success: false,
        message: 'supplierOrderId y trackingNumber son requeridos'
      });
    }

    // TODO: Verificar API key del proveedor
    // En producción, validar que el apiKey corresponde al proveedor correcto

    // Actualizar tracking
    const result = await updateSupplierOrderTracking(supplierOrderId, {
      trackingNumber,
      carrier: carrier || 'Unknown',
      trackingUrl: trackingUrl || null
    });

    if (result.success) {
      // Responder rápidamente al webhook
      res.json({
        success: true,
        message: 'Tracking actualizado exitosamente'
      });

      // TODO: Enviar notificación al cliente por email
      console.log(`✅ Tracking actualizado vía webhook: ${trackingNumber}`);
    } else {
      res.status(500).json({
        success: false,
        message: result.error
      });
    }

  } catch (error) {
    console.error('❌ Error procesando webhook de tracking:', error);
    res.status(500).json({
      success: false,
      message: 'Error procesando webhook',
      error: error.message
    });
  }
});

/**
 * POST /api/webhooks/aliexpress - Webhook específico para AliExpress
 */
router.post('/aliexpress', async (req, res) => {
  try {
    const {
      order_id,
      tracking_number,
      carrier_name,
      status,
      signature // Firma de seguridad de AliExpress
    } = req.body;

    console.log('📨 Webhook AliExpress recibido:', {
      order_id,
      tracking_number,
      status
    });

    // TODO: Verificar firma de seguridad de AliExpress
    // Validar que la petición realmente viene de AliExpress

    // Mapear campos de AliExpress a nuestro sistema
    const trackingInfo = {
      trackingNumber: tracking_number,
      carrier: carrier_name,
      trackingUrl: `https://www.17track.net/en/track?nums=${tracking_number}`
    };

    // Buscar la orden en nuestro sistema por supplierOrderNumber
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const supplierOrder = await prisma.supplierOrder.findFirst({
      where: {
        supplierOrderId: order_id
      }
    });

    if (supplierOrder) {
      await updateSupplierOrderTracking(supplierOrder.id, trackingInfo);

      res.json({
        success: true,
        message: 'Webhook procesado'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

  } catch (error) {
    console.error('❌ Error procesando webhook de AliExpress:', error);
    res.status(500).json({
      success: false,
      message: 'Error procesando webhook'
    });
  }
});

/**
 * POST /api/webhooks/cj - Webhook específico para CJ Dropshipping
 */
router.post('/cj', async (req, res) => {
  try {
    const {
      orderId,
      trackingNumber,
      shippingProvider,
      orderStatus,
      secret // Secret compartido con CJ
    } = req.body;

    console.log('📨 Webhook CJ Dropshipping recibido:', {
      orderId,
      trackingNumber,
      orderStatus
    });

    // TODO: Verificar secret compartido

    const trackingInfo = {
      trackingNumber: trackingNumber,
      carrier: shippingProvider,
      trackingUrl: trackingNumber ? `https://www.17track.net/en/track?nums=${trackingNumber}` : null
    };

    // Buscar orden
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const supplierOrder = await prisma.supplierOrder.findFirst({
      where: {
        supplierOrderId: orderId
      }
    });

    if (supplierOrder) {
      await updateSupplierOrderTracking(supplierOrder.id, trackingInfo);

      // Si el estado es "delivered", marcar como entregada
      if (orderStatus === 'delivered') {
        const { markSupplierOrderAsDelivered } = require('../services/supplierOrderService');
        await markSupplierOrderAsDelivered(supplierOrder.id);
      }

      res.json({
        success: true,
        message: 'Webhook procesado'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

  } catch (error) {
    console.error('❌ Error procesando webhook de CJ:', error);
    res.status(500).json({
      success: false,
      message: 'Error procesando webhook'
    });
  }
});

/**
 * POST /api/webhooks/status - Webhook para actualizaciones de estado de orden
 */
router.post('/status', async (req, res) => {
  try {
    const {
      supplierOrderId,
      status, // PLACED, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED
      message,
      apiKey
    } = req.body;

    console.log('📨 Webhook recibido - Actualización de estado:', {
      supplierOrderId,
      status
    });

    if (!supplierOrderId || !status) {
      return res.status(400).json({
        success: false,
        message: 'supplierOrderId y status son requeridos'
      });
    }

    // TODO: Verificar API key

    // Actualizar estado
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const supplierOrder = await prisma.supplierOrder.update({
      where: { id: supplierOrderId },
      data: {
        status: status,
        notes: message || `Estado actualizado a ${status} vía webhook`
      }
    });

    // Actualizar también la orden del cliente
    await prisma.order.update({
      where: { id: supplierOrder.orderId },
      data: {
        status: status
      }
    });

    res.json({
      success: true,
      message: 'Estado actualizado'
    });

  } catch (error) {
    console.error('❌ Error procesando webhook de estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error procesando webhook'
    });
  }
});

/**
 * GET /api/webhooks/test - Endpoint de prueba para verificar que los webhooks funcionan
 */
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Webhooks funcionando correctamente',
    timestamp: new Date().toISOString(),
    endpoints: [
      'POST /api/webhooks/tracking - Tracking genérico',
      'POST /api/webhooks/aliexpress - AliExpress específico',
      'POST /api/webhooks/cj - CJ Dropshipping específico',
      'POST /api/webhooks/status - Actualización de estado',
      'GET /api/webhooks/test - Prueba de webhooks'
    ]
  });
});

module.exports = router;
