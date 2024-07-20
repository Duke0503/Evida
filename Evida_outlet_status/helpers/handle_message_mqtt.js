const { handle_status_data_outlet } = require('./handle_status_data_outlet');
const { handle_current_data_outlet} = require('./handle_current_data_outlet');
const { handle_power_consumption_data_outlet } = require('./handle_power_consumption_data_outlet');
const { handle_power_factor_data_outlet } = require('./handle_power_factor_data_outlet');
const { handle_voltage_data_outlet } = require('./handle_voltage_data_outlet');
const { handle_PME_data_outlet } = require('./handle_PME_data_outlet');
const { handle_CE_data_outlet } = require('./handle_CE_data_outlet');

const handle_message_mqtt = async (
  topic_mqtt,
  data_ebox,
  list_ebox_outlet,
  ebox_data
) => {
  const topic_ebox_id= topic_mqtt.split('_');
  const topic = topic_ebox_id[0];
  const ebox_id = topic_ebox_id[1];

  switch(topic) {
    case 'SEbox':
      handle_status_data_outlet(
        ebox_id,
        data_ebox,
        list_ebox_outlet,
        ebox_data,
      );
      break;
    case 'AEbox':
      handle_current_data_outlet(
        ebox_id,
        data_ebox,
        list_ebox_outlet,
      );
      break;
    case 'PEbox':
      handle_power_consumption_data_outlet(
        ebox_id,
        data_ebox,
        list_ebox_outlet,
      );
      break;
    case 'PFEbox':
      handle_power_factor_data_outlet(
        ebox_id,
        data_ebox,
        list_ebox_outlet,
      );
      break;
    case 'VEbox':     
      handle_voltage_data_outlet(
        ebox_id,
        data_ebox,
        list_ebox_outlet,
      );
      break;
    case 'PMEbox':
      handle_PME_data_outlet(
        ebox_id,
        data_ebox,
        list_ebox_outlet,
      );
      break;
    case 'CEbox':
      handle_CE_data_outlet(
        ebox_id,
        data_ebox,
        list_ebox_outlet,
      )
  }
}

module.exports =  { handle_message_mqtt };