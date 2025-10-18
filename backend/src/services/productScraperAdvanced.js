// backend/src/services/productScraperAdvanced.js
const axios = require('axios');
const cheerio = require('cheerio');
const { calculateSalePrice } = require('../utils/pricing');

/**
 * 🔥 SCRAPER REAL PARA ALIEXPRESS Y OTRAS PLATAFORMAS
 *
 * Extrae datos reales de productos incluyendo:
 * - Título del producto
 * - Precio del proveedor
 * - Imágenes (hasta 10 imágenes)
 * - Descripción
 * - Variantes (tallas, colores)
 * - Especificaciones
 */

/**
 * Parsea producto de AliExpress con scraping real
 */
async function scrapeAliExpressProduct(url) {
  try {
    console.log(`🔍 Scraping AliExpress: ${url}`);

    // Hacer request con headers que simulan un navegador real
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 15000,
      maxRedirects: 5
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Extraer datos del producto
    let productData = {
      externalId: null,
      name: '',
      description: '',
      supplierPrice: 0,
      images: [],
      variants: [],
      specifications: {},
      shippingTime: '15-30 días hábiles',
      supplierUrl: url,
      platform: 'AliExpress',
      needsManualReview: false,
      rawData: {}
    };

    // 1. Extraer ID del producto
    const idMatch = url.match(/item\/(\d+)\.html/) || url.match(/\/(\d+)\.html/);
    if (idMatch) {
      productData.externalId = idMatch[1];
    }

    // 2. Buscar datos en el script JSON embebido (método principal de AliExpress)
    const scripts = $('script').toArray();
    for (const script of scripts) {
      const scriptContent = $(script).html();

      // AliExpress embebe los datos en window.runParams o data.
      if (scriptContent && scriptContent.includes('data:')) {
        try {
          // Intentar extraer JSON embebido
          const jsonMatch = scriptContent.match(/data:\s*({[\s\S]*?})\s*[,}]/);
          if (jsonMatch) {
            const jsonData = JSON.parse(jsonMatch[1]);

            // Extraer título
            if (jsonData.titleModule?.subject) {
              productData.name = jsonData.titleModule.subject.trim();
            }

            // Extraer precio
            if (jsonData.priceModule?.minActivityAmount?.value) {
              productData.supplierPrice = parseFloat(jsonData.priceModule.minActivityAmount.value);
            } else if (jsonData.priceModule?.minAmount?.value) {
              productData.supplierPrice = parseFloat(jsonData.priceModule.minAmount.value);
            }

            // Extraer imágenes
            if (jsonData.imageModule?.imagePathList) {
              productData.images = jsonData.imageModule.imagePathList
                .map(img => img.startsWith('//') ? 'https:' + img : img)
                .slice(0, 10);
            }

            // Extraer descripción
            if (jsonData.pageModule?.description) {
              productData.description = jsonData.pageModule.description.trim();
            } else if (jsonData.titleModule?.subject) {
              productData.description = `Producto importado de AliExpress: ${jsonData.titleModule.subject}`;
            }

            // Extraer variantes (colores, tallas, etc.)
            if (jsonData.skuModule?.productSKUPropertyList) {
              productData.variants = jsonData.skuModule.productSKUPropertyList.map(prop => ({
                name: prop.skuPropertyName,
                values: prop.skuPropertyValues.map(val => ({
                  id: val.propertyValueId,
                  name: val.propertyValueDisplayName,
                  image: val.skuPropertyImagePath
                }))
              }));
            }

            // Extraer especificaciones
            if (jsonData.specsModule?.props) {
              jsonData.specsModule.props.forEach(spec => {
                productData.specifications[spec.attrName] = spec.attrValue;
              });
            }

            // Extraer tiempo de envío
            if (jsonData.shippingModule?.generalFreightInfo?.originalLayoutResultList?.[0]?.bizData?.deliveryDayMax) {
              const days = jsonData.shippingModule.generalFreightInfo.originalLayoutResultList[0].bizData.deliveryDayMax;
              productData.shippingTime = `${days} días hábiles`;
            }

            console.log('✅ Datos extraídos del JSON embebido');
            break;
          }
        } catch (parseError) {
          // Continuar con otros métodos si falla el JSON
          console.log('⚠️ Error parseando JSON embebido, intentando scraping HTML...');
        }
      }
    }

    // 3. Fallback: Scraping HTML directo si no se encontró JSON
    if (!productData.name) {
      // Título
      productData.name = $('h1').first().text().trim() ||
                        $('.product-title').text().trim() ||
                        $('[data-pl="product-title"]').text().trim() ||
                        'Producto Importado de AliExpress';
    }

    if (productData.supplierPrice === 0) {
      // Precio (buscar en múltiples selectores)
      const priceSelectors = [
        '.product-price-value',
        '.uniform-banner-box-price',
        '[itemprop="price"]',
        '.price'
      ];

      for (const selector of priceSelectors) {
        const priceText = $(selector).first().text().trim();
        const priceMatch = priceText.match(/[\d,]+\.?\d*/);
        if (priceMatch) {
          productData.supplierPrice = parseFloat(priceMatch[0].replace(',', ''));
          break;
        }
      }
    }

    if (productData.images.length === 0) {
      // Imágenes (buscar en múltiples lugares)
      const imageSelectors = [
        'img[data-original]',
        '.images-view-item img',
        '.magnifier-image',
        'img[class*="image"]'
      ];

      const foundImages = new Set();

      for (const selector of imageSelectors) {
        $(selector).each((i, img) => {
          let imgSrc = $(img).attr('data-original') ||
                      $(img).attr('src') ||
                      $(img).attr('data-src');

          if (imgSrc) {
            // Convertir URLs relativas a absolutas
            if (imgSrc.startsWith('//')) {
              imgSrc = 'https:' + imgSrc;
            }

            // Filtrar thumbnails pequeños
            if (!imgSrc.includes('_50x50') && !imgSrc.includes('_100x100')) {
              // Reemplazar sufijos pequeños con versión grande
              imgSrc = imgSrc.replace(/_\d+x\d+\./, '_640x640.');
              foundImages.add(imgSrc);
            }
          }
        });

        if (foundImages.size > 0) break;
      }

      productData.images = Array.from(foundImages).slice(0, 10);
    }

    if (!productData.description || productData.description === '') {
      // Descripción
      productData.description = $('[data-pl="product-description"]').text().trim() ||
                               $('.product-description').text().trim() ||
                               $('meta[name="description"]').attr('content') ||
                               `Producto importado de AliExpress: ${productData.name}`;
    }

    // Validar que tenemos datos mínimos
    if (!productData.name || productData.name === 'Producto Importado de AliExpress') {
      console.log('⚠️ No se pudo extraer el título del producto');
      productData.needsManualReview = true;
    }

    if (productData.images.length === 0) {
      console.log('⚠️ No se encontraron imágenes');
      productData.needsManualReview = true;
    }

    if (productData.supplierPrice === 0) {
      console.log('⚠️ No se pudo extraer el precio');
      productData.needsManualReview = true;
    }

    console.log(`✅ Producto scrapeado:`);
    console.log(`   Nombre: ${productData.name}`);
    console.log(`   Precio: $${productData.supplierPrice}`);
    console.log(`   Imágenes: ${productData.images.length}`);
    console.log(`   Revisión manual: ${productData.needsManualReview ? 'Sí' : 'No'}`);

    return productData;

  } catch (error) {
    console.error('❌ Error scraping AliExpress:', error.message);

    // Retornar datos básicos en caso de error
    return {
      externalId: null,
      name: 'Producto Importado de AliExpress - Error',
      description: 'No se pudo extraer la información automáticamente. Por favor ingresa los datos manualmente.',
      supplierPrice: 0,
      images: [],
      variants: [],
      specifications: {},
      shippingTime: '15-30 días hábiles',
      supplierUrl: url,
      platform: 'AliExpress',
      needsManualReview: true,
      rawData: { error: error.message }
    };
  }
}

