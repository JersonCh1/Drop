const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const cjAuthService = require('../services/cjAuthService');

const prisma = new PrismaClient();

// Credenciales de Izipay (desde variables de entorno)
const IZIPAY_USERNAME = process.env.IZIPAY_USERNAME; // Ej: 005884266
const IZIPAY_PASSWORD = process.env.IZIPAY_PASSWORD; // Test/Production Key
const IZIPAY_PUBLIC_KEY = process.env.IZIPAY_PUBLIC_KEY; // Public Key
const IZIPAY_HMACSHA256 = process.env.IZIPAY_HMACSHA256; // HMAC-SHA256 Key
const IZIPAY_API_URL = process.env.IZIPAY_API_URL || 'https://api.micuentaweb.pe/api-payment';
const CJ_API_URL = process.env.CJ_API_URL || 'https://developers.cjdropshipping.com/api2.0/v1';

console.log('🟢 Izipay - Módulo de pagos cargado');
console.log('Izipay Username:', IZIPAY_USERNAME ? '✓ Configurado' : '✗ Faltante');
console.log('Izipay Password:', IZIPAY_PASSWORD ? '✓ Configurado' : '✗ Faltante');
console.log('Izipay Public Key:', IZIPAY_PUBLIC_KEY ? '✓ Configurado' : '✗ Faltante');
console.log('Izipay HMAC Key:', IZIPAY_HMACSHA256 ? '✓ Configurado' : '✗ Faltante');

/**
 * Endpoint: POST /izipay/formtoken
 * Genera el FormToken para el formulario de pago
 */
router.post('/formtoken', async (req, res) => {
  try {
    console.log('🔵 Izipay - Generando FormToken');

    const {
      amount,
      currency = 'PEN',
      orderId,
      email,
      firstName,
      lastName,
      phoneNumber,
      identityType = 'DNI',
      identityCode,
      address,
      country = 'PE',
      city,
      state,
      zipCode,
      payMethod // Puede ser: 'CARD', 'YAPE_CODE', 'PLIN', null (por defecto tarjetas)
    } = req.body;

    // Debug: mostrar todos los datos recibidos
    console.log('📥 Datos recibidos:', JSON.stringify(req.body, null, 2));

    // Validaciones
    if (!amount || !orderId || !email) {
      console.error('❌ Faltan datos:', { amount, orderId, email });
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos: amount, orderId, email'
      });
    }

    if (!IZIPAY_USERNAME || !IZIPAY_PASSWORD) {
      console.error('❌ Credenciales de Izipay no configuradas');
      return res.status(500).json({
        success: false,
        message: 'Credenciales de Izipay no configuradas en el servidor'
      });
    }

    // Izipay SOLO acepta PEN - Convertir si viene en USD
    let finalAmount = amount;
    let finalCurrency = 'PEN';

    if (currency === 'USD') {
      // Tasa de cambio USD a PEN (actualizar según necesites)
      const USD_TO_PEN = 3.75;
      finalAmount = amount * USD_TO_PEN;
      console.log(`💱 Conversión: ${amount} USD = ${finalAmount.toFixed(2)} PEN`);
    }

    // Preparar datos para Izipay
    const paymentData = {
      amount: Math.round(finalAmount * 100), // Convertir a centavos
      currency: finalCurrency, // Siempre PEN para Izipay
      orderId: orderId,
      customer: {
        email: email,
        billingDetails: {
          firstName: firstName,
          lastName: lastName,
          phoneNumber: phoneNumber,
          identityCode: identityCode,
          address: address,
          country: country,
          city: city,
          state: state,
          zipCode: zipCode
        }
      }
    };

    // Agregar método de pago si se especifica
    if (payMethod) {
      paymentData.payMethod = payMethod;
      console.log('💳 Método de pago:', payMethod);
    }

    console.log('📦 Datos de pago:', {
      amountOriginal: `${amount} ${currency}`,
      amountFinal: `${finalAmount.toFixed(2)} ${finalCurrency}`,
      amountCentavos: paymentData.amount,
      orderId: paymentData.orderId,
      email: email
    });

    // Crear autenticación Basic
    const auth = Buffer.from(`${IZIPAY_USERNAME}:${IZIPAY_PASSWORD}`).toString('base64');

    // Llamar a la API de Izipay para crear el FormToken
    const response = await axios.post(
      `${IZIPAY_API_URL}/V4/Charge/CreatePayment`,
      paymentData,
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ FormToken generado exitosamente');

    // Responder con el FormToken y PublicKey
    res.json({
      success: true,
      formToken: response.data.answer.formToken,
      publicKey: IZIPAY_PUBLIC_KEY
    });

  } catch (error) {
    console.error('❌ Error generando FormToken:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Error al generar FormToken',
      error: error.response?.data?.errorMessage || error.message
    });
  }
});

