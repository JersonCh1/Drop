// Script para crear el proveedor CJ Dropshipping
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createCJSupplier() {
  try {
    // Verificar si ya existe
    const existing = await prisma.supplier.findFirst({
      where: {
        name: {
          contains: 'CJ',
          mode: 'insensitive'
        }
      }
    });

    if (existing) {
      console.log('✅ Proveedor CJ ya existe:', existing.name);
      console.log('   ID:', existing.id);
      console.log('   Slug:', existing.slug);
      await prisma.$disconnect();
      return;
    }

    // Crear el proveedor
    const supplier = await prisma.supplier.create({
      data: {
        name: 'CJ Dropshipping',
        slug: 'cj-dropshipping',
        contactEmail: 'support@cjdropshipping.com',
        website: 'https://cjdropshipping.com',
        isActive: true,
        description: 'Proveedor de dropshipping con envíos rápidos desde múltiples almacenes',
        shippingCountries: ['PE', 'US', 'CN', 'GB', 'AU'],
        averageShippingDays: 15,
        paymentTerms: 'Pago por orden',
        notes: 'Proveedor integrado con API automática. Autenticación configurada con email y API Key.'
      }
    });

    console.log('🎉 ¡Proveedor CJ Dropshipping creado exitosamente!');
    console.log('   ID:', supplier.id);
    console.log('   Nombre:', supplier.name);
    console.log('   Slug:', supplier.slug);
    console.log('   Website:', supplier.website);
    console.log('\n✅ Ahora puedes usar el importador CJ en el panel de admin');

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error creando proveedor CJ:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

createCJSupplier();
