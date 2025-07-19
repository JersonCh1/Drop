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
            ${parseFloat(item.price).toFixed(2)}
          </td>
          <td style="padding: 12px 8px; text-align: right; font-weight: 600; font-size: 14px; color: #1f2937;">
            ${parseFloat(item.total).toFixed(2)}
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
                    <td style="padding: 8px 0; color: #059669; font-size: 20px; font-weight: 700;">${parseFloat(order.total).toFixed(2)} USD</td>
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
                    <span style="color: #1f2937; font-weight: 600;">${parseFloat(order.subtotal).toFixed(2)}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 15px;">
                    <span style="color: #374151;">Envío:</span>
                    <span style="color: #1f2937; font-weight: 600;">${parseFloat(order.shipping_cost).toFixed(2)}</span>
                  </div>
                  ${parseFloat(order.tax || 0) > 0 ? `
                  <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 15px;">
                    <span style="color: #374151;">Impuestos:</span>
                    <span style="color: #1f2937; font-weight: 600;">${parseFloat(order.tax).toFixed(2)}</span>
                  </div>
                  ` : ''}
                  <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 700; color: #059669; padding-top: 15px; border-top: 2px solid #e5e7eb; margin-top: 15px;">
                    <span>Total:</span>
                    <span>${parseFloat(order.total).toFixed(2)} USD</span>
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

  async sendShippingNotification(orderData) {
    try {
      if (!this.isConfigured) return false;

      const { order } = orderData;

      const html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="utf-8">
          <title>Tu orden ha sido enviada</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">¡Tu orden está en camino! 🚚</h1>
            <p style="margin: 15px 0 0 0; opacity: 0.9; font-size: 16px;">Orden ${order.order_number}</p>
          </div>

          <div style="background: white; padding: 30px 20px; border-radius: 0 0 12px 12px;">
            
            <div style="background: #f0fdf4; padding: 25px; border-radius: 10px; margin-bottom: 25px; border-left: 4px solid #10b981;">
              <h2 style="color: #166534; margin: 0 0 15px 0; font-size: 22px;">Información de Envío</h2>
              ${order.tracking_number ? `
                <div style="background: #dcfce7; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                  <strong style="color: #166534;">Número de Seguimiento:</strong><br>
                  <span style="font-size: 20px; color: #15803d; font-weight: bold; font-family: monospace;">${order.tracking_number}</span>
                </div>
              ` : ''}
              
              ${order.tracking_url ? `
                <div style="text-align: center; margin: 25px 0;">
                  <a href="${order.tracking_url}" style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;">
                    📦 Rastrear mi Paquete
                  </a>
                </div>
              ` : ''}

              <div style="margin-top: 20px;">
                <p style="margin: 0 0 10px 0;"><strong style="color: #166534;">Dirección de Envío:</strong></p>
                <div style="background: #f8fafc; padding: 15px; border-radius: 8px; color: #374151;">
                  <div style="font-weight: 600; margin-bottom: 5px;">${order.customer_first_name} ${order.customer_last_name}</div>
                  <div>${order.shipping_address}</div>
                  <div>${order.shipping_city}, ${order.shipping_state} ${order.shipping_postal_code}</div>
                  <div style="font-weight: 600; margin-top: 5px;">${order.shipping_country}</div>
                </div>
              </div>
            </div>

            <div style="background: #fef3c7; padding: 20px; border-radius: 10px; border-left: 4px solid #f59e0b; margin-bottom: 25px;">
              <h3 style="color: #92400e; margin: 0 0 10px 0;">⏰ Tiempo Estimado de Entrega</h3>
              <p style="margin: 0; color: #92400e;">Tu paquete debería llegar en <strong>5-7 días hábiles</strong></p>
              <p style="margin: 10px 0 0 0; font-size: 14px; color: #92400e;">Los tiempos pueden variar según la ubicación y condiciones del envío.</p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <h3 style="color: #1f2937;">¿Preguntas sobre tu envío?</h3>
              <p style="color: #6b7280;">Contáctanos si necesitas ayuda:</p>
              <p>📧 <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@example.com'}" style="color: #10b981;">${process.env.SUPPORT_EMAIL || 'support@example.com'}</a></p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
              <p>© ${new Date().getFullYear()} iPhone Cases Store. Todos los derechos reservados.</p>
            </div>

          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: `"iPhone Cases Store" <${process.env.EMAIL_USER}>`,
        to: order.customer_email,
        subject: `Tu orden ${order.order_number} ha sido enviada 🚚`,
        html: html
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email de envío enviado a ${order.customer_email}`);
      return true;

    } catch (error) {
      console.error('❌ Error enviando email de envío:', error);
      return false;
    }
  }

  async sendDeliveryNotification(orderData) {
    try {
      if (!this.isConfigured) return false;

      const { order } = orderData;

      const html = `
        <!DOCTYPE html>
        <html lang="es">
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          
          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">¡Tu orden ha sido entregada! 🎉</h1>
            <p style="margin: 15px 0 0 0; opacity: 0.9;">Orden ${order.order_number}</p>
          </div>

          <div style="background: white; padding: 30px 20px; border-radius: 0 0 12px 12px;">
            
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="font-size: 80px; margin-bottom: 20px;">📦✅</div>
              <h2 style="color: #1f2937; margin: 0;">¡Esperamos que disfrutes tu compra!</h2>
            </div>

            <div style="background: #ede9fe; padding: 25px; border-radius: 10px; margin-bottom: 25px; border-left: 4px solid #8b5cf6;">
              <h3 style="color: #6b21a8; margin: 0 0 15px 0;">⭐ ¿Te gustó nuestro servicio?</h3>
              <p style="margin: 0 0 20px 0; color: #6b21a8;">Tu opinión es muy importante para nosotros. Nos encantaría conocer tu experiencia:</p>
              <div style="text-align: center;">
                <a href="#" style="background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
                  Dejar una Reseña ⭐
                </a>
              </div>
            </div>

            <div style="background: #fef2f2; padding: 25px; border-radius: 10px; margin-bottom: 25px; border-left: 4px solid #ef4444;">
              <h3 style="color: #dc2626; margin: 0 0 10px 0;">🚨 ¿Problemas con tu orden?</h3>
              <p style="margin: 0; color: #dc2626;">Si hay algún problema con tu pedido, contáctanos dentro de las próximas 48 horas:</p>
              <p style="margin: 10px 0 0 0; color: #dc2626;">📧 ${process.env.SUPPORT_EMAIL || 'support@example.com'}<br>📱 WhatsApp: +1 (555) 123-4567</p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <h3 style="color: #1f2937;">¡Gracias por tu compra!</h3>
              <p style="color: #6b7280;">Esperamos verte pronto de nuevo en iPhone Cases Store</p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
              <p>© ${new Date().getFullYear()} iPhone Cases Store. Todos los derechos reservados.</p>
            </div>

          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: `"iPhone Cases Store" <${process.env.EMAIL_USER}>`,
        to: order.customer_email,
        subject: `¡Tu orden ${order.order_number} ha sido entregada! 🎉`,
        html: html
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email de entrega enviado a ${order.customer_email}`);
      return true;

    } catch (error) {
      console.error('❌ Error enviando email de entrega:', error);
      return false;
    }
  }

  async sendAdminNotification(orderData) {
    try {
      if (!this.isConfigured) return false;

      const { order, items } = orderData;
      const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

      const itemsList = items.map(item => 
        `- ${item.product_name} (${item.product_model} - ${item.product_color}) x${item.quantity} = ${item.total}`
      ).join('\n');

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">🛒 Nueva Orden Recibida</h2>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Número de Orden:</strong> ${order.order_number}</p>
            <p><strong>Cliente:</strong> ${order.customer_first_name} ${order.customer_last_name}</p>
            <p><strong>Email:</strong> ${order.customer_email}</p>
            <p><strong>Teléfono:</strong> ${order.customer_phone}</p>
            <p><strong>Total:</strong> ${order.total}</p>
            <p><strong>País:</strong> ${order.shipping_country}</p>
          </div>
          
          <h3>Productos:</h3>
          <pre style="background: #f1f5f9; padding: 15px; border-radius: 8px; font-size: 14px;">${itemsList}</pre>
          
          <h3>Dirección de Envío:</h3>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
            <p>${order.shipping_address}<br>
            ${order.shipping_city}, ${order.shipping_state} ${order.shipping_postal_code}<br>
            ${order.shipping_country}</p>
          </div>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin" 
               style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Ver en Panel de Admin
            </a>
          </div>
        </div>
      `;

      const mailOptions = {
        from: `"iPhone Cases Store" <${process.env.EMAIL_USER}>`,
        to: adminEmail,
        subject: `🛒 Nueva Orden ${order.order_number} - ${order.total}`,
        html: html
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Notificación de admin enviada para orden ${order.order_number}`);
      return true;

    } catch (error) {
      console.error('❌ Error enviando notificación de admin:', error);
      return false;
    }
  }

  async sendPasswordReset(email, resetToken) {
    try {
      if (!this.isConfigured) return false;

      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1f2937;">🔐 Restablecer Contraseña</h2>
          <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
              Restablecer Contraseña
            </a>
          </div>
          <p><strong>Este enlace expirará en 1 hora.</strong></p>
          <p style="color: #6b7280; font-size: 14px;">Si no solicitaste este cambio, ignora este email.</p>
        </div>
      `;

      const mailOptions = {
        from: `"iPhone Cases Store" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🔐 Restablecer Contraseña - iPhone Cases Store',
        html: html
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email de restablecimiento enviado a ${email}`);
      return true;

    } catch (error) {
      console.error('❌ Error enviando email de restablecimiento:', error);
      return false;
    }
  }

  async sendTestEmail(toEmail) {
    try {
      if (!this.isConfigured) {
        throw new Error('Servicio de email no configurado');
      }

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #059669;">✅ Email de Prueba</h2>
          <p>¡Felicitaciones! Tu configuración de email está funcionando correctamente.</p>
          <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; border-left: 4px solid #059669; margin: 20px 0;">
            <p><strong>Servidor:</strong> ${process.env.EMAIL_HOST}</p>
            <p><strong>Puerto:</strong> ${process.env.EMAIL_PORT}</p>
            <p><strong>Usuario:</strong> ${process.env.EMAIL_USER}</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p>Tu sistema de notificaciones por email está listo para usarse.</p>
        </div>
      `;

      const mailOptions = {
        from: `"iPhone Cases Store Test" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: '✅ Test Email - Configuración Exitosa',
        html: html
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email de prueba enviado a ${toEmail}`);
      return { success: true, messageId: info.messageId };

    } catch (error) {
      console.error('❌ Error enviando email de prueba:', error);
      return { success: false, error: error.message };
    }
  }

  // Método para enviar emails personalizados
  async sendCustomEmail(to, subject, htmlContent, textContent = null) {
    try {
      if (!this.isConfigured) return false;

      const mailOptions = {
        from: `"iPhone Cases Store" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: subject,
        html: htmlContent,
        text: textContent
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email personalizado enviado a ${to}: ${subject}`);
      return { success: true, messageId: info.messageId };

    } catch (error) {
      console.error('❌ Error enviando email personalizado:', error);
      return { success: false, error: error.message };
    }
  }

  // Método para obtener estadísticas del servicio
  getServiceInfo() {
    return {
      isConfigured: this.isConfigured,
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER,
      secure: process.env.EMAIL_SECURE === 'true'
    };
  }
}

const emailService = new EmailService();
module.exports = emailService;// backend/src/services/emailService.js
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
        return;
      }

      this.transporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      // Verificar conexión
      await this.transporter.verify();
      this.isConfigured = true;
      console.log('✅ Servicio de email inicializado correctamente');

    } catch (error) {
      console.error('❌ Error inicializando servicio de email:', error.message);
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
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            ${item.product_name} - ${item.product_model}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">
            ${item.product_color}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
            ${item.quantity}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
            $${item.price}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">
            $${item.total}
          </td>
        </tr>
      `).join('');

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmación de Orden</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">¡Gracias por tu compra! 🎉</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Tu orden ha sido confirmada</p>
          </div>

          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            
            <div style="background: white; padding: 25px; border-radius: 10px; margin-bottom: 25px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0;">Detalles de la Orden</h2>
              <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                <div>
                  <strong>Número de Orden:</strong><br>
                  <span style="color: #667eea; font-size: 18px; font-weight: bold;">${order.order_number}</span>
                </div>
                <div style="text-align: right;">
                  <strong>Fecha:</strong><br>
                  ${new Date(order.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>

            <div style="background: white; padding: 25px; border-radius: 10px; margin-bottom: 25px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h3 style="color: #333; margin-top: 0;">Información de Envío</h3>
              <p style="margin: 5px 0;"><strong>${order.customer_first_name} ${order.customer_last_name}</strong></p>
              <p style="margin: 5px 0;">${order.shipping_address}</p>
              <p style="margin: 5px 0;">${order.shipping_city}, ${order.shipping_state} ${order.shipping_postal_code}</p>
              <p style="margin: 5px 0;">${order.shipping_country}</p>
              <p style="margin: 15px 0 5px 0;"><strong>Teléfono:</strong> ${order.customer_phone}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${order.customer_email}</p>
            </div>

            <div style="background: white; padding: 25px; border-radius: 10px; margin-bottom: 25px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h3 style="color: #333; margin-top: 0;">Productos Ordenados</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #f8f9fa;">
                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid #dee2e6;">Cantidad</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">Precio</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #dee2e6;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span>Subtotal:</span>
                  <span>${order.subtotal}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span>Envío:</span>
                  <span>${order.shipping_cost}</span>
                </div>
                ${order.tax > 0 ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span>Impuestos:</span>
                  <span>${order.tax}</span>
                </div>
                ` : ''}
                <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #667eea; padding-top: 10px; border-top: 1px solid #dee2e6;">
                  <span>Total:</span>
                  <span>${order.total}</span>
                </div>
              </div>
            </div>

            <div style="background: #e3f2fd; padding: 20px; border-radius: 10px; border-left: 4px solid #2196f3;">
              <h3 style="color: #1976d2; margin-top: 0;">¿Qué sigue?</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>📦 Procesaremos tu orden en las próximas 24-48 horas</li>
                <li>📧 Te enviaremos un email cuando tu orden sea enviada</li>
                <li>🚚 Tiempo estimado de entrega: 5-10 días hábiles</li>
                <li>📱 Puedes rastrear tu orden usando el número: <strong>${order.order_number}</strong></li>
              </ul>
            </div>

            <div style="text-align: center; margin-top: 30px; padding: 20px; background: white; border-radius: 10px;">
              <h3 style="color: #333;">¿Necesitas ayuda?</h3>
              <p>Si tienes alguna pregunta sobre tu orden, no dudes en contactarnos:</p>
              <p>
                📧 <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@example.com'}" style="color: #667eea;">Soporte por Email</a><br>
                📱 WhatsApp: +1 (555) 123-4567<br>
                ⏰ Horario: Lunes a Viernes, 9:00 AM - 6:00 PM
              </p>
            </div>

            <div style="text-align: center; margin-top: 20px; color: #666; font-size: 14px;">
              <p>Gracias por elegir <strong>iPhone Cases Store</strong></p>
              <p>© ${new Date().getFullYear()} iPhone Cases Store. Todos los derechos reservados.</p>
            </div>

          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: `"iPhone Cases Store" <${process.env.EMAIL_USER}>`,
        to: order.customer_email,
        subject: `Confirmación de Orden ${order.order_number} 📦`,
        html: html
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email de confirmación enviado a ${order.customer_email}`);
      return true;

    } catch (error) {
      console.error('❌ Error enviando email de confirmación:', error);
      return false;
    }
  }

  async sendShippingNotification(orderData) {
    try {
      if (!this.isConfigured) return false;

      const { order } = orderData;

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Tu orden ha sido enviada</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          
          <div style="background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">¡Tu orden está en camino! 🚚</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Orden ${order.order_number}</p>
          </div>

          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            
            <div style="background: white; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
              <h2 style="color: #333; margin-top: 0;">Información de Envío</h2>
              ${order.tracking_number ? `
                <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                  <strong>Número de Seguimiento:</strong><br>
                  <span style="font-size: 18px; color: #4caf50; font-weight: bold;">${order.tracking_number}</span>
                </div>
              ` : ''}
              
              ${order.tracking_url ? `
                <div style="text-align: center; margin: 20px 0;">
                  <a href="${order.tracking_url}" style="background: #4caf50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Rastrear mi Paquete 📦
                  </a>
                </div>
              ` : ''}

              <p><strong>Dirección de Envío:</strong></p>
              <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                <p style="margin: 5px 0;"><strong>${order.customer_first_name} ${order.customer_last_name}</strong></p>
                <p style="margin: 5px 0;">${order.shipping_address}</p>
                <p style="margin: 5px 0;">${order.shipping_city}, ${order.shipping_state} ${order.shipping_postal_code}</p>
                <p style="margin: 5px 0;">${order.shipping_country}</p>
              </div>
            </div>

            <div style="background: #fff3cd; padding: 20px; border-radius: 10px; border-left: 4px solid #ffc107;">
              <h3 style="color: #856404; margin-top: 0;">Tiempo Estimado de Entrega</h3>
              <p style="margin: 0;">Tu paquete debería llegar en <strong>5-7 días hábiles</strong></p>
              <p style="margin: 10px 0 0 0; font-size: 14px; color: #856404;">Los tiempos pueden variar según la ubicación y condiciones del envío.</p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <h3 style="color: #333;">¿Preguntas sobre tu envío?</h3>
              <p>Contáctanos si necesitas ayuda:</p>
              <p>📧 ${process.env.SUPPORT_EMAIL || 'support@example.com'}</p>
            </div>

          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: `"iPhone Cases Store" <${process.env.EMAIL_USER}>`,
        to: order.customer_email,
        subject: `Tu orden ${order.order_number} ha sido enviada 🚚`,
        html: html
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email de envío enviado a ${order.customer_email}`);
      return true;

    } catch (error) {
      console.error('❌ Error enviando email de envío:', error);
      return false;
    }
  }

  async sendDeliveryNotification(orderData) {
    try {
      if (!this.isConfigured) return false;

      const { order } = orderData;

      const html = `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          
          <div style="background: linear-gradient(135deg, #9c27b0 0%, #673ab7 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">¡Tu orden ha sido entregada! 🎉</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Orden ${order.order_number}</p>
          </div>

          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="font-size: 64px; margin-bottom: 20px;">📦✅</div>
              <h2 style="color: #333;">¡Esperamos que disfrutes tu compra!</h2>
            </div>

            <div style="background: #e1f5fe; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
              <h3 style="color: #0277bd; margin-top: 0;">¿Te gustó nuestro servicio?</h3>
              <p>Tu opinión es muy importante para nosotros. Nos encantaría conocer tu experiencia:</p>
              <div style="text-align: center; margin: 20px 0;">
                <a href="#" style="background: #0277bd; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Dejar una Reseña ⭐
                </a>
              </div>
            </div>

            <div style="background: white; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
              <h3 style="color: #333; margin-top: 0;">¿Problemas con tu orden?</h3>
              <p>Si hay algún problema con tu pedido, contáctanos dentro de las próximas 48 horas:</p>
              <p>📧 ${process.env.SUPPORT_EMAIL || 'support@example.com'}<br>
                 📱 WhatsApp: +1 (555) 123-4567</p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <h3 style="color: #333;">¡Gracias por tu compra!</h3>
              <p>Esperamos verte pronto de nuevo en iPhone Cases Store</p>
            </div>

          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: `"iPhone Cases Store" <${process.env.EMAIL_USER}>`,
        to: order.customer_email,
        subject: `¡Tu orden ${order.order_number} ha sido entregada! 🎉`,
        html: html
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email de entrega enviado a ${order.customer_email}`);
      return true;

    } catch (error) {
      console.error('❌ Error enviando email de entrega:', error);
      return false;
    }
  }

  async sendAdminNotification(orderData) {
    try {
      if (!this.isConfigured) return false;

      const { order, items } = orderData;
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';

      const itemsList = items.map(item => 
        `- ${item.product_name} (${item.product_model} - ${item.product_color}) x${item.quantity} = ${item.total}`
      ).join('\n');

      const html = `
        <h2>Nueva Orden Recibida 🛒</h2>
        <p><strong>Número de Orden:</strong> ${order.order_number}</p>
        <p><strong>Cliente:</strong> ${order.customer_first_name} ${order.customer_last_name}</p>
        <p><strong>Email:</strong> ${order.customer_email}</p>
        <p><strong>Teléfono:</strong> ${order.customer_phone}</p>
        <p><strong>Total:</strong> ${order.total}</p>
        
        <h3>Productos:</h3>
        <pre>${itemsList}</pre>
        
        <h3>Dirección de Envío:</h3>
        <p>${order.shipping_address}<br>
        ${order.shipping_city}, ${order.shipping_state} ${order.shipping_postal_code}<br>
        ${order.shipping_country}</p>
        
        <p><a href="${process.env.FRONTEND_URL}/admin">Ver en Panel de Admin</a></p>
      `;

      const mailOptions = {
        from: `"iPhone Cases Store" <${process.env.EMAIL_USER}>`,
        to: adminEmail,
        subject: `Nueva Orden ${order.order_number} - ${order.total}`,
        html: html
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Notificación de admin enviada para orden ${order.order_number}`);
      return true;

    } catch (error) {
      console.error('❌ Error enviando notificación de admin:', error);
      return false;
    }
  }

  async sendPasswordReset(email, resetToken) {
    try {
      if (!this.isConfigured) return false;

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

      const html = `
        <h2>Restablecer Contraseña</h2>
        <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace:</p>
        <p><a href="${resetUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a></p>
        <p>Este enlace expirará en 1 hora.</p>
        <p>Si no solicitaste este cambio, ignora este email.</p>
      `;

      const mailOptions = {
        from: `"iPhone Cases Store" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Restablecer Contraseña - iPhone Cases Store',
        html: html
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email de restablecimiento enviado a ${email}`);
      return true;

    } catch (error) {
      console.error('❌ Error enviando email de restablecimiento:', error);
      return false;
    }
  }
}

module.exports = new EmailService();: left; border-bottom: 2px solid #dee2e6;">Producto</th>
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Color</th>
                    <th style="padding: 12px; text-align