const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const url = 'https://www.aliexpress.com/item/1005009967421733.html';
  console.log('🔍 Buscando variantes en:', url);

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(resolve => setTimeout(resolve, 15000));

  // Buscar variantes en diferentes lugares
  const variantData = await page.evaluate(() => {
    const result = {
      // Método 1: Botones de variante en el DOM
      variantButtons: [],

      // Método 2: Scripts con datos JSON
      jsonScripts: [],

      // Método 3: window.runParams
      runParamsSkuModule: null,

      // Método 4: Atributos data-*
      dataAttributes: []
    };

    // Buscar botones/elementos de variante
    const variantElements = document.querySelectorAll('[class*="sku"], [class*="variant"], [class*="option"]');
    result.variantButtons = Array.from(variantElements).slice(0, 10).map(el => ({
      tag: el.tagName,
      class: el.className,
      text: el.textContent?.trim().substring(0, 50),
      hasImage: !!el.querySelector('img'),
      dataAttrs: Object.keys(el.dataset || {})
    }));

    // Buscar scripts con JSON
    const scripts = document.querySelectorAll('script');
    scripts.forEach(script => {
      const content = script.textContent || '';
      if (content.includes('skuModule') || content.includes('productSKU') || content.includes('skuPropertyValues')) {
        result.jsonScripts.push({
          hasSkuModule: content.includes('skuModule'),
          hasProductSKU: content.includes('productSKU'),
          sample: content.substring(0, 200)
        });
      }
    });

    // Verificar window.runParams
    if (window.runParams && window.runParams.data && window.runParams.data.skuModule) {
      result.runParamsSkuModule = {
        exists: true,
        keys: Object.keys(window.runParams.data.skuModule)
      };
    }

    return result;
  });

  console.log('\n📊 RESULTADO DE BÚSQUEDA DE VARIANTES:');
  console.log(JSON.stringify(variantData, null, 2));

  // Buscar también en el HTML específicamente elementos con títulos como "Color", "Model"
  const variantTitles = await page.evaluate(() => {
    const titles = [];
    const elements = document.querySelectorAll('*');

    elements.forEach(el => {
      const text = el.textContent?.trim();
      if (text && (text === 'Color' || text === 'Model' || text === 'Size' || text.includes('Choose'))) {
        const parent = el.parentElement;
        const siblings = parent ? Array.from(parent.children) : [];

        titles.push({
          text: text.substring(0, 30),
          parentClass: parent?.className || '',
          siblingCount: siblings.length,
          nextSiblingClass: siblings[1]?.className || ''
        });
      }
    });

    return titles.slice(0, 5);
  });

  console.log('\n🏷️ ELEMENTOS CON TÍTULOS DE VARIANTES:');
  console.log(JSON.stringify(variantTitles, null, 2));

  await browser.close();
})();
