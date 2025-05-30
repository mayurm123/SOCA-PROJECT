const express = require('express');
const router = express.Router();
const Option = require('../models/OptionChain');

// GET /api/backtest?index=NIFTY&expiry=29-May-2025&date=2025-05-30&time=13:32&interval=5
router.get('/', async (req, res) => {
  const { index, expiry, date, time, interval } = req.query;

  if (!index || !expiry || !date || !time || !interval) {
    return res.status(400).json({ error: 'Missing required query parameters' });
  }

  try {
    const intervalMinutes = parseInt(interval);
    const localDateTime = new Date(`${date}T${time}:00`);

    // Convert local time to UTC
    const utcStart = new Date(localDateTime.getTime() - localDateTime.getTimezoneOffset() * 60000);
    const utcEnd = new Date(utcStart.getTime() + intervalMinutes * 60000);

    const docs = await Option.find({
      symbol: index,
      expiryDate: expiry,
      timestamp: { $gte: utcStart, $lt: utcEnd }
    }).sort({ timestamp: 1 });

    const flat = docs.flatMap(doc =>
      doc.records?.map(record => ({
        timestamp: doc.timestamp,
        strikePrice: record.strikePrice,
        CE: record.CE,
        PE: record.PE
      }))
    );

    res.json(flat);
  } catch (err) {
    console.error('Backtest route error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
