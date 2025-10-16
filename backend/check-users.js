// Script para verificar usuarios en la base de datos
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  console.log('\n📋 Usuarios en la base de datos:\n');

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
    }
  });

  if (users.length === 0) {
    console.log('❌ No hay usuarios en la base de datos');
    console.log('\n💡 Ejecuta el seed: npx prisma migrate reset --force');
  } else {
    console.table(users);

    const admin = users.find(u => u.role === 'ADMIN');
    if (admin) {
      console.log('\n✅ Usuario ADMIN encontrado:');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Nombre: ${admin.firstName} ${admin.lastName}`);
      console.log('\n🔑 Password del seed: admin123');
    } else {
      console.log('\n⚠️  No hay usuario ADMIN en la base de datos');
    }
  }

  await prisma.$disconnect();
}

checkUsers().catch(console.error);
