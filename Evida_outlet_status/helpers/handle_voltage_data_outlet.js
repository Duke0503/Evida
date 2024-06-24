const handle_voltage_data_outlet = (
  ebox_id,
  data_ebox,
  list_ebox_outlet,
) => {

  const voltage = data_ebox.toString().split('-')[1];

  for (let outlet_id = 0; outlet_id < 10; outlet_id ++) {
    if (list_ebox_outlet['Ebox_' + ebox_id + '_' + outlet_id.toString()]) {
      list_ebox_outlet['Ebox_' + ebox_id + '_' + outlet_id.toString()].voltage = Number(voltage);
    };
  };
};

module.exports = { handle_voltage_data_outlet };