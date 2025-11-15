// backend/init-admin.js
// Script para crear el usuario admin en producción
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔍 Verificando si existe usuario admin...');

    // Buscar usuario admin
    const existingAdmin = await prisma.user.findFirst({
      where: { email: 'admin@drop.com' }
    });

    if (existingAdmin) {
      console.log('✅ Usuario admin ya existe');
      console.log('Email:', existingAdmin.email);
      console.log('Rol:', existingAdmin.role);
      console.log('ID:', existingAdmin.id);

      // Verificar si la contraseña funciona
      const passwordMatch = await bcrypt.compare('admin123', existingAdmin.password || '');

      if (passwordMatch) {
        console.log('✅ Contraseña "admin123" es correcta');
      } else {
        console.log('⚠️  La contraseña actual NO es "admin123"');
        console.log('🔄 Actualizando contraseña...');

        const hashedPassword = await bcrypt.hash('admin123', 10);
        await prisma.user.update({
          where: { id: existingAdmin.id },
          data: { password: hashedPassword }
        });

        console.log('✅ Contraseña actualizada a "admin123"');
      }

      return;
    }

    console.log('📝 Creando usuario admin...');

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Crear usuario admin
    const admin = await prisma.user.create({
      data: {
        email: 'admin@drop.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'System',
        phone: '51987654321',
        role: 'ADMIN',
        isActive: true
      }
    });

    console.log('✅ Usuario admin creado exitosamente!');
    console.log('');
    console.log('📋 Credenciales de acceso:');
    console.log('   Email: admin@drop.com');
    console.log('   Contraseña: admin123');
    console.log('');
    console.log('🔗 URL Admin: https://drop-seven-pi.vercel.app/admin');
    console.log('');
    console.log('ID del usuario:', admin.id);

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
createAdmin()
  .then(() => {
    console.log('✅ Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
