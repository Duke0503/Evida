const handle_PME_data_outlet = (
  box_id,
  data_ebox,
  list_ebox_outlet,
) => {
  const PME_data = data_ebox.toString().split(',');

  const external_meter_voltage = PME_data[0];
  const external_meter_current = PME_data[1];
  
  for (let outlet_number = 0; outlet_number < 10; outlet_number ++) {
    if (list_ebox_outlet['Ebox_' + box_id + '_' + outlet_number.toString()]) {
      list_ebox_outlet['Ebox_' + box_id + '_' + outlet_number.toString()].external_meter_voltage = Number(external_meter_voltage);
      list_ebox_outlet['Ebox_' + box_id + '_' + outlet_number.toString()].external_meter_current = Number(external_meter_current);
    };
  };
};

module.exports = {
  handle_PME_data_outlet
}