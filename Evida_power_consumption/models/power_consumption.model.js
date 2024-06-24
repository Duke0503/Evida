const mongoose = require('mongoose')

const consumptionSchema = new mongoose.Schema({
  ebox_id: String,
  timestamp: String,
  outlet_0_status: Number,
  outlet_1_status: Number,
  outlet_2_status: Number,
  outlet_3_status: Number,
  outlet_4_status: Number,
  outlet_5_status: Number,
  outlet_6_status: Number,
  outlet_7_status: Number,
  outlet_8_status: Number,
  outlet_9_status: Number,
  ebox_status: Number,
  power_consumption: Number,
  PME_value: Number,
})

const consumption = mongoose.model("consumption", consumptionSchema, "power consumption");

module.exports = consumption;