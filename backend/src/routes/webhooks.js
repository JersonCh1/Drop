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
 * POST /api/webhooks/culqi - Webhook para pagos con Culqi
 * Se ejecuta automáticamente cuando un pago es exitoso en Culqi
 */
router.post('/culqi', async (req, res) => {
  try {
    const { object, type } = req.body;

    console.log('📨 Webhook Culqi recibido:', { type, chargeId: object?.id });

    // Validar que sea un evento de cargo exitoso
    if (type !== 'charge.succeeded') {
      return res.status(200).json({
        success: true,
        message: 'Evento no procesado (no es charge.succeeded)'
      });
    }

    const charge = object;

    // TODO: Verificar firma/secret de Culqi para seguridad
    // En producción, usar: req.headers['x-culqi-signature']

    if (!charge || !charge.metadata || !charge.metadata.order_id) {
      console.log('⚠️  Charge sin orderId en metadata');
      return res.status(400).json({
        success: false,
        message: 'No se encontró orderId en metadata'
      });
    }

    const orderId = charge.metadata.order_id;

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
        notes: `Pago confirmado automáticamente por Culqi. Charge ID: ${charge.id}`
      }
    });

    console.log(`✅ Orden ${order.orderNumber} pagada con Culqi (${charge.id})`);

    // 🚀 CREAR Y NOTIFICAR A PROVEEDORES
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
      } catch (error) {
        console.error('❌ Error creando órdenes con proveedores:', error);
      }
    }, 500);

    // Responder rápidamente a Culqi
    res.status(200).json({
      success: true,
      message: 'Webhook procesado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error procesando webhook de Culqi:', error);
    res.status(500).json({
      success: false,
      message: 'Error procesando webhook'
    });
  }
});

/**
 * POST /api/webhooks/mercadopago - Webhook para pagos con MercadoPago
 * Se ejecuta cuando un pago es procesado en MercadoPago
 */
router.post('/mercadopago', async (req, res) => {
  try {
    const { type, data, action } = req.body;

    console.log('📨 Webhook MercadoPago recibido:', { type, action });

    // MercadoPago envía eventos de tipo "payment"
    if (type !== 'payment') {
      return res.status(200).json({
        success: true,
        message: 'Evento no procesado (no es payment)'
      });
    }

    // Obtener ID del pago
    const paymentId = data?.id;
    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'No se encontró paymentId'
      });
    }

    // Consultar el pago en MercadoPago
    const mercadopago = require('mercadopago');
    mercadopago.configure({
      access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
    });

    const payment = await mercadopago.payment.findById(paymentId);

    console.log(`💳 Pago MercadoPago: ${paymentId} - Estado: ${payment.body.status}`);

    // Solo procesar si el pago fue aprobado
    if (payment.body.status !== 'approved') {
      return res.status(200).json({
        success: true,
        message: `Pago no aprobado (status: ${payment.body.status})`
      });
    }

    // Buscar orderId en el metadata/external_reference
    const orderId = payment.body.external_reference || payment.body.metadata?.order_id;

    if (!orderId) {
      console.log('⚠️  Pago sin orderId en external_reference');
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
        notes: `Pago confirmado automáticamente por MercadoPago. Payment ID: ${paymentId}`
      }
    });

    console.log(`✅ Orden ${order.orderNumber} pagada con MercadoPago (${paymentId})`);

    // 🚀 CREAR Y NOTIFICAR A PROVEEDORES
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
      } catch (error) {
        console.error('❌ Error creando órdenes con proveedores:', error);
      }
    }, 500);

    // Responder rápidamente a MercadoPago
    res.status(200).json({
      success: true,
      message: 'Webhook procesado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error procesando webhook de MercadoPago:', error);
    res.status(500).json({
      success: false,
      message: 'Error procesando webhook'
    });
  }
});

/**
 * POST /api/webhooks/stripe - Webhook para pagos con Stripe
 * Se ejecuta cuando un pago es exitoso en Stripe
 */
router.post('/stripe', async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed:`, err.message);
      return res.sendStatus(400);
    }

    console.log('📨 Webhook Stripe recibido:', { type: event.type });

    // Procesar evento payment_intent.succeeded
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;

      // Obtener orderId del metadata
      const orderId = paymentIntent.metadata.order_id;

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: 'No se encontró orderId en metadata'
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
          notes: `Pago confirmado automáticamente por Stripe. Payment Intent: ${paymentIntent.id}`
        }
      });

      console.log(`✅ Orden ${order.orderNumber} pagada con Stripe (${paymentIntent.id})`);

      // 🚀 CREAR Y NOTIFICAR A PROVEEDORES
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
        } catch (error) {
          console.error('❌ Error creando órdenes con proveedores:', error);
        }
      }, 500);
    }

    res.json({ received: true });

  } catch (error) {
    console.error('❌ Error procesando webhook de Stripe:', error);
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
      'POST /api/webhooks/culqi - Culqi pagos (NUEVO)',
      'POST /api/webhooks/mercadopago - MercadoPago pagos (NUEVO)',
      'POST /api/webhooks/stripe - Stripe pagos (NUEVO)',
      'POST /api/webhooks/tracking - Tracking genérico',
      'POST /api/webhooks/aliexpress - AliExpress específico',
      'POST /api/webhooks/cj - CJ Dropshipping específico',
      'POST /api/webhooks/status - Actualización de estado',
      'GET /api/webhooks/test - Prueba de webhooks'
    ]
  });
});

module.exports = router;
