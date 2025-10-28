// backend/src/services/productScraperAdvanced.js
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const { calculateSalePrice } = require('../utils/pricing');

/**
 * 🔥 SCRAPER ROBUSTO PARA ALIEXPRESS, AMAZON, ALIBABA Y MÁS
 *
 * Extrae datos reales de productos con múltiples métodos de respaldo:
 * - Método 1: Scraping de HTML directo
 * - Método 2: Extracción de JSON embebido
 * - Método 3: API pública alternativa
 * - Método 4: Puppeteer para sitios con JavaScript dinámico
 *
 * Características:
 * - Título del producto
 * - Precio del proveedor
 * - Imágenes (hasta 20 imágenes)
 * - Descripción completa
 * - Variantes (tallas, colores, modelos)
 * - Especificaciones técnicas
 * - Ratings y reviews
 * - Tiempos de envío
 */

// Configuración de headers que simulan navegador real
const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Cache-Control': 'max-age=0'
};

// Función auxiliar para hacer requests con reintentos
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios({
        url,
        method: options.method || 'GET',
        headers: { ...BROWSER_HEADERS, ...options.headers },
        timeout: 20000,
        maxRedirects: 5,
        validateStatus: (status) => status < 500, // No throw en 4xx
        ...options
      });

      if (response.status >= 400) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      lastError = error;
      console.log(`⚠️ Intento ${i + 1}/${maxRetries} falló, reintentando...`);

      if (i < maxRetries - 1) {
        // Esperar antes de reintentar (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
      }
    }
  }

  throw lastError;
}

/**
 * ALIEXPRESS - Scraping con Puppeteer (navegador real)
 */
async function scrapeAliExpressWithPuppeteer(url) {
  let browser = null;

  try {
    console.log(`🚀 Iniciando Puppeteer para AliExpress: ${url}`);

    // Limpiar URL de parámetros de tracking
    const cleanUrl = url.split('?')[0];
    console.log(`🧹 URL limpia: ${cleanUrl}`);

    // Lanzar navegador headless
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ]
    });

    const page = await browser.newPage();

    // Configurar viewport y user agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Ir a la página
    console.log('📄 Navegando a la página...');
    await page.goto(cleanUrl, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // Esperar a que carguen los datos principales
    console.log('⏳ Esperando datos del producto...');
    await page.waitForSelector('h1', { timeout: 30000 });

    // Extraer datos usando evaluación en el contexto de la página
    console.log('📦 Extrayendo datos del producto...');
    const productData = await page.evaluate((originalUrl) => {
      const data = {
        externalId: null,
        name: '',
        description: '',
        supplierPrice: 0,
        images: [],
        variants: [],
        specifications: {},
        shippingTime: '15-30 días hábiles',
        supplierUrl: originalUrl,
        platform: 'AliExpress',
        needsManualReview: false
      };

      // Extraer ID del producto
      const idMatch = originalUrl.match(/item\/(\d+)\.html/) || originalUrl.match(/\/(\d+)\.html/);
      if (idMatch) {
        data.externalId = idMatch[1];
      }

      // Intentar extraer datos del objeto window
      try {
        if (window.runParams && window.runParams.data) {
          const pageData = window.runParams.data;

          // Nombre
          if (pageData.titleModule && pageData.titleModule.subject) {
            data.name = pageData.titleModule.subject.trim();
          }

          // Precio
          if (pageData.priceModule) {
            if (pageData.priceModule.minActivityAmount && pageData.priceModule.minActivityAmount.value) {
              data.supplierPrice = parseFloat(pageData.priceModule.minActivityAmount.value);
            } else if (pageData.priceModule.minAmount && pageData.priceModule.minAmount.value) {
              data.supplierPrice = parseFloat(pageData.priceModule.minAmount.value);
            }
          }

          // Imágenes
          if (pageData.imageModule && pageData.imageModule.imagePathList) {
            data.images = pageData.imageModule.imagePathList
              .map(img => img.startsWith('//') ? 'https:' + img : img)
              .slice(0, 20);
          }

          // Descripción
          if (pageData.pageModule && pageData.pageModule.description) {
            data.description = pageData.pageModule.description.trim();
          } else if (data.name) {
            data.description = `${data.name}. Producto importado desde AliExpress con envío internacional.`;
          }

          // Variantes
          if (pageData.skuModule && pageData.skuModule.productSKUPropertyList) {
            data.variants = pageData.skuModule.productSKUPropertyList.map(prop => ({
              name: prop.skuPropertyName,
              values: prop.skuPropertyValues.map(val => ({
                id: val.propertyValueId,
                name: val.propertyValueDisplayName,
                image: val.skuPropertyImagePath ? (val.skuPropertyImagePath.startsWith('//') ? 'https:' + val.skuPropertyImagePath : val.skuPropertyImagePath) : null
              }))
            }));
          }

          // Especificaciones
          if (pageData.specsModule && pageData.specsModule.props) {
            pageData.specsModule.props.forEach(spec => {
              data.specifications[spec.attrName] = spec.attrValue;
            });
          }
        }
      } catch (e) {
        console.log('Error extrayendo de window.runParams:', e.message);
      }

      // Fallback: scraping HTML directo si no hay datos de window
      if (!data.name) {
        const h1 = document.querySelector('h1');
        if (h1) data.name = h1.textContent.trim();
      }

      if (data.images.length === 0) {
        const imgs = document.querySelectorAll('img[src*="alicdn"]');
        const imageSet = new Set();
        imgs.forEach(img => {
          let src = img.src || img.getAttribute('data-src');
          if (src && !src.includes('avatar') && !src.includes('logo')) {
            if (src.startsWith('//')) src = 'https:' + src;
            imageSet.add(src);
          }
        });
        data.images = Array.from(imageSet).slice(0, 20);
      }

      if (data.supplierPrice === 0) {
        const priceElements = document.querySelectorAll('[class*="price"], [class*="Price"]');
        for (const el of priceElements) {
          const text = el.textContent;
          const match = text.match(/[\d,]+\.?\d*/);
          if (match) {
            const price = parseFloat(match[0].replace(/,/g, ''));
            if (price > 0 && price < 100000) {
              data.supplierPrice = price;
              break;
            }
          }
        }
      }

      // Marcar para revisión si faltan datos críticos
      if (!data.name || data.supplierPrice === 0 || data.images.length === 0) {
        data.needsManualReview = true;
      }

      return data;
    }, url);

    await browser.close();

    console.log(`✅ Puppeteer scraping completado:`);
    console.log(`   Nombre: ${productData.name || 'NO ENCONTRADO'}`);
    console.log(`   Precio: $${productData.supplierPrice || 0}`);
    console.log(`   Imágenes: ${productData.images.length}`);
    console.log(`   Variantes: ${productData.variants.length}`);
    console.log(`   Necesita revisión: ${productData.needsManualReview ? 'Sí' : 'No'}`);

    return productData;

  } catch (error) {
    if (browser) {
      await browser.close();
    }

    console.error('❌ Error en Puppeteer scraping:', error.message);
    throw error;
  }
}

