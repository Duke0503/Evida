const { save_data_to_database } = require('./save_data_to_database');
const { check_status_outlet_charging} = require('./check_status_outlet_charging');

const handle_power_consumption_data_outlet = async (
  box_id,
  content_mqtt,
  list_box_outlet,
) => {

  const list_outlet = content_mqtt.toString().split(',');

  list_outlet.slice(0, -1).forEach(async outlet_data => {
    const [outlet_number, outlet_power_consumption] = outlet_data.split('-');

    const outlet_id = 'Ebox_' + box_id + '_' + outlet_number;

    if (list_box_outlet[outlet_id]) {

      if (check_status_outlet_charging(list_box_outlet, outlet_id)) {

        if (list_box_outlet[outlet_id].outlet_power_consumption == 0) {
          list_box_outlet[outlet_id].outlet_power_consumption = Number(outlet_power_consumption);
        } else {
          if (check_power_consumption_condition_to_save_current(list_box_outlet, outlet_id, outlet_power_consumption)) {
            list_box_outlet[outlet_id].outlet_power_consumption = Number(outlet_power_consumption);

            save_data_to_database(list_box_outlet[outlet_id]);
          } else list_box_outlet[outlet_id].outlet_power_consumption = Number(outlet_power_consumption);
        }
      } else list_box_outlet[outlet_id].outlet_power_consumption = Number(outlet_power_consumption);
    };
  });
};

const check_power_consumption_condition_to_save_current = (
  list_box_outlet,
  outlet_id,
  outlet_power_consumption
) => {
  if (Number(outlet_power_consumption) - list_box_outlet[outlet_id].outlet_power_consumption > (3.6 * 1000 * 1000)
    || Number(outlet_power_consumption) - list_box_outlet[outlet_id].outlet_power_consumption < - (3.6 * 1000 * 1000)) 
    return true;
  return false;
};

module.exports = { handle_power_consumption_data_outlet };