// backend/src/routes/webhooks.js
const express = require('express');
const router = express.Router();
const { updateSupplierOrderTracking, syncSupplierOrderStatus } = require('../services/supplierOrderService');
const whatsappService = require('../services/whatsappService');

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

    // Verificar API key del proveedor
    const validApiKey = process.env.WEBHOOK_API_KEY || 'dropshipping-webhook-secret-2024';
    if (apiKey !== validApiKey) {
      console.warn('⚠️ Intento de acceso con API key inválida');
      return res.status(403).json({
        success: false,
        message: 'API key inválida'
      });
    }

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

      // Enviar notificación al cliente por email
      const emailService = require('../services/emailService');
      try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        const supplierOrder = await prisma.supplierOrder.findUnique({
          where: { id: supplierOrderId },
          include: { order: true }
        });

        if (supplierOrder && supplierOrder.order) {
          await emailService.sendEmail({
            to: supplierOrder.order.customerEmail,
            subject: `📦 Tu pedido #${supplierOrder.order.orderNumber} ha sido enviado`,
            html: `
              <h2>¡Tu pedido está en camino!</h2>
              <p>Tu pedido <strong>#${supplierOrder.order.orderNumber}</strong> ha sido enviado.</p>
              <p><strong>Número de tracking:</strong> ${trackingNumber}</p>
              <p><strong>Transportista:</strong> ${carrier || 'Unknown'}</p>
              ${trackingUrl ? `<p><a href="${trackingUrl}">Rastrear mi pedido</a></p>` : ''}
            `
          });
        }
      } catch (emailError) {
        console.error('Error enviando email de tracking:', emailError);
      }
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

    // Verificar firma de seguridad de AliExpress
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.ALIEXPRESS_SECRET || 'aliexpress-secret')
      .update(JSON.stringify({ order_id, tracking_number, status }))
      .digest('hex');

    if (signature && signature !== expectedSignature) {
      console.warn('⚠️ Firma inválida de AliExpress');
      return res.status(403).json({
        success: false,
        message: 'Firma de seguridad inválida'
      });
    }

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

    // Verificar secret compartido con CJ Dropshipping
    const validSecret = process.env.CJ_WEBHOOK_SECRET || 'cj-dropshipping-secret-2024';
    if (secret !== validSecret) {
      console.warn('⚠️ Secret inválido de CJ Dropshipping');
      return res.status(403).json({
        success: false,
        message: 'Secret compartido inválido'
      });
    }

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

    // Verificar API key
    const validApiKey = process.env.WEBHOOK_API_KEY || 'dropshipping-webhook-secret-2024';
    if (apiKey !== validApiKey) {
      console.warn('⚠️ API key inválida en webhook de estado');
      return res.status(403).json({
        success: false,
        message: 'API key inválida'
      });
    }

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
 * POST /api/webhooks/niubiz - Webhook para pagos con Niubiz
 * Se ejecuta automáticamente cuando un pago es exitoso en Niubiz
 */
router.post('/niubiz', async (req, res) => {
  try {
    const { transactionId, purchaseNumber, authorizationCode, orderId } = req.body;

    console.log('📨 Webhook Niubiz recibido:', { transactionId, purchaseNumber, orderId });

    // Verificar firma/secret de Niubiz para seguridad
    const niubizSignature = req.headers['x-niubiz-signature'];
    const validSecret = process.env.NIUBIZ_WEBHOOK_SECRET || 'niubiz-secret-2024';

    if (niubizSignature) {
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', validSecret)
        .update(JSON.stringify({ transactionId, orderId }))
        .digest('hex');

      if (niubizSignature !== expectedSignature) {
        console.warn('⚠️ Firma inválida de Niubiz');
        return res.status(403).json({
          success: false,
          message: 'Firma de seguridad inválida'
        });
      }
    }

    if (!orderId) {
      console.log('⚠️  Webhook sin orderId');
      return res.status(400).json({
        success: false,
        message: 'No se encontró orderId'
      });
    }

    // Buscar orden
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    // Actualizar orden a PAID
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        notes: `Pago confirmado automáticamente por Niubiz. Transaction ID: ${transactionId}`
      }
    });

    console.log(`✅ Orden ${order.orderNumber} pagada con Niubiz (${transactionId})`);

    // 🚀 CREAR Y NOTIFICAR A PROVEEDORES + WHATSAPP AL CLIENTE
    setTimeout(async () => {
      try {
        const { createSupplierOrderFromCustomerOrder } = require('../services/supplierOrderService');
        const { sendOrderToSuppliers } = require('../services/supplierNotificationService');

        const supplierResult = await createSupplierOrderFromCustomerOrder(orderId);

        if (supplierResult.success) {
          console.log(`✅ ${supplierResult.supplierOrders.length} órdenes con proveedores creadas`);

          // Enviar notificaciones
          const notificationResults = await sendOrderToSuppliers(supplierResult.supplierOrders);
          console.log(`📧 Notificaciones enviadas a proveedores`);
        }

        // 📱 ENVIAR WHATSAPP AL CLIENTE
        if (order.customerPhone) {
          const orderData = {
            orderNumber: order.orderNumber,
            customerPhone: order.customerPhone,
            customerName: `${order.customerFirstName} ${order.customerLastName}`,
            total: parseFloat(order.total),
            items: order.items.map(item => ({
              productName: item.productName,
              quantity: item.quantity,
              price: parseFloat(item.price)
            }))
          };

          const whatsappResult = await whatsappService.sendOrderConfirmation(orderData);
          if (whatsappResult.success) {
            console.log(`📱 WhatsApp de confirmación enviado a ${order.customerPhone}`);
          }

          // Notificar al admin también
          await whatsappService.notifyAdminPaymentConfirmed({
            orderNumber: order.orderNumber,
            customerName: `${order.customerFirstName} ${order.customerLastName}`,
            total: parseFloat(order.total),
            paymentMethod: 'Niubiz'
          });
        }
      } catch (error) {
        console.error('❌ Error creando órdenes con proveedores:', error);
      }
    }, 500);

    // Responder rápidamente a Niubiz
    res.status(200).json({
      success: true,
      message: 'Webhook procesado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error procesando webhook de Niubiz:', error);
    res.status(500).json({
      success: false,
      message: 'Error procesando webhook'
    });
  }
});

