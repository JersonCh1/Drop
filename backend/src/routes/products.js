// backend/src/routes/products.js
const express = require('express');
const router = express.Router();
const { getDbClient } = require('../utils/database');
const cloudinaryService = require('../services/cloudinaryService');

// Middleware para verificar admin
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dropshipping-super-secret-key-2024';

function verifyAdminToken(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token requerido'
    });
  }

  try {
    // Verificar JWT
    const decoded = jwt.verify(token, JWT_SECRET);

    // Verificar que el usuario sea ADMIN
    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requieren permisos de administrador.'
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
}

// =================== RUTAS PÚBLICAS ===================

// GET /api/products - Listar productos (público)
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      search,
      model,
      color,
      minPrice,
      maxPrice,
      featured,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
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

    if (search) {
      paramCount++;
      whereClause += ` AND (
        p.name ILIKE $${paramCount} OR
        p.description ILIKE $${paramCount} OR
        p.model ILIKE $${paramCount} OR
        EXISTS (
          SELECT 1 FROM unnest(p.compatibility) AS compat
          WHERE compat ILIKE $${paramCount}
        )
      )`;
      params.push(`%${search}%`);
    }

    if (model) {
      paramCount++;
      // Buscar si el modelo está contenido en cualquier elemento del array de compatibilidad
      whereClause += ` AND EXISTS (
        SELECT 1 FROM unnest(p.compatibility) AS compat
        WHERE compat ILIKE $${paramCount}
      )`;
      params.push(`%${model}%`);
    }

    if (minPrice) {
      paramCount++;
      whereClause += ` AND p.base_price >= $${paramCount}`;
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      paramCount++;
      whereClause += ` AND p.base_price <= $${paramCount}`;
      params.push(parseFloat(maxPrice));
    }

    if (featured === 'true') {
      whereClause += ' AND p.is_featured = true';
    }

    // Determinar orden
    const validSortFields = {
      'createdAt': 'p.created_at',
      'price': 'p.base_price',
      'name': 'p.name'
    };
    const orderByField = validSortFields[sortBy] || 'p.created_at';
    const orderByDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Query principal
    const result = await client.query(`
      SELECT
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', pi.id,
              'url', pi.url,
              'altText', pi.alt_text,
              'position', pi.position,
              'isMain', pi.is_main
            )
          ) FILTER (WHERE pi.id IS NOT NULL),
          '[]'::json
        ) as images,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', pv.id,
              'name', pv.name,
              'color', pv.color,
              'price', pv.price,
              'sku', pv.sku,
              'stockQuantity', pv.stock_quantity,
              'isActive', pv.is_active
            )
          ) FILTER (WHERE pv.id IS NOT NULL),
          '[]'::json
        ) as variants,
        (SELECT AVG(rating)::numeric(3,2) FROM reviews WHERE product_id = p.id AND is_approved = true) as avg_rating,
        (SELECT COUNT(*) FROM reviews WHERE product_id = p.id AND is_approved = true) as review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      LEFT JOIN product_variants pv ON p.id = pv.product_id
      ${whereClause}
      GROUP BY p.id, c.name, c.slug
      ORDER BY ${orderByField} ${orderByDirection}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `, [...params, parseInt(limit), offset]);

    // Contar total
    const countResult = await client.query(`
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
    `, params);

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
    console.error('❌ Error obteniendo productos:', error);
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
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', pi.id,
              'url', pi.url,
              'altText', pi.alt_text,
              'position', pi.position,
              'isMain', pi.is_main
            ) ORDER BY pi.position
          ) FILTER (WHERE pi.id IS NOT NULL),
          '[]'::json
        ) as images,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', pv.id,
              'name', pv.name,
              'color', pv.color,
              'price', pv.price,
              'comparePrice', pv.compare_price,
              'sku', pv.sku,
              'stockQuantity', pv.stock_quantity,
              'isActive', pv.is_active
            )
          ) FILTER (WHERE pv.id IS NOT NULL),
          '[]'::json
        ) as variants,
        (SELECT AVG(rating)::numeric(3,2) FROM reviews WHERE product_id = p.id AND is_approved = true) as avg_rating,
        (SELECT COUNT(*) FROM reviews WHERE product_id = p.id AND is_approved = true) as review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      LEFT JOIN product_variants pv ON p.id = pv.product_id
      WHERE p.slug = $1 AND p.is_active = true
      GROUP BY p.id, c.name, c.slug
    `, [slug]);

    if (result.rows.length === 0) {
      await client.end();
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    await client.end();

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error obteniendo producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// =================== RUTAS ADMIN ===================

// POST /api/products - Crear producto (admin)
router.post('/', verifyAdminToken, async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      basePrice,
      categoryId,
      brand,
      model,
      compatibility,
      isFeatured,
      inStock,
      stockCount,
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

    // Verificar si el slug ya existe
    const slugCheck = await client.query('SELECT id FROM products WHERE slug = $1', [slug]);
    if (slugCheck.rows.length > 0) {
      await client.end();
      return res.status(400).json({
        success: false,
        message: 'El slug ya existe'
      });
    }

    // Insertar producto
    const result = await client.query(`
      INSERT INTO products (
        name, slug, description, base_price, category_id, brand, model,
        compatibility, is_featured, in_stock, stock_count,
        meta_title, meta_description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      name,
      slug,
      description || null,
      basePrice,
      categoryId,
      brand || null,
      model || null,
      compatibility || [],
      isFeatured || false,
      inStock !== false,
      stockCount || 0,
      metaTitle || name,
      metaDescription || description
    ]);

    await client.end();

    console.log(`✅ Producto creado: ${result.rows[0].name}`);

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error creando producto:', error);
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
    const updateFields = req.body;

    const client = await getDbClient();
    await client.connect();

    // Verificar que el producto existe
    const productCheck = await client.query('SELECT * FROM products WHERE id = $1', [id]);
    if (productCheck.rows.length === 0) {
      await client.end();
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Construir query de actualización dinámica
    const allowedFields = [
      'name', 'slug', 'description', 'base_price', 'category_id', 'brand', 'model',
      'compatibility', 'is_active', 'is_featured', 'in_stock', 'stock_count',
      'meta_title', 'meta_description'
    ];

    const updates = [];
    const values = [];
    let paramCount = 0;

    Object.keys(updateFields).forEach(field => {
      const snakeField = field.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      if (allowedFields.includes(snakeField)) {
        paramCount++;
        updates.push(`${snakeField} = $${paramCount}`);
        values.push(updateFields[field]);
      }
    });

    if (updates.length === 0) {
      await client.end();
      return res.status(400).json({
        success: false,
        message: 'No hay campos válidos para actualizar'
      });
    }

    paramCount++;
    values.push(id);

    const result = await client.query(`
      UPDATE products
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    await client.end();

    console.log(`✅ Producto actualizado: ${result.rows[0].name}`);

    res.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error actualizando producto:', error);
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

    // Soft delete - solo marcar como inactivo
    const result = await client.query(`
      UPDATE products
      SET is_active = false, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      await client.end();
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    await client.end();

    console.log(`🗑️  Producto desactivado: ${result.rows[0].name}`);

    res.json({
      success: true,
      message: 'Producto desactivado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error eliminando producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// POST /api/products/:id/images - Subir imágenes de producto (admin)
router.post('/:id/images', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.files || !req.files.images) {
      return res.status(400).json({
        success: false,
        message: 'No se enviaron imágenes'
      });
    }

    const client = await getDbClient();
    await client.connect();

    // Verificar que el producto existe
    const productCheck = await client.query('SELECT * FROM products WHERE id = $1', [id]);
    if (productCheck.rows.length === 0) {
      await client.end();
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Subir imágenes a Cloudinary
    const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
    const uploadedImages = await cloudinaryService.uploadMultipleImages(images, {
      folder: `dropshipping-products/${id}`
    });

    // Guardar URLs en la base de datos
    const insertedImages = [];
    for (let i = 0; i < uploadedImages.length; i++) {
      const image = uploadedImages[i];
      const result = await client.query(`
        INSERT INTO product_images (product_id, url, alt_text, position, is_main)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [id, image.url, productCheck.rows[0].name, i, i === 0]);

      insertedImages.push(result.rows[0]);
    }

    await client.end();

    console.log(`✅ ${insertedImages.length} imágenes subidas para producto ${id}`);

    res.status(201).json({
      success: true,
      message: 'Imágenes subidas exitosamente',
      data: insertedImages
    });

  } catch (error) {
    console.error('❌ Error subiendo imágenes:', error);
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
    const { name, color, price, sku, stockQuantity } = req.body;

    if (!name || !price || !sku) {
      return res.status(400).json({
        success: false,
        message: 'Campos requeridos: name, price, sku'
      });
    }

    const client = await getDbClient();
    await client.connect();

    const result = await client.query(`
      INSERT INTO product_variants (product_id, name, color, price, sku, stock_quantity)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [id, name, color || null, price, sku, stockQuantity || 0]);

    await client.end();

    console.log(`✅ Variante creada: ${result.rows[0].name}`);

    res.status(201).json({
      success: true,
      message: 'Variante creada exitosamente',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error creando variante:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

module.exports = router;
