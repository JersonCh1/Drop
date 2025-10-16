// backend/src/services/supplierNotificationService.js
const { PrismaClient } = require('@prisma/client');
const emailService = require('./emailService');
const prisma = new PrismaClient();

/**
 * 🚀 SERVICIO DE NOTIFICACIONES AUTOMÁTICAS A PROVEEDORES
 *
 * Cuando un cliente paga, este servicio automáticamente:
 * 1. Envía email al proveedor con detalles de la orden
 * 2. Envía WhatsApp (si está configurado)
 * 3. Crea orden vía API (si el proveedor lo soporta)
 * 4. Guarda en panel de órdenes pendientes
 */

/**
 * Enviar información de órdenes a proveedores
 * @param {Array} supplierOrders - Array de órdenes de proveedores
 * @returns {Promise<Array>} Resultados de las notificaciones
 */
async function sendOrderToSuppliers(supplierOrders) {
  const results = [];

  for (const supplierOrder of supplierOrders) {
    try {
      // Cargar información completa
      const fullOrder = await prisma.supplierOrder.findUnique({
        where: { id: supplierOrder.id },
        include: {
          supplier: true,
          order: {
            include: {
              items: {
                include: {
                  product: true
                }
              }
            }
          }
        }
      });

      if (!fullOrder) {
        console.error(`❌ Orden de proveedor ${supplierOrder.id} no encontrada`);
        continue;
      }

      const supplier = fullOrder.supplier;
      const customerOrder = fullOrder.order;

      console.log(`📤 Enviando notificación a ${supplier.name} para orden ${fullOrder.id}`);

      // MÉTODO 1: Email al proveedor
      if (supplier.contactEmail) {
        const emailResult = await sendEmailToSupplier(fullOrder);
        results.push({
          supplierOrderId: fullOrder.id,
          supplier: supplier.name,
          method: 'email',
          ...emailResult
        });
      } else {
        console.log(`⚠️  ${supplier.name} no tiene email configurado`);
      }

      // MÉTODO 2: WhatsApp Business API (placeholder)
      if (supplier.contactPhone) {
        const whatsappResult = await sendWhatsAppToSupplier(fullOrder);
        results.push({
          supplierOrderId: fullOrder.id,
          supplier: supplier.name,
          method: 'whatsapp',
          ...whatsappResult
        });
      }

      // MÉTODO 3: API del proveedor (si está habilitado)
      if (supplier.apiEnabled && supplier.apiKey) {
        const apiResult = await createOrderViaAPI(fullOrder);
        results.push({
          supplierOrderId: fullOrder.id,
          supplier: supplier.name,
          method: 'api',
          ...apiResult
        });
      }

      // MÉTODO 4: Marcar como pendiente para acción manual en panel
      await prisma.supplierOrder.update({
        where: { id: fullOrder.id },
        data: {
          status: supplier.apiEnabled ? 'PLACED' : 'PENDING',
          notes: supplier.apiEnabled
            ? 'Orden enviada automáticamente al proveedor'
            : 'Orden lista para procesar manualmente. Ver panel de admin.'
        }
      });

      console.log(`✅ Notificaciones enviadas a ${supplier.name}`);

    } catch (error) {
      console.error(`❌ Error enviando notificación para orden ${supplierOrder.id}:`, error);
      results.push({
        supplierOrderId: supplierOrder.id,
        method: 'error',
        success: false,
        error: error.message
      });
    }
  }

  return results;
}

/**
 * MÉTODO 1: Enviar email al proveedor con detalles de la orden
 */
