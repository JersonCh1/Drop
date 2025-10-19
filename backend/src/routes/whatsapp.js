// backend/src/routes/whatsapp.js
const express = require('express');
const router = express.Router();
const whatsappService = require('../services/whatsappService');
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
 * GET /api/whatsapp/info - Información del servicio (ADMIN)
 */
router.get('/info', verifyAdmin, (req, res) => {
  try {
    const info = whatsappService.getServiceInfo();

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
 * POST /api/whatsapp/test - Test de conexión (ADMIN)
 */
router.post('/test', verifyAdmin, async (req, res) => {
  try {
    const result = await whatsappService.testConnection();

    res.json({
      success: result.success,
      message: result.message,
      data: result.details
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en test de conexión',
      error: error.message
    });
  }
});

/**
 * POST /api/whatsapp/send - Enviar mensaje personalizado (ADMIN)
 */
router.post('/send', verifyAdmin, async (req, res) => {
  try {
    const { phone, message } = req.body;

    if (!phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Teléfono y mensaje son requeridos'
      });
    }

    // Validar número
    const validation = whatsappService.validatePhoneNumber(phone);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Número de teléfono inválido. Debe incluir código de país (ej: +51999888777)'
      });
    }

    const result = await whatsappService.sendMessage(validation.formatted, message);

    res.json({
      success: result.success,
      message: result.success ? 'Mensaje enviado exitosamente' : 'Error al enviar mensaje',
      data: result
    });

  } catch (error) {
    console.error('Error enviando mensaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar mensaje',
      error: error.message
    });
  }
});

/**
 * POST /api/whatsapp/notify-order - Notificar cliente sobre su orden (ADMIN)
 */
router.post('/notify-order', verifyAdmin, async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'ID de orden es requerido'
      });
    }

    // Obtener orden
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

    // Validar que tenga teléfono
    if (!order.customerPhone) {
      return res.status(400).json({
        success: false,
        message: 'Esta orden no tiene número de teléfono'
      });
    }

    // Preparar datos
    const orderData = {
      orderNumber: order.orderNumber,
      customerPhone: order.customerPhone,
      customerName: `${order.customerFirstName} ${order.customerLastName}`,
      total: parseFloat(order.total),
      items: order.items.map(item => ({
        productName: item.productName,
        quantity: item.quantity,
        price: parseFloat(item.price)
      }))
    };

    // Enviar notificación según el estado
    let result;
    if (order.status === 'SHIPPED') {
      result = await whatsappService.sendShippingNotification({
        ...orderData,
        trackingNumber: order.trackingNumber,
        trackingUrl: order.trackingUrl
      });
    } else if (order.status === 'DELIVERED') {
      result = await whatsappService.sendDeliveryNotification(orderData);
    } else {
      result = await whatsappService.sendOrderConfirmation(orderData);
    }

    res.json({
      success: result.success,
      message: result.success ? 'Notificación enviada' : 'Error al enviar notificación',
      data: result
    });

  } catch (error) {
    console.error('Error notificando orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error al notificar orden',
      error: error.message
    });
  }
});

/**
 * POST /api/whatsapp/send-promotion - Enviar promoción masiva (ADMIN)
 */
router.post('/send-promotion', verifyAdmin, async (req, res) => {
  try {
    const { promoCode, discount, description, targetCustomers } = req.body;

    if (!promoCode || !discount || !description) {
      return res.status(400).json({
        success: false,
        message: 'Código, descuento y descripción son requeridos'
      });
    }

    let customers = [];

    // Si se especifican IDs de clientes
    if (targetCustomers && targetCustomers.length > 0) {
      customers = await prisma.user.findMany({
        where: {
          id: { in: targetCustomers },
          phone: { not: null }
        },
        select: {
          firstName: true,
          lastName: true,
          phone: true
        }
      });
    } else {
      // Todos los clientes con teléfono
      customers = await prisma.user.findMany({
        where: {
          phone: { not: null }
        },
        select: {
          firstName: true,
          lastName: true,
          phone: true
        },
        take: 100 // Límite de seguridad
      });
    }

    if (customers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay clientes con teléfono registrado'
      });
    }

    const results = [];

    // Enviar a cada cliente (con delay para no saturar la API)
    for (const customer of customers) {
      const customerData = {
        phone: customer.phone,
        name: `${customer.firstName} ${customer.lastName}`,
        promoCode,
        discount,
        description
      };

      const result = await whatsappService.sendPromotion(customerData);
      results.push({
        customer: customerData.name,
        phone: customer.phone,
        success: result.success
      });

      // Delay de 1 segundo entre mensajes
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const successCount = results.filter(r => r.success).length;

    res.json({
      success: true,
      message: `Promoción enviada a ${successCount}/${customers.length} clientes`,
      data: {
        total: customers.length,
        successful: successCount,
        failed: customers.length - successCount,
        details: results
      }
    });

  } catch (error) {
    console.error('Error enviando promoción:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar promoción',
      error: error.message
    });
  }
});

/**
 * GET /api/whatsapp/validate-phone/:phone - Validar formato de teléfono
 */
router.get('/validate-phone/:phone', (req, res) => {
  try {
    const { phone } = req.params;
    const validation = whatsappService.validatePhoneNumber(phone);

    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error validando teléfono',
      error: error.message
    });
  }
});

module.exports = router;
