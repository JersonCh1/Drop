// backend/src/routes/payu.js
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * PayU - Procesador de pagos para Latinoamérica
 * https://developers.payulatam.com/
 *
 * Soporta: Colombia, Perú, México, Argentina, Brasil, Chile, Panamá
 * Métodos: Tarjetas de crédito/débito, efectivo, transferencias
 */

// Configuración de PayU
const PAYU_CONFIG = {
  merchantId: process.env.PAYU_MERCHANT_ID,
  accountId: process.env.PAYU_ACCOUNT_ID,
  apiKey: process.env.PAYU_API_KEY,
  apiLogin: process.env.PAYU_API_LOGIN,
  publicKey: process.env.PAYU_PUBLIC_KEY,
  // Sandbox o Production
  isProduction: process.env.PAYU_ENV === 'production',
  apiUrl: process.env.PAYU_ENV === 'production'
    ? 'https://api.payulatam.com/payments-api/4.0/service.cgi'
    : 'https://sandbox.api.payulatam.com/payments-api/4.0/service.cgi',
  paymentUrl: process.env.PAYU_ENV === 'production'
    ? 'https://checkout.payulatam.com/ppp-web-gateway-payu/'
    : 'https://sandbox.checkout.payulatam.com/ppp-web-gateway-payu/'
};

/**
 * POST /api/payu/create-payment
 * Crear orden de pago con PayU
 */
router.post('/create-payment', async (req, res) => {
  try {
    const { orderData, customerInfo, amount, currency = 'PEN' } = req.body;

    if (!amount || !customerInfo) {
      return res.status(400).json({
        success: false,
        message: 'Datos incompletos'
      });
    }

    // Verificar configuración
    if (!PAYU_CONFIG.merchantId || !PAYU_CONFIG.apiKey) {
      return res.status(503).json({
        success: false,
        message: 'PayU no está configurado. Agrega las variables de entorno.'
      });
    }

    // Crear orden en base de datos
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
        subtotal: orderData.subtotal || amount,
        shippingCost: orderData.shippingCost || 0,
        tax: orderData.tax || 0,
        total: amount,
        paymentMethod: 'payu',
        status: 'PENDING',
        paymentStatus: 'PENDING'
      }
    });

    // Generar referencia única
    const referenceCode = order.id;

    // Generar firma de seguridad
    // Formato: ApiKey~merchantId~referenceCode~amount~currency
    const signature = crypto
      .createHash('md5')
      .update(`${PAYU_CONFIG.apiKey}~${PAYU_CONFIG.merchantId}~${referenceCode}~${amount}~${currency}`)
      .digest('hex');

    console.log(`💳 Orden PayU creada: ${orderNumber} - ${referenceCode}`);

    // Datos para el formulario de PayU
    const paymentData = {
      merchantId: PAYU_CONFIG.merchantId,
      accountId: PAYU_CONFIG.accountId,
      description: `Orden ${orderNumber}`,
      referenceCode: referenceCode,
      amount: amount,
      tax: orderData.tax || 0,
      taxReturnBase: orderData.subtotal || amount,
      currency: currency,
      signature: signature,
      test: PAYU_CONFIG.isProduction ? 0 : 1,
      buyerEmail: customerInfo.email,
      buyerFullName: `${customerInfo.firstName} ${customerInfo.lastName}`,
      telephone: customerInfo.phone,
      shippingAddress: customerInfo.address,
      shippingCity: customerInfo.city,
      shippingCountry: customerInfo.country || 'PE',
      responseUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/response`,
      confirmationUrl: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/payu/webhook`
    };

    res.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentUrl: PAYU_CONFIG.paymentUrl,
      paymentData: paymentData
    });

  } catch (error) {
    console.error('❌ Error creando pago PayU:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear orden de pago',
      error: error.message
    });
  }
});

/**
 * POST /api/payu/webhook
 * Webhook de confirmación de PayU
 */
