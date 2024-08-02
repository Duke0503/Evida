const { insert_outlet, find_outlet_by_name } = require('./outlets_sql');

const check_condition_of_message = async (
  box_id,
  location_name,
  timestamp,
  outlet_number,
  box_connection,
  outlet_status,
  command,
  outlet_current,
  external_meter_current,
  outlet_voltage,
  external_meter_voltage,
  outlet_power_factor,
  outlet_power_consumption,
  list_buffer_message
) => {
  const outlet_ = await find_outlet_by_name(`${box_id}_${outlet_number}`);

  const outlet = outlet_.rows[0];

  if (!outlet) {
    await save_message_to_buffer(
      box_id,
      location_name,
      timestamp,
      outlet_number,
      box_connection,
      outlet_status,
      command,
      outlet_current,
      external_meter_current,
      outlet_voltage,
      external_meter_voltage,
      outlet_power_factor,
      outlet_power_consumption,
      list_buffer_message
    )
  } else {
    if (outlet.outlet_status != outlet_status) {
       await save_message_to_buffer(
        box_id,
        location_name,
        timestamp,
        outlet_number,
        box_connection,
        outlet_status,
        command,
        outlet_current,
        external_meter_current,
        outlet_voltage,
        external_meter_voltage,
        outlet_power_factor,
        outlet_power_consumption,
        list_buffer_message
      )
    } else {
      if ( outlet_status == 2) {
        if (outlet_current - outlet.outlet_current > 1 || outlet_current - outlet.outlet_current < -1 ||
          outlet_power_factor - outlet.outlet_power_factor > 20 || outlet_power_factor - outlet.outlet_power_factor < -20 ||
          outlet_power_consumption - outlet.outlet_power_consumption > 1 || outlet_power_consumption - outlet.outlet_power_consumption < -1 ||
          is_greater_than_by_minutes(timestamp, outlet.timestamp, 15)
        ) {
          await save_message_to_buffer(
            box_id,
            location_name,
            timestamp,
            outlet_number,
            box_connection,
            outlet_status,
            command,
            outlet_current,
            external_meter_current,
            outlet_voltage,
            external_meter_voltage,
            outlet_power_factor,
            outlet_power_consumption,
            list_buffer_message
          )
        }
      } else {
        if (is_greater_than_by_minutes(timestamp, outlet.timestamp, 24 * 60)) {
          await save_message_to_buffer(
            box_id,
            location_name,
            timestamp,
            outlet_number,
            box_connection,
            outlet_status,
            command,
            outlet_current,
            external_meter_current,
            outlet_voltage,
            external_meter_voltage,
            outlet_power_factor,
            outlet_power_consumption,
            list_buffer_message
          )
        }
      }
    }
  }
};


const save_message_to_buffer = async (
  box_id,
  location_name,
  timestamp,
  outlet_number,
  box_connection,
  outlet_status,
  command,
  outlet_current,
  external_meter_current,
  outlet_voltage,
  external_meter_voltage,
  outlet_power_factor,
  outlet_power_consumption,
  list_buffer_message
) => {
  await insert_outlet(
    `${box_id}_${outlet_number}`,
    box_id, 
    location_name,
    timestamp,
    outlet_number,
    box_connection,
    outlet_status,
    command,
    outlet_current,
    external_meter_current,
    outlet_voltage,
    external_meter_voltage,
    outlet_power_factor,
    outlet_power_consumption,
  );

  const now = new Date().toISOString();

  let user_id = null;
  let user_name = null;

  list_buffer_message.push({
    box_id,
    location_name,
    timestamp,
    user_id,
    user_name,
    outlet_number,
    box_connection,
    outlet_status,
    command,
    outlet_current,
    external_meter_current,
    outlet_voltage,
    external_meter_voltage,
    outlet_power_factor,
    outlet_power_consumption,
    created_at: now,
    updated_at: now,
  });

};

function is_greater_than_by_minutes(date1, date2, minutes) {
  const milliseconds = minutes * 60 * 1000;
  return (date1.getTime() - date2.getTime()) > milliseconds;
}

module.exports = { check_condition_of_message };
