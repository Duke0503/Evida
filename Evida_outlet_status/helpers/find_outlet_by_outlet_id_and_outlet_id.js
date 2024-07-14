const client = require('../config/database');

const find_outlet_by_outlet_id_and_outlet_id = async (ebox_id, outlet_id) => {
  try {
    const query = `
      SELECT *
      FROM outlet_data
      WHERE ebox_id = $1 AND outlet_id = $2
      ORDER BY timestamp DESC
      LIMIT 1;
    `;
    const values = [ebox_id, outlet_id];

    const res = await client.query(query, values);
    return res.rows[0];
  } catch (err) {
    console.error('Error executing query', err.stack);
    throw err;
  }
};

module.exports = { find_outlet_by_outlet_id_and_outlet_id };