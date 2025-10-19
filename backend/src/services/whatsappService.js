// backend/src/services/whatsappService.js
const axios = require('axios');

/**
 * 📱 SERVICIO DE WHATSAPP - Notificaciones automáticas
 *
 * Integración con WhatsApp Business API para enviar:
 * - Confirmaciones de orden
 * - Actualizaciones de tracking
 * - Recordatorios de carrito abandonado
 * - Notificaciones de promociones
 *
 * Usa Twilio WhatsApp API o cualquier provider compatible
 */

class WhatsAppService {
  constructor() {
    // Configuración de Twilio WhatsApp
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'; // Sandbox number

    // Número de WhatsApp del negocio (para recibir notificaciones admin)
    this.businessNumber = process.env.WHATSAPP_BUSINESS_NUMBER || '+51917780708';

    // URL base de Twilio
    this.baseURL = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;

    this.isConfigured = !!(this.accountSid && this.authToken);

    if (!this.isConfigured) {
      console.log('⚠️  WhatsApp no configurado - Variables faltantes:');
      console.log('   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN');
      console.log('   Para usar WhatsApp, regístrate en: https://www.twilio.com/whatsapp');
    } else {
      console.log('✅ WhatsApp configurado con Twilio');
      console.log(`📱 Número: ${this.whatsappNumber}`);
    }
  }

