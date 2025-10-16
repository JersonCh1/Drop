// Script para verificar y activar productos
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAndActivateProducts() {
  try {
    console.log('🔍 Verificando productos...\n');

    // Obtener todos los productos
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        basePrice: true,
        stockCount: true
      }
    });

    console.log(`📦 Total de productos: ${products.length}\n`);

    // Contar activos e inactivos
    const activeCount = products.filter(p => p.isActive).length;
    const inactiveCount = products.filter(p => !p.isActive).length;

    console.log(`✅ Productos activos: ${activeCount}`);
    console.log(`❌ Productos inactivos: ${inactiveCount}\n`);

    if (inactiveCount > 0) {
      console.log('📋 Productos inactivos:');
      products.filter(p => !p.isActive).forEach(p => {
        console.log(`   - ${p.name} (${p.slug}) - Precio: $${parseFloat(p.basePrice)}, Stock: ${p.stockCount}`);
      });

      console.log('\n¿Deseas activar TODOS los productos inactivos? (y/n)');

      // Para ejecución automática, activar todos
      console.log('Activando todos los productos...\n');

      const result = await prisma.product.updateMany({
        where: { isActive: false },
        data: { isActive: true }
      });

      console.log(`✅ ${result.count} productos activados exitosamente!`);
    } else {
      console.log('✅ Todos los productos ya están activos!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndActivateProducts();
