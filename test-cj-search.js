const axios = require('axios');

async function testCJAPI() {
  try {
    // Primero obtener token
    console.log('Obteniendo token CJ...');
    const authRes = await axios.post('https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken', {
      email: 'echurapacci@gmail.com',
      apiKey: '9a5b7fe7079a4d699c81f6b818ae2405'
    });

    if (authRes.data.code !== 200) {
      console.log('Error de autenticacion:', authRes.data.message);
      return;
    }

    const token = authRes.data.data.accessToken;
    console.log('Token obtenido OK\n');

    // Buscar productos
    console.log('Buscando productos...\n');
    const searches = ['phone case', 'mobile case', 'cell phone case', 'iphone', 'smartphone case'];

    for (const keyword of searches) {
      const searchRes = await axios.get('https://developers.cjdropshipping.com/api2.0/v1/product/list', {
        params: { productNameEn: keyword, pageNum: 1, pageSize: 10 },
        headers: { 'CJ-Access-Token': token }
      });

      console.log(`Busqueda: "${keyword}"`);
      console.log(`  Codigo: ${searchRes.data.code}`);
      console.log(`  Mensaje: ${searchRes.data.message}`);
      console.log(`  Resultados: ${searchRes.data.data?.total || 0}`);

      if (searchRes.data.data?.list?.length > 0) {
        const first = searchRes.data.data.list[0];
        console.log(`  Primer producto: ${first.productNameEn || first.productName || 'N/A'}`);
        console.log(`  PID: ${first.pid || 'N/A'}`);
      }
      console.log('');
    }

  } catch (error) {
    console.error('ERROR:', error.response?.data || error.message);
  }
}

testCJAPI();
