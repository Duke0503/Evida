const { create_message_to_save } = require('./create_message_to_save');
const { check_status_outlet_charging} = require('./check_status_outlet_charging');

const handle_current_data_outlet = async (
  box_id,
  content_mqtt,
  list_box_outlet,
  list_buffer_message
) => {

  const list_outlet = content_mqtt.toString().split(',');

  list_outlet.slice(0, -1).forEach(async outlet_data => {
    const [outlet_number, outlet_current] = outlet_data.split('-');

    const outlet_id = 'Ebox_' + box_id + '_' + outlet_number;

    if (list_box_outlet[outlet_id]) {

      if (check_status_outlet_charging(list_box_outlet, outlet_id)) {
        
        if (list_box_outlet[outlet_id].outlet_current == 0) {
          list_box_outlet[outlet_id].outlet_current = Number(outlet_current);
        } else {

          if (check_current_condition_to_save_current(list_box_outlet, outlet_id, outlet_current)) {
            list_box_outlet[outlet_id].outlet_current = Number(outlet_current);
            create_message_to_save(list_box_outlet[outlet_id], list_buffer_message);
          } else list_box_outlet[outlet_id].outlet_current = Number(outlet_current);
        }
      } else {
        list_box_outlet[outlet_id].outlet_current = Number(outlet_current);
      }
    };
  });
};

const check_current_condition_to_save_current = (
  list_box_outlet,
  outlet_id,
  outlet_current
) => {
  if (Math.abs(Number(outlet_current) - list_box_outlet[outlet_id].outlet_current) > 1000)
    return true;
  return false;
};

module.exports = { handle_current_data_outlet };