/**
 * ALIEXPRESS - Scraping mejorado y robusto (método antiguo - fallback)
 */
async function scrapeAliExpressProduct(url) {
  try {
    console.log(`🔍 Scraping AliExpress: ${url}`);

    // PRIMERO: Intentar con Puppeteer (navegador real)
    try {
      console.log('🚀 Intentando con Puppeteer (navegador real)...');
      const puppeteerData = await scrapeAliExpressWithPuppeteer(url);

      // Si Puppeteer obtuvo datos válidos, retornarlos
      if (puppeteerData.name && !puppeteerData.name.includes('Error') && puppeteerData.supplierPrice > 0) {
        console.log('✅ Puppeteer exitoso, retornando datos');
        return puppeteerData;
      } else {
        console.log('⚠️ Puppeteer no obtuvo todos los datos, intentando método HTTP...');
      }
    } catch (puppeteerError) {
      console.log('⚠️ Puppeteer falló, intentando método HTTP como fallback:', puppeteerError.message);
    }

    // FALLBACK: Método HTTP original
    // Limpiar URL de parámetros de tracking innecesarios
    const cleanUrl = url.split('?')[0] + '.html';
    console.log(`🧹 URL limpia: ${cleanUrl}`);

    // Hacer request con headers que simulan un navegador real
    const response = await axios.get(cleanUrl, {
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
    console.log(`📄 Buscando datos en ${$('script').length} scripts...`);
    const scripts = $('script').toArray();
    let jsonDataFound = false;

    for (const script of scripts) {
      const scriptContent = $(script).html();

      // AliExpress embebe los datos en window.runParams o data.
      if (scriptContent && (scriptContent.includes('data:') || scriptContent.includes('window.runParams'))) {
        try {
          // Intentar extraer JSON embebido
          let jsonMatch = scriptContent.match(/data:\s*({[\s\S]*?})\s*[,}]/);

          // Intentar otro patrón común
          if (!jsonMatch) {
            jsonMatch = scriptContent.match(/window\.runParams\s*=\s*({[\s\S]*?});/);
          }

          if (jsonMatch) {
            console.log('📦 JSON embebido encontrado, parseando...');
            const jsonData = JSON.parse(jsonMatch[1]);
            jsonDataFound = true;

            // Extraer título
            if (jsonData.titleModule?.subject) {
              productData.name = jsonData.titleModule.subject.trim();
              console.log(`✓ Título: ${productData.name}`);
            } else {
              console.log('✗ Título no encontrado en JSON');
            }

            // Extraer precio
            if (jsonData.priceModule?.minActivityAmount?.value) {
              productData.supplierPrice = parseFloat(jsonData.priceModule.minActivityAmount.value);
              console.log(`✓ Precio: $${productData.supplierPrice}`);
            } else if (jsonData.priceModule?.minAmount?.value) {
              productData.supplierPrice = parseFloat(jsonData.priceModule.minAmount.value);
              console.log(`✓ Precio: $${productData.supplierPrice}`);
            } else {
              console.log('✗ Precio no encontrado en JSON');
            }

            // Extraer imágenes
            if (jsonData.imageModule?.imagePathList) {
              productData.images = jsonData.imageModule.imagePathList
                .map(img => img.startsWith('//') ? 'https:' + img : img)
                .slice(0, 10);
              console.log(`✓ Imágenes: ${productData.images.length} encontradas`);
            } else {
              console.log('✗ Imágenes no encontradas en JSON');
            }

            // Extraer descripción
            if (jsonData.pageModule?.description) {
              productData.description = jsonData.pageModule.description.trim();
              console.log(`✓ Descripción encontrada`);
            } else if (jsonData.titleModule?.subject) {
              productData.description = `Producto importado de AliExpress: ${jsonData.titleModule.subject}`;
              console.log(`✓ Descripción generada del título`);
            } else {
              console.log('✗ Descripción no encontrada');
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
              console.log(`✓ Variantes: ${productData.variants.length} encontradas`);
            }

            // Extraer especificaciones
            if (jsonData.specsModule?.props) {
              jsonData.specsModule.props.forEach(spec => {
                productData.specifications[spec.attrName] = spec.attrValue;
              });
              console.log(`✓ Especificaciones: ${Object.keys(productData.specifications).length} encontradas`);
            }

            // Extraer tiempo de envío
            if (jsonData.shippingModule?.generalFreightInfo?.originalLayoutResultList?.[0]?.bizData?.deliveryDayMax) {
              const days = jsonData.shippingModule.generalFreightInfo.originalLayoutResultList[0].bizData.deliveryDayMax;
              productData.shippingTime = `${days} días hábiles`;
              console.log(`✓ Tiempo de envío: ${productData.shippingTime}`);
            }

            console.log('✅ Datos extraídos del JSON embebido');
            break;
          }
        } catch (parseError) {
          // Continuar con otros métodos si falla el JSON
          console.log('⚠️ Error parseando JSON embebido:', parseError.message);
          console.log('Intentando scraping HTML como fallback...');
        }
      }
    }

    if (!jsonDataFound) {
      console.log('⚠️ No se encontró JSON embebido, usando scraping HTML directo...');
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
    console.error('📍 Stack trace:', error.stack);
    console.error('🔗 URL original:', url);

    // Retornar datos básicos en caso de error
    return {
      externalId: null,
      name: 'Producto Importado de AliExpress - Error',
      description: `No se pudo extraer la información automáticamente. Error: ${error.message}. Por favor ingresa los datos manualmente o intenta con otra URL.`,
      supplierPrice: 0,
      images: [],
      variants: [],
      specifications: {},
      shippingTime: '15-30 días hábiles',
      supplierUrl: url,
      platform: 'AliExpress',
      needsManualReview: true,
      rawData: {
        error: error.message,
        errorType: error.name,
        url: url
      }
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
 * MEJORADA: Usa scrapers especializados robustos
 */
async function parseProductUrl(url) {
  try {
    // Importar scrapers especializados
    const { scrapeAmazonProduct } = require('./scrapers/amazonScraper');
    const { scrapeAlibabaProduct } = require('./scrapers/alibabaScraper');
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    console.log(`\n🚀 Iniciando scraping de: ${hostname}`);

    // Detectar plataforma y ejecutar scraper correspondiente
    if (hostname.includes('aliexpress')) {
      console.log('🔍 Plataforma detectada: AliExpress');
      return await scrapeAliExpressProduct(url);
    } else if (hostname.includes('amazon')) {
      console.log('🛒 Plataforma detectada: Amazon');
      return await scrapeAmazonProduct(url);
    } else if (hostname.includes('alibaba')) {
      console.log('🏭 Plataforma detectada: Alibaba');
      return await scrapeAlibabaProduct(url);
    } else if (hostname.includes('cjdropshipping') || hostname.includes('cjdrop')) {
      console.log('📦 Plataforma detectada: CJ Dropshipping');
      return await scrapeCJProduct(url);
    } else {
      console.log('🌐 Plataforma genérica - Scraping básico');
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
