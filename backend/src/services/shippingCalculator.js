// backend/src/services/shippingCalculator.js
const { getCJAccessToken } = require('./cjAuthService');
const axios = require('axios');

const CJ_API_URL = process.env.CJ_API_URL || 'https://developers.cjdropshipping.com/api2.0/v1';

/**
 * Mapeo de códigos de país ISO a códigos de país CJ
 */
const countryCodeMap = {
  'PE': 'PE', // Perú
  'US': 'US', // Estados Unidos
  'MX': 'MX', // México
  'AR': 'AR', // Argentina
  'CL': 'CL', // Chile
  'CO': 'CO', // Colombia
  'BR': 'BR', // Brasil
  'EC': 'EC', // Ecuador
  'BO': 'BO', // Bolivia
  'PY': 'PY', // Paraguay
  'UY': 'UY', // Uruguay
  'VE': 'VE', // Venezuela
  'ES': 'ES', // España
  'GB': 'GB', // Reino Unido
  'FR': 'FR', // Francia
  'DE': 'DE', // Alemania
  'IT': 'IT', // Italia
  'PT': 'PT', // Portugal
  'CA': 'CA', // Canadá
  'AU': 'AU', // Australia
  'NZ': 'NZ', // Nueva Zelanda
  'JP': 'JP', // Japón
  'KR': 'KR', // Corea del Sur
  'CN': 'CN', // China
  'IN': 'IN', // India
  'SG': 'SG', // Singapur
  'TH': 'TH', // Tailandia
  'MY': 'MY', // Malasia
  'PH': 'PH', // Filipinas
  'VN': 'VN', // Vietnam
  'ID': 'ID', // Indonesia
};

/**
 * Calcular costo de envío usando CJ Dropshipping API
 * @param {Object} params
 * @param {Array} params.products - Array de productos [{vid: string, quantity: number, weight: number}]
 * @param {string} params.countryCode - Código de país de destino (ISO 3166-1 alpha-2)
 * @returns {Promise<Object>} - {success, shippingOptions: [{method, cost, days, carrier}], cheapest, fastest}
 */
async function calculateShippingCost({ products, countryCode }) {
  try {
    console.log('🚚 Calculando costos de envío para:', { products, countryCode });

    // Validar país soportado
    const cjCountryCode = countryCodeMap[countryCode];
    if (!cjCountryCode) {
      console.warn(`⚠️ País ${countryCode} no soportado, usando tarifa fija`);
      return getFallbackShippingRates(countryCode);
    }

    // Obtener token de acceso CJ
    const accessToken = await getCJAccessToken();

    // Preparar request para CJ API
    const requestBody = {
      startCountryCode: 'CN', // Los productos vienen de China
      endCountryCode: cjCountryCode,
      products: products.map(p => ({
        vid: p.vid || p.variantId || p.productId, // ID de variante en CJ
        quantity: p.quantity || 1
      }))
    };

    console.log('📤 Request a CJ Dropshipping:', JSON.stringify(requestBody, null, 2));

    // Llamar a API de CJ
    const response = await axios.post(
      `${CJ_API_URL}/logistic/freightCalculate`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'CJ-Access-Token': accessToken
        },
        timeout: 10000 // 10 segundos timeout
      }
    );

    console.log('📥 Respuesta de CJ Dropshipping:', JSON.stringify(response.data, null, 2));

    // Procesar respuesta
    if (response.data && response.data.code === 200 && response.data.data) {
      const shippingMethods = response.data.data;

      // Parsear opciones de envío
      const shippingOptions = shippingMethods.map(method => ({
        method: method.logisticName || 'Standard Shipping',
        cost: parseFloat(method.logisticPrice) || 0,
        days: method.logisticAging || '15-30',
        carrier: method.logisticName || 'CJ Dropshipping',
        code: method.logisticCode || 'CJ_STANDARD'
      }));

      // Encontrar la opción más barata y más rápida
      const cheapest = shippingOptions.reduce((min, option) =>
        option.cost < min.cost ? option : min, shippingOptions[0]
      );

      const fastest = shippingOptions.reduce((min, option) => {
        const days = parseInt(option.days.split('-')[0]);
        const minDays = parseInt(min.days.split('-')[0]);
        return days < minDays ? option : min;
      }, shippingOptions[0]);

      console.log(`✅ Envío calculado: ${shippingOptions.length} opciones disponibles`);
      console.log(`   💰 Más barato: $${cheapest.cost} (${cheapest.method})`);
      console.log(`   ⚡ Más rápido: ${fastest.days} días (${fastest.method})`);

      return {
        success: true,
        shippingOptions,
        cheapest,
        fastest,
        currency: 'USD'
      };
    } else {
      console.warn('⚠️ Respuesta inválida de CJ, usando tarifas fijas');
      return getFallbackShippingRates(countryCode);
    }

  } catch (error) {
    console.error('❌ Error calculando envío con CJ:', error.message);

    // Si CJ falla, usar tarifas fijas de respaldo
    console.log('📦 Usando tarifas de envío de respaldo');
    return getFallbackShippingRates(countryCode);
  }
}