/**
 * Endpoint: POST /izipay/validate
 * Valida la firma HMAC-SHA256 de la respuesta
 */
router.post('/validate', async (req, res) => {
  try {
    console.log('🔵 Izipay - Validando firma de pago');

    const { kr_answer, kr_hash } = req.body;

    if (!kr_answer || !kr_hash) {
      return res.status(400).json({
        success: false,
        message: 'Faltan parámetros: kr_answer y kr_hash'
      });
    }

    if (!IZIPAY_HMACSHA256) {
      console.error('❌ HMAC Key no configurada');
      return res.status(500).json({
        success: false,
        message: 'HMAC Key no configurada en el servidor'
      });
    }

    // Calcular el hash esperado
    const calculatedHash = crypto
      .createHmac('sha256', IZIPAY_HMACSHA256)
      .update(kr_answer)
      .digest('hex');

    // Comparar hashes
    const isValid = calculatedHash === kr_hash;

    console.log(isValid ? '✅ Firma válida' : '❌ Firma inválida');

    res.json({
      success: true,
      valid: isValid
    });

  } catch (error) {
    console.error('❌ Error validando firma:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al validar firma',
      error: error.message
    });
  }
});

/**
 * Endpoint: POST /izipay/ipn
 * Webhook para recibir notificaciones de Izipay (IPN - Instant Payment Notification)
 */
