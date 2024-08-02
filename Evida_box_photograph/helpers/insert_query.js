const client = require('../config/database');

const insert_query = async(record) => {
  const insert_query = `
    INSERT INTO box_photograph (
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
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
  `;
  const values = [
    record.box_id,
    record.location_name,
    record.timestamp,
    record.user_id,
    record.user_name,
    record.outlet_number,
    record.box_connection,
    record.outlet_status,
    record.command,
    record.outlet_current,
    record.external_meter_current,
    record.outlet_voltage,
    record.external_meter_voltage,
    record.outlet_power_factor,
    record.outlet_power_consumption,
    record.created_at,
    record.updated_at
  ]; 

  try {
    await client.query(insert_query, values);
  } catch (err) {
    console.error('Error inserting row', err);
  }
}

module.exports = {
  insert_query,
}