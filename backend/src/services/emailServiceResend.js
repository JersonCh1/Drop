// backend/src/services/emailServiceResend.js
const { Resend } = require('resend');

class EmailServiceResend {
  constructor() {
    this.resend = null;
    this.isConfigured = false;
    this.fromEmail = 'iPhone Cases Store <onboarding@resend.dev>'; // Por defecto, cambiar después
  }

  async initialize() {
    try {
      const apiKey = process.env.RESEND_API_KEY;

      if (!apiKey) {
        console.log('⚠️  Resend no configurado - RESEND_API_KEY no encontrada');
        console.log('📧 Para configurar Resend:');
        console.log('   1. Visita: https://resend.com/signup');
        console.log('   2. Crea cuenta gratis (100 emails/día)');
        console.log('   3. Obtén tu API key');
        console.log('   4. Agrega RESEND_API_KEY=re_xxx al .env');
        return;
      }

      this.resend = new Resend(apiKey);

      // Configurar email "from" personalizado si existe
      if (process.env.RESEND_FROM_EMAIL) {
        this.fromEmail = process.env.RESEND_FROM_EMAIL;
      }

      this.isConfigured = true;
      console.log('✅ Resend email service inicializado correctamente');
      console.log(`📧 Enviando desde: ${this.fromEmail}`);
      console.log('💡 100 emails gratis por día');

    } catch (error) {
      console.error('❌ Error inicializando Resend:', error.message);
    }
  }

  async sendOrderConfirmation(orderData) {
    try {
      if (!this.isConfigured) {
        console.log('📧 Resend no configurado, saltando envío');
        return false;
      }

      const { order, items } = orderData;

      const itemsHtml = items.map(item => `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px 8px; text-align: left;">
            <div style="font-weight: 600; font-size: 14px; color: #1f2937;">${item.product_name}</div>
            <div style="font-size: 12px; color: #6b7280;">${item.product_model} - ${item.product_color}</div>
          </td>
          <td style="padding: 12px 8px; text-align: center; font-size: 14px; color: #374151;">
            ${item.quantity}
          </td>
          <td style="padding: 12px 8px; text-align: right; font-size: 14px; color: #374151;">
            $${parseFloat(item.price).toFixed(2)}
          </td>
          <td style="padding: 12px 8px; text-align: right; font-weight: 600; font-size: 14px; color: #1f2937;">
            $${parseFloat(item.total).toFixed(2)}
          </td>
        </tr>
      `).join('');

      const html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmación de Orden</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">

          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 32px; font-weight: 700;">¡Gracias por tu compra! 🎉</h1>
            <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.9;">Tu orden ha sido confirmada</p>
          </div>

          <!-- Main Content -->
          <div style="max-width: 600px; margin: 0 auto; background: white;">

            <div style="padding: 30px 20px;">
              <!-- Order Number -->
              <div style="background: #f8fafc; padding: 25px; border-radius: 12px; margin-bottom: 30px; border-left: 4px solid #667eea;">
                <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 24px;">Orden ${order.order_number}</h2>
                <div style="color: #059669; font-size: 20px; font-weight: 700;">Total: $${parseFloat(order.total).toFixed(2)} USD</div>
                <div style="color: #6b7280; font-size: 14px; margin-top: 10px;">
                  Fecha: ${new Date(order.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              <!-- Shipping Address -->
              <div style="background: #fefefe; padding: 25px; border-radius: 12px; margin-bottom: 30px; border: 1px solid #e5e7eb;">
                <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 20px;">📍 Envío a</h3>
                <div style="color: #374151; font-size: 15px; line-height: 1.8;">
                  <div style="font-weight: 600;">${order.customer_first_name} ${order.customer_last_name}</div>
                  <div>${order.shipping_address}</div>
                  <div>${order.shipping_city}, ${order.shipping_state} ${order.shipping_postal_code}</div>
                  <div style="font-weight: 600;">${order.shipping_country}</div>
                  <div style="margin-top: 10px;">📱 ${order.customer_phone}</div>
                </div>
              </div>

              <!-- Products -->
              <div style="margin-bottom: 30px;">
                <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px;">🛍️ Tus Productos</h3>
                <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                  <thead>
                    <tr style="background: #f8fafc;">
                      <th style="padding: 15px 8px; text-align: left; font-weight: 600; color: #374151;">Producto</th>
                      <th style="padding: 15px 8px; text-align: center; font-weight: 600; color: #374151;">Cant.</th>
                      <th style="padding: 15px 8px; text-align: right; font-weight: 600; color: #374151;">Precio</th>
                      <th style="padding: 15px 8px; text-align: right; font-weight: 600; color: #374151;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                </table>

                <!-- Totals -->
                <div style="margin-top: 20px; padding: 20px; background: #f8fafc; border-radius: 8px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span style="color: #374151;">Subtotal:</span>
                    <span style="font-weight: 600;">$${parseFloat(order.subtotal).toFixed(2)}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span style="color: #374151;">Envío:</span>
                    <span style="font-weight: 600;">$${parseFloat(order.shipping_cost).toFixed(2)}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 700; color: #059669; padding-top: 15px; border-top: 2px solid #e5e7eb; margin-top: 15px;">
                    <span>Total:</span>
                    <span>$${parseFloat(order.total).toFixed(2)} USD</span>
                  </div>
                </div>
              </div>

              <!-- Next Steps -->
              <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); padding: 25px; border-radius: 12px;">
                <h3 style="color: #1e40af; margin: 0 0 15px 0;">📦 Próximos Pasos</h3>
                <ul style="margin: 0; padding-left: 20px; color: #1e3a8a; line-height: 1.8;">
                  <li>Procesaremos tu orden en 24-48 horas</li>
                  <li>Te notificaremos cuando sea enviada</li>
                  <li>Tiempo de entrega: 5-10 días hábiles</li>
                  <li>Podrás rastrear tu orden con: <strong>${order.order_number}</strong></li>
                </ul>
              </div>

              <!-- Footer -->
              <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
                <p style="margin: 0;">¿Necesitas ayuda? Contáctanos: <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@example.com'}" style="color: #667eea;">support@example.com</a></p>
                <p style="margin: 10px 0 0 0;">© ${new Date().getFullYear()} iPhone Cases Store</p>
              </div>

            </div>
          </div>
        </body>
        </html>
      `;

      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: [order.customer_email],
        subject: `Confirmación de Orden ${order.order_number} 📦`,
        html: html,
      });

      console.log(`✅ Email de confirmación enviado a ${order.customer_email}`);
      console.log(`📧 Resend ID: ${result.data?.id}`);
      return true;

    } catch (error) {
      console.error('❌ Error enviando email con Resend:', error);
      return false;
    }
  }

  async sendAdminNotification(orderData) {
    try {
      if (!this.isConfigured) {
        return false;
      }

      const adminEmail = process.env.ADMIN_EMAIL || process.env.SUPPORT_EMAIL;
      if (!adminEmail) {
        console.log('⚠️  Email de admin no configurado');
        return false;
      }

      const { order, items } = orderData;

      const itemsHtml = items.map(item => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.product_name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${parseFloat(item.total).toFixed(2)}</td>
        </tr>
      `).join('');

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Nueva Orden</title>
        </head>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px;">
            <h1 style="color: #333;">🛒 Nueva Orden</h1>

            <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h2 style="margin: 0;">${order.order_number}</h2>
              <p style="margin: 5px 0 0 0; font-size: 18px; color: #059669; font-weight: 700;">$${parseFloat(order.total).toFixed(2)} USD</p>
            </div>

            <h3>Cliente:</h3>
            <p>
              <strong>${order.customer_first_name} ${order.customer_last_name}</strong><br>
              📧 ${order.customer_email}<br>
              📱 ${order.customer_phone}
            </p>

            <h3>Dirección de Envío:</h3>
            <p>
              ${order.shipping_address}<br>
              ${order.shipping_city}, ${order.shipping_state} ${order.shipping_postal_code}<br>
              ${order.shipping_country}
            </p>

            <h3>Productos:</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background: #f5f5f5;">
                  <th style="padding: 10px; text-align: left;">Producto</th>
                  <th style="padding: 10px; text-align: center;">Cant.</th>
                  <th style="padding: 10px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div style="background: #fff3e0; padding: 15px; border-radius: 5px; margin-top: 20px;">
              <p style="margin: 0; color: #f57c00;"><strong>⚡ Acción:</strong> Procesar y contactar al cliente</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: [adminEmail],
        subject: `🛒 Nueva Orden ${order.order_number} - $${parseFloat(order.total).toFixed(2)}`,
        html: html,
      });

