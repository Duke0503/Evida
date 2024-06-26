const client = require('../config/database');

const insert_query = async (
  ebox_id,
  timestamp,
  outlet_id,
  box_status,
  outlet_status,
  current,
  voltage,
  power_factor,
  power_consumption,
) => {
  const insertQuery = `
    INSERT INTO outlet_data (
      ebox_id, 
      timestamp,
      outlet_id,
      box_status,
      outlet_status,
      current,
      voltage,
      power_factor,
      power_consumption
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `;
  values = [
    ebox_id,
    timestamp,
    outlet_id,
    box_status,
    outlet_status,
    current,
    voltage,
    power_factor,
    power_consumption,
  ]; 

  try {
    await client.query(insertQuery, values);
  } catch (err) {
    console.error('Error inserting row', err);
  }
};

module.exports = { insert_query };
