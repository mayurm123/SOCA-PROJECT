const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  symbol: String,
  expiryDate: String,
  strikePrice: Number,
  timestamp: Date,
  CE: Object,
  PE: Object,
});

// ✅ Model name: Option, Schema: optionSchema, Collection name: option_chain
module.exports = mongoose.model('Option', optionSchema, 'option_chain');



