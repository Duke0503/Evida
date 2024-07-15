const handle_PME_data_outlet = (
  ebox_id,
  data_ebox,
  list_ebox_outlet,
) => {
  const PME_data = data_ebox.toString().split(',');

  const voltage_device = PME_data[0];
  const current_device = PME_data[1];
  
  for (let outlet_id = 0; outlet_id < 10; outlet_id ++) {
    if (list_ebox_outlet['Ebox_' + ebox_id + '_' + outlet_id.toString()]) {
      list_ebox_outlet['Ebox_' + ebox_id + '_' + outlet_id.toString()].voltage_device = Number(voltage_device);
      list_ebox_outlet['Ebox_' + ebox_id + '_' + outlet_id.toString()].current_device = Number(current_device);
    };
  };
};

module.exports = {
  handle_PME_data_outlet
}