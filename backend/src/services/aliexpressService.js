// backend/src/services/aliexpressService.js
const axios = require('axios');
const cheerio = require('cheerio');

/**
 * 🚀 SERVICIO DE ALIEXPRESS - Extracción automática de productos
 *
 * Funcionalidades:
 * - Extraer datos de producto desde URL
 * - Obtener precios, imágenes, variantes
 * - Calcular costos de envío
 * - Integración con DSers API
 */

class AliExpressService {
  constructor() {
    this.isConfigured = true;
    console.log('✅ AliExpress Service inicializado');
  }

  /**
   * Extraer ID del producto desde URL de AliExpress
   */
  extractProductId(url) {
    // Ejemplos de URLs de AliExpress:
    // https://www.aliexpress.com/item/1005005234567890.html
    // https://www.aliexpress.us/item/1005005234567890.html
    // https://aliexpress.com/item/1005005234567890.html

    const regex = /item\/(\d+)\.html/;
    const match = url.match(regex);

    if (match && match[1]) {
      return match[1];
    }

    // Formato alternativo: /i/1005005234567890.html
    const altRegex = /\/i\/(\d+)\.html/;
    const altMatch = url.match(altRegex);

    if (altMatch && altMatch[1]) {
      return altMatch[1];
    }

    throw new Error('URL de AliExpress inválida');
  }

  /**
   * Obtener datos del producto desde AliExpress
   * Usa web scraping como fallback si la API no está disponible
   */
  async getProductData(url) {
    try {
      const productId = this.extractProductId(url);
      console.log(`📦 Obteniendo producto ${productId} de AliExpress...`);

      // Usar API pública de AliExpress (si está disponible)
      // O hacer scraping de la página

      // Limpiar URL y normalizar
      let cleanUrl = url.split('?')[0]; // Remover parámetros

      // Si tiene supplyId u otros parámetros, AliExpress puede causar loops de redirect
      // Usar solo la URL base del producto
      if (!cleanUrl.includes('.html')) {
        cleanUrl = `${cleanUrl}.html`;
      }

      console.log(`🔗 URL original: ${url}`);
      console.log(`🔗 URL limpia: ${cleanUrl}`);

      const response = await axios.get(cleanUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Sec-Ch-Ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"Windows"',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1',
          'Dnt': '1',
          'Connection': 'keep-alive'
        },
        timeout: 45000, // Aumentado a 45 segundos
        maxRedirects: 10, // Aumentado a 10 redirects
        validateStatus: function (status) {
          return status >= 200 && status < 400; // Aceptar redirects 3xx
        }
      });

      const $ = cheerio.load(response.data);
      const scriptContent = response.data; // HTML completo para parseo de scripts

      // Extraer datos del producto desde el HTML
      let productData = {
        productId: productId,
        url: url,
        name: '',
        description: '',
        price: 0,
        originalPrice: 0,
        currency: 'USD',
        images: [],
        variants: [],
        specifications: {},
        shipping: {
          freeShipping: false,
          estimatedCost: 0,
          estimatedDays: '15-30'
        },
        supplier: {
          name: '',
          rating: 0,
          orders: 0
        }
      };

      // ESTRATEGIA 1: Extraer desde meta tags Open Graph
      const ogTitle = $('meta[property="og:title"]').attr('content');
      const ogImage = $('meta[property="og:image"]').attr('content');

      if (ogTitle) {
        // Limpiar el título (quitar " - AliExpress" y números al final)
        productData.name = ogTitle.replace(/ - AliExpress.*$/i, '').trim();
      }

      if (ogImage) {
        productData.images = [ogImage];
      }

      // ESTRATEGIA 2: Extraer desde window._d_c_.DCData
      const dcDataMatch = scriptContent.match(/window\._d_c_\.DCData\s*=\s*({[\s\S]*?});/);

      if (dcDataMatch) {
        try {
          const dcData = JSON.parse(dcDataMatch[1]);

          // Imágenes desde DCData
          if (dcData.imagePathList && Array.isArray(dcData.imagePathList)) {
            productData.images = dcData.imagePathList.map(img => {
              return img.startsWith('//') ? `https:${img}` : img;
            });
          }
        } catch (e) {
          console.error('Error parseando DCData:', e.message);
        }
      }

      // ESTRATEGIA 3: Extraer desde window.runParams (datos de AliExpress)
      const runParamsMatch = scriptContent.match(/window\.runParams\s*=\s*({[\s\S]*?});/);

