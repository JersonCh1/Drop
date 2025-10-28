// backend/src/cron/syncCJTracking.js
const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const cjService = require('../services/cjDropshippingService');

const prisma = new PrismaClient();

/**
 * Cron job para sincronizar tracking de órdenes de CJ Dropshipping automáticamente
 * Se ejecuta cada hora
 */
function startCJTrackingSyncJob() {
  // Ejecutar cada hora
  cron.schedule('0 * * * *', async () => {
    console.log('🔄 [CRON] Sincronizando tracking de CJ Dropshipping...');

    try {
      // Obtener todas las órdenes de CJ que están en proceso o enviadas
      const supplierOrders = await prisma.supplierOrder.findMany({
        where: {
          supplier: {
            slug: 'cj-dropshipping'
          },
          status: {
            in: ['PLACED', 'PROCESSING', 'SHIPPED']
          }
        },
        include: {
          order: true,
          supplier: true
        }
      });

      console.log(`📦 Encontradas ${supplierOrders.length} órdenes para sincronizar`);

      let updated = 0;
      let errors = 0;

      for (const supplierOrder of supplierOrders) {
        try {
          // Solo sincronizar si tiene un ID de CJ
          if (!supplierOrder.supplierOrderId) {
            continue;
          }

          // Obtener tracking actualizado de CJ
          const trackingResult = await cjService.getOrderTracking(supplierOrder.supplierOrderId);

          if (trackingResult.success && trackingResult.trackingNumber) {
            // Actualizar la orden del proveedor
            await prisma.supplierOrder.update({
              where: { id: supplierOrder.id },
              data: {
                trackingNumber: trackingResult.trackingNumber,
                carrier: trackingResult.carrier || supplierOrder.carrier,
                trackingUrl: trackingResult.trackingUrl || supplierOrder.trackingUrl,
                status: trackingResult.status || supplierOrder.status,
                shippedAt: trackingResult.shippedAt || supplierOrder.shippedAt
              }
            });

            // Actualizar la orden del cliente también
            await prisma.order.update({
              where: { id: supplierOrder.orderId },
              data: {
                trackingNumber: trackingResult.trackingNumber,
                trackingUrl: trackingResult.trackingUrl,
                status: trackingResult.status === 'DELIVERED' ? 'DELIVERED' :
                       trackingResult.status === 'SHIPPED' ? 'SHIPPED' :
                       'PROCESSING'
              }
            });

            updated++;
            console.log(`✅ Tracking actualizado: ${supplierOrder.order.orderNumber} → ${trackingResult.trackingNumber}`);
          }

        } catch (orderError) {
          errors++;
          console.error(`❌ Error sincronizando orden ${supplierOrder.id}:`, orderError.message);
        }
      }

      console.log(`✅ [CRON] Sincronización completada: ${updated} actualizadas, ${errors} errores`);

    } catch (error) {
      console.error('❌ [CRON] Error en sincronización de tracking:', error);
    }
  });

  console.log('✅ Cron job de sincronización de CJ Dropshipping iniciado (cada hora)');
}

/**
 * Sincronización manual bajo demanda
 */
async function syncCJTrackingNow() {
  console.log('🔄 Sincronización manual de tracking iniciada...');

  try {
    const supplierOrders = await prisma.supplierOrder.findMany({
      where: {
        supplier: {
          slug: 'cj-dropshipping'
        },
        status: {
          in: ['PLACED', 'PROCESSING', 'SHIPPED']
        }
      },
      include: {
        order: true
      }
    });

    let updated = 0;

    for (const supplierOrder of supplierOrders) {
      try {
        if (!supplierOrder.supplierOrderId) continue;

        const trackingResult = await cjService.getOrderTracking(supplierOrder.supplierOrderId);

        if (trackingResult.success && trackingResult.trackingNumber) {
          await prisma.supplierOrder.update({
            where: { id: supplierOrder.id },
            data: {
              trackingNumber: trackingResult.trackingNumber,
              carrier: trackingResult.carrier,
              trackingUrl: trackingResult.trackingUrl,
              status: trackingResult.status
            }
          });

          await prisma.order.update({
            where: { id: supplierOrder.orderId },
            data: {
              trackingNumber: trackingResult.trackingNumber,
              trackingUrl: trackingResult.trackingUrl
            }
          });

          updated++;
        }
      } catch (error) {
        console.error(`Error sincronizando ${supplierOrder.id}:`, error.message);
      }
    }

    console.log(`✅ Sincronización manual completada: ${updated} actualizadas`);
    return { success: true, updated };

  } catch (error) {
    console.error('❌ Error en sincronización manual:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  startCJTrackingSyncJob,
  syncCJTrackingNow
};
