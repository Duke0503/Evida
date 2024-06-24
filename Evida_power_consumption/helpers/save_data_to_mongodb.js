const consumption = require('../models/power_consumption.model');
const { format_time } = require('./format_time');

const save_data_to_mongodb = (message_buffer_consumption) => {
  const messages_consumption = Object.values(message_buffer_consumption);
  messages_consumption.forEach(async message_consumption => {
    if (!message_consumption.power_consumption) {
      message_consumption.power_consumption = 0;
    }
    if (!message_consumption.PME_value) {
      message_consumption.PME_value = 0;
    }
    console.log(message_consumption)
    await consumption.create({
      ebox_id: message_consumption.ebox_id,
      timestamp: format_time(new Date()),
      outlet_0_status: message_consumption.outlet_0_status,
      outlet_1_status: message_consumption.outlet_1_status,
      outlet_2_status: message_consumption.outlet_2_status,
      outlet_3_status: message_consumption.outlet_3_status,
      outlet_4_status: message_consumption.outlet_4_status,
      outlet_5_status: message_consumption.outlet_5_status,
      outlet_6_status: message_consumption.outlet_6_status,
      outlet_7_status: message_consumption.outlet_7_status,
      outlet_8_status: message_consumption.outlet_8_status,
      outlet_9_status: message_consumption.outlet_9_status,
      ebox_satus: message_consumption.box_satus,
      power_consumption: message_consumption.power_consumption,
      PME_value: message_consumption.PME_value,
    });
  });
};

module.exports = { save_data_to_mongodb };