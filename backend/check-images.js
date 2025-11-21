const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const product = await prisma.product.findFirst({
      where: { id: 'cmi8al17e0001uyd4xiimmzdj' },
      include: { images: true }
    });

    console.log('Total imágenes:', product.images.length);
    product.images.forEach((img, i) => {
      console.log(`Imagen ${i}:`, img.url.substring(0, 100));
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
})();
