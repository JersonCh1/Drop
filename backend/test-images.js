const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const url = 'https://www.aliexpress.com/item/1005009839668965.html';
  console.log('🔍 Analizando imágenes en:', url);

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(resolve => setTimeout(resolve, 10000));

  const images = await page.evaluate(() => {
    const results = {
      allImages: 0,
      bySelector: {}
    };

    // Contar todas las imágenes
    results.allImages = document.querySelectorAll('img').length;

    // Probar diferentes selectores
    const selectors = [
      'img[class*="mainImage"]',
      'img[class*="magnifier"]',
      'img[class*="slider"]',
      'ul[class*="imageList"] img',
      'div[class*="image-view"] img',
      'div[class*="image"] img',
      '[class*="gallery"] img',
      '[class*="preview"] img',
      '[class*="thumb"] img'
    ];

    selectors.forEach(selector => {
      const imgs = document.querySelectorAll(selector);
      results.bySelector[selector] = {
        count: imgs.length,
        samples: Array.from(imgs).slice(0, 3).map(img => ({
          src: (img.src || '').substring(0, 80),
          className: img.className
        }))
      };
    });

    return results;
  });

  console.log('\n📊 ANÁLISIS DE IMÁGENES:');
  console.log('Total de imágenes en la página:', images.allImages);
  console.log('\nPor selector:');
  Object.entries(images.bySelector).forEach(([selector, data]) => {
    console.log(`\n${selector}:`);
    console.log(`  Encontradas: ${data.count}`);
    if (data.count > 0) {
      data.samples.forEach((sample, i) => {
        console.log(`  ${i + 1}. ${sample.src}`);
      });
    }
  });

  await browser.close();
})();
