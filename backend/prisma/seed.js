// backend/prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de base de datos...\n');

  // 1. Crear categorías
  console.log('📦 Creando categorías...');
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'carcasas-iphone' },
      update: {},
      create: {
        id: 'cat_iphone_cases',
        name: 'Carcasas iPhone',
        slug: 'carcasas-iphone',
        description: 'Carcasas y fundas para todos los modelos de iPhone',
        isActive: true,
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'fundas-iphone' },
      update: {},
      create: {
        id: 'cat_carcasas',
        name: 'Fundas iPhone',
        slug: 'fundas-iphone',
        description: 'Fundas y cases para iPhone',
        isActive: true,
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'protectores-pantalla' },
      update: {},
      create: {
        id: 'cat_protectores',
        name: 'Protectores de Pantalla',
        slug: 'protectores-pantalla',
        description: 'Protectores de cristal templado',
        isActive: true,
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'accesorios' },
      update: {},
      create: {
        id: 'cat_accesorios',
        name: 'Accesorios',
        slug: 'accesorios',
        description: 'Cables, cargadores y más',
        isActive: true,
        sortOrder: 3,
      },
    }),
  ]);
  console.log(`✅ ${categories.length} categorías creadas\n`);

  // 2. Crear proveedores (DROPSHIPPING)
  console.log('🏪 Creando proveedores...');

  const aliexpress = await prisma.supplier.upsert({
    where: { slug: 'aliexpress' },
    update: {},
    create: {
      id: 'supplier_aliexpress',
      name: 'AliExpress',
      slug: 'aliexpress',
      description: 'Proveedor principal de productos desde China',
      website: 'https://www.aliexpress.com',
      apiEnabled: false,
      averageShippingDays: '15-30',
      shippingCountries: JSON.stringify(['PE', 'US', 'ES', 'MX', 'AR', 'CL', 'CO']),
      defaultCommission: 0,
      defaultShippingCost: 3.50,
      rating: 4.5,
      reliability: 85,
      contactEmail: null,
      contactPhone: null,
      isActive: true,
    },
  });

  const cjdropshipping = await prisma.supplier.upsert({
    where: { slug: 'cjdropshipping' },
    update: {},
    create: {
      id: 'supplier_cj',
      name: 'CJ Dropshipping',
      slug: 'cjdropshipping',
      description: 'Servicio profesional de dropshipping con almacenes globales',
      website: 'https://www.cjdropshipping.com',
      apiEnabled: false,
      averageShippingDays: '10-20',
      shippingCountries: JSON.stringify(['PE', 'US', 'ES', 'MX', 'AR', 'CL', 'CO', 'BR']),
      defaultCommission: 0,
      defaultShippingCost: 5.00,
      rating: 4.7,
      reliability: 92,
      contactEmail: 'support@cjdropshipping.com',
      contactPhone: null,
      isActive: true,
    },
  });

  const alibaba = await prisma.supplier.upsert({
    where: { slug: 'alibaba' },
    update: {},
    create: {
      id: 'supplier_alibaba',
      name: 'Alibaba',
      slug: 'alibaba',
      description: 'Mayorista B2B para pedidos al por mayor',
      website: 'https://www.alibaba.com',
      apiEnabled: false,
      averageShippingDays: '20-35',
      shippingCountries: JSON.stringify(['PE', 'US', 'ES', 'MX', 'AR', 'CL', 'CO']),
      defaultCommission: 0,
      defaultShippingCost: 8.00,
      rating: 4.3,
      reliability: 80,
      contactEmail: null,
      contactPhone: null,
      isActive: true,
    },
  });

  console.log('✅ 3 proveedores creados\n');

  // 3. Crear productos
  console.log('📱 Creando productos...');

  const product1 = await prisma.product.upsert({
    where: { slug: 'carcasa-transparente-iphone-15' },
    update: {},
    create: {
      id: 'prod_case_iphone15_trans',
      name: 'Carcasa Transparente iPhone 15',
      slug: 'carcasa-transparente-iphone-15',
      description: 'Carcasa ultra delgada y resistente. Protección completa sin sacrificar estilo. Material TPU de alta calidad con bordes reforzados.',
      basePrice: 29.99,
      categoryId: 'cat_iphone_cases',
      brand: 'ProCase',
      model: 'iPhone 15',
      compatibility: JSON.stringify(['iPhone 15', 'iPhone 15 Plus']),
      // DROPSHIPPING INFO
      supplierId: 'supplier_aliexpress',
      supplierProductId: '1005005678901234',
      supplierUrl: 'https://www.aliexpress.com/item/1005005678901234.html',
      supplierPrice: 8.99,
      profitMargin: 233,
      shippingTime: '15-30 días hábiles',
      importedAt: new Date(),
      lastSyncedAt: new Date(),
      isActive: true,
      isFeatured: true,
      inStock: true,
      stockCount: 999,
    },
  });

  const product2 = await prisma.product.upsert({
    where: { slug: 'carcasa-silicona-iphone-14' },
    update: {},
    create: {
      id: 'prod_case_iphone14_silicone',
      name: 'Carcasa de Silicona iPhone 14',
      slug: 'carcasa-silicona-iphone-14',
      description: 'Carcasa de silicona premium con tacto suave. Protección contra golpes y caídas. Disponible en múltiples colores vibrantes.',
      basePrice: 34.99,
      categoryId: 'cat_iphone_cases',
      brand: 'SiliconPro',
      model: 'iPhone 14',
      compatibility: JSON.stringify(['iPhone 14', 'iPhone 14 Pro']),
      // DROPSHIPPING INFO
      supplierId: 'supplier_cj',
      supplierProductId: 'CJ123456789',
      supplierUrl: 'https://www.cjdropshipping.com/product/CJ123456789',
      supplierPrice: 10.50,
      profitMargin: 233,
      shippingTime: '10-20 días hábiles',
      importedAt: new Date(),
      lastSyncedAt: new Date(),
      isActive: true,
      isFeatured: true,
      inStock: true,
      stockCount: 999,
    },
  });

  const product3 = await prisma.product.upsert({
    where: { slug: 'carcasa-cuero-iphone-13' },
    update: {},
    create: {
      id: 'prod_case_iphone13_leather',
      name: 'Carcasa de Cuero iPhone 13',
      slug: 'carcasa-cuero-iphone-13',
      description: 'Elegante carcasa de cuero genuino. Diseño minimalista con ranuras para tarjetas. Perfecta para profesionales.',
      basePrice: 49.99,
      categoryId: 'cat_iphone_cases',
      brand: 'LeatherLux',
      model: 'iPhone 13',
      compatibility: JSON.stringify(['iPhone 13', 'iPhone 13 Pro']),
      isActive: true,
      isFeatured: true,
      inStock: true,
      stockCount: 30,
    },
  });

  const product4 = await prisma.product.upsert({
    where: { slug: 'carcasa-antigolpes-iphone-15-pro' },
    update: {},
    create: {
      id: 'prod_case_iphone15pro_rugged',
      name: 'Carcasa Antigolpes iPhone 15 Pro',
      slug: 'carcasa-antigolpes-iphone-15-pro',
      description: 'Máxima protección militar. Resistente a caídas de hasta 3 metros. Ideal para uso rudo.',
      basePrice: 44.99,
      categoryId: 'cat_iphone_cases',
      brand: 'ArmorShield',
      model: 'iPhone 15 Pro',
      compatibility: JSON.stringify(['iPhone 15 Pro', 'iPhone 15 Pro Max']),
      isActive: true,
      isFeatured: false,
      inStock: true,
      stockCount: 40,
    },
  });

  const product5 = await prisma.product.upsert({
    where: { slug: 'protector-cristal-templado-iphone' },
    update: {},
    create: {
      id: 'prod_screen_protector',
      name: 'Protector de Cristal Templado',
      slug: 'protector-cristal-templado-iphone',
      description: 'Cristal templado 9H ultra resistente. Instalación fácil sin burbujas. Compatible con todos los iPhone.',
      basePrice: 14.99,
      categoryId: 'cat_protectores',
      brand: 'ScreenGuard',
      model: 'Universal',
      compatibility: JSON.stringify(['iPhone 15', 'iPhone 14', 'iPhone 13', 'iPhone 12']),
      isActive: true,
      isFeatured: false,
      inStock: true,
      stockCount: 100,
    },
  });

  console.log('✅ 5 productos creados\n');

  // 3. Crear imágenes de productos
  console.log('🖼️  Creando imágenes...');

  await prisma.productImage.createMany({
    data: [
      // iPhone 15 Transparente
      { productId: 'prod_case_iphone15_trans', url: 'https://placehold.co/800x800/e0e0e0/333?text=iPhone+15+Clear+Case', altText: 'Carcasa Transparente iPhone 15', position: 0, isMain: true },
      { productId: 'prod_case_iphone15_trans', url: 'https://placehold.co/800x800/f0f0f0/333?text=Side+View', altText: 'Vista lateral', position: 1, isMain: false },

      // iPhone 14 Silicona
      { productId: 'prod_case_iphone14_silicone', url: 'https://placehold.co/800x800/4a90e2/fff?text=iPhone+14+Silicone', altText: 'Carcasa Silicona iPhone 14', position: 0, isMain: true },
      { productId: 'prod_case_iphone14_silicone', url: 'https://placehold.co/800x800/5a9ff2/fff?text=Back+View', altText: 'Vista posterior', position: 1, isMain: false },

      // iPhone 13 Cuero
      { productId: 'prod_case_iphone13_leather', url: 'https://placehold.co/800x800/8b6914/fff?text=iPhone+13+Leather', altText: 'Carcasa Cuero iPhone 13', position: 0, isMain: true },
      { productId: 'prod_case_iphone13_leather', url: 'https://placehold.co/800x800/9b7924/fff?text=Leather+Detail', altText: 'Detalle cuero', position: 1, isMain: false },

      // iPhone 15 Pro Antigolpes
      { productId: 'prod_case_iphone15pro_rugged', url: 'https://placehold.co/800x800/2c3e50/fff?text=iPhone+15+Pro+Rugged', altText: 'Carcasa Antigolpes', position: 0, isMain: true },

      // Protector
      { productId: 'prod_screen_protector', url: 'https://placehold.co/800x800/ecf0f1/333?text=Screen+Protector', altText: 'Protector de Pantalla', position: 0, isMain: true },
    ],
  });

  console.log('✅ Imágenes creadas\n');

  // 4. Crear variantes
  console.log('🎨 Creando variantes...');

  await prisma.productVariant.createMany({
    data: [
      // iPhone 15 Transparente
      { id: 'var_ip15_trans_clear', productId: 'prod_case_iphone15_trans', name: 'Transparente - Clear', color: 'Transparente', price: 29.99, sku: 'IP15-TRANS-CLR', stockQuantity: 50, isActive: true },

      // iPhone 14 Silicona - colores
      { id: 'var_ip14_sil_black', productId: 'prod_case_iphone14_silicone', name: 'Silicona - Negro', color: 'Negro', price: 34.99, sku: 'IP14-SIL-BLK', stockQuantity: 25, isActive: true },
      { id: 'var_ip14_sil_blue', productId: 'prod_case_iphone14_silicone', name: 'Silicona - Azul', color: 'Azul', price: 34.99, sku: 'IP14-SIL-BLU', stockQuantity: 25, isActive: true },
      { id: 'var_ip14_sil_pink', productId: 'prod_case_iphone14_silicone', name: 'Silicona - Rosa', color: 'Rosa', price: 34.99, sku: 'IP14-SIL-PNK', stockQuantity: 25, isActive: true },

      // iPhone 13 Cuero
      { id: 'var_ip13_lea_brown', productId: 'prod_case_iphone13_leather', name: 'Cuero - Marrón', color: 'Marrón', price: 49.99, sku: 'IP13-LEA-BRN', stockQuantity: 15, isActive: true },
      { id: 'var_ip13_lea_black', productId: 'prod_case_iphone13_leather', name: 'Cuero - Negro', color: 'Negro', price: 49.99, sku: 'IP13-LEA-BLK', stockQuantity: 15, isActive: true },

      // iPhone 15 Pro Antigolpes
      { id: 'var_ip15pro_rug_black', productId: 'prod_case_iphone15pro_rugged', name: 'Antigolpes - Negro', color: 'Negro', price: 44.99, sku: 'IP15PRO-RUG-BLK', stockQuantity: 20, isActive: true },
      { id: 'var_ip15pro_rug_blue', productId: 'prod_case_iphone15pro_rugged', name: 'Antigolpes - Azul', color: 'Azul', price: 44.99, sku: 'IP15PRO-RUG-BLU', stockQuantity: 20, isActive: true },

      // Protector
      { id: 'var_screen_prot', productId: 'prod_screen_protector', name: 'Protector Universal', color: 'Transparente', price: 14.99, sku: 'SCREEN-PROT-UNI', stockQuantity: 100, isActive: true },
    ],
  });

  console.log('✅ Variantes creadas\n');

  // 5. Crear usuario admin
  console.log('👤 Creando usuario admin...');

  const hashedPassword = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@store.com' },
    update: {},
    create: {
      id: 'user_admin',
      email: 'admin@store.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Store',
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Usuario admin creado (email: admin@store.com, password: admin123)\n');

  // 6. Crear una orden de ejemplo
  console.log('📦 Creando orden de ejemplo...');

  const order = await prisma.order.create({
    data: {
      id: 'order_example_001',
      orderNumber: 'ORD-2025-001',
      status: 'PENDING',
      customerFirstName: 'Juan',
      customerLastName: 'Pérez',
      customerEmail: 'juan@example.com',
      customerPhone: '+51987654321',
      subtotal: 64.98,
      shippingCost: 10.00,
      tax: 0,
      total: 74.98,
      paymentMethod: 'stripe',
      paymentStatus: 'PENDING',
      shippingAddress: 'Av. Principal 123',
      shippingCity: 'Lima',
      shippingState: 'Lima',
      shippingPostalCode: '15001',
      shippingCountry: 'PE',
      items: {
        create: [
          {
            productId: 'prod_case_iphone15_trans',
            variantId: 'var_ip15_trans_clear',
            productName: 'Carcasa Transparente iPhone 15',
            productModel: 'iPhone 15',
            productColor: 'Transparente',
            quantity: 1,
            price: 29.99,
            total: 29.99,
          },
          {
            productId: 'prod_case_iphone14_silicone',
            variantId: 'var_ip14_sil_blue',
            productName: 'Carcasa de Silicona iPhone 14',
            productModel: 'iPhone 14',
            productColor: 'Azul',
            quantity: 1,
            price: 34.99,
            total: 34.99,
          },
        ],
      },
    },
  });

  console.log('✅ Orden de ejemplo creada\n');

  console.log('🎉 Seed completado exitosamente!\n');
  console.log('📊 Resumen:');
  console.log('  - 4 categorías');
  console.log('  - 3 proveedores (AliExpress, CJ Dropshipping, Alibaba)');
  console.log('  - 5 productos (con info de dropshipping)');
  console.log('  - 8 imágenes');
  console.log('  - 9 variantes');
  console.log('  - 1 usuario admin');
  console.log('  - 1 orden de ejemplo');
  console.log('\n✅ Base de datos lista para dropshipping!');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
