const mongoose = require('mongoose')

const outletSchema = new mongoose.Schema({
  name: String,
  outlet_status: Number,
  update_time: Date,
})

const outlet = mongoose.model("outlet", outletSchema, "outlets");

module.exports = outlet;