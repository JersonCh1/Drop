// backend/src/services/productImporter.js
const { calculateSalePrice } = require('../utils/pricing');
const scraperAdvanced = require('./productScraperAdvanced');

/**
 * Parsea URL de producto de diferentes plataformas usando el scraper avanzado
 * @param {string} url - URL del producto
 * @returns {object} Información del producto extraída
 */
async function parseProductUrl(url) {
  try {
    // Usar el scraper avanzado que hace scraping REAL
    return await scraperAdvanced.parseProductUrl(url);
  } catch (error) {
    console.error('Error parseando URL:', error);
    throw new Error(`Error al parsear URL: ${error.message}`);
  }
}

/**
 * Parsea producto de AliExpress
 * NOTA: Esta es una versión simplificada. En producción, usar API oficial o scraper robusto.
 */
async function parseAliExpressProduct(url) {
  // Extraer ID del producto de la URL
  const match = url.match(/item\/(\d+)\.html/);
  const productId = match ? match[1] : null;

  // En producción, aquí haríamos scraping real o llamada a API
  // Por ahora, retornar estructura con datos de ejemplo

  return {
    externalId: productId,
    name: 'Producto Importado de AliExpress',
    description: 'Descripción del producto importada automáticamente',
    supplierPrice: 0, // Se debe obtener del scraping
    images: [],
    variants: [],
    specifications: {},
    shippingTime: '15-30 días hábiles',
    supplierUrl: url,
    platform: 'AliExpress',
    needsManualReview: true, // Marcar para revisión manual
    rawData: {} // Datos crudos del scraping
  };
}

/**
 * Parsea producto de CJ Dropshipping
 */
async function parseCJProduct(url) {
  const match = url.match(/product\/([^\/]+)/);
  const productId = match ? match[1] : null;

  return {
    externalId: productId,
    name: 'Producto Importado de CJ Dropshipping',
    description: 'Descripción del producto',
    supplierPrice: 0,
    images: [],
    variants: [],
    specifications: {},
    shippingTime: '10-20 días hábiles',
    supplierUrl: url,
    platform: 'CJ Dropshipping',
    needsManualReview: true,
    rawData: {}
  };
}

/**
 * Parsea producto de Amazon
 */
async function parseAmazonProduct(url) {
  const match = url.match(/\/dp\/([A-Z0-9]+)/);
  const productId = match ? match[1] : null;

  return {
    externalId: productId,
    name: 'Producto Importado de Amazon',
    description: 'Descripción del producto',
    supplierPrice: 0,
    images: [],
    variants: [],
    specifications: {},
    shippingTime: '7-15 días hábiles',
    supplierUrl: url,
    platform: 'Amazon',
    needsManualReview: true,
    rawData: {}
  };
}

/**
 * Parsea producto genérico
 */
async function parseGenericProduct(url) {
  return {
    externalId: null,
    name: 'Producto Importado',
    description: 'Producto importado desde URL externa',
    supplierPrice: 0,
    images: [],
    variants: [],
    specifications: {},
    shippingTime: '15-30 días hábiles',
    supplierUrl: url,
    platform: 'Generic',
    needsManualReview: true,
    rawData: {}
  };
}

/**
 * Crea un producto en la base de datos desde datos importados
 * @param {object} productData - Datos del producto importado
 * @param {object} options - Opciones adicionales
 * @returns {object} Producto creado
 */
async function createProductFromImport(productData, options = {}) {
  const {
    categoryId,
    supplierId,
    profitMargin = 30,
    autoCalculatePrice = true
  } = options;

  // Calcular precio de venta si se especificó
  let basePrice = productData.supplierPrice;
  if (autoCalculatePrice && productData.supplierPrice > 0) {
    basePrice = calculateSalePrice(productData.supplierPrice, profitMargin);
  }

  // Generar slug del nombre
  const slug = productData.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 100);

  // Preparar datos del producto
  const product = {
    name: productData.name,
    slug,
    description: productData.description,
    basePrice,
    categoryId,
    supplierId,
    supplierProductId: productData.externalId,
    supplierUrl: productData.supplierUrl,
    supplierPrice: productData.supplierPrice,
    profitMargin,
    shippingTime: productData.shippingTime,
    importedAt: new Date(),
    inStock: true,
    stockCount: 999, // En dropshipping, usualmente "ilimitado"
    isActive: !productData.needsManualReview, // Si necesita revisión, dejar inactivo
    images: productData.images,
    variants: productData.variants
  };

  return product;
}

/**
 * Valida datos de producto importado
 */
function validateImportedProduct(productData) {
  const errors = [];

  if (!productData.name || productData.name.trim().length === 0) {
    errors.push('El nombre del producto es requerido');
  }

  if (!productData.supplierUrl) {
    errors.push('La URL del proveedor es requerida');
  }

  if (productData.supplierPrice === undefined || productData.supplierPrice < 0) {
    errors.push('El precio del proveedor debe ser mayor o igual a 0');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sincroniza precio de un producto con el proveedor
 * (Placeholder - implementar con API real del proveedor)
 */
async function syncProductPrice(productId, supplierUrl) {
  try {
    // Aquí iría la lógica para obtener el precio actualizado del proveedor
    console.log(`Sincronizando precio para producto ${productId} desde ${supplierUrl}`);

    // Por ahora, retornar estructura de ejemplo
    return {
      success: true,
      oldPrice: 0,
      newPrice: 0,
      priceChanged: false,
      lastSyncedAt: new Date()
    };
  } catch (error) {
    console.error('Error sincronizando precio:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Verifica disponibilidad de stock en el proveedor
 * (Placeholder - implementar con API real del proveedor)
 */
async function checkSupplierStock(productId, supplierUrl) {
  try {
    console.log(`Verificando stock para producto ${productId} desde ${supplierUrl}`);

    // Por ahora, retornar disponible por defecto
    return {
      available: true,
      quantity: 999,
      lastCheckedAt: new Date()
    };
  } catch (error) {
    console.error('Error verificando stock:', error);
    return {
      available: false,
      error: error.message
    };
  }
}

module.exports = {
  parseProductUrl,
  parseAliExpressProduct,
  parseCJProduct,
  parseAmazonProduct,
  parseGenericProduct,
  createProductFromImport,
  validateImportedProduct,
  syncProductPrice,
  checkSupplierStock
};
