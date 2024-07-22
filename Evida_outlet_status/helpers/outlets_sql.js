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
  ebox_id, 
  ebox_name,
  timestamp,
  user_id,
  user_name,
  outlet_id,
  box_status,
  outlet_status,
  system_status,
  outlet_current,
  current_external_meter,
  outlet_voltage,
  voltage_external_meter,
  power_factor,
  power_consumption,
) => {
  const insert_query = `
    INSERT INTO outlets (
      name,
      ebox_id, 
      ebox_name,
      timestamp,
      user_id,
      user_name,
      outlet_id,
      box_status,
      outlet_status,
      system_status,
      outlet_current,
      current_external_meter,
      outlet_voltage,
      voltage_external_meter,
      power_factor,
      power_consumption,
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW())
    ON CONFLICT (name) DO UPDATE SET
      ebox_id = EXCLUDED.ebox_id,
      ebox_name = EXCLUDED.ebox_name,
      timestamp = EXCLUDED.timestamp,
      user_id = EXCLUDED.user_id,
      user_name = EXCLUDED.user_name,
      outlet_id = EXCLUDED.outlet_id,
      box_status = EXCLUDED.box_status,
      outlet_status = EXCLUDED.outlet_status,
      system_status = EXCLUDED.system_status,
      outlet_current = EXCLUDED.outlet_current,
      current_external_meter = EXCLUDED.current_external_meter,
      outlet_voltage = EXCLUDED.outlet_voltage,
      voltage_external_meter = EXCLUDED.voltage_external_meter,
      power_factor = EXCLUDED.power_factor,
      power_consumption = EXCLUDED.power_consumption,
      created_at = EXCLUDED.created_at,
      updated_at = EXCLUDED.updated_at
    WHERE outlets.updated_at IS DISTINCT FROM EXCLUDED.updated_at; 
  `;
  const values = [
    name,
    ebox_id,
    ebox_name,
    timestamp,
    user_id,
    user_name,
    outlet_id,
    box_status,
    outlet_status,
    system_status,
    outlet_current,
    current_external_meter,
    outlet_voltage,
    voltage_external_meter,
    power_factor,
    power_consumption,
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