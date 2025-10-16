const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProducts() {
  try {
    const products = await prisma.product.findMany({
      include: {
        variants: true,
        category: true
      }
    });

    console.log('\n=== PRODUCTOS EN LA BASE DE DATOS ===\n');

    products.forEach(product => {
      console.log(`📦 ${product.name}`);
      console.log(`   - ID: ${product.id}`);
      console.log(`   - Precio Base: $${product.basePrice || 'NO DEFINIDO'}`);
      console.log(`   - Stock: ${product.stockCount}`);
      console.log(`   - En Stock: ${product.inStock ? 'SI' : 'NO'}`);
      console.log(`   - Variantes: ${product.variants.length}`);

      if (product.variants.length > 0) {
        product.variants.forEach(variant => {
          console.log(`      • ${variant.name}: $${variant.price} (Stock: ${variant.stockQuantity})`);
        });
      }
      console.log('');
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

checkProducts();
