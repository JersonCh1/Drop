// backend/src/services/supplierOrderService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Servicio de automatización de órdenes con proveedores
 * Gestiona la creación y sincronización de órdenes con proveedores externos
 */

/**
 * Crea una orden con el proveedor cuando el cliente realiza una compra
 * @param {string} orderId - ID de la orden del cliente
 * @returns {Promise<object>} Resultado de la creación de la orden
 */
async function createSupplierOrderFromCustomerOrder(orderId) {
  try {
    console.log(`📦 Procesando orden ${orderId} para crear órdenes con proveedores...`);

    // Obtener la orden del cliente con todos sus items y productos
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

    // Agrupar items por proveedor
    const itemsBySupplier = {};

    for (const item of order.items) {
      if (item.product && item.product.supplierId) {
        const supplierId = item.product.supplierId;

        if (!itemsBySupplier[supplierId]) {
          itemsBySupplier[supplierId] = {
            supplier: item.product.supplier,
            items: []
          };
        }

        itemsBySupplier[supplierId].items.push(item);
      }
    }

    // Crear una orden con cada proveedor
    const supplierOrders = [];

    for (const [supplierId, data] of Object.entries(itemsBySupplier)) {
      const supplier = data.supplier;
      const items = data.items;

      // Calcular totales
      const subtotal = items.reduce((sum, item) => {
        const supplierPrice = parseFloat(item.product.supplierPrice) || 0;
        return sum + (supplierPrice * item.quantity);
      }, 0);

      const shippingCost = parseFloat(supplier.defaultShippingCost) || 0;
      const total = subtotal + shippingCost;

      // Crear la orden con el proveedor
      const supplierOrder = await prisma.supplierOrder.create({
        data: {
          orderId: order.id,
          supplierId: supplierId,
          status: 'PENDING', // Estado inicial: pendiente
          subtotal: subtotal,
          shippingCost: shippingCost,
          total: total,
          notes: `Orden automática desde ${order.orderNumber}. Items: ${items.length}`
        }
      });

      console.log(`✅ Orden con proveedor ${supplier.name} creada: ${supplierOrder.id}`);

      // Si el proveedor tiene API habilitada, intentar enviar automáticamente
      if (supplier.apiEnabled && supplier.apiKey) {
        await placeOrderWithSupplierAPI(supplierOrder.id, supplier, items, order);
      }

      supplierOrders.push(supplierOrder);
    }

    // Marcar la orden como procesada para dropshipping
    await prisma.order.update({
      where: { id: orderId },
      data: {
        isDropshipping: true,
        supplierOrderCreated: true
      }
    });

    return {
      success: true,
      message: `${supplierOrders.length} orden(es) con proveedores creadas`,
      supplierOrders
    };

  } catch (error) {
    console.error('❌ Error creando órdenes con proveedores:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Realiza la orden automáticamente con el API del proveedor
 * @param {string} supplierOrderId - ID de la orden del proveedor
 * @param {object} supplier - Información del proveedor
 * @param {array} items - Items de la orden
 * @param {object} customerOrder - Orden del cliente
 */
async function placeOrderWithSupplierAPI(supplierOrderId, supplier, items, customerOrder) {
  try {
    console.log(`🔄 Intentando crear orden automática con ${supplier.name}...`);

    // TODO: Implementar integraciones con APIs específicas
    // Ejemplo: AliExpress API, CJ Dropshipping API, etc.

    // Por ahora, simulamos una llamada exitosa
    const mockApiResponse = {
      success: true,
      supplierOrderId: `${supplier.slug.toUpperCase()}-${Date.now()}`,
      supplierOrderNumber: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      estimatedDelivery: calculateEstimatedDelivery(supplier.averageShippingDays)
    };

    // Actualizar la orden del proveedor con la información de la API
    await prisma.supplierOrder.update({
      where: { id: supplierOrderId },
      data: {
        status: 'PLACED',
        supplierOrderId: mockApiResponse.supplierOrderId,
        supplierOrderNumber: mockApiResponse.supplierOrderNumber,
        orderedAt: new Date(),
        notes: `Orden realizada automáticamente vía API`
      }
    });

    // Actualizar la orden del cliente con fecha estimada de entrega
    await prisma.order.update({
      where: { id: customerOrder.id },
      data: {
        estimatedDelivery: mockApiResponse.estimatedDelivery
      }
    });

    console.log(`✅ Orden automática creada: ${mockApiResponse.supplierOrderNumber}`);

    return mockApiResponse;

  } catch (error) {
    console.error(`❌ Error al crear orden con API de ${supplier.name}:`, error);

    // Registrar el error en la orden del proveedor
    await prisma.supplierOrder.update({
      where: { id: supplierOrderId },
      data: {
        status: 'FAILED',
        errorMessage: error.message
      }
    });

    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Calcula fecha estimada de entrega basándose en tiempos de envío
 * @param {string} shippingDays - Rango de días de envío (ej: "15-30")
 * @returns {Date} Fecha estimada de entrega
 */
function calculateEstimatedDelivery(shippingDays = '15-30') {
  // Extraer el número máximo de días
  const match = shippingDays.match(/(\d+)-(\d+)/);
  const maxDays = match ? parseInt(match[2]) : 30;

  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + maxDays);

  return estimatedDate;
}

/**
 * Actualiza el tracking de una orden del proveedor
 * @param {string} supplierOrderId - ID de la orden del proveedor
 * @param {object} trackingInfo - Información de tracking
 */
async function updateSupplierOrderTracking(supplierOrderId, trackingInfo) {
  try {
    const { trackingNumber, carrier, trackingUrl } = trackingInfo;

    const supplierOrder = await prisma.supplierOrder.update({
      where: { id: supplierOrderId },
      data: {
        trackingNumber,
        carrier: carrier || null,
        trackingUrl: trackingUrl || null,
        status: 'SHIPPED',
        shippedAt: new Date()
      },
      include: {
        order: true
      }
    });

    // Actualizar también la orden del cliente
    await prisma.order.update({
      where: { id: supplierOrder.orderId },
      data: {
        trackingNumber,
        trackingUrl: trackingUrl || null,
        status: 'SHIPPED'
      }
    });

    console.log(`✅ Tracking actualizado: ${trackingNumber}`);

    return {
      success: true,
      supplierOrder
    };

  } catch (error) {
    console.error('❌ Error actualizando tracking:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Sincroniza el estado de una orden del proveedor con su API
 * @param {string} supplierOrderId - ID de la orden del proveedor
 */
async function syncSupplierOrderStatus(supplierOrderId) {
  try {
    const supplierOrder = await prisma.supplierOrder.findUnique({
      where: { id: supplierOrderId },
      include: {
        supplier: true,
        order: true
      }
    });

    if (!supplierOrder) {
      throw new Error('Orden de proveedor no encontrada');
    }

    const supplier = supplierOrder.supplier;

    // Si no tiene API habilitada, no hacer nada
    if (!supplier.apiEnabled || !supplier.apiKey) {
      return {
        success: false,
        message: 'Proveedor no tiene API habilitada'
      };
    }

    // TODO: Implementar llamada a API del proveedor para obtener estado actual
    // Por ahora, simulamos una respuesta
    const mockStatus = {
      status: 'PROCESSING',
      trackingNumber: supplierOrder.trackingNumber || null,
      lastUpdate: new Date()
    };

    // Actualizar estado si cambió
    if (mockStatus.status !== supplierOrder.status) {
      await prisma.supplierOrder.update({
        where: { id: supplierOrderId },
        data: {
          status: mockStatus.status,
          trackingNumber: mockStatus.trackingNumber
        }
      });

      console.log(`✅ Estado sincronizado: ${mockStatus.status}`);
    }

    return {
      success: true,
      status: mockStatus.status
    };

  } catch (error) {
    console.error('❌ Error sincronizando estado:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Obtiene todas las órdenes de proveedores pendientes de acción
 * @returns {Promise<array>} Lista de órdenes pendientes
 */
async function getPendingSupplierOrders() {
  try {
    const orders = await prisma.supplierOrder.findMany({
      where: {
        status: {
          in: ['PENDING', 'FAILED']
        }
      },
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return orders;

  } catch (error) {
    console.error('❌ Error obteniendo órdenes pendientes:', error);
    return [];
  }
}

/**
 * Marca una orden del proveedor como entregada
 * @param {string} supplierOrderId - ID de la orden del proveedor
 */
async function markSupplierOrderAsDelivered(supplierOrderId) {
  try {
    const supplierOrder = await prisma.supplierOrder.update({
      where: { id: supplierOrderId },
      data: {
        status: 'DELIVERED',
        deliveredAt: new Date()
      },
      include: {
        order: true
      }
    });

    // Actualizar también la orden del cliente
    await prisma.order.update({
      where: { id: supplierOrder.orderId },
      data: {
        status: 'DELIVERED'
      }
    });

    console.log(`✅ Orden marcada como entregada: ${supplierOrderId}`);

    return {
      success: true,
      supplierOrder
    };

  } catch (error) {
    console.error('❌ Error marcando orden como entregada:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Cancela una orden con el proveedor
 * @param {string} supplierOrderId - ID de la orden del proveedor
 * @param {string} reason - Razón de la cancelación
 */
async function cancelSupplierOrder(supplierOrderId, reason) {
  try {
    const supplierOrder = await prisma.supplierOrder.update({
      where: { id: supplierOrderId },
      data: {
        status: 'CANCELLED',
        notes: `Cancelada: ${reason}`
      }
    });

    console.log(`🚫 Orden cancelada: ${supplierOrderId}`);

    return {
      success: true,
      supplierOrder
    };

  } catch (error) {
    console.error('❌ Error cancelando orden:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  createSupplierOrderFromCustomerOrder,
  placeOrderWithSupplierAPI,
  updateSupplierOrderTracking,
  syncSupplierOrderStatus,
  getPendingSupplierOrders,
  markSupplierOrderAsDelivered,
  cancelSupplierOrder,
  calculateEstimatedDelivery
};
