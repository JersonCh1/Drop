// backend/src/services/notificationService.js
const { getDbClient } = require('../utils/database');
const emailService = require('./emailService');

class NotificationService {
  constructor() {
    this.maxRetries = 3;
  }

  async createNotification(notificationData) {
    try {
      const {
        orderId,
        type,
        channel,
        recipient,
        subject,
        message
      } = notificationData;

      const client = await getDbClient();
      await client.connect();

      const result = await client.query(`
        INSERT INTO order_notifications (
          order_id, type, channel, recipient, subject, message, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
        RETURNING id
      `, [orderId, type, channel, recipient, subject, message]);

      await client.end();

      const notificationId = result.rows[0].id;
      console.log(`📧 Notificación creada: ${notificationId} (${type})`);

      return notificationId;

    } catch (error) {
      console.error('❌ Error creando notificación:', error);
      throw error;
    }
  }

  async sendOrderConfirmation(orderId) {
    try {
      const orderData = await this.getOrderData(orderId);
      
      if (!orderData) {
        console.error('❌ Orden no encontrada:', orderId);
        return false;
      }

      // Crear notificación de confirmación por email
      await this.createNotification({
        orderId: orderId,
        type: 'ORDER_CONFIRMATION',
        channel: 'EMAIL',
        recipient: orderData.order.customer_email,
        subject: `Confirmación de Orden ${orderData.order.order_number}`,
        message: `Tu orden ${orderData.order.order_number} ha sido confirmada.`
      });

      // Enviar email inmediatamente
      const emailSent = await emailService.sendOrderConfirmation(orderData);

      if (emailSent) {
        await this.markNotificationAsSent(orderId, 'ORDER_CONFIRMATION', 'EMAIL');
      }

      // Notificar al admin
      await emailService.sendAdminNotification(orderData);

      return emailSent;

    } catch (error) {
      console.error('❌ Error enviando confirmación de orden:', error);
      return false;
    }
  }

  async sendShippingNotification(orderId, trackingNumber = null, trackingUrl = null) {
    try {
      const orderData = await this.getOrderData(orderId);
      
      if (!orderData) {
        console.error('❌ Orden no encontrada:', orderId);
        return false;
      }

      // Actualizar tracking info si se proporcionó
      if (trackingNumber || trackingUrl) {
        const client = await getDbClient();
        await client.connect();

        await client.query(`
          UPDATE orders 
          SET tracking_number = $1, tracking_url = $2, shipped_at = NOW()
          WHERE id = $3
        `, [trackingNumber, trackingUrl, orderId]);

        await client.end();

        // Actualizar el objeto order con la nueva info
        orderData.order.tracking_number = trackingNumber;
        orderData.order.tracking_url = trackingUrl;
      }

      // Crear notificación de envío
      await this.createNotification({
        orderId: orderId,
        type: 'ORDER_SHIPPED',
        channel: 'EMAIL',
        recipient: orderData.order.customer_email,
        subject: `Tu orden ${orderData.order.order_number} ha sido enviada`,
        message: `Tu orden ha sido enviada${trackingNumber ? ` con número de seguimiento: ${trackingNumber}` : ''}.`
      });

      // Enviar email
      const emailSent = await emailService.sendShippingNotification(orderData);

      if (emailSent) {
        await this.markNotificationAsSent(orderId, 'ORDER_SHIPPED', 'EMAIL');
      }

      return emailSent;

    } catch (error) {
      console.error('❌ Error enviando notificación de envío:', error);
      return false;
    }
  }

