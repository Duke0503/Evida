const { insert_query } = require('./insert_query');
const { create_power_consumption_table } = require('./create_power_consumption_table');

const insert_data = async (message_buffer_consumption) => {
  await create_power_consumption_table();
  const messages_consumption = Object.values(message_buffer_consumption);
  messages_consumption.forEach(async message_consumption => {
    if (!message_consumption.power_consumption) {
      message_consumption.power_consumption = 0;
    }
    if (!message_consumption.PME_value) {
      message_consumption.PME_value = 0;
    }

    insert_query(
      message_consumption.ebox_id,
      message_consumption.ebox_name,
      new Date(),
      message_consumption.outlet_0_status,
      message_consumption.outlet_1_status,
      message_consumption.outlet_2_status,
      message_consumption.outlet_3_status,
      message_consumption.outlet_4_status,
      message_consumption.outlet_5_status,
      message_consumption.outlet_6_status,
      message_consumption.outlet_7_status,
      message_consumption.outlet_8_status,
      message_consumption.outlet_9_status,
      message_consumption.ebox_status,
      message_consumption.power_consumption,
      message_consumption.PME_value,
    );
  });
};

module.exports = { insert_data };