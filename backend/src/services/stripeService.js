// backend/src/services/stripeService.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { getDbClient } = require('../utils/database');

class StripeService {
  constructor() {
    this.stripe = stripe;
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  }

  async initialize() {
    try {
      if (!process.env.STRIPE_SECRET_KEY) {
        console.log('⚠️  Stripe no configurado - STRIPE_SECRET_KEY no encontrada');
        return;
      }

      // Verificar que la conexión a Stripe funcione
      await this.stripe.accounts.retrieve();
      console.log('✅ Stripe inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando Stripe:', error.message);
    }
  }

  async createCheckoutSession(orderData) {
    try {
      const { customerInfo, items, orderId, orderNumber } = orderData;

      // Crear line items para Stripe
      const lineItems = items.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${item.name} - ${item.model}`,
            description: `Color: ${item.color}`,
            images: item.image ? [item.image] : [],
          },
          unit_amount: Math.round(item.price * 100), // Convertir a centavos
        },
        quantity: item.quantity,
      }));

      // Agregar costo de envío si existe
      if (orderData.shippingCost > 0) {
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Envío',
              description: `Envío a ${customerInfo.country}`,
            },
            unit_amount: Math.round(orderData.shippingCost * 100),
          },
          quantity: 1,
        });
      }

      // Crear sesión de checkout
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/order-success?session_id={CHECKOUT_SESSION_ID}&order=${orderNumber}`,
        cancel_url: `${process.env.FRONTEND_URL}/checkout?cancelled=true`,
        customer_email: customerInfo.email,
        metadata: {
          orderId: orderId.toString(),
          orderNumber: orderNumber,
          customerEmail: customerInfo.email
        },
        billing_address_collection: 'auto',
        shipping_address_collection: {
          allowed_countries: ['US', 'CA', 'MX', 'PE', 'CO', 'EC', 'BO', 'CL', 'AR', 'BR']
        },
        phone_number_collection: {
          enabled: true
        }
      });

      // Actualizar orden con session ID
      const client = await getDbClient();
      await client.connect();
      
      await client.query(
        'UPDATE orders SET stripe_session_id = $1, payment_status = $2 WHERE id = $3',
        [session.id, 'PENDING', orderId]
      );
      
      await client.end();

