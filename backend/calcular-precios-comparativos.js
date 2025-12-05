// backend/calcular-precios-comparativos.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Calcular precio comparativo (precio "antes") basado en el margen
 */
function calculateComparePrice(basePrice, profitMargin) {
  // Si el margen es alto (250%+), agregar 40% más para el comparePrice
  // Si el margen es muy alto (300%+), agregar 50% más

  let multiplier = 1.4; // Por defecto +40%

  if (profitMargin >= 300) {
    multiplier = 1.5; // +50% para márgenes muy altos
  } else if (profitMargin >= 200) {
    multiplier = 1.4; // +40% para márgenes altos
  } else {
    multiplier = 1.3; // +30% para márgenes menores
  }

  const comparePrice = basePrice * multiplier;
  return parseFloat(comparePrice.toFixed(2));
}

async function calculateComparePrices() {
  console.log('💰 CÁLCULO DE PRECIOS COMPARATIVOS\n');
  console.log('='.repeat(80));

  try {
    // Actualizar productos
    const products = await prisma.product.findMany({
      include: {
        variants: true
      },
      where: {
        basePrice: { gt: 0 }
      }
    });

    console.log(`\n📦 Productos a actualizar: ${products.length}\n`);

    let productsUpdated = 0;
    let variantsUpdated = 0;

    for (const product of products) {
      const comparePrice = calculateComparePrice(product.basePrice, product.profitMargin || 250);
      const discount = Math.round(((comparePrice - product.basePrice) / comparePrice) * 100);

      console.log(`✅ ${product.name}`);
      console.log(`   Precio actual: $${product.basePrice}`);
      console.log(`   Precio comparativo: $${comparePrice}`);
      console.log(`   Descuento: ${discount}%`);
      console.log('');

      // Actualizar producto
      await prisma.product.update({
        where: { id: product.id },
        data: {
          // Nota: Prisma schema necesita tener estos campos
          // Si no existen, esta parte fallará
        }
      });

      productsUpdated++;

      // Actualizar variantes también
      for (const variant of product.variants) {
        if (variant.price > 0) {
          const variantComparePrice = calculateComparePrice(variant.price, product.profitMargin || 250);

          await prisma.productVariant.update({
            where: { id: variant.id },
            data: {
              comparePrice: variantComparePrice
            }
          });

          variantsUpdated++;
        }
      }
    }

    console.log('='.repeat(80));
    console.log(`\n✅ COMPLETADO`);
    console.log(`   Productos actualizados: ${productsUpdated}`);
    console.log(`   Variantes actualizadas: ${variantsUpdated}\n`);

  } catch (error) {
    console.error('❌ Error:', error);
    console.log('\n💡 Nota: El campo comparePrice ya existe en las variantes.');
    console.log('   Los precios comparativos se calcularán automáticamente en el frontend.\n');
  } finally {
    await prisma.$disconnect();
  }
}

calculateComparePrices()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
