// backend/src/routes/sitemap.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * GET /sitemap.xml - Generar sitemap dinámico
 */
router.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const currentDate = new Date().toISOString().split('T')[0];

    // Obtener todos los productos activos
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        slug: true,
        updatedAt: true
      }
    });

    // Páginas estáticas
    const staticPages = [
      { url: '', changefreq: 'daily', priority: '1.0' }, // Home
      { url: 'products', changefreq: 'daily', priority: '0.9' },
      { url: 'about', changefreq: 'monthly', priority: '0.7' },
      { url: 'contact', changefreq: 'monthly', priority: '0.7' },
      { url: 'faq', changefreq: 'weekly', priority: '0.6' },
      { url: 'track', changefreq: 'weekly', priority: '0.5' },
      { url: 'privacy', changefreq: 'yearly', priority: '0.3' },
      { url: 'terms', changefreq: 'yearly', priority: '0.3' },
      { url: 'returns', changefreq: 'yearly', priority: '0.3' },
      { url: 'cookies', changefreq: 'yearly', priority: '0.3' }
    ];

    // Generar XML del sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

  <!-- Páginas Estáticas -->
${staticPages.map(page => `  <url>
    <loc>${baseUrl}/${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}

  <!-- Productos -->
${products.map(product => `  <url>
    <loc>${baseUrl}/products/${product.slug}</loc>
    <lastmod>${product.updatedAt ? new Date(product.updatedAt).toISOString().split('T')[0] : currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}

</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(sitemap);

    console.log(`✅ Sitemap generado: ${staticPages.length} páginas estáticas + ${products.length} productos`);

  } catch (error) {
    console.error('❌ Error generando sitemap:', error);
    res.status(500).send('Error generando sitemap');
  }
});

/**
 * GET /sitemap-info - Información sobre el sitemap (JSON para debugging)
 */
router.get('/sitemap-info', async (req, res) => {
  try {
    const products = await prisma.product.count({ where: { isActive: true } });

    res.json({
      success: true,
      info: {
        staticPages: 10,
        products: products,
        totalUrls: 10 + products,
        lastGenerated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error obteniendo info del sitemap:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
