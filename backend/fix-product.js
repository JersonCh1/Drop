const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const productId = 'cmi8al17e0001uyd4xiimmzdj';

    // 1. Actualizar el producto con título mejorado
    await prisma.product.update({
      where: { id: productId },
      data: {
        name: 'Funda MagSafe Transparente iPhone 15/16/17 Pro Max',
        description: 'Funda transparente magnética de lujo compatible con MagSafe. Protección premium con carga inalámbrica. Compatible con iPhone 15, 16 y 17 Pro Max.',
        metaTitle: 'Funda MagSafe iPhone 17 Pro Max - Transparente Premium | CASEPRO',
        metaDescription: 'Funda MagSafe transparente para iPhone 17/16/15 Pro Max. Protección premium, carga inalámbrica, envío gratis. Compatible con todos los modelos Pro Max.'
      }
    });

    console.log('✅ Producto actualizado');

    // 2. Eliminar variante "Default"
    await prisma.productVariant.deleteMany({
      where: { productId: productId }
    });

    console.log('✅ Variante Default eliminada');

    // 3. Crear variantes de colores
    const colors = [
      { name: 'Transparente', color: 'Transparente', hex: '#FFFFFF' },
      { name: 'Negro', color: 'Negro', hex: '#000000' },
      { name: 'Gris', color: 'Gris', hex: '#808080' },
      { name: 'Morado', color: 'Morado', hex: '#9333EA' }
    ];

    for (const colorOption of colors) {
      await prisma.productVariant.create({
        data: {
          productId: productId,
          name: colorOption.name,
          color: colorOption.color,
          price: 23.52,
          sku: `magsafe-iphone-17-${colorOption.color.toLowerCase()}`,
          stockQuantity: 100,
          isActive: true
        }
      });
      console.log(`✅ Variante creada: ${colorOption.name}`);
    }

    console.log('\n🎉 ¡Producto arreglado completamente!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
})();
