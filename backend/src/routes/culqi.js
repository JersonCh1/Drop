const express = require('express');
const router = express.Router();
const Culqi = require('culqi-node');

// POST /api/culqi/create-charge - Crear cargo en Culqi
router.post('/create-charge', async (req, res) => {
  try {
    const { token, amount, email, orderId } = req.body;

    console.log('💳 Creando cargo Culqi:', { amount, email, orderId });

    // Validar que Culqi esté configurado
    if (!process.env.CULQI_SECRET_KEY) {
      return res.status(400).json({
        success: false,
        message: 'Culqi no está configurado en el servidor'
      });
    }

    // Validar datos requeridos
    if (!token || !amount || !email) {
      return res.status(400).json({
        success: false,
        message: 'Token, monto y email son requeridos'
      });
    }

    // Inicializar Culqi
    const culqi = new Culqi(process.env.CULQI_SECRET_KEY);

    // Crear cargo
    const charge = await culqi.charges.createCharge({
      amount: Math.round(amount * 100), // Culqi usa centavos
      currency_code: 'PEN', // Soles peruanos
      email: email,
      source_id: token,
      description: `Orden ${orderId || 'Nueva orden'}`,
      metadata: {
        order_id: orderId || 'pending',
        platform: 'dropshipping-iphone'
      }
    });

    console.log('✅ Cargo Culqi creado:', charge.id);

    res.status(200).json({
      success: true,
      chargeId: charge.id,
      amount: charge.amount / 100,
      currency: charge.currency_code,
      status: charge.outcome.type,
      message: charge.outcome.user_message || 'Pago procesado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error al crear cargo Culqi:', error);

    // Manejar errores específicos de Culqi
    if (error.culqi_error) {
      return res.status(400).json({
        success: false,
        message: error.user_message || 'Error al procesar el pago',
        errorCode: error.merchant_message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al procesar el pago. Por favor intenta nuevamente.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/culqi/create-token - Crear token (opcional, se puede hacer desde el frontend)
router.post('/create-token', async (req, res) => {
  try {
    const { cardNumber, cvv, expirationMonth, expirationYear, email } = req.body;

    console.log('🔑 Creando token Culqi');

    if (!process.env.CULQI_SECRET_KEY) {
      return res.status(400).json({
        success: false,
        message: 'Culqi no está configurado'
      });
    }

    const culqi = new Culqi(process.env.CULQI_SECRET_KEY);

    const token = await culqi.tokens.createToken({
      card_number: cardNumber,
      cvv: cvv,
      expiration_month: expirationMonth,
      expiration_year: expirationYear,
      email: email
    });

    console.log('✅ Token Culqi creado:', token.id);

    res.status(200).json({
      success: true,
      token: token.id
    });

  } catch (error) {
    console.error('❌ Error al crear token Culqi:', error);

    res.status(500).json({
      success: false,
      message: 'Error al procesar la información de la tarjeta',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/culqi/charge/:chargeId - Verificar estado de un cargo
router.get('/charge/:chargeId', async (req, res) => {
  try {
    const { chargeId } = req.params;

    if (!process.env.CULQI_SECRET_KEY) {
      return res.status(400).json({
        success: false,
        message: 'Culqi no está configurado'
      });
    }

    const culqi = new Culqi(process.env.CULQI_SECRET_KEY);
    const charge = await culqi.charges.getCharge(chargeId);

    res.status(200).json({
      success: true,
      charge: {
        id: charge.id,
        amount: charge.amount / 100,
        currency: charge.currency_code,
        status: charge.outcome.type,
        createdAt: charge.creation_date
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener cargo Culqi:', error);

    res.status(500).json({
      success: false,
      message: 'Error al verificar el pago',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
