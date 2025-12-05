const axios = require('axios');

(async () => {
  // 1. Login
  console.log('🔐 Login como admin...');
  const loginRes = await axios.post('http://localhost:3001/api/admin/login', {
    username: 'admin',
    password: 'admin123'
  });

  const token = loginRes.data.token;
  console.log('✅ Token obtenido');

  // 2. Extract product
  console.log('\n🔍 Extrayendo producto...');
  const url = 'https://www.aliexpress.com/item/1005008561547916.html';

  const extractRes = await axios.post('http://localhost:3001/api/aliexpress/extract', {
    url: url
  }, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  console.log('\n📊 RESPUESTA DEL API:');
  console.log('Success:', extractRes.data.success);
  console.log('Producto nombre:', extractRes.data.product?.name);
  console.log('Variantes:', extractRes.data.product?.variants?.length || 0);

  if (extractRes.data.product?.variants && extractRes.data.product.variants.length > 0) {
    console.log('\n🎨 VARIANTES RECIBIDAS:');
    extractRes.data.product.variants.forEach((v, i) => {
      console.log(`  ${i+1}. ${v.name || JSON.stringify(v)}`);
    });
  } else {
    console.log('\n❌ NO SE RECIBIERON VARIANTES');
    console.log('Product data:', JSON.stringify(extractRes.data.product, null, 2));
  }
})();
