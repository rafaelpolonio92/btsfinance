const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../data/items.json');

let cachedStats = null;

fs.watchFile(DATA_PATH, () => {
  cachedStats = null;
});

// GET /api/stats
router.get('/', async (req, res, next) => {
  try {
    if (!cachedStats) {
      const raw = await fs.promises.readFile(DATA_PATH, 'utf8');
      const items = JSON.parse(raw);
      cachedStats = {
        total: items.length,
        averagePrice: items.reduce((acc, cur) => acc + cur.price, 0) / items.length
      };
    }
    res.json(cachedStats);
  } catch (err) {
    next(err);
  }
});

module.exports = router;