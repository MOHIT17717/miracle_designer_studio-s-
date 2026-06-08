const express = require('express');
const { prisma } = require('../db');

const router = express.Router();

// GET /api/categories – List all categories
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { products: true } } },
    });
    return res.json({ items: categories });
  } catch (err) {
    console.error('[categories] list error:', err);
    return res.status(500).json({ error: 'Failed to list categories' });
  }
});

// POST /api/categories – Create category (admin)
router.post('/', async (req, res) => {
  try {
    const { name, description, image, sortOrder } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const category = await prisma.category.create({
      data: { name, description, image, sortOrder: sortOrder || 0 },
    });
    return res.status(201).json(category);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Category already exists' });
    console.error('[categories] create error:', err);
    return res.status(500).json({ error: 'Failed to create category' });
  }
});

// PUT /api/categories/:id – Update category (admin)
router.put('/:id', async (req, res) => {
  try {
    const { name, description, image, sortOrder } = req.body;
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: { name, description, image, sortOrder },
    });
    return res.json(category);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Category not found' });
    console.error('[categories] update error:', err);
    return res.status(500).json({ error: 'Failed to update category' });
  }
});

// DELETE /api/categories/:id – Delete category (admin)
router.delete('/:id', async (req, res) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    return res.json({ ok: true });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Category not found' });
    console.error('[categories] delete error:', err);
    return res.status(500).json({ error: 'Failed to delete category' });
  }
});

module.exports = router;
