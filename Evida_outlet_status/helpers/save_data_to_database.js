const { insert_query } = require('./insert_query');

const save_data_to_database = async (
  outlet,
) => {
  let box_status = '';
  if (outlet.ebox_status == 0) {
    box_status = 'online';
  } else box_status = 'offline';

  if (outlet.outlet_status != 2) {
    
    await insert_query(
      outlet.ebox_id,
      outlet.ebox_name,
      new Date(),
      outlet.outlet_id,
      box_status,
      outlet.outlet_status,
      outlet.current_system / 1000,
      outlet.current_device / 1000,
      outlet.voltage_system,
      outlet.voltage_device,
      outlet.power_factor,
      outlet.power_consumption / (3.6 * 1000 * 1000),
    )
  } else {
    if (
      outlet.current != 0 &&
      outlet.voltage != 0 &&
      outlet.power_factor != 0 &&
      outlet.power_consumption != 0
    ) {

      await insert_query(
        outlet.ebox_id,
        outlet.ebox_name,
        new Date(),
        outlet.outlet_id,
        box_status,
        outlet.outlet_status,
        outlet.current_system / 1000,
        outlet.current_device / 1000,
        outlet.voltage_system,
        outlet.voltage_device,
        outlet.power_factor,
        outlet.power_consumption / (3.6 * 1000 * 1000),
      );
    };
  };
  
};

module.exports = { save_data_to_database };