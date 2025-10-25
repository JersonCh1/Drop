// Script para actualizar URLs de imágenes rotas en la base de datos
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixImages() {
  console.log('🔧 Actualizando imágenes rotas...\n');

  try {
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

    let updated = 0;

    for (const [oldUrl, newUrl] of Object.entries(imageMapping)) {
      const result = await prisma.productImage.updateMany({
        where: { url: oldUrl },
        data: { url: newUrl }
      });

      if (result.count > 0) {
        console.log(`✅ Actualizado: ${oldUrl.substring(0, 60)}... → ${result.count} imagen(es)`);
        updated += result.count;
      }
    }

    console.log(`\n✅ Total actualizado: ${updated} imágenes\n`);

    // Mostrar resumen de imágenes actuales
    const allImages = await prisma.productImage.findMany({
      select: { url: true },
      distinct: ['url']
    });

    console.log('📊 URLs únicas en la base de datos:');
    allImages.forEach(img => {
      const isUnsplash = img.url.includes('unsplash.com');
      const emoji = isUnsplash ? '⚠️' : '✅';
      console.log(`${emoji} ${img.url}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixImages();
