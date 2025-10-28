const express = require('express');
const router = express.Router();
const mercadopago = require('mercadopago');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Configurar MercadoPago
const configureMercadoPago = () => {
  if (process.env.MERCADOPAGO_ACCESS_TOKEN) {
    mercadopago.configure({
      access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
    });
    return true;
  }
  return false;
};

/**
 * POST /api/mercadopago/create-preference
 * Crear preferencia de pago para MercadoPago
 */
router.post('/create-preference', async (req, res) => {
  try {
    if (!configureMercadoPago()) {
      return res.status(500).json({
        error: 'MercadoPago no está configurado. Agrega MERCADOPAGO_ACCESS_TOKEN a las variables de entorno.'
      });
    }

    const { orderData, items } = req.body;

    if (!orderData || !items || items.length === 0) {
      return res.status(400).json({ error: 'Datos de orden o items faltantes' });
    }

    // Calcular total
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Crear orden en la base de datos
    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}`,
        status: 'pending',
        totalAmount: total,
        currency: 'PEN',
        paymentMethod: 'mercadopago',
        paymentStatus: 'pending',
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        customerPhone: orderData.customerPhone,
        shippingAddress: orderData.shippingAddress,
        shippingCity: orderData.shippingCity,
        shippingState: orderData.shippingState || 'Lima',
        shippingZip: orderData.shippingZip,
        shippingCountry: orderData.shippingCountry || 'PE',
        items: {
          create: items.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
            productName: item.name,
            productImage: item.image
          }))
        }
      },
      include: {
        items: true
      }
    });

    // Crear preferencia de MercadoPago
    const preference = {
      items: items.map(item => ({
        title: item.name,
        unit_price: item.price,
        quantity: item.quantity,
        currency_id: 'PEN'
      })),
      payer: {
        name: orderData.customerName,
        email: orderData.customerEmail,
        phone: {
          number: orderData.customerPhone
        }
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?orderId=${order.id}`,
        failure: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/failure?orderId=${order.id}`,
        pending: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/pending?orderId=${order.id}`
      },
      auto_return: 'approved',
      external_reference: order.orderNumber,
      notification_url: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/mercadopago/webhook`,
      statement_descriptor: 'iPhone Store'
    };

    const response = await mercadopago.preferences.create(preference);

    res.json({
      preferenceId: response.body.id,
      initPoint: response.body.init_point,
      orderId: order.id,
      orderNumber: order.orderNumber
    });

  } catch (error) {
    console.error('Error creating MercadoPago preference:', error);
    res.status(500).json({
      error: 'Error al crear la preferencia de pago',
      details: error.message
    });
  }
});

/**
 * POST /api/mercadopago/webhook
 * Webhook para recibir notificaciones de MercadoPago
 */
router.post('/webhook', async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type === 'payment') {
      if (!configureMercadoPago()) {
        return res.sendStatus(500);
      }

      // Obtener información del pago
      const payment = await mercadopago.payment.findById(data.id);
      const externalReference = payment.body.external_reference;

      // Buscar orden por orderNumber
      const order = await prisma.order.findFirst({
        where: { orderNumber: externalReference }
      });

      if (!order) {
        console.error('Order not found:', externalReference);
        return res.sendStatus(404);
      }

      // Actualizar estado según el pago
      let orderStatus = order.status;
      let paymentStatus = 'pending';

      switch (payment.body.status) {
        case 'approved':
          orderStatus = 'confirmed';
          paymentStatus = 'paid';
          break;
        case 'pending':
        case 'in_process':
          orderStatus = 'pending';
          paymentStatus = 'pending';
          break;
        case 'rejected':
        case 'cancelled':
          orderStatus = 'cancelled';
          paymentStatus = 'failed';
          break;
        default:
          paymentStatus = 'pending';
      }

      // Actualizar orden
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: orderStatus,
          paymentStatus: paymentStatus,
          paymentId: payment.body.id.toString()
        }
      });

      console.log(`Order ${order.orderNumber} updated: ${orderStatus} - ${paymentStatus}`);

      // 🤖 AUTOMATIZACIÓN: Si el pago fue aprobado, crear orden en CJ Dropshipping
      if (payment.body.status === 'approved') {
        setTimeout(async () => {
          try {
            const supplierOrderService = require('../services/supplierOrderService');
            const result = await supplierOrderService.createSupplierOrderFromCustomerOrder(order.id);

            if (result.success) {
              console.log(`✅ Orden automática en CJ creada: ${result.supplierOrders.length} orden(es)`);
            }
          } catch (autoError) {
            console.error('❌ Error en automatización de CJ:', autoError);
          }
        }, 500);
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('MercadoPago webhook error:', error);
    res.sendStatus(500);
  }
});

/**
 * GET /api/mercadopago/payment/:paymentId
 * Obtener información de un pago
 */
router.get('/payment/:paymentId', async (req, res) => {
  try {
    if (!configureMercadoPago()) {
      return res.status(500).json({
        error: 'MercadoPago no está configurado'
      });
    }

    const { paymentId } = req.params;
    const payment = await mercadopago.payment.findById(paymentId);

    res.json({
      status: payment.body.status,
      statusDetail: payment.body.status_detail,
      amount: payment.body.transaction_amount,
      currency: payment.body.currency_id,
      externalReference: payment.body.external_reference
    });

  } catch (error) {
    console.error('Error getting payment:', error);
    res.status(500).json({
      error: 'Error al obtener información del pago',
      details: error.message
    });
  }
});

module.exports = router;
