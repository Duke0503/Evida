const { insert_query } = require('./insert_query');

const save_data_to_database = async (
  outlet,
) => {
  let box_status = '';
  if (outlet.ebox_status == 0) {
    box_status = 'online';
  } else box_status = 'offline';

  await insert_query(
    outlet.ebox_id,
    outlet.ebox_name,
    new Date(),
    outlet.outlet_id,
    box_status,
    outlet.outlet_status,
    outlet.system_status,
    outlet.outlet_current / 1000,
    outlet.current_external_meter,
    outlet.outlet_voltage,
    outlet.voltage_external_meter,
    outlet.power_factor,
    outlet.power_consumption / (3.6 * 1000 * 1000),
  )
    
};

module.exports = { save_data_to_database };