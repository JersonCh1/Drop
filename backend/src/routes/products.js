// backend/src/routes/products.js
const express = require('express');
const router = express.Router();
const { getDbClient } = require('../utils/database');
const analyticsService = require('../services/analyticsService');

// Middleware para verificar admin
function verifyAdminToken(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !token.startsWith('admin_')) {
    return res.status(401).json({
      success: false,
      message: 'Token de admin requerido'
    });
  }
  next();
}

// GET /api/products - Obtener todos los productos (público)
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      featured, 
      search,
      sort = 'created_at',
      order = 'DESC'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const client = await getDbClient();
    await client.connect();

    let whereClause = 'WHERE p.is_active = true';
    let params = [];
    let paramCount = 0;

    // Filtros
    if (category) {
      paramCount++;
      whereClause += ` AND c.slug = $${paramCount}`;
      params.push(category);
    }

    if (featured === 'true') {
      whereClause += ' AND p.is_featured = true';
    }

    if (search) {
      paramCount++;
      whereClause += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    // Validar campo de ordenamiento
    const validSortFields = ['created_at', 'name', 'base_price', 'stock_count'];
    const sortField = validSortFields.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const query = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        (
          SELECT json_agg(
            json_build_object(
              'id', pv.id,
              'name', pv.name,
              'color', pv.color,
              'price', pv.price,
              'compare_price', pv.compare_price,
              'sku', pv.sku,
              'stock_quantity', pv.stock_quantity,
              'is_active', pv.is_active
            )
          )
          FROM product_variants pv 
          WHERE pv.product_id = p.id AND pv.is_active = true
        ) as variants,
        (
          SELECT json_agg(
            json_build_object(
              'id', pi.id,
              'url', pi.url,
              'alt_text', pi.alt_text,
              'position', pi.position,
              'is_main', pi.is_main
            )
            ORDER BY pi.position
          )
          FROM product_images pi 
          WHERE pi.product_id = p.id
        ) as images,
        (
          SELECT COALESCE(AVG(rating), 0)
          FROM reviews r 
          WHERE r.product_id = p.id AND r.is_approved = true
        ) as avg_rating,
        (
          SELECT COUNT(*)
          FROM reviews r 
          WHERE r.product_id = p.id AND r.is_approved = true
        ) as review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY p.${sortField} ${sortOrder}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    params.push(parseInt(limit), offset);

    const result = await client.query(query, params);

    // Contar total para paginación
    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
    `;

    const countResult = await client.query(countQuery, params.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);

    await client.end();

    // Track analytics si hay sessionId
    if (req.headers['x-session-id']) {
      await analyticsService.trackPageView(
        req.headers['x-session-id'], 
        'products',
        null,
        req.ip,
        req.get('User-Agent')
      );
    }

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// GET /api/products/:slug - Obtener producto por slug (público)
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const client = await getDbClient();
    await client.connect();

    const result = await client.query(`
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        (
          SELECT json_agg(
            json_build_object(
              'id', pv.id,
              'name', pv.name,
              'color', pv.color,
              'size', pv.size,
              'material', pv.material,
              'price', pv.price,
              'compare_price', pv.compare_price,
              'sku', pv.sku,
              'stock_quantity', pv.stock_quantity,
              'is_active', pv.is_active
            )
          )
          FROM product_variants pv 
          WHERE pv.product_id = p.id AND pv.is_active = true
        ) as variants,
        (
          SELECT json_agg(
            json_build_object(
              'id', pi.id,
              'url', pi.url,
              'alt_text', pi.alt_text,
              'position', pi.position,
              'is_main', pi.is_main
            )
            ORDER BY pi.position
          )
          FROM product_images pi 
          WHERE pi.product_id = p.id
        ) as images,
        (
          SELECT COALESCE(AVG(rating), 0)
          FROM reviews r 
          WHERE r.product_id = p.id AND r.is_approved = true
        ) as avg_rating,
        (
          SELECT COUNT(*)
          FROM reviews r 
          WHERE r.product_id = p.id AND r.is_approved = true
        ) as review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = $1 AND p.is_active = true
    `, [slug]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    const product = result.rows[0];

    // Obtener reseñas del producto
    const reviewsResult = await client.query(`
      SELECT 
        r.*,
        CASE 
          WHEN r.user_id IS NOT NULL THEN CONCAT(u.first_name, ' ', SUBSTRING(u.last_name, 1, 1), '.')
          ELSE r.customer_name
        END as reviewer_name
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.product_id = $1 AND r.is_approved = true
      ORDER BY r.created_at DESC
      LIMIT 10
    `, [product.id]);

    product.reviews = reviewsResult.rows;

    // Obtener productos relacionados
    const relatedResult = await client.query(`
      SELECT 
        p.id, p.name, p.slug, p.base_price,
        (
          SELECT url FROM product_images 
          WHERE product_id = p.id AND is_main = true 
          LIMIT 1
        ) as main_image
      FROM products p
      WHERE p.category_id = $1 
        AND p.id != $2 
        AND p.is_active = true
      ORDER BY p.is_featured DESC, p.created_at DESC
      LIMIT 4
    `, [product.category_id, product.id]);

    product.related_products = relatedResult.rows;

    await client.end();

    // Track product view
    if (req.headers['x-session-id']) {
      await analyticsService.trackProductView(
        req.headers['x-session-id'],
        product.id,
        product.name,
        null
      );
    }

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Error obteniendo producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// POST /api/products - Crear producto (admin)
router.post('/', verifyAdminToken, async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      basePrice,
      brand,
      model,
      compatibility,
      categoryId,
      isFeatured = false,
      inStock = true,
      stockCount = 0,
      metaTitle,
      metaDescription
    } = req.body;

    // Validaciones básicas
    if (!name || !slug || !basePrice || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Campos requeridos: name, slug, basePrice, categoryId'
      });
    }

    const client = await getDbClient();
    await client.connect();

    // Verificar que el slug no exista
    const slugCheck = await client.query('SELECT id FROM products WHERE slug = $1', [slug]);
    if (slugCheck.rows.length > 0) {
      await client.end();
      return res.status(400).json({
        success: false,
        message: 'El slug ya existe'
      });
    }

    // Crear producto
    const result = await client.query(`
      INSERT INTO products (
        name, slug, description, base_price, brand, model, 
        compatibility, category_id, is_featured, in_stock, 
        stock_count, meta_title, meta_description
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      name, slug, description, basePrice, brand, model,
      compatibility || [], categoryId, isFeatured, inStock,
      stockCount, metaTitle, metaDescription
    ]);

    await client.end();

    console.log(`✅ Producto creado: ${name} (ID: ${result.rows[0].id})`);

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// PUT /api/products/:id - Actualizar producto (admin)
router.put('/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const client = await getDbClient();
    await client.connect();

    // Verificar que el producto existe
    const productCheck = await client.query('SELECT id FROM products WHERE id = $1', [id]);
    if (productCheck.rows.length === 0) {
      await client.end();
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Construir query dinámicamente
    const updateFields = [];
    const values = [];
    let paramCount = 0;

    const allowedFields = [
      'name', 'slug', 'description', 'base_price', 'brand', 'model',
      'compatibility', 'category_id', 'is_featured', 'in_stock',
      'stock_count', 'meta_title', 'meta_description', 'is_active'
    ];

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        paramCount++;
        updateFields.push(`${key} = $${paramCount}`);
        values.push(value);
      }
    }

    if (updateFields.length === 0) {
      await client.end();
      return res.status(400).json({
        success: false,
        message: 'No hay campos válidos para actualizar'
      });
    }

    // Agregar updated_at
    paramCount++;
    updateFields.push(`updated_at = $${paramCount}`);
    values.push(new Date());

    // Agregar ID para WHERE
    paramCount++;
    values.push(id);

    const query = `
      UPDATE products 
      SET ${updateFields.join(', ')}
      WHERE id = ${paramCount}
      RETURNING *
    `;

    const result = await client.query(query, values);
    await client.end();

    console.log(`✅ Producto actualizado: ${id}`);

    res.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error actualizando producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// DELETE /api/products/:id - Eliminar producto (admin)
