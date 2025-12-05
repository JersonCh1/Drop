// backend/src/routes/aliexpress.js
const express = require('express');
const router = express.Router();
const aliexpressService = require('../services/aliexpressService');
const aliexpressPuppeteerService = require('../services/aliexpressPuppeteerService');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dropshipping-super-secret-key-2024';

/**
 * Middleware para verificar que el usuario es admin
 */
function verifyAdmin(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token requerido'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Solo administradores.'
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
}

/**
 * POST /api/aliexpress/extract - Extraer datos de producto desde URL
 * Usa Puppeteer (navegador real) para evitar bloqueos de AliExpress
 */
router.post('/extract', verifyAdmin, async (req, res) => {
  try {
    const { url, usePuppeteer = true } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL es requerida'
      });
    }

    console.log(`🔍 Extrayendo producto de AliExpress: ${url}`);
    console.log(`🤖 Método: ${usePuppeteer ? 'Puppeteer (navegador real)' : 'Axios (HTTP simple)'}`);

    // Usar Puppeteer por defecto (más confiable)
    const result = usePuppeteer
      ? await aliexpressPuppeteerService.getProductData(url)
      : await aliexpressService.getProductData(url);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || 'Error extrayendo datos del producto'
      });
    }

    res.json({
      success: true,
      product: result.product
    });

  } catch (error) {
    console.error('❌ Error en /extract:', error);
    res.status(500).json({
      success: false,
      message: 'Error extrayendo producto',
      error: error.message
    });
  }
});

/**
 * POST /api/aliexpress/import - Importar producto completo a la BD
 */
