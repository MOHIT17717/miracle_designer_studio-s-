const express = require('express');
const { prisma } = require('../db');

const router = express.Router();

// ─── Public Product Listing ─────────────────────────────
router.get('/products', async (req, res) => {
  try {
    const { categoryId, search, minPrice, maxPrice, page = 1, limit = 20, sort = 'newest' } = req.query;
    const where = { isActive: true };
    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    let orderBy = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };
    else if (sort === 'name') orderBy = { name: 'asc' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy,
        skip,
        take: parseInt(limit),
      }),
      prisma.product.count({ where }),
    ]);

    return res.json({ items, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('[public/products] list error:', err);
    return res.status(500).json({ error: 'Failed to list products' });
  }
});

// ─── Single Product ─────────────────────────────────────
router.get('/products/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id, isActive: true },
      include: { category: true },
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    return res.json(product);
  } catch (err) {
    console.error('[public/products] get error:', err);
    return res.status(500).json({ error: 'Failed to get product' });
  }
});

// ─── Categories ─────────────────────────────────────────
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { products: { where: { isActive: true } } } } },
    });
    return res.json({ items: categories });
  } catch (err) {
    console.error('[public/categories] error:', err);
    return res.status(500).json({ error: 'Failed to list categories' });
  }
});

// ─── Active Offers ──────────────────────────────────────
router.get('/offers', async (req, res) => {
  try {
    const now = new Date();
    const offers = await prisma.offer.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        products: {
          include: { product: { include: { category: true } } },
        },
      },
      orderBy: { endDate: 'asc' },
    });
    return res.json({ items: offers });
  } catch (err) {
    console.error('[public/offers] error:', err);
    return res.status(500).json({ error: 'Failed to list offers' });
  }
});

// ─── Submit Makeup Booking (public) ─────────────────────
router.post('/bookings', async (req, res) => {
  try {
    const { customerName, mobile, email, serviceType, date, time, address, notes } = req.body;
    if (!customerName || !mobile || !serviceType || !date || !time) {
      return res.status(400).json({ error: 'customerName, mobile, serviceType, date, and time are required' });
    }

    const booking = await prisma.makeupBooking.create({
      data: {
        customerName,
        mobile,
        email,
        serviceType,
        date: new Date(date),
        time,
        address,
        notes,
      },
    });
    return res.status(201).json(booking);
  } catch (err) {
    console.error('[public/bookings] create error:', err);
    return res.status(500).json({ error: 'Failed to create booking' });
  }
});

// ─── Place Order (public checkout) ──────────────────────
router.post('/orders', async (req, res) => {
  try {
    const { customerName, mobile, email, address, city, pincode, notes, items } = req.body;
    if (!customerName || !mobile || !address || !city || !pincode) {
      return res.status(400).json({ error: 'customerName, mobile, address, city, and pincode are required' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one item is required' });
    }

    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const priceMap = {};
    products.forEach((p) => { priceMap[p.id] = p.salePrice || p.price; });

    let totalAmount = 0;
    const orderItems = items.map((item) => {
      const price = priceMap[item.productId] || 0;
      totalAmount += price * (item.quantity || 1);
      return { productId: item.productId, quantity: item.quantity || 1, price };
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
    console.error('[public/orders] create error:', err);
    return res.status(500).json({ error: 'Failed to create order' });
  }
});

// ─── Track Order (public – by order ID) ─────────────────
router.get('/orders/:id', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, images: true, categoryId: true },
            },
          },
        },
      },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Return a safe subset — omit internal notes for public view
    return res.json({
      id: order.id,
      customerName: order.customerName,
      mobile: order.mobile,
      email: order.email,
      address: order.address,
      city: order.city,
      pincode: order.pincode,
      status: order.status,
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus,
      items: order.items,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    });
  } catch (err) {
    console.error('[public/orders] track error:', err);
    return res.status(500).json({ error: 'Failed to fetch order' });
  }
});

module.exports = router;
