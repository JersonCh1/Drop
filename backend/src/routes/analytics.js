// backend/src/routes/analytics.js
const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analyticsService');

// Middleware para verificar admin
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dropshipping-super-secret-key-2024';

function verifyAdminToken(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token requerido'
    });
  }

  try {
    // Verificar JWT
    const decoded = jwt.verify(token, JWT_SECRET);

    // Verificar que el usuario sea ADMIN
    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requieren permisos de administrador.'
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
}

// POST /api/analytics/track - Rastrear evento
router.post('/track', async (req, res) => {
  try {
    const {
      type,
      event,
      data,
      sessionId,
      userId,
      timestamp,
      url,
      userAgent
    } = req.body;

    // Validar datos básicos
    if (!type || !event) {
      return res.status(400).json({
        success: false,
        message: 'Tipo y evento son requeridos'
      });
    }

    // Obtener información adicional de headers
    const trackingData = {
      type,
      event,
      data: data || {},
      sessionId: sessionId || req.headers['x-session-id'],
      userId: userId || null,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: userAgent || req.get('User-Agent')
    };

    // Registrar evento
    await analyticsService.trackEvent(trackingData);

    res.json({
      success: true,
      message: 'Evento registrado correctamente'
    });

  } catch (error) {
    console.error('❌ Error registrando evento de analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// POST /api/analytics/batch - Rastrear múltiples eventos
router.post('/batch', async (req, res) => {
  try {
    const { events } = req.body;

    if (!events || !Array.isArray(events)) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un array de eventos'
      });
    }

    // Procesar cada evento
    for (const eventData of events) {
      const trackingData = {
        ...eventData,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      };

      await analyticsService.trackEvent(trackingData);
    }

    res.json({
      success: true,
      message: `${events.length} eventos registrados correctamente`
    });

  } catch (error) {
    console.error('❌ Error registrando eventos batch:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// GET /api/analytics/dashboard - Estadísticas del dashboard (admin)
router.get('/dashboard', verifyAdminToken, async (req, res) => {
  try {
    const { dateRange = '30d' } = req.query;
    const stats = await analyticsService.getDashboardStats(dateRange);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas del dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// GET /api/analytics/realtime - Estadísticas en tiempo real (admin)
router.get('/realtime', verifyAdminToken, async (req, res) => {
  try {
    const stats = await analyticsService.getRealtimeStats();

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas en tiempo real:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// GET /api/analytics/traffic-sources - Fuentes de tráfico (admin)
router.get('/traffic-sources', verifyAdminToken, async (req, res) => {
  try {
    const { dateRange = '30d' } = req.query;
    const sources = await analyticsService.getTrafficSources(dateRange);

    res.json({
      success: true,
      data: sources
    });

  } catch (error) {
    console.error('❌ Error obteniendo fuentes de tráfico:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// GET /api/analytics/products/:id - Analytics de producto específico (admin)
router.get('/products/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const analytics = await analyticsService.getProductAnalytics(id);

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('❌ Error obteniendo analytics del producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

module.exports = router;