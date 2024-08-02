const { handle_status_data_outlet } = require('./handle_status_data_outlet');
const { handle_current_data_outlet} = require('./handle_current_data_outlet');
const { handle_power_consumption_data_outlet } = require('./handle_power_consumption_data_outlet');
const { handle_power_factor_data_outlet } = require('./handle_power_factor_data_outlet');
const { handle_voltage_data_outlet } = require('./handle_voltage_data_outlet');
const { handle_PME_data_outlet } = require('./handle_PME_data_outlet');
const { handle_CE_data_outlet } = require('./handle_CE_data_outlet');

const handle_message_mqtt = async (
  topic_mqtt,
  content_mqtt,
  list_box_outlet,
  list_box_data,
  list_buffer_message,
  client_connect_mqtt
) => {
  const [ topic, box_id ] = topic_mqtt.split('_');

  switch(topic) {
    case 'SEbox':
      handle_status_data_outlet(
        box_id,
        content_mqtt,
        list_box_outlet,
        list_box_data,
        list_buffer_message,
        client_connect_mqtt
      );
      break;
    case 'AEbox':
      handle_current_data_outlet(
        box_id,
        content_mqtt,
        list_box_outlet,
        list_buffer_message
      );
      break;
    case 'PEbox':
      handle_power_consumption_data_outlet(
        box_id,
        content_mqtt,
        list_box_outlet,
        list_buffer_message
      );
      break;
    case 'PFEbox':
      handle_power_factor_data_outlet(
        box_id,
        content_mqtt,
        list_box_outlet,
        list_buffer_message
      );
      break;
    case 'VEbox':     
      handle_voltage_data_outlet(
        box_id,
        content_mqtt,
        list_box_outlet,
      );
      break;
    case 'PMEbox':
      handle_PME_data_outlet(
        box_id,
        content_mqtt,
        list_box_outlet,
      );
      break;
    case 'CEbox':
      handle_CE_data_outlet(
        box_id,
        content_mqtt,
        list_box_outlet,
      )
  }
}

module.exports =  { handle_message_mqtt };