const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');

// Configuración de SafetyPay
const SAFETYPAY_CONFIG = {
  apiKey: process.env.SAFETYPAY_API_KEY,
  signatureKey: process.env.SAFETYPAY_SIGNATURE_KEY,
  apiUrl: process.env.SAFETYPAY_API_URL || 'https://sandbox.safetypay.com/express2',
  isProduction: process.env.NODE_ENV === 'production'
};

// Generar firma
function generateSignature(data, key) {
  return crypto.createHmac('sha256', key).update(data).digest('hex');
}

// POST /api/safetypay/create-transaction - Crear transacción
router.post('/create-transaction', async (req, res) => {
  try {
    const { orderId, amount, email, firstName, lastName } = req.body;

    console.log('🏦 Creando transacción SafetyPay:', { orderId, amount, email });

    if (!orderId || !amount || !email) {
      return res.status(400).json({
        success: false,
        message: 'orderId, amount y email son requeridos'
      });
    }

    if (!SAFETYPAY_CONFIG.apiKey || !SAFETYPAY_CONFIG.signatureKey) {
      return res.status(400).json({
        success: false,
        message: 'SafetyPay no está configurado en el servidor'
      });
    }

    // Datos de la transacción
    const transactionData = {
      ApiKey: SAFETYPAY_CONFIG.apiKey,
      RequestDateTime: new Date().toISOString(),
      MerchantSalesID: orderId,
      Language: 'ES',
      TrackingCode: orderId,
      Amount: parseFloat(amount).toFixed(2),
      CurrencyID: '604', // 604 = PEN
      PaymentCountryCode: 'PE',
      TransactionOkURL: `${process.env.FRONTEND_URL}/payment/success`,
      TransactionErrorURL: `${process.env.FRONTEND_URL}/payment/error`,
      TransactionExpirationDateTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 horas
      ProductID: '1', // 1 = Online Banking
      CustomMerchantValue: JSON.stringify({
        email,
        firstName,
        lastName
      })
    };

    // Generar firma
    const signatureString = `${transactionData.ApiKey}${transactionData.RequestDateTime}${transactionData.MerchantSalesID}${transactionData.Amount}${transactionData.CurrencyID}`;
    const signature = generateSignature(signatureString, SAFETYPAY_CONFIG.signatureKey);

    transactionData.Signature = signature;

    // Hacer request a SafetyPay
    const response = await axios.post(
      `${SAFETYPAY_CONFIG.apiUrl}/NewOperation2`,
      transactionData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const result = response.data;

    console.log('✅ Transacción SafetyPay creada:', result.TransactionIdentifier);

    res.status(200).json({
      success: true,
      transactionId: result.TransactionIdentifier,
      redirectUrl: result.ClientRedirectURL,
      expirationDate: result.ExpirationDateTime,
      instructions: {
        title: 'Cómo pagar con SafetyPay',
        steps: [
          '1. Serás redirigido a tu banco',
          '2. Inicia sesión en tu banca online',
          '3. Confirma la transferencia',
          '4. Recibirás confirmación inmediata',
          '5. Tu compra será procesada automáticamente'
        ],
        supportedBanks: 'BCP, Interbank, BBVA, Scotiabank y más'
      }
    });

  } catch (error) {
    console.error('❌ Error al crear transacción SafetyPay:', error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: 'Error al crear transacción',
      error: process.env.NODE_ENV === 'development' ? (error.response?.data || error.message) : undefined
    });
  }
});

// POST /api/safetypay/verify - Verificar estado de transacción
router.post('/verify', async (req, res) => {
  try {
    const { transactionId, orderId } = req.body;

    console.log('🔍 Verificando transacción SafetyPay:', { transactionId, orderId });

    if (!transactionId && !orderId) {
      return res.status(400).json({
        success: false,
        message: 'transactionId u orderId requerido'
      });
    }

    if (!SAFETYPAY_CONFIG.apiKey || !SAFETYPAY_CONFIG.signatureKey) {
      return res.status(400).json({
        success: false,
        message: 'SafetyPay no está configurado'
      });
    }

    // Datos de consulta
    const queryData = {
      ApiKey: SAFETYPAY_CONFIG.apiKey,
      RequestDateTime: new Date().toISOString(),
      MerchantSalesID: orderId,
      TransactionIdentifier: transactionId
    };

    // Generar firma
    const signatureString = `${queryData.ApiKey}${queryData.RequestDateTime}${queryData.MerchantSalesID || ''}${queryData.TransactionIdentifier || ''}`;
    const signature = generateSignature(signatureString, SAFETYPAY_CONFIG.signatureKey);

    queryData.Signature = signature;

    // Consultar estado
    const response = await axios.post(
      `${SAFETYPAY_CONFIG.apiUrl}/OperationActivity`,
      queryData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const result = response.data;

    console.log('✅ Estado de transacción:', result.OperationStatus);

    res.status(200).json({
      success: true,
      status: result.OperationStatus, // PENDING, PAID, CANCELLED
      transactionId: result.TransactionIdentifier,
      orderId: result.MerchantSalesID,
      amount: result.Amount,
      paymentDate: result.ConfirmationDateTime,
      isPaid: result.OperationStatus === 102 // 102 = PAID
    });

  } catch (error) {
    console.error('❌ Error al verificar transacción:', error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: 'Error al verificar transacción',
      error: process.env.NODE_ENV === 'development' ? (error.response?.data || error.message) : undefined
    });
  }
});

// POST /api/safetypay/webhook - Webhook para notificaciones
router.post('/webhook', async (req, res) => {
  try {
    const notification = req.body;

    console.log('📬 Webhook SafetyPay recibido:', notification);

    // Validar firma
    const receivedSignature = notification.Signature;
    const signatureString = `${notification.ApiKey}${notification.RequestDateTime}${notification.MerchantSalesID}${notification.ReferenceNo}`;
    const calculatedSignature = generateSignature(signatureString, SAFETYPAY_CONFIG.signatureKey);

    if (receivedSignature !== calculatedSignature) {
      console.warn('⚠️  Firma del webhook inválida');
      return res.status(403).json({
        success: false,
        message: 'Firma inválida'
      });
    }

    // Procesar notificación
    const { MerchantSalesID, OperationStatus, Amount, TransactionIdentifier } = notification;

    if (OperationStatus === 102) { // 102 = PAID
      console.log(`✅ Pago confirmado para orden ${MerchantSalesID}`);
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

// GET /api/safetypay/config - Obtener configuración pública
router.get('/config', (req, res) => {
  res.json({
    success: true,
    isConfigured: !!(SAFETYPAY_CONFIG.apiKey && SAFETYPAY_CONFIG.signatureKey),
    isProduction: SAFETYPAY_CONFIG.isProduction
  });
});

module.exports = router;
