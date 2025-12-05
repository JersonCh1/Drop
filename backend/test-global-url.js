const aliexpressService = require('./src/services/aliexpressPuppeteerService');

(async () => {
  // Usar URL global en vez de es.aliexpress.com
  const url = 'https://www.aliexpress.com/item/1005009839668965.html';
  console.log('🔍 Probando con URL global:', url);

  const result = await aliexpressService.getProductData(url);

  if (!result.success) {
    console.error('❌ Error:', result.error);
    process.exit(1);
  }

  const product = result.product;

  console.log('\n✅ PRODUCTO EXTRAÍDO:');
  console.log('Nombre:', product.name);
  console.log('Variantes:', product.variants.length);

  process.exit(0);
})();
