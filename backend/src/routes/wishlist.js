// backend/src/routes/wishlist.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { verifyToken } = require('../middleware/auth');

const prisma = new PrismaClient();

// Get wishlist for user
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;

    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: {
              where: { isMain: true },
              take: 1
            },
            variants: {
              where: { isActive: true },
              orderBy: { price: 'asc' },
              take: 1
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform data for frontend
    const wishlist = wishlistItems.map(item => ({
      id: item.id,
      productId: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      basePrice: item.product.basePrice,
      lowestPrice: item.product.variants.length > 0
        ? Math.min(item.product.basePrice, ...item.product.variants.map(v => v.price))
        : item.product.basePrice,
      image: item.product.images[0]?.url || null,
      inStock: item.product.inStock,
      isFeatured: item.product.isFeatured,
      addedAt: item.createdAt
    }));

    res.json({ wishlist });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ error: 'Error al obtener la lista de deseos' });
  }
});

// Add product to wishlist
router.post('/add', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'productId es requerido' });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Check if already in wishlist
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Producto ya está en la lista de deseos' });
    }

    // Add to wishlist
    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId,
        productId
      }
    });

    res.status(201).json({
      message: 'Producto añadido a la lista de deseos',
      wishlistItem
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ error: 'Error al añadir a la lista de deseos' });
  }
});

// Remove product from wishlist
router.delete('/:productId', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.params;

    const deleted = await prisma.wishlist.deleteMany({
      where: {
        userId,
        productId
      }
    });

    if (deleted.count === 0) {
      return res.status(404).json({ error: 'Producto no encontrado en la lista de deseos' });
    }

    res.json({ message: 'Producto eliminado de la lista de deseos' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ error: 'Error al eliminar de la lista de deseos' });
  }
});

// Check if product is in wishlist
router.get('/check/:productId', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.params;

    const wishlistItem = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });

    res.json({ inWishlist: !!wishlistItem });
  } catch (error) {
    console.error('Error checking wishlist:', error);
    res.status(500).json({ error: 'Error al verificar la lista de deseos' });
  }
});

// Get wishlist count
router.get('/count', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;

    const count = await prisma.wishlist.count({
      where: { userId }
    });

    res.json({ count });
  } catch (error) {
    console.error('Error getting wishlist count:', error);
    res.status(500).json({ error: 'Error al obtener el contador' });
  }
});

module.exports = router;
