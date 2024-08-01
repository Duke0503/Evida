const { check_condition_of_message } = require('./check_condition_of_message');

const create_message_to_save = async (
  outlet,
  list_buffer_message
) => {
  const box_connection = get_box_connection(outlet.box_connection);

  await check_condition_of_message(
    outlet.box_id,
    outlet.location_name,
    new Date(),
    outlet.outlet_number,
    box_connection,
    outlet.outlet_status,
    outlet.command,
    outlet.outlet_current / 1000,
    outlet.external_meter_current,
    outlet.outlet_voltage,
    outlet.external_meter_voltage,
    outlet.outlet_power_factor,
    outlet.outlet_power_consumption / (3.6 * 1000 * 1000),
    list_buffer_message,
  )  
};

const get_box_connection = (box_connection) => {
  if (box_connection == 0) return 'online';
  return 'offline'
};

module.exports = { create_message_to_save };