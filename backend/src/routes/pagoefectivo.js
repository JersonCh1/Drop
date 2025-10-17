const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');

// Configuración de PagoEfectivo
const PAGOEFECTIVO_CONFIG = {
  serviceCode: process.env.PAGOEFECTIVO_SERVICE_CODE,
  secretKey: process.env.PAGOEFECTIVO_SECRET_KEY,
  apiUrl: process.env.PAGOEFECTIVO_API_URL || 'https://pre1a.services.pagoefectivo.pe/v1',
  isProduction: process.env.NODE_ENV === 'production'
};

// Generar firma SHA256
function generateSignature(data, secretKey) {
  const dataString = Object.keys(data).sort().map(key => data[key]).join('');
  return crypto.createHmac('sha256', secretKey).update(dataString).digest('hex');
}

// POST /api/pagoefectivo/create-cip - Generar código CIP
router.post('/create-cip', async (req, res) => {
  try {
    const { orderId, amount, email, firstName, lastName } = req.body;

    console.log('💵 Generando CIP PagoEfectivo:', { orderId, amount, email });

    if (!orderId || !amount || !email) {
      return res.status(400).json({
        success: false,
        message: 'orderId, amount y email son requeridos'
      });
    }

    if (!PAGOEFECTIVO_CONFIG.serviceCode || !PAGOEFECTIVO_CONFIG.secretKey) {
      return res.status(400).json({
        success: false,
        message: 'PagoEfectivo no está configurado en el servidor'
      });
    }

    // Calcular fecha de expiración (48 horas)
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 48);
    const dateExpiry = expirationDate.toISOString().slice(0, 10); // YYYY-MM-DD

    // Datos del CIP
    const cipData = {
      currency: '1', // 1 = PEN (soles)
      amount: parseFloat(amount).toFixed(2),
      transactionCode: orderId,
      dateExpiry: dateExpiry,
      userEmail: email,
      userCodeCountry: '51',
      userName: `${firstName || ''} ${lastName || ''}`.trim() || 'Cliente',
      additionalData: `Orden ${orderId}`,
      paymentConcept: 'Compra en tienda online'
    };

    // Generar firma
    const signatureData = {
      currency: cipData.currency,
      amount: cipData.amount,
      transactionCode: cipData.transactionCode,
      dateExpiry: cipData.dateExpiry,
      serviceCode: PAGOEFECTIVO_CONFIG.serviceCode
    };

    const signature = generateSignature(signatureData, PAGOEFECTIVO_CONFIG.secretKey);

    // Hacer request a PagoEfectivo
    const requestData = {
      ...cipData,
      serviceCode: PAGOEFECTIVO_CONFIG.serviceCode,
      signature: signature
    };

    const response = await axios.post(
      `${PAGOEFECTIVO_CONFIG.apiUrl}/cips`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const result = response.data;

    console.log('✅ CIP generado:', result.cip);

    res.status(200).json({
      success: true,
      cip: result.cip, // Código de 8 dígitos
      cipUrl: result.cipUrl, // URL con el voucher
      transactionCode: result.transactionCode,
      expiryDate: dateExpiry,
      amount: amount,
      currency: 'PEN',
      instructions: {
        title: 'Cómo pagar con PagoEfectivo',
        steps: [
          '1. Guarda tu código CIP: ' + result.cip,
          '2. Ve a cualquier agente autorizado (BCP, Interbank, Western Union, etc.)',
          '3. Indica que pagarás con PagoEfectivo',
          '4. Da tu código CIP',
          '5. Paga en efectivo',
          '6. Tu compra será confirmada automáticamente'
        ],
        paymentLocations: 'Bancos, agentes, bodegas, farmacias (más de 100,000 puntos)'
      }
    });

  } catch (error) {
    console.error('❌ Error al generar CIP:', error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: 'Error al generar código de pago',
      error: process.env.NODE_ENV === 'development' ? (error.response?.data || error.message) : undefined
    });
  }
});

// POST /api/pagoefectivo/verify - Verificar estado del pago
router.post('/verify', async (req, res) => {
  try {
    const { cip, transactionCode } = req.body;

    console.log('🔍 Verificando pago PagoEfectivo:', { cip, transactionCode });

    if (!cip && !transactionCode) {
      return res.status(400).json({
        success: false,
        message: 'CIP o transactionCode requerido'
      });
    }

    if (!PAGOEFECTIVO_CONFIG.serviceCode || !PAGOEFECTIVO_CONFIG.secretKey) {
      return res.status(400).json({
        success: false,
        message: 'PagoEfectivo no está configurado'
      });
    }

    // Generar firma para consulta
    const signatureData = {
      serviceCode: PAGOEFECTIVO_CONFIG.serviceCode,
      transactionCode: transactionCode || cip
    };

    const signature = generateSignature(signatureData, PAGOEFECTIVO_CONFIG.secretKey);

    // Consultar estado
    const response = await axios.get(
      `${PAGOEFECTIVO_CONFIG.apiUrl}/cips/${cip || transactionCode}`,
      {
        params: {
          serviceCode: PAGOEFECTIVO_CONFIG.serviceCode,
          signature: signature
        }
      }
    );

    const result = response.data;

    console.log('✅ Estado del pago:', result.status);

    res.status(200).json({
      success: true,
      status: result.status, // 'PENDING', 'PAID', 'EXPIRED'
      cip: result.cip,
      transactionCode: result.transactionCode,
      amount: result.amount,
      paymentDate: result.paymentDate,
      isPaid: result.status === 'PAID'
    });

  } catch (error) {
    console.error('❌ Error al verificar pago:', error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: 'Error al verificar estado del pago',
      error: process.env.NODE_ENV === 'development' ? (error.response?.data || error.message) : undefined
    });
  }
});

// POST /api/pagoefectivo/webhook - Webhook para notificaciones de pago
router.post('/webhook', async (req, res) => {
  try {
    const notification = req.body;

    console.log('📬 Webhook PagoEfectivo recibido:', notification);

    // Validar firma del webhook
    const receivedSignature = req.headers['x-signature'];
    const calculatedSignature = generateSignature(notification, PAGOEFECTIVO_CONFIG.secretKey);

    if (receivedSignature !== calculatedSignature) {
      console.warn('⚠️  Firma del webhook inválida');
      return res.status(403).json({
        success: false,
        message: 'Firma inválida'
      });
    }

    // Procesar notificación
    // Aquí actualizarías el estado de la orden en tu base de datos
    const { transactionCode, status, amount, cip } = notification;

    if (status === 'PAID') {
      console.log(`✅ Pago confirmado para orden ${transactionCode}`);
      // TODO: Actualizar estado de la orden en la base de datos
    }

    res.status(200).json({
      success: true,
      message: 'Webhook procesado'
    });

  } catch (error) {
    console.error('❌ Error procesando webhook:', error.message);

    res.status(500).json({
      success: false,
      message: 'Error al procesar webhook'
    });
  }
});

// GET /api/pagoefectivo/config - Obtener configuración pública
router.get('/config', (req, res) => {
  res.json({
    success: true,
    isConfigured: !!(PAGOEFECTIVO_CONFIG.serviceCode && PAGOEFECTIVO_CONFIG.secretKey),
    serviceCode: PAGOEFECTIVO_CONFIG.serviceCode,
    isProduction: PAGOEFECTIVO_CONFIG.isProduction
  });
});

module.exports = router;
