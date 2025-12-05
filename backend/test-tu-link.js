const service = require('./src/services/aliexpressPuppeteerService');

(async () => {
  const url = 'https://www.aliexpress.com/item/1005008561547916.html';
  console.log('🔍 Extrayendo:', url);

  const result = await service.getProductData(url);

  if (result.success) {
    console.log('\n✅ NOMBRE:', result.product.name);
    console.log('\n🎨 VARIANTES EXTRAÍDAS:');
    result.product.variants.forEach((v, i) => {
      console.log(`  ${i+1}. ${v.name}`);
    });
    console.log(`\n📊 Total: ${result.product.variants.length} variantes`);
    console.log(`\n🖼️  Imágenes: ${result.product.images.length}`);
  } else {
    console.error('\n❌ ERROR:', result.error);
  }

  await service.closeBrowser();
  process.exit(0);
})();
