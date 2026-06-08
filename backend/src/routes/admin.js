const express = require('express');

const router = express.Router();

router.get('/orders', async (req, res) => {
  return res.json({ items: [] });
});

router.patch('/orders/:id', async (req, res) => {
  return res.status(501).json({ error: 'Not implemented' });
});

module.exports = router;

