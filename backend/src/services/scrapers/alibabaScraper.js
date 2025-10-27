// backend/src/services/scrapers/alibabaScraper.js
const axios = require('axios');
const cheerio = require('cheerio');

/**
 * 🏭 SCRAPER COMPLETO DE ALIBABA
 *
 * Extrae información de productos al por mayor de Alibaba:
 * - Título del producto
 * - Precio (rangos por cantidad)
 * - Imágenes del producto
 * - Especificaciones
 * - MOQ (Minimum Order Quantity)
 * - Información del proveedor
 * - Tiempo de producción
 */

const ALIBABA_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Referer': 'https://www.alibaba.com/',
  'Upgrade-Insecure-Requests': '1'
};

async function scrapeAlibabaProduct(url) {
  try {
    console.log(`🏭 Scraping Alibaba: ${url}`);

    // Extraer product ID
    const productIdMatch = url.match(/\/product-detail\/[^\/]+\/(\d+)\.html/) ||
                           url.match(/\/(\d{10,})\.html/);
    const productId = productIdMatch ? productIdMatch[1] : null;

    // Hacer request
    const response = await axios.get(url, {
      headers: ALIBABA_HEADERS,
      timeout: 20000,
      maxRedirects: 5
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const productData = {
      externalId: productId,
      name: '',
      description: '',
      supplierPrice: 0,
      images: [],
      variants: [],
      specifications: {},
      shippingTime: '20-40 días hábiles',
      supplierUrl: url,
      platform: 'Alibaba',
      needsManualReview: false,
      moq: 1, // Minimum Order Quantity
      priceRanges: [], // Precios escalonados por cantidad
      supplierInfo: {},
      rawData: {}
    };

    // 1. TÍTULO
    const titleSelectors = [
      'h1.title',
      '.product-title',
      'h1[data-pl="product-title"]',
      '.ma-title h1',
      'h1.product-name'
    ];

    for (const selector of titleSelectors) {
      const title = $(selector).first().text().trim();
      if (title) {
        productData.name = title;
        break;
      }
    }

    // 2. PRECIO - Alibaba muestra rangos de precio
    // Buscar tabla de precios
    $('.ma-ladder-price tr, .price-ladder tr').each((i, row) => {
      const $row = $(row);
      const quantity = $row.find('td').eq(0).text().trim();
      const price = $row.find('td').eq(1).text().trim();

      const qtyMatch = quantity.match(/([\d,]+)/);
      const priceMatch = price.match(/\$?([\d,]+\.?\d*)/);

      if (qtyMatch && priceMatch) {
        const qty = parseInt(qtyMatch[1].replace(',', ''));
        const priceVal = parseFloat(priceMatch[1].replace(',', ''));

        productData.priceRanges.push({
          minQuantity: qty,
          price: priceVal
        });
      }
    });

    // Precio base (el más bajo)
    const priceSelectors = [
      '.ma-ref-price',
      '.price-ladder td:nth-child(2)',
      '.ma-spec-price strong',
      '[data-pl="price"]'
    ];

    for (const selector of priceSelectors) {
      const priceText = $(selector).first().text().trim();
      const priceMatch = priceText.match(/\$?([\d,]+\.?\d*)/);
      if (priceMatch) {
        productData.supplierPrice = parseFloat(priceMatch[1].replace(',', ''));
        break;
      }
    }

    // Si hay rangos de precio, usar el primero
    if (productData.priceRanges.length > 0 && productData.supplierPrice === 0) {
      productData.supplierPrice = productData.priceRanges[0].price;
    }

    // 3. MOQ (Minimum Order Quantity)
    const moqSelectors = [
      '.ma-reference-price .moq',
      '.ma-spec-moq',
      '[data-pl="moq"]'
    ];

    for (const selector of moqSelectors) {
      const moqText = $(selector).text().trim();
      const moqMatch = moqText.match(/([\d,]+)/);
      if (moqMatch) {
        productData.moq = parseInt(moqMatch[1].replace(',', ''));
        break;
      }
    }

    // 4. IMÁGENES
    // Método 1: Buscar en data attributes
    const imageData = html.match(/"imageList":\s*(\[[\s\S]*?\])/);
    if (imageData) {
      try {
        const images = JSON.parse(imageData[1]);
        productData.images = images
          .map(img => {
            if (typeof img === 'string') return img;
            if (img.fullImage) return img.fullImage;
            if (img.originalImage) return img.originalImage;
            return null;
          })
          .filter(Boolean)
          .map(url => url.startsWith('//') ? 'https:' + url : url)
          .slice(0, 20);
      } catch (e) {
        console.log('⚠️ Error parseando imágenes de JSON');
      }
    }

    // Método 2: Scraping directo
    if (productData.images.length === 0) {
      const imageSelectors = [
        '.detail-gallery-img',
        '.ma-thumb-item img',
        '.images-view-item img'
      ];

      const foundImages = new Set();

      for (const selector of imageSelectors) {
        $(selector).each((i, img) => {
          let imgSrc = $(img).attr('data-src') ||
                       $(img).attr('src') ||
                       $(img).attr('data-original');

          if (imgSrc) {
            // Mejorar resolución
            imgSrc = imgSrc.replace(/_\d+x\d+\./, '.');
            if (imgSrc.startsWith('//')) imgSrc = 'https:' + imgSrc;
            if (!imgSrc.includes('50x50') && !imgSrc.includes('thumbnail')) {
              foundImages.add(imgSrc);
            }
          }
        });
      }

      productData.images = Array.from(foundImages).slice(0, 20);
    }

    // 5. DESCRIPCIÓN
    const descriptionSelectors = [
      '.ma-content-list li',
      '.product-description p',
      '.detail-desc-list li'
    ];

    let descriptionParts = [];

    for (const selector of descriptionSelectors) {
      $(selector).each((i, el) => {
        const text = $(el).text().trim();
        if (text && text.length > 10) {
          descriptionParts.push(text);
        }
      });

      if (descriptionParts.length > 0) break;
    }

    productData.description = descriptionParts.join('\n') ||
                             `Producto al por mayor de Alibaba: ${productData.name}`;

    // 6. ESPECIFICACIONES
    $('.ma-spec-list tr, .product-property tr').each((i, row) => {
      const $row = $(row);
      const key = $row.find('td, th').eq(0).text().trim();
      const value = $row.find('td').eq(1).text().trim();

      if (key && value) {
        productData.specifications[key] = value;
      }
    });

    // 7. INFORMACIÓN DEL PROVEEDOR
    const supplierName = $('.company-name, .supplier-name').first().text().trim();
    const supplierCountry = $('.supplier-country').first().text().trim();
    const yearsInBusiness = $('.years-in-business').first().text().trim();

    productData.supplierInfo = {
      name: supplierName || 'Proveedor Alibaba',
      country: supplierCountry || 'China',
      yearsInBusiness: yearsInBusiness || 'N/A'
    };

    // 8. VARIANTES
    $('.sku-item, .variation-item').each((i, item) => {
      const $item = $(item);
      const name = $item.text().trim();
      const image = $item.find('img').attr('src');

      if (name) {
        productData.variants.push({
          name: name,
          image: image ? (image.startsWith('//') ? 'https:' + image : image) : null,
          available: !$item.hasClass('disabled')
        });
      }
    });

    // Validaciones
    if (!productData.name) {
      console.log('⚠️ No se pudo extraer el título');
      productData.needsManualReview = true;
    }

    if (productData.supplierPrice === 0) {
      console.log('⚠️ No se pudo extraer el precio');
      productData.needsManualReview = true;
    }

    if (productData.images.length === 0) {
      console.log('⚠️ No se encontraron imágenes');
      productData.needsManualReview = true;
    }

    console.log(`✅ Alibaba producto scrapeado:`);
    console.log(`   ID: ${productData.externalId}`);
    console.log(`   Nombre: ${productData.name}`);
    console.log(`   Precio: $${productData.supplierPrice}`);
    console.log(`   MOQ: ${productData.moq} unidades`);
    console.log(`   Rangos de precio: ${productData.priceRanges.length}`);
    console.log(`   Imágenes: ${productData.images.length}`);
    console.log(`   Proveedor: ${productData.supplierInfo.name}`);
    console.log(`   Variantes: ${productData.variants.length}`);

    return productData;

  } catch (error) {
    console.error('❌ Error scraping Alibaba:', error.message);

    return {
      externalId: null,
      name: 'Producto de Alibaba - Error al importar',
      description: 'No se pudo extraer la información. Por favor, revisa manualmente.',
      supplierPrice: 0,
      images: [],
      variants: [],
      specifications: {},
      shippingTime: '20-40 días hábiles',
      supplierUrl: url,
      platform: 'Alibaba',
      needsManualReview: true,
      moq: 1,
      priceRanges: [],
      supplierInfo: {},
      error: error.message
    };
  }
}

module.exports = {
  scrapeAlibabaProduct
};
