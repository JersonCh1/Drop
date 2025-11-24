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
   * Mejorar el título del producto para que sea más comercial
   */
  improveProductTitle(rawTitle) {
    let title = rawTitle;

    // Extraer modelo de iPhone PRIMERO
    const iphoneMatch = title.match(/(iPhone\s*\d+\s*(Pro\s*Max|Pro|Plus|Air)?)/i);
    let iphoneModel = '';
    if (iphoneMatch) {
      iphoneModel = iphoneMatch[0]
        .replace(/iPhone(\d+)/, 'iPhone $1')
        .replace(/ProMax/i, 'Pro Max')
        .replace(/\s+/g, ' ')
        .trim();
      title = title.replace(iphoneMatch[0], '').trim();
    }

    // Detectar material (Cuero, Silicona, etc.)
    let material = '';
    if (title.match(/cuero|leather|pu/i)) {
      material = 'Cuero';
      title = title.replace(/cuero|leather|pu|piel/gi, '').trim();
    } else if (title.match(/silicone?|silicon/i)) {
      material = 'Silicona';
      title = title.replace(/silicone?|silicon/gi, '').trim();
    } else if (title.match(/tpu/i)) {
      material = 'TPU';
      title = title.replace(/tpu/gi, '').trim();
    }

    // Detectar características especiales
    const features = [];
    if (title.match(/magsafe/i)) {
      features.push('MagSafe');
      title = title.replace(/magsafe/gi, '').trim();
    }
    if (title.match(/ai|smart\s*control|camera\s*button|control\s*button/i)) {
      features.push('Botón AI Control');
      title = title.replace(/ai|smart\s*control|camera\s*button|control\s*button|con cubierta de botón de cámara de control inteligente/gi, '').trim();
    }
    if (title.match(/360|protección completa/i)) {
      features.push('360°');
      title = title.replace(/360|protección completa/gi, '').trim();
    }
    if (title.match(/transparent|transparente|clear/i)) {
      features.push('Transparente');
      title = title.replace(/transparent|transparente|clear/gi, '').trim();
    }

    // Remover palabras basura comunes
    const garbageWords = [
      'funda trasera',
      'funda',
      'case',
      'back case',
      'bumper',
      'simple',
      'real',
      'para',
      'for',
      'with',
      'con',
      'de',
      'the',
      'business',
      'ari',
      '17ari',
      '16ari',
      '15ari',
      'cover',
      'cubierta',
      'protección',
      'protection'
    ];

    garbageWords.forEach(word => {
      title = title.replace(new RegExp(`\\b${word}\\b`, 'gi'), '');
    });

    // Limpiar espacios y caracteres extraños
    title = title
      .replace(/\s+/g, ' ')
      .replace(/[^a-zA-Z0-9\sáéíóúñÁÉÍÓÚÑ]/g, '')
      .trim();

    // Construir título final
    let parts = ['Funda'];

    if (features.length > 0) {
      parts.push(features.join(' + '));
    }

    if (material) {
      parts.push(material);
    }

    // Si quedó algo útil del título, agregarlo
    if (title.length > 3 && title.length < 30) {
      parts.push(title.charAt(0).toUpperCase() + title.slice(1).toLowerCase());
    }

    if (iphoneModel) {
      parts.push('-');
      parts.push(iphoneModel);
    }

    return parts.join(' ').replace(/\s+-\s+/g, ' - ').trim();
  }

  /**
   * Inicializar navegador (se reutiliza entre requests)
   */
  async initBrowser() {
    if (!this.browser) {
      // Configuración para Railway/producción
      const launchOptions = {
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
      };

      // En Railway/producción, buscar Chromium de Nix
      if (process.env.RAILWAY_ENVIRONMENT || process.env.NODE_ENV === 'production') {
        const { execSync } = require('child_process');
        try {
          // Buscar chromium en /nix/store
          const chromiumPath = execSync('find /nix/store -name chromium -type f -executable 2>/dev/null | head -1')
            .toString()
            .trim();

          if (chromiumPath) {
            launchOptions.executablePath = chromiumPath;
            console.log(`🔍 Chromium encontrado en: ${chromiumPath}`);
          } else {
            console.log('⚠️ Chromium no encontrado, usando Puppeteer por defecto');
          }
        } catch (error) {
          console.error('⚠️ Error buscando Chromium:', error.message);
        }
      }

      this.browser = await puppeteer.launch(launchOptions);
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

      // Navegar a la página (más tolerante)
      console.log('🌐 Navegando a AliExpress...');
      try {
        await page.goto(cleanUrl, {
          waitUntil: 'domcontentloaded',
          timeout: 30000
        });
      } catch (e) {
        console.log('⚠️ Timeout navegando, pero continuando...');
      }

      // Esperar a que cargue el contenido principal (reducido a 5 segundos)
      console.log('⏳ Esperando carga de datos dinámicos (5 segundos)...');
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Intentar esperar específicamente por runParams.data (reducido a 5 segundos)
      console.log('⏳ Esperando window.runParams.data...');
      const hasData = await page.evaluate(() => {
        return new Promise((resolve) => {
          let attempts = 0;
          const checkInterval = setInterval(() => {
            attempts++;
            if (window.runParams && window.runParams.data && window.runParams.data.priceModule) {
              clearInterval(checkInterval);
              resolve(true);
            }
            if (attempts > 10) { // 10 intentos = 5 segundos
              clearInterval(checkInterval);
              resolve(false);
            }
          }, 500); // Check cada 500ms
        });
      });

      console.log(`📊 ¿Datos cargados?: ${hasData}`);

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

        // ESTRATEGIA 3: window.data (nueva estructura 2025)
        if (window.data && typeof window.data === 'object') {
          data.debug.foundWindowData = true;
          // AliExpress puede tener datos aquí en versiones nuevas
          // Intentar extraer lo que podamos
        }

        // ESTRATEGIA 4: DOM scraping directo (precio de elementos HTML)
        if (data.price === 0) {
          // Buscar precio en el DOM
          const priceElements = document.querySelectorAll('[class*="price"]');
          for (const el of priceElements) {
            const text = el.textContent;
            // Buscar patrón S/XX.XX o $XX.XX
            const match = text.match(/[S$]\s*\/?\s*([\d,]+\.?\d*)/);
            if (match && match[1]) {
              const priceValue = parseFloat(match[1].replace(',', ''));
              if (priceValue > 0 && priceValue < 1000) {
                data.price = priceValue;
                data.currency = text.includes('S/') ? 'PEN' : 'USD';
                data.debug.priceFrom = 'DOM';
                break;
              }
            }
          }
        }

        // ESTRATEGIA 5: Extraer variantes del DOM (nuevo AliExpress 2025)
        if (data.variants.length === 0) {
          // Buscar contenedores de SKU/variantes
          const skuContainers = document.querySelectorAll('[class*="sku-item--property"]');

          skuContainers.forEach((container, containerIndex) => {
            // Obtener el título de la variante (Color, Model, Size, etc.)
            const titleEl = container.querySelector('[class*="sku-item--title"]');
            let fullTitle = titleEl ? titleEl.textContent.trim() : '';

            // El título puede ser "Color: MagSafe Orange" o "Modelo móvil: iPhone 17 Pro"
            // Extraer la propiedad y el valor actual seleccionado
            let propertyName = '';
            let currentValue = '';

            if (fullTitle.includes(':')) {
              const parts = fullTitle.split(':');
              propertyName = parts[0].trim();
              currentValue = parts[1]?.trim() || '';
            }

            // Limpiar el nombre de la propiedad
            // IMPORTANTE: usar \b para word boundary y evitar "Model" dentro de "Modelo" → "Modeloo"
            propertyName = propertyName
              .replace(/\bModelo móvil\b/gi, 'Modelo')
              .replace(/\bModel\b/gi, 'Modelo')
              .replace(/\bColor\b/gi, 'Color')
              .trim();

            // Buscar todas las opciones dentro de este contenedor
            const optionElements = container.querySelectorAll('[class*="sku-item--"][data-sku-col]');

            // Si no hay opciones con texto (ej: solo imágenes de colores)
            // Contar cuántas hay y crear nombres genéricos
            const hasTextOptions = Array.from(optionElements).some(el => {
              return el.getAttribute('title') || el.textContent?.trim();
            });

            optionElements.forEach((optionEl, index) => {
              // Intentar obtener el texto - buscar en múltiples lugares
              let optionText = '';

              // Método 1: Buscar en título o aria-label
              optionText = optionEl.getAttribute('title') || optionEl.getAttribute('aria-label') || '';

              // Método 2: Si no hay, buscar en elementos internos
              if (!optionText) {
                const textElements = optionEl.querySelectorAll('span, div');
                textElements.forEach(el => {
                  const text = el.textContent?.trim() || '';
                  if (text.length > optionText.length && !text.includes('Color') && !text.includes('Modelo')) {
                    optionText = text;
                  }
                });
              }

              // Obtener imagen si existe
              const img = optionEl.querySelector('img');
              const imageUrl = img ? img.getAttribute('src') : '';

              // Si no hay texto pero hay imagen (caso común con colores)
              if (!optionText && imageUrl) {
                // Intentar extraer del alt de la imagen
                const imgAlt = img.getAttribute('alt') || '';
                if (imgAlt) {
                  optionText = imgAlt;
                }

                // Si sigue sin texto, intentar extraer del currentValue del título
                if (!optionText && currentValue) {
                  // El título puede ser "Color: MagSafe Orange" - extraer "MagSafe Orange"
                  // Si hay múltiples opciones, usar índice: "MagSafe Orange 1", "MagSafe Orange 2"
                  if (optionElements.length > 1) {
                    optionText = `${currentValue} ${index + 1}`;
                  } else {
                    optionText = currentValue;
                  }
                }

                // Último recurso: nombre genérico
                if (!optionText) {
                  optionText = `Opción ${index + 1}`;
                }
              }

              // Limpiar y normalizar el texto de la opción
              optionText = optionText
                .replace(/Modelo móvil\s*/gi, '')
                .replace(/iPhone\s*17\s*aire/gi, 'iPhone 17 Air')
                .replace(/iPhone\s*17\s*Pro\s*máx\./gi, 'iPhone 17 Pro Max')
                .replace(/iPhone\s*16\s*aire/gi, 'iPhone 16 Air')
                .replace(/iPhone\s*16\s*Pro\s*máx\./gi, 'iPhone 16 Pro Max')
                .replace(/iPhone\s*15\s*Pro\s*máx\./gi, 'iPhone 15 Pro Max')
                .replace(/\s+/g, ' ')
                .trim();

              if (optionText && optionText.length > 0) {
                // Construir nombre completo
                const fullName = `${propertyName}: ${optionText}`;

                data.variants.push({
                  name: fullName,
                  imageUrl: imageUrl ? (imageUrl.startsWith('//') ? `https:${imageUrl}` : imageUrl) : '',
                  property: propertyName,
                  value: optionText,
                  skuId: null
                });
              }
            });
          });

          data.debug.variantsFrom = 'DOM';
          data.debug.variantContainers = skuContainers.length;
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

      // Mejorar el título para que sea más comercial
      const originalName = productData.name;
      productData.name = this.improveProductTitle(productData.name);

      console.log(`✅ Datos extraídos:`);
      console.log(`   📦 Nombre original: ${originalName}`);
      console.log(`   ✨ Nombre mejorado: ${productData.name}`);
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