  async sendDeliveryNotification(orderId) {
    try {
      const orderData = await this.getOrderData(orderId);
      
      if (!orderData) {
        console.error('❌ Orden no encontrada:', orderId);
        return false;
      }

      // Actualizar fecha de entrega
      const client = await getDbClient();
      await client.connect();

      await client.query(`
        UPDATE orders 
        SET delivered_at = NOW()
        WHERE id = $1
      `, [orderId]);

      await client.end();

      // Crear notificación de entrega
      await this.createNotification({
        orderId: orderId,
        type: 'ORDER_DELIVERED',
        channel: 'EMAIL',
        recipient: orderData.order.customer_email,
        subject: `¡Tu orden ${orderData.order.order_number} ha sido entregada!`,
        message: `Tu orden ha sido entregada exitosamente. ¡Esperamos que disfrutes tu compra!`
      });

      // Enviar email
      const emailSent = await emailService.sendDeliveryNotification(orderData);

      if (emailSent) {
        await this.markNotificationAsSent(orderId, 'ORDER_DELIVERED', 'EMAIL');
      }

      return emailSent;

    } catch (error) {
      console.error('❌ Error enviando notificación de entrega:', error);
      return false;
    }
  }

  async sendCancellationNotification(orderId, reason = null) {
    try {
      const orderData = await this.getOrderData(orderId);
      
      if (!orderData) {
        console.error('❌ Orden no encontrada:', orderId);
        return false;
      }

      const reasonText = reason ? ` Motivo: ${reason}` : '';

      // Crear notificación de cancelación
      await this.createNotification({
        orderId: orderId,
        type: 'ORDER_CANCELLED',
        channel: 'EMAIL',
        recipient: orderData.order.customer_email,
        subject: `Tu orden ${orderData.order.order_number} ha sido cancelada`,
        message: `Lamentamos informarte que tu orden ha sido cancelada.${reasonText}`
      });

      // Por ahora solo log, pero aquí iría el email
      console.log(`📧 Notificación de cancelación enviada para orden ${orderData.order.order_number}`);

      return true;

    } catch (error) {
      console.error('❌ Error enviando notificación de cancelación:', error);
      return false;
    }
  }

  async processPendingNotifications() {
    try {
      const client = await getDbClient();
      await client.connect();

      // Obtener notificaciones pendientes
      const pendingNotifications = await client.query(`
        SELECT n.*, o."customerEmail", o."orderNumber"
        FROM order_notifications n
        JOIN orders o ON n."orderId" = o.id
        WHERE n.status = 'PENDING'
          AND n."retryCount" < $1
        ORDER BY n."createdAt" ASC
        LIMIT 10
      `, [this.maxRetries]);

      for (const notification of pendingNotifications.rows) {
        try {
          let sent = false;

          if (notification.channel === 'EMAIL') {
            // Obtener datos completos de la orden
            const orderData = await this.getOrderData(notification.order_id);
            
            switch (notification.type) {
              case 'ORDER_CONFIRMATION':
                sent = await emailService.sendOrderConfirmation(orderData);
                break;
              case 'ORDER_SHIPPED':
                sent = await emailService.sendShippingNotification(orderData);
                break;
              case 'ORDER_DELIVERED':
                sent = await emailService.sendDeliveryNotification(orderData);
                break;
              default:
                console.log(`⚠️  Tipo de notificación no soportado: ${notification.type}`);
            }
          }

          if (sent) {
            // Marcar como enviada
            await client.query(`
              UPDATE order_notifications 
              SET status = 'SENT', sent_at = NOW()
              WHERE id = $1
            `, [notification.id]);

            console.log(`✅ Notificación ${notification.id} enviada exitosamente`);
          } else {
            // Incrementar contador de reintentos
            await client.query(`
              UPDATE order_notifications 
              SET retry_count = retry_count + 1, error = 'Error sending notification'
              WHERE id = $1
            `, [notification.id]);

            console.log(`❌ Error enviando notificación ${notification.id}, intento ${notification.retry_count + 1}`);
          }

        } catch (error) {
          console.error(`❌ Error procesando notificación ${notification.id}:`, error);

          // Marcar como fallida si excede reintentos
          if (notification.retry_count >= this.maxRetries - 1) {
            await client.query(`
              UPDATE order_notifications 
              SET status = 'FAILED', error = $1
              WHERE id = $2
            `, [error.message, notification.id]);
          } else {
            await client.query(`
              UPDATE order_notifications 
              SET retry_count = retry_count + 1, error = $1
              WHERE id = $2
            `, [error.message, notification.id]);
          }
        }
      }

      await client.end();

      if (pendingNotifications.rows.length > 0) {
        console.log(`📧 Procesadas ${pendingNotifications.rows.length} notificaciones pendientes`);
      }

    } catch (error) {
      console.error('❌ Error procesando notificaciones pendientes:', error);
    }
  }

