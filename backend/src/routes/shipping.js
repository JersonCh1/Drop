// backend/src/routes/shipping.js
const express = require('express');
const router = express.Router();
const { calculateShippingCost, getFallbackShippingRates } = require('../services/shippingCalculator');

/**
 * 📦 CALCULADORA DE ENVÍO INTERNACIONAL
 * Calcula costos de envío usando CJ Dropshipping API + tarifas de respaldo
 */

// Tarifas base por región (en USD) - SOLO PARA RESPALDO
const SHIPPING_RATES = {
  LOCAL: {
    name: 'Local (Perú)',
    baseRate: 0.00, // 🚚 ENVÍO GRATIS PARA PERÚ
    perKg: 0.00,
    deliveryDays: '15-30 días'
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

// POST /api/shipping/calculate - Calcular costo de envío con CJ Dropshipping
router.post('/calculate', async (req, res) => {
  try {
    const {
      countryCode,        // Código ISO del país (PE, US, ES, etc.)
      items,              // Array de productos [{productId, variantId, quantity, weight}]
      useCJ = true        // Usar CJ Dropshipping API (true) o tarifas fijas (false)
    } = req.body;

    console.log('📦 Calculando envío:', { countryCode, itemsCount: items?.length, useCJ });

    // Validaciones
    if (!countryCode) {
      return res.status(400).json({
        success: false,
        message: 'Código de país requerido'
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Productos requeridos para calcular envío'
      });
    }

    let shippingData;

    // Intentar con CJ Dropshipping primero
    if (useCJ) {
      try {
        console.log('🚢 Intentando calcular con CJ Dropshipping API...');

        // Preparar productos para CJ (necesitan vid - variant ID de CJ)
        const cjProducts = items.map(item => ({
          vid: item.variantId || item.productId,
          productId: item.productId,
          quantity: item.quantity || 1,
          weight: item.weight || 0.3 // 300g por defecto para carcasas
        }));

        shippingData = await calculateShippingCost({
          products: cjProducts,
          countryCode: countryCode
        });

        // Si CJ devolvió datos exitosamente
        if (shippingData.success && shippingData.shippingOptions) {
          console.log(`✅ CJ Dropshipping: ${shippingData.shippingOptions.length} opciones disponibles`);

          // Retornar con opciones de CJ
          return res.json({
            success: true,
            source: shippingData.fallback ? 'fallback' : 'cj_dropshipping',
            data: {
              shippingCost: shippingData.cheapest.cost,
              currency: shippingData.currency,
              deliveryDays: shippingData.cheapest.days,
              shippingMethod: shippingData.cheapest.method,
              carrier: shippingData.cheapest.carrier,
              // Opciones adicionales
              options: shippingData.shippingOptions,
              cheapest: shippingData.cheapest,
              fastest: shippingData.fastest
            }
          });
        }
      } catch (cjError) {
        console.warn('⚠️ CJ Dropshipping falló, usando tarifas de respaldo:', cjError.message);
      }
    }

    // Si CJ falla o useCJ=false, usar tarifas fijas
    console.log('📦 Usando tarifas de envío de respaldo...');
    const fallbackRates = getFallbackShippingRates(countryCode);

    return res.json({
      success: true,
      source: 'fallback',
      data: {
        shippingCost: fallbackRates.cheapest.cost,
        currency: fallbackRates.currency,
        deliveryDays: fallbackRates.cheapest.days,
        shippingMethod: fallbackRates.cheapest.method,
        carrier: fallbackRates.cheapest.carrier,
        options: fallbackRates.shippingOptions,
        cheapest: fallbackRates.cheapest,
        fastest: fallbackRates.fastest
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
