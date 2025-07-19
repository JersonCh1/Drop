const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:123456@host.docker.internal:5432/dropshipping_db'
    }
  }
});

async function testPrisma() {
  try {
    await prisma.$connect();
    console.log('✅ Prisma se conectó exitosamente con host.docker.internal');
    
    const result = await prisma.$queryRaw`SELECT NOW() as current_time`;
    console.log('Tiempo actual:', result[0].current_time);
    
  } catch (error) {
    console.error('❌ Error de Prisma:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testPrisma();