// backend/src/routes/loyalty.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { verifyToken } = require('../middleware/auth');

const prisma = new PrismaClient();

// Configuración de puntos
const POINTS_CONFIG = {
  PER_DOLLAR: 10, // 10 puntos por cada dólar gastado
  PER_REVIEW: 50, // 50 puntos por dejar una reseña
  PER_REFERRAL: 200, // 200 puntos por referir a alguien
  REDEMPTION_RATE: 100, // 100 puntos = $1 de descuento
};

// Get user loyalty points
router.get('/me', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;

    let loyalty = await prisma.loyaltyPoints.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    // Crear si no existe
    if (!loyalty) {
      loyalty = await prisma.loyaltyPoints.create({
        data: { userId },
        include: {
          transactions: true
        }
      });
    }

    res.json({
      points: loyalty.points,
      totalEarned: loyalty.totalEarned,
      totalSpent: loyalty.totalSpent,
      valueInDollars: (loyalty.points / POINTS_CONFIG.REDEMPTION_RATE).toFixed(2),
      transactions: loyalty.transactions,
      config: POINTS_CONFIG
    });
  } catch (error) {
    console.error('Error fetching loyalty points:', error);
    res.status(500).json({ error: 'Error al obtener puntos' });
  }
});

// Add points (purchase)
router.post('/earn/purchase', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { amount, orderId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Monto inválido' });
    }

    const pointsToAdd = Math.floor(amount * POINTS_CONFIG.PER_DOLLAR);

    // Actualizar o crear loyalty points
    let loyalty = await prisma.loyaltyPoints.findUnique({ where: { userId } });

    if (!loyalty) {
      loyalty = await prisma.loyaltyPoints.create({
        data: {
          userId,
          points: pointsToAdd,
          totalEarned: pointsToAdd
        }
      });
    } else {
      loyalty = await prisma.loyaltyPoints.update({
        where: { userId },
        data: {
          points: { increment: pointsToAdd },
          totalEarned: { increment: pointsToAdd }
        }
      });
    }

    // Crear transacción
    await prisma.loyaltyTransaction.create({
      data: {
        loyaltyId: loyalty.id,
        points: pointsToAdd,
        type: 'PURCHASE',
        description: `Compra por $${amount.toFixed(2)}`,
        orderId
      }
    });

    res.json({
      message: `¡Ganaste ${pointsToAdd} puntos!`,
      pointsEarned: pointsToAdd,
      newBalance: loyalty.points + pointsToAdd
    });
  } catch (error) {
    console.error('Error adding points:', error);
    res.status(500).json({ error: 'Error al agregar puntos' });
  }
});

// Add points for review
router.post('/earn/review', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { reviewId } = req.body;

    const pointsToAdd = POINTS_CONFIG.PER_REVIEW;

    let loyalty = await prisma.loyaltyPoints.findUnique({ where: { userId } });

    if (!loyalty) {
      loyalty = await prisma.loyaltyPoints.create({
        data: {
          userId,
          points: pointsToAdd,
          totalEarned: pointsToAdd
        }
      });
    } else {
      loyalty = await prisma.loyaltyPoints.update({
        where: { userId },
        data: {
          points: { increment: pointsToAdd },
          totalEarned: { increment: pointsToAdd }
        }
      });
    }

    await prisma.loyaltyTransaction.create({
      data: {
        loyaltyId: loyalty.id,
        points: pointsToAdd,
        type: 'REVIEW',
        description: 'Puntos por dejar una reseña'
      }
    });

    res.json({
      message: `¡Ganaste ${pointsToAdd} puntos por tu reseña!`,
      pointsEarned: pointsToAdd,
      newBalance: loyalty.points + pointsToAdd
    });
  } catch (error) {
    console.error('Error adding review points:', error);
    res.status(500).json({ error: 'Error al agregar puntos' });
  }
});

// Redeem points
router.post('/redeem', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { points } = req.body;

    if (!points || points <= 0) {
      return res.status(400).json({ error: 'Puntos inválidos' });
    }

    const loyalty = await prisma.loyaltyPoints.findUnique({ where: { userId } });

    if (!loyalty) {
      return res.status(404).json({ error: 'No tienes puntos' });
    }

    if (loyalty.points < points) {
      return res.status(400).json({ error: 'Puntos insuficientes' });
    }

    // Actualizar puntos
    const updated = await prisma.loyaltyPoints.update({
      where: { userId },
      data: {
        points: { decrement: points },
        totalSpent: { increment: points }
      }
    });

    // Crear transacción
    await prisma.loyaltyTransaction.create({
      data: {
        loyaltyId: loyalty.id,
        points: -points,
        type: 'REDEMPTION',
        description: `Canje de ${points} puntos`
      }
    });

    const discountValue = (points / POINTS_CONFIG.REDEMPTION_RATE).toFixed(2);

    res.json({
      message: `¡Canjeaste ${points} puntos por $${discountValue}!`,
      pointsRedeemed: points,
      discountValue,
      newBalance: updated.points
    });
  } catch (error) {
    console.error('Error redeeming points:', error);
    res.status(500).json({ error: 'Error al canjear puntos' });
  }
});

// Get leaderboard (top users by points)
router.get('/leaderboard', async (req, res) => {
  try {
    const topUsers = await prisma.loyaltyPoints.findMany({
      take: 10,
      orderBy: { totalEarned: 'desc' },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    const leaderboard = topUsers.map((entry, index) => ({
      rank: index + 1,
      name: `${entry.user.firstName} ${entry.user.lastName}`,
      totalEarned: entry.totalEarned,
      currentPoints: entry.points
    }));

    res.json({ leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Error al obtener ranking' });
  }
});

module.exports = router;
