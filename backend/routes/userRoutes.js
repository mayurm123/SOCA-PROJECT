//routes/authRoutes.js

const express = require('express');
const router = express.Router();
const user1 = require('../models/User');


app.get('user', (req, res) => {
  if (req.user) {
    res.json({ username: req.user.username });
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});


module.exports = router;