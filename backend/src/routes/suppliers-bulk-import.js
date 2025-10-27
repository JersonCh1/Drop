// backend/src/routes/suppliers-bulk-import.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const { parseProductUrl, createProductFromImport, validateImportedProduct } = require('../services/productImporter');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dropshipping-super-secret-key-2024';

// Middleware para verificar admin
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
        message: 'Acceso denegado. Se requieren permisos de administrador.'
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
 * POST /api/suppliers/bulk-import - Importar múltiples productos a la vez
 * Body: { urls: string[], supplierId?: string, categoryId?: string, profitMargin?: number }
 */
router.post('/bulk-import', verifyAdmin, async (req, res) => {
  try {
    const { urls, supplierId, categoryId, profitMargin = 40 } = req.body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un array de URLs'
      });
    }

    if (urls.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Máximo 50 productos por lote'
      });
    }

    console.log(`📦 Importando ${urls.length} productos en lote...`);

    const results = {
      total: urls.length,
      successful: 0,
      failed: 0,
      products: []
    };

    // Procesar cada URL
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i].trim();

      try {
        console.log(`\n[${i + 1}/${urls.length}] Importando: ${url}`);

        // Parsear producto
        const productData = await parseProductUrl(url);

        // Validar
        const validation = validateImportedProduct(productData);

        if (!validation.isValid) {
          results.failed++;
          results.products.push({
            url,
            success: false,
            error: 'Validación fallida: ' + validation.errors.join(', '),
            productData: null
          });
          continue;
        }

        // Crear producto en BD
        const product = await createProductFromImport(productData, {
          categoryId,
          supplierId,
          profitMargin,
          autoCalculatePrice: true
        });

        // Guardar en la BD
        const savedProduct = await prisma.product.create({
          data: {
            name: product.name,
            description: product.description,
            basePrice: product.price,
            supplierPrice: product.supplierPrice,
            images: product.images,
            supplier: productData.platform,
            supplierUrl: url,
            category: categoryId || 'iPhone Cases',
            inStock: true,
            isActive: true,
            externalId: productData.externalId
          }
        });

        results.successful++;
        results.products.push({
          url,
          success: true,
          productId: savedProduct.id,
          productName: savedProduct.name,
          price: savedProduct.basePrice,
          productData: savedProduct
        });

        console.log(`✅ [${i + 1}/${urls.length}] Importado: ${savedProduct.name}`);

        // Pequeña pausa para no sobrecargar los servidores externos
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`❌ [${i + 1}/${urls.length}] Error:`, error.message);

        results.failed++;
        results.products.push({
          url,
          success: false,
          error: error.message,
          productData: null
        });
      }
    }

    console.log(`\n✅ Importación en lote completada:`);
    console.log(`   Total: ${results.total}`);
    console.log(`   Exitosos: ${results.successful}`);
    console.log(`   Fallidos: ${results.failed}`);

    res.json({
      success: true,
      message: `Importación completada: ${results.successful}/${results.total} productos importados exitosamente`,
      data: results
    });

  } catch (error) {
    console.error('❌ Error en importación masiva:', error);
    res.status(500).json({
      success: false,
      message: 'Error en importación masiva',
      error: error.message
    });
  }
});

/**
 * POST /api/suppliers/sync-prices-auto - Sincronizar precios automáticamente
 */
router.post('/sync-prices-auto', verifyAdmin, async (req, res) => {
  try {
    console.log('🔄 Iniciando sincronización automática de precios...');

    // Obtener productos con supplierUrl
    const products = await prisma.product.findMany({
      where: {
        supplierUrl: { not: null },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        supplierUrl: true,
        supplierPrice: true,
        basePrice: true
      },
      take: 100 // Limitar a 100 productos por ejecución
    });

    console.log(`📊 Sincronizando ${products.length} productos...`);

    const results = {
      total: products.length,
      updated: 0,
      unchanged: 0,
      errors: 0,
      changes: []
    };

    for (const product of products) {
      try {
        // Parsear producto nuevamente
        const productData = await parseProductUrl(product.supplierUrl);

        const newPrice = productData.supplierPrice;
        const oldPrice = parseFloat(product.supplierPrice);

        if (newPrice !== oldPrice && newPrice > 0) {
          // Calcular nuevo precio de venta manteniendo el margen
          const margin = (parseFloat(product.basePrice) - oldPrice) / oldPrice;
          const newSalePrice = newPrice * (1 + margin);

          // Actualizar
          await prisma.product.update({
            where: { id: product.id },
            data: {
              supplierPrice: newPrice,
              basePrice: newSalePrice
            }
          });

          results.updated++;
          results.changes.push({
            productId: product.id,
            productName: product.name,
            oldPrice,
            newPrice,
            change: ((newPrice - oldPrice) / oldPrice * 100).toFixed(2) + '%'
          });

          console.log(`✅ Actualizado: ${product.name} - $${oldPrice} → $${newPrice}`);
        } else {
          results.unchanged++;
        }

        // Pausa entre requests
        await new Promise(resolve => setTimeout(resolve, 3000));

      } catch (error) {
        console.error(`❌ Error sincronizando ${product.name}:`, error.message);
        results.errors++;
      }
    }

    console.log(`\n✅ Sincronización completada:`);
    console.log(`   Total: ${results.total}`);
    console.log(`   Actualizados: ${results.updated}`);
    console.log(`   Sin cambios: ${results.unchanged}`);
    console.log(`   Errores: ${results.errors}`);

    res.json({
      success: true,
      message: `Sincronización completada: ${results.updated} precios actualizados`,
      data: results
    });

  } catch (error) {
    console.error('❌ Error en sincronización automática:', error);
    res.status(500).json({
      success: false,
      message: 'Error en sincronización automática',
      error: error.message
    });
  }
});

module.exports = router;
