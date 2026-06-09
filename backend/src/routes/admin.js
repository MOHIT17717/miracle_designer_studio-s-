const express = require('express');
const { prisma } = require('../db');

const router = express.Router();

// GET /api/admin/stats – Dashboard summary stats
router.get('/stats', async (req, res) => {
  try {
    const [
      totalProducts,
      totalOrders,
      pendingOrders,
      totalBookings,
      pendingBookings,
      activeOffers,
      totalCategories,
      totalRevenue,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.makeupBooking.count(),
      prisma.makeupBooking.count({ where: { status: 'pending' } }),
      prisma.offer.count({ where: { isActive: true } }),
      prisma.category.count(),
      prisma.order.aggregate({ _sum: { totalAmount: true } }),
    ]);

    return res.json({
      totalProducts,
      totalOrders,
      pendingOrders,
      totalBookings,
      pendingBookings,
      activeOffers,
      totalCategories,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
    });
  } catch (err) {
    console.error('[admin/stats] error:', err);
    return res.status(500).json({ error: 'Failed to load stats' });
  }
});

module.exports = router;
