const client = require('../config/database');

const insert_query = async (
  ebox_id,
  timestamp,
  outlet_0_status,
  outlet_1_status,
  outlet_2_status,
  outlet_3_status,
  outlet_4_status,
  outlet_5_status,
  outlet_6_status,
  outlet_7_status,
  outlet_8_status,
  outlet_9_status,
  ebox_status,
  power_consumption,
  pme_value
) => {
  const insertQuery = `
    INSERT INTO power_consumption (
      ebox_id, 
      timestamp,
      outlet_0_status,
      outlet_1_status,
      outlet_2_status,
      outlet_3_status,
      outlet_4_status,
      outlet_5_status,
      outlet_6_status,
      outlet_7_status,
      outlet_8_status,
      outlet_9_status,
      ebox_status,
      power_consumption,
      pme_value
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
  `;
  if (ebox_status == 0) {
    ebox_status = 'online';
  } else {
    ebox_status = 'offline';
  }
  const values = [
    ebox_id,
    timestamp,
    outlet_0_status,
    outlet_1_status,
    outlet_2_status,
    outlet_3_status,
    outlet_4_status,
    outlet_5_status,
    outlet_6_status,
    outlet_7_status,
    outlet_8_status,
    outlet_9_status,
    ebox_status,
    power_consumption,
    pme_value,
  ]; 

  try {
    await client.query(insertQuery, values);
  } catch (err) {
    console.error('Error inserting row', err);
  }
};

module.exports = { insert_query };
