// backend/src/routes/coupons.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dropshipping-super-secret-key-2024';

// Middleware para verificar admin
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
 * 🎫 SISTEMA DE CUPONES Y DESCUENTOS
 */

// POST /api/coupons/validate - Validar cupón (PÚBLICO)
router.post('/validate', async (req, res) => {
  try {
    const { code, subtotal, userId } = req.body;

    if (!code || !subtotal) {
      return res.status(400).json({
        success: false,
        message: 'Código y subtotal requeridos'
      });
    }

    // Buscar cupón
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Cupón no válido'
      });
    }

    // Validaciones
    const now = new Date();

    // 1. Está activo?
    if (!coupon.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Este cupón ya no está disponible'
      });
    }

    // 2. Está dentro de las fechas?
    if (coupon.startDate && now < coupon.startDate) {
      return res.status(400).json({
        success: false,
        message: 'Este cupón aún no está disponible'
      });
    }

    if (coupon.endDate && now > coupon.endDate) {
      return res.status(400).json({
        success: false,
        message: 'Este cupón ha expirado'
      });
    }

    // 3. Compra mínima
    if (coupon.minPurchase && subtotal < coupon.minPurchase) {
      return res.status(400).json({
        success: false,
        message: `Compra mínima requerida: S/ ${coupon.minPurchase.toFixed(2)}`
      });
    }

    // 4. Límite de usos totales
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: 'Este cupón ha alcanzado su límite de usos'
      });
    }

    // 5. Solo primera orden? (TODO: verificar con userId)
    if (coupon.firstOrderOnly && userId) {
      const userOrders = await prisma.order.count({
        where: { userId, paymentStatus: 'PAID' }
      });

      if (userOrders > 0) {
        return res.status(400).json({
          success: false,
          message: 'Este cupón es solo para primera compra'
        });
      }
    }

    // Calcular descuento
    let discountAmount = 0;

    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (subtotal * coupon.discountValue) / 100;

      // Aplicar descuento máximo si existe
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else if (coupon.discountType === 'FIXED') {
      discountAmount = coupon.discountValue;
    }

    // No puede ser más que el subtotal
    if (discountAmount > subtotal) {
      discountAmount = subtotal;
    }

    const newTotal = Math.max(0, subtotal - discountAmount);

    console.log(`✅ Cupón ${code} validado: -S/ ${discountAmount.toFixed(2)}`);

    res.json({
      success: true,
      message: 'Cupón aplicado exitosamente',
      data: {
        couponId: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        freeShipping: coupon.freeShipping,
        description: coupon.description,
        newTotal: parseFloat(newTotal.toFixed(2))
      }
    });

  } catch (error) {
    console.error('❌ Error validando cupón:', error);
    res.status(500).json({
      success: false,
      message: 'Error al validar cupón',
      error: error.message
    });
  }
});

// POST /api/coupons - Crear cupón (ADMIN)
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      usageLimit,
      perUserLimit,
      startDate,
      endDate,
      description,
      freeShipping,
      firstOrderOnly
    } = req.body;

    // Validaciones
    if (!code || !discountType || !discountValue) {
      return res.status(400).json({
        success: false,
        message: 'Campos requeridos: code, discountType, discountValue'
      });
    }

    if (!['PERCENTAGE', 'FIXED'].includes(discountType)) {
      return res.status(400).json({
        success: false,
        message: 'discountType debe ser PERCENTAGE o FIXED'
      });
    }

    // Crear cupón
    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountType,
        discountValue: parseFloat(discountValue),
        minPurchase: minPurchase ? parseFloat(minPurchase) : 0,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        perUserLimit: perUserLimit ? parseInt(perUserLimit) : 1,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        description: description || null,
        freeShipping: freeShipping || false,
        firstOrderOnly: firstOrderOnly || false
      }
    });

    console.log(`✅ Cupón creado: ${coupon.code}`);

    res.status(201).json({
      success: true,
      message: 'Cupón creado exitosamente',
      data: coupon
    });

  } catch (error) {
    console.error('❌ Error creando cupón:', error);

    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un cupón con ese código'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear cupón',
      error: error.message
    });
  }
});