  /**
   * Envía un mensaje de WhatsApp
   */
  async sendMessage(to, message) {
    if (!this.isConfigured) {
      console.log('⚠️  WhatsApp no configurado, mensaje no enviado');
      return { success: false, error: 'WhatsApp no configurado' };
    }

    try {
      // Formatear número: debe incluir código de país
      const formattedNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

      const params = new URLSearchParams({
        From: this.whatsappNumber,
        To: formattedNumber,
        Body: message
      });

      const response = await axios.post(this.baseURL, params, {
        auth: {
          username: this.accountSid,
          password: this.authToken
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      console.log(`✅ WhatsApp enviado a ${to}`);

      return {
        success: true,
        messageId: response.data.sid,
        status: response.data.status
      };

    } catch (error) {
      console.error('❌ Error enviando WhatsApp:', error.response?.data || error.message);

      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Notificación de nueva orden al cliente
   */
  async sendOrderConfirmation(orderData) {
    const { orderNumber, customerPhone, customerName, total, items } = orderData;

    const itemsList = items.map(item =>
      `• ${item.quantity}x ${item.productName} - $${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    const message = `
¡Hola ${customerName}! 🎉

Tu orden ha sido confirmada exitosamente.

📋 *Orden:* ${orderNumber}
💰 *Total:* $${total.toFixed(2)}

*Productos:*
${itemsList}

Te notificaremos cuando tu orden sea enviada.

¿Tienes preguntas? Responde a este mensaje.

Gracias por tu compra! 🛍️
    `.trim();

    return await this.sendMessage(customerPhone, message);
  }

  /**
   * Notificación de orden enviada
   */
  async sendShippingNotification(orderData) {
    const { orderNumber, customerPhone, customerName, trackingNumber, trackingUrl } = orderData;

    const trackingInfo = trackingNumber
      ? `\n📦 *Tracking:* ${trackingNumber}\n🔗 ${trackingUrl || 'Consulta el estado en nuestra web'}`
      : '';

    const message = `
¡Hola ${customerName}! 📦

Tu orden #${orderNumber} ha sido enviada.
${trackingInfo}

Tiempo estimado de entrega: 15-30 días hábiles.

Recibirás otra notificación cuando sea entregada.

¡Gracias por tu paciencia! 🚚
    `.trim();

    return await this.sendMessage(customerPhone, message);
  }

  /**
   * Notificación de orden entregada
   */
  async sendDeliveryNotification(orderData) {
    const { orderNumber, customerPhone, customerName } = orderData;

    const message = `
¡Hola ${customerName}! 🎉

Tu orden #${orderNumber} ha sido entregada exitosamente.

¿Te gustó el producto?
Déjanos una reseña en nuestra web:
${process.env.FRONTEND_URL || 'https://tutienda.com'}

¡Gracias por tu compra! 😊
    `.trim();

    return await this.sendMessage(customerPhone, message);
  }

  /**
   * Recordatorio de carrito abandonado
   */
  async sendAbandonedCartReminder(customerData) {
    const { phone, name, cartItems, total } = customerData;

    const itemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const message = `
¡Hola ${name}! 🛒

Notamos que dejaste ${itemsCount} ${itemsCount === 1 ? 'producto' : 'productos'} en tu carrito.

💰 Total: $${total.toFixed(2)}

¿Listo para completar tu compra?

Usa el código: *RECOVER10* para un 10% de descuento.
Válido por 24 horas.

Link directo: ${process.env.FRONTEND_URL}/cart

¡No dejes escapar esta oportunidad! ✨
    `.trim();

    return await this.sendMessage(phone, message);
  }

  /**
   * Notificación de promoción/oferta especial
   */
  async sendPromotion(customerData) {
    const { phone, name, promoCode, discount, description } = customerData;

    const message = `
¡Hola ${name}! 🎁

Tenemos una oferta especial para ti:

${description}

🏷️ *Código:* ${promoCode}
💰 *Descuento:* ${discount}% OFF

Válido por tiempo limitado.

Compra ahora: ${process.env.FRONTEND_URL}

¡No te lo pierdas! 🚀
    `.trim();

    return await this.sendMessage(phone, message);
  }

  /**
   * Notificación al admin de nueva orden
   */
  async notifyAdminNewOrder(orderData) {
    const { orderNumber, customerName, total, items, paymentMethod } = orderData;

    const itemsList = items.map(item =>
      `• ${item.quantity}x ${item.productName}`
    ).join('\n');

    const message = `
🔔 *NUEVA ORDEN* 🔔

📋 ${orderNumber}
👤 ${customerName}
💰 $${total.toFixed(2)}
💳 ${paymentMethod}

Productos:
${itemsList}

Revisa el admin panel para más detalles.
    `.trim();

    return await this.sendMessage(this.businessNumber, message);
  }

  /**
   * Notificación al admin de pago confirmado
   */
  async notifyAdminPaymentConfirmed(orderData) {
    const { orderNumber, customerName, total, paymentMethod } = orderData;

    const message = `
✅ *PAGO CONFIRMADO* ✅

📋 ${orderNumber}
👤 ${customerName}
💰 $${total.toFixed(2)}
💳 ${paymentMethod}

Proceder con el envío.
    `.trim();

    return await this.sendMessage(this.businessNumber, message);
  }

  /**
   * Mensaje de bienvenida (para nuevos clientes)
   */
  async sendWelcomeMessage(customerData) {
    const { phone, name } = customerData;

    const message = `
¡Bienvenido ${name}! 👋

Gracias por unirte a nuestra tienda.

🎁 Como regalo de bienvenida, usa el código *WELCOME15* para 15% de descuento en tu primera compra.

Explora nuestro catálogo:
${process.env.FRONTEND_URL}

¿Tienes preguntas? ¡Estamos aquí para ayudarte! 😊
    `.trim();

    return await this.sendMessage(phone, message);
  }

  /**
   * Verifica si un número de teléfono es válido para WhatsApp
   */
  validatePhoneNumber(phone) {
    // Eliminar espacios y caracteres especiales
    const cleaned = phone.replace(/[^0-9+]/g, '');

    // Debe tener código de país (+) y entre 10-15 dígitos
    const isValid = /^\+[1-9]\d{9,14}$/.test(cleaned);

    return {
      isValid,
      formatted: isValid ? cleaned : null
    };
  }

  /**
   * Test de conexión
   */
  async testConnection() {
    if (!this.isConfigured) {
      return {
        success: false,
        message: 'WhatsApp no está configurado'
      };
    }

    try {
      // Enviar mensaje de prueba al número del negocio
      const result = await this.sendMessage(
        this.businessNumber,
        '✅ Test de conexión WhatsApp exitoso! El servicio está funcionando correctamente.'
      );

      return {
        success: result.success,
        message: result.success ? 'Conexión exitosa' : 'Error en conexión',
        details: result
      };

    } catch (error) {
      return {
        success: false,
        message: 'Error al conectar',
        error: error.message
      };
    }
  }

  /**
   * Información del servicio
   */
  getServiceInfo() {
    return {
      service: 'WhatsApp via Twilio',
      isConfigured: this.isConfigured,
      whatsappNumber: this.whatsappNumber,
      businessNumber: this.businessNumber,
      features: [
        'Confirmaciones de orden',
        'Notificaciones de envío',
        'Recordatorios de carrito',
        'Promociones',
        'Notificaciones admin'
      ],
      pricing: 'Twilio: ~$0.005 por mensaje',
      docs: 'https://www.twilio.com/docs/whatsapp'
    };
  }
}

module.exports = new WhatsAppService();