/**
 * Parsea producto de CJ Dropshipping
 */
async function scrapeCJProduct(url) {
  try {
    console.log(`🔍 Scraping CJ Dropshipping: ${url}`);

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);

    const productData = {
      externalId: url.match(/product\/([^\/]+)/)?.[1] || null,
      name: $('h1.product-name').text().trim() ||
            $('.product-title').text().trim() ||
            'Producto Importado de CJ Dropshipping',
      description: $('.product-description').text().trim() ||
                  $('.description-content').text().trim() ||
                  'Descripción del producto',
      supplierPrice: 0,
      images: [],
      variants: [],
      specifications: {},
      shippingTime: '10-20 días hábiles',
      supplierUrl: url,
      platform: 'CJ Dropshipping',
      needsManualReview: false,
      rawData: {}
    };

    // Extraer precio
    const priceText = $('.product-price').text() || $('.price-value').text();
    const priceMatch = priceText.match(/[\d,]+\.?\d*/);
    if (priceMatch) {
      productData.supplierPrice = parseFloat(priceMatch[0].replace(',', ''));
    }

    // Extraer imágenes
    $('.product-image img, .gallery-image img').each((i, img) => {
      let imgSrc = $(img).attr('src') || $(img).attr('data-src');
      if (imgSrc) {
        if (imgSrc.startsWith('//')) imgSrc = 'https:' + imgSrc;
        productData.images.push(imgSrc);
      }
    });

    productData.images = [...new Set(productData.images)].slice(0, 10);

    if (productData.images.length === 0 || productData.supplierPrice === 0) {
      productData.needsManualReview = true;
    }

    console.log(`✅ CJ Product scraped: ${productData.name} - $${productData.supplierPrice}`);

    return productData;

  } catch (error) {
    console.error('❌ Error scraping CJ Dropshipping:', error.message);
    return {
      externalId: null,
      name: 'Producto Importado de CJ - Error',
      description: 'No se pudo extraer la información automáticamente.',
      supplierPrice: 0,
      images: [],
      variants: [],
      specifications: {},
      shippingTime: '10-20 días hábiles',
      supplierUrl: url,
      platform: 'CJ Dropshipping',
      needsManualReview: true,
      rawData: { error: error.message }
    };
  }
}

