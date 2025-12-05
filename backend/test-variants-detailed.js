const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const url = 'https://www.aliexpress.com/item/1005009967421733.html';
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(resolve => setTimeout(resolve, 15000));

  const variants = await page.evaluate(() => {
    const skuContainers = document.querySelectorAll('[class*="sku-item--property"]');
    const results = [];

    skuContainers.forEach((container, containerIndex) => {
      const titleEl = container.querySelector('[class*="sku-item--title"]');
      const propertyName = titleEl ? titleEl.textContent : '';

      const containerInfo = {
        containerIndex,
        propertyName,
        options: []
      };

      const optionElements = container.querySelectorAll('[class*="sku-item--"][data-sku-col]');

      optionElements.forEach((optionEl, optionIndex) => {
        const title = optionEl.getAttribute('title') || '';
        const ariaLabel = optionEl.getAttribute('aria-label') || '';
        const innerText = optionEl.textContent?.trim() || '';

        // Buscar todos los spans/divs internos
        const innerElements = Array.from(optionEl.querySelectorAll('span, div')).map(el => el.textContent?.trim());

        containerInfo.options.push({
          optionIndex,
          title,
          ariaLabel,
          innerText: innerText.substring(0, 100),
          innerElements: innerElements.slice(0, 5)
        });
      });

      results.push(containerInfo);
    });

    return results;
  });

  console.log('\\n📊 ANÁLISIS DETALLADO DE VARIANTES:\\n');
  console.log(JSON.stringify(variants, null, 2));

  await browser.close();
})();
