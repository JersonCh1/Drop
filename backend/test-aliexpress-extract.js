// Test script para extraer producto de AliExpress localmente
const axios = require('axios');
const cheerio = require('cheerio');

async function extractProduct(url) {
  try {
    console.log('🔍 Extrayendo producto de AliExpress...');
    console.log('URL original:', url);

    // Limpiar URL - remover parámetros que causan loops
    let cleanUrl = url.split('?')[0];
    if (!cleanUrl.includes('.html')) {
      cleanUrl = `${cleanUrl}.html`;
    }
    console.log('URL limpia:', cleanUrl);

    // Extraer product ID
    const regex = /item\/(\d+)\.html/;
    const match = cleanUrl.match(regex);
    const productId = match ? match[1] : 'unknown';
    console.log('Product ID:', productId);

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
      timeout: 45000,
      maxRedirects: 10,
      validateStatus: function (status) {
        return status >= 200 && status < 400;
      }
    });

    console.log('✅ Respuesta recibida. Status:', response.status);
    console.log('Tamaño HTML:', response.data.length, 'bytes');

    const $ = cheerio.load(response.data);
    const scriptContent = response.data;

    let productData = {
      productId: productId,
      url: cleanUrl,
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

    // ESTRATEGIA 1: Meta tags Open Graph
    const ogTitle = $('meta[property="og:title"]').attr('content');
    const ogImage = $('meta[property="og:image"]').attr('content');

    if (ogTitle) {
      productData.name = ogTitle.replace(/ - AliExpress.*$/i, '').trim();
      console.log('📦 Nombre (OG):', productData.name);
    }

    if (ogImage) {
      productData.images.push(ogImage);
      console.log('🖼️ Imagen principal (OG):', ogImage);
    }

    // ESTRATEGIA 2: window.runParams
    const runParamsMatch = scriptContent.match(/window\.runParams\s*=\s*({[\s\S]*?});/);

    if (runParamsMatch) {
      try {
        const runParams = JSON.parse(runParamsMatch[1]);
        const data = runParams.data || {};

        // Título
        if (data.titleModule && data.titleModule.subject) {
          productData.name = data.titleModule.subject;
          console.log('📦 Nombre (runParams):', productData.name);
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
          console.log('💰 Precio:', productData.price, productData.currency);
        }

        // Imágenes
        if (data.imageModule && data.imageModule.imagePathList) {
          productData.images = data.imageModule.imagePathList.map(img => {
            return img.startsWith('//') ? `https:${img}` : img;
          });
          console.log('🖼️ Imágenes encontradas:', productData.images.length);
        }

        // Variantes
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
          console.log('🎨 Variantes encontradas:', productData.variants.length);
        }

        // Envío
        if (data.shippingModule) {
          productData.shipping.freeShipping = data.shippingModule.freightExt?.some(
            ext => ext.freeFreightInfo?.freeShipping
          ) || false;
          console.log('📦 Envío gratis:', productData.shipping.freeShipping);
        }

        // Vendedor
        if (data.storeModule) {
          productData.supplier = {
            name: data.storeModule.storeName || '',
            rating: parseFloat(data.storeModule.positiveRate) || 0,
            orders: parseInt(data.storeModule.orderCount) || 0
          };
          console.log('🏪 Vendedor:', productData.supplier.name);
        }

      } catch (e) {
        console.error('⚠️ Error parseando runParams:', e.message);
      }
    }

    // Fallback: título de página
    if (!productData.name) {
      productData.name = $('title').text().replace(' - AliExpress', '').trim();
    }

    if (!productData.name) {
      throw new Error('No se pudo extraer el nombre del producto');
    }

    console.log('\n✅ PRODUCTO EXTRAÍDO:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Nombre:', productData.name);
    console.log('Precio:', productData.price, productData.currency);
    console.log('Imágenes:', productData.images.length);
    console.log('Variantes:', productData.variants.length);
    console.log('Envío gratis:', productData.shipping.freeShipping);
    console.log('Vendedor:', productData.supplier.name);
    console.log('Rating:', productData.supplier.rating, '%');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return {
      success: true,
      product: productData
    };

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
    return {
      success: false,
      error: error.message
    };
  }
}

// Ejecutar
const url = process.argv[2] || 'https://www.aliexpress.com/item/1005009967421733.html?supplyId=159831080';
extractProduct(url);