router.post('/import', verifyAdmin, async (req, res) => {
  try {
    const {
      url,
      categoryId,
      supplierPrice, // Precio manual del proveedor
      profitMargin = 400, // 400% = 5x markup por defecto
      isHeroBanner = false,
      isFeatured = false
    } = req.body;

    if (!url || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'URL y categoryId son requeridos'
      });
    }

    if (!supplierPrice || supplierPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Precio del proveedor es requerido'
      });
    }

    console.log(`📦 Importando producto de AliExpress...`);
    console.log(`📍 URL: ${url}`);
    console.log(`📁 Categoría ID: ${categoryId}`);
    console.log(`💵 Precio proveedor: ${supplierPrice}`);
    console.log(`📈 Margen de ganancia: ${profitMargin}%`);

    // 1. Extraer datos del producto usando Puppeteer (más confiable)
    console.log(`🔄 Iniciando extracción con Puppeteer...`);

    let extractResult;
    try {
      // Timeout de 25 segundos para evitar que Railway corte a los 30
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout de 25 segundos excedido')), 25000)
      );

      extractResult = await Promise.race([
        aliexpressPuppeteerService.getProductData(url),
        timeoutPromise
      ]);
    } catch (timeoutError) {
      console.error(`⏰ Timeout:`, timeoutError.message);
      return res.status(408).json({
        success: false,
        message: 'La extracción tardó demasiado. AliExpress puede estar lento. Intenta de nuevo.'
      });
    }

    if (!extractResult.success) {
      console.error(`❌ Error en extracción:`, extractResult.error);
      return res.status(400).json({
        success: false,
        message: extractResult.error || 'Error extrayendo producto'
      });
    }

    const productData = extractResult.product;
    console.log(`✅ Producto extraído: ${productData.name}`);

    // 2. Calcular precio de venta con el precio manual
    const finalSupplierPrice = parseFloat(supplierPrice);
    const salePrice = finalSupplierPrice * (1 + profitMargin / 100);

    // 3. Crear slug (más corto para evitar problemas con SKUs)
    let baseSlug = productData.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 40); // Reducido a 40 para dejar espacio al timestamp

    // Agregar timestamp para garantizar unicidad
    const timestamp = Date.now().toString().slice(-6);
    const slug = `${baseSlug}-${timestamp}`;

    console.log(`📝 Slug generado: ${slug}`);

    // 4. Obtener supplier de AliExpress
    let supplier = await prisma.supplier.findUnique({
      where: { slug: 'aliexpress' }
    });

    if (!supplier) {
      return res.status(400).json({
        success: false,
        message: 'Proveedor AliExpress no configurado. Ejecuta create-aliexpress-supplier.js primero.'
      });
    }

    // 5. Crear producto en la BD
    console.log(`💾 Creando producto en BD...`);
    console.log(`   - Imágenes: ${productData.images.length}`);
    console.log(`   - Variantes: ${productData.variants.length}`);

    // Generar timestamp único para SKUs (diferente al del slug)
    const skuTimestamp = (Date.now() + 1).toString().slice(-6); // Últimos 6 dígitos

    const product = await prisma.product.create({
      data: {
        name: productData.name,
        slug: slug,
        description: productData.description || `${productData.name} - Protección profesional de CASEPRO`,
        basePrice: parseFloat(salePrice.toFixed(2)),
        categoryId: categoryId,
        supplierId: supplier.id,
        supplierProductId: productData.productId,
        supplierUrl: url,
        supplierPrice: finalSupplierPrice,
        profitMargin: profitMargin,
        shippingTime: productData.shipping.estimatedDays || '15-30 días',
        isActive: true,
        isFeatured: isFeatured,
        isHeroBanner: isHeroBanner,
        inStock: true,
        stockCount: 999,
        importedAt: new Date(),
        lastSyncedAt: new Date(),

        // Crear imágenes
        images: {
          create: productData.images.slice(0, 6).map((imageUrl, index) => ({
            url: imageUrl.startsWith('//') ? `https:${imageUrl}` : imageUrl,
            isMain: index === 0,
            position: index
          }))
        },

        // Crear variante por defecto o múltiples si existen
        variants: {
          create: productData.variants.length > 0
            ? (() => {
                // Separar colores, modelos y otras propiedades de las variantes
                const colors = [];
                const models = [];
                const otherProperties = new Map(); // Para propiedades como "Size", "Style", etc.

                productData.variants.forEach(variant => {
                  if (!variant.name.includes(':')) return;

                  const [property, value] = variant.name.split(':').map(s => s.trim());
                  const propertyLower = property.toLowerCase();

                  if (propertyLower.includes('color') || propertyLower.includes('colour')) {
                    if (!colors.includes(value)) {
                      colors.push(value);
                    }
                  } else if (propertyLower.includes('modelo') || propertyLower.includes('model') ||
                             propertyLower.includes('phone') || propertyLower.includes('teléfono') ||
                             propertyLower.includes('compatible')) {
                    // Limpiar texto del modelo
                    const cleanModel = value
                      .replace(/^Para\s+/i, '')
                      .replace(/^For\s+/i, '')
                      .trim();
                    if (!models.includes(cleanModel)) {
                      models.push(cleanModel);
                    }
                  } else {
                    // Otras propiedades (Size, Style, etc.)
                    if (!otherProperties.has(property)) {
                      otherProperties.set(property, []);
                    }
                    if (!otherProperties.get(property).includes(value)) {
                      otherProperties.get(property).push(value);
                    }
                  }
                });

                console.log(`   📊 Propiedades encontradas:`);
                console.log(`      - Colores: ${colors.length} (${colors.join(', ')})`);
                console.log(`      - Modelos: ${models.length} (${models.join(', ')})`);
                if (otherProperties.size > 0) {
                  otherProperties.forEach((values, key) => {
                    console.log(`      - ${key}: ${values.length} (${values.join(', ')})`);
                  });
                }

                // Si tenemos ambos (colores y modelos), crear combinaciones
                if (colors.length > 0 && models.length > 0) {
                  const combinations = [];
                  let skuIndex = 1;

                  models.forEach(model => {
                    colors.forEach(color => {
                      combinations.push({
                        name: `${model} - ${color}`,
                        price: parseFloat(salePrice.toFixed(2)),
                        sku: `${slug}-${skuTimestamp}-${skuIndex++}`,
                        stockQuantity: 100,
                        supplierProductId: null,
                        isActive: true,
                        color: color,
                        material: model
                      });
                    });
                  });

                  console.log(`   ✅ Creadas ${combinations.length} combinaciones (${models.length} modelos × ${colors.length} colores)`);
                  return combinations;
                }

                // Si solo tenemos modelos, crear variante por modelo con nombre limpio
                if (models.length > 0 && colors.length === 0) {
                  const modelVariants = models.map((model, index) => ({
                    name: model,
                    price: parseFloat(salePrice.toFixed(2)),
                    sku: `${slug}-${skuTimestamp}-${index + 1}`,
                    stockQuantity: 100,
                    supplierProductId: null,
                    isActive: true,
                    color: null,
                    material: model
                  }));

                  console.log(`   ✅ Creadas ${modelVariants.length} variantes de modelo`);
                  return modelVariants;
                }

                // Si solo tenemos colores, crear variante por color
                if (colors.length > 0 && models.length === 0) {
                  const colorVariants = colors.map((color, index) => ({
                    name: color,
                    price: parseFloat(salePrice.toFixed(2)),
                    sku: `${slug}-${skuTimestamp}-${index + 1}`,
                    stockQuantity: 100,
                    supplierProductId: null,
                    isActive: true,
                    color: color,
                    material: null
                  }));

                  console.log(`   ✅ Creadas ${colorVariants.length} variantes de color`);
                  return colorVariants;
                }

                // Si solo hay una dimensión no estándar, crear variantes simples
                const simpleVariants = productData.variants.slice(0, 30).map((variant, index) => {
                  const variantData = {
                    name: variant.name,
                    price: parseFloat(salePrice.toFixed(2)),
                    sku: `${slug}-${skuTimestamp}-${index + 1}`,
                    stockQuantity: 100,
                    supplierProductId: variant.skuId?.toString(),
                    isActive: true,
                    color: null,
                    material: null
                  };

                  if (variant.name.includes(':')) {
                    const [property, value] = variant.name.split(':').map(s => s.trim());
                    const propertyLower = property.toLowerCase();

                    if (propertyLower.includes('color')) {
                      variantData.color = value;
                    } else if (propertyLower.includes('modelo') || propertyLower.includes('model')) {
                      variantData.material = value.replace(/^Para\s+/i, '').replace(/^For\s+/i, '').trim();
                    }
                  }

                  return variantData;
                });

                console.log(`   ✅ Creadas ${simpleVariants.length} variantes simples`);
                return simpleVariants;
              })()
            : [{
                name: 'Default',
                price: parseFloat(salePrice.toFixed(2)),
                sku: `${slug}-${skuTimestamp}-default`,
                stockQuantity: 100,
                isActive: true
              }]
        }
      },
      include: {
        images: true,
        variants: true,
        category: true,
        supplier: true
      }
    });

    console.log(`✅ Producto importado: ${product.name}`);

    res.json({
      success: true,
      message: 'Producto importado exitosamente',
      product: product
    });

  } catch (error) {
    console.error('❌ Error en /import:', error);
    console.error('Stack:', error.stack);

    // Mensaje más específico según el tipo de error
    let errorMessage = 'Error importando producto';
    let statusCode = 500;

    if (error.message.includes('navegador') || error.message.includes('Chromium')) {
      errorMessage = 'Error con el navegador. El servidor está configurando Chromium. Intenta en 1 minuto.';
      statusCode = 503;
    } else if (error.message.includes('timeout') || error.message.includes('Timeout')) {
      errorMessage = 'La importación tardó demasiado. AliExpress puede estar lento. Intenta de nuevo.';
      statusCode = 408;
    } else if (error.message.includes('Proveedor AliExpress no configurado')) {
      errorMessage = error.message;
      statusCode = 400;
    } else {
      errorMessage = `Error: ${error.message}`;
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * POST /api/aliexpress/calculate-shipping - Calcular envío
 */
router.post('/calculate-shipping', async (req, res) => {
  try {
    const { productId, country = 'ES', quantity = 1 } = req.body;

    const result = await aliexpressService.calculateShipping(productId, country, quantity);

    res.json(result);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error calculando envío',
      error: error.message
    });
  }
});

