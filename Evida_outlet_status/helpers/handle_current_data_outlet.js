const { save_data_to_database } = require('./save_data_to_database');

const handle_current_data_outlet = async (
  ebox_id,
  data_ebox,
  list_ebox_outlet,
) => {
  const list_outlet = data_ebox.toString().split(',');
  for (let count = 0; count < list_outlet.length - 1; count++) {
    const outlet_id = list_outlet[count].split('-')[0];
    const outlet_current = list_outlet[count].split('-')[1];

    const ebox_outlet_id = 'Ebox_' + ebox_id + '_' + outlet_id;
    if (list_ebox_outlet[ebox_outlet_id]) {
      if (list_ebox_outlet[ebox_outlet_id].outlet_status == 2) {
        if (list_ebox_outlet[ebox_outlet_id].current_system == 0) {
          list_ebox_outlet[ebox_outlet_id].current_system = Number(outlet_current);
        } else {
          if (Number(outlet_current) - list_ebox_outlet[ebox_outlet_id].current_system > 1000
            || Number(outlet_current) - list_ebox_outlet[ebox_outlet_id].current_system < -1000) {

            list_ebox_outlet[ebox_outlet_id].current_system = Number(outlet_current);

            save_data_to_database(list_ebox_outlet[ebox_outlet_id]);

          } else {
            list_ebox_outlet[ebox_outlet_id].current_system = Number(outlet_current);
          }
        };
      } else {
        list_ebox_outlet[ebox_outlet_id].current_system = Number(outlet_current);
      };
    };
  };
};

module.exports = { handle_current_data_outlet };