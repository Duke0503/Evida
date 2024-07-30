const client = require('../config/database');
const { insert_active_outlet_query }= require('../helpers/insert_query');

const active_outlet = async () => {
  const current_time = new Date();

  const midnight = new Date(current_time);

  midnight.setHours(0, 0, 0, 0);

  const query = 'SELECT * FROM power_consumption WHERE timestamp >= $1';
  const values = [midnight];
  
  const box_data = await client.query(query, values);

  box_data.rows.forEach(async box => {
    let number_of_active_outlets = 0;

    for (let i = 0; i <= 9; i++) {
      if (box[`outlet_${i}_status`] != 6 && box[`outlet_${i}_status`] != null) {
        number_of_active_outlets ++;
      }
    }

    await insert_active_outlet_query(box.ebox_id, number_of_active_outlets);
  });

}

module.exports = {
  active_outlet
}