/**
 * POST /api/aliexpress/create-order - Crear orden en DSers/AliExpress
 */
router.post('/create-order', verifyAdmin, async (req, res) => {
  try {
    const orderData = req.body;

    const result = await aliexpressService.createOrder(orderData);

    res.json(result);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creando orden',
      error: error.message
    });
  }
});

/**
 * GET /api/aliexpress/pending-orders-csv - Generar CSV de órdenes pendientes para DSers
 */
router.get('/pending-orders-csv', verifyAdmin, async (req, res) => {
  try {
    // Obtener órdenes pendientes con productos de AliExpress
    const orders = await prisma.order.findMany({
      where: {
        status: { in: ['PENDING', 'CONFIRMED'] },
        items: {
          some: {
            product: {
              supplier: {
                slug: 'aliexpress'
              }
            }
          }
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Convertir a formato DSers
    const dsersOrders = [];

    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.product.supplierUrl) {
          dsersOrders.push({
            orderNumber: order.orderNumber,
            productUrl: item.product.supplierUrl,
            quantity: item.quantity,
            variantId: item.product.supplierProductId || '',
            customerName: `${order.customerFirstName} ${order.customerLastName}`,
            customerEmail: order.customerEmail,
            customerPhone: order.customerPhone || '',
            shippingAddress: order.shippingAddress,
            shippingCity: order.shippingCity,
            shippingState: order.shippingState || '',
            shippingPostalCode: order.shippingPostalCode,
            shippingCountry: order.shippingCountry,
            notes: order.notes || ''
          });
        }
      });
    });

    const csv = aliexpressService.generateDSersCSV(dsersOrders);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="dsers-orders-${Date.now()}.csv"`);
    res.send(csv);

  } catch (error) {
    console.error('Error generando CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Error generando CSV',
      error: error.message
    });
  }
});

module.exports = router;
