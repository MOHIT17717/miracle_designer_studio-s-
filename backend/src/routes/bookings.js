const express = require('express');
const { prisma } = require('../db');

const router = express.Router();

// GET /api/bookings – List all bookings (admin)
router.get('/', async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { customerName: { contains: search } },
        { mobile: { contains: search } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [items, total] = await Promise.all([
      prisma.makeupBooking.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.makeupBooking.count({ where }),
    ]);

    return res.json({ items, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('[bookings] list error:', err);
    return res.status(500).json({ error: 'Failed to list bookings' });
  }
});

// GET /api/bookings/:id – Get single booking
router.get('/:id', async (req, res) => {
  try {
    const booking = await prisma.makeupBooking.findUnique({
      where: { id: req.params.id },
    });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    return res.json(booking);
  } catch (err) {
    console.error('[bookings] get error:', err);
    return res.status(500).json({ error: 'Failed to get booking' });
  }
});

// POST /api/bookings – Create booking (public)
router.post('/', async (req, res) => {
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
    console.error('[bookings] create error:', err);
    return res.status(500).json({ error: 'Failed to create booking' });
  }
});

// PATCH /api/bookings/:id – Update booking status (admin)
router.patch('/:id', async (req, res) => {
  try {
    const { status, notes } = req.body;
    const data = {};
    if (status) data.status = status;
    if (notes !== undefined) data.notes = notes;

    const booking = await prisma.makeupBooking.update({
      where: { id: req.params.id },
      data,
    });
    return res.json(booking);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Booking not found' });
    console.error('[bookings] update error:', err);
    return res.status(500).json({ error: 'Failed to update booking' });
  }
});

// DELETE /api/bookings/:id – Delete booking (admin)
router.delete('/:id', async (req, res) => {
  try {
    await prisma.makeupBooking.delete({ where: { id: req.params.id } });
    return res.json({ ok: true });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Booking not found' });
    console.error('[bookings] delete error:', err);
    return res.status(500).json({ error: 'Failed to delete booking' });
  }
});

module.exports = router;
