const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.setViewport({ width: 1920, height: 1080 });

  const url = 'https://www.aliexpress.com/item/1005007109920305.html';
  console.log('Navegando a:', url);

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

  console.log('Esperando 15 segundos para que cargue...');
  await new Promise(resolve => setTimeout(resolve, 15000));

  // Tomar screenshot
  await page.screenshot({ path: 'aliexpress-page.png', fullPage: true });
  console.log('Screenshot guardado: aliexpress-page.png');

  // Ver qué variables globales hay
  const globals = await page.evaluate(() => {
    const allGlobals = {};
    for (let key in window) {
      if (key.startsWith('__') || key.startsWith('run') || key.toLowerCase().includes('data') || key.toLowerCase().includes('state')) {
        try {
          allGlobals[key] = typeof window[key];
        } catch (e) {}
      }
    }
    return allGlobals;
  });

  console.log('\n=== Variables globales de ventana: ===');
  console.log(JSON.stringify(globals, null, 2));

  // Ver el HTML del precio
  const priceHTML = await page.evaluate(() => {
    const priceElements = document.querySelectorAll('[class*="price"], [class*="Price"]');
    return Array.from(priceElements).slice(0, 5).map(el => ({
      class: el.className,
      text: el.textContent.trim().substring(0, 50)
    }));
  });

  console.log('\n=== Elementos de precio encontrados: ===');
  console.log(JSON.stringify(priceHTML, null, 2));

  console.log('\nPresiona Ctrl+C para cerrar...');
  await new Promise(() => {}); // Keep open
})();
