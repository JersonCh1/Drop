// Script para crear categorías de Tech Accessories
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTechCategories() {
  try {
    console.log('🔧 Creando categorías Tech Accessories...\n');

    const categories = [
      {
        name: 'Phone Accessories',
        slug: 'phone-accessories',
        description: 'Protectores de pantalla, cargadores, soportes y más accesorios para smartphones',
        sortOrder: 1
      },
      {
        name: 'Laptop & Tablet Protection',
        slug: 'laptop-tablet-protection',
        description: 'Fundas, protectores y accesorios para laptops y tablets',
        sortOrder: 2
      },
      {
        name: 'Audio Accessories',
        slug: 'audio-accessories',
        description: 'Fundas para AirPods, earbuds y accesorios de audio',
        sortOrder: 3
      },
      {
        name: 'Smartwatch Accessories',
        slug: 'smartwatch-accessories',
        description: 'Correas, protectores y cargadores para smartwatches',
        sortOrder: 4
      },
      {
        name: 'Gaming Accessories',
        slug: 'gaming-accessories',
        description: 'Protección y accesorios para controllers, consolas y gaming gear',
        sortOrder: 5
      },
      {
        name: 'Cable Management',
        slug: 'cable-management',
        description: 'Organizadores de cables y accesorios de carga',
        sortOrder: 6
      }
    ];

    for (const cat of categories) {
      const category = await prisma.category.upsert({
        where: { slug: cat.slug },
        update: {
          name: cat.name,
          description: cat.description,
          sortOrder: cat.sortOrder,
          isActive: true
        },
        create: {
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          sortOrder: cat.sortOrder,
          isActive: true
        }
      });

      console.log(`✅ ${category.name}`);
      console.log(`   Slug: ${category.slug}`);
      console.log(`   ID: ${category.id}\n`);
    }

    console.log('🎉 Todas las categorías creadas exitosamente!');

  } catch (error) {
    console.error('❌ Error creando categorías:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createTechCategories();
