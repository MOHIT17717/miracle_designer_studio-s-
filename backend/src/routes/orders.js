const express = require('express');
const { prisma } = require('../db');

const router = express.Router();

// GET /api/orders – List all orders (admin)
router.get('/', async (req, res) => {
  try {
    const { status, paymentStatus, search, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (search) {
      where.OR = [
        { customerName: { contains: search } },
        { mobile: { contains: search } },
        { id: { contains: search } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: { include: { product: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.order.count({ where }),
    ]);

    return res.json({ items, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('[orders] list error:', err);
    return res.status(500).json({ error: 'Failed to list orders' });
  }
});

// GET /api/orders/:id – Get single order (admin)
router.get('/:id', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: { include: { product: true } } },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    return res.json(order);
  } catch (err) {
    console.error('[orders] get error:', err);
    return res.status(500).json({ error: 'Failed to get order' });
  }
});

// POST /api/orders – Create order (public checkout)
router.post('/', async (req, res) => {
  try {
    const { customerName, mobile, email, address, city, pincode, notes, items } = req.body;

    if (!customerName || !mobile || !address || !city || !pincode) {
      return res.status(400).json({ error: 'customerName, mobile, address, city, and pincode are required' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one item is required' });
    }

    // Fetch product prices to compute total
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const priceMap = {};
    products.forEach((p) => { priceMap[p.id] = p.salePrice || p.price; });

    let totalAmount = 0;
    const orderItems = items.map((item) => {
      const price = priceMap[item.productId] || 0;
      totalAmount += price * (item.quantity || 1);
      return {
        productId: item.productId,
        quantity: item.quantity || 1,
        price,
      };
    });

    const order = await prisma.order.create({
      data: {
        customerName,
        mobile,
        email,
        address,
        city,
        pincode,
        notes,
        totalAmount,
        items: { create: orderItems },
      },
      include: { items: { include: { product: true } } },
    });

    return res.status(201).json(order);
  } catch (err) {
    console.error('[orders] create error:', err);
    return res.status(500).json({ error: 'Failed to create order' });
  }
});

// PATCH /api/orders/:id – Update order status/payment (admin)
router.patch('/:id', async (req, res) => {
  try {
    const { status, paymentStatus, notes } = req.body;
    const data = {};
    if (status) data.status = status;
    if (paymentStatus) data.paymentStatus = paymentStatus;
    if (notes !== undefined) data.notes = notes;

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data,
      include: { items: { include: { product: true } } },
    });
    return res.json(order);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Order not found' });
    console.error('[orders] update error:', err);
    return res.status(500).json({ error: 'Failed to update order' });
  }
});

// DELETE /api/orders/:id – Delete order (admin)
router.delete('/:id', async (req, res) => {
  try {
    await prisma.order.delete({ where: { id: req.params.id } });
    return res.json({ ok: true });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Order not found' });
    console.error('[orders] delete error:', err);
    return res.status(500).json({ error: 'Failed to delete order' });
  }
});

module.exports = router;