router.delete('/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;

    const client = await getDbClient();
    await client.connect();

    // Verificar que el producto existe
    const productCheck = await client.query('SELECT name FROM products WHERE id = $1', [id]);
    if (productCheck.rows.length === 0) {
      await client.end();
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    const productName = productCheck.rows[0].name;

    // Soft delete - marcar como inactivo en lugar de eliminar
    await client.query(`
      UPDATE products 
      SET is_active = false, updated_at = NOW()
      WHERE id = $1
    `, [id]);

    await client.end();

    console.log(`🗑️ Producto eliminado (soft delete): ${productName}`);

    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// GET /api/products/:id/variants - Obtener variantes de producto
router.get('/:id/variants', async (req, res) => {
  try {
    const { id } = req.params;

    const client = await getDbClient();
    await client.connect();

    const result = await client.query(`
      SELECT 
        pv.*,
        (
          SELECT json_agg(
            json_build_object(
              'id', pi.id,
              'url', pi.url,
              'alt_text', pi.alt_text,
              'position', pi.position,
              'is_main', pi.is_main
            )
            ORDER BY pi.position
          )
          FROM product_images pi 
          WHERE pi.variant_id = pv.id
        ) as images
      FROM product_variants pv
      WHERE pv.product_id = $1 AND pv.is_active = true
      ORDER BY pv.created_at ASC
    `, [id]);

    await client.end();

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Error obteniendo variantes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// POST /api/products/:id/variants - Crear variante de producto (admin)
router.post('/:id/variants', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      color,
      size,
      material,
      price,
      comparePrice,
      sku,
      stockQuantity = 0,
      supplierProductId,
      supplierUrl,
      supplierPrice
    } = req.body;

    if (!name || !price || !sku) {
      return res.status(400).json({
        success: false,
        message: 'Campos requeridos: name, price, sku'
      });
    }

    const client = await getDbClient();
    await client.connect();

    // Verificar que el producto existe
    const productCheck = await client.query('SELECT id FROM products WHERE id = $1', [id]);
    if (productCheck.rows.length === 0) {
      await client.end();
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Verificar que el SKU no exista
    const skuCheck = await client.query('SELECT id FROM product_variants WHERE sku = $1', [sku]);
    if (skuCheck.rows.length > 0) {
      await client.end();
      return res.status(400).json({
        success: false,
        message: 'El SKU ya existe'
      });
    }

    // Crear variante
    const result = await client.query(`
      INSERT INTO product_variants (
        product_id, name, color, size, material, price, compare_price,
        sku, stock_quantity, supplier_product_id, supplier_url, supplier_price
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      id, name, color, size, material, price, comparePrice,
      sku, stockQuantity, supplierProductId, supplierUrl, supplierPrice
    ]);

    await client.end();

    console.log(`✅ Variante creada: ${name} (SKU: ${sku})`);

    res.status(201).json({
      success: true,
      message: 'Variante creada exitosamente',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error creando variante:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// GET /api/products/:id/reviews - Obtener reseñas de producto
router.get('/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const client = await getDbClient();
    await client.connect();

    const result = await client.query(`
      SELECT 
        r.*,
        CASE 
          WHEN r.user_id IS NOT NULL THEN CONCAT(u."firstName", ' ', SUBSTRING(u."lastName", 1, 1), '.')
          ELSE r.customer_name
        END as reviewer_name
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.product_id = $1 AND r.is_approved = true
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `, [id, parseInt(limit), offset]);

    // Contar total
    const countResult = await client.query(`
      SELECT COUNT(*) as total
      FROM reviews 
      WHERE product_id = $1 AND is_approved = true
    `, [id]);

    const total = parseInt(countResult.rows[0].total);

    await client.end();

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error obteniendo reseñas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// POST /api/products/:id/reviews - Crear reseña de producto
router.post('/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      rating,
      title,
      comment,
      customerName,
      customerEmail,
      userId = null
    } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating debe ser entre 1 y 5'
      });
    }

    if (!userId && (!customerName || !customerEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere customerName y customerEmail para usuarios anónimos'
      });
    }

    const client = await getDbClient();
    await client.connect();

    // Verificar que el producto existe
    const productCheck = await client.query('SELECT id FROM products WHERE id = $1', [id]);
    if (productCheck.rows.length === 0) {
      await client.end();
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Crear reseña
    const result = await client.query(`
      INSERT INTO reviews (
        product_id, user_id, customer_name, customer_email,
        rating, title, comment, is_approved
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      id, userId, customerName, customerEmail,
      rating, title, comment, false // Requiere aprobación manual
    ]);

    await client.end();

    console.log(`⭐ Reseña creada para producto ${id}: ${rating} estrellas`);

    res.status(201).json({
      success: true,
      message: 'Reseña enviada exitosamente. Será revisada antes de publicarse.',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error creando reseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// GET /api/products/:id/analytics - Obtener analytics de producto (admin)
router.get('/:id/analytics', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const analytics = await analyticsService.getProductAnalytics(id);

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Error obteniendo analytics del producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

module.exports = router;