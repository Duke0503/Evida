const handle_PME_data_outlet = (
  ebox_id,
  data_ebox,
  list_ebox_outlet,
) => {
  const PME_data = data_ebox.toString().split(',');

  const voltage_external_meter = PME_data[0];
  const current_external_meter = PME_data[1];
  
  for (let outlet_id = 0; outlet_id < 10; outlet_id ++) {
    if (list_ebox_outlet['Ebox_' + ebox_id + '_' + outlet_id.toString()]) {
      list_ebox_outlet['Ebox_' + ebox_id + '_' + outlet_id.toString()].voltage_external_meter = Number(voltage_external_meter);
      list_ebox_outlet['Ebox_' + ebox_id + '_' + outlet_id.toString()].current_external_meter = Number(current_external_meter);
    };
  };
};

module.exports = {
  handle_PME_data_outlet
}