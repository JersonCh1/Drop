// backend/src/routes/products-prisma.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const cloudinaryService = require('../services/cloudinaryService');

const prisma = new PrismaClient();

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
      categories, // Array de categorías
      search,
      featured,
      priceMin,
      priceMax,
      rating,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Normalize sortOrder to lowercase for Prisma
    const normalizedSortOrder = sortOrder.toLowerCase();

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Construir filtros
    const where = {
      isActive: true,
      ...(category && {
        category: {
          slug: category
        }
      }),
      ...(categories && {
        categoryId: {
          in: Array.isArray(categories) ? categories : [categories]
        }
      }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { brand: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(featured === 'true' && { isFeatured: true }),
      ...(priceMin && { basePrice: { gte: parseFloat(priceMin) } }),
      ...(priceMax && { basePrice: { lte: parseFloat(priceMax) } })
    };

    // Obtener productos
    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        images: {
          orderBy: { position: 'asc' }
        },
        variants: {
          where: { isActive: true }
        },
        reviews: {
          where: { isApproved: true },
          select: { rating: true }
        }
      },
      skip: offset,
      take: parseInt(limit),
      orderBy: {
        [sortBy]: normalizedSortOrder
      }
    });

    // Contar total
    const total = await prisma.product.count({ where });

    // Agregar rating promedio
    const productsWithRating = products.map(product => ({
      ...product,
      avgRating: product.reviews.length > 0
        ? (product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(2)
        : null,
      reviewCount: product.reviews.length,
      reviews: undefined // Remover el array de reviews para no enviarlo
    }));

    res.json({
      success: true,
      data: productsWithRating,
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

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: {
          orderBy: { position: 'asc' }
        },
        variants: {
          where: { isActive: true }
        },
        reviews: {
          where: { isApproved: true },
          include: {
            user: {
              select: { firstName: true, lastName: true }
            }
          }
        }
      }
    });

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Calcular rating promedio
    const avgRating = product.reviews.length > 0
      ? (product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(2)
      : null;

    res.json({
      success: true,
      data: {
        ...product,
        avgRating,
        reviewCount: product.reviews.length
      }
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
      salePrice,
      supplierPrice,
      categoryId,
      brand,
      model,
      compatibility,
      isFeatured,
      isActive,
      inStock,
      stock,
      stockCount,
      metaTitle,
      metaDescription,
      images,
      supplier,
      cjProductId,
      tags,
      specifications,
      variants
    } = req.body;

    // Validaciones básicas
    if (!name || !slug || !basePrice || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Campos requeridos: name, slug, basePrice, categoryId'
      });
    }

    // Limpiar descripción HTML si es producto de CJ
    let cleanDescription = description;
    if (supplier === 'CJ_DROPSHIPPING' && description) {
      // Extraer solo el texto sin HTML, pero mantener la estructura básica
      cleanDescription = description
        // Primero remover todos los tags de script y style
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<style[^>]*>.*?<\/style>/gi, '')
        // Remover todos los tags de imagen completamente (incluyendo URLs)
        .replace(/<img[^>]*>/gi, '')
        // Remover URLs de imagen sueltas (http/https que terminan en .jpg, .png, etc)
        .replace(/https?:\/\/[^\s<>"]+?\.(jpg|jpeg|png|gif|webp|bmp)(\?[^\s<>"]*)?/gi, '')
        // Remover otros tags HTML pero preservar su contenido
        .replace(/<div[^>]*>/gi, '\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<p[^>]*>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<li[^>]*>/gi, '\n• ')
        .replace(/<\/li>/gi, '')
        .replace(/<ul[^>]*>/gi, '\n')
        .replace(/<\/ul>/gi, '\n')
        .replace(/<ol[^>]*>/gi, '\n')
        .replace(/<\/ol>/gi, '\n')
        .replace(/<h[1-6][^>]*>/gi, '\n\n')
        .replace(/<\/h[1-6]>/gi, '\n')
        .replace(/<strong[^>]*>/gi, '')
        .replace(/<\/strong>/gi, '')
        .replace(/<b[^>]*>/gi, '')
        .replace(/<\/b>/gi, '')
        .replace(/<em[^>]*>/gi, '')
        .replace(/<\/em>/gi, '')
        .replace(/<i[^>]*>/gi, '')
        .replace(/<\/i>/gi, '')
        // Remover cualquier otro tag HTML restante
        .replace(/<[^>]+>/g, '')
        // Limpiar entidades HTML
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        // Remover tabs y espacios múltiples
        .replace(/\t/g, '')
        .replace(/  +/g, ' ')
        // Dividir en líneas, limpiar y filtrar
        .split('\n')
        .map(line => line.trim())
        .filter(line => {
          // Filtrar líneas vacías
          if (line.length === 0) return false;
          // Filtrar líneas que son solo URLs
          if (/^https?:\/\//i.test(line)) return false;
          // Filtrar líneas que son códigos extraños (menos de 3 caracteres o solo símbolos)
          if (line.length < 3) return false;
          if (/^[^a-zA-Z0-9]+$/.test(line)) return false;
          return true;
        })
        .join('\n')
        .trim();

      // Si la descripción limpia está vacía o muy corta, usar el nombre del producto
      if (!cleanDescription || cleanDescription.length < 10) {
        cleanDescription = `${name}\n\nProducto importado desde CJ Dropshipping con envío directo.`;
      }
    }

    // Verificar si el slug ya existe y agregar sufijo si es necesario
    let finalSlug = slug;
    const existingProduct = await prisma.product.findUnique({
      where: { slug: finalSlug }
    });

    if (existingProduct) {
      // Agregar timestamp para hacer el slug único
      finalSlug = `${slug}-${Date.now()}`;
    }

    // Crear producto
    const product = await prisma.product.create({
      data: {
        name,
        slug: finalSlug,
        description: cleanDescription,
        basePrice: parseFloat(salePrice || basePrice),
        supplierPrice: supplierPrice ? parseFloat(supplierPrice) : null,
        categoryId,
        brand,
        model,
        compatibility,
        isFeatured: isFeatured || false,
        isActive: isActive !== false,
        inStock: inStock !== false,
        stockCount: stock || stockCount || 9999,
        metaTitle: metaTitle || name,
        metaDescription: metaDescription || cleanDescription?.substring(0, 160),
        supplierProductId: cjProductId || null,
        supplierUrl: supplier === 'CJ_DROPSHIPPING' && cjProductId
          ? `https://www.cjdropshipping.com/product/${cjProductId}.html`
          : null
      }
    });

    // Crear imágenes si se proporcionaron
    if (images && Array.isArray(images) && images.length > 0) {
      const imageData = images.map((url, index) => ({
        productId: product.id,
        url,
        position: index,
        altText: `${name} - imagen ${index + 1}`,
        isMain: index === 0
      }));

      await prisma.productImage.createMany({
        data: imageData
      });
    }

    // Crear variantes si se proporcionaron (para productos de CJ)
    if (variants && Array.isArray(variants) && variants.length > 0) {
      const variantData = variants.map((variant) => ({
        productId: product.id,
        sku: variant.variantSku || variant.sku || `${product.id}-${variant.variantKey || Math.random().toString(36).substring(7)}`,
        name: variant.variantNameEn || variant.name || variant.variantKey || 'Default',
        price: parseFloat(variant.variantSellPrice || variant.price || product.basePrice),
        stockQuantity: 9999, // CJ tiene stock ilimitado
        color: variant.variantKey || null,
        supplierProductId: variant.vid || null
      }));

      await prisma.productVariant.createMany({
        data: variantData
      });
    }

    console.log(`✅ Producto creado: ${product.name} (${images?.length || 0} imágenes, ${variants?.length || 0} variantes)`);

    // Obtener el producto completo con imágenes y variantes
    const fullProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        category: true,
        images: {
          orderBy: { position: 'asc' }
        },
        variants: {
          where: { isActive: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: fullProduct
    });

  } catch (error) {
    console.error('❌ Error creando producto:', error);

    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'El slug ya existe'
      });
    }

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
    const updateData = { ...req.body };

    // Convertir basePrice a número si está presente
    if (updateData.basePrice) {
      updateData.basePrice = parseFloat(updateData.basePrice);
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData
    });

    console.log(`✅ Producto actualizado: ${product.name}`);

    res.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: product
    });

  } catch (error) {
    console.error('❌ Error actualizando producto:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

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

    // Soft delete - solo marcar como inactivo
    const product = await prisma.product.update({
      where: { id },
      data: { isActive: false }
    });

    console.log(`🗑️  Producto desactivado: ${product.name}`);

    res.json({
      success: true,
      message: 'Producto desactivado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error eliminando producto:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

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

    // Verificar que el producto existe
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
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
      const productImage = await prisma.productImage.create({
        data: {
          productId: id,
          url: image.url,
          altText: product.name,
          position: i,
          isMain: i === 0
        }
      });
      insertedImages.push(productImage);
    }

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

    const variant = await prisma.productVariant.create({
      data: {
        productId: id,
        name,
        color,
        price: parseFloat(price),
        sku,
        stockQuantity: stockQuantity || 0
      }
    });

    console.log(`✅ Variante creada: ${variant.name}`);

    res.status(201).json({
      success: true,
      message: 'Variante creada exitosamente',
      data: variant
    });

  } catch (error) {
    console.error('❌ Error creando variante:', error);

    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'El SKU ya existe'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// POST /api/products/:id/set-hero-banner - Establecer producto como banner principal
router.post('/:id/set-hero-banner', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;

    // First, remove isHeroBanner from all products
    await prisma.product.updateMany({
      where: { isHeroBanner: true },
      data: { isHeroBanner: false }
    });

    // Then set this product as the hero banner
    const product = await prisma.product.update({
      where: { id },
      data: { isHeroBanner: true },
      include: {
        images: {
          orderBy: { position: 'asc' }
        },
        variants: true,
        category: true
      }
    });

    res.json({
      success: true,
      message: 'Producto establecido como banner principal',
      data: product
    });

  } catch (error) {
    console.error('❌ Error estableciendo producto como banner:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// GET /api/products/hero-banner - Obtener producto del banner principal
router.get('/hero-banner/current', async (req, res) => {
  try {
    const heroBannerProduct = await prisma.product.findFirst({
      where: {
        isHeroBanner: true,
        isActive: true
      },
      include: {
        images: {
          orderBy: { position: 'asc' }
        },
        variants: true,
        category: true
      }
    });

    if (!heroBannerProduct) {
      return res.json({
        success: true,
        message: 'No hay producto establecido como banner principal',
        data: null
      });
    }

    res.json({
      success: true,
      data: heroBannerProduct
    });

  } catch (error) {
    console.error('❌ Error obteniendo producto banner:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

module.exports = router;
