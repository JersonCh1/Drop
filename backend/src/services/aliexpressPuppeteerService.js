// backend/src/services/aliexpressPuppeteerService.js
const puppeteer = require('puppeteer');

/**
 * 🚀 SERVICIO DE ALIEXPRESS CON PUPPETEER
 *
 * Usa un navegador real para evitar detección de bots
 * Más lento pero más confiable que axios
 */

class AliExpressPuppeteerService {
  constructor() {
    this.browser = null;
    console.log('✅ AliExpress Puppeteer Service inicializado');
  }

  /**
   * Inicializar navegador (se reutiliza entre requests)
   */
  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920x1080',
          '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
        ]
      });
      console.log('🌐 Navegador Puppeteer iniciado');
    }
    return this.browser;
  }

  /**
   * Cerrar navegador
   */
  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log('🌐 Navegador Puppeteer cerrado');
    }
  }

  /**
   * Extraer ID del producto desde URL
   */
  extractProductId(url) {
    const regex = /item\/(\d+)\.html/;
    const match = url.match(regex);
    if (match && match[1]) {
      return match[1];
    }
    const altRegex = /\/i\/(\d+)\.html/;
    const altMatch = url.match(altRegex);
    if (altMatch && altMatch[1]) {
      return altMatch[1];
    }
    throw new Error('URL de AliExpress inválida');
  }

  /**
   * Obtener datos del producto usando Puppeteer
   */
  async getProductData(url) {
    let page = null;

    try {
      const productId = this.extractProductId(url);
      console.log(`📦 Obteniendo producto ${productId} con Puppeteer...`);

      // Limpiar URL
      let cleanUrl = url.split('?')[0];
      if (!cleanUrl.includes('.html')) {
        cleanUrl = `${cleanUrl}.html`;
      }

      console.log(`🔗 URL limpia: ${cleanUrl}`);

      // Inicializar navegador
      const browser = await this.initBrowser();
      page = await browser.newPage();

      // Configurar viewport
      await page.setViewport({ width: 1920, height: 1080 });

      // Bloquear recursos innecesarios para acelerar
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
          req.abort();
        } else {
          req.continue();
        }
      });

      // Navegar a la página
      console.log('🌐 Navegando a AliExpress...');
      await page.goto(cleanUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });

      // Esperar a que cargue el contenido principal (más tiempo para JS dinámico)
      console.log('⏳ Esperando carga de datos dinámicos...');
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Intentar esperar por elementos específicos
      try {
        await page.waitForSelector('meta[property="og:title"]', { timeout: 5000 });
      } catch (e) {
        console.log('⚠️ Selector og:title no encontrado, continuando...');
      }

      // Primero verificar qué variables globales tiene AliExpress
      const aliexpressGlobals = await page.evaluate(() => {
        return {
          hasRunParams: typeof window.runParams !== 'undefined',
          hasData: typeof window.runParams?.data !== 'undefined',
          runParamsKeys: typeof window.runParams === 'object' ? Object.keys(window.runParams || {}) : [],
          hasStateData: typeof window.__INIT_STATE__ !== 'undefined',
          hasAppData: typeof window.__APP_DATA__ !== 'undefined'
        };
      });

      console.log(`📊 Variables globales de AliExpress:`, JSON.stringify(aliexpressGlobals, null, 2));

      // Extraer datos usando JavaScript en el navegador
      const productData = await page.evaluate(() => {
        const data = {
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
          },
          debug: {
            hasRunParams: typeof window.runParams !== 'undefined',
            hasData: typeof window.runParams?.data !== 'undefined'
          }
        };

        // ESTRATEGIA 1: Meta tags
        const ogTitle = document.querySelector('meta[property="og:title"]');
        const ogImage = document.querySelector('meta[property="og:image"]');

        if (ogTitle) {
          data.name = ogTitle.getAttribute('content').replace(/ - AliExpress.*$/i, '').trim();
        }

        if (ogImage) {
          data.images.push(ogImage.getAttribute('content'));
        }

        // ESTRATEGIA 2: window.runParams (datos de AliExpress)
        if (window.runParams && window.runParams.data) {
          const pageData = window.runParams.data;
          data.debug.foundRunParamsData = true;

          // Nombre
          if (pageData.titleModule && pageData.titleModule.subject) {
            data.name = pageData.titleModule.subject;
          }

          // Precio
          if (pageData.priceModule) {
            const priceData = pageData.priceModule;
            if (priceData.minActivityAmount) {
              data.price = parseFloat(priceData.minActivityAmount.value);
            } else if (priceData.minAmount) {
              data.price = parseFloat(priceData.minAmount.value);
            }
            if (priceData.maxAmount) {
              data.originalPrice = parseFloat(priceData.maxAmount.value);
            }
            if (priceData.minActivityAmount && priceData.minActivityAmount.currency) {
              data.currency = priceData.minActivityAmount.currency;
            }
          }

          // Imágenes
          if (pageData.imageModule && pageData.imageModule.imagePathList) {
            data.images = pageData.imageModule.imagePathList.map(img => {
              return img.startsWith('//') ? `https:${img}` : img;
            });
          }

          // Descripción
          if (pageData.descriptionModule && pageData.descriptionModule.descriptionUrl) {
            data.description = pageData.titleModule.subject || '';
          }

          // Variantes (SKU)
          if (pageData.skuModule && pageData.skuModule.productSKUPropertyList) {
            pageData.skuModule.productSKUPropertyList.forEach(property => {
              if (property.skuPropertyValues) {
                property.skuPropertyValues.forEach(value => {
                  data.variants.push({
                    name: value.propertyValueDisplayName || value.propertyValueName,
                    imageUrl: value.skuPropertyImagePath ?
                      (value.skuPropertyImagePath.startsWith('//') ?
                        `https:${value.skuPropertyImagePath}` :
                        value.skuPropertyImagePath) : '',
                    skuId: value.propertyValueId
                  });
                });
              }
            });
          }

          // Especificaciones
          if (pageData.specsModule && pageData.specsModule.props) {
            pageData.specsModule.props.forEach(prop => {
              if (prop.attrName && prop.attrValue) {
                data.specifications[prop.attrName] = prop.attrValue;
              }
            });
          }

          // Envío
          if (pageData.shippingModule) {
            const hasFreight = pageData.shippingModule.freightExt?.some(
              ext => ext.freeFreightInfo?.freeShipping
            );
            data.shipping.freeShipping = hasFreight || false;
          }

          // Proveedor
          if (pageData.storeModule) {
            data.supplier = {
              name: pageData.storeModule.storeName || '',
              rating: parseFloat(pageData.storeModule.positiveRate) || 0,
              orders: parseInt(pageData.storeModule.orderCount) || 0
            };
          }
        }

        // Fallback: título de página
        if (!data.name) {
          data.name = document.title.replace(' - AliExpress', '').trim();
        }

        return data;
      });

      // Agregar ID del producto
      productData.productId = productId;
      productData.url = cleanUrl;

      // Debug info
      console.log(`🐛 Debug:`, productData.debug);

      // Validar datos mínimos
      if (!productData.name) {
        throw new Error('No se pudo extraer el nombre del producto');
      }

      console.log(`✅ Datos extraídos: ${productData.name}`);
      console.log(`   💰 Precio: ${productData.price} ${productData.currency}`);
      console.log(`   🖼️ Imágenes: ${productData.images.length}`);
      console.log(`   🎨 Variantes: ${productData.variants.length}`);

      // Remover debug del resultado final
      delete productData.debug;

      return {
        success: true,
        product: productData
      };

    } catch (error) {
      console.error('❌ Error con Puppeteer:', error.message);

      let errorMessage = error.message;

      if (error.message.includes('timeout')) {
        errorMessage = 'La página de AliExpress tardó demasiado en cargar. Intenta de nuevo.';
      } else if (error.message.includes('Navigation failed')) {
        errorMessage = 'No se pudo acceder a AliExpress. Verifica que la URL sea válida.';
      } else if (error.message.includes('URL de AliExpress inválida')) {
        errorMessage = 'La URL no es válida. Debe ser un link de producto de AliExpress.';
      }

      return {
        success: false,
        error: errorMessage,
        product: null
      };

    } finally {
      // Cerrar página
      if (page) {
        try {
          await page.close();
        } catch (e) {
          console.error('Error cerrando página:', e.message);
        }
      }
    }
  }
}

module.exports = new AliExpressPuppeteerService();
