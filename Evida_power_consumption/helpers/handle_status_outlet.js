const handle_status_outlet = (ebox_id, data_ebox, message_buffer_consumption) => {
  const list_outlet = data_ebox.toString().split(',');

  message_buffer_consumption[ebox_id].outlet_0_status = Number(list_outlet[0].split('-')[1]);
  message_buffer_consumption[ebox_id].outlet_1_status = Number(list_outlet[1].split('-')[1]);
  message_buffer_consumption[ebox_id].outlet_2_status = Number(list_outlet[2].split('-')[1]);
  message_buffer_consumption[ebox_id].outlet_3_status = Number(list_outlet[3].split('-')[1]);
  message_buffer_consumption[ebox_id].outlet_4_status = Number(list_outlet[4].split('-')[1]);
  message_buffer_consumption[ebox_id].outlet_5_status = Number(list_outlet[5].split('-')[1]);
  message_buffer_consumption[ebox_id].outlet_6_status = Number(list_outlet[6].split('-')[1]);
  message_buffer_consumption[ebox_id].outlet_7_status = Number(list_outlet[7].split('-')[1]);
  message_buffer_consumption[ebox_id].outlet_8_status = Number(list_outlet[8].split('-')[1]);
  message_buffer_consumption[ebox_id].outlet_9_status = Number(list_outlet[9].split('-')[1]);
  message_buffer_consumption[ebox_id].ebox_status = Number(list_outlet[10].split('-')[1]);
  console.log(message_buffer_consumption[ebox_id].ebox_status)
}

module.exports = { handle_status_outlet };