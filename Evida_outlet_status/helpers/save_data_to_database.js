const data = require('../models/outlet_data.model');
const { format_time_to_string } = require('./format_time_to_string');

const save_data_to_database = async (
  outlet,
) => {
  let box_status = '';
  if (outlet.ebox_status == 0) {
    box_status = 'online';
  } else box_status = 'offline';

  if (outlet.outlet_status != 2) {

    await data.create({
      ebox_id: outlet.ebox_id,
      timestamp: format_time_to_string(new Date()),
      outlet_id: outlet.outlet_id,
      box_status: box_status,
      outlet_status: outlet.outlet_status,
      current: 0,
      voltage: 0,
      power_factor: 0,
      power_consumption: 0,
    });
  } else {
    if (
      outlet.current != 0 &&
      outlet.voltage != 0 &&
      outlet.power_factor != 0 &&
      outlet.power_consumption != 0
    ) {

      await data.create({
        ebox_id: outlet.ebox_id,
        timestamp: format_time_to_string(new Date()),
        outlet_id: outlet.outlet_id,
        box_status: box_status,
        outlet_status: outlet.outlet_status,
        current: outlet.current / 1000,
        voltage: outlet.voltage,
        power_factor: outlet.power_factor,
        power_consumption: outlet.power_consumption / 1000,
      });
    }
  }
  
};

module.exports = { save_data_to_database };