// backend/src/services/dsersNotificationService.js
const nodemailer = require('nodemailer');

/**
 * Enviar notificación por email cuando hay una nueva orden para DSers
 */
async function sendNewOrderNotification(order, dsersOrderData) {
  try {
    // Configurar transporter de email
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const emailHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="background: #4CAF50; color: white; padding: 20px; text-align: center;">
          🚀 NUEVA ORDEN PARA DSERS
        </h2>

        <div style="padding: 20px; background: #f5f5f5;">
          <h3>Orden: ${order.orderNumber}</h3>
          <p><strong>Total:</strong> $${order.total} USD</p>
          <p><strong>Cliente:</strong> ${order.customerFirstName} ${order.customerLastName}</p>
          <p><strong>Email:</strong> ${order.customerEmail}</p>
          <p><strong>Tel\u00e9fono:</strong> ${order.customerPhone}</p>

          <h4>Direcci\u00f3n de env\u00edo:</h4>
          <p>
            ${order.shippingAddress}<br>
            ${order.shippingCity}, ${order.shippingState} ${order.shippingPostalCode}<br>
            ${order.shippingCountry}
          </p>

          <h4>Productos:</h4>
          <ul>
            ${dsersOrderData.items.map(item => `
              <li>
                <strong>${item.productName}</strong>
                ${item.variantName ? `- ${item.variantName}` : ''}
                (x${item.quantity})
                ${item.aliexpressUrl ? `<br><a href="${item.aliexpressUrl}" target="_blank">Ver en AliExpress</a>` : ''}
              </li>
            `).join('')}
          </ul>

          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
            <h4 style="margin-top: 0;">⚠️ SIGUIENTE PASO:</h4>
            <ol>
              <li>Ve a: <a href="http://localhost:3001/api/dsers/csv" target="_blank">Descargar CSV de \u00f3rdenes</a></li>
              <li>Abre DSers en tu navegador</li>
              <li>Import List → Subir CSV</li>
              <li>Map Suppliers → Push to AliExpress</li>
            </ol>
          </div>

          <div style="background: #d1ecf1; border-left: 4px solid #0c5460; padding: 15px; margin: 20px 0;">
            <h4 style="margin-top: 0;">💡 ACCESOS R\u00c1PIDOS:</h4>
            <p>
              <a href="http://localhost:3001/api/dsers/pending" target="_blank" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 5px;">Ver \u00d3rdenes Pendientes</a>
              <a href="http://localhost:3001/api/dsers/csv" target="_blank" style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 5px;">Descargar CSV</a>
            </p>
          </div>
        </div>

        <div style="background: #333; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0;">CASEPRO Dropshipping - Automatizaci\u00f3n DSers</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"CASEPRO Dropshipping" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `🚀 Nueva Orden DSers: ${order.orderNumber} - $${order.total}`,
      html: emailHTML
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email enviado: ${info.messageId}`);

    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('❌ Error enviando email:', error);
    throw error;
  }
}

/**
 * Enviar resumen diario de \u00f3rdenes pendientes
 */
async function sendDailySummary(pendingOrders) {
  if (pendingOrders.length === 0) {
    console.log('✅ No hay \u00f3rdenes pendientes para el resumen diario');
    return { success: true, message: 'No hay \u00f3rdenes pendientes' };
  }

  try {
    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const totalAmount = pendingOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);

    const emailHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="background: #ff9800; color: white; padding: 20px; text-align: center;">
          📊 RESUMEN DIARIO DE \u00d3RDENES
        </h2>

        <div style="padding: 20px; background: #f5f5f5;">
          <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h3 style="margin-top: 0;">Estad\u00edsticas del D\u00eda</h3>
            <p><strong>\u00d3rdenes Pendientes:</strong> ${pendingOrders.length}</p>
            <p><strong>Total:</strong> $${totalAmount.toFixed(2)} USD</p>
          </div>

          <h4>\u00d3rdenes Pendientes de Procesar:</h4>
          <ul style="background: white; padding: 20px; border-radius: 10px;">
            ${pendingOrders.map(order => `
              <li style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #eee;">
                <strong>${order.orderNumber}</strong> - $${order.total}<br>
                Cliente: ${order.customer}<br>
                Fecha: ${new Date(order.orderDate).toLocaleDateString()}
              </li>
            `).join('')}
          </ul>

          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
            <p style="margin: 0;"><strong>⚠️ Recuerda procesar estas \u00f3rdenes en DSers</strong></p>
          </div>

          <p style="text-align: center;">
            <a href="http://localhost:3001/api/dsers/csv" style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">Descargar CSV para DSers</a>
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"CASEPRO Dropshipping" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `📊 Resumen Diario: ${pendingOrders.length} \u00f3rdenes pendientes`,
      html: emailHTML
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Resumen diario enviado: ${info.messageId}`);

    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('❌ Error enviando resumen diario:', error);
    throw error;
  }
}

module.exports = {
  sendNewOrderNotification,
  sendDailySummary
};