/**
 * Parsea producto genérico (intenta extraer datos básicos de cualquier sitio)
 */
async function scrapeGenericProduct(url) {
  try {
    console.log(`🔍 Scraping genérico: ${url}`);

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);

    const productData = {
      externalId: null,
      name: '',
      description: '',
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

    // Intentar extraer título (múltiples métodos)
    productData.name = $('h1').first().text().trim() ||
                      $('[itemprop="name"]').text().trim() ||
                      $('meta[property="og:title"]').attr('content') ||
                      $('title').text().trim() ||
                      'Producto Importado';

    // Intentar extraer precio
    const priceSelectors = ['[itemprop="price"]', '.price', '[data-price]', '.product-price'];
    for (const selector of priceSelectors) {
      const priceText = $(selector).first().text();
      const priceMatch = priceText.match(/[\d,]+\.?\d*/);
      if (priceMatch) {
        productData.supplierPrice = parseFloat(priceMatch[0].replace(',', ''));
        break;
      }
    }

    // Intentar extraer descripción
    productData.description = $('[itemprop="description"]').text().trim() ||
                             $('meta[property="og:description"]').attr('content') ||
                             $('meta[name="description"]').attr('content') ||
                             'Producto importado desde proveedor externo';

    // Intentar extraer imágenes
    const imgSelectors = [
      'img[itemprop="image"]',
      '[property="og:image"]',
      '.product-image img',
      '.gallery img',
      'img[class*="product"]'
    ];

    const foundImages = new Set();

    for (const selector of imgSelectors) {
      $(selector).each((i, el) => {
        let imgSrc = $(el).attr('content') || $(el).attr('src') || $(el).attr('data-src');
        if (imgSrc) {
          if (imgSrc.startsWith('//')) imgSrc = 'https:' + imgSrc;
          if (imgSrc.startsWith('http')) foundImages.add(imgSrc);
        }
      });
    }

    productData.images = Array.from(foundImages).slice(0, 10);

    console.log(`✅ Generic product scraped: ${productData.name}`);
    console.log(`   Imágenes: ${productData.images.length}`);

    return productData;

  } catch (error) {
    console.error('❌ Error scraping genérico:', error.message);
    return {
      externalId: null,
      name: 'Producto Importado - Error',
      description: 'No se pudo extraer información de esta URL. Por favor ingresa los datos manualmente.',
      supplierPrice: 0,
      images: [],
      variants: [],
      specifications: {},
      shippingTime: '15-30 días hábiles',
      supplierUrl: url,
      platform: 'Generic',
      needsManualReview: true,
      rawData: { error: error.message }
    };
  }
}

/**
 * Función principal que detecta la plataforma y ejecuta el scraper adecuado
 */
async function parseProductUrl(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    console.log(`\n🚀 Iniciando scraping de: ${hostname}`);

    // Detectar plataforma y ejecutar scraper correspondiente
    if (hostname.includes('aliexpress')) {
      return await scrapeAliExpressProduct(url);
    } else if (hostname.includes('cjdropshipping') || hostname.includes('cjdrop')) {
      return await scrapeCJProduct(url);
    } else {
      // Para cualquier otra URL, intentar scraping genérico
      return await scrapeGenericProduct(url);
    }

  } catch (error) {
    console.error('❌ Error parseando URL:', error.message);
    throw new Error(`Error al parsear URL: ${error.message}`);
  }
}

/**
 * Descarga una imagen desde una URL y retorna los datos
 */
async function downloadImage(imageUrl) {
  try {
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0',
      }
    });

    return {
      data: Buffer.from(response.data),
      contentType: response.headers['content-type'] || 'image/jpeg',
      size: response.data.length
    };

  } catch (error) {
    console.error(`❌ Error descargando imagen ${imageUrl}:`, error.message);
    return null;
  }
}

/**
 * Valida que un producto tenga los datos mínimos necesarios
 */
function validateProductData(productData) {
  const errors = [];

  if (!productData.name || productData.name.includes('Error')) {
    errors.push('Nombre de producto inválido o no extraído');
  }

  if (productData.supplierPrice === 0) {
    errors.push('Precio no encontrado - debes ingresarlo manualmente');
  }

  if (productData.images.length === 0) {
    errors.push('No se encontraron imágenes - debes subirlas manualmente');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: productData.needsManualReview ? ['Este producto requiere revisión manual'] : []
  };
}

module.exports = {
  parseProductUrl,
  scrapeAliExpressProduct,
  scrapeCJProduct,
  scrapeGenericProduct,
  downloadImage,
  validateProductData
};
