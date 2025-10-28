// backend/src/routes/url-cleaner.js
const express = require('express');
const router = express.Router();

/**
 * POST /api/clean-url - Limpia URLs de parámetros de tracking
 *
 * Elimina parámetros innecesarios de URLs de AliExpress, Amazon, etc.
 * para mejorar el scraping
 */
router.post('/clean-url', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL es requerida'
      });
    }

    console.log(`🧹 Limpiando URL: ${url}`);

    let cleanUrl = url;

    // Detectar plataforma y limpiar apropiadamente
    if (url.includes('aliexpress')) {
      // AliExpress: mantener solo item/ID.html
      const match = url.match(/item\/(\d+)\.html/);
      if (match) {
        const itemId = match[1];
        // Mantener el dominio original (aliexpress.com o aliexpress.us)
        const domain = url.includes('aliexpress.us') ? 'aliexpress.us' : 'aliexpress.com';
        cleanUrl = `https://www.${domain}/item/${itemId}.html`;
      } else {
        // Si no se encuentra el patrón, solo quitar parámetros
        cleanUrl = url.split('?')[0];
      }
    } else if (url.includes('amazon')) {
      // Amazon: mantener solo /dp/ASIN o /gp/product/ASIN
      const match = url.match(/\/(dp|gp\/product)\/([A-Z0-9]{10})/);
      if (match) {
        const asin = match[2];
        // Mantener el dominio original
        const urlObj = new URL(url);
        cleanUrl = `${urlObj.protocol}//${urlObj.host}/dp/${asin}`;
      } else {
        cleanUrl = url.split('?')[0];
      }
    } else if (url.includes('alibaba')) {
      // Alibaba: quitar parámetros
      cleanUrl = url.split('?')[0];
    } else {
      // Otros: simplemente quitar parámetros después de ?
      cleanUrl = url.split('?')[0];
    }

    console.log(`✅ URL limpia: ${cleanUrl}`);

    res.json({
      success: true,
      data: {
        originalUrl: url,
        cleanUrl: cleanUrl,
        removed: url.length - cleanUrl.length,
        platform: url.includes('aliexpress') ? 'AliExpress' :
                  url.includes('amazon') ? 'Amazon' :
                  url.includes('alibaba') ? 'Alibaba' : 'Generic'
      }
    });
  } catch (error) {
    console.error('❌ Error limpiando URL:', error);
    res.status(500).json({
      success: false,
      message: 'Error al limpiar URL',
      error: error.message
    });
  }
});

module.exports = router;
