// Script para crear el supplier AliExpress en la base de datos
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createAliExpressSupplier() {
  try {
    console.log('🔧 Creando supplier AliExpress...');

    const supplier = await prisma.supplier.upsert({
      where: { slug: 'aliexpress' },
      update: {
        name: 'AliExpress',
        description: 'Marketplace global de productos tech y accesorios',
        website: 'https://www.aliexpress.com',
        apiEnabled: false, // Por ahora manual vía DSers
        averageShippingDays: '15-25',
        shippingCountries: JSON.stringify(['US', 'ES', 'PE', 'MX', 'CO', 'AR', 'CL', 'Worldwide']),
        defaultCommission: 5, // AliExpress toma ~5%
        defaultShippingCost: 0, // Generalmente envío gratis
        rating: 4.5,
        reliability: 85,
        isActive: true
      },
      create: {
        name: 'AliExpress',
        slug: 'aliexpress',
        description: 'Marketplace global de productos tech y accesorios con millones de productos disponibles',
        website: 'https://www.aliexpress.com',
        apiEnabled: false,
        averageShippingDays: '15-25',
        shippingCountries: JSON.stringify(['US', 'ES', 'PE', 'MX', 'CO', 'AR', 'CL', 'Worldwide']),
        defaultCommission: 5,
        defaultShippingCost: 0,
        rating: 4.5,
        reliability: 85,
        isActive: true
      }
    });

    console.log('✅ Supplier AliExpress creado:');
    console.log(`   ID: ${supplier.id}`);
    console.log(`   Nombre: ${supplier.name}`);
    console.log(`   Website: ${supplier.website}`);

    return supplier;

  } catch (error) {
    console.error('❌ Error creando supplier:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAliExpressSupplier();
