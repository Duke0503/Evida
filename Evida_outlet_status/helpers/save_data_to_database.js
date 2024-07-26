const { insert_query } = require('./insert_query');

const save_data_to_database = async (
  outlet,
) => {
  const box_connection = get_box_connection(outlet.box_connection);

  await insert_query(
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
  )  
};

const get_box_connection = (box_connection) => {
  if (box_connection == 0) return 'online';
  return 'offline'
};

module.exports = { save_data_to_database };