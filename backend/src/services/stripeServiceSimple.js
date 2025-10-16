// backend/src/services/stripeServiceSimple.js
// Servicio simplificado de Stripe usando Prisma
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class StripeService {
  constructor() {
    this.stripe = null;
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    // Inicializar Stripe solo si está configurado
    if (process.env.STRIPE_SECRET_KEY) {
      this.stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    }
  }

  isConfigured() {
    return this.stripe !== null && process.env.STRIPE_SECRET_KEY;
  }

  async createCheckoutSession({ items, customerInfo, orderId, orderNumber, shippingCost = 0, total }) {
    if (!this.isConfigured()) {
      throw new Error('Stripe no está configurado. Agrega STRIPE_SECRET_KEY a las variables de entorno.');
    }

    try {
      // Crear line items para Stripe
      const lineItems = items.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name || `${item.name}`,
            description: item.model ? `${item.model}${item.color ? ' - ' + item.color : ''}` : undefined,
            images: item.image ? [item.image] : []
          },
          unit_amount: Math.round(item.price * 100) // Convertir a centavos
        },
        quantity: item.quantity
      }));

      // Agregar envío si existe
      if (shippingCost > 0) {
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Envío',
              description: `Envío a ${customerInfo.country || 'Perú'}`
            },
            unit_amount: Math.round(shippingCost * 100)
          },
          quantity: 1
        });
      }

      // Crear sesión de checkout
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/order-success?session_id={CHECKOUT_SESSION_ID}&order=${orderNumber}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout?cancelled=true`,
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
      await prisma.order.update({
        where: { id: orderId },
        data: {
          stripeSessionId: session.id,
          paymentStatus: 'PENDING'
        }
      });

      return {
        id: session.id,
        url: session.url
      };

    } catch (error) {
      console.error('❌ Error creando sesión de Stripe:', error);
      throw new Error('Error al crear sesión de pago: ' + error.message);
    }
  }

  constructWebhookEvent(body, signature) {
    if (!this.isConfigured() || !this.webhookSecret) {
      throw new Error('Stripe webhook secret no configurado');
    }

    try {
      return this.stripe.webhooks.constructEvent(
        body,
        signature,
        this.webhookSecret
      );
    } catch (error) {
      console.error('❌ Error verificando webhook:', error);
      throw error;
    }
  }

  async createPaymentIntent({ amount, currency, orderId, customerInfo }) {
    if (!this.isConfigured()) {
      throw new Error('Stripe no está configurado');
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount, // Amount in cents
        currency: currency,
        metadata: {
          orderId: orderId?.toString() || '',
          customerEmail: customerInfo?.email || '',
          customerName: `${customerInfo?.firstName} ${customerInfo?.lastName}` || ''
        },
        description: `Order payment for order ${orderId}`,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return paymentIntent;
    } catch (error) {
      console.error('❌ Error creando payment intent:', error);
      throw error;
    }
  }

  async getSession(sessionId) {
    if (!this.isConfigured()) {
      throw new Error('Stripe no está configurado');
    }

    try {
      return await this.stripe.checkout.sessions.retrieve(sessionId);
    } catch (error) {
      console.error('❌ Error obteniendo sesión:', error);
      throw error;
    }
  }
}

module.exports = new StripeService();
