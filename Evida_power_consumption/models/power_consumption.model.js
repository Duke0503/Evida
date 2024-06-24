const mongoose = require('mongoose')

const consumptionSchema = new mongoose.Schema({
  ebox_id: String,
  timestamp: String,
  power_consumption: Number,
  PME_value: Number,
})

const consumption = mongoose.model("consumption", consumptionSchema, "power consumption");

module.exports = consumption;