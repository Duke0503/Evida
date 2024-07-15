const client = require('../config/database');
const { find_outlet_by_outlet_id_and_outlet_id } = require('./find_outlet_by_outlet_id_and_outlet_id');

const insert_query = async (
  ebox_id,
  ebox_name,
  timestamp,
  outlet_id,
  box_status,
  outlet_status,
  current_system,
  current_device,
  voltage_system,
  voltage_device,
  power_factor,
  power_consumption,
) => {
  const outlet_data = await find_outlet_by_outlet_id_and_outlet_id(ebox_id, outlet_id);
  let outlet_timestamp;
  let input_timestamp;

  if(outlet_data) {
    outlet_timestamp = new Date(outlet_data.timestamp).toISOString().split('.')[0];
    input_timestamp = new Date(timestamp).toISOString().split('.')[0];
  }
  
  if (!outlet_data || outlet_data.outlet_status != outlet_status ||  outlet_timestamp != input_timestamp) {

    const insertQuery = `
      INSERT INTO outlet_data (
        ebox_id, 
        ebox_name,
        timestamp,
        outlet_id,
        box_status,
        outlet_status,
        current_system,
        current_device,
        voltage_system,
        voltage_device,
        power_factor,
        power_consumption,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
    `;
    values = [
      ebox_id,
      ebox_name,
      timestamp,
      outlet_id,
      box_status,
      outlet_status,
      current_system,
      current_device,
      voltage_system,
      voltage_device,
      power_factor,
      power_consumption,
    ]; 

    try {
      await client.query(insertQuery, values);
    } catch (err) {
      console.error('Error inserting row', err);
    }
  };
  
};

module.exports = { insert_query };
