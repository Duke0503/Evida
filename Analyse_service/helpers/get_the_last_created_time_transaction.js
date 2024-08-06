const client = require('../config/database');

const get_the_last_created_time_transaction = async () => {
  try {
    const res = await client.query('SELECT created_at FROM public.transactions ORDER BY created_at DESC LIMIT 1');
    if (res.rows.length > 0) {
      return res.rows[0].created_at;
    } else {
      return null;
    }
  } catch (err) {
    console.error('Error executing query', err.stack);
    throw err;
  }
}

module.exports = {
  get_the_last_created_time_transaction,
}