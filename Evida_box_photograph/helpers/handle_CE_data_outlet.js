const handle_CE_data_outlet = (
  box_id,
  data_ebox,
  list_ebox_outlet,
) => {
  const CE_data = data_ebox.toString().split('');
  
  if (list_ebox_outlet['Ebox_' + box_id + '_' + CE_data[1]]) {
    list_ebox_outlet['Ebox_' + box_id + '_' + CE_data[1]].command = Number(CE_data[2]);
  }
  
}

module.exports = {
  handle_CE_data_outlet,
};