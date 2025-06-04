const express = require('express');
const router = express.Router();
const Option = require('../models/OptionChain');

// GET /api/options?index=NIFTY&latest=true
// GET /api/options?index=NIFTY&from=2024-06-01&to=2024-06-03
router.get('/', async (req, res) => {
  const { index, latest, from, to } = req.query;

  if (!index) {
    return res.status(400).json({ error: 'Missing index parameter' });
  }

  try {
    const symbol = index.toUpperCase();

    if (latest === 'true') {
      const doc = await Option.findOne({ symbol }).sort({ timestamp: -1 });
      return res.json(doc);
    }

    if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);

      const docs = await Option.find({
        symbol,
        timestamp: { $gte: fromDate, $lte: toDate }
      }).sort({ timestamp: 1 });

      return res.json(docs);
    }

    res.status(400).json({ error: 'Invalid query params. Use latest=true or both from & to.' });
  } catch (err) {
    console.error("❌ Error in /api/options:", err);
    res.status(500).json({ error: 'Server error while fetching option data' });
  }
});

// GET /api/options/expiries?index=NIFTY
router.get('/expiries', async (req, res) => {
  const { index } = req.query;

  if (!index) {
    return res.status(400).json({ error: 'Missing index parameter' });
  }

  try {
    const symbol = index.toUpperCase();
    const expiries = await Option.distinct('expiryDate', { symbol });
    res.json(expiries.sort());
  } catch (err) {
    console.error('❌ Error fetching expiries:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
