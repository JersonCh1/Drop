// backend/src/utils/auto-fix-images.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Actualiza automáticamente imágenes rotas de Unsplash
 * Se ejecuta al iniciar el servidor
 */
async function autoFixImages() {
  try {
    // Verificar si hay imágenes de Unsplash rotas
    const brokenImages = await prisma.productImage.findMany({
      where: {
        url: {
          contains: 'unsplash.com'
        }
      },
      select: { id: true, url: true }
    });

    if (brokenImages.length === 0) {
      console.log('✅ No hay imágenes rotas de Unsplash');
      return;
    }

    console.log(`🔧 Encontradas ${brokenImages.length} imágenes de Unsplash, actualizando...`);

    // Mapa de URLs antiguas a nuevas
    const imageMapping = {
      'https://images.unsplash.com/photo-1592286927505-0b5fe0b5a7f3?w=800': 'https://placehold.co/800x800/e0e0e0/333?text=iPhone+15+Clear+Case',
      'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800': 'https://placehold.co/800x800/f0f0f0/333?text=Side+View',
      'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800': 'https://placehold.co/800x800/4a90e2/fff?text=iPhone+14+Silicone',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800': 'https://placehold.co/800x800/5a9ff2/fff?text=Back+View',
      'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800': 'https://placehold.co/800x800/8b6914/fff?text=iPhone+13+Leather',
      'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800': 'https://placehold.co/800x800/9b7924/fff?text=Leather+Detail',
      'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800': 'https://placehold.co/800x800/2c3e50/fff?text=iPhone+15+Pro+Rugged',
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800': 'https://placehold.co/800x800/ecf0f1/333?text=Screen+Protector',
      'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400': 'https://placehold.co/400x400/2c3e50/fff?text=Rugged+Case',
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400': 'https://placehold.co/400x400/e74c3c/fff?text=Premium+Case',
      'https://images.unsplash.com/photo-1519558260268-cde7e03a0152?w=400': 'https://placehold.co/400x400/3498db/fff?text=Slim+Case',
      'https://images.unsplash.com/photo-1590658165737-15a047b7a9de?w=400': 'https://placehold.co/400x400/2ecc71/fff?text=Wireless+Charger',
    };

    let updated = 0;

    for (const [oldUrl, newUrl] of Object.entries(imageMapping)) {
      const result = await prisma.productImage.updateMany({
        where: { url: oldUrl },
        data: { url: newUrl }
      });

      if (result.count > 0) {
        console.log(`   ✓ Actualizado: ${oldUrl.substring(45, 65)}... (${result.count} imagen(es))`);
        updated += result.count;
      }
    }

    console.log(`✅ Auto-fix completado: ${updated} imágenes actualizadas\n`);

  } catch (error) {
    console.error('❌ Error en auto-fix de imágenes:', error.message);
    // No lanzar error para no detener el inicio del servidor
  }
}

module.exports = { autoFixImages };