router.post('/webhook', async (req, res) => {
  try {
    const {
      merchant_id,
      state_pol,
      risk,
      response_code_pol,
      reference_sale,
      reference_pol,
      sign,
      value,
      currency,
      transaction_date,
      payment_method_type,
      transaction_id
    } = req.body;

    console.log('📨 Webhook PayU recibido:', {
      reference: reference_sale,
      state: state_pol,
      transaction: transaction_id
    });

    // Verificar firma de seguridad
    // Formato: ApiKey~merchantId~referenceCode~value~currency~state_pol
    const expectedSignature = crypto
      .createHash('md5')
      .update(`${PAYU_CONFIG.apiKey}~${merchant_id}~${reference_sale}~${value}~${currency}~${state_pol}`)
      .digest('hex');

    if (sign && sign !== expectedSignature) {
      console.warn('⚠️ Firma inválida de PayU');
      return res.status(403).json({
        success: false,
        message: 'Firma de seguridad inválida'
      });
    }

    // Buscar orden
    const order = await prisma.order.findUnique({
      where: { id: reference_sale },
      include: { items: true }
    });

    if (!order) {
      console.error('❌ Orden no encontrada:', reference_sale);
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    // Mapear estados de PayU a nuestro sistema
    let orderStatus = 'PENDING';
    let paymentStatus = 'PENDING';

    switch (state_pol) {
      case '4': // APPROVED
        orderStatus = 'CONFIRMED';
        paymentStatus = 'PAID';
        break;
      case '6': // DECLINED
        orderStatus = 'CANCELLED';
        paymentStatus = 'FAILED';
        break;
      case '5': // EXPIRED
        orderStatus = 'CANCELLED';
        paymentStatus = 'FAILED';
        break;
      case '7': // PENDING
        orderStatus = 'PENDING';
        paymentStatus = 'PENDING';
        break;
      default:
        orderStatus = 'PENDING';
        paymentStatus = 'PENDING';
    }

    // Actualizar orden
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: paymentStatus,
        status: orderStatus,
        payuTransactionId: transaction_id,
        payuReferenceCode: reference_pol,
        notes: `PayU: ${payment_method_type || 'Tarjeta'} - Estado: ${state_pol}`
      }
    });

    console.log(`✅ Orden ${order.orderNumber} actualizada: ${orderStatus}`);

    // 🚀 AUTOMATIZACIÓN: Si el pago fue aprobado, crear orden en CJ Dropshipping
    if (state_pol === '4') { // APPROVED
      setTimeout(async () => {
        try {
          const supplierOrderService = require('../services/supplierOrderService');
          const result = await supplierOrderService.createSupplierOrderFromCustomerOrder(order.id);

          if (result.success) {
            console.log(`✅ Orden automática en CJ creada: ${result.supplierOrders.length} orden(es)`);
          } else {
            console.error(`⚠️ No se pudo crear orden en CJ: ${result.error}`);
          }
        } catch (autoError) {
          console.error('❌ Error en automatización de CJ:', autoError);
        }
      }, 500);
    }

    res.status(200).json({
      success: true,
      message: 'Webhook procesado'
    });

  } catch (error) {
    console.error('❌ Error procesando webhook PayU:', error);
    res.status(500).json({
      success: false,
      message: 'Error procesando webhook'
    });
  }
});

/**
 * GET /api/payu/payment-status/:orderId
 * Consultar estado de pago
 */
router.get('/payment-status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        payuTransactionId: true,
        total: true
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    res.json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        transactionId: order.payuTransactionId,
        total: order.total
      }
    });

  } catch (error) {
    console.error('❌ Error consultando estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al consultar estado',
      error: error.message
    });
  }
});

/**
 * GET /api/payu/config
 * Obtener configuración pública de PayU
 */
router.get('/config', (req, res) => {
  res.json({
    success: true,
    merchantId: PAYU_CONFIG.merchantId,
    accountId: PAYU_CONFIG.accountId,
    publicKey: PAYU_CONFIG.publicKey,
    paymentUrl: PAYU_CONFIG.paymentUrl,
    isProduction: PAYU_CONFIG.isProduction,
    isConfigured: !!(PAYU_CONFIG.merchantId && PAYU_CONFIG.apiKey)
  });
});

module.exports = router;
