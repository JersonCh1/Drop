const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const axios = require('axios');

// Configuración de Niubiz
const NIUBIZ_CONFIG = {
  merchantId: process.env.NIUBIZ_MERCHANT_ID,
  username: process.env.NIUBIZ_USERNAME,
  password: process.env.NIUBIZ_PASSWORD,
  urlSecurity: process.env.NIUBIZ_URL_SECURITY || 'https://apisandbox.vnforappstest.com/api.security/v1/security',
  urlSession: process.env.NIUBIZ_URL_SESSION || 'https://apisandbox.vnforappstest.com/api.ecommerce/v2/ecommerce/token/session',
  urlAuthorization: process.env.NIUBIZ_URL_AUTHORIZATION || 'https://apisandbox.vnforappstest.com/api.authorization/v3/authorization/ecommerce',
  urlPaymentForm: process.env.NIUBIZ_URL_PAYMENT_FORM || 'https://static-content-qas.vnforapps.com/v2/js/checkout.js?qa=true'
};

// POST /api/niubiz/generate-token - Generar token de acceso
router.post('/generate-token', async (req, res) => {
  try {
    console.log('🔐 Generando token de acceso Niubiz');

    if (!NIUBIZ_CONFIG.username || !NIUBIZ_CONFIG.password) {
      return res.status(400).json({
        success: false,
        message: 'Niubiz no está configurado en el servidor'
      });
    }

    // Crear credenciales en Base64
    const credentials = Buffer.from(`${NIUBIZ_CONFIG.username}:${NIUBIZ_CONFIG.password}`).toString('base64');

    // Solicitar token
    const response = await axios.get(NIUBIZ_CONFIG.urlSecurity, {
      headers: {
        'Authorization': `Basic ${credentials}`
      }
    });

    console.log('✅ Token de acceso generado');

    res.status(200).json({
      success: true,
      token: response.data
    });

  } catch (error) {
    console.error('❌ Error al generar token Niubiz:', error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: 'Error al generar token de seguridad',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/niubiz/generate-session - Generar token de sesión para checkout
router.post('/generate-session', async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    console.log('🎫 Generando sesión de pago Niubiz:', { amount, orderId });

    if (!amount || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Monto y orderId son requeridos'
      });
    }

    // Primero obtener el token de acceso
    const credentials = Buffer.from(`${NIUBIZ_CONFIG.username}:${NIUBIZ_CONFIG.password}`).toString('base64');

    const tokenResponse = await axios.get(NIUBIZ_CONFIG.urlSecurity, {
      headers: {
        'Authorization': `Basic ${credentials}`
      }
    });

    const accessToken = tokenResponse.data;

    // Generar token de sesión
    const sessionData = {
      channel: 'web',
      amount: parseFloat(amount).toFixed(2),
      antifraud: {
        clientIp: req.ip || '127.0.0.1',
        merchantDefineData: {
          MDD4: orderId,
          MDD21: '0',
          MDD32: orderId,
          MDD75: 'Registrado',
          MDD77: '0'
        }
      }
    };

    const sessionResponse = await axios.post(NIUBIZ_CONFIG.urlSession + `/${NIUBIZ_CONFIG.merchantId}`, sessionData, {
      headers: {
        'Authorization': accessToken,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Sesión de pago generada:', sessionResponse.data.sessionKey);

    res.status(200).json({
      success: true,
      sessionToken: sessionResponse.data.sessionKey,
      expirationTime: sessionResponse.data.expirationTime,
      merchantId: NIUBIZ_CONFIG.merchantId,
      paymentFormUrl: NIUBIZ_CONFIG.urlPaymentForm
    });

  } catch (error) {
    console.error('❌ Error al generar sesión Niubiz:', error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: 'Error al generar sesión de pago',
      error: process.env.NODE_ENV === 'development' ? (error.response?.data || error.message) : undefined
    });
  }
});

// POST /api/niubiz/authorize - Autorizar pago
router.post('/authorize', async (req, res) => {
  try {
    const { transactionToken, amount, orderId, email } = req.body;

    console.log('💳 Autorizando pago Niubiz:', { amount, orderId });

    if (!transactionToken || !amount || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Token de transacción, monto y orderId son requeridos'
      });
    }

    // Obtener token de acceso
    const credentials = Buffer.from(`${NIUBIZ_CONFIG.username}:${NIUBIZ_CONFIG.password}`).toString('base64');

    const tokenResponse = await axios.get(NIUBIZ_CONFIG.urlSecurity, {
      headers: {
        'Authorization': `Basic ${credentials}`
      }
    });

    const accessToken = tokenResponse.data;

    // Generar purchaseNumber único
    const purchaseNumber = `${Date.now()}`;

    // Datos de autorización
    const authData = {
      channel: 'web',
      captureType: 'manual',
      countable: true,
      order: {
        tokenId: transactionToken,
        purchaseNumber: purchaseNumber,
        amount: parseFloat(amount).toFixed(2),
        currency: 'PEN'
      },
      antifraud: null
    };

    const authResponse = await axios.post(NIUBIZ_CONFIG.urlAuthorization + `/${NIUBIZ_CONFIG.merchantId}`, authData, {
      headers: {
        'Authorization': accessToken,
        'Content-Type': 'application/json'
      }
    });

    const authResult = authResponse.data;

    console.log('✅ Pago autorizado:', authResult);

    // Verificar si fue exitoso
    if (authResult.dataMap && authResult.dataMap.ACTION_CODE === '000') {
      res.status(200).json({
        success: true,
        transactionId: authResult.order.transactionId,
        purchaseNumber: authResult.order.purchaseNumber,
        authorizationCode: authResult.order.authorizationCode,
        actionCode: authResult.dataMap.ACTION_CODE,
        actionDescription: authResult.dataMap.ACTION_DESCRIPTION || 'Transacción aprobada',
        card: {
          brand: authResult.dataMap.BRAND,
          last4: authResult.dataMap.CARD ? authResult.dataMap.CARD.slice(-4) : null
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: authResult.dataMap?.ACTION_DESCRIPTION || 'Pago rechazado',
        actionCode: authResult.dataMap?.ACTION_CODE
      });
    }

  } catch (error) {
    console.error('❌ Error al autorizar pago Niubiz:', error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: 'Error al procesar el pago',
      error: process.env.NODE_ENV === 'development' ? (error.response?.data || error.message) : undefined
    });
  }
});

// GET /api/niubiz/config - Obtener configuración pública
router.get('/config', (req, res) => {
  res.json({
    success: true,
    merchantId: NIUBIZ_CONFIG.merchantId,
    paymentFormUrl: NIUBIZ_CONFIG.urlPaymentForm,
    isConfigured: !!(NIUBIZ_CONFIG.merchantId && NIUBIZ_CONFIG.username && NIUBIZ_CONFIG.password)
  });
});

module.exports = router;
