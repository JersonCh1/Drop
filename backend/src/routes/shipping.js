// backend/src/routes/shipping.js
const express = require('express');
const router = express.Router();

/**
 * 📦 CALCULADORA DE ENVÍO INTERNACIONAL
 * Calcula costos de envío basado en peso, dimensiones y destino
 */

// Tarifas base por región (en USD)
const SHIPPING_RATES = {
  LOCAL: {
    name: 'Local (Perú)',
    baseRate: 5.00,
    perKg: 2.00,
    deliveryDays: '2-4 días'
  },
  SOUTH_AMERICA: {
    name: 'Sudamérica',
    baseRate: 15.00,
    perKg: 5.00,
    deliveryDays: '7-14 días'
  },
  NORTH_AMERICA: {
    name: 'Norteamérica',
    baseRate: 25.00,
    perKg: 8.00,
    deliveryDays: '10-20 días'
  },
  EUROPE: {
    name: 'Europa',
    baseRate: 30.00,
    perKg: 10.00,
    deliveryDays: '15-25 días'
  },
  ASIA: {
    name: 'Asia',
    baseRate: 20.00,
    perKg: 7.00,
    deliveryDays: '12-22 días'
  },
  OCEANIA: {
    name: 'Oceanía',
    baseRate: 35.00,
    perKg: 12.00,
    deliveryDays: '20-30 días'
  },
  REST_OF_WORLD: {
    name: 'Resto del mundo',
    baseRate: 40.00,
    perKg: 15.00,
    deliveryDays: '20-35 días'
  }
};

// Mapeo de países a regiones
const COUNTRY_REGIONS = {
  'PE': 'LOCAL',
  'AR': 'SOUTH_AMERICA', 'BO': 'SOUTH_AMERICA', 'BR': 'SOUTH_AMERICA',
  'CL': 'SOUTH_AMERICA', 'CO': 'SOUTH_AMERICA', 'EC': 'SOUTH_AMERICA',
  'PY': 'SOUTH_AMERICA', 'UY': 'SOUTH_AMERICA', 'VE': 'SOUTH_AMERICA',
  'US': 'NORTH_AMERICA', 'CA': 'NORTH_AMERICA', 'MX': 'NORTH_AMERICA',
  'ES': 'EUROPE', 'FR': 'EUROPE', 'DE': 'EUROPE', 'IT': 'EUROPE',
  'GB': 'EUROPE', 'PT': 'EUROPE', 'NL': 'EUROPE', 'BE': 'EUROPE',
  'CN': 'ASIA', 'JP': 'ASIA', 'KR': 'ASIA', 'IN': 'ASIA', 'TH': 'ASIA',
  'AU': 'OCEANIA', 'NZ': 'OCEANIA'
};

