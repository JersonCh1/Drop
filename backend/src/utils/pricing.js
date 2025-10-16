// backend/src/utils/pricing.js

/**
 * Calcula el precio de venta basándose en el precio del proveedor y el margen de ganancia
 * @param {number} supplierPrice - Precio del proveedor
 * @param {number} profitMargin - Margen de ganancia en porcentaje (ej: 30 para 30%)
 * @returns {number} Precio de venta calculado
 */
function calculateSalePrice(supplierPrice, profitMargin = 30) {
  if (!supplierPrice || supplierPrice <= 0) {
    throw new Error('Precio del proveedor inválido');
  }

  if (profitMargin < 0) {
    throw new Error('El margen de ganancia no puede ser negativo');
  }

  // Fórmula: Precio de venta = Precio proveedor * (1 + margen/100)
  const salePrice = supplierPrice * (1 + profitMargin / 100);

  // Redondear a 2 decimales
  return Math.round(salePrice * 100) / 100;
}

/**
 * Calcula el margen de ganancia basándose en el precio del proveedor y el precio de venta
 * @param {number} supplierPrice - Precio del proveedor
 * @param {number} salePrice - Precio de venta
 * @returns {number} Margen de ganancia en porcentaje
 */
function calculateProfitMargin(supplierPrice, salePrice) {
  if (!supplierPrice || supplierPrice <= 0) {
    throw new Error('Precio del proveedor inválido');
  }

  if (!salePrice || salePrice <= 0) {
    throw new Error('Precio de venta inválido');
  }

  if (salePrice < supplierPrice) {
    throw new Error('El precio de venta no puede ser menor que el precio del proveedor');
  }

  // Fórmula: Margen = ((Precio venta - Precio proveedor) / Precio proveedor) * 100
  const margin = ((salePrice - supplierPrice) / supplierPrice) * 100;

  // Redondear a 2 decimales
  return Math.round(margin * 100) / 100;
}

/**
 * Calcula la ganancia neta
 * @param {number} supplierPrice - Precio del proveedor
 * @param {number} salePrice - Precio de venta
 * @param {number} shippingCost - Costo de envío (opcional)
 * @returns {number} Ganancia neta
 */
function calculateProfit(supplierPrice, salePrice, shippingCost = 0) {
  if (!supplierPrice || supplierPrice <= 0) {
    throw new Error('Precio del proveedor inválido');
  }

  if (!salePrice || salePrice <= 0) {
    throw new Error('Precio de venta inválido');
  }

  const profit = salePrice - supplierPrice - shippingCost;

  // Redondear a 2 decimales
  return Math.round(profit * 100) / 100;
}

/**
 * Calcula el ROI (Return on Investment)
 * @param {number} supplierPrice - Precio del proveedor
 * @param {number} salePrice - Precio de venta
 * @param {number} shippingCost - Costo de envío (opcional)
 * @returns {number} ROI en porcentaje
 */
function calculateROI(supplierPrice, salePrice, shippingCost = 0) {
  const totalCost = supplierPrice + shippingCost;
  const profit = salePrice - totalCost;

  if (totalCost <= 0) {
    throw new Error('El costo total debe ser mayor que cero');
  }

  // Fórmula: ROI = (Ganancia / Costo total) * 100
  const roi = (profit / totalCost) * 100;

  // Redondear a 2 decimales
  return Math.round(roi * 100) / 100;
}

/**
 * Sugiere un precio de venta óptimo basándose en el precio del proveedor
 * @param {number} supplierPrice - Precio del proveedor
 * @param {object} options - Opciones de cálculo
 * @returns {object} Precios sugeridos
 */
function suggestPrices(supplierPrice, options = {}) {
  const {
    minMargin = 20,        // Margen mínimo aceptable
    targetMargin = 40,     // Margen objetivo
    maxMargin = 100,       // Margen máximo
    competitivePrice = null // Precio de la competencia
  } = options;

  const suggestions = {
    conservative: calculateSalePrice(supplierPrice, minMargin),
    recommended: calculateSalePrice(supplierPrice, targetMargin),
    aggressive: calculateSalePrice(supplierPrice, maxMargin),
    supplierPrice
  };

  // Si hay precio de competencia, ajustar recomendación
  if (competitivePrice) {
    const competitiveMargin = calculateProfitMargin(supplierPrice, competitivePrice);
    suggestions.competitive = competitivePrice;
    suggestions.competitiveMargin = competitiveMargin;

    // Si el precio competitivo está dentro de rangos aceptables, usarlo como recomendado
    if (competitiveMargin >= minMargin && competitiveMargin <= maxMargin) {
      suggestions.recommended = competitivePrice;
    }
  }

  return suggestions;
}

/**
 * Redondea un precio a un valor "psicológico" (ej: 19.99 en lugar de 20.15)
 * @param {number} price - Precio a redondear
 * @param {string} strategy - Estrategia de redondeo ('charm', 'round', 'prestige')
 * @returns {number} Precio redondeado
 */
function applyPricingStrategy(price, strategy = 'charm') {
  if (price <= 0) {
    throw new Error('El precio debe ser mayor que cero');
  }

  switch (strategy) {
    case 'charm':
      // Precio encantador: termina en .99 o .95
      return Math.ceil(price) - 0.01;

    case 'round':
      // Redondear al número entero más cercano
      return Math.round(price);

    case 'prestige':
      // Precio de prestigio: números redondos o terminados en 0 o 5
      const rounded = Math.ceil(price);
      return rounded % 10 === 0 ? rounded : Math.ceil(rounded / 5) * 5;

    default:
      return Math.round(price * 100) / 100;
  }
}

/**
 * Calcula precios para múltiples variantes con descuentos por volumen
 * @param {Array} variants - Array de variantes con supplierPrice
 * @param {number} baseMargin - Margen base
 * @param {object} volumeDiscounts - Descuentos por volumen
 * @returns {Array} Variantes con precios calculados
 */
function calculateBulkPricing(variants, baseMargin = 30, volumeDiscounts = {}) {
  return variants.map((variant, index) => {
    let margin = baseMargin;

    // Aplicar descuentos por volumen
    Object.keys(volumeDiscounts).forEach(quantity => {
      if (index + 1 >= parseInt(quantity)) {
        margin = baseMargin - volumeDiscounts[quantity];
      }
    });

    const salePrice = calculateSalePrice(variant.supplierPrice, margin);

    return {
      ...variant,
      salePrice,
      profitMargin: margin,
      profit: calculateProfit(variant.supplierPrice, salePrice)
    };
  });
}

module.exports = {
  calculateSalePrice,
  calculateProfitMargin,
  calculateProfit,
  calculateROI,
  suggestPrices,
  applyPricingStrategy,
  calculateBulkPricing
};