      if (runParamsMatch) {
        try {
          const runParams = JSON.parse(runParamsMatch[1]);
          const data = runParams.data || {};

          // Título del producto
          if (data.titleModule && data.titleModule.subject) {
            productData.name = data.titleModule.subject;
          }

          // Precio
          if (data.priceModule) {
            const priceData = data.priceModule;
            if (priceData.minActivityAmount) {
              productData.price = parseFloat(priceData.minActivityAmount.value);
            } else if (priceData.minAmount) {
              productData.price = parseFloat(priceData.minAmount.value);
            }

            if (priceData.maxAmount) {
              productData.originalPrice = parseFloat(priceData.maxAmount.value);
            }
          }

          // Imágenes
          if (data.imageModule && data.imageModule.imagePathList) {
            productData.images = data.imageModule.imagePathList;
          }

          // Especificaciones
          if (data.specsModule && data.specsModule.props) {
            data.specsModule.props.forEach(prop => {
              if (prop.attrName && prop.attrValue) {
                productData.specifications[prop.attrName] = prop.attrValue;
              }
            });
          }

          // Variantes (SKU)
          if (data.skuModule && data.skuModule.productSKUPropertyList) {
            data.skuModule.productSKUPropertyList.forEach(property => {
              if (property.skuPropertyValues) {
                property.skuPropertyValues.forEach(value => {
                  productData.variants.push({
                    name: value.propertyValueDisplayName || value.propertyValueName,
                    imageUrl: value.skuPropertyImagePath,
                    skuId: value.propertyValueId
                  });
                });
              }
            });
          }

          // Envío
          if (data.shippingModule) {
            productData.shipping.freeShipping = data.shippingModule.freightExt?.some(
              ext => ext.freeFreightInfo?.freeShipping
            ) || false;
          }

          // Info del vendedor
          if (data.storeModule) {
            productData.supplier = {
              name: data.storeModule.storeName || '',
              rating: parseFloat(data.storeModule.positiveRate) || 0,
              orders: parseInt(data.storeModule.orderCount) || 0
            };
          }

        } catch (e) {
          console.error('Error parseando runParams:', e.message);
        }
      }

      // Validar que tengamos datos mínimos
      if (!productData.name) {
        // Intentar extraer del título de la página
        productData.name = $('title').text().replace(' - AliExpress', '').trim();
      }

      if (!productData.name) {
        throw new Error('No se pudo extraer el nombre del producto');
      }

      if (productData.price === 0) {
        // Buscar precio en el HTML
        const priceText = $('.product-price-value').first().text() ||
                         $('.uniform-banner-box-price').first().text() ||
                         $('[class*="price"]').first().text();

        const priceMatch = priceText.match(/[\d,]+\.?\d*/);
        if (priceMatch) {
          productData.price = parseFloat(priceMatch[0].replace(',', ''));
        }
      }

      console.log(`✅ Datos extraídos: ${productData.name} - $${productData.price}`);

      return {
        success: true,
        product: productData
      };

    } catch (error) {
      console.error('❌ Error obteniendo producto de AliExpress:', error.message);
      return {
        success: false,
        error: error.message,
        product: null
      };
    }
  }

  /**
   * Calcular costo de envío desde AliExpress
   */
  async calculateShipping(productId, country = 'ES', quantity = 1) {
    try {
      // Por ahora retornar envío estándar
      // TODO: Integrar con API real de AliExpress shipping

      const shippingRates = {
        'US': { cost: 0, days: '10-20', method: 'ePacket' },
        'ES': { cost: 0, days: '15-25', method: 'AliExpress Standard Shipping' },
        'PE': { cost: 0, days: '20-35', method: 'AliExpress Standard Shipping' },
        'MX': { cost: 0, days: '15-30', method: 'AliExpress Standard Shipping' },
        'DEFAULT': { cost: 0, days: '20-40', method: 'AliExpress Standard Shipping' }
      };

      const shipping = shippingRates[country] || shippingRates['DEFAULT'];

      return {
        success: true,
        shipping: {
          cost: shipping.cost,
          currency: 'USD',
          estimatedDays: shipping.days,
          method: shipping.method,
          isFree: shipping.cost === 0
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        shipping: null
      };
    }
  }

  /**
   * Crear orden en AliExpress vía DSers
   * (Requiere integración con DSers API o CSV)
   */
  async createOrder(orderData) {
    try {
      // Formato de datos para DSers:
      const dsersOrder = {
        productUrl: orderData.productUrl,
        productId: this.extractProductId(orderData.productUrl),
        quantity: orderData.quantity,
        variantId: orderData.variantId || null,

        // Datos del cliente
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        customerPhone: orderData.customerPhone,

        // Dirección de envío
        shippingAddress: orderData.shippingAddress,
        shippingCity: orderData.shippingCity,
        shippingState: orderData.shippingState,
        shippingPostalCode: orderData.shippingPostalCode,
        shippingCountry: orderData.shippingCountry,

        // Referencia de orden
        orderNumber: orderData.orderNumber,
        notes: orderData.notes || ''
      };

      // Por ahora, retornar los datos formateados para DSers CSV
      // TODO: Integrar con DSers API cuando esté disponible

      console.log('📦 Orden preparada para DSers:', dsersOrder.orderNumber);

      return {
        success: true,
        message: 'Orden preparada. Procesar en DSers.',
        dsersData: dsersOrder,
        requiresManualProcessing: true
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generar CSV para importar a DSers
   */
  generateDSersCSV(orders) {
    // Headers de DSers
    const headers = [
      'Order Number',
      'Product URL',
      'Quantity',
      'Variant ID',
      'Customer Name',
      'Customer Email',
      'Customer Phone',
      'Shipping Address',
      'Shipping City',
      'Shipping State',
      'Shipping Postal Code',
      'Shipping Country',
      'Notes'
    ];

    let csv = headers.join(',') + '\n';

    orders.forEach(order => {
      const row = [
        order.orderNumber,
        order.productUrl,
        order.quantity,
        order.variantId || '',
        `"${order.customerName}"`,
        order.customerEmail,
        order.customerPhone,
        `"${order.shippingAddress}"`,
        order.shippingCity,
        order.shippingState,
        order.shippingPostalCode,
        order.shippingCountry,
        `"${order.notes || ''}"`
      ];
      csv += row.join(',') + '\n';
    });

    return csv;
  }
}

module.exports = new AliExpressService();
