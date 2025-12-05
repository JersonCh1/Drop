// backend/src/services/dsersOrderService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * SISTEMA DE AUTOMATIZACIÓN PARA DSERS + ALIEXPRESS
 *
 * DSers no tiene API pública, pero podemos:
 * 1. Preparar archivos CSV con órdenes para importar en DSers
 * 2. Guardar órdenes en formato que DSers puede leer
 * 3. Generar notificaciones para procesar en DSers
 */

/**
 * Procesar orden del cliente para DSers
 */
async function processDSersOrder(orderId) {
  try {
    console.log(`📦 Procesando orden ${orderId} para DSers...`);

    // 1. Obtener orden completa
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              include: {
                supplier: true
              }
            },
            variant: true
          }
        }
      }
    });

    if (!order) {
      throw new Error(`Orden ${orderId} no encontrada`);
    }

    // 2. Verificar si ya fue procesada
    if (order.dropshippingProcessed) {
      console.log(`⚠️ Orden ${order.orderNumber} ya fue procesada`);
      return { success: false, message: 'Orden ya procesada' };
    }

    // 3. Preparar datos para DSers
    const dsersOrderData = {
      orderNumber: order.orderNumber,
      orderDate: order.createdAt,
      customerInfo: {
        name: `${order.customerFirstName} ${order.customerLastName}`,
        email: order.customerEmail,
        phone: order.customerPhone,
        address: {
          line1: order.shippingAddress,
          line2: order.shippingAddress2 || '',
          city: order.shippingCity,
          state: order.shippingState,
          postalCode: order.shippingPostalCode,
          country: order.shippingCountry
        }
      },
      items: order.items.map(item => ({
        productName: item.productName,
        variantName: item.variantName,
        quantity: item.quantity,
        aliexpressUrl: item.product?.supplierUrl,
        aliexpressProductId: item.product?.supplierProductId,
        sku: item.sku
      })),
      total: parseFloat(order.total),
      notes: order.notes || ''
    };

    // 4. Guardar en tabla de órdenes pendientes de DSers
    const dsersOrder = await prisma.dSersOrder.create({
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: 'PENDING',
        orderData: JSON.stringify(dsersOrderData),
        createdAt: new Date()
      }
    });

    // 5. Marcar orden como procesada
    await prisma.order.update({
      where: { id: order.id },
      data: {
        supplierOrderCreated: true
      }
    });

    console.log(`✅ Orden ${order.orderNumber} preparada para DSers`);

    return {
      success: true,
      orderNumber: order.orderNumber,
      dsersOrderId: dsersOrder.id,
      message: 'Orden lista para procesar en DSers'
    };

  } catch (error) {
    console.error('❌ Error procesando orden DSers:', error);
    throw error;
  }
}

/**
 * Generar archivo CSV para importar en DSers
 */
