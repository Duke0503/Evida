const client = require('../config/database');
const { create_message_to_save } = require('./create_message_to_save');


const check_time_outlet = async (list_box_outlet, list_buffer_message) => {
  const more_than_15_min = new Date(new Date().getTime() - 15 * 60 * 1000);
  const more_than_1_day = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);

  try {
    const outlet_with_status_2 = await client.query(
      'SELECT name FROM outlets WHERE outlet_status = $1 AND timestamp <= $2',
      [2, more_than_15_min]
    );

    const outlet_with_status_differ_2 = await client.query(
      'SELECT name FROM outlets WHERE outlet_status <> $1 AND timestamp <= $2',
      [2, more_than_1_day]
    );

    const outlet = [...outlet_with_status_2.rows, ...outlet_with_status_differ_2.rows];

    for (const outlet_ of outlet) {
      if (list_box_outlet[outlet_.name]) {
        await create_message_to_save(list_box_outlet[outlet_.name], list_buffer_message);
      }

    }
  } catch (err) {
    console.error('Error checking outlets:', err);
  }
};

module.exports = { check_time_outlet };