/**
 * Tarifas de envío de respaldo si CJ API falla
 * @param {string} countryCode - Código de país ISO
 * @returns {Object} - Opciones de envío con tarifas fijas
 */
function getFallbackShippingRates(countryCode) {
  // Tarifas base por región
  const rates = {
    // Perú y países andinos
    'PE': { standard: 8.99, express: 14.99, days: '12-20' },
    'CL': { standard: 9.99, express: 15.99, days: '12-22' },
    'CO': { standard: 9.99, express: 15.99, days: '12-22' },
    'EC': { standard: 9.99, express: 15.99, days: '12-22' },
    'BO': { standard: 10.99, express: 16.99, days: '15-25' },

    // América del Sur
    'AR': { standard: 11.99, express: 17.99, days: '15-25' },
    'BR': { standard: 12.99, express: 18.99, days: '15-28' },
    'UY': { standard: 11.99, express: 17.99, days: '15-25' },
    'PY': { standard: 11.99, express: 17.99, days: '15-25' },
    'VE': { standard: 12.99, express: 19.99, days: '15-30' },

    // América del Norte
    'US': { standard: 7.99, express: 12.99, days: '10-18' },
    'CA': { standard: 9.99, express: 14.99, days: '12-20' },
    'MX': { standard: 8.99, express: 13.99, days: '12-20' },

    // Europa
    'ES': { standard: 10.99, express: 16.99, days: '12-22' },
    'FR': { standard: 10.99, express: 16.99, days: '12-22' },
    'DE': { standard: 10.99, express: 16.99, days: '12-22' },
    'IT': { standard: 10.99, express: 16.99, days: '12-22' },
    'GB': { standard: 10.99, express: 16.99, days: '12-22' },
    'PT': { standard: 10.99, express: 16.99, days: '12-22' },

    // Asia-Pacífico
    'AU': { standard: 11.99, express: 17.99, days: '15-25' },
    'NZ': { standard: 12.99, express: 18.99, days: '15-28' },
    'JP': { standard: 9.99, express: 14.99, days: '10-18' },
    'KR': { standard: 9.99, express: 14.99, days: '10-18' },
    'SG': { standard: 8.99, express: 13.99, days: '10-18' },
    'TH': { standard: 9.99, express: 14.99, days: '12-20' },
    'MY': { standard: 9.99, express: 14.99, days: '12-20' },
    'PH': { standard: 9.99, express: 14.99, days: '12-20' },
    'VN': { standard: 9.99, express: 14.99, days: '12-20' },
    'ID': { standard: 10.99, express: 15.99, days: '12-22' },
    'IN': { standard: 10.99, express: 15.99, days: '12-22' },
  };

  const rate = rates[countryCode] || { standard: 12.99, express: 19.99, days: '15-30' };

  const shippingOptions = [
    {
      method: 'Standard Shipping',
      cost: rate.standard,
      days: rate.days,
      carrier: 'International Post',
      code: 'STANDARD'
    },
    {
      method: 'Express Shipping',
      cost: rate.express,
      days: rate.days.split('-')[0] + '-' + (parseInt(rate.days.split('-')[0]) + 5),
      carrier: 'DHL/FedEx',
      code: 'EXPRESS'
    }
  ];

  return {
    success: true,
    shippingOptions,
    cheapest: shippingOptions[0],
    fastest: shippingOptions[1],
    currency: 'USD',
    fallback: true
  };
}

module.exports = {
  calculateShippingCost,
  getFallbackShippingRates
};
