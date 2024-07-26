const client = require('../config/database');

const find_outlet_by_name = async (name) => {
  const query = 'SELECT * FROM outlets WHERE name = $1';
  const values = [name];
  
  try {
    const outlet = await client.query(query, values);
    return outlet;
  } catch (err) {
    console.log('Error querying outlets', err);
  };
};

const insert_outlet = async (
  name,
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
) => {
  const insert_query = `
    INSERT INTO outlets (
      name,
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
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW())
    ON CONFLICT (name) DO UPDATE SET
      box_id = EXCLUDED.box_id,
      location_name = EXCLUDED.location_name,
      timestamp = EXCLUDED.timestamp,
      user_id = EXCLUDED.user_id,
      user_name = EXCLUDED.user_name,
      outlet_number = EXCLUDED.outlet_number,
      box_connection = EXCLUDED.box_connection,
      outlet_status = EXCLUDED.outlet_status,
      command = EXCLUDED.command,
      outlet_current = EXCLUDED.outlet_current,
      external_meter_current = EXCLUDED.external_meter_current,
      outlet_voltage = EXCLUDED.outlet_voltage,
      external_meter_voltage = EXCLUDED.external_meter_voltage,
      outlet_power_factor = EXCLUDED.outlet_power_factor,
      outlet_power_consumption = EXCLUDED.outlet_power_consumption,
      created_at = EXCLUDED.created_at,
      updated_at = EXCLUDED.updated_at
    WHERE outlets.updated_at IS DISTINCT FROM EXCLUDED.updated_at; 
  `;
  const values = [
    name,
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
}

module.exports = {
  find_outlet_by_name,
  insert_outlet,
}