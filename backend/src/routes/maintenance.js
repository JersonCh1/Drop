// backend/src/routes/maintenance.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * GET /api/maintenance/fix-images
 * Actualizar imágenes rotas de Unsplash a placeholders
 * Solo para uso administrativo
 */
router.get('/fix-images', async (req, res) => {
  try {
    console.log('🔧 Iniciando actualización de imágenes...');

    // Mapa de URLs antiguas (Unsplash rotas) a nuevas (placeholders)
    const imageMapping = {
      'https://images.unsplash.com/photo-1592286927505-0b5fe0b5a7f3?w=800': 'https://placehold.co/800x800/e0e0e0/333?text=iPhone+15+Clear+Case',
      'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800': 'https://placehold.co/800x800/f0f0f0/333?text=Side+View',
      'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800': 'https://placehold.co/800x800/4a90e2/fff?text=iPhone+14+Silicone',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800': 'https://placehold.co/800x800/5a9ff2/fff?text=Back+View',
      'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800': 'https://placehold.co/800x800/8b6914/fff?text=iPhone+13+Leather',
      'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800': 'https://placehold.co/800x800/9b7924/fff?text=Leather+Detail',
      'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800': 'https://placehold.co/800x800/2c3e50/fff?text=iPhone+15+Pro+Rugged',
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800': 'https://placehold.co/800x800/ecf0f1/333?text=Screen+Protector',
    };

    const updates = [];
    let totalUpdated = 0;

    for (const [oldUrl, newUrl] of Object.entries(imageMapping)) {
      const result = await prisma.productImage.updateMany({
        where: { url: oldUrl },
        data: { url: newUrl }
      });

      if (result.count > 0) {
        updates.push({
          oldUrl: oldUrl.substring(0, 60) + '...',
          newUrl: newUrl.substring(0, 60) + '...',
          count: result.count
        });
        totalUpdated += result.count;
      }
    }

    // Obtener resumen de imágenes actuales
    const allImages = await prisma.productImage.findMany({
      select: { url: true },
      distinct: ['url']
    });

    const unsplashImages = allImages.filter(img => img.url.includes('unsplash.com'));

    res.json({
      success: true,
      message: 'Imágenes actualizadas correctamente',
      data: {
        totalUpdated,
        updates,
        remaining: {
          total: allImages.length,
          unsplash: unsplashImages.length,
          fixed: allImages.length - unsplashImages.length
        }
      }
    });

  } catch (error) {
    console.error('❌ Error actualizando imágenes:', error);
    res.status(500).json({
      success: false,
      message: 'Error actualizando imágenes',
      error: error.message
    });
  }
});

module.exports = router;
