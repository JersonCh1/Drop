const aliexpressService = require('./src/services/aliexpressPuppeteerService');

(async () => {
  const url = 'https://www.aliexpress.com/item/1005009967421733.html?supplyId=159831080';
  console.log('🔍 Extrayendo producto:', url);

  const result = await aliexpressService.getProductData(url);

  if (!result.success) {
    console.error('❌ Error:', result.error);
    process.exit(1);
  }

  const product = result.product;

  console.log('\n✅ TÍTULO MEJORADO:');
  console.log(product.name);

  console.log('\n🎨 VARIANTES EXTRAÍDAS:');
  product.variants.forEach((v, i) => {
    console.log(`${i + 1}. ${v.name}`);
  });

  console.log('\n📊 Total de variantes:', product.variants.length);

  process.exit(0);
})();
