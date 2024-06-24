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
    
    await consumption.create({
      ebox_id: message_consumption.ebox_id,
      timestamp: format_time(new Date()),
      power_consumption: message_consumption.power_consumption,
      PME_value: message_consumption.PME_value,
    });
  });
};

module.exports = { save_data_to_mongodb };