// POST /api/shipping/calculate - Calcular costo de envío
router.post('/calculate', async (req, res) => {
  try {
    const {
      countryCode,        // Código ISO del país (PE, US, ES, etc.)
      weight,             // Peso en kg
      length,             // Largo en cm
      width,              // Ancho en cm
      height,             // Alto en cm
      shippingMethod,     // 'standard' | 'express'
      items               // Array de productos (opcional)
    } = req.body;

    console.log('📦 Calculando envío:', { countryCode, weight, shippingMethod });

    // Validaciones
    if (!countryCode) {
      return res.status(400).json({
        success: false,
        message: 'Código de país requerido'
      });
    }

    // Determinar región
    const region = COUNTRY_REGIONS[countryCode] || 'REST_OF_WORLD';
    const rateInfo = SHIPPING_RATES[region];

    // Calcular peso total (si no se proporciona, estimar por items)
    let totalWeight = weight || 0;
    if (!weight && items && items.length > 0) {
      totalWeight = items.reduce((sum, item) => {
        const itemWeight = item.weight || 0.3; // 300g por defecto (funda iPhone)
        return sum + (itemWeight * item.quantity);
      }, 0);
    }

    // Si aún no hay peso, usar peso mínimo
    if (totalWeight === 0) {
      totalWeight = 0.3; // Mínimo 300g
    }

    // Calcular volumen (dimensional weight)
    let volumetricWeight = 0;
    if (length && width && height) {
      // Peso volumétrico = (L x W x H) / 5000
      volumetricWeight = (length * width * height) / 5000;
    }

    // Usar el mayor entre peso real y volumétrico
    const chargeableWeight = Math.max(totalWeight, volumetricWeight);

    // Calcular costo base
    let shippingCost = rateInfo.baseRate + (chargeableWeight * rateInfo.perKg);

    // Ajustar por método de envío
    let deliveryDays = rateInfo.deliveryDays;
    if (shippingMethod === 'express') {
      shippingCost *= 1.8; // Express es 80% más caro
      deliveryDays = deliveryDays.replace(/\d+-\d+/, (match) => {
        const [min, max] = match.split('-').map(Number);
        return `${Math.ceil(min / 2)}-${Math.ceil(max / 2)}`;
      });
    }

    // Descuento por peso (más de 2kg)
    if (chargeableWeight > 2) {
      const discount = Math.min(0.15, (chargeableWeight - 2) * 0.03); // Hasta 15% de descuento
      shippingCost *= (1 - discount);
    }

    // Redondear a 2 decimales
    shippingCost = Math.round(shippingCost * 100) / 100;

    // Calcular fecha estimada de entrega
    const today = new Date();
    const [minDays, maxDays] = deliveryDays.match(/\d+/g).map(Number);
    const estimatedMinDate = new Date(today);
    estimatedMinDate.setDate(estimatedMinDate.getDate() + minDays);
    const estimatedMaxDate = new Date(today);
    estimatedMaxDate.setDate(estimatedMaxDate.getDate() + maxDays);

    console.log(`✅ Costo calculado: $${shippingCost} USD (${chargeableWeight}kg a ${rateInfo.name})`);

    res.json({
      success: true,
      data: {
        shippingCost: shippingCost,
        currency: 'USD',
        region: rateInfo.name,
        deliveryDays: deliveryDays,
        estimatedDelivery: {
          min: estimatedMinDate.toISOString().split('T')[0],
          max: estimatedMaxDate.toISOString().split('T')[0],
          formatted: `${estimatedMinDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - ${estimatedMaxDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`
        },
        weight: {
          actual: totalWeight,
          volumetric: volumetricWeight,
          chargeable: chargeableWeight
        },
        shippingMethod: shippingMethod || 'standard',
        breakdown: {
          baseRate: rateInfo.baseRate,
          weightCharge: (chargeableWeight * rateInfo.perKg).toFixed(2),
          total: shippingCost
        }
      }
    });

  } catch (error) {
    console.error('❌ Error calculando envío:', error);
    res.status(500).json({
      success: false,
      message: 'Error al calcular costo de envío',
      error: error.message
    });
  }
});

// GET /api/shipping/rates - Obtener todas las tarifas
router.get('/rates', (req, res) => {
  res.json({
    success: true,
    rates: Object.entries(SHIPPING_RATES).map(([key, value]) => ({
      region: key,
      ...value
    })),
    countries: COUNTRY_REGIONS
  });
});

// GET /api/shipping/countries - Listar países soportados
router.get('/countries', (req, res) => {
  const countries = Object.entries(COUNTRY_REGIONS).map(([code, region]) => ({
    code,
    region,
    regionName: SHIPPING_RATES[region].name,
    baseRate: SHIPPING_RATES[region].baseRate,
    deliveryDays: SHIPPING_RATES[region].deliveryDays
  }));

  res.json({
    success: true,
    countries: countries,
    total: countries.length
  });
});

// POST /api/shipping/track - Tracking de envío
router.post('/track', async (req, res) => {
  try {
    const { trackingNumber, carrier } = req.body;

    if (!trackingNumber) {
      return res.status(400).json({
        success: false,
        message: 'Número de tracking requerido'
      });
    }

    // Integración con servicios de tracking (17track, AfterShip, etc.)
    // Por ahora, respuesta simulada
    res.json({
      success: true,
      tracking: {
        trackingNumber,
        carrier: carrier || 'Unknown',
        status: 'IN_TRANSIT',
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        trackingUrl: `https://www.17track.net/en/track?nums=${trackingNumber}`,
        events: [
          {
            date: new Date().toISOString(),
            status: 'Package picked up',
            location: 'Origin facility'
          }
        ]
      }
    });

  } catch (error) {
    console.error('❌ Error rastreando envío:', error);
    res.status(500).json({
      success: false,
      message: 'Error al rastrear envío',
      error: error.message
    });
  }
});

module.exports = router;
