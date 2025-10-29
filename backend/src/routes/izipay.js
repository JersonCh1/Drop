const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const axios = require('axios');

// Credenciales de Izipay (desde variables de entorno)
const IZIPAY_USERNAME = process.env.IZIPAY_USERNAME; // Ej: 005884266
const IZIPAY_PASSWORD = process.env.IZIPAY_PASSWORD; // Test/Production Key
const IZIPAY_PUBLIC_KEY = process.env.IZIPAY_PUBLIC_KEY; // Public Key
const IZIPAY_HMACSHA256 = process.env.IZIPAY_HMACSHA256; // HMAC-SHA256 Key
const IZIPAY_API_URL = process.env.IZIPAY_API_URL || 'https://api.micuentaweb.pe/api-payment';
const CJ_API_URL = process.env.CJ_API_URL || 'https://developers.cjdropshipping.com/api2.0/v1';
const CJ_ACCESS_TOKEN = process.env.CJ_ACCESS_TOKEN;

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

    // Validaciones
    if (!amount || !orderId || !email) {
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

    // Preparar datos para Izipay
    const paymentData = {
      amount: Math.round(amount * 100), // Convertir a centavos
      currency: currency,
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
      amount: paymentData.amount,
      currency: paymentData.currency,
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

    // Si el pago fue exitoso
    if (orderStatus === 'PAID') {
      console.log('💰 Pago confirmado - Procesando orden...');

      // Aquí obtendrías los detalles de la orden de tu base de datos
      // Por ahora, simularemos con datos del webhook

      // AUTOMATIZACIÓN: Crear orden en CJ Dropshipping
      if (CJ_ACCESS_TOKEN) {
        try {
          console.log('🚀 Creando orden en CJ Dropshipping...');

          // Aquí necesitarías obtener los items de la orden desde tu BD
          // Por ahora, este es un ejemplo de estructura

          const cjOrderData = {
            orderNumber: orderId,
            shippingInfo: {
              // Estos datos deberían venir de tu BD
              firstName: answerData.customer?.billingDetails?.firstName || '',
              lastName: answerData.customer?.billingDetails?.lastName || '',
              email: answerData.customer?.email || '',
              phone: answerData.customer?.billingDetails?.phoneNumber || '',
              address: answerData.customer?.billingDetails?.address || '',
              city: answerData.customer?.billingDetails?.city || '',
              state: answerData.customer?.billingDetails?.state || '',
              zipCode: answerData.customer?.billingDetails?.zipCode || '',
              country: answerData.customer?.billingDetails?.country || 'PE'
            },
            products: [
              // Aquí irían los productos de la orden desde tu BD
              // Ejemplo:
              // {
              //   productId: 'CJ_PRODUCT_ID',
              //   quantity: 1,
              //   variantId: 'VARIANT_ID'
              // }
            ]
          };

          // Llamar a la API de CJ Dropshipping
          const cjResponse = await axios.post(
            `${CJ_API_URL}/shopping/order/createOrder`,
            cjOrderData,
            {
              headers: {
                'CJ-Access-Token': CJ_ACCESS_TOKEN,
                'Content-Type': 'application/json'
              }
            }
          );

          if (cjResponse.data.result) {
            console.log('✅ Orden creada en CJ Dropshipping:', cjResponse.data.data.orderId);

            // Aquí actualizarías la orden en tu BD con el ID de CJ
            // await Order.update({ cjOrderId: cjResponse.data.data.orderId }, { where: { orderNumber: orderId } });
          } else {
            console.error('❌ Error creando orden en CJ:', cjResponse.data.message);
          }

        } catch (cjError) {
          console.error('❌ Error en automatización CJ:', cjError.response?.data || cjError.message);
        }
      } else {
        console.log('⚠️ CJ Access Token no configurado - Orden no enviada automáticamente');
      }

      // Aquí actualizarías el estado de la orden en tu base de datos
      // await Order.update({ status: 'paid', paymentConfirmed: true }, { where: { orderNumber: orderId } });

      console.log('✅ Orden procesada exitosamente');
    } else {
      console.log('⚠️ Pago no completado. Estado:', orderStatus);
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
    cjAutomation: !!CJ_ACCESS_TOKEN,
    apiUrl: IZIPAY_API_URL
  };

  res.json(status);
});

module.exports = router;
