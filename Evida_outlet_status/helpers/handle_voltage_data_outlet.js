const handle_voltage_data_outlet = (
  box_id,
  data_ebox,
  list_ebox_outlet,
) => {

  const voltage = data_ebox.toString().split('-')[1];

  for (let outlet_number = 0; outlet_number < 10; outlet_number ++) {
    if (list_ebox_outlet['Ebox_' + box_id + '_' + outlet_number.toString()]) {
      list_ebox_outlet['Ebox_' + box_id + '_' + outlet_number.toString()].outlet_voltage = Number(voltage);
    };
  };
};

module.exports = { handle_voltage_data_outlet };