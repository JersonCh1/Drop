// backend/src/routes/cjDropshipping.js
const express = require('express');
const router = express.Router();
const cjService = require('../services/cjDropshippingService');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dropshipping-super-secret-key-2024';

/**
 * Middleware para verificar que el usuario es admin
 */
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
        message: 'Acceso denegado. Solo administradores.'
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

/**
 * GET /api/cj/info - Información del servicio
 */
router.get('/info', verifyAdmin, (req, res) => {
  try {
    const info = cjService.getServiceInfo();

    res.json({
      success: true,
      data: info
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo información',
      error: error.message
    });
  }
});

/**
 * GET /api/cj/products/search - Buscar productos en CJ
 */
router.get('/products/search', verifyAdmin, async (req, res) => {
  try {
    const {
      q = '',
      page = 1,
      pageSize = 20,
      category = null,
      priceMin = null,
      priceMax = null,
      sortBy = 'sales'
    } = req.query;

    const result = await cjService.searchProducts(q, {
      pageNum: parseInt(page),
      pageSize: parseInt(pageSize),
      categoryId: category,
      priceMin: priceMin ? parseFloat(priceMin) : null,
      priceMax: priceMax ? parseFloat(priceMax) : null,
      sortBy
    });

    res.json({
      success: result.success,
      data: {
        products: result.products,
        total: result.total,
        pages: result.pages,
        currentPage: parseInt(page)
      },
      error: result.error
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error buscando productos',
      error: error.message
    });
  }
});

/**
 * GET /api/cj/products/:id - Obtener detalles de un producto
 */
router.get('/products/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await cjService.getProductDetails(id);

    res.json({
      success: result.success,
      data: result.product,
      error: result.error
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo detalles del producto',
      error: error.message
    });
  }
});

/**
 * POST /api/cj/products/:id/sync - Sincronizar producto de CJ a nuestra BD
 */
router.post('/products/:id/sync', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener producto de CJ
    const syncResult = await cjService.syncProduct(id);

    if (!syncResult.success) {
      return res.status(400).json({
        success: false,
        message: syncResult.error
      });
    }

    const productData = syncResult.productData;

    // Guardar en nuestra base de datos
    const product = await prisma.product.create({
      data: {
        name: productData.name,
        description: productData.description,
        price: productData.price,
        compareAtPrice: productData.compareAtPrice,
        images: productData.images,
        cjProductId: productData.cjProductId,
        supplier: productData.supplier,
        supplierUrl: productData.supplierUrl,
        inStock: productData.inStock,
        isActive: true,
        category: req.body.category || 'iPhone Cases'
      }
    });

    res.json({
      success: true,
      message: 'Producto sincronizado exitosamente',
      data: product
    });
  } catch (error) {
    console.error('Error sincronizando producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error sincronizando producto',
      error: error.message
    });
  }
});

/**
 * POST /api/cj/shipping/calculate - Calcular costo de envío
 */
router.post('/shipping/calculate', verifyAdmin, async (req, res) => {
  try {
    const { products, country = 'PE' } = req.body;

    if (!products || !Array.isArray(products)) {
      return res.status(400).json({
        success: false,
        message: 'Productos son requeridos'
      });
    }

    const result = await cjService.calculateShipping(products, country);

    res.json({
      success: result.success,
      data: result.options,
      error: result.error
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error calculando envío',
      error: error.message
    });
  }
});

/**
 * POST /api/cj/orders/create - Crear orden en CJ
 */
router.post('/orders/create', verifyAdmin, async (req, res) => {
  try {
    const orderData = req.body;

    const result = await cjService.createOrder(orderData);

    if (result.success) {
      // Actualizar nuestra base de datos con el ID de CJ
      if (orderData.supplierOrderId) {
        await prisma.supplierOrder.update({
          where: { id: orderData.supplierOrderId },
          data: {
            supplierOrderId: result.cjOrderId,
            supplierOrderNumber: result.cjOrderNumber,
            status: 'CONFIRMED',
            totalCost: result.totalAmount || 0
          }
        });
      }
    }

    res.json({
      success: result.success,
      data: {
        cjOrderId: result.cjOrderId,
        cjOrderNumber: result.cjOrderNumber,
        totalAmount: result.totalAmount
      },
      message: result.message,
      error: result.error
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creando orden',
      error: error.message
    });
  }
});