// GET /api/coupons - Listar cupones (ADMIN)
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const { active, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (active !== undefined) {
      where.isActive = active === 'true';
    }

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.coupon.count({ where })
    ]);

    res.json({
      success: true,
      data: coupons,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('❌ Error listando cupones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al listar cupones',
      error: error.message
    });
  }
});

// GET /api/coupons/:id - Obtener cupón (ADMIN)
router.get('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await prisma.coupon.findUnique({
      where: { id }
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Cupón no encontrado'
      });
    }

    res.json({
      success: true,
      data: coupon
    });

  } catch (error) {
    console.error('❌ Error obteniendo cupón:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cupón',
      error: error.message
    });
  }
});

// PUT /api/coupons/:id - Actualizar cupón (ADMIN)
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {};

    const allowedFields = [
      'code', 'discountType', 'discountValue', 'minPurchase', 'maxDiscount',
      'usageLimit', 'perUserLimit', 'startDate', 'endDate', 'description',
      'freeShipping', 'firstOrderOnly', 'isActive'
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (['discountValue', 'minPurchase', 'maxDiscount'].includes(field)) {
          updateData[field] = parseFloat(req.body[field]);
        } else if (['usageLimit', 'perUserLimit'].includes(field)) {
          updateData[field] = parseInt(req.body[field]);
        } else if (['startDate', 'endDate'].includes(field)) {
          updateData[field] = new Date(req.body[field]);
        } else if (['freeShipping', 'firstOrderOnly', 'isActive'].includes(field)) {
          updateData[field] = req.body[field] === true || req.body[field] === 'true';
        } else if (field === 'code') {
          updateData[field] = req.body[field].toUpperCase();
        } else {
          updateData[field] = req.body[field];
        }
      }
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: updateData
    });

    console.log(`✅ Cupón actualizado: ${coupon.code}`);

    res.json({
      success: true,
      message: 'Cupón actualizado exitosamente',
      data: coupon
    });

  } catch (error) {
    console.error('❌ Error actualizando cupón:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Cupón no encontrado'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al actualizar cupón',
      error: error.message
    });
  }
});

// DELETE /api/coupons/:id - Eliminar cupón (ADMIN)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.coupon.delete({
      where: { id }
    });

    console.log(`🗑️ Cupón eliminado: ${id}`);

    res.json({
      success: true,
      message: 'Cupón eliminado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error eliminando cupón:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Cupón no encontrado'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al eliminar cupón',
      error: error.message
    });
  }
});

// POST /api/coupons/:id/increment-usage - Incrementar uso (INTERNO)
router.post('/:id/increment-usage', async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        usageCount: {
          increment: 1
        }
      }
    });

    res.json({
      success: true,
      data: coupon
    });

  } catch (error) {
    console.error('❌ Error incrementando uso:', error);
    res.status(500).json({
      success: false,
      message: 'Error al incrementar uso',
      error: error.message
    });
  }
});

// GET /api/coupons/stats/summary - Estadísticas (ADMIN)
router.get('/stats/summary', verifyAdmin, async (req, res) => {
  try {
    const [total, active, expired] = await Promise.all([
      prisma.coupon.count(),
      prisma.coupon.count({ where: { isActive: true } }),
      prisma.coupon.count({
        where: {
          endDate: { lt: new Date() },
          isActive: true
        }
      })
    ]);

    const topCoupons = await prisma.coupon.findMany({
      take: 5,
      orderBy: { usageCount: 'desc' },
      select: {
        code: true,
        usageCount: true,
        discountType: true,
        discountValue: true
      }
    });

    res.json({
      success: true,
      data: {
        total,
        active,
        expired,
        topCoupons
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
});

module.exports = router;
