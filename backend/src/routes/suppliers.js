// backend/src/routes/suppliers.js
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
    return res.status(401).json({
      success: false,
      message: 'Token requerido'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

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

// =================== PROVEEDORES ===================

// GET /api/suppliers - Listar proveedores (ADMIN)
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const { active, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (active !== undefined) {
      where.isActive = active === 'true';
    }

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          _count: {
            select: {
              products: true,
              supplierOrders: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.supplier.count({ where })
    ]);

    res.json({
      success: true,
      data: suppliers.map(s => ({
        ...s,
        productsCount: s._count.products,
        ordersCount: s._count.supplierOrders,
        _count: undefined
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Error listando proveedores:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// GET /api/suppliers/:id - Obtener un proveedor (ADMIN)
router.get('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            slug: true,
            basePrice: true,
            supplierPrice: true,
            profitMargin: true,
            stockCount: true,
            isActive: true
          },
          take: 10
        },
        supplierOrders: {
          select: {
            id: true,
            status: true,
            total: true,
            createdAt: true
          },
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            products: true,
            supplierOrders: true
          }
        }
      }
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        ...supplier,
        productsCount: supplier._count.products,
        ordersCount: supplier._count.supplierOrders,
        _count: undefined
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo proveedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// POST /api/suppliers - Crear proveedor (ADMIN)
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      website,
      apiKey,
      apiEnabled,
      averageShippingDays,
      shippingCountries,
      defaultCommission,
      defaultShippingCost,
      rating,
      reliability,
      contactEmail,
      contactPhone,
      contactPerson
    } = req.body;

    // Validaciones
    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: 'Campos requeridos: name, slug'
      });
    }

    // Verificar si el slug ya existe
    const existingSupplier = await prisma.supplier.findUnique({
      where: { slug }
    });

    if (existingSupplier) {
      return res.status(400).json({
        success: false,
        message: 'El slug ya existe'
      });
    }

    // Crear proveedor
    const supplier = await prisma.supplier.create({
      data: {
        name,
        slug,
        description: description || null,
        website: website || null,
        apiKey: apiKey || null,
        apiEnabled: apiEnabled || false,
        averageShippingDays: averageShippingDays || '15-30',
        shippingCountries: shippingCountries || null,
        defaultCommission: defaultCommission ? parseFloat(defaultCommission) : 0,
        defaultShippingCost: defaultShippingCost ? parseFloat(defaultShippingCost) : 0,
        rating: rating ? parseFloat(rating) : 0,
        reliability: reliability ? parseFloat(reliability) : 100,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        contactPerson: contactPerson || null,
        isActive: true
      }
    });

    console.log(`✅ Proveedor creado: ${supplier.name}`);

    res.status(201).json({
      success: true,
      message: 'Proveedor creado exitosamente',
      data: supplier
    });
  } catch (error) {
    console.error('❌ Error creando proveedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// PUT /api/suppliers/:id - Actualizar proveedor (ADMIN)
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {};

    const allowedFields = [
      'name', 'slug', 'description', 'website', 'apiKey', 'apiEnabled',
      'averageShippingDays', 'shippingCountries', 'defaultCommission',
      'defaultShippingCost', 'rating', 'reliability', 'contactEmail',
      'contactPhone', 'contactPerson', 'isActive'
    ];

    // Construir objeto de actualización
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (['defaultCommission', 'defaultShippingCost', 'rating', 'reliability'].includes(field)) {
          updateData[field] = parseFloat(req.body[field]);
        } else if (field === 'apiEnabled' || field === 'isActive') {
          updateData[field] = req.body[field] === true || req.body[field] === 'true';
        } else {
          updateData[field] = req.body[field];
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay campos para actualizar'
      });
    }

    // Verificar que el proveedor existe
    const existingSupplier = await prisma.supplier.findUnique({
      where: { id }
    });

    if (!existingSupplier) {
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado'
      });
    }

    // Si se cambia el slug, verificar que no exista
    if (updateData.slug && updateData.slug !== existingSupplier.slug) {
      const slugExists = await prisma.supplier.findUnique({
        where: { slug: updateData.slug }
      });

      if (slugExists) {
        return res.status(400).json({
          success: false,
          message: 'El slug ya existe'
        });
      }
    }

    const supplier = await prisma.supplier.update({
      where: { id },
      data: updateData
    });

    console.log(`✅ Proveedor actualizado: ${supplier.name}`);

    res.json({
      success: true,
      message: 'Proveedor actualizado exitosamente',
      data: supplier
    });
  } catch (error) {
    console.error('❌ Error actualizando proveedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// DELETE /api/suppliers/:id - Eliminar proveedor (ADMIN)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el proveedor tiene productos
    const productsCount = await prisma.product.count({
      where: { supplierId: id }
    });

    if (productsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar: el proveedor tiene ${productsCount} productos asociados. Desactívalo en su lugar.`
      });
    }

    // Soft delete - marcar como inactivo
    const supplier = await prisma.supplier.update({
      where: { id },
      data: { isActive: false }
    });

    console.log(`🗑️  Proveedor desactivado: ${supplier.name}`);

    res.json({
      success: true,
      message: 'Proveedor desactivado exitosamente'
    });
  } catch (error) {
    console.error('❌ Error eliminando proveedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// GET /api/suppliers/:id/products - Productos del proveedor (ADMIN)
router.get('/:id/products', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { supplierId: id },
        skip,
        take: parseInt(limit),
        include: {
          category: { select: { name: true, slug: true } },
          images: { take: 1, orderBy: { position: 'asc' } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where: { supplierId: id } })
    ]);

    res.json({
      success: true,
      data: products.map(p => ({
        ...p,
        basePrice: parseFloat(p.basePrice),
        supplierPrice: p.supplierPrice ? parseFloat(p.supplierPrice) : null,
        profitMargin: parseFloat(p.profitMargin)
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo productos del proveedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// GET /api/suppliers/:id/stats - Estadísticas del proveedor (ADMIN)
router.get('/:id/stats', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [supplier, productsCount, activeProductsCount, totalOrders, pendingOrders] = await Promise.all([
      prisma.supplier.findUnique({ where: { id } }),
      prisma.product.count({ where: { supplierId: id } }),
      prisma.product.count({ where: { supplierId: id, isActive: true } }),
      prisma.supplierOrder.count({ where: { supplierId: id } }),
      prisma.supplierOrder.count({ where: { supplierId: id, status: 'PENDING' } })
    ]);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        supplier: {
          id: supplier.id,
          name: supplier.name,
          slug: supplier.slug,
          rating: supplier.rating,
          reliability: supplier.reliability
        },
        stats: {
          totalProducts: productsCount,
          activeProducts: activeProductsCount,
          inactiveProducts: productsCount - activeProductsCount,
          totalOrders: totalOrders,
          pendingOrders: pendingOrders,
          completedOrders: totalOrders - pendingOrders
        }
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas del proveedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// =================== ÓRDENES CON PROVEEDORES ===================

// GET /api/suppliers/orders/pending - Obtener órdenes pendientes con proveedores (ADMIN)
router.get('/orders/pending', verifyAdmin, async (req, res) => {
  try {
    const { getPendingSupplierOrders } = require('../services/supplierOrderService');

    const orders = await getPendingSupplierOrders();

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('❌ Error obteniendo órdenes pendientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener órdenes pendientes',
      error: error.message
    });
  }
});

// POST /api/suppliers/orders/:orderId/tracking - Actualizar tracking de orden (ADMIN)
router.post('/orders/:orderId/tracking', verifyAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { trackingNumber, carrier, trackingUrl } = req.body;

    if (!trackingNumber) {
      return res.status(400).json({
        success: false,
        message: 'Número de tracking requerido'
      });
    }

    const { updateSupplierOrderTracking } = require('../services/supplierOrderService');

    const result = await updateSupplierOrderTracking(orderId, {
      trackingNumber,
      carrier,
      trackingUrl
    });

    if (result.success) {
      res.json({
        success: true,
        message: 'Tracking actualizado exitosamente',
        data: result.supplierOrder
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('❌ Error actualizando tracking:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar tracking',
      error: error.message
    });
  }
});

// POST /api/suppliers/orders/:orderId/delivered - Marcar orden como entregada (ADMIN)
router.post('/orders/:orderId/delivered', verifyAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;

    const { markSupplierOrderAsDelivered } = require('../services/supplierOrderService');

    const result = await markSupplierOrderAsDelivered(orderId);

    if (result.success) {
      res.json({
        success: true,
        message: 'Orden marcada como entregada',
        data: result.supplierOrder
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('❌ Error marcando orden como entregada:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar orden como entregada',
      error: error.message
    });
  }
});

// POST /api/suppliers/orders/:orderId/cancel - Cancelar orden con proveedor (ADMIN)
router.post('/orders/:orderId/cancel', verifyAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const { cancelSupplierOrder } = require('../services/supplierOrderService');

    const result = await cancelSupplierOrder(orderId, reason || 'Sin razón especificada');

    if (result.success) {
      res.json({
        success: true,
        message: 'Orden cancelada',
        data: result.supplierOrder
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('❌ Error cancelando orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cancelar orden',
      error: error.message
    });
  }
});

// POST /api/suppliers/orders/:orderId/sync - Sincronizar estado con proveedor (ADMIN)
router.post('/orders/:orderId/sync', verifyAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;

    const { syncSupplierOrderStatus } = require('../services/supplierOrderService');

    const result = await syncSupplierOrderStatus(orderId);

    res.json({
      success: result.success,
      message: result.success ? 'Estado sincronizado' : result.message,
      data: result.status ? { status: result.status } : null
    });
  } catch (error) {
    console.error('❌ Error sincronizando estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al sincronizar estado',
      error: error.message
    });
  }
});

module.exports = router;