      return {
        sessionId: session.id,
        url: session.url
      };

    } catch (error) {
      console.error('❌ Error creando sesión de Stripe:', error);
      throw new Error('Error al crear sesión de pago');
    }
  }

  async handleWebhook(body, signature) {
    try {
      if (!this.webhookSecret) {
        console.log('⚠️  Webhook secret no configurado');
        return;
      }

      // Verificar la firma del webhook
      const event = this.stripe.webhooks.constructEvent(
        body,
        signature,
        this.webhookSecret
      );

      console.log(`🔔 Webhook recibido: ${event.type}`);

      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object);
          break;
        
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;
        
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;
        
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object);
          break;
        
        default:
          console.log(`🤷 Evento no manejado: ${event.type}`);
      }

    } catch (error) {
      console.error('❌ Error procesando webhook:', error);
      throw error;
    }
  }

  async handleCheckoutCompleted(session) {
    try {
      console.log('💳 Checkout completado:', session.id);

      const client = await getDbClient();
      await client.connect();

      // Buscar la orden por session ID
      const orderResult = await client.query(
        'SELECT * FROM orders WHERE stripe_session_id = $1',
        [session.id]
      );

      if (orderResult.rows.length === 0) {
        console.error('❌ Orden no encontrada para session:', session.id);
        await client.end();
        return;
      }

      const order = orderResult.rows[0];

      // Actualizar estado de la orden
      await client.query(`
        UPDATE orders 
        SET 
          payment_status = 'PAID',
          status = 'CONFIRMED',
          stripe_payment_id = $1,
          updated_at = NOW()
        WHERE id = $2
      `, [session.payment_intent, order.id]);

      // Registrar cambio de estado
      await client.query(`
        INSERT INTO order_status_history (order_id, status, notes, created_by)
        VALUES ($1, $2, $3, $4)
      `, [
        order.id,
        'CONFIRMED',
        'Pago confirmado vía Stripe',
        'system'
      ]);

      // Crear notificación de confirmación
      await client.query(`
        INSERT INTO order_notifications (
          order_id, type, channel, recipient, subject, message, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        order.id,
        'ORDER_CONFIRMATION',
        'EMAIL',
        order.customer_email,
        `Confirmación de Orden ${order.order_number}`,
        `Tu orden ${order.order_number} ha sido confirmada y se procesará pronto.`,
        'PENDING'
      ]);

      await client.end();

      console.log(`✅ Orden ${order.order_number} confirmada exitosamente`);

    } catch (error) {
      console.error('❌ Error manejando checkout completado:', error);
    }
  }

  async handlePaymentSucceeded(paymentIntent) {
    try {
      console.log('💰 Pago exitoso:', paymentIntent.id);

      const client = await getDbClient();
      await client.connect();

      // Actualizar orden con payment intent
      await client.query(`
        UPDATE orders 
        SET 
          payment_status = 'PAID',
          stripe_payment_id = $1,
          updated_at = NOW()
        WHERE stripe_payment_id = $1 OR stripe_session_id IN (
          SELECT id FROM checkout_sessions WHERE payment_intent = $1
        )
      `, [paymentIntent.id]);

      await client.end();

    } catch (error) {
      console.error('❌ Error manejando pago exitoso:', error);
    }
  }

  async handlePaymentFailed(paymentIntent) {
    try {
      console.log('💸 Pago fallido:', paymentIntent.id);

      const client = await getDbClient();
      await client.connect();

      // Buscar orden y actualizar estado
      const orderResult = await client.query(
        'SELECT * FROM orders WHERE stripe_payment_id = $1',
        [paymentIntent.id]
      );

      if (orderResult.rows.length > 0) {
        const order = orderResult.rows[0];

        await client.query(`
          UPDATE orders 
          SET 
            payment_status = 'FAILED',
            status = 'CANCELLED',
            updated_at = NOW()
          WHERE id = $1
        `, [order.id]);

        // Crear notificación de fallo
        await client.query(`
          INSERT INTO order_notifications (
            order_id, type, channel, recipient, subject, message, status
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          order.id,
          'PAYMENT_FAILED',
          'EMAIL',
          order.customer_email,
          `Problema con el pago - Orden ${order.order_number}`,
          `Hubo un problema con el pago de tu orden ${order.order_number}. Por favor contacta soporte.`,
          'PENDING'
        ]);
      }

      await client.end();

    } catch (error) {
      console.error('❌ Error manejando pago fallido:', error);
    }
  }

  async handleInvoicePaymentSucceeded(invoice) {
    try {
      console.log('📄 Factura pagada:', invoice.id);
      // Implementar lógica para suscripciones si es necesario
    } catch (error) {
      console.error('❌ Error manejando factura pagada:', error);
    }
  }

  async createRefund(paymentIntentId, amount = null) {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined // Si no se especifica, reembolsa todo
      });

      console.log(`💰 Reembolso creado: ${refund.id} por $${refund.amount / 100}`);
      return refund;

    } catch (error) {
      console.error('❌ Error creando reembolso:', error);
      throw error;
    }
  }

  async getPaymentDetails(paymentIntentId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('❌ Error obteniendo detalles de pago:', error);
      throw error;
    }
  }

  async createProduct(productData) {
    try {
      const product = await this.stripe.products.create({
        name: productData.name,
        description: productData.description,
        images: productData.images || [],
        metadata: {
          productId: productData.id
        }
      });

      return product;
    } catch (error) {
      console.error('❌ Error creando producto en Stripe:', error);
      throw error;
    }
  }

  async createPrice(productId, unitAmount, currency = 'usd') {
    try {
      const price = await this.stripe.prices.create({
        unit_amount: Math.round(unitAmount * 100),
        currency: currency,
        product: productId,
      });

      return price;
    } catch (error) {
      console.error('❌ Error creando precio en Stripe:', error);
      throw error;
    }
  }
}

module.exports = new StripeService();