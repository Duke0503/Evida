const data = require('../models/outlet_data.model');
const { insert_query } = require('./insert_query');
const { format_time_to_string } = require('./format_time_to_string');

const save_data_to_database = async (
  outlet,
) => {
  let box_status = '';
  if (outlet.ebox_status == 0) {
    box_status = 'online';
  } else box_status = 'offline';

  if (outlet.outlet_status != 2) {

    insert_query(
      outlet.ebox_id,
      format_time_to_string(new Date()),
      outlet.outlet_id,
      box_status,
      outlet.outlet_status,
      0,
      0,
      0,
      0,
    )
  } else {
    if (
      outlet.current != 0 &&
      outlet.voltage != 0 &&
      outlet.power_factor != 0 &&
      outlet.power_consumption != 0
    ) {

      insert_query(
        outlet.ebox_id,
        format_time_to_string(new Date()),
        outlet.outlet_id,
        box_status,
        outlet.outlet_status,
        outlet.current / 1000,
        outlet.voltage,
        outlet.power_factor,
        outlet.power_consumption / 1000, 
      );
    }
  }
  
};

module.exports = { save_data_to_database };