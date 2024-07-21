const { save_data_to_database } = require('./save_data_to_database');
const { find_outlet_status_by_name, insert_outlet_status, update_status_outlet } = require('./outlet_status_sql');
const { find_outlet_by_name } = require('./outlets_sql');

const handle_status_data_outlet = async (
  ebox_id,
  data_ebox,
  list_ebox_outlet,
  ebox_data,
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
          ebox_name: ebox_data['Ebox_' + ebox_id].ebox_name,
          ebox_status: Number(list_outlet[list_outlet.length - 1].split('-')[1]),  
          outlet_status: Number(outlet_status),
          system_status: 0,
          current_system: 0,
          current_device: 0,
          voltage_system: 0,
          voltage_device: 0,
          power_factor: 0,
          power_consumption: 0,
        };
        
        const outlet_status_data = await find_outlet_status_by_name(ebox_outlet_id);

        const outlet = await find_outlet_by_name(ebox_outlet_id);
        
        if (outlet_status_data.rowCount == 0) {
          await insert_outlet_status(ebox_outlet_id, outlet_status);
        } 

        if (outlet.rowCount != 0) {
          list_ebox_outlet[ebox_outlet_id].outlet_status = outlet.outlet_status;
          list_ebox_outlet[ebox_outlet_id].system_status = outlet.system_status;
          list_ebox_outlet[ebox_outlet_id].current_system = outlet.current_system;
          list_ebox_outlet[ebox_outlet_id].current_device = outlet.current_device;
          list_ebox_outlet[ebox_outlet_id].voltage_system = outlet.voltage_system;
          list_ebox_outlet[ebox_outlet_id].voltage_device = outlet.voltage_device;
          list_ebox_outlet[ebox_outlet_id].power_factor = outlet.power_factor;
          list_ebox_outlet[ebox_outlet_id].power_consumption = outlet.power_consumption;
        }
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