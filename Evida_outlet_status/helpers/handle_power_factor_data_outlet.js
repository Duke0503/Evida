const { save_data_to_database } = require('./save_data_to_database');
const { update_outlet } = require('./outlets_sql');

const handle_power_factor_data_outlet = async (
  ebox_id,
  data_ebox,
  list_ebox_outlet,
  ebox_data,
) => {
  const list_outlet = data_ebox.toString().split(',');
  for (let count = 0; count < list_outlet.length - 1; count++) {
    const outlet_id = list_outlet[count].split('-')[0];
    const outlet_power_factor = list_outlet[count].split('-')[1];

    const ebox_outlet_id = 'Ebox_' + ebox_id + '_' + outlet_id;
    if (list_ebox_outlet[ebox_outlet_id]) {
      if (list_ebox_outlet[ebox_outlet_id].outlet_status == 2) {
        if (list_ebox_outlet[ebox_outlet_id].power_factor == 0) {
          list_ebox_outlet[ebox_outlet_id].power_factor = Number(outlet_power_factor);
        } else {
          if (Number(outlet_power_factor) - list_ebox_outlet[ebox_outlet_id].power_factor > 10
            || Number(outlet_power_factor) - list_ebox_outlet[ebox_outlet_id].power_factor < -10) {

            await update_outlet(ebox_outlet_id);

            list_ebox_outlet[ebox_outlet_id].power_factor = Number(outlet_power_factor);

            save_data_to_database(list_ebox_outlet[ebox_outlet_id]);

          } else {
            list_ebox_outlet[ebox_outlet_id].power_factor = Number(outlet_power_factor);
          }
        };
      } else {
        list_ebox_outlet[ebox_outlet_id].power_factor = Number(outlet_power_factor);
      };
    };
  };
};

module.exports = { handle_power_factor_data_outlet };