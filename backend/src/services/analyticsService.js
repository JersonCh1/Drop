// backend/src/services/analyticsService.js
const { getDbClient } = require('../utils/database');

class AnalyticsService {
  constructor() {
    this.events = [];
  }

  async trackEvent(eventData) {
    try {
      const { type, event, data, sessionId, userId, ip, userAgent } = eventData;

      const client = await getDbClient();
      await client.connect();

      await client.query(`
        INSERT INTO analytics (type, event, data, session_id, user_id, ip, user_agent)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        type,
        event,
        JSON.stringify(data || {}),
        sessionId,
        userId,
        ip,
        userAgent
      ]);

      await client.end();

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
      const client = await getDbClient();
      await client.connect();

      let dateFilter = '';
      switch (dateRange) {
        case '7d':
          dateFilter = "AND created_at >= NOW() - INTERVAL '7 days'";
          break;
        case '30d':
          dateFilter = "AND created_at >= NOW() - INTERVAL '30 days'";
          break;
        case '90d':
          dateFilter = "AND created_at >= NOW() - INTERVAL '90 days'";
          break;
        default:
          dateFilter = "AND created_at >= NOW() - INTERVAL '30 days'";
      }

      // Métricas de ventas
      const salesStats = await client.query(`
        SELECT 
          COUNT(*) as total_orders,
          COALESCE(SUM(total), 0) as total_revenue,
          COALESCE(AVG(total), 0) as avg_order_value,
          COUNT(CASE WHEN status = 'DELIVERED' THEN 1 END) as delivered_orders
        FROM orders 
        WHERE created_at >= NOW() - INTERVAL '${dateRange === '7d' ? '7' : dateRange === '90d' ? '90' : '30'} days'
      `);

      // Productos más vendidos
      const topProducts = await client.query(`
        SELECT 
          oi.product_name,
          oi.product_model,
          SUM(oi.quantity) as total_sold,
          SUM(oi.total) as total_revenue
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.created_at >= NOW() - INTERVAL '${dateRange === '7d' ? '7' : dateRange === '90d' ? '90' : '30'} days'
          AND o.status NOT IN ('CANCELLED', 'REFUNDED')
        GROUP BY oi.product_name, oi.product_model
        ORDER BY total_sold DESC
        LIMIT 10
      `);

      // Eventos de analytics
      const pageViews = await client.query(`
        SELECT COUNT(*) as count
        FROM analytics 
        WHERE type = 'PAGE_VIEW' ${dateFilter}
      `);

      const productViews = await client.query(`
        SELECT COUNT(*) as count
        FROM analytics 
        WHERE type = 'PRODUCT_VIEW' ${dateFilter}
      `);

      const cartActions = await client.query(`
        SELECT 
          event,
          COUNT(*) as count
        FROM analytics 
        WHERE type = 'CART_ACTION' ${dateFilter}
        GROUP BY event
      `);

      // Conversión
      const conversionData = await client.query(`
        SELECT 
          (SELECT COUNT(*) FROM analytics WHERE type = 'CART_ACTION' AND event = 'checkout_started' ${dateFilter}) as checkouts_started,
          (SELECT COUNT(*) FROM analytics WHERE type = 'PURCHASE' ${dateFilter}) as purchases_completed
      `);

      // Ventas por día
      const dailySales = await client.query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as orders,
          COALESCE(SUM(total), 0) as revenue
        FROM orders
        WHERE created_at >= NOW() - INTERVAL '${dateRange === '7d' ? '7' : dateRange === '90d' ? '90' : '30'} days'
          AND status NOT IN ('CANCELLED', 'REFUNDED')
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 30
      `);

      // Países principales
      const topCountries = await client.query(`
        SELECT 
          shipping_country,
          COUNT(*) as orders,
          SUM(total) as revenue
        FROM orders
        WHERE created_at >= NOW() - INTERVAL '${dateRange === '7d' ? '7' : dateRange === '90d' ? '90' : '30'} days'
          AND status NOT IN ('CANCELLED', 'REFUNDED')
        GROUP BY shipping_country
        ORDER BY orders DESC
        LIMIT 10
      `);

      await client.end();

      const sales = salesStats.rows[0];
      const conversion = conversionData.rows[0];
      const conversionRate = conversion.checkouts_started > 0 
        ? (conversion.purchases_completed / conversion.checkouts_started * 100).toFixed(2)
        : 0;

      return {
        sales: {
          totalOrders: parseInt(sales.total_orders),
          totalRevenue: parseFloat(sales.total_revenue),
          avgOrderValue: parseFloat(sales.avg_order_value),
          deliveredOrders: parseInt(sales.delivered_orders)
        },
        traffic: {
          pageViews: parseInt(pageViews.rows[0].count),
          productViews: parseInt(productViews.rows[0].count),
          conversionRate: parseFloat(conversionRate)
        },
        topProducts: topProducts.rows.map(row => ({
          name: row.product_name,
          model: row.product_model,
          sold: parseInt(row.total_sold),
          revenue: parseFloat(row.total_revenue)
        })),
        dailySales: dailySales.rows.map(row => ({
          date: row.date,
          orders: parseInt(row.orders),
          revenue: parseFloat(row.revenue)
        })),
        topCountries: topCountries.rows.map(row => ({
          country: row.shipping_country,
          orders: parseInt(row.orders),
          revenue: parseFloat(row.revenue)
        })),
        cartActions: cartActions.rows.reduce((acc, row) => {
          acc[row.event] = parseInt(row.count);
          return acc;
        }, {})
      };

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  async getRealtimeStats() {
    try {
      const client = await getDbClient();
      await client.connect();

      // Actividad de las últimas 24 horas
      const realtimeData = await client.query(`
        SELECT 
          (SELECT COUNT(*) FROM analytics WHERE created_at >= NOW() - INTERVAL '24 hours') as events_24h,
          (SELECT COUNT(DISTINCT session_id) FROM analytics WHERE created_at >= NOW() - INTERVAL '1 hour' AND session_id IS NOT NULL) as active_sessions,
          (SELECT COUNT(*) FROM orders WHERE created_at >= NOW() - INTERVAL '24 hours') as orders_24h,
          (SELECT COUNT(*) FROM analytics WHERE type = 'PAGE_VIEW' AND created_at >= NOW() - INTERVAL '1 hour') as page_views_1h
      `);

      // Eventos recientes
      const recentEvents = await client.query(`
        SELECT type, event, data, created_at
        FROM analytics
        WHERE created_at >= NOW() - INTERVAL '1 hour'
        ORDER BY created_at DESC
        LIMIT 20
      `);

      await client.end();

      const stats = realtimeData.rows[0];

      return {
        activeSessions: parseInt(stats.active_sessions),
        events24h: parseInt(stats.events_24h),
        orders24h: parseInt(stats.orders_24h),
        pageViews1h: parseInt(stats.page_views_1h),
        recentEvents: recentEvents.rows.map(row => ({
          type: row.type,
          event: row.event,
          data: row.data,
          timestamp: row.created_at
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
      const dateStr = yesterday.toISOString().split('T')[0];

      const client = await getDbClient();
      await client.connect();

      // Estadísticas del día anterior
      const dailyStats = await client.query(`
        SELECT 
          (SELECT COUNT(*) FROM orders WHERE DATE(created_at) = $1) as orders,
          (SELECT COALESCE(SUM(total), 0) FROM orders WHERE DATE(created_at) = $1 AND status NOT IN ('CANCELLED', 'REFUNDED')) as revenue,
          (SELECT COUNT(*) FROM analytics WHERE type = 'PAGE_VIEW' AND DATE(created_at) = $1) as page_views,
          (SELECT COUNT(DISTINCT session_id) FROM analytics WHERE DATE(created_at) = $1 AND session_id IS NOT NULL) as unique_visitors
      `, [dateStr]);

      await client.end();

      const stats = dailyStats.rows[0];

      console.log(`📊 Reporte diario ${dateStr}:`, {
        orders: stats.orders,
        revenue: `$${stats.revenue}`,
        pageViews: stats.page_views,
        uniqueVisitors: stats.unique_visitors
      });

      return stats;

    } catch (error) {
      console.error('❌ Error generando reporte diario:', error);
    }
  }

  async getProductAnalytics(productId) {
    try {
      const client = await getDbClient();
      await client.connect();

      // Métricas del producto específico
      const productStats = await client.query(`
        SELECT 
          (SELECT COUNT(*) FROM analytics WHERE type = 'PRODUCT_VIEW' AND data->>'productId' = $1 AND created_at >= NOW() - INTERVAL '30 days') as views_30d,
          (SELECT COUNT(*) FROM analytics WHERE type = 'CART_ACTION' AND event = 'add_to_cart' AND data->>'productId' = $1 AND created_at >= NOW() - INTERVAL '30 days') as adds_to_cart_30d,
          (SELECT COALESCE(SUM((data->>'quantity')::int), 0) FROM analytics WHERE type = 'CART_ACTION' AND event = 'add_to_cart' AND data->>'productId' = $1 AND created_at >= NOW() - INTERVAL '30 days') as units_added_30d
      `, [productId.toString()]);

      // Ventas del producto
      const salesStats = await client.query(`
        SELECT 
          COALESCE(SUM(oi.quantity), 0) as total_sold,
          COALESCE(SUM(oi.total), 0) as total_revenue,
          COUNT(DISTINCT o.id) as orders_count
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE oi.product_id = $1 
          AND o.created_at >= NOW() - INTERVAL '30 days'
          AND o.status NOT IN ('CANCELLED', 'REFUNDED')
      `, [productId]);

      await client.end();

      const views = productStats.rows[0];
      const sales = salesStats.rows[0];

      const addToCartRate = views.views_30d > 0 
        ? (views.adds_to_cart_30d / views.views_30d * 100).toFixed(2)
        : 0;

      return {
        views30d: parseInt(views.views_30d),
        addsToCart30d: parseInt(views.adds_to_cart_30d),
        unitsAdded30d: parseInt(views.units_added_30d),
        totalSold: parseInt(sales.total_sold),
        totalRevenue: parseFloat(sales.total_revenue),
        ordersCount: parseInt(sales.orders_count),
        conversionRate: parseFloat(conversionRate),
        addToCartRate: parseFloat(addToCartRate)
      };

    } catch (error) {
      console.error('❌ Error obteniendo analytics del producto:', error);
      throw error;
    }
  }

  async getTrafficSources(dateRange = '30d') {
    try {
      const client = await getDbClient();
      await client.connect();

      // Esta es una implementación básica - en producción integrarías con Google Analytics
      const sourceData = await client.query(`
        SELECT 
          CASE 
            WHEN user_agent LIKE '%Mobile%' THEN 'Mobile'
            WHEN user_agent LIKE '%Tablet%' THEN 'Tablet'
            ELSE 'Desktop'
          END as device_type,
          COUNT(*) as sessions
        FROM analytics
        WHERE type = 'PAGE_VIEW' 
          AND created_at >= NOW() - INTERVAL '${dateRange === '7d' ? '7' : dateRange === '90d' ? '90' : '30'} days'
          AND user_agent IS NOT NULL
        GROUP BY device_type
        ORDER BY sessions DESC
      `);

      await client.end();

      return {
        deviceTypes: sourceData.rows.map(row => ({
          device: row.device_type,
          sessions: parseInt(row.sessions)
        }))
      };

    } catch (error) {
      console.error('❌ Error obteniendo fuentes de tráfico:', error);
      throw error;
    }
  }
}

module.exports = new AnalyticsService();