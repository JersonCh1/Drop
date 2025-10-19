// backend/src/routes/referrals.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * 🎁 SISTEMA DE REFERIDOS
 *
 * - Cada usuario recibe un código único de referido
 * - Comparten el código con amigos
 * - Cuando un amigo hace su primera compra, ambos reciben descuento
 * - El referidor recibe 10% de descuento en su próxima compra
 * - El referido recibe 10% de descuento en su primera compra
 */

/**
 * Generar código de referido único
 */
function generateReferralCode(userId) {
  const base = userId.toString().split('').reverse().join('');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `REF${base}${random}`.substring(0, 12);
}

/**
 * GET /api/referrals/my-code - Obtener código de referido del usuario
 */
router.get('/my-code', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email es requerido'
      });
    }

    // Buscar usuario por email
    let user = await prisma.user.findUnique({
      where: { email }
    });

    // Si el usuario no existe, crearlo
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          firstName: 'Usuario',
          lastName: 'Nuevo',
          role: 'CUSTOMER'
        }
      });
    }

    // Generar código si no tiene
    let referralCode = user.referralCode;
    if (!referralCode) {
      referralCode = generateReferralCode(user.id);
      user = await prisma.user.update({
        where: { id: user.id },
        data: { referralCode }
      });
    }

    // Contar referidos exitosos
    const successfulReferrals = await prisma.order.count({
      where: {
        referredBy: referralCode,
        paymentStatus: 'PAID'
      }
    });

    res.json({
      success: true,
      data: {
        code: referralCode,
        totalReferrals: successfulReferrals,
        shareUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}?ref=${referralCode}`,
        discountEarned: successfulReferrals * 10, // 10% por cada referido
        message: successfulReferrals > 0
          ? `¡Tienes ${successfulReferrals} referidos exitosos!`
          : 'Comparte tu código y gana descuentos'
      }
    });
  } catch (error) {
    console.error('Error obteniendo código de referido:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo código de referido',
      error: error.message
    });
  }
});

/**
 * POST /api/referrals/validate - Validar código de referido
 */
router.post('/validate', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Código de referido es requerido'
      });
    }

    // Buscar usuario con ese código
    const referrer = await prisma.user.findFirst({
      where: { referralCode: code.toUpperCase() }
    });

    if (!referrer) {
      return res.json({
        success: false,
        valid: false,
        message: 'Código de referido inválido'
      });
    }

    res.json({
      success: true,
      valid: true,
      discount: 10, // 10% de descuento
      message: '¡Código válido! Recibes 10% de descuento en tu primera compra'
    });
  } catch (error) {
    console.error('Error validando código:', error);
    res.status(500).json({
      success: false,
      message: 'Error validando código',
      error: error.message
    });
  }
});

/**
 * GET /api/referrals/stats - Estadísticas de referidos (admin)
 */
router.get('/stats', async (req, res) => {
  try {
    // Total de usuarios con código de referido
    const usersWithCode = await prisma.user.count({
      where: {
        referralCode: { not: null }
      }
    });

    // Total de órdenes referidas
    const referredOrders = await prisma.order.count({
      where: {
        referredBy: { not: null },
        paymentStatus: 'PAID'
      }
    });

    // Ingresos por referidos
    const referredOrdersData = await prisma.order.findMany({
      where: {
        referredBy: { not: null },
        paymentStatus: 'PAID'
      },
      select: { total: true }
    });

    const referredRevenue = referredOrdersData.reduce(
      (sum, order) => sum + parseFloat(order.total),
      0
    );

    // Top 5 referidores
    const topReferrers = await prisma.$queryRaw`
      SELECT
        u.email,
        u.referral_code as "referralCode",
        COUNT(o.id) as "referralCount",
        SUM(CAST(o.total AS DECIMAL)) as "totalRevenue"
      FROM users u
      LEFT JOIN orders o ON o.referred_by = u.referral_code AND o.payment_status = 'PAID'
      WHERE u.referral_code IS NOT NULL
      GROUP BY u.email, u.referral_code
      HAVING COUNT(o.id) > 0
      ORDER BY COUNT(o.id) DESC
      LIMIT 5
    `;

    res.json({
      success: true,
      data: {
        usersWithCode,
        referredOrders,
        referredRevenue,
        topReferrers: topReferrers.map(r => ({
          email: r.email,
          code: r.referralCode,
          referrals: Number(r.referralCount),
          revenue: Number(r.totalRevenue) || 0
        }))
      }
    });
  } catch (error) {
    console.error('Error obteniendo stats de referidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas',
      error: error.message
    });
  }
});

module.exports = router;
