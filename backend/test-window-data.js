const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const url = 'https://www.aliexpress.com/item/1005007109920305.html';
  console.log('Navegando...', url);

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(resolve => setTimeout(resolve, 15000));

  const windowData = await page.evaluate(() => {
    if (window.data) {
      // Retornar estructura de window.data
      return {
        keys: Object.keys(window.data).slice(0, 20),
        type: typeof window.data,
        hasPageModule: typeof window.data.pageModule !== 'undefined',
        hasPriceModule: typeof window.data.priceModule !== 'undefined',
        sample: JSON.stringify(window.data).substring(0, 500)
      };
    }
    return { exists: false };
  });

  console.log('\n=== window.data ===');
  console.log(JSON.stringify(windowData, null, 2));

  await browser.close();
})();
