// backend/migrar-colores-variantes.js
const { PrismaClient } = require('@prisma/client');
const { mapColor, improveVariantName } = require('./color-mapper');

const prisma = new PrismaClient();

async function migrateColors() {
  console.log('🔄 MIGRACIÓN DE COLORES Y NOMBRES DE VARIANTES\n');
  console.log('='.repeat(80));

  try {
    // Obtener todos los productos con sus variantes
    const products = await prisma.product.findMany({
      include: {
        variants: true
      }
    });

    console.log(`\n📦 Productos encontrados: ${products.length}`);

    let totalVariantsUpdated = 0;
    let totalColorsImproved = 0;
    let totalNamesImproved = 0;

    for (const product of products) {
      console.log(`\n${'─'.repeat(80)}`);
      console.log(`\n📦 Procesando: ${product.name}`);
      console.log(`   Variantes: ${product.variants.length}`);

      for (const variant of product.variants) {
        let needsUpdate = false;
        const updates = {};

        // 1. Mejorar color
        if (variant.color) {
          const mappedColor = mapColor(variant.color);
          if (mappedColor !== variant.color) {
            updates.color = mappedColor;
            needsUpdate = true;
            totalColorsImproved++;
            console.log(`   ✅ Color: "${variant.color}" → "${mappedColor}"`);
          }
        }

        // 2. Mejorar nombre de variante
        const improvedName = improveVariantName(
          variant.name,
          updates.color || variant.color,
          variant.material
        );

        if (improvedName !== variant.name) {
          updates.name = improvedName;
          needsUpdate = true;
          totalNamesImproved++;
          console.log(`   ✅ Nombre: "${variant.name}" → "${improvedName}"`);
        }

        // 3. Actualizar en BD si hay cambios
        if (needsUpdate) {
          await prisma.productVariant.update({
            where: { id: variant.id },
            data: updates
          });
          totalVariantsUpdated++;
        }
      }
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log('\n✅ MIGRACIÓN COMPLETADA\n');
    console.log(`📊 Resultados:`);
    console.log(`   - Variantes actualizadas: ${totalVariantsUpdated}`);
    console.log(`   - Colores mejorados: ${totalColorsImproved}`);
    console.log(`   - Nombres mejorados: ${totalNamesImproved}`);
    console.log(`\n🎉 ¡Todos los productos ahora tienen colores descriptivos!`);

  } catch (error) {
    console.error('\n❌ Error en migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar migración
migrateColors()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
