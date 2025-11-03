// backend/src/routes/orders-prisma.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const emailService = require('../services/emailService');
const notificationService = require('../services/notificationService');

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

// POST /api/orders - Crear nueva orden
router.post('/', async (req, res) => {
  try {
    const { customerInfo, items, subtotal, shippingCost, total, paymentMethod = 'manual' } = req.body;

    console.log('📦 Nueva orden recibida:', {
      email: customerInfo?.email,
      total,
      items: items?.length,
      paymentMethod
    });

    // Validar datos requeridos
    if (!customerInfo || !items || !items.length) {
      return res.status(400).json({
        success: false,
        message: 'Información de cliente y productos son requeridos'
      });
    }

    // Validar información del cliente
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'postalCode', 'country'];
    for (const field of requiredFields) {
      if (!customerInfo[field]) {
        return res.status(400).json({
          success: false,
          message: `Campo requerido: ${field}`
        });
      }
    }

    // Generar número de orden único
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // DEBUG: Ver qué productIds están llegando
    console.log('🔍 Items recibidos:', JSON.stringify(items, null, 2));

    // WORKAROUND: Validar y crear productos que no existan
    for (const item of items) {
      if (item.productId) {
        try {
          // Verificar si el producto existe
          const product = await prisma.product.findUnique({
            where: { id: item.productId }
          });

          if (!product) {
            console.log(`⚠️ Producto ${item.productId} no existe, creando...`);

            // Obtener o crear categoría
            let category = await prisma.category.findFirst({
              where: { slug: 'carcasas-iphone' }
            });

            if (!category) {
              category = await prisma.category.create({
                data: {
                  id: 'cat_iphone_cases',
                  name: 'Carcasas iPhone',
                  slug: 'carcasas-iphone',
                  description: 'Carcasas para iPhone',
                  isActive: true,
                  sortOrder: 1
                }
              });
            }

            // Crear el producto
            await prisma.product.create({
              data: {
                id: item.productId,
                name: item.name || 'Carcasa iPhone',
                slug: `carcasa-${item.productId}`,
                description: `Carcasa ${item.model || 'iPhone'} - ${item.color || 'Color'}`,
                basePrice: item.price || 19.99, // Solo basePrice, no price
                stockCount: 9999,
                categoryId: category.id,
                isActive: true,
                inStock: true,
                model: item.model || 'iPhone',
                brand: 'Premium Cases'
              }
            });
            console.log(`✅ Producto ${item.productId} creado automáticamente`);
          }
        } catch (err) {
          console.log(`⚠️ Error verificando/creando producto ${item.productId}:`, err.message);
        }
      }
    }

    // Crear orden con Prisma
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerFirstName: customerInfo.firstName,
        customerLastName: customerInfo.lastName,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        shippingAddress: customerInfo.address,
        shippingCity: customerInfo.city,
        shippingState: customerInfo.state,
        shippingPostalCode: customerInfo.postalCode,
        shippingCountry: customerInfo.country,
        notes: customerInfo.notes || null,
        subtotal: subtotal || total,
        shippingCost: shippingCost || 0,
        total,
        paymentMethod,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        items: {
          create: items.map(item => ({
            productId: item.productId, // Ya validamos/creamos el producto antes
            variantId: item.variantId,
            productName: item.name,
            productModel: item.model || '',
            productColor: item.color || '',
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity
          }))
        }
      },
      include: {
        items: true
      }
    });

    // Generar URL de WhatsApp para el pago
    const whatsappNumber = process.env.WHATSAPP_NUMBER || '51917780708';
    const message = encodeURIComponent(
      `¡Hola! 🛍️\n\n` +
      `Acabo de realizar una orden:\n` +
      `📋 Orden: ${orderNumber}\n` +
      `💰 Total: $${total} USD\n` +
      `📧 Email: ${customerInfo.email}\n\n` +
      `Por favor, indícame las opciones de pago disponibles.`
    );
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

    const response = {
      success: true,
      message: 'Orden creada exitosamente',
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        total,
        createdAt: order.createdAt,
        status: 'pending',
        paymentMethod: paymentMethod,
        paymentUrl: whatsappUrl,
        paymentInstructions: 'Te contactaremos por WhatsApp para coordinar el pago y envío. También puedes escribirnos directamente.'
      }
    };

    console.log(`✅ Orden creada: ${order.orderNumber} - $${total}`);

    // 🚀 DROPSHIPPING: Crear órdenes automáticas con proveedores
    setTimeout(async () => {
      try {
        const { createSupplierOrderFromCustomerOrder } = require('../services/supplierOrderService');
        const { sendOrderToSuppliers } = require('../services/supplierNotificationService');

        const supplierOrderResult = await createSupplierOrderFromCustomerOrder(order.id);

        if (supplierOrderResult.success) {
          console.log(`✅ Órdenes con proveedores creadas: ${supplierOrderResult.supplierOrders.length}`);

          // 📧 ENVIAR NOTIFICACIONES AUTOMÁTICAS A PROVEEDORES
          // Solo si el pago ya está confirmado (para Yape/Plin se hará después)
          if (paymentMethod !== 'manual' && paymentMethod !== 'yape' && paymentMethod !== 'plin') {
            const notificationResults = await sendOrderToSuppliers(supplierOrderResult.supplierOrders);
            console.log(`📧 Notificaciones enviadas:`, notificationResults);
          } else {
            console.log(`⏸️  Notificaciones a proveedores pendientes de confirmación de pago`);
          }
        } else {
          console.error(`❌ Error creando órdenes con proveedores: ${supplierOrderResult.error}`);
        }
      } catch (supplierError) {
        console.error('❌ Error en proceso de dropshipping:', supplierError);
      }
    }, 500);

    // Enviar emails de forma asíncrona (no bloquear respuesta)
    setTimeout(async () => {
      try {
        // Email al cliente
        await emailService.sendOrderConfirmation({
          order,
          items: order.items
        });

        // Email al admin
        await emailService.sendAdminNotification({
          order,
          items: order.items
        });
      } catch (emailError) {
        console.error('❌ Error enviando emails:', emailError);
      }
    }, 1000);

    res.status(201).json(response);

  } catch (error) {
    console.error('❌ Error al crear orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
});

