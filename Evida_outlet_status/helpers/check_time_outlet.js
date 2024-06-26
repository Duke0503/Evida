const client = require('../config/database');
const { save_data_to_database } = require('./save_data_to_database');


const check_time_outlet = async (list_ebox_outlet) => {
  const more_than_30_min = new Date(new Date().getTime() - 30 * 60 * 1000);
  const more_than_60_min = new Date(new Date().getTime() - 60 * 60 * 1000);

  try {
    const outlet_with_status_2 = await client.query(
      'SELECT name FROM outlets WHERE outlet_status = $1 AND update_time <= $2',
      [2, more_than_30_min]
    );

    const outlet_with_status_differ_2 = await client.query(
      'SELECT name FROM outlets WHERE outlet_status <> $1 AND update_time <= $2',
      [2, more_than_60_min]
    );

    const outlet = [...outlet_with_status_2.rows, ...outlet_with_status_differ_2.rows];

    for (const outlet_ of outlet) {
      if (list_ebox_outlet[outlet_.name]) {
        await save_data_to_database(list_ebox_outlet[outlet_.name]);
      }

      await client.query(
        'UPDATE outlets SET update_time = $1 WHERE name = $2',
        [new Date(), outlet_.name]
      );
    }
  } catch (err) {
    console.error('Error checking outlets:', err);
  }
};

module.exports = { check_time_outlet };
