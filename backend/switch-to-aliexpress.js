const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('🔄 CAMBIANDO PRODUCTO A ALIEXPRESS + DSERS\n');

    // 1. Actualizar o crear proveedor AliExpress
    const aliexpressSupplier = await prisma.supplier.upsert({
      where: { id: 'supplier_aliexpress' },
      update: {
        name: 'AliExpress',
        slug: 'aliexpress',
        website: 'https://www.aliexpress.com',
        isActive: true
      },
      create: {
        id: 'supplier_aliexpress',
        name: 'AliExpress',
        slug: 'aliexpress',
        website: 'https://www.aliexpress.com',
        averageShippingDays: '15-30',
        isActive: true,
        apiEnabled: false, // DSers no tiene API
        description: 'Proveedor AliExpress con gestión via DSers'
      }
    });

    console.log('✅ Proveedor AliExpress configurado');

    // 2. Cambiar producto actual a AliExpress
    const product = await prisma.product.update({
      where: { id: 'cmi8al17e0001uyd4xiimmzdj' },
      data: {
        supplier: {
          connect: { id: 'supplier_aliexpress' }
        }
      },
      include: {
        supplier: true
      }
    });

    console.log('✅ Producto actualizado:');
    console.log(`   Nombre: ${product.name}`);
    console.log(`   Supplier: ${product.supplier.name}`);
    console.log(`   Supplier URL: ${product.supplierUrl}`);

    console.log('\n🎉 ¡LISTO!');
    console.log('\n📝 Ahora cuando alguien compre:');
    console.log('   1. Se crea la orden automáticamente');
    console.log('   2. Sistema detecta que es AliExpress');
    console.log('   3. Prepara la información para DSers');
    console.log('   4. Puedes ver órdenes pendientes en: GET /api/dsers/pending');
    console.log('   5. Descargar CSV en: GET /api/dsers/csv');
    console.log('   6. Importar CSV en DSers');
    console.log('   7. Procesar órdenes con un click');

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
})();
