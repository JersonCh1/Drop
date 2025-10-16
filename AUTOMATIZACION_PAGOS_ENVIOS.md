# 🤖 Sistema de Automatización de Pagos y Envíos

## 📋 Índice

1. [Flujo Automatizado Completo](#flujo-automatizado-completo)
2. [Automatización de Pagos](#automatización-de-pagos)
3. [Automatización de Envíos a Proveedores](#automatización-de-envíos-a-proveedores)
4. [Integraciones Disponibles](#integraciones-disponibles)
5. [Implementación Paso a Paso](#implementación-paso-a-paso)

---

## Flujo Automatizado Completo

### 🎯 Objetivo:
**Que cuando un cliente pague, automáticamente se notifique al proveedor y se genere la orden de compra**

### 📊 Diagrama del Flujo:

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE REALIZA ORDEN                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              CLIENTE ELIGE MÉTODO DE PAGO                    │
│                                                               │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │  Yape   │  │  Plin   │  │ Culqi   │  │ Stripe  │       │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   CLIENTE PAGA                               │
│                                                               │
│   Yape/Plin: Envía captura por WhatsApp                     │
│   Culqi/Stripe: Pago automático online                      │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                 WEBHOOK RECIBE PAGO                          │
│                                                               │
│   • Culqi/Stripe envían confirmación automática              │
│   • Yape/Plin: Admin confirma manualmente                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│         SISTEMA ACTUALIZA ORDEN A "PAID"                     │
│                                                               │
│   • paymentStatus = 'PAID'                                   │
│   • status = 'CONFIRMED'                                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│    🚀 AUTOMATIZACIÓN: CREAR ORDEN CON PROVEEDOR              │
│                                                               │
│   1. createSupplierOrderFromCustomerOrder()                  │
│   2. Agrupa productos por proveedor                          │
│   3. Calcula costos (precio + envío)                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ├────────────────┬────────────────┐
                      │                │                │
                      ▼                ▼                ▼
        ┌─────────────────┐  ┌──────────────┐  ┌─────────────┐
        │   AliExpress    │  │ CJ Dropship  │  │   Alibaba   │
        │                 │  │              │  │             │
        │  Orden Auto     │  │  Orden Auto  │  │ Orden Auto  │
        └────────┬────────┘  └──────┬───────┘  └──────┬──────┘
                 │                  │                  │
                 └──────────────────┴──────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────┐
│      🔔 NOTIFICACIONES AUTOMÁTICAS A PROVEEDORES             │
│                                                               │
│   OPCIÓN A: Email al proveedor                               │
│   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                          │
│   Para: aliexpress-vendor@example.com                        │
│   Asunto: Nueva Orden #SO-2025-001                           │
│                                                               │
│   Productos:                                                  │
│   - Carcasa iPhone 15 x1 ($8.99)                            │
│                                                               │
│   Enviar a:                                                   │
│   Juan Pérez                                                  │
│   Av. Principal 123                                           │
│   Lima, 15001, Perú                                           │
│   +51987654321                                                │
│                                                               │
│   PAGAR: $12.49 (producto + envío)                           │
│                                                               │
│   OPCIÓN B: WhatsApp Business API                            │
│   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                          │
│   📱 Mensaje a +86 138 xxxx xxxx (AliExpress)                │
│                                                               │
│   "Nueva orden: Carcasa iPhone 15                            │
│    Enviar a: Lima, Perú                                      │
│    Ver detalles: [link]"                                     │
│                                                               │
│   OPCIÓN C: API del Proveedor                                │
│   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                          │
│   POST https://api.cjdropshipping.com/orders                 │
│   → Orden creada automáticamente                             │
│   → Tracking automático                                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│       OPCIÓN D: PANEL DE ÓRDENES PENDIENTES                  │
│                                                               │
│   Admin Dashboard → "Órdenes Pendientes"                     │
│                                                               │
│   ┌───────────────────────────────────────────────┐         │
│   │ 📦 Orden #SO-001 - AliExpress                 │         │
│   │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │         │
│   │ Producto: Carcasa iPhone 15                   │         │
│   │ Costo: $12.49                                 │         │
│   │                                                │         │
│   │ 📍 Dirección:                                 │         │
│   │ Juan Pérez                                    │         │
│   │ Av. Principal 123, Lima 15001, Perú           │         │
│   │ +51987654321                                  │         │
│   │                                                │         │
│   │ 🔗 Ir a AliExpress                            │         │
│   │ 📋 Copiar info de envío                       │         │
│   │ ✅ Marcar como ordenado                       │         │
│   └───────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

---

## Automatización de Pagos

### Integración con Culqi (Perú)

**Culqi** es la pasarela de pagos más popular en Perú. Acepta:
- 💳 Tarjetas de crédito/débito
- 🏦 Transferencias bancarias
- 📱 Yape/Plin (mediante QR)

#### Instalación:

```bash
cd backend
npm install culqi-node
```

#### Configuración:

**1. Crear archivo `backend/src/services/culqiService.js`:**

```javascript
const Culqi = require('culqi-node');

// Inicializar Culqi
const culqi = new Culqi({
  publicKey: process.env.CULQI_PUBLIC_KEY,
  privateKey: process.env.CULQI_SECRET_KEY
});

/**
 * Crear cargo (pago)
 */
async function createCharge(orderData) {
  try {
    const charge = await culqi.charges.create({
      amount: Math.round(orderData.total * 100), // Convertir a centavos
      currency_code: 'PEN',
      email: orderData.customerEmail,
      source_id: orderData.tokenId, // Token de Culqi desde frontend
      description: `Orden ${orderData.orderNumber}`,
      metadata: {
        order_id: orderData.orderId,
        order_number: orderData.orderNumber
      }
    });

    return {
      success: true,
      chargeId: charge.id,
      charge
    };
  } catch (error) {
    console.error('Error creating Culqi charge:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Verificar estado del pago
 */
async function getCharge(chargeId) {
  try {
    const charge = await culqi.charges.get(chargeId);
    return {
      success: true,
      charge,
      status: charge.outcome.type // 'venta_exitosa', 'rechazada', etc.
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  createCharge,
  getCharge
};
```

**2. Variables de entorno:**

```env
# backend/.env
CULQI_PUBLIC_KEY=pk_test_xxxxxxxxxxxx
CULQI_SECRET_KEY=sk_test_xxxxxxxxxxxx
```

**3. Webhook para confirmación automática:**

Crear `backend/src/routes/webhooks.js`:

```javascript
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { createSupplierOrderFromCustomerOrder } = require('../services/supplierOrderService');
const { sendOrderToSuppliers } = require('../services/supplierNotificationService');

const prisma = new PrismaClient();

// Webhook de Culqi
router.post('/culqi', async (req, res) => {
  try {
    const event = req.body;

    console.log('📥 Webhook Culqi recibido:', event.type);

    // Verificar que sea un evento de pago exitoso
    if (event.type === 'charge.succeeded') {
      const charge = event.data.object;
      const orderNumber = charge.metadata.order_number;

      // Buscar la orden
      const order = await prisma.order.findUnique({
        where: { orderNumber }
      });

      if (!order) {
        return res.status(404).json({ error: 'Orden no encontrada' });
      }

      // ✅ ACTUALIZAR ORDEN A PAGADA
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
          stripePaymentId: charge.id // Guardar ID del pago
        }
      });

      console.log(`✅ Pago confirmado para orden ${orderNumber}`);

      // 🚀 AUTOMATIZACIÓN: CREAR ÓRDENES CON PROVEEDORES
      const supplierResult = await createSupplierOrderFromCustomerOrder(order.id);

      if (supplierResult.success) {
        console.log(`✅ ${supplierResult.supplierOrders.length} órdenes con proveedores creadas`);

        // 📧 ENVIAR NOTIFICACIONES A PROVEEDORES
        await sendOrderToSuppliers(supplierResult.supplierOrders);
      }

      res.json({ received: true });
    } else {
      res.json({ received: true });
    }
  } catch (error) {
    console.error('❌ Error en webhook Culqi:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook de Stripe (ya implementado)
router.post('/stripe', async (req, res) => {
  // Similar al de Culqi
  // ... código existente ...
});

module.exports = router;
```

**4. Registrar webhook en server.js:**

```javascript
// backend/src/server.js
const webhooksRoutes = require('./routes/webhooks');
app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhooksRoutes);
```

---

## Automatización de Envíos a Proveedores

### Servicio de Notificaciones a Proveedores

Crear `backend/src/services/supplierNotificationService.js`:

```javascript
const { PrismaClient } = require('@prisma/client');
const emailService = require('./emailService');
const prisma = new PrismaClient();

/**
 * Enviar información de órdenes a proveedores
 */
async function sendOrderToSuppliers(supplierOrders) {
  const results = [];

  for (const supplierOrder of supplierOrders) {
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

    const supplier = fullOrder.supplier;
    const customerOrder = fullOrder.order;

    // MÉTODO 1: Email al proveedor
    if (supplier.contactEmail) {
      const emailResult = await sendEmailToSupplier(fullOrder);
      results.push({ method: 'email', ...emailResult });
    }

    // MÉTODO 2: WhatsApp Business API
    if (supplier.contactPhone) {
      const whatsappResult = await sendWhatsAppToSupplier(fullOrder);
      results.push({ method: 'whatsapp', ...whatsappResult });
    }

    // MÉTODO 3: API del proveedor (si está habilitado)
    if (supplier.apiEnabled && supplier.apiKey) {
      const apiResult = await createOrderViaAPI(fullOrder);
      results.push({ method: 'api', ...apiResult });
    }

    // MÉTODO 4: Guardar en panel de órdenes pendientes
    await prisma.supplierOrder.update({
      where: { id: supplierOrder.id },
      data: {
        status: 'PENDING', // Marcar como pendiente para acción manual
        notes: 'Orden lista para procesar. Ver panel de admin.'
      }
    });
  }

  return results;
}

/**
 * MÉTODO 1: Enviar email al proveedor
 */
async function sendEmailToSupplier(supplierOrder) {
  try {
    const { supplier, order } = supplierOrder;

    const emailContent = `
      <h2>📦 Nueva Orden de Compra</h2>

      <h3>Información de la Orden</h3>
      <ul>
        <li><strong>Número de Orden:</strong> ${supplierOrder.id}</li>
        <li><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</li>
        <li><strong>Total a Pagar:</strong> $${supplierOrder.total.toFixed(2)}</li>
      </ul>

      <h3>Productos a Enviar</h3>
      ${order.items.map(item => `
        <div style="border: 1px solid #ddd; padding: 10px; margin: 10px 0;">
          <strong>${item.productName}</strong><br>
          Cantidad: ${item.quantity}<br>
          Precio unitario: $${item.product.supplierPrice}<br>
          ${item.product.supplierUrl ? `Link: <a href="${item.product.supplierUrl}">${item.product.supplierUrl}</a>` : ''}
        </div>
      `).join('')}

      <h3>📍 Dirección de Envío</h3>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
        <strong>${order.customerFirstName} ${order.customerLastName}</strong><br>
        ${order.shippingAddress}<br>
        ${order.shippingCity}, ${order.shippingState} ${order.shippingPostalCode}<br>
        ${order.shippingCountry}<br>
        Tel: ${order.customerPhone}<br>
        Email: ${order.customerEmail}
      </div>

      <h3>💰 Pago</h3>
      <p>Total a pagar al proveedor: <strong>$${supplierOrder.total.toFixed(2)}</strong></p>
      <p>Incluye: Producto ($${supplierOrder.subtotal.toFixed(2)}) + Envío ($${supplierOrder.shippingCost.toFixed(2)})</p>

      <h3>📝 Instrucciones</h3>
      <ol>
        <li>Procesar esta orden en tu sistema</li>
        <li>Enviar productos a la dirección indicada</li>
        <li>Proporcionar número de tracking cuando esté disponible</li>
      </ol>

      <p style="color: #666; font-size: 12px;">
        Este email fue generado automáticamente por el sistema de dropshipping.
      </p>
    `;

    await emailService.sendEmail({
      to: supplier.contactEmail,
      subject: `Nueva Orden #${supplierOrder.id} - Acción Requerida`,
      html: emailContent
    });

    console.log(`✅ Email enviado a ${supplier.name}`);

    return { success: true, supplier: supplier.name };
  } catch (error) {
    console.error('❌ Error enviando email a proveedor:', error);
    return { success: false, error: error.message };
  }
}

/**
 * MÉTODO 2: WhatsApp Business API
 */
async function sendWhatsAppToSupplier(supplierOrder) {
  try {
    const { supplier, order } = supplierOrder;

    // Usar API de WhatsApp Business (requiere cuenta verificada)
    // O usar servicio como Twilio, MessageBird, etc.

    const message = `
🔔 *Nueva Orden de Compra*

📦 Orden: ${supplierOrder.id}
💰 Total: $${supplierOrder.total.toFixed(2)}

*Productos:*
${order.items.map(item => `• ${item.productName} x${item.quantity}`).join('\n')}

*Enviar a:*
${order.customerFirstName} ${order.customerLastName}
${order.shippingAddress}
${order.shippingCity}, ${order.shippingCountry}
📞 ${order.customerPhone}

Por favor procesar esta orden y proporcionar tracking.
    `.trim();

    // Implementar según el servicio que uses
    // Ejemplo con Twilio:
    /*
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

    await client.messages.create({
      from: 'whatsapp:+14155238886',
      to: `whatsapp:${supplier.contactPhone}`,
      body: message
    });
    */

    console.log(`✅ WhatsApp enviado a ${supplier.name}`);
    return { success: true, supplier: supplier.name };
  } catch (error) {
    console.error('❌ Error enviando WhatsApp:', error);
    return { success: false, error: error.message };
  }
}

/**
 * MÉTODO 3: API del Proveedor (CJ Dropshipping, etc.)
 */
async function createOrderViaAPI(supplierOrder) {
  try {
    const { supplier, order } = supplierOrder;

    // Ejemplo para CJ Dropshipping
    if (supplier.slug === 'cjdropshipping' && supplier.apiKey) {
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

      // Guardar ID de orden del proveedor
      await prisma.supplierOrder.update({
        where: { id: supplierOrder.id },
        data: {
          supplierOrderId: response.data.orderId,
          supplierOrderNumber: response.data.orderNumber,
          status: 'PLACED',
          orderedAt: new Date()
        }
      });

      console.log(`✅ Orden creada automáticamente en ${supplier.name}`);
      return { success: true, orderId: response.data.orderId };
    }

    return { success: false, message: 'API no configurada para este proveedor' };
  } catch (error) {
    console.error('❌ Error creando orden vía API:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendOrderToSuppliers,
  sendEmailToSupplier,
  sendWhatsAppToSupplier,
  createOrderViaAPI
};
```

---

## Integraciones Disponibles

### 1. **Yape/Plin (Manual con Confirmación)**

**Flujo:**
1. Cliente selecciona Yape/Plin
2. Sistema muestra QR o número
3. Cliente transfiere y envía captura por WhatsApp
4. Admin confirma pago manualmente
5. Sistema automáticamente crea orden con proveedor

**Endpoint de confirmación manual:**

```javascript
// POST /api/orders/:id/confirm-payment
router.post('/:id/confirm-payment', verifyAdminToken, async (req, res) => {
  const { id } = req.params;
  const { paymentProof } = req.body; // URL de captura de pantalla

  // Actualizar orden
  await prisma.order.update({
    where: { id },
    data: {
      paymentStatus: 'PAID',
      status: 'CONFIRMED',
      notes: `Pago confirmado manualmente. Prueba: ${paymentProof}`
    }
  });

  // Crear órdenes con proveedores
  const result = await createSupplierOrderFromCustomerOrder(id);

  // Enviar notificaciones
  await sendOrderToSuppliers(result.supplierOrders);

  res.json({ success: true });
});
```

### 2. **Culqi (Automático)**

- ✅ Webhook automático
- ✅ Confirmación instantánea
- ✅ Acepta tarjetas peruanas
- ✅ Integración con Yape vía QR

### 3. **Stripe (Internacional)**

- ✅ Webhook automático
- ✅ Tarjetas internacionales
- ✅ Ya implementado en tu sistema

### 4. **MercadoPago (Latinoamérica)**

- ✅ Popular en Perú
- ✅ Webhook automático
- ✅ Múltiples métodos de pago

---

## Implementación Paso a Paso

### Paso 1: Instalar Dependencias

```bash
cd backend
npm install culqi-node twilio axios nodemailer
```

### Paso 2: Configurar Variables de Entorno

```env
# Culqi
CULQI_PUBLIC_KEY=pk_test_xxxx
CULQI_SECRET_KEY=sk_test_xxxx

# WhatsApp (Twilio)
TWILIO_SID=ACxxxx
TWILIO_TOKEN=xxxx
TWILIO_WHATSAPP_NUMBER=+14155238886

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-tienda@gmail.com
EMAIL_PASS=xxxx-xxxx-xxxx-xxxx
```

### Paso 3: Crear Archivos de Servicios

Crea los archivos que te mostré:
- ✅ `backend/src/services/culqiService.js`
- ✅ `backend/src/services/supplierNotificationService.js`
- ✅ `backend/src/routes/webhooks.js`

### Paso 4: Registrar Rutas

```javascript
// backend/src/server.js
const webhooksRoutes = require('./routes/webhooks');
app.use('/api/webhooks', webhooksRoutes);
```

### Paso 5: Configurar Webhooks en Culqi

1. Login en Culqi Dashboard
2. Ir a **Configuración → Webhooks**
3. Agregar URL: `https://tu-dominio.com/api/webhooks/culqi`
4. Seleccionar eventos: `charge.succeeded`

### Paso 6: Panel de Órdenes Pendientes

Crear componente React para mostrar órdenes pendientes con proveedores.

---

## Resumen del Flujo Automatizado

```
PAGO CONFIRMADO
    ↓
paymentStatus = 'PAID'
    ↓
createSupplierOrderFromCustomerOrder()
    ↓
┌─────────┬─────────┬─────────┐
│ Email   │WhatsApp │   API   │
│ Vendor  │ Vendor  │ Vendor  │
└─────────┴─────────┴─────────┘
    ↓
PROVEEDOR RECIBE INFO AUTOMÁTICAMENTE
    ↓
PROVEEDOR PROCESA Y ENVÍA
    ↓
CLIENTE RECIBE PRODUCTO
```

¿Quieres que implemente alguna de estas integraciones específicas ahora?
