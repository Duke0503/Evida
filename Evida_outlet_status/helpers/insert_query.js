const client = require('../config/database');
const { user_charging } = require('./get_user_charging');
const { update_outlet } = require('./outlet_status_sql');
const { insert_outlet, find_outlet_by_name } = require('./outlets_sql');

const insert_query = async (
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
) => {
  const outlet_ = await find_outlet_by_name(`${box_id}_${outlet_number}`);

  const outlet = outlet_.rows[0];

  if (!outlet) {
    await insert_query_statemnet(
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
    )
  } else {
    if (outlet.outlet_status != outlet_status) {
       await insert_query_statemnet(
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
      )
    } else {
      if ( outlet_status == 2) {
        if (outlet_current - outlet.outlet_current > 1 || outlet_current - outlet.outlet_current < -1 ||
          outlet_power_factor - outlet.outlet_power_factor > 20 || outlet_power_factor - outlet.outlet_power_factor < -20 ||
          outlet_power_consumption - outlet.outlet_power_consumption > 1 || outlet_power_consumption - outlet.outlet_power_consumption < -1 ||
          is_greater_than_by_minutes(timestamp, outlet.timestamp, 15)
        ) {
          await insert_query_statemnet(
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
          )
        }
      } else {
        if (is_greater_than_by_minutes(timestamp, outlet.timestamp, 24 * 60)) {
          await insert_query_statemnet(
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
          )
        }
      }
    }
  }
};


const insert_query_statemnet = async (
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
) => {
  let user_id = null;
  let user_name = null
  if (outlet_status == 2) {
    const user = await user_charging(box_id, outlet_number);
    if (user) {
      user_id = user.id;
      user_name = user.name;
    } 
  }
  await update_outlet(`${box_id}_${outlet_number}`);
  await insert_outlet(
    `${box_id}_${outlet_number}`,
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
  );
  const insert_query = `
    INSERT INTO outlet_data (
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
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
  `;
  const values = [
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
  ]; 

  try {
    await client.query(insert_query, values);
  } catch (err) {
    console.error('Error inserting row', err);
  }
};

function is_greater_than_by_minutes(date1, date2, minutes) {
  const milliseconds = minutes * 60 * 1000;
  return (date1.getTime() - date2.getTime()) > milliseconds;
}

module.exports = { insert_query };
