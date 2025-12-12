// backend/src/routes/facebookProductFeed.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

/**
 * Facebook Product Catalog Feed
 *
 * Este endpoint genera un feed XML compatible con Facebook Catalog
 * para poder usar Dynamic Product Ads (DPA)
 *
 * URL: https://casepro.es/api/facebook/product-feed
 * Formato: RSS 2.0 con namespace de Google Merchant Center
 *
 * Documentación: https://developers.facebook.com/docs/marketing-api/catalog/guides/product-feeds
 */

router.get('/', async (req, res) => {
  const prisma = new PrismaClient();

  try {
    console.log('📊 Generando Facebook Product Feed...');

    // Obtener todos los productos activos con sus variantes
    const products = await prisma.product.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        variants: {
          where: {
            isActive: true
          }
        }
      }
    });

    await prisma.$disconnect();

    // Generar XML en formato RSS 2.0
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>CASEPRO - Carcasas iPhone</title>
    <link>https://casepro.es</link>
    <description>Carcasas premium y accesorios para iPhone con envío internacional</description>
`;

    let itemCount = 0;

    // Iterar productos y variantes
    products.forEach(product => {
      // Si el producto tiene variantes, crear un item por cada variante
      if (product.variants && product.variants.length > 0) {
        product.variants.forEach(variant => {
          itemCount++;

          // Escapar caracteres XML
          const escapeXML = (str) => {
            if (!str) return '';
            return str
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&apos;');
          };

          const title = escapeXML(`${product.name} - ${variant.color || variant.name}`);
          const description = escapeXML(product.description || `Carcasa ${variant.color || ''} para ${product.category || 'iPhone'}. Protección premium con diseño elegante.`);
          const productUrl = `https://casepro.es/product/${product.slug}`;
          const imageUrl = variant.imageUrl || product.mainImage || 'https://casepro.es/placeholder.jpg';
          const price = `${variant.price.toFixed(2)} USD`;
          const availability = (variant.stock && variant.stock > 0) ? 'in stock' : 'out of stock';

          xml += `
    <item>
      <g:id>${variant.id}</g:id>
      <g:title>${title}</g:title>
      <g:description>${description}</g:description>
      <g:link>${productUrl}</g:link>
      <g:image_link>${imageUrl}</g:image_link>
      <g:brand>CASEPRO</g:brand>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${price}</g:price>
      <g:sale_price>${price}</g:sale_price>
      <g:google_product_category>Electronics &gt; Communications &gt; Telephony &gt; Mobile Phone Accessories &gt; Mobile Phone Cases</g:google_product_category>
      <g:product_type>Phone Cases &gt; iPhone Cases</g:product_type>
      <g:mpn>${variant.sku || variant.id}</g:mpn>
      <g:item_group_id>${product.id}</g:item_group_id>
      <g:color>${escapeXML(variant.color || 'N/A')}</g:color>
      <g:shipping>
        <g:country>PE</g:country>
        <g:service>Standard</g:service>
        <g:price>5.00 USD</g:price>
      </g:shipping>
    </item>`;
        });
      } else {
        // Si no tiene variantes, crear un item para el producto base
        itemCount++;

        const escapeXML = (str) => {
          if (!str) return '';
          return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
        };

        const title = escapeXML(product.name);
        const description = escapeXML(product.description || `Carcasa para ${product.category || 'iPhone'}. Protección premium.`);
        const productUrl = `https://casepro.es/product/${product.slug}`;
        const imageUrl = product.mainImage || 'https://casepro.es/placeholder.jpg';
        const price = `${(product.basePrice || 0).toFixed(2)} USD`;
        const availability = (product.stock && product.stock > 0) ? 'in stock' : 'out of stock';

        xml += `
    <item>
      <g:id>${product.id}</g:id>
      <g:title>${title}</g:title>
      <g:description>${description}</g:description>
      <g:link>${productUrl}</g:link>
      <g:image_link>${imageUrl}</g:image_link>
      <g:brand>CASEPRO</g:brand>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${price}</g:price>
      <g:sale_price>${price}</g:sale_price>
      <g:google_product_category>Electronics &gt; Communications &gt; Telephony &gt; Mobile Phone Accessories &gt; Mobile Phone Cases</g:google_product_category>
      <g:product_type>Phone Cases &gt; iPhone Cases</g:product_type>
      <g:mpn>${product.sku || product.id}</g:mpn>
    </item>`;
      }
    });

    xml += `
  </channel>
</rss>`;

    console.log(`✅ Product Feed generado: ${itemCount} productos`);

    // Enviar XML con headers correctos
    res.set({
      'Content-Type': 'text/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
    });

    res.send(xml);

  } catch (error) {
    console.error('❌ Error generando Facebook Product Feed:', error);

    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('Error cerrando Prisma:', disconnectError);
    }

    res.status(500).send('<?xml version="1.0"?><error>Error generating feed</error>');
  }
});

// Endpoint de prueba para verificar cuántos productos se exportarían
router.get('/stats', async (req, res) => {
  const prisma = new PrismaClient();

  try {
    const productCount = await prisma.product.count({
      where: { status: 'ACTIVE' }
    });

    const variantCount = await prisma.productVariant.count({
      where: { isActive: true }
    });

    await prisma.$disconnect();

    res.json({
      success: true,
      stats: {
        activeProducts: productCount,
        activeVariants: variantCount,
        totalItems: variantCount > 0 ? variantCount : productCount
      },
      feedUrl: 'https://casepro.es/api/facebook/product-feed'
    });

  } catch (error) {
    console.error('❌ Error obteniendo stats:', error);

    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('Error cerrando Prisma:', disconnectError);
    }

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