/**
 * POST /api/webhooks/pagoefectivo - Webhook para pagos en efectivo con PagoEfectivo
 * Se ejecuta cuando el cliente paga en un agente/banco/bodega
 */
router.post('/pagoefectivo', async (req, res) => {
  try {
    const { transactionCode, cip, status, amount, operationNumber, paymentDate } = req.body;

    console.log('📨 Webhook PagoEfectivo recibido:', { transactionCode, cip, status });

    // Verificar firma del webhook para seguridad
    const signature = req.headers['x-pagoefectivo-signature'];
    const validSecret = process.env.PAGOEFECTIVO_WEBHOOK_SECRET || 'pagoefectivo-secret-2024';

    if (signature) {
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', validSecret)
        .update(JSON.stringify({ transactionCode, cip, status }))
        .digest('hex');

      if (signature !== expectedSignature) {
        console.warn('⚠️ Firma inválida de PagoEfectivo');
        return res.status(403).json({
          success: false,
          message: 'Firma de seguridad inválida'
        });
      }
    }

    if (!transactionCode || !status) {
      return res.status(400).json({
        success: false,
        message: 'Datos incompletos en webhook'
      });
    }

    // Solo procesar si el pago fue confirmado
    if (status !== 'PAID') {
      return res.status(200).json({
        success: true,
        message: `Pago no completado (status: ${status})`
      });
    }

    // transactionCode es el orderId
    const orderId = transactionCode;

    // Buscar orden
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    // Actualizar orden a PAID
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        notes: `Pago en efectivo confirmado por PagoEfectivo. CIP: ${cip}, Operación: ${operationNumber}`
      }
    });

    console.log(`✅ Orden ${order.orderNumber} pagada con PagoEfectivo (CIP: ${cip})`);

    // 🚀 CREAR Y NOTIFICAR A PROVEEDORES + WHATSAPP AL CLIENTE
    setTimeout(async () => {
      try {
        const { createSupplierOrderFromCustomerOrder } = require('../services/supplierOrderService');
        const { sendOrderToSuppliers } = require('../services/supplierNotificationService');

        const supplierResult = await createSupplierOrderFromCustomerOrder(orderId);

        if (supplierResult.success) {
          console.log(`✅ ${supplierResult.supplierOrders.length} órdenes con proveedores creadas`);

          // Enviar notificaciones
          const notificationResults = await sendOrderToSuppliers(supplierResult.supplierOrders);
          console.log(`📧 Notificaciones enviadas a proveedores`);
        }

        // 📱 ENVIAR WHATSAPP AL CLIENTE
        if (order.customerPhone) {
          const orderData = {
            orderNumber: order.orderNumber,
            customerPhone: order.customerPhone,
            customerName: `${order.customerFirstName} ${order.customerLastName}`,
            total: parseFloat(order.total),
            items: order.items.map(item => ({
              productName: item.productName,
              quantity: item.quantity,
              price: parseFloat(item.price)
            }))
          };

          const whatsappResult = await whatsappService.sendOrderConfirmation(orderData);
          if (whatsappResult.success) {
            console.log(`📱 WhatsApp de confirmación enviado a ${order.customerPhone}`);
          }

          // Notificar al admin también
          await whatsappService.notifyAdminPaymentConfirmed({
            orderNumber: order.orderNumber,
            customerName: `${order.customerFirstName} ${order.customerLastName}`,
            total: parseFloat(order.total),
            paymentMethod: 'PagoEfectivo'
          });
        }
      } catch (error) {
        console.error('❌ Error creando órdenes con proveedores:', error);
      }
    }, 500);

    // Responder rápidamente a PagoEfectivo
    res.status(200).json({
      success: true,
      message: 'Webhook procesado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error procesando webhook de PagoEfectivo:', error);
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
    paymentGateways: [
      'POST /api/webhooks/niubiz - Niubiz pagos con tarjeta ✅',
      'POST /api/webhooks/pagoefectivo - PagoEfectivo pagos en efectivo ✅'
    ],
    suppliers: [
      'POST /api/webhooks/tracking - Tracking genérico',
      'POST /api/webhooks/aliexpress - AliExpress específico',
      'POST /api/webhooks/cj - CJ Dropshipping específico',
      'POST /api/webhooks/status - Actualización de estado'
    ],
    other: [
      'GET /api/webhooks/test - Prueba de webhooks'
    ]
  });
});

module.exports = router;
