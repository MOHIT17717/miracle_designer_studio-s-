const express = require('express');
const { prisma } = require('../db');

const router = express.Router();

// GET /api/offers – List all offers (admin)
router.get('/', async (req, res) => {
  try {
    const offers = await prisma.offer.findMany({
      include: { products: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ items: offers });
  } catch (err) {
    console.error('[offers] list error:', err);
    return res.status(500).json({ error: 'Failed to list offers' });
  }
});

// GET /api/offers/:id – Get single offer
router.get('/:id', async (req, res) => {
  try {
    const offer = await prisma.offer.findUnique({
      where: { id: req.params.id },
      include: { products: { include: { product: { include: { category: true } } } } },
    });
    if (!offer) return res.status(404).json({ error: 'Offer not found' });
    return res.json(offer);
  } catch (err) {
    console.error('[offers] get error:', err);
    return res.status(500).json({ error: 'Failed to get offer' });
  }
});

// POST /api/offers – Create offer (admin)
router.post('/', async (req, res) => {
  try {
    const { title, description, discount, festivalName, bannerImage, startDate, endDate, productIds } = req.body;
    if (!title || !discount || !startDate || !endDate) {
      return res.status(400).json({ error: 'title, discount, startDate, and endDate are required' });
    }

    const offer = await prisma.offer.create({
      data: {
        title,
        description,
        discount: parseFloat(discount),
        festivalName,
        bannerImage,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        products: productIds && productIds.length > 0
          ? { create: productIds.map((pid) => ({ productId: pid })) }
          : undefined,
      },
      include: { products: { include: { product: true } } },
    });
    return res.status(201).json(offer);
  } catch (err) {
    console.error('[offers] create error:', err);
    return res.status(500).json({ error: 'Failed to create offer' });
  }
});

// PUT /api/offers/:id – Update offer (admin)
router.put('/:id', async (req, res) => {
  try {
    const { title, description, discount, festivalName, bannerImage, startDate, endDate, isActive, productIds } = req.body;

    // If productIds provided, replace all
    if (productIds) {
      await prisma.offerProduct.deleteMany({ where: { offerId: req.params.id } });
      if (productIds.length > 0) {
        await prisma.offerProduct.createMany({
          data: productIds.map((pid) => ({ offerId: req.params.id, productId: pid })),
        });
      }
    }

    const data = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (discount !== undefined) data.discount = parseFloat(discount);
    if (festivalName !== undefined) data.festivalName = festivalName;
    if (bannerImage !== undefined) data.bannerImage = bannerImage;
    if (startDate !== undefined) data.startDate = new Date(startDate);
    if (endDate !== undefined) data.endDate = new Date(endDate);
    if (isActive !== undefined) data.isActive = isActive;

    const offer = await prisma.offer.update({
      where: { id: req.params.id },
      data,
      include: { products: { include: { product: true } } },
    });
    return res.json(offer);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Offer not found' });
    console.error('[offers] update error:', err);
    return res.status(500).json({ error: 'Failed to update offer' });
  }
});

// DELETE /api/offers/:id – Delete offer (admin)
router.delete('/:id', async (req, res) => {
  try {
    await prisma.offer.delete({ where: { id: req.params.id } });
    return res.json({ ok: true });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Offer not found' });
    console.error('[offers] delete error:', err);
    return res.status(500).json({ error: 'Failed to delete offer' });
  }
});

module.exports = router;
