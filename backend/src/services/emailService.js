// backend/src/services/emailService.js
const nodemailer = require('nodemailer');
const { getDbClient } = require('../utils/database');

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
  }

  async initialize() {
    try {
      if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('⚠️  Email no configurado - variables de entorno faltantes');
        console.log('📧 Variables requeridas: EMAIL_HOST, EMAIL_USER, EMAIL_PASS');
        return;
      }

      // Configuración del transporter
      const config = {
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true', // true para 465, false para otros puertos
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      };

      // Configuraciones específicas para proveedores comunes
      if (process.env.EMAIL_HOST.includes('gmail')) {
        config.service = 'gmail';
      } else if (process.env.EMAIL_HOST.includes('outlook') || process.env.EMAIL_HOST.includes('hotmail')) {
        config.service = 'hotmail';
      }

      this.transporter = nodemailer.createTransporter(config);

      // Verificar conexión
      await this.transporter.verify();
      this.isConfigured = true;
      console.log('✅ Servicio de email inicializado correctamente');
      console.log(`📧 Enviando desde: ${process.env.EMAIL_USER}`);

    } catch (error) {
      console.error('❌ Error inicializando servicio de email:', error.message);
      console.log('💡 Guía rápida de configuración:');
      console.log('   Gmail: EMAIL_HOST=smtp.gmail.com, EMAIL_PORT=587, usar App Password');
      console.log('   Outlook: EMAIL_HOST=smtp-mail.outlook.com, EMAIL_PORT=587');
      console.log('   SendGrid: EMAIL_HOST=smtp.sendgrid.net, EMAIL_PORT=587');
    }
  }
  async sendOrderConfirmation(orderData) {
    try {
      if (!this.isConfigured) {
        console.log('📧 Email no configurado, saltando envío de confirmación');
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
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9fafb;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 32px; font-weight: 700;">¡Gracias por tu compra! 🎉</h1>
            <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.9;">Tu orden ha sido confirmada</p>
          </div>

          <!-- Main Content -->
          <div style="max-width: 600px; margin: 0 auto; background: white;">
            
            <!-- Order Details -->
            <div style="padding: 30px 20px;">
              <div style="background: #f8fafc; padding: 25px; border-radius: 12px; margin-bottom: 30px; border-left: 4px solid #667eea;">
                <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Detalles de la Orden</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #374151;">Número de Orden:</td>
                    <td style="padding: 8px 0; color: #667eea; font-size: 18px; font-weight: 700;">${order.order_number}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #374151;">Fecha:</td>
                    <td style="padding: 8px 0; color: #1f2937;">${new Date(order.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #374151;">Total:</td>
                    <td style="padding: 8px 0; color: #059669; font-size: 20px; font-weight: 700;">$${parseFloat(order.total).toFixed(2)} USD</td>
                  </tr>
                </table>
              </div>

              <!-- Customer Info -->
              <div style="background: #fefefe; padding: 25px; border-radius: 12px; margin-bottom: 30px; border: 1px solid #e5e7eb;">
                <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px;">Información de Envío</h3>
                <div style="color: #374151; font-size: 15px; line-height: 1.6;">
                  <div style="font-weight: 600; margin-bottom: 5px;">${order.customer_first_name} ${order.customer_last_name}</div>
                  <div style="margin-bottom: 5px;">${order.shipping_address}</div>
                  <div style="margin-bottom: 5px;">${order.shipping_city}, ${order.shipping_state} ${order.shipping_postal_code}</div>
                  <div style="margin-bottom: 15px; font-weight: 600;">${order.shipping_country}</div>
                  <div style="margin-bottom: 5px;"><strong>Teléfono:</strong> ${order.customer_phone}</div>
                  <div><strong>Email:</strong> ${order.customer_email}</div>
                </div>
              </div>
              <!-- Products -->
              <div style="background: #fefefe; padding: 25px; border-radius: 12px; margin-bottom: 30px; border: 1px solid #e5e7eb;">
                <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px;">Productos Ordenados</h3>
                <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                  <thead>
                    <tr style="background: #f8fafc; border-bottom: 2px solid #e5e7eb;">
                      <th style="padding: 15px 8px; text-align: left; font-weight: 600; color: #374151; font-size: 14px;">Producto</th>
                      <th style="padding: 15px 8px; text-align: center; font-weight: 600; color: #374151; font-size: 14px;">Cantidad</th>
                      <th style="padding: 15px 8px; text-align: right; font-weight: 600; color: #374151; font-size: 14px;">Precio</th>
                      <th style="padding: 15px 8px; text-align: right; font-weight: 600; color: #374151; font-size: 14px;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                </table>

                <!-- Order Totals -->
                <div style="margin-top: 20px; padding: 20px; background: #f8fafc; border-radius: 8px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 15px;">
                    <span style="color: #374151;">Subtotal:</span>
                    <span style="color: #1f2937; font-weight: 600;">$${parseFloat(order.subtotal).toFixed(2)}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 15px;">
                    <span style="color: #374151;">Envío:</span>
                    <span style="color: #1f2937; font-weight: 600;">$${parseFloat(order.shipping_cost).toFixed(2)}</span>
                  </div>
                  ${parseFloat(order.tax || 0) > 0 ? `
                  <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 15px;">
                    <span style="color: #374151;">Impuestos:</span>
                    <span style="color: #1f2937; font-weight: 600;">$${parseFloat(order.tax).toFixed(2)}</span>
                  </div>
                  ` : ''}
                  <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 700; color: #059669; padding-top: 15px; border-top: 2px solid #e5e7eb; margin-top: 15px;">
                    <span>Total:</span>
                    <span>$${parseFloat(order.total).toFixed(2)} USD</span>
                  </div>
                </div>
              </div>

              <!-- Next Steps -->
              <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); padding: 25px; border-radius: 12px; border-left: 4px solid #3b82f6;">
                <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 20px;">¿Qué sigue?</h3>
                <ul style="margin: 0; padding-left: 20px; color: #1e3a8a; font-size: 15px; line-height: 1.8;">
                  <li>📦 Procesaremos tu orden en las próximas 24-48 horas</li>
                  <li>📧 Te enviaremos un email cuando tu orden sea enviada</li>
                  <li>🚚 Tiempo estimado de entrega: 5-10 días hábiles</li>
                  <li>📱 Puedes rastrear tu orden usando el número: <strong>${order.order_number}</strong></li>
                </ul>
              </div>

              <!-- Support -->
              <div style="text-align: center; margin-top: 40px; padding: 25px; background: #fefefe; border-radius: 12px; border: 1px solid #e5e7eb;">
                <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 20px;">¿Necesitas ayuda?</h3>
                <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 15px;">Si tienes alguna pregunta sobre tu orden, no dudes en contactarnos:</p>
                <div style="margin: 20px 0;">
                  <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@example.com'}" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 0 10px 10px 0;">📧 Soporte por Email</a>
                  <div style="margin-top: 15px; color: #6b7280; font-size: 14px;">
                    📱 WhatsApp: +1 (555) 123-4567<br>
                    ⏰ Horario: Lunes a Viernes, 9:00 AM - 6:00 PM EST
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div style="text-align: center; margin-top: 40px; padding: 20px 0; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
                <p style="margin: 0 0 10px 0;">Gracias por elegir <strong style="color: #1f2937;">iPhone Cases Store</strong></p>
                <p style="margin: 0;">© ${new Date().getFullYear()} iPhone Cases Store. Todos los derechos reservados.</p>
                <div style="margin-top: 20px;">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="color: #667eea; text-decoration: none; margin: 0 15px;">🏠 Inicio</a>
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/track/${order.order_number}" style="color: #667eea; text-decoration: none; margin: 0 15px;">📦 Rastrear</a>
                  <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@example.com'}" style="color: #667eea; text-decoration: none; margin: 0 15px;">📧 Soporte</a>
                </div>
              </div>

            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: `"iPhone Cases Store" <${process.env.EMAIL_USER}>`,
        to: order.customer_email,
        subject: `Confirmación de Orden ${order.order_number} 📦`,
        html: html,
        attachments: [] // Aquí podrías agregar facturas PDF, etc.
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email de confirmación enviado a ${order.customer_email}`);
      console.log(`📧 Message ID: ${info.messageId}`);
      return true;

    } catch (error) {
      console.error('❌ Error enviando email de confirmación:', error);
      return false;
    }
  }
  