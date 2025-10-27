// backend/src/services/scrapers/amazonScraper.js
const axios = require('axios');
const cheerio = require('cheerio');

/**
 * 🛒 SCRAPER COMPLETO DE AMAZON
 *
 * Extrae información completa de productos de Amazon:
 * - Título
 * - Precio (múltiples variantes)
 * - Imágenes de alta resolución
 * - Descripción y características
 * - Variantes (tallas, colores)
 * - Ratings y reviews
 * - Disponibilidad
 */

const AMAZON_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none'
};

async function scrapeAmazonProduct(url) {
  try {
    console.log(`🛒 Scraping Amazon: ${url}`);

    // Extraer ASIN (Amazon Standard Identification Number)
    const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/) ||
                      url.match(/\/gp\/product\/([A-Z0-9]{10})/);
    const asin = asinMatch ? asinMatch[1] : null;

    // Construir URL limpia
    const cleanUrl = asin ? `https://www.amazon.com/dp/${asin}` : url;

    // Hacer request
    const response = await axios.get(cleanUrl, {
      headers: AMAZON_HEADERS,
      timeout: 20000,
      maxRedirects: 5
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const productData = {
      externalId: asin,
      name: '',
      description: '',
      supplierPrice: 0,
      images: [],
      variants: [],
      specifications: {},
      shippingTime: '3-7 días hábiles',
      supplierUrl: cleanUrl,
      platform: 'Amazon',
      needsManualReview: false,
      rating: 0,
      reviewsCount: 0,
      inStock: true,
      rawData: {}
    };

    // 1. TÍTULO
    const titleSelectors = [
      '#productTitle',
      '#title',
      'h1.a-size-large',
      '[data-feature-name="title"] h1'
    ];

    for (const selector of titleSelectors) {
      const title = $(selector).first().text().trim();
      if (title) {
        productData.name = title;
        break;
      }
    }

    // 2. PRECIO - Amazon tiene múltiples formatos
    const priceSelectors = [
      '.a-price .a-offscreen',
      '#priceblock_ourprice',
      '#priceblock_dealprice',
      '.a-price-whole',
      'span.priceToPay',
      '#corePrice_feature_div .a-price .a-offscreen'
    ];

    for (const selector of priceSelectors) {
      const priceText = $(selector).first().text().trim();
      const priceMatch = priceText.match(/\$?([\d,]+\.?\d*)/);
      if (priceMatch) {
        productData.supplierPrice = parseFloat(priceMatch[1].replace(',', ''));
        break;
      }
    }

    // 3. IMÁGENES - Amazon almacena URLs en JavaScript
    const imageData = html.match(/'colorImages':\s*{\s*'initial':\s*(\[[\s\S]*?\])/);
    if (imageData) {
      try {
        const images = JSON.parse(imageData[1]);
        productData.images = images
          .map(img => img.hiRes || img.large || img.main || img.thumb)
          .filter(Boolean)
          .slice(0, 20); // Hasta 20 imágenes
      } catch (e) {
        console.log('⚠️ Error parseando imágenes de JSON');
      }
    }

    // Fallback: buscar imágenes en HTML
    if (productData.images.length === 0) {
      const imageSelectors = [
        '#landingImage',
        '#imgTagWrapperId img',
        '.imageThumbnail img'
      ];

      const foundImages = new Set();

      for (const selector of imageSelectors) {
        $(selector).each((i, img) => {
          let imgSrc = $(img).attr('data-old-hires') ||
                       $(img).attr('data-a-dynamic-image') ||
                       $(img).attr('src');

          if (imgSrc) {
            // Si es data-a-dynamic-image, parsear JSON
            if (imgSrc.startsWith('{')) {
              try {
                const imgObj = JSON.parse(imgSrc);
                const urls = Object.keys(imgObj);
                foundImages.add(urls[0]);
              } catch (e) {}
            } else {
              // Mejorar calidad de imagen
              imgSrc = imgSrc.replace(/\._[A-Z]{2}\d+_./, '.');
              foundImages.add(imgSrc);
            }
          }
        });
      }

      productData.images = Array.from(foundImages).slice(0, 20);
    }

    // 4. DESCRIPCIÓN
    const descriptionSelectors = [
      '#feature-bullets ul li',
      '#productDescription p',
      '.a-unordered-list.a-vertical li'
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
                             `Producto importado de Amazon: ${productData.name}`;

    // 5. VARIANTES (colores, tallas, etc.)
    $('#twisterContainer .swatchSelect option').each((i, option) => {
      const $option = $(option);
      const text = $option.text().trim();
      const value = $option.attr('value');

      if (text && value && text !== 'Select') {
        productData.variants.push({
          name: text,
          asin: value,
          available: !$option.attr('disabled')
        });
      }
    });

    // 6. ESPECIFICACIONES TÉCNICAS
    $('#productDetails_techSpec_section_1 tr').each((i, row) => {
      const $row = $(row);
      const key = $row.find('th').text().trim();
      const value = $row.find('td').text().trim();

      if (key && value) {
        productData.specifications[key] = value;
      }
    });

    // 7. RATING Y REVIEWS
    const ratingText = $('#acrPopover').attr('title') ||
                       $('.a-icon-alt').first().text();
    const ratingMatch = ratingText?.match(/([\d.]+)\s*out of/i);
    if (ratingMatch) {
      productData.rating = parseFloat(ratingMatch[1]);
    }

    const reviewsText = $('#acrCustomerReviewText').text();
    const reviewsMatch = reviewsText.match(/([\d,]+)/);
    if (reviewsMatch) {
      productData.reviewsCount = parseInt(reviewsMatch[1].replace(',', ''));
    }

    // 8. DISPONIBILIDAD
    const availabilityText = $('#availability span').text().toLowerCase();
    productData.inStock = !availabilityText.includes('out of stock') &&
                          !availabilityText.includes('unavailable');

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

    console.log(`✅ Amazon producto scrapeado:`);
    console.log(`   ASIN: ${productData.externalId}`);
    console.log(`   Nombre: ${productData.name}`);
    console.log(`   Precio: $${productData.supplierPrice}`);
    console.log(`   Imágenes: ${productData.images.length}`);
    console.log(`   Rating: ${productData.rating}/5 (${productData.reviewsCount} reviews)`);
    console.log(`   Variantes: ${productData.variants.length}`);
    console.log(`   En stock: ${productData.inStock ? 'Sí' : 'No'}`);

    return productData;

  } catch (error) {
    console.error('❌ Error scraping Amazon:', error.message);

    return {
      externalId: null,
      name: 'Producto de Amazon - Error al importar',
      description: 'No se pudo extraer la información. Por favor, revisa manualmente.',
      supplierPrice: 0,
      images: [],
      variants: [],
      specifications: {},
      shippingTime: '3-7 días hábiles',
      supplierUrl: url,
      platform: 'Amazon',
      needsManualReview: true,
      error: error.message
    };
  }
}

module.exports = {
  scrapeAmazonProduct
};
