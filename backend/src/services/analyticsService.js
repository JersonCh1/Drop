// backend/src/services/analyticsService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class AnalyticsService {
  constructor() {
    this.events = [];
  }

  async trackEvent(eventData) {
    try {
      const { type, event, data, sessionId, userId, ip, userAgent } = eventData;

      // Use Prisma for SQLite
      await prisma.analytics.create({
        data: {
          type: type,
          event: event,
          data: data || {},
          sessionId: sessionId || null,
          userId: userId ? parseInt(userId) : null,
          ip: ip || null,
          userAgent: userAgent || null
        }
      });

      console.log(`📊 Evento registrado: ${type}.${event}`);

    } catch (error) {
      console.error('❌ Error registrando evento:', error);
    }
  }

  async trackPageView(sessionId, page, userId = null, ip = null, userAgent = null) {
    await this.trackEvent({
      type: 'PAGE_VIEW',
      event: 'page_visited',
      data: { page },
      sessionId,
      userId,
      ip,
      userAgent
    });
  }

  async trackProductView(sessionId, productId, productName, userId = null) {
    await this.trackEvent({
      type: 'PRODUCT_VIEW',
      event: 'product_viewed',
      data: { productId, productName },
      sessionId,
      userId
    });
  }

  async trackAddToCart(sessionId, productId, quantity, price, userId = null) {
    await this.trackEvent({
      type: 'CART_ACTION',
      event: 'add_to_cart',
      data: { productId, quantity, price, value: quantity * price },
      sessionId,
      userId
    });
  }

  async trackRemoveFromCart(sessionId, productId, quantity, price, userId = null) {
    await this.trackEvent({
      type: 'CART_ACTION',
      event: 'remove_from_cart',
      data: { productId, quantity, price, value: quantity * price },
      sessionId,
      userId
    });
  }

  async trackPurchase(sessionId, orderId, orderNumber, total, items, userId = null) {
    await this.trackEvent({
      type: 'PURCHASE',
      event: 'purchase_completed',
      data: { 
        orderId, 
        orderNumber, 
        total, 
        items: items.length,
        products: items.map(item => ({
          productId: item.product_id,
          quantity: item.quantity,
          price: item.price
        }))
      },
      sessionId,
      userId
    });
  }

  async trackCheckoutStarted(sessionId, cartValue, itemCount, userId = null) {
    await this.trackEvent({
      type: 'CART_ACTION',
      event: 'checkout_started',
      data: { cartValue, itemCount },
      sessionId,
      userId
    });
  }

  async getDashboardStats(dateRange = '30d') {
    try {
      // Calculate date threshold
      const daysAgo = dateRange === '7d' ? 7 : dateRange === '90d' ? 90 : 30;
      const dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - daysAgo);

      // Métricas de ventas con Prisma
      const totalOrders = await prisma.order.count({
        where: { createdAt: { gte: dateThreshold } }
      });

      const orders = await prisma.order.findMany({
        where: { createdAt: { gte: dateThreshold } },
        select: { total: true, status: true }
      });

      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const deliveredOrders = orders.filter(o => o.status === 'DELIVERED').length;

      // Eventos de analytics
      const pageViews = await prisma.analytics.count({
        where: {
          type: 'PAGE_VIEW',
          createdAt: { gte: dateThreshold }
        }
      });

      const productViews = await prisma.analytics.count({
        where: {
          type: 'PRODUCT_VIEW',
          createdAt: { gte: dateThreshold }
        }
      });

      // Conversión
      const checkoutsStarted = await prisma.analytics.count({
        where: {
          type: 'CART_ACTION',
          event: 'checkout_started',
          createdAt: { gte: dateThreshold }
        }
      });

      const purchasesCompleted = await prisma.analytics.count({
        where: {
          type: 'PURCHASE',
          createdAt: { gte: dateThreshold }
        }
      });

      const conversionRate = checkoutsStarted > 0
        ? (purchasesCompleted / checkoutsStarted * 100).toFixed(2)
        : 0;

      return {
        sales: {
          totalOrders,
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
          deliveredOrders
        },
        traffic: {
          pageViews,
          productViews,
          conversionRate: parseFloat(conversionRate)
        },
        topProducts: [],
        dailySales: [],
        topCountries: [],
        cartActions: {}
      };

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  async getRealtimeStats() {
    try {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      // Actividad de las últimas 24 horas con Prisma
      const events24h = await prisma.analytics.count({
        where: { createdAt: { gte: oneDayAgo } }
      });

      const activeSessionsData = await prisma.analytics.findMany({
        where: {
          createdAt: { gte: oneHourAgo },
          sessionId: { not: null }
        },
        select: { sessionId: true },
        distinct: ['sessionId']
      });

      const orders24h = await prisma.order.count({
        where: { createdAt: { gte: oneDayAgo } }
      });

      const pageViews1h = await prisma.analytics.count({
        where: {
          type: 'PAGE_VIEW',
          createdAt: { gte: oneHourAgo }
        }
      });

      // Eventos recientes
      const recentEvents = await prisma.analytics.findMany({
        where: { createdAt: { gte: oneHourAgo } },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          type: true,
          event: true,
          data: true,
          createdAt: true
        }
      });

      return {
        activeSessions: activeSessionsData.length,
        events24h,
        orders24h,
        pageViews1h,
        recentEvents: recentEvents.map(row => ({
          type: row.type,
          event: row.event,
          data: row.data,
          timestamp: row.createdAt
        }))
      };

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas en tiempo real:', error);
      throw error;
    }
  }

  async generateDailyReport() {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const today = new Date(yesterday);
      today.setDate(today.getDate() + 1);

      const dateStr = yesterday.toISOString().split('T')[0];

      // Estadísticas del día anterior con Prisma
      const orders = await prisma.order.count({
        where: {
          createdAt: {
            gte: yesterday,
            lt: today
          }
        }
      });

      const ordersData = await prisma.order.findMany({
        where: {
          createdAt: { gte: yesterday, lt: today },
          status: { notIn: ['CANCELLED', 'REFUNDED'] }
        },
        select: { total: true }
      });

      const revenue = ordersData.reduce((sum, order) => sum + order.total, 0);

      const pageViews = await prisma.analytics.count({
        where: {
          type: 'PAGE_VIEW',
          createdAt: { gte: yesterday, lt: today }
        }
      });

      const uniqueVisitorsData = await prisma.analytics.findMany({
        where: {
          createdAt: { gte: yesterday, lt: today },
          sessionId: { not: null }
        },
        select: { sessionId: true },
        distinct: ['sessionId']
      });

      const stats = {
        orders,
        revenue: revenue.toFixed(2),
        pageViews,
        uniqueVisitors: uniqueVisitorsData.length
      };

      console.log(`📊 Reporte diario ${dateStr}:`, {
        orders: stats.orders,
        revenue: `$${stats.revenue}`,
        pageViews: stats.pageViews,
        uniqueVisitors: stats.uniqueVisitors
      });

      return stats;

    } catch (error) {
      console.error('❌ Error generando reporte diario:', error);
    }
  }

  async getProductAnalytics(productId) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // For Prisma with SQLite, JSON queries are limited
      // Simplified implementation
      const views30d = await prisma.analytics.count({
        where: {
          type: 'PRODUCT_VIEW',
          createdAt: { gte: thirtyDaysAgo }
        }
      });

      const addsToCart30d = await prisma.analytics.count({
        where: {
          type: 'CART_ACTION',
          event: 'add_to_cart',
          createdAt: { gte: thirtyDaysAgo }
        }
      });

      const addToCartRate = views30d > 0
        ? (addsToCart30d / views30d * 100).toFixed(2)
        : 0;

      return {
        views30d,
        addsToCart30d,
        unitsAdded30d: 0,
        totalSold: 0,
        totalRevenue: 0,
        ordersCount: 0,
        conversionRate: 0,
        addToCartRate: parseFloat(addToCartRate)
      };

    } catch (error) {
      console.error('❌ Error obteniendo analytics del producto:', error);
      throw error;
    }
  }

  async getTrafficSources(dateRange = '30d') {
    try {
      const daysAgo = dateRange === '7d' ? 7 : dateRange === '90d' ? 90 : 30;
      const dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - daysAgo);

      // Simplified implementation for SQLite/Prisma
      const analyticsData = await prisma.analytics.findMany({
        where: {
          type: 'PAGE_VIEW',
          createdAt: { gte: dateThreshold },
          userAgent: { not: null }
        },
        select: { userAgent: true }
      });

      const deviceTypes = { Mobile: 0, Tablet: 0, Desktop: 0 };

      analyticsData.forEach(row => {
        const ua = row.userAgent || '';
        if (ua.includes('Mobile')) {
          deviceTypes.Mobile++;
        } else if (ua.includes('Tablet')) {
          deviceTypes.Tablet++;
        } else {
          deviceTypes.Desktop++;
        }
      });

      return {
        deviceTypes: Object.entries(deviceTypes).map(([device, sessions]) => ({
          device,
          sessions
        }))
      };

    } catch (error) {
      console.error('❌ Error obteniendo fuentes de tráfico:', error);
      throw error;
    }
  }
}

module.exports = new AnalyticsService();