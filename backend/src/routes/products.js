const express = require('express');
const { prisma } = require('../db');

const router = express.Router();

// GET /api/products – List products (admin, with full details)
router.get('/', async (req, res) => {
  try {
    const { categoryId, search, page = 1, limit = 20 } = req.query;
    const where = {};
    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.product.count({ where }),
    ]);

    return res.json({ items, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('[products] list error:', err);
    return res.status(500).json({ error: 'Failed to list products' });
  }
});

// GET /api/products/:id – Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { category: true },
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    return res.json(product);
  } catch (err) {
    console.error('[products] get error:', err);
    return res.status(500).json({ error: 'Failed to get product' });
  }
});

// POST /api/products – Create product (admin)
router.post('/', async (req, res) => {
  try {
    const { name, description, price, salePrice, images, categoryId, stock, tags } = req.body;
    if (!name || !price || !categoryId) {
      return res.status(400).json({ error: 'name, price, and categoryId are required' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        images: typeof images === 'string' ? images : JSON.stringify(images || []),
        categoryId,
        isNew: true,
        stock: parseInt(stock) || 0,
        tags: typeof tags === 'string' ? tags : JSON.stringify(tags || []),
      },
      include: { category: true },
    });
    return res.status(201).json(product);
  } catch (err) {
    console.error('[products] create error:', err);
    return res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT /api/products/:id – Update product (admin)
router.put('/:id', async (req, res) => {
  try {
    const { name, description, price, salePrice, images, categoryId, isNew, isActive, stock, tags } = req.body;

    const data = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (price !== undefined) data.price = parseFloat(price);
    if (salePrice !== undefined) data.salePrice = salePrice ? parseFloat(salePrice) : null;
    if (images !== undefined) data.images = typeof images === 'string' ? images : JSON.stringify(images);
    if (categoryId !== undefined) data.categoryId = categoryId;
    if (isNew !== undefined) data.isNew = isNew;
    if (isActive !== undefined) data.isActive = isActive;
    if (stock !== undefined) data.stock = parseInt(stock);
    if (tags !== undefined) data.tags = typeof tags === 'string' ? tags : JSON.stringify(tags);

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data,
      include: { category: true },
    });
    return res.json(product);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Product not found' });
    console.error('[products] update error:', err);
    return res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE /api/products/:id – Delete product (admin)
router.delete('/:id', async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    return res.json({ ok: true });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Product not found' });
    console.error('[products] delete error:', err);
    return res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
