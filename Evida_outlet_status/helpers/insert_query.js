const client = require('../config/database');
const { find_outlet_by_outlet_id_and_outlet_id } = require('./find_outlet_by_outlet_id_and_outlet_id');
const { user_charging } = require('./get_user_charging');
const { update_outlet } = require('./outlet_status_sql');
const { insert_outlet, find_outlet_by_name } = require('./outlets_sql');

const insert_query = async (
  ebox_id,
  ebox_name,
  timestamp,
  outlet_id,
  box_status,
  outlet_status,
  system_status,
  current_system,
  current_device,
  voltage_system,
  voltage_device,
  power_factor,
  power_consumption,
) => {
  // const outlet_data = await find_outlet_by_outlet_id_and_outlet_id(ebox_id, outlet_id);
  const outlet_ = await find_outlet_by_name(`${ebox_id}_${outlet_id}`);

  const outlet = outlet_.rows[0];

  if (!outlet) {
    await insert_query_statemnet(
      ebox_id,
      ebox_name,
      timestamp,
      outlet_id,
      box_status,
      outlet_status,
      system_status,
      current_system,
      current_device,
      voltage_system,
      voltage_device,
      power_factor,
      power_consumption,
    )
  } else {
    if (outlet.outlet_status != outlet_status) {
      await insert_query_statemnet(
        ebox_id,
        ebox_name,
        timestamp,
        outlet_id,
        box_status,
        outlet_status,
        system_status,
        current_system,
        current_device,
        voltage_system,
        voltage_device,
        power_factor,
        power_consumption,
      )
    } else {
      if ( outlet_status == 2) {
        if (current_system - outlet.current_system > 1 || current_system - outlet.current_system < -1 ||
          power_factor - outlet.power_factor > 20 || power_factor - outlet.power_factor < -20 ||
          power_consumption - outlet.power_consumption > 1 || power_consumption - outlet.power_consumption < -1 ||
          is_greater_than_by_minutes(timestamp, outlet.timestamp, 15)
        ) {
          await insert_query_statemnet(
            ebox_id,
            ebox_name,
            timestamp,
            outlet_id,
            box_status,
            outlet_status,
            system_status,
            current_system,
            current_device,
            voltage_system,
            voltage_device,
            power_factor,
            power_consumption,
          )
        }
      } else {
        if (is_greater_than_by_minutes(timestamp, outlet.timestamp, 60)) {
          await insert_query_statemnet(
            ebox_id,
            ebox_name,
            timestamp,
            outlet_id,
            box_status,
            outlet_status,
            system_status,
            current_system,
            current_device,
            voltage_system,
            voltage_device,
            power_factor,
            power_consumption,
          )
        }
      }
    }
  }
};


const insert_query_statemnet = async (
  ebox_id,
  ebox_name,
  timestamp,
  outlet_id,
  box_status,
  outlet_status,
  system_status,
  current_system,
  current_device,
  voltage_system,
  voltage_device,
  power_factor,
  power_consumption,
) => {
  let user_id = null;
  let user_name = null
  if (outlet_status == 2) {
    const user = await user_charging(ebox_id, outlet_id);
    if (user) {
      user_id = user.id;
      user_name = user.name;
    } 
  }
  await update_outlet(`${ebox_id}_${outlet_id}`);
  await insert_outlet(
    `${ebox_id}_${outlet_id}`,
    ebox_id, 
    ebox_name,
    timestamp,
    user_id,
    user_name,
    outlet_id,
    box_status,
    outlet_status,
    system_status,
    current_system,
    current_device,
    voltage_system,
    voltage_device,
    power_factor,
    power_consumption,
  );
  const insert_query = `
    INSERT INTO outlet_data (
      ebox_id, 
      ebox_name,
      timestamp,
      user_id,
      user_name,
      outlet_id,
      box_status,
      outlet_status,
      system_status,
      current_system,
      current_device,
      voltage_system,
      voltage_device,
      power_factor,
      power_consumption,
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
  `;
  const values = [
    ebox_id,
    ebox_name,
    timestamp,
    user_id,
    user_name,
    outlet_id,
    box_status,
    outlet_status,
    system_status,
    current_system,
    current_device,
    voltage_system,
    voltage_device,
    power_factor,
    power_consumption,
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