/**
 * GET /api/cj/orders/:id - Obtener estado de una orden
 */
router.get('/orders/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await cjService.getOrderStatus(id);

    res.json({
      success: result.success,
      data: result.order,
      error: result.error
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estado de orden',
      error: error.message
    });
  }
});

/**
 * GET /api/cj/orders/:id/tracking - Obtener tracking de una orden
 */
router.get('/orders/:id/tracking', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await cjService.getOrderTracking(id);

    res.json({
      success: result.success,
      data: {
        trackingNumber: result.trackingNumber,
        carrier: result.carrier,
        status: result.status,
        currentLocation: result.currentLocation,
        events: result.events
      },
      error: result.error
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo tracking',
      error: error.message
    });
  }
});

/**
 * POST /api/cj/orders/:id/confirm-payment - Confirmar pago de una orden
 */
router.post('/orders/:id/confirm-payment', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await cjService.confirmOrderPayment(id);

    res.json({
      success: result.success,
      message: result.message,
      error: result.error
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error confirmando pago',
      error: error.message
    });
  }
});

/**
 * GET /api/cj/orders - Listar todas las órdenes
 */
router.get('/orders', verifyAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 20,
      startDate = null,
      endDate = null,
      status = null
    } = req.query;

    const result = await cjService.getOrders({
      pageNum: parseInt(page),
      pageSize: parseInt(pageSize),
      startDate,
      endDate,
      status
    });

    res.json({
      success: result.success,
      data: {
        orders: result.orders,
        total: result.total,
        currentPage: parseInt(page)
      },
      error: result.error
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo órdenes',
      error: error.message
    });
  }
});

/**
 * GET /api/cj/stock/:productId - Consultar inventario
 */
router.get('/stock/:productId', verifyAdmin, async (req, res) => {
  try {
    const { productId } = req.params;
    const { variantId = null } = req.query;

    const result = await cjService.checkStock(productId, variantId);

    res.json({
      success: result.success,
      data: {
        inStock: result.inStock,
        quantity: result.quantity,
        price: result.price,
        sku: result.sku
      },
      error: result.error
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error consultando inventario',
      error: error.message
    });
  }
});

/**
 * POST /api/cj/auto-order - Crear orden automáticamente desde una orden del cliente
 */
router.post('/auto-order', verifyAdmin, async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'ID de orden es requerido'
      });
    }

    // Obtener orden del cliente
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    // Filtrar productos que vienen de CJ Dropshipping
    const cjProducts = order.items.filter(item =>
      item.product && item.product.supplier === 'CJ_DROPSHIPPING'
    );

    if (cjProducts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Esta orden no tiene productos de CJ Dropshipping'
      });
    }

    // Preparar datos de productos para CJ
    const products = cjProducts.map(item => ({
      productId: item.product.cjProductId,
      variantId: null,
      quantity: item.quantity,
      price: parseFloat(item.price)
    }));

    // Crear orden en CJ
    const orderData = {
      customerName: `${order.customerFirstName} ${order.customerLastName}`,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      shippingAddress: order.shippingAddress,
      shippingCity: order.shippingCity,
      shippingState: order.shippingState,
      shippingPostalCode: order.shippingPostalCode,
      shippingCountry: order.shippingCountry || 'PE',
      products,
      orderNumber: order.orderNumber
    };

    const result = await cjService.createOrder(orderData);

    if (result.success) {
      // Crear registro de supplier order
      await prisma.supplierOrder.create({
        data: {
          orderId: order.id,
          supplierName: 'CJ Dropshipping',
          supplierOrderId: result.cjOrderId,
          supplierOrderNumber: result.cjOrderNumber,
          status: 'CONFIRMED',
          totalCost: result.totalAmount || 0,
          notes: `Orden automática creada en CJ Dropshipping`
        }
      });

      console.log(`✅ Orden automática creada en CJ para ${order.orderNumber}`);
    }

    res.json({
      success: result.success,
      message: result.success ? 'Orden creada automáticamente en CJ Dropshipping' : result.error,
      data: {
        cjOrderId: result.cjOrderId,
        cjOrderNumber: result.cjOrderNumber,
        totalAmount: result.totalAmount
      }
    });
  } catch (error) {
    console.error('Error en auto-order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creando orden automática',
      error: error.message
    });
  }
});

module.exports = router;
