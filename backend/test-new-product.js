const aliexpressService = require('./src/services/aliexpressPuppeteerService');

(async () => {
  const url = 'https://es.aliexpress.com/item/1005009839668965.html?supplyId=159831080&gatewayAdapt=glo2esp';
  console.log('🔍 Probando nuevo producto:', url);

  const result = await aliexpressService.getProductData(url);

  if (!result.success) {
    console.error('❌ Error:', result.error);
    process.exit(1);
  }

  const product = result.product;

  console.log('\n✅ PRODUCTO EXTRAÍDO:');
  console.log('Nombre:', product.name);
  console.log('Imágenes:', product.images.length);
  console.log('Variantes:', product.variants.length);

  if (product.variants.length > 0) {
    console.log('\n🎨 VARIANTES:');
    product.variants.forEach((v, i) => {
      console.log(`${i + 1}. ${v.name}`);
    });
  } else {
    console.log('\n❌ NO SE ENCONTRARON VARIANTES');
    console.log('Debug info:', product.debug || 'No debug info');
  }

  process.exit(0);
})();