      console.log(`✅ Notificación admin enviada para ${order.order_number}`);
      return true;

    } catch (error) {
      console.error('❌ Error enviando notificación admin:', error);
      return false;
    }
  }

  async sendTestEmail(email) {
    try {
      if (!this.isConfigured) {
        return {
          success: false,
          error: 'Resend no configurado'
        };
      }

      const html = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><title>Test</title></head>
        <body style="font-family: Arial; padding: 40px; background: #f9fafb;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px;">
            <h1 style="color: #10b981;">✅ Resend funcionando!</h1>
            <p>El servicio de emails está configurado correctamente.</p>
            <div style="background: #dbeafe; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Detalles:</strong></p>
              <ul>
                <li>Fecha: ${new Date().toLocaleString('es-ES')}</li>
                <li>Servicio: Resend</li>
                <li>Desde: ${this.fromEmail}</li>
                <li>Hacia: ${email}</li>
              </ul>
            </div>
            <p style="color: #6b7280; font-size: 14px;">© ${new Date().getFullYear()} iPhone Cases Store</p>
          </div>
        </body>
        </html>
      `;

      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: [email],
        subject: '✅ Email de Prueba - Resend',
        html: html,
      });

      console.log(`✅ Email de prueba enviado con Resend a ${email}`);

      return {
        success: true,
        messageId: result.data?.id
      };

    } catch (error) {
      console.error('❌ Error enviando test con Resend:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  getServiceInfo() {
    return {
      service: 'Resend',
      isConfigured: this.isConfigured,
      fromEmail: this.fromEmail,
      limit: '100 emails/día (gratis)',
      website: 'https://resend.com'
    };
  }
}

module.exports = new EmailServiceResend();
