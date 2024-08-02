const { create_message_to_save } = require('./create_message_to_save');
const { find_outlet_by_name, insert_outlet } = require('./outlets_sql');

const handle_status_data_outlet = async (
  box_id,
  content_mqtt,
  list_box_outlet,
  list_box_data,
  list_buffer_message,
  client_connect_mqtt
) => {
  const list_outlet = content_mqtt.toString().split(',');

  list_outlet.slice(0, -1).forEach(async outlet_data => {
    const [outlet_number, outlet_status] = outlet_data.split('-');

    if (check_valid_outlet(outlet_status)) {

      await create_or_update_box_outlet(
        box_id,
        outlet_number,
        list_box_outlet,
        list_box_data,
        outlet_status,
        list_outlet,
        client_connect_mqtt,
      );

      const outlet_id = 'Ebox_' + box_id + '_' + outlet_number;

      list_box_outlet[outlet_id].box_connection = get_box_connection(list_outlet);

      check_status_change(
        box_id,
        list_box_outlet,
        outlet_id,
        outlet_status,
        list_buffer_message,
        client_connect_mqtt
      );
    };
  });
};

const check_valid_outlet = (outlet_status) => {
  if (Number(outlet_status) != 6) 
    return true;
  return false
};

const create_or_update_box_outlet = async (
  box_id,
  outlet_number,
  list_box_outlet,
  list_box_data,
  outlet_status,
  list_outlet,
  client_connect_mqtt,
) => {
  const outlet_id = 'Ebox_' + box_id + '_' + outlet_number;

  if (!list_box_outlet[outlet_id]) {
    list_box_outlet[outlet_id] = {
      outlet_number : Number(outlet_number),
      box_id : 'Ebox_' + box_id,
      location_name: list_box_data['Ebox_' + box_id].location_name,
      box_connection: get_box_connection(list_outlet),  
      outlet_status: Number(outlet_status),
      command: 0,
      outlet_current: 0,
      external_meter_current: 0,
      outlet_voltage: 0,
      external_meter_voltage: 0,
      outlet_power_factor: 0,
      outlet_power_consumption: 0,
    };

    const outlet = await find_outlet_by_name(outlet_id);

    if (outlet.rowCount != 0) {
      list_box_outlet[outlet_id].outlet_status = outlet.rows[0].outlet_status;
      list_box_outlet[outlet_id].command = outlet.rows[0].command;
      list_box_outlet[outlet_id].outlet_current = outlet.rows[0].outlet_current;
      list_box_outlet[outlet_id].external_meter_current = outlet.rows[0].external_meter_current;
      list_box_outlet[outlet_id].outlet_voltage = outlet.rows[0].outlet_voltage;
      list_box_outlet[outlet_id].external_meter_voltage = outlet.rows[0].external_meter_voltage;
      list_box_outlet[outlet_id].outlet_power_factor = outlet.rows[0].outlet_power_factor;
      list_box_outlet[outlet_id].outlet_power_consumption = outlet.rows[0].outlet_power_consumption;
    } else {
      
      await insert_outlet(
        outlet_id,
        list_box_outlet[outlet_id].box_id,
        list_box_outlet[outlet_id].location_name,
        new Date().toISOString(),
        list_box_outlet[outlet_id].outlet_number,
        list_box_outlet[outlet_id].box_connection,
        list_box_outlet[outlet_id].outlet_status,
        list_box_outlet[outlet_id].command,
        list_box_outlet[outlet_id].outlet_current / 1000,
        list_box_outlet[outlet_id].external_meter_current,
        list_box_outlet[outlet_id].outlet_voltage,
        list_box_outlet[outlet_id].external_meter_voltage,
        list_box_outlet[outlet_id].outlet_power_factor,
        list_box_outlet[outlet_id].outlet_power_consumption / (3.6 * 1000 * 1000),
        new Date().toISOString(),
        new Date().toISOString()
      );
    };

    if (list_box_outlet[outlet_id].outlet_status == 2) {  

      client_connect_mqtt.subscribe(`AEbox_${box_id}`);
      client_connect_mqtt.subscribe(`PFEbox_${box_id}`);
      client_connect_mqtt.subscribe(`VEbox_${box_id}`);
      client_connect_mqtt.subscribe(`PMEbox_${box_id}`);
    };
  };
};

const get_box_connection = (list_outlet) => {
  return Number(list_outlet[list_outlet.length - 1].split('-')[1]);
}

const check_status_change = async (
  box_id,
  list_box_outlet,
  outlet_id,
  outlet_status,
  list_buffer_message,
  client_connect_mqtt
) => {
  if (list_box_outlet[outlet_id].outlet_status != Number(outlet_status)) {

    if (list_box_outlet[outlet_id].outlet_status == 2) {
      client_connect_mqtt.unsubscribe(`AEbox_${box_id}`);
      console.log(`Unsubscribed to topic AEbox_${box_id}`);
      client_connect_mqtt.unsubscribe(`PFEbox_${box_id}`);
      console.log(`Unsubscribed to topic PFEbox_${box_id}`);
      client_connect_mqtt.unsubscribe(`VEbox_${box_id}`);
      console.log(`Unsubscribed to topic VEbox_${box_id}`);
      client_connect_mqtt.unsubscribe(`PMEbox_${box_id}`);
      console.log(`Unsubscribed to topic PMEbox_${box_id}`);

      list_box_outlet[outlet_id].outlet_current = 0;
      list_box_outlet[outlet_id].external_meter_current = 0;
      list_box_outlet[outlet_id].outlet_voltage = 0;
      list_box_outlet[outlet_id].external_meter_voltage = 0;
      list_box_outlet[outlet_id].outlet_power_factor = 0;
    } else {
      if (Number(outlet_status) == 2) {
        client_connect_mqtt.subscribe(`AEbox_${box_id}`);
        console.log(`Subscribed to topic AEbox_${box_id}`);
        client_connect_mqtt.subscribe(`PFEbox_${box_id}`);
        console.log(`Subscribed to topic PFEbox_${box_id}`);
        client_connect_mqtt.subscribe(`VEbox_${box_id}`);
        console.log(`Subscribed to topic VEbox_${box_id}`);
        client_connect_mqtt.subscribe(`PMEbox_${box_id}`);
        console.log(`Subscribed to topic PMEbox_${box_id}`);
      }
    }

    list_box_outlet[outlet_id].outlet_status = Number(outlet_status);

    create_message_to_save(list_box_outlet[outlet_id], list_buffer_message);
  };
};

module.exports = { handle_status_data_outlet };