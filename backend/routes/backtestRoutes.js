const express = require('express');
const router = express.Router();
const Option = require('../models/OptionChain');

router.get('/', async (req, res) => {
  try {
    const { index, expiry, date, time, interval } = req.query;

    if (!index || !expiry || !date || !time || !interval) {
      return res.status(400).json({ error: 'Missing query parameters' });
    }

     const from = new Date(`${date}T${time}:00Z`);
     const utcFrom = new Date(from.toISOString());
    // if (isNaN(from.getTime())) {
    //   return res.status(400).json({ error: 'Invalid date or time' });
    // }
    
     const to = new Date(from.getTime() + parseInt(interval) * 60000);
    

    // const fromLocal = new Date(`${date}T${time}:00`);
    // const from = new Date(fromLocal.getTime() - 5.5 * 60 * 60 * 1000); // IST → UTC
    // const to = new Date(from.getTime() + parseInt(interval) * 60000);
    console.log('🔍 Query:', { index, expiry, utcFrom, to });

    const docs = await Option.find({
      symbol: index,
      expiryDate: expiry,
      timestamp: { $gte: utcFrom, $lte: to }
    }).lean();

    const flat = docs.flatMap(doc =>
      (doc.records || [])
        .filter(record => record && record.strikePrice)
        .map(record => ({
          timestamp: doc.timestamp,
          strikePrice: record.strikePrice,
          CE: record.CE,
          PE: record.PE
        }))
    );

    res.json(flat);
  } catch (err) {
    console.error('❌ Backtest route error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/backtest/dates?index=NIFTY&expiry=06-Jun-2025  this route is added to ftech the dates avilable against the expiry date
router.get('/dates', async (req, res) => {
  const { index, expiry } = req.query;
  try {
    const dates = await Option.distinct('timestamp', {
      symbol: index,
      expiryDate: expiry
    });

    // Extract unique dates only (remove time portion)
    const uniqueDates = [...new Set(dates.map(d => new Date(d).toISOString().split('T')[0]))];

    // Sort descending or ascending
    uniqueDates.sort(); // or .reverse() for latest first

    res.json(uniqueDates);
  } catch (err) {
    console.error("Failed to fetch dates:", err);
    res.status(500).json({ error: "Failed to fetch dates" });
  }
});

module.exports = router;
