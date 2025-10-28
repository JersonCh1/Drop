// backend/src/routes/stripe.js
const express = require('express');
const router = express.Router();
const stripeService = require('../services/stripeServiceSimple');
const { PrismaClient } = require('@prisma/client');
const supplierOrderService = require('../services/supplierOrderService');

const prisma = new PrismaClient();

// POST /api/stripe/create-checkout-session - Crear sesión de pago con Stripe
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { items, customerInfo, shippingCost = 0, total } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: 'Items son requeridos'
      });
    }

    if (!customerInfo || !customerInfo.email) {
      return res.status(400).json({
        success: false,
        message: 'Información del cliente es requerida'
      });
    }

    // Verificar si Stripe está configurado
    if (!stripeService.isConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'Stripe no está configurado. Agrega STRIPE_SECRET_KEY a las variables de entorno.'
      });
    }

    // Crear orden primero
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

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
        shippingCountry: customerInfo.country || 'PE',
        notes: customerInfo.notes || null,
        subtotal: total - shippingCost,
        shippingCost: shippingCost,
        tax: 0,
        total: total,
        paymentMethod: 'stripe',
        status: 'PENDING',
        paymentStatus: 'PENDING'
      }
    });

    // Crear sesión de checkout
    const session = await stripeService.createCheckoutSession({
      items,
      customerInfo,
      orderId: order.id,
      orderNumber: order.orderNumber,
      shippingCost,
      total
    });

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      orderId: order.id,
      orderNumber: order.orderNumber
    });

  } catch (error) {
    console.error('❌ Error creando sesión de Stripe:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear sesión de pago',
      error: error.message
    });
  }
});

// POST /api/stripe/webhook - Webhook de Stripe para eventos
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripeService.constructWebhookEvent(req.body, sig);

    console.log(`🎯 Stripe Webhook: ${event.type}`);

    // Manejar diferentes tipos de eventos
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;

        // Actualizar orden con información de pago
        if (session.metadata.orderId) {
          await prisma.order.update({
            where: { id: session.metadata.orderId },
            data: {
              paymentStatus: 'PAID',
              status: 'CONFIRMED',
              stripePaymentId: session.payment_intent,
              stripeSessionId: session.id
            }
          });

          console.log(`✅ Orden ${session.metadata.orderId} marcada como pagada`);

          // 🚀 AUTOMATIZACIÓN: Crear orden automáticamente en CJ Dropshipping
          try {
            console.log(`🤖 Iniciando creación automática de orden en CJ para ${session.metadata.orderId}...`);
            const supplierOrderResult = await supplierOrderService.createSupplierOrderFromCustomerOrder(
              session.metadata.orderId
            );

            if (supplierOrderResult.success) {
              console.log(`✅ Orden automática en CJ creada: ${supplierOrderResult.supplierOrders.length} orden(es)`);
            } else {
              console.error(`⚠️ No se pudo crear orden automática en CJ: ${supplierOrderResult.error}`);
            }
          } catch (autoOrderError) {
            // No fallar el webhook si la automatización falla
            console.error('❌ Error en automatización de orden:', autoOrderError);
          }
        }
        break;

      case 'payment_intent.succeeded':
        console.log(`💳 Pago exitoso: ${event.data.object.id}`);
        break;

      case 'payment_intent.payment_failed':
        console.log(`❌ Pago fallido: ${event.data.object.id}`);

        if (event.data.object.metadata.orderId) {
          await prisma.order.update({
            where: { id: event.data.object.metadata.orderId },
            data: {
              paymentStatus: 'FAILED'
            }
          });
        }
        break;

      default:
        console.log(`ℹ️  Evento no manejado: ${event.type}`);
    }

    res.json({ received: true });

  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/stripe/create-payment-intent - Crear payment intent (para pago inline)
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { orderId, amount, currency = 'usd', customerInfo } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Monto inválido'
      });
    }

    if (!stripeService.isConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'Stripe no está configurado'
      });
    }

    // Crear payment intent
    const paymentIntent = await stripeService.createPaymentIntent({
      amount,
      currency,
      orderId,
      customerInfo
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('❌ Error creando payment intent:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear intento de pago',
      error: error.message
    });
  }
});

// GET /api/stripe/session/:sessionId - Obtener información de sesión
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!stripeService.isConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'Stripe no está configurado'
      });
    }

    const session = await stripeService.getSession(sessionId);

    res.json({
      success: true,
      data: {
        id: session.id,
        paymentStatus: session.payment_status,
        customerEmail: session.customer_details?.email,
        amountTotal: session.amount_total,
        currency: session.currency
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo sesión:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener información de sesión',
      error: error.message
    });
  }
});

module.exports = router;
