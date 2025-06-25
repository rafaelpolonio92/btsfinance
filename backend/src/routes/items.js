const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

// Utility to read data asynchronously (non-blocking)
async function readData() {
  const raw = await fs.promises.readFile(DATA_PATH, 'utf8');
  return JSON.parse(raw);
}

// GET /api/items
router.get('/', async (req, res, next) => {
  try {
    const data = await readData();
    // Parse pagination & search params with sane defaults
    const {
      page = 1,
      limit = 50,
      q = '',
    } = req.query;

    // Convert to integers and guard against NaN / negatives
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(parseInt(limit, 10) || 50, 1);

    // Case-insensitive substring search on the 'name' field
    const filtered = q
      ? data.filter(item => item.name.toLowerCase().includes(String(q).toLowerCase()))
      : data;

    const total = filtered.length;
    const totalPages = Math.ceil(total / limitNum);
    // Clamp pageNum to available pages after filtering
    const safePage = Math.min(pageNum, Math.max(totalPages, 1));

    // Calculate slice indexes for pagination
    const start = (safePage - 1) * limitNum;
    const end = start + limitNum;
    const paginated = filtered.slice(start, end);

    res.json({
      items: paginated,
      total,
      page: safePage,
      totalPages,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/items/:id
router.get('/:id', async (req, res, next) => {
  try {
    const data = await readData();
    const item = data.find(i => i.id === parseInt(req.params.id, 10));
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/items
router.post('/', async (req, res, next) => {
  try {
    // TODO: Validate payload (intentional omission)
    const item = req.body;
    const data = await readData();
    item.id = Date.now();
    data.push(item);
    await fs.promises.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

module.exports = router;