const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const productId = 'cmi8al17e0001uyd4xiimmzdj';

    // Eliminar variantes anteriores
    await prisma.productVariant.deleteMany({
      where: { productId: productId }
    });
    console.log('✅ Variantes anteriores eliminadas');

    // Modelos de iPhone
    const phoneModels = [
      'iPhone 11',
      'iPhone 12',
      'iPhone 12 Pro',
      'iPhone 12 Pro Max',
      'iPhone 13',
      'iPhone 13 Pro',
      'iPhone 13 Pro Max',
      'iPhone 14',
      'iPhone 14 Plus',
      'iPhone 14 Pro',
      'iPhone 14 Pro Max',
      'iPhone 15',
      'iPhone 15 Plus',
      'iPhone 15 Pro',
      'iPhone 15 Pro Max',
      'iPhone 16',
      'iPhone 16 Plus',
      'iPhone 16 Pro',
      'iPhone 16 Pro Max',
      'iPhone 17',
      'iPhone 17 Pro',
      'iPhone 17 Pro Max'
    ];

    // Colores
    const colors = [
      { name: 'Transparente', code: 'transparent' },
      { name: 'Negro', code: 'black' },
      { name: 'Gris', code: 'grey' },
      { name: 'Morado', code: 'purple' }
    ];

    let count = 0;

    // Crear variante para cada combinación de modelo + color
    for (const model of phoneModels) {
      for (const color of colors) {
        await prisma.productVariant.create({
          data: {
            productId: productId,
            name: `${model} - ${color.name}`,
            color: color.name,
            material: model,
            price: 23.52,
            sku: `magsafe-${model.toLowerCase().replace(/\s+/g, '-')}-${color.code}`,
            stockQuantity: 50,
            isActive: true
          }
        });
        count++;
      }
    }

    console.log(`✅ ${count} variantes creadas (${phoneModels.length} modelos × ${colors.length} colores)`);
    console.log('\n🎉 ¡Producto completamente configurado!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
})();
