// backend/src/routes/reviews.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const cloudinaryService = require('../services/cloudinaryService');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dropshipping-super-secret-key-2024';

// Middleware para verificar admin (opcional)
function verifyAdmin(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token requerido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Acceso denegado' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token inválido' });
  }
}

/**
 * GET /api/reviews/product/:productId - Obtener reviews de un producto (PÚBLICO)
 */
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sortBy = 'recent' } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Determinar ordenamiento
    let orderBy = {};
    if (sortBy === 'recent') {
      orderBy = { createdAt: 'desc' };
    } else if (sortBy === 'rating_high') {
      orderBy = { rating: 'desc' };
    } else if (sortBy === 'rating_low') {
      orderBy = { rating: 'asc' };
    } else {
      orderBy = { createdAt: 'desc' };
    }

    // Solo mostrar reviews aprobadas públicamente
    const where = {
      productId,
      isApproved: true
    };

    const [reviews, total, stats] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy,
        select: {
          id: true,
          rating: true,
          title: true,
          comment: true,
          customerName: true,
          isVerified: true,
          images: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      }),
      prisma.review.count({ where }),
      // Calcular estadísticas de ratings
      prisma.review.aggregate({
        where,
        _avg: { rating: true },
        _count: { id: true }
      })
    ]);

    // Calcular distribución de ratings
    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      where,
      _count: {
        rating: true
      }
    });

    const distribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    };

    ratingDistribution.forEach(item => {
      distribution[item.rating] = item._count.rating;
    });

    res.json({
      success: true,
      data: {
        reviews: reviews.map(review => ({
          ...review,
          customerName: review.user
            ? `${review.user.firstName} ${review.user.lastName.charAt(0)}.`
            : review.customerName || 'Usuario Anónimo'
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        },
        stats: {
          averageRating: stats._avg.rating || 0,
          totalReviews: stats._count.id || 0,
          distribution
        }
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reviews',
      error: error.message
    });
  }
});

/**
 * POST /api/reviews - Crear una nueva review (PÚBLICO)
 */
router.post('/', async (req, res) => {
  try {
    const {
      productId,
      rating,
      title,
      comment,
      customerName,
      customerEmail,
      userId
    } = req.body;

    // Validaciones
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'ID de producto es requerido'
      });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating debe ser entre 1 y 5'
      });
    }

    if (!userId && !customerName) {
      return res.status(400).json({
        success: false,
        message: 'Nombre es requerido para reviews anónimas'
      });
    }

    // Verificar que el producto existe
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Verificar si el usuario compró el producto (si está autenticado)
    let isVerified = false;
    if (userId) {
      const purchasedOrder = await prisma.order.findFirst({
        where: {
          userId,
          paymentStatus: 'PAID',
          items: {
            some: {
              productId
            }
          }
        }
      });

      isVerified = !!purchasedOrder;
    }

    // Upload images to Cloudinary if any
    let imageUrls = [];
    if (req.files && req.files.images) {
      try {
        const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
        const uploadedImages = await cloudinaryService.uploadMultipleImages(images, {
          folder: `dropshipping-reviews/${productId}`
        });
        imageUrls = uploadedImages.map(img => img.url);
        console.log(`📸 ${imageUrls.length} imágenes subidas para review`);
      } catch (uploadError) {
        console.error('Error uploading review images:', uploadError);
        // Continue without images if upload fails
      }
    }

    // Crear review
    const review = await prisma.review.create({
      data: {
        productId,
        userId: userId || null,
        rating: parseInt(rating),
        title: title || null,
        comment: comment || null,
        customerName: !userId ? customerName : null,
        customerEmail: !userId ? customerEmail : null,
        images: imageUrls.length > 0 ? JSON.stringify(imageUrls) : null,
        isVerified,
        isApproved: false // Requiere aprobación del admin
      }
    });

    console.log(`✅ Review creada para producto ${productId} - Rating: ${rating}⭐${imageUrls.length > 0 ? ` (con ${imageUrls.length} fotos)` : ''}`);

    res.status(201).json({
      success: true,
      message: 'Review enviada exitosamente. Será publicada después de moderación.',
      data: review
    });

  } catch (error) {
    console.error('❌ Error creando review:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear review',
      error: error.message
    });
  }
});

/**
 * GET /api/reviews - Obtener todas las reviews (ADMIN)
 */
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, productId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if (status === 'pending') {
      where.isApproved = false;
    } else if (status === 'approved') {
      where.isApproved = true;
    }

    if (productId) {
      where.productId = productId;
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      }),
      prisma.review.count({ where })
    ]);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('❌ Error listando reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error al listar reviews',
      error: error.message
    });
  }
});

/**
 * PUT /api/reviews/:id/approve - Aprobar review (ADMIN)
 */
router.put('/:id/approve', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const review = await prisma.review.update({
      where: { id },
      data: {
        isApproved: isApproved === true || isApproved === 'true'
      }
    });

    console.log(`✅ Review ${isApproved ? 'aprobada' : 'rechazada'}: ${id}`);

    res.json({
      success: true,
      message: `Review ${isApproved ? 'aprobada' : 'rechazada'} exitosamente`,
      data: review
    });

  } catch (error) {
    console.error('❌ Error aprobando review:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Review no encontrada'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al aprobar review',
      error: error.message
    });
  }
});

/**
 * DELETE /api/reviews/:id - Eliminar review (ADMIN)
 */
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.review.delete({
      where: { id }
    });

    console.log(`🗑️ Review eliminada: ${id}`);

    res.json({
      success: true,
      message: 'Review eliminada exitosamente'
    });

  } catch (error) {
    console.error('❌ Error eliminando review:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Review no encontrada'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al eliminar review',
      error: error.message
    });
  }
});

/**
 * GET /api/reviews/stats - Estadísticas generales (ADMIN)
 */
router.get('/stats/summary', verifyAdmin, async (req, res) => {
  try {
    const [total, pending, approved, averageRating] = await Promise.all([
      prisma.review.count(),
      prisma.review.count({ where: { isApproved: false } }),
      prisma.review.count({ where: { isApproved: true } }),
      prisma.review.aggregate({
        _avg: { rating: true }
      })
    ]);

    // Top productos con más reviews
    const topReviewedProducts = await prisma.product.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            reviews: {
              where: { isApproved: true }
            }
          }
        }
      },
      orderBy: {
        reviews: {
          _count: 'desc'
        }
      }
    });

    res.json({
      success: true,
      data: {
        total,
        pending,
        approved,
        averageRating: averageRating._avg.rating || 0,
        topReviewedProducts: topReviewedProducts.map(p => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          reviewCount: p._count.reviews
        }))
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
});

module.exports = router;
