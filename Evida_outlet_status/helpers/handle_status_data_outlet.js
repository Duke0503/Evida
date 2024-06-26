const { save_data_to_database } = require('./save_data_to_database');
const { find_outlet_by_name, insert_outlet, update_status_outlet } = require('./outlets_sql');

const handle_status_data_outlet = async (
  ebox_id,
  data_ebox,
  list_ebox_outlet,
) => {
  const list_outlet = data_ebox.toString().split(',');

  for (let count = 0; count < list_outlet.length - 1; count++) {
    const outlet_id = list_outlet[count].split('-')[0];
    const outlet_status = list_outlet[count].split('-')[1];

    if (Number(outlet_status) != 6) {
      const ebox_outlet_id = 'Ebox_' + ebox_id + '_' + outlet_id;
      
      if (!list_ebox_outlet[ebox_outlet_id]) {
        list_ebox_outlet[ebox_outlet_id] = {
          outlet_id : Number(outlet_id),
          ebox_id : 'Ebox_' + ebox_id,
          ebox_status: Number(list_outlet[list_outlet.length - 1].split('-')[1]),  
          outlet_status: Number(outlet_status),
          current: 0,
          voltage: 0,
          power_factor: 0,
          power_consumption: 0,
        };
        
        const outlet = await find_outlet_by_name(ebox_outlet_id);
        if (outlet.rowCount == 0) {

          await insert_outlet(ebox_outlet_id, outlet_status);

        } else {
          list_ebox_outlet[ebox_outlet_id].outlet_status = outlet.rows[0].outlet_status;
        };
      };

      if (list_ebox_outlet[ebox_outlet_id].outlet_status != Number(outlet_status)) {
        
        await update_status_outlet(ebox_outlet_id, outlet_status);

        list_ebox_outlet[ebox_outlet_id].outlet_status = Number(outlet_status);

        save_data_to_database(list_ebox_outlet[ebox_outlet_id]);
      };
    };
  };
};

module.exports = { handle_status_data_outlet };