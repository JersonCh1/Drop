const axios = require('axios');

(async () => {
  const res = await axios.get('http://localhost:3001/api/products');
  const products = res.data.data;

  console.log('\n📊 ANÁLISIS DE PRODUCTOS IMPORTADOS\n');
  console.log(`Total productos: ${products.length}\n`);
  console.log('='.repeat(80));

  products.forEach((product, index) => {
    console.log(`\n${index + 1}. 📦 ${product.name}`);
    console.log(`   Slug: ${product.slug}`);
    console.log(`   💰 Precio venta: $${product.basePrice} (Proveedor: $${product.supplierPrice}, Margen: ${product.profitMargin}%)`);
    console.log(`   🎨 Variantes: ${product.variants.length}`);
    console.log(`   🖼️  Imágenes: ${product.images.length}`);

    // Analizar problemas con variantes
    const variantIssues = [];
    const colorsSeen = new Set();
    const modelsSeen = new Set();

    product.variants.forEach(v => {
      if (v.color) colorsSeen.add(v.color);
      if (v.material) modelsSeen.add(v.material);

      // Detectar nombres problemáticos
      if (v.name.match(/\s-\s\d+$/)) {
        variantIssues.push(`Nombre con número genérico: "${v.name}"`);
      }
      if (v.color && v.color.match(/^\d+$/)) {
        variantIssues.push(`Color es un número: "${v.color}"`);
      }
    });

    if (colorsSeen.size > 0) {
      console.log(`   🎨 Colores únicos: ${colorsSeen.size} (${Array.from(colorsSeen).slice(0, 3).join(', ')}...)`);
    }
    if (modelsSeen.size > 0) {
      console.log(`   📱 Modelos únicos: ${modelsSeen.size}`);
    }

    // Mostrar primeras 3 variantes como ejemplo
    console.log(`   📋 Ejemplo variantes:`);
    product.variants.slice(0, 3).forEach((v, i) => {
      console.log(`      ${i+1}. ${v.name} (color: ${v.color || 'N/A'}, material: ${v.material || 'N/A'})`);
    });

    // Reportar problemas
    if (variantIssues.length > 0) {
      console.log(`   ⚠️  PROBLEMAS DETECTADOS:`);
      variantIssues.slice(0, 2).forEach(issue => console.log(`      - ${issue}`));
    }

    console.log('   ' + '-'.repeat(75));
  });

  console.log('\n' + '='.repeat(80));
  console.log('\n💡 RESUMEN DE PROBLEMAS COMUNES:\n');

  // Análisis global
  let totalVariantsWithNumberColors = 0;
  let totalVariantsWithGenericNames = 0;

  products.forEach(p => {
    p.variants.forEach(v => {
      if (v.color && v.color.match(/^\d+$/)) totalVariantsWithNumberColors++;
      if (v.name.match(/\s-\s\d+$/)) totalVariantsWithGenericNames++;
    });
  });

  console.log(`1. ❌ Variantes con colores numéricos (1, 2, etc.): ${totalVariantsWithNumberColors}`);
  console.log(`2. ❌ Variantes con nombres genéricos (iPhone X - 1): ${totalVariantsWithGenericNames}`);
  console.log(`3. 📋 Descripción genérica en todos los productos`);
  console.log(`4. 📝 Títulos podrían ser más descriptivos`);

  console.log('\n🎯 MEJORAS RECOMENDADAS:\n');
  console.log('1. Mapear códigos numéricos de colores a nombres reales');
  console.log('2. Mejorar nombres de variantes para que sean más descriptivos');
  console.log('3. Agregar descripciones personalizadas por producto');
  console.log('4. Mejorar títulos para SEO (incluir características clave)');
  console.log('5. Agregar precio comparativo (tachado) para mostrar descuento');
})();
