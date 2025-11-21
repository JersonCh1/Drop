const axios = require('axios');
const fs = require('fs');

const url = 'https://www.aliexpress.com/item/1005006394891525.html';

(async () => {
  try {
    console.log('📥 Descargando página...');

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'max-age=0',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'Referer': 'https://www.google.com/'
      },
      timeout: 30000,
      maxRedirects: 5
    });

    console.log('✅ Respuesta recibida');
    console.log('📊 Status:', response.status);
    console.log('📏 Tamaño:', response.data.length, 'caracteres');

    // Guardar HTML para inspección
    fs.writeFileSync('aliexpress-response.html', response.data);
    console.log('💾 HTML guardado en aliexpress-response.html');

    // Buscar el título en diferentes formas
    const titleMatches = [
      response.data.match(/<title>(.*?)<\/title>/i),
      response.data.match(/"subject":"(.*?)"/),
      response.data.match(/"title":"(.*?)"/),
      response.data.match(/window\.runParams\s*=\s*({[\s\S]*?});/)
    ];

    console.log('\n🔍 Buscando títulos:');
    titleMatches.forEach((match, i) => {
      if (match) {
        console.log(`  Método ${i + 1}:`, match[1]?.substring(0, 100));
      }
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
})();