// GET /api/orders - Obtener todas las órdenes (admin)
router.get('/', verifyAdminToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      status,
      country,
      dateFrom,
      dateTo,
      search
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Construir filtros
    const where = {
      ...(status && { status: status.toUpperCase() }),
      ...(country && { shippingCountry: country }),
      ...(dateFrom && { createdAt: { gte: new Date(dateFrom) } }),
      ...(dateTo && { createdAt: { ...where.createdAt, lte: new Date(dateTo) } }),
      ...(search && {
        OR: [
          { orderNumber: { contains: search } },
          { customerEmail: { contains: search } },
          { customerFirstName: { contains: search } },
          { customerLastName: { contains: search } }
        ]
      })
    };

    // Obtener órdenes
    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: parseInt(limit)
    });

    // Contar total
    const total = await prisma.order.count({ where });

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener órdenes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// GET /api/orders/:orderNumber - Obtener orden específica
router.get('/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: true,
        statusHistory: {
          orderBy: { createdAt: 'asc' }
        },
        notifications: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('❌ Error al obtener orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// POST /api/orders/:id/confirm-payment - Confirmar pago manual (Yape/Plin)
router.post('/:id/confirm-payment', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentProof, notes } = req.body;

    // Buscar orden
    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    // Actualizar orden a PAID
    await prisma.order.update({
      where: { id },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        notes: notes || `Pago confirmado manualmente${paymentProof ? `. Prueba: ${paymentProof}` : ''}`
      }
    });

    console.log(`✅ Pago confirmado manualmente para orden ${order.orderNumber}`);

    // 🚀 CREAR Y NOTIFICAR A PROVEEDORES
    const { createSupplierOrderFromCustomerOrder } = require('../services/supplierOrderService');
    const { sendOrderToSuppliers } = require('../services/supplierNotificationService');

    const supplierResult = await createSupplierOrderFromCustomerOrder(id);

    if (supplierResult.success) {
      console.log(`✅ ${supplierResult.supplierOrders.length} órdenes con proveedores creadas`);

      // Enviar notificaciones
      const notificationResults = await sendOrderToSuppliers(supplierResult.supplierOrders);
      console.log(`📧 Notificaciones enviadas a proveedores`);

      return res.json({
        success: true,
        message: 'Pago confirmado y órdenes con proveedores creadas',
        supplierOrders: supplierResult.supplierOrders.length,
        notifications: notificationResults
      });
    } else {
      return res.json({
        success: true,
        message: 'Pago confirmado pero error creando órdenes con proveedores',
        error: supplierResult.error
      });
    }

  } catch (error) {
    console.error('❌ Error confirmando pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// PATCH /api/orders/:id/status - Actualizar estado de orden (admin)
router.patch('/:id/status', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, trackingNumber, trackingUrl } = req.body;

    // Validar estado
    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
    if (!validStatuses.includes(status.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido. Estados válidos: ' + validStatuses.join(', ')
      });
    }

    // Obtener orden actual
    const currentOrder = await prisma.order.findUnique({
      where: { id }
    });

    if (!currentOrder) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    const oldStatus = currentOrder.status;

    // Preparar datos de actualización
    const updateData = {
      status: status.toUpperCase(),
      ...(trackingNumber && { trackingNumber }),
      ...(trackingUrl && { trackingUrl }),
      ...(status.toUpperCase() === 'SHIPPED' && !currentOrder.shippedAt && { shippedAt: new Date() }),
      ...(status.toUpperCase() === 'DELIVERED' && !currentOrder.deliveredAt && { deliveredAt: new Date() })
    };

    // Actualizar orden
    const order = await prisma.order.update({
      where: { id },
      data: updateData
    });

    // Registrar cambio en historial
    await prisma.orderStatusHistory.create({
      data: {
        orderId: id,
        status: status.toUpperCase(),
        notes: notes || `Estado cambiado de ${oldStatus} a ${status}`,
        createdBy: 'admin'
      }
    });

    // Enviar notificaciones según el nuevo estado (asíncrono)
    setTimeout(async () => {
      try {
        switch (status.toUpperCase()) {
          case 'CONFIRMED':
            await notificationService.sendOrderConfirmation(id);
            break;
          case 'SHIPPED':
            await notificationService.sendShippingNotification(id, trackingNumber, trackingUrl);
            break;
          case 'DELIVERED':
            await notificationService.sendDeliveryNotification(id);
            break;
          case 'CANCELLED':
            await notificationService.sendCancellationNotification(id, notes);
            break;
        }
      } catch (notificationError) {
        console.error('❌ Error enviando notificación:', notificationError);
      }
    }, 1000);

    console.log(`✅ Estado de orden ${id} actualizado: ${oldStatus} → ${status}`);

    res.json({
      success: true,
      message: 'Estado actualizado correctamente',
      data: order
    });

  } catch (error) {
    console.error('❌ Error al actualizar estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

module.exports = router;
