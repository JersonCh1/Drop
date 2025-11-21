const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const product = await prisma.product.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        variants: true,
        images: true
      }
    });
    console.log(JSON.stringify(product, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
})();