async function generateDSersCSV() {
  try {
    console.log('📄 Generando CSV para DSers...');

    // Obtener todas las órdenes pendientes
    const pendingOrders = await prisma.order.findMany({
      where: {
        status: {
          in: ['PENDING', 'CONFIRMED', 'PROCESSING']
        },
        supplierOrderCreated: false
      },
      include: {
        items: {
          include: {
            product: true,
            variant: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    if (pendingOrders.length === 0) {
      return { success: false, message: 'No hay órdenes pendientes' };
    }

    // Formato CSV para DSers
    const csvHeaders = [
      'Order Number',
      'Product Name',
      'Product URL',
      'Quantity',
      'Customer Name',
      'Address Line 1',
      'Address Line 2',
      'City',
      'State',
      'Postal Code',
      'Country',
      'Phone',
      'Email',
      'Notes'
    ];

    const csvRows = [];
    csvRows.push(csvHeaders.join(','));

    for (const order of pendingOrders) {
      for (const item of order.items) {
        const row = [
          order.orderNumber,
          `"${item.productName}"`,
          item.product?.supplierUrl || '',
          item.quantity,
          `"${order.customerFirstName} ${order.customerLastName}"`,
          `"${order.shippingAddress}"`,
          `"${order.shippingAddress2 || ''}"`,
          order.shippingCity,
          order.shippingState,
          order.shippingPostalCode,
          order.shippingCountry,
          order.customerPhone,
          order.customerEmail,
          `"${order.notes || ''}"`
        ];
        csvRows.push(row.join(','));
      }
    }

    const csvContent = csvRows.join('\n');

    return {
      success: true,
      csv: csvContent,
      ordersCount: pendingOrders.length,
      message: `${pendingOrders.length} órdenes listas para DSers`
    };

  } catch (error) {
    console.error('❌ Error generando CSV:', error);
    throw error;
  }
}

/**
 * Obtener órdenes pendientes de procesar
 */
async function getPendingDSersOrders() {
  try {
    const pendingOrders = await prisma.order.findMany({
      where: {
        status: {
          in: ['PENDING', 'CONFIRMED', 'PROCESSING']
        },
        supplierOrderCreated: false
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return pendingOrders.map(order => ({
      orderNumber: order.orderNumber,
      orderDate: order.createdAt,
      customer: `${order.customerFirstName} ${order.customerLastName}`,
      email: order.customerEmail,
      phone: order.customerPhone,
      address: `${order.shippingAddress}, ${order.shippingCity}, ${order.shippingState} ${order.shippingPostalCode}, ${order.shippingCountry}`,
      items: order.items.map(item => ({
        product: item.productName,
        variant: item.variantName,
        quantity: item.quantity,
        aliexpressUrl: item.product?.supplierUrl
      })),
      total: parseFloat(order.total)
    }));

  } catch (error) {
    console.error('❌ Error obteniendo órdenes pendientes:', error);
    throw error;
  }
}

/**
 * Marcar orden como procesada en DSers
 */
async function markDSersOrderComplete(orderNumber, trackingNumber, carrier = 'AliExpress Standard Shipping') {
  try {
    console.log(`📦 Marcando orden ${orderNumber} como completada...`);

    const order = await prisma.order.findFirst({
      where: { orderNumber }
    });

    if (!order) {
      throw new Error(`Orden ${orderNumber} no encontrada`);
    }

    // Actualizar orden con tracking
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'SHIPPED',
        trackingNumber: trackingNumber,
        trackingCarrier: carrier,
        shippedAt: new Date()
      }
    });

    // TODO: Enviar email al cliente con tracking

    console.log(`✅ Orden ${orderNumber} marcada como enviada`);

    return {
      success: true,
      orderNumber: orderNumber,
      trackingNumber: trackingNumber,
      message: 'Orden actualizada con tracking'
    };

  } catch (error) {
    console.error('❌ Error actualizando orden:', error);
    throw error;
  }
}

/**
 * Procesar webhooks/notificaciones de órdenes nuevas
 */
async function handleNewOrder(orderId) {
  try {
    console.log(`🔔 Nueva orden recibida: ${orderId}`);

    // 1. Verificar que la orden esté pagada
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              include: {
                supplier: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      throw new Error('Orden no encontrada');
    }

    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING'];
    if (!validStatuses.includes(order.status)) {
      console.log(`⏳ Orden ${order.orderNumber} tiene estado incorrecto (${order.status})`);
      return { success: false, message: `Orden en estado ${order.status}` };
    }

    // 2. Verificar si todos los productos son de AliExpress
    const allFromAliExpress = order.items.every(item =>
      item.product?.supplier?.slug === 'aliexpress' ||
      item.product?.supplier?.slug === 'aliexpress-dsers'
    );

    if (!allFromAliExpress) {
      console.log(`⚠️ Orden ${order.orderNumber} contiene productos de otros proveedores`);
    }

    // 3. Procesar orden para DSers
    const result = await processDSersOrder(orderId);

    // 4. Enviar notificación por email
    try {
      const notificationService = require('./dsersNotificationService');
      await notificationService.sendNewOrderNotification(order, dsersOrderData);
      console.log(`📧 Notificación enviada: Nueva orden ${order.orderNumber} lista para DSers`);
    } catch (emailError) {
      console.error('⚠️  Error enviando notificación (continuando):', emailError.message);
    }

    return result;

  } catch (error) {
    console.error('❌ Error manejando nueva orden:', error);
    throw error;
  }
}

module.exports = {
  processDSersOrder,
  generateDSersCSV,
  getPendingDSersOrders,
  markDSersOrderComplete,
  handleNewOrder
};
