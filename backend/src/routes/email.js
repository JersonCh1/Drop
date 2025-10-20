// backend/src/routes/email.js
const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');
const { verifyAdminToken } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * 📧 RUTAS DE EMAIL MARKETING
 */

/**
 * POST /api/email/send - Enviar email genérico (admin)
 */
router.post('/send', verifyAdminToken, async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;

    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos (to, subject, html/text)'
      });
    }

    const result = await emailService.sendEmail({ to, subject, html, text });

    res.json(result);
  } catch (error) {
    console.error('Error enviando email:', error);
    res.status(500).json({
      success: false,
      message: 'Error enviando email',
      error: error.message
    });
  }
});

/**
 * POST /api/email/order-confirmation - Enviar confirmación de pedido
 */
router.post('/order-confirmation', async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'orderId es requerido'
      });
    }

    // Obtener orden con detalles
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
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

    const customer = {
      email: order.email,
      firstName: order.firstName,
      lastName: order.lastName
    };

    const result = await emailService.sendOrderConfirmation(order, customer);

    res.json(result);
  } catch (error) {
    console.error('Error enviando confirmación de pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error enviando confirmación',
      error: error.message
    });
  }
});

/**
 * POST /api/email/welcome - Enviar email de bienvenida
 */
router.post('/welcome', async (req, res) => {
  try {
    const { email, firstName } = req.body;

    if (!email || !firstName) {
      return res.status(400).json({
        success: false,
        message: 'email y firstName son requeridos'
      });
    }

    const customer = { email, firstName };

    const result = await emailService.sendWelcomeEmail(customer);

    res.json(result);
  } catch (error) {
    console.error('Error enviando email de bienvenida:', error);
    res.status(500).json({
      success: false,
      message: 'Error enviando email de bienvenida',
      error: error.message
    });
  }
});

/**
 * POST /api/email/abandoned-cart - Enviar recordatorio de carrito abandonado
 */
router.post('/abandoned-cart', verifyAdminToken, async (req, res) => {
  try {
    const { email, firstName, cartItems } = req.body;

    if (!email || !firstName || !cartItems) {
      return res.status(400).json({
        success: false,
        message: 'email, firstName y cartItems son requeridos'
      });
    }

    const customer = { email, firstName };

    const result = await emailService.sendAbandonedCartEmail(customer, cartItems);

    res.json(result);
  } catch (error) {
    console.error('Error enviando recordatorio de carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error enviando recordatorio',
      error: error.message
    });
  }
});

/**
 * POST /api/email/promotion - Enviar promoción masiva
 */
router.post('/promotion', verifyAdminToken, async (req, res) => {
  try {
    const { emails, promotion } = req.body;

    if (!emails || !Array.isArray(emails) || !promotion) {
      return res.status(400).json({
        success: false,
        message: 'emails (array) y promotion son requeridos'
      });
    }

    const results = [];

    for (const email of emails) {
      const result = await emailService.sendPromotionEmail(email, promotion);
      results.push({ email, ...result });
    }

    const successCount = results.filter(r => r.success).length;

    res.json({
      success: true,
      message: `Enviados ${successCount} de ${emails.length} emails`,
      results
    });
  } catch (error) {
    console.error('Error enviando promoción masiva:', error);
    res.status(500).json({
      success: false,
      message: 'Error enviando promoción',
      error: error.message
    });
  }
});

/**
 * POST /api/email/shipping-notification - Enviar notificación de envío
 */
router.post('/shipping-notification', async (req, res) => {
  try {
    const { orderId, trackingNumber } = req.body;

    if (!orderId || !trackingNumber) {
      return res.status(400).json({
        success: false,
        message: 'orderId y trackingNumber son requeridos'
      });
    }

    // Obtener orden
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    const customer = {
      email: order.email,
      firstName: order.firstName
    };

    const result = await emailService.sendShippingNotification(order, customer, trackingNumber);

    res.json(result);
  } catch (error) {
    console.error('Error enviando notificación de envío:', error);
    res.status(500).json({
      success: false,
      message: 'Error enviando notificación',
      error: error.message
    });
  }
});

/**
 * POST /api/email/contact - Enviar formulario de contacto
 */
router.post('/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos (name, email, subject, message)'
      });
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido'
      });
    }

    const contactData = {
      name,
      email,
      phone: phone || 'No proporcionado',
      subject,
      message
    };

    const result = await emailService.sendContactFormEmail(contactData);

    res.json(result);
  } catch (error) {
    console.error('Error enviando formulario de contacto:', error);
    res.status(500).json({
      success: false,
      message: 'Error enviando formulario de contacto',
      error: error.message
    });
  }
});

/**
 * GET /api/email/info - Información del servicio
 */
router.get('/info', (req, res) => {
  res.json({
    success: true,
    service: 'Email Marketing con SendGrid',
    configured: !!process.env.SENDGRID_API_KEY,
    fromEmail: process.env.FROM_EMAIL || 'noreply@iphonecases.com',
    endpoints: {
      '/send': 'Enviar email genérico (admin)',
      '/order-confirmation': 'Confirmación de pedido',
      '/welcome': 'Email de bienvenida',
      '/abandoned-cart': 'Recordatorio de carrito (admin)',
      '/promotion': 'Promoción masiva (admin)',
      '/shipping-notification': 'Notificación de envío',
      '/contact': 'Formulario de contacto'
    }
  });
});

module.exports = router;
