const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('⚙️ CONFIGURANDO AUTOMATIZACIÓN DE CJ DROPSHIPPING\n');
    console.log('='.repeat(60));

    const CJ_API_KEY = process.env.CJ_API_KEY || 'YOUR_CJ_API_KEY_HERE';
    const CJ_API_EMAIL = process.env.CJ_API_EMAIL || 'your-email@example.com';

    // 1. Actualizar proveedor CJ Dropshipping
    console.log('\n1️⃣ ACTUALIZANDO PROVEEDOR CJ DROPSHIPPING...');

    const cjSupplier = await prisma.supplier.upsert({
      where: { id: 'supplier_cj' },
      update: {
        apiEnabled: true,
        apiKey: CJ_API_KEY,
        name: 'CJ Dropshipping',
        slug: 'cj-dropshipping',
        website: 'https://www.cjdropshipping.com',
        averageShippingDays: '10-20',
        isActive: true,
        description: 'Proveedor principal de dropshipping con API integrada'
      },
      create: {
        id: 'supplier_cj',
        name: 'CJ Dropshipping',
        slug: 'cj-dropshipping',
        website: 'https://www.cjdropshipping.com',
        averageShippingDays: '10-20',
        isActive: true,
        apiEnabled: true,
        apiKey: CJ_API_KEY,
        description: 'Proveedor principal de dropshipping con API integrada'
      }
    });

    console.log('✅ Proveedor CJ Dropshipping configurado:');
    console.log(`   ID: ${cjSupplier.id}`);
    console.log(`   API Habilitada: ${cjSupplier.apiEnabled ? '✅ SÍ' : '❌ NO'}`);
    console.log(`   API Key: ${cjSupplier.apiKey ? '✅ Configurada' : '❌ No configurada'}`);

    // 2. Vincular producto actual a CJ
    console.log('\n2️⃣ VINCULANDO PRODUCTO ACTUAL A CJ...');

    const heroProduct = await prisma.product.findFirst({
      where: { id: 'cmi8al17e0001uyd4xiimmzdj' }
    });

    if (heroProduct) {
      // Actualizar producto para usar CJ en lugar de AliExpress
      const updatedProduct = await prisma.product.update({
        where: { id: heroProduct.id },
        data: {
          supplier: {
            connect: { id: 'supplier_cj' }
          },
          // Mantener el ID de AliExpress como supplierProductId
          supplierProductId: heroProduct.supplierProductId || '1005007380277062'
        }
      });

      console.log('✅ Producto vinculado a CJ:');
      console.log(`   Producto: ${updatedProduct.name}`);
      console.log(`   Supplier: CJ Dropshipping`);
      console.log(`   Supplier Product ID: ${updatedProduct.supplierProductId}`);
    }

    // 3. Crear proveedor AliExpress DSers (alternativa)
    console.log('\n3️⃣ CONFIGURANDO PROVEEDOR ALIEXPRESS DSERS...');

    const dsersSupplier = await prisma.supplier.upsert({
      where: { id: 'supplier_dsers' },
      update: {
        name: 'AliExpress DSers',
        slug: 'aliexpress-dsers',
        apiEnabled: false, // DSers requiere proceso manual o extensión
        isActive: true
      },
      create: {
        id: 'supplier_dsers',
        name: 'AliExpress DSers',
        slug: 'aliexpress-dsers',
        website: 'https://www.dsers.com',
        averageShippingDays: '15-30',
        isActive: true,
        apiEnabled: false,
        description: 'Proveedor AliExpress con gestión manual via DSers'
      }
    });

    console.log('✅ Proveedor DSers configurado:');
    console.log(`   ID: ${dsersSupplier.id}`);
    console.log(`   Nota: DSers requiere proceso manual o extensión de navegador`);

    // 4. Mostrar resumen
    console.log('\n' + '='.repeat(60));
    console.log('📊 CONFIGURACIÓN COMPLETADA\n');

    console.log('✅ AUTOMATIZACIÓN CJ DROPSHIPPING:');
    console.log('   - Proveedor CJ habilitado con API');
    console.log('   - Producto actual vinculado a CJ');
    console.log('   - Cuando un cliente compre, se creará orden automáticamente en CJ');

    console.log('\n⚠️  IMPORTANTE:');
    console.log('   1. Necesitas una cuenta activa en CJ Dropshipping');
    console.log('   2. Debes obtener tu API Key real de CJ Dashboard');
    console.log('   3. Actualizar .env con: CJ_API_KEY y CJ_API_EMAIL');
    console.log('   4. Para cada producto nuevo, necesitas el CJ Product ID real');

    console.log('\n💡 ALTERNATIVA - PROCESO SEMI-AUTOMÁTICO:');
    console.log('   1. Cliente compra en tu tienda → Se crea orden en BD');
    console.log('   2. Recibes notificación por email con detalles');
    console.log('   3. Compras manualmente en AliExpress/DSers');
    console.log('   4. Actualizas tracking number en el panel admin');
    console.log('   5. Cliente recibe email con tracking automático');

    console.log('\n🚀 SIGUIENTE PASO:');
    console.log('   Decide qué método prefieres:');
    console.log('   A) Automático con CJ (requiere cuenta CJ + API Key)');
    console.log('   B) Manual con AliExpress + DSers (más flexible, sin API)');

    await prisma.$disconnect();
  } catch (error) {
    console.error('\n❌ ERROR:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
})();
