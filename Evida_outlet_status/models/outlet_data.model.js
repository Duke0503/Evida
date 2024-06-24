const mongoose = require('mongoose')

const dataSchema = new mongoose.Schema({
  ebox_id: String,
  timestamp: String,
  outlet_id: Number,
  box_status: String,
  outlet_status: Number,
  current: Number,
  voltage: Number,
  power_factor: Number,
  power_consumption: Number,
})

const data = mongoose.model("data", dataSchema, "outlet data");

module.exports = data;