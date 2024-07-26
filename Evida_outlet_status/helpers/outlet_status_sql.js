const client_outlet = require('../config/database');

const find_outlet_status_by_name = async (name) => {
  const query = 'SELECT * FROM outlet_status WHERE name = $1';
  const values = [name];
  
  try {
    const outlet = await client_outlet.query(query, values);
    return outlet;
  } catch (err) {
    console.log('Error querying outlet_status', err);
  };
};

const insert_outlet_status = async (name, outlet_status) => {
  const insert_query = `
    INSERT INTO outlet_status (name, outlet_status, update_time)
    VALUES ($1, $2, $3)
    ON CONFLICT (name) DO UPDATE SET
      outlet_status = EXCLUDED.outlet_status,
      update_time = EXCLUDED.update_time
    WHERE outlet_status.update_time IS DISTINCT FROM EXCLUDED.update_time;
  `;
  const values = [
    name,
    Number(outlet_status),
    new Date(),
  ];

  try {
    await client_outlet.query(insert_query, values);
  } catch (err) {
    console.error('Error inserting row', err);
  }
};

const update_status_outlet = async (name, outlet_status) => {
  const update_query = `
    UPDATE outlet_status
    SET outlet_status = $1, update_time = $2
    WHERE name = $3
  `;
  const values = [
    Number(outlet_status),
    new Date(),
    name
  ];

  try {
    await client_outlet.query(update_query, values);
  } catch (err) {
    console.error('Error updating row', err);
  }
};

const update_outlet = async (name) => {
  const update_query = `
    UPDATE outlet_status
    SET update_time = $1
    WHERE name = $2
  `;
  const values = [
    new Date(),
    name
  ];

  try {
    await client_outlet.query(update_query, values);
  } catch (err) {
    console.error('Error updating row', err);
  }
};

module.exports = { 
  find_outlet_status_by_name, 
  insert_outlet_status,
  update_status_outlet,
  update_outlet,
};