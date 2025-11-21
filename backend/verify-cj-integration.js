const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('🔍 VERIFICANDO INTEGRACIÓN DE CJ DROPSHIPPING\n');
    console.log('='.repeat(60));

    // 1. Verificar proveedor CJ
    console.log('\n1️⃣ VERIFICANDO PROVEEDOR CJ DROPSHIPPING...');
    const cjSupplier = await prisma.supplier.findFirst({
      where: {
        OR: [
          { slug: 'cj-dropshipping' },
          { name: { contains: 'CJ', mode: 'insensitive' } }
        ]
      }
    });

    if (!cjSupplier) {
      console.log('❌ No se encontró proveedor CJ Dropshipping en la base de datos');
      console.log('📝 Necesitas crear un registro de proveedor CJ');
    } else {
      console.log('✅ Proveedor encontrado:');
      console.log(`   ID: ${cjSupplier.id}`);
      console.log(`   Nombre: ${cjSupplier.name}`);
      console.log(`   Slug: ${cjSupplier.slug}`);
      console.log(`   API Habilitada: ${cjSupplier.apiEnabled ? '✅ SÍ' : '❌ NO'}`);
      console.log(`   API Key: ${cjSupplier.apiKey ? '✅ Configurada' : '❌ No configurada'}`);
      console.log(`   API Endpoint: ${cjSupplier.apiEndpoint || 'No configurado'}`);
    }

    // 2. Verificar productos vinculados
    console.log('\n2️⃣ VERIFICANDO PRODUCTOS VINCULADOS A CJ...');
    const products = await prisma.product.findMany({
      where: {
        supplierId: cjSupplier?.id || 'none'
      },
      include: {
        supplier: true,
        variants: {
          take: 2
        }
      }
    });

    console.log(`\n   Productos vinculados a CJ: ${products.length}`);

    if (products.length > 0) {
      products.forEach((product, idx) => {
        console.log(`\n   Producto ${idx + 1}:`);
        console.log(`   - ID: ${product.id}`);
        console.log(`   - Nombre: ${product.name}`);
        console.log(`   - Supplier ID: ${product.supplierId}`);
        console.log(`   - Supplier Product ID: ${product.supplierProductId || '❌ NO CONFIGURADO'}`);
        console.log(`   - CJ Product ID: ${product.cjProductId || '❌ NO CONFIGURADO'}`);
        console.log(`   - External ID: ${product.externalId || '❌ NO CONFIGURADO'}`);
        console.log(`   - Variantes: ${product.variants.length}`);
      });
    } else {
      console.log('   ⚠️ No hay productos vinculados a CJ Dropshipping');
    }

    // 3. Verificar producto actual del hero banner
    console.log('\n3️⃣ VERIFICANDO PRODUCTO ACTUAL (Hero Banner)...');
    const heroProduct = await prisma.product.findFirst({
      where: { id: 'cmi8al17e0001uyd4xiimmzdj' },
      include: {
        supplier: true,
        variants: {
          take: 3
        }
      }
    });

    if (heroProduct) {
      console.log('   ✅ Producto encontrado:');
      console.log(`   - ID: ${heroProduct.id}`);
      console.log(`   - Nombre: ${heroProduct.name}`);
      console.log(`   - Supplier ID: ${heroProduct.supplierId || '❌ NO ASIGNADO'}`);
      console.log(`   - Supplier Name: ${heroProduct.supplier?.name || 'Sin proveedor'}`);
      console.log(`   - Supplier Product ID: ${heroProduct.supplierProductId || '❌ NO CONFIGURADO'}`);
      console.log(`   - CJ Product ID: ${heroProduct.cjProductId || '❌ NO CONFIGURADO'}`);
      console.log(`   - External ID: ${heroProduct.externalId || '❌ NO CONFIGURADO'}`);
      console.log(`   - Supplier URL: ${heroProduct.supplierUrl || 'No configurado'}`);
      console.log(`   - Variantes: ${heroProduct.variants.length}`);

      if (heroProduct.variants.length > 0) {
        console.log('\n   Variantes de ejemplo:');
        heroProduct.variants.slice(0, 3).forEach((v, idx) => {
          console.log(`   ${idx + 1}. ${v.name} - Color: ${v.color || 'N/A'}`);
        });
      }
    }

    // 4. Verificar variables de entorno
    console.log('\n4️⃣ VERIFICANDO VARIABLES DE ENTORNO CJ...');
    const envVars = {
      'CJ_API_KEY': process.env.CJ_API_KEY,
      'CJ_API_EMAIL': process.env.CJ_API_EMAIL,
      'CJ_API_ENDPOINT': process.env.CJ_API_ENDPOINT
    };

    Object.entries(envVars).forEach(([key, value]) => {
      console.log(`   ${key}: ${value ? '✅ Configurada' : '❌ No configurada'}`);
    });

    // 5. Verificar órdenes de prueba
    console.log('\n5️⃣ VERIFICANDO ÓRDENES EXISTENTES...');
    const recentOrders = await prisma.order.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                supplierId: true,
                supplierProductId: true
              }
            }
          }
        }
      }
    });

    console.log(`   Órdenes recientes: ${recentOrders.length}`);
    recentOrders.forEach((order, idx) => {
      console.log(`\n   Orden ${idx + 1}:`);
      console.log(`   - Order Number: ${order.orderNumber}`);
      console.log(`   - Estado: ${order.status}`);
      console.log(`   - Dropshipping Processed: ${order.dropshippingProcessed ? '✅ SÍ' : '❌ NO'}`);
      console.log(`   - Items: ${order.items.length}`);
      order.items.forEach((item, i) => {
        console.log(`     ${i + 1}. ${item.product?.name || 'Unknown'}`);
        console.log(`        Supplier ID: ${item.product?.supplierId || '❌ NO ASIGNADO'}`);
      });
    });

    // RESUMEN FINAL
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE INTEGRACIÓN\n');

    const issues = [];
    const successes = [];

    if (!cjSupplier) {
      issues.push('❌ No existe registro de proveedor CJ Dropshipping');
    } else {
      successes.push('✅ Proveedor CJ existe en BD');

      if (!cjSupplier.apiEnabled) {
        issues.push('❌ API de CJ no está habilitada (apiEnabled = false)');
      } else {
        successes.push('✅ API de CJ habilitada');
      }

      if (!cjSupplier.apiKey) {
        issues.push('❌ API Key de CJ no configurada');
      } else {
        successes.push('✅ API Key de CJ configurada');
      }
    }

    if (!heroProduct?.supplierId) {
      issues.push('❌ Producto actual no tiene supplierId asignado');
    } else {
      successes.push('✅ Producto tiene supplierId');
    }

    if (!heroProduct?.supplierProductId && !heroProduct?.cjProductId) {
      issues.push('❌ Producto no tiene supplierProductId ni cjProductId');
    } else {
      successes.push('✅ Producto tiene ID externo de proveedor');
    }

    if (!process.env.CJ_API_KEY) {
      issues.push('❌ Variable CJ_API_KEY no configurada en .env');
    } else {
      successes.push('✅ Variable CJ_API_KEY configurada');
    }

    console.log('ÉXITOS:');
    successes.forEach(s => console.log(s));

    console.log('\nPROBLEMAS ENCONTRADOS:');
    if (issues.length === 0) {
      console.log('🎉 ¡No hay problemas! La integración está completa.');
    } else {
      issues.forEach(i => console.log(i));
    }

    console.log('\n' + '='.repeat(60));

    if (issues.length > 0) {
      console.log('\n💡 SIGUIENTE PASO:');
      if (!cjSupplier) {
        console.log('   Crear registro de proveedor CJ Dropshipping en la BD');
      } else if (!cjSupplier.apiEnabled || !cjSupplier.apiKey) {
        console.log('   Actualizar proveedor CJ con API Key y habilitar API');
      } else if (!heroProduct?.supplierId) {
        console.log('   Vincular producto actual con proveedor CJ');
      } else {
        console.log('   Configurar supplierProductId para automatización');
      }
    } else {
      console.log('\n🚀 LISTO PARA AUTOMATIZACIÓN:');
      console.log('   El sistema está configurado para procesar órdenes automáticamente.');
      console.log('   Cuando un cliente compre, la orden se enviará automáticamente a CJ.');
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('\n❌ ERROR:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
})();