  async getOrderData(orderId) {
    try {
      const client = await getDbClient();
      await client.connect();

      // Obtener datos de la orden
      const orderResult = await client.query(`
        SELECT * FROM orders WHERE id = $1
      `, [orderId]);

      if (orderResult.rows.length === 0) {
        await client.end();
        return null;
      }

      const order = orderResult.rows[0];

      // Obtener items de la orden
      const itemsResult = await client.query(`
        SELECT * FROM order_items WHERE order_id = $1
      `, [orderId]);

      await client.end();

      return {
        order: order,
        items: itemsResult.rows
      };

    } catch (error) {
      console.error('❌ Error obteniendo datos de orden:', error);
      return null;
    }
  }

  async markNotificationAsSent(orderId, type, channel) {
    try {
      const client = await getDbClient();
      await client.connect();

      await client.query(`
        UPDATE order_notifications 
        SET status = 'SENT', sent_at = NOW()
        WHERE order_id = $1 AND type = $2 AND channel = $3 AND status = 'PENDING'
      `, [orderId, type, channel]);

      await client.end();

    } catch (error) {
      console.error('❌ Error marcando notificación como enviada:', error);
    }
  }

  async getNotificationHistory(orderId) {
    try {
      const client = await getDbClient();
      await client.connect();

      const notifications = await client.query(`
        SELECT * FROM order_notifications 
        WHERE order_id = $1 
        ORDER BY created_at DESC
      `, [orderId]);

      await client.end();

      return notifications.rows.map(notification => ({
        id: notification.id,
        type: notification.type,
        channel: notification.channel,
        recipient: notification.recipient,
        subject: notification.subject,
        message: notification.message,
        status: notification.status,
        sentAt: notification.sent_at,
        error: notification.error,
        retryCount: notification.retry_count,
        createdAt: notification.created_at
      }));

    } catch (error) {
      console.error('❌ Error obteniendo historial de notificaciones:', error);
      return [];
    }
  }

  async sendBulkNotification(orderIds, type, customMessage = null) {
    try {
      console.log(`📧 Enviando notificación masiva tipo ${type} a ${orderIds.length} órdenes`);

      let successCount = 0;
      let errorCount = 0;

      for (const orderId of orderIds) {
        try {
          let result = false;

          switch (type) {
            case 'ORDER_CONFIRMATION':
              result = await this.sendOrderConfirmation(orderId);
              break;
            case 'ORDER_SHIPPED':
              result = await this.sendShippingNotification(orderId);
              break;
            case 'ORDER_DELIVERED':
              result = await this.sendDeliveryNotification(orderId);
              break;
            default:
              console.error(`❌ Tipo de notificación no soportado: ${type}`);
              continue;
          }

          if (result) {
            successCount++;
          } else {
            errorCount++;
          }

        } catch (error) {
          console.error(`❌ Error enviando notificación a orden ${orderId}:`, error);
          errorCount++;
        }
      }

      console.log(`✅ Notificaciones masivas completadas: ${successCount} exitosas, ${errorCount} fallidas`);

      return {
        success: successCount,
        errors: errorCount,
        total: orderIds.length
      };

    } catch (error) {
      console.error('❌ Error enviando notificaciones masivas:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();