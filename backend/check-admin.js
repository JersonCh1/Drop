const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    console.log('Admin user:', JSON.stringify(admin, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
})();
