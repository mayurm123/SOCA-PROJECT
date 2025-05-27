// backend/routes/optionRoutes.js
const express = require('express');
const router = express.Router();
const Option = require('../models/OptionChain');

// GET latest snapshot for an index
router.get('/', async (req, res) => {
  const { index, latest, from, to } = req.query;

  try {
    if (latest === 'true') {
      const doc = await Option.findOne({ symbol: index.toUpperCase() })
        .sort({ timestamp: -1 });
      return res.json(doc);
    }

    // Backtest mode: range filter
    if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);
      const docs = await Option.find({
        symbol: index.toUpperCase(),
        timestamp: { $gte: fromDate, $lte: toDate }
      }).sort({ timestamp: 1 });

      return res.json(docs);
    }

    res.status(400).json({ error: 'Invalid query params. Use latest=true or from & to.' });
  } catch (err) {
    console.error("❌ API Error:", err.message);
    res.status(500).json({ error: 'Server error while fetching option chain' });
  }
});

module.exports = router;