router.post('/ipn', async (req, res) => {
  try {
    console.log('🟣 Izipay IPN - Notificación recibida');
    console.log('📦 Datos recibidos:', JSON.stringify(req.body, null, 2));

    const { kr_answer, kr_hash } = req.body;

    // Validar firma con PASSWORD
    const calculatedHash = crypto
      .createHmac('sha256', IZIPAY_PASSWORD)
      .update(kr_answer)
      .digest('hex');

    if (calculatedHash !== kr_hash) {
      console.error('❌ Firma IPN inválida');
      return res.status(400).json({
        success: false,
        message: 'Firma inválida'
      });
    }

    console.log('✅ Firma IPN válida');

    // Parsear la respuesta
    const answerData = JSON.parse(kr_answer);
    const { orderStatus, orderId, transactions } = answerData;

    console.log('📊 Estado de la orden:', orderStatus);
    console.log('🆔 Order ID:', orderId);

    // Buscar la orden en la base de datos
    const order = await prisma.order.findUnique({
      where: { orderNumber: orderId },
      include: { items: true }
    });

    if (!order) {
      console.error('❌ Orden no encontrada en BD:', orderId);
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    // Extraer datos de la transacción
    const transaction = transactions?.[0];
    const transactionId = transaction?.uuid;
    const authCode = transaction?.transactionDetails?.cardDetails?.authorizationResponse;

    // Si el pago fue exitoso
    if (orderStatus === 'PAID') {
      console.log('💰 Pago confirmado vía IPN - Actualizando orden...');

      // Actualizar orden en la base de datos
      await prisma.order.update({
        where: { orderNumber: orderId },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
          transactionId: transactionId,
          notes: `Pago confirmado vía IPN. Auth: ${authCode || 'N/A'}`
        }
      });

      // Registrar en historial
      await prisma.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: 'CONFIRMED',
          notes: `Pago confirmado por Izipay IPN. Transaction ID: ${transactionId}`,
          createdBy: 'izipay-ipn'
        }
      });

      console.log('✅ Orden actualizada en BD:', orderId);

      // AUTOMATIZACIÓN: Crear orden en CJ Dropshipping
      if (cjAuthService.isConfigured()) {
        try {
          console.log('🚀 Creando orden en CJ Dropshipping...');

          // Obtener un access token válido
          const accessToken = await cjAuthService.getValidAccessToken();

          const cjOrderData = {
            orderNumber: orderId,
            shippingInfo: {
              firstName: order.customerFirstName,
              lastName: order.customerLastName,
              email: order.customerEmail,
              phone: order.customerPhone,
              address: order.shippingAddress,
              city: order.shippingCity,
              state: order.shippingState,
              zipCode: order.shippingPostalCode,
              country: order.shippingCountry
            },
            products: order.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              variantId: item.variantId
            }))
          };

          const cjResponse = await axios.post(
            `${CJ_API_URL}/shopping/order/createOrder`,
            cjOrderData,
            {
              headers: {
                'CJ-Access-Token': accessToken,
                'Content-Type': 'application/json'
              }
            }
          );

          if (cjResponse.data.result && cjResponse.data.code === 200) {
            const cjOrderId = cjResponse.data.data.orderId;
            console.log('✅ Orden creada en CJ Dropshipping:', cjOrderId);

            // Actualizar orden con el ID de CJ
            await prisma.order.update({
              where: { orderNumber: orderId },
              data: {
                notes: `${order.notes || ''}\nCJ Order ID: ${cjOrderId}`
              }
            });
          } else {
            console.error('❌ Error creando orden en CJ:', cjResponse.data.message);
          }

        } catch (cjError) {
          console.error('❌ Error en automatización CJ:', cjError.response?.data || cjError.message);
        }
      } else {
        console.log('⚠️ CJ Dropshipping no configurado (CJ_EMAIL y CJ_API_KEY requeridos)');
      }

      console.log('✅ Orden procesada exitosamente');
    } else if (orderStatus === 'UNPAID' || orderStatus === 'REFUSED') {
      // Actualizar orden como fallida
      await prisma.order.update({
        where: { orderNumber: orderId },
        data: {
          paymentStatus: 'FAILED',
          status: 'CANCELLED',
          notes: `Pago ${orderStatus} - Transaction ID: ${transactionId || 'N/A'}`
        }
      });

      await prisma.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: 'CANCELLED',
          notes: `Pago rechazado por Izipay. Estado: ${orderStatus}`,
          createdBy: 'izipay-ipn'
        }
      });

      console.log(`⚠️ Pago no completado. Estado: ${orderStatus}`);
    }

    // Responder OK a Izipay para confirmar recepción
    res.status(200).json({
      success: true,
      message: 'IPN procesado correctamente'
    });

  } catch (error) {
    console.error('❌ Error procesando IPN:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error procesando IPN',
      error: error.message
    });
  }
});

/**
 * Endpoint: GET /izipay/status
 * Verificar estado del módulo Izipay
 */
router.get('/status', (req, res) => {
  const status = {
    module: 'Izipay Payment Gateway',
    configured: !!(IZIPAY_USERNAME && IZIPAY_PASSWORD && IZIPAY_PUBLIC_KEY && IZIPAY_HMACSHA256),
    credentials: {
      username: !!IZIPAY_USERNAME,
      password: !!IZIPAY_PASSWORD,
      publicKey: !!IZIPAY_PUBLIC_KEY,
      hmacKey: !!IZIPAY_HMACSHA256
    },
    cjAutomation: cjAuthService.isConfigured(),
    apiUrl: IZIPAY_API_URL
  };

  res.json(status);
});

/**
 * Endpoint: GET /izipay/test-cj
 * Probar autenticación con CJ Dropshipping
 */
router.get('/test-cj', async (req, res) => {
  try {
    if (!cjAuthService.isConfigured()) {
      return res.status(400).json({
        success: false,
        message: 'CJ Dropshipping no está configurado. Verifica CJ_EMAIL y CJ_API_KEY en .env'
      });
    }

    console.log('🧪 Probando autenticación con CJ Dropshipping...');

    const accessToken = await cjAuthService.getValidAccessToken();

    res.json({
      success: true,
      message: 'Autenticación exitosa con CJ Dropshipping',
      tokenPreview: accessToken.substring(0, 20) + '...',
      configured: true
    });

  } catch (error) {
    console.error('❌ Error en test CJ:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al autenticar con CJ Dropshipping',
      error: error.message
    });
  }
});

module.exports = router;