async function sendEmailToSupplier(supplierOrder) {
  try {
    const { supplier, order } = supplierOrder;

    // Construir tabla de productos
    const productsTable = order.items.map(item => `
      <tr style="border-bottom: 1px solid #e0e0e0;">
        <td style="padding: 12px; text-align: left;">
          <strong>${item.productName}</strong><br>
          <span style="color: #666; font-size: 12px;">
            ${item.productModel ? `Modelo: ${item.productModel}` : ''}
            ${item.productColor ? ` • Color: ${item.productColor}` : ''}
          </span>
          ${item.product.supplierUrl ? `<br><a href="${item.product.supplierUrl}" style="color: #0066cc; font-size: 12px;">Ver en ${supplier.name}</a>` : ''}
        </td>
        <td style="padding: 12px; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; text-align: right;">$${(item.product.supplierPrice || 0).toFixed(2)}</td>
        <td style="padding: 12px; text-align: right; font-weight: bold;">$${(item.quantity * (item.product.supplierPrice || 0)).toFixed(2)}</td>
      </tr>
    `).join('');

    const emailContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
    .order-box { background: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; }
    .shipping-box { background: #fff3cd; border: 2px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 5px; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #667eea; color: white; padding: 12px; text-align: left; }
    .total-row { background: #f8f9fa; font-weight: bold; font-size: 16px; }
    .btn { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">📦 Nueva Orden de Compra</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Acción requerida - Procesar inmediatamente</p>
    </div>

    <div class="content">
      <div class="order-box">
        <h3 style="margin-top: 0; color: #667eea;">📋 Información de la Orden</h3>
        <table style="width: 100%; border: none;">
          <tr>
            <td style="padding: 5px 0;"><strong>Número de Orden:</strong></td>
            <td style="padding: 5px 0; text-align: right; color: #667eea; font-weight: bold;">${supplierOrder.id}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>Fecha:</strong></td>
            <td style="padding: 5px 0; text-align: right;">${new Date(supplierOrder.createdAt).toLocaleDateString('es-PE', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>Orden del Cliente:</strong></td>
            <td style="padding: 5px 0; text-align: right;">${order.orderNumber}</td>
          </tr>
        </table>
      </div>

      <h3>🛍️ Productos a Enviar</h3>
      <table>
        <thead>
          <tr>
            <th style="text-align: left;">Producto</th>
            <th style="text-align: center; width: 80px;">Cantidad</th>
            <th style="text-align: right; width: 100px;">Precio Unit.</th>
            <th style="text-align: right; width: 100px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${productsTable}
          <tr class="total-row">
            <td colspan="3" style="padding: 15px; text-align: right;">Subtotal:</td>
            <td style="padding: 15px; text-align: right;">$${supplierOrder.subtotal.toFixed(2)}</td>
          </tr>
          <tr class="total-row">
            <td colspan="3" style="padding: 15px; text-align: right;">Costo de Envío:</td>
            <td style="padding: 15px; text-align: right;">$${supplierOrder.shippingCost.toFixed(2)}</td>
          </tr>
          <tr class="total-row" style="background: #667eea; color: white;">
            <td colspan="3" style="padding: 15px; text-align: right; font-size: 18px;">TOTAL A PAGAR:</td>
            <td style="padding: 15px; text-align: right; font-size: 18px;">$${supplierOrder.total.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <div class="shipping-box">
        <h3 style="margin-top: 0; color: #856404;">📍 Dirección de Envío (IMPORTANTE)</h3>
        <p style="margin: 5px 0;"><strong>Destinatario:</strong> ${order.customerFirstName} ${order.customerLastName}</p>
        <p style="margin: 5px 0;"><strong>Dirección:</strong> ${order.shippingAddress}</p>
        <p style="margin: 5px 0;"><strong>Ciudad/Estado:</strong> ${order.shippingCity}, ${order.shippingState}</p>
        <p style="margin: 5px 0;"><strong>Código Postal:</strong> ${order.shippingPostalCode}</p>
        <p style="margin: 5px 0;"><strong>País:</strong> ${order.shippingCountry}</p>
        <p style="margin: 5px 0;"><strong>Teléfono:</strong> ${order.customerPhone}</p>
        <p style="margin: 5px 0;"><strong>Email:</strong> ${order.customerEmail}</p>

        <div style="background: white; padding: 10px; margin-top: 15px; border-radius: 5px; border: 1px dashed #ffc107;">
          <p style="margin: 0; font-size: 12px; color: #856404;">
            ⚠️ <strong>MUY IMPORTANTE:</strong> Usar EXACTAMENTE esta dirección para el envío.
            El paquete debe llegar directamente al cliente final.
          </p>
        </div>
      </div>

      <h3>📝 Instrucciones para Procesar</h3>
      <ol style="line-height: 2;">
        <li><strong>Verificar stock:</strong> Confirma que todos los productos están disponibles</li>
        <li><strong>Procesar pago:</strong> Monto total: <strong style="color: #667eea;">$${supplierOrder.total.toFixed(2)}</strong></li>
        <li><strong>Preparar envío:</strong> Usar la dirección exacta indicada arriba</li>
        <li><strong>Proporcionar tracking:</strong> Enviar número de tracking cuando esté disponible a <strong>${process.env.ADMIN_EMAIL || 'admin@tienda.com'}</strong></li>
        <li><strong>Confirmación:</strong> Notificar cuando el paquete sea enviado</li>
      </ol>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${supplier.website || 'https://www.aliexpress.com'}" class="btn">
          🛒 Ir a ${supplier.name}
        </a>
      </div>

      <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin-top: 20px;">
        <p style="margin: 0; font-size: 13px; color: #1565c0;">
          💡 <strong>Tip:</strong> Responde a este email con el número de tracking cuando esté disponible,
          o envíalo a <strong>${process.env.ADMIN_EMAIL || 'admin@tienda.com'}</strong>
        </p>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 5px 0;">Este email fue generado automáticamente por el sistema de dropshipping</p>
      <p style="margin: 5px 0; color: #999;">ID de Orden: ${supplierOrder.id}</p>
      <p style="margin: 15px 0 5px 0;">
        <a href="mailto:${process.env.ADMIN_EMAIL || 'admin@tienda.com'}" style="color: #667eea; text-decoration: none;">
          Contactar Soporte
        </a>
      </p>
    </div>
  </div>
</body>
</html>
    `;

    // Enviar email usando el servicio de email existente
    const emailResult = await emailService.sendEmail({
      to: supplier.contactEmail,
      subject: `🔔 Nueva Orden #${supplierOrder.id} - ${supplier.name} - Acción Requerida`,
      html: emailContent
    });

    if (emailResult && emailResult.success) {
      console.log(`✅ Email enviado exitosamente a ${supplier.name} (${supplier.contactEmail})`);
      return { success: true, supplier: supplier.name, email: supplier.contactEmail };
    } else {
      console.error(`❌ Error enviando email a ${supplier.name}`);
      return { success: false, error: 'Email service error', supplier: supplier.name };
    }

  } catch (error) {
    console.error('❌ Error en sendEmailToSupplier:', error);
    return {
      success: false,
      error: error.message,
      supplier: supplierOrder.supplier?.name || 'Unknown'
    };
  }
}

/**
 * MÉTODO 2: WhatsApp Business API
 * Placeholder - Requiere configuración de Twilio o similar
 */
async function sendWhatsAppToSupplier(supplierOrder) {
  try {
    const { supplier, order } = supplierOrder;

    const message = `
🔔 *Nueva Orden de Compra*

📦 *Orden:* ${supplierOrder.id}
💰 *Total a Pagar:* $${supplierOrder.total.toFixed(2)}

*Productos:*
${order.items.map(item => `• ${item.productName} x${item.quantity} - $${(item.quantity * (item.product.supplierPrice || 0)).toFixed(2)}`).join('\n')}

*📍 Enviar a:*
${order.customerFirstName} ${order.customerLastName}
${order.shippingAddress}
${order.shippingCity}, ${order.shippingState} ${order.shippingPostalCode}
${order.shippingCountry}
📞 ${order.customerPhone}
✉️ ${order.customerEmail}

*Instrucciones:*
1. Procesar esta orden
2. Enviar a la dirección exacta
3. Proporcionar número de tracking

_Orden generada automáticamente_
    `.trim();

    // TODO: Implementar integración con WhatsApp Business API
    // Requiere cuenta de Twilio, MessageBird u otro proveedor

    console.log(`📱 WhatsApp para ${supplier.name}:`, message);
    console.log(`⚠️  WhatsApp API no configurada. Implementar con Twilio o similar.`);

    return {
      success: false,
      message: 'WhatsApp API not configured',
      supplier: supplier.name
    };

  } catch (error) {
    console.error('❌ Error en sendWhatsAppToSupplier:', error);
    return { success: false, error: error.message };
  }
}

/**
 * MÉTODO 3: API del Proveedor (CJ Dropshipping, etc.)
 * Placeholder - Implementar según el proveedor específico
 */
async function createOrderViaAPI(supplierOrder) {
  try {
    const { supplier, order } = supplierOrder;

    console.log(`🔄 Intentando crear orden vía API en ${supplier.name}...`);

    // Ejemplo placeholder para CJ Dropshipping
    if (supplier.slug === 'cjdropshipping' && supplier.apiKey) {
      // TODO: Implementar integración real con CJ Dropshipping API
      /*
      const axios = require('axios');
      const response = await axios.post('https://api.cjdropshipping.com/v1/orders/create', {
        products: order.items.map(item => ({
          productId: item.product.supplierProductId,
          quantity: item.quantity,
          variantId: item.variantId
        })),
        shippingAddress: {
          name: `${order.customerFirstName} ${order.customerLastName}`,
          phone: order.customerPhone,
          email: order.customerEmail,
          address: order.shippingAddress,
          city: order.shippingCity,
          state: order.shippingState,
          zip: order.shippingPostalCode,
          country: order.shippingCountry
        }
      }, {
        headers: {
          'CJ-Access-Token': supplier.apiKey
        }
      });

      await prisma.supplierOrder.update({
        where: { id: supplierOrder.id },
        data: {
          supplierOrderId: response.data.orderId,
          supplierOrderNumber: response.data.orderNumber,
          status: 'PLACED',
          orderedAt: new Date()
        }
      });

      return { success: true, orderId: response.data.orderId };
      */
    }

    console.log(`⚠️  API no configurada para ${supplier.name}`);
    return {
      success: false,
      message: `API integration not configured for ${supplier.name}`,
      supplier: supplier.name
    };

  } catch (error) {
    console.error('❌ Error en createOrderViaAPI:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtener resumen de notificaciones para una orden
 */
async function getNotificationStatus(supplierOrderId) {
  try {
    const supplierOrder = await prisma.supplierOrder.findUnique({
      where: { id: supplierOrderId },
      include: {
        supplier: true
      }
    });

    if (!supplierOrder) {
      return { success: false, error: 'Supplier order not found' };
    }

    return {
      success: true,
      status: {
        orderId: supplierOrder.id,
        supplier: supplierOrder.supplier.name,
        emailSent: !!supplierOrder.supplier.contactEmail,
        whatsappSent: false, // TODO: Track actual send status
        apiCreated: supplierOrder.status === 'PLACED',
        currentStatus: supplierOrder.status
      }
    };

  } catch (error) {
    console.error('Error getting notification status:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendOrderToSuppliers,
  sendEmailToSupplier,
  sendWhatsAppToSupplier,
  createOrderViaAPI,
  getNotificationStatus
};
