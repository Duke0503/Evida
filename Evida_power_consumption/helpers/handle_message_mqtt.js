const handle_message_mqtt = (
  topic_mqtt,
  data_ebox,
  message_buffer_consumption,  
) => {
  const ebox_id = 'Ebox_' + topic_mqtt.split('_')[1];

  if(!message_buffer_consumption[ebox_id]) {
    message_buffer_consumption[ebox_id] = {
      ebox_id: ebox_id,
    };
  };

  switch (topic_mqtt.split('_')[0]) {
    case 'PEbox':
      const ebox_id_power_consumption = data_ebox.toString().split('10-')[1];
      message_buffer_consumption[ebox_id].power_consumption = Number(ebox_id_power_consumption) / (3.6 * 1000 * 1000);
      break;
    case 'PMEbox':
      const ebox_id_pme_value = data_ebox.toString().split(',');
      const ebox_id_pme_last_value = ebox_id_pme_value[ebox_id_pme_value.length - 1];
      message_buffer_consumption[ebox_id].PME_value = Number(ebox_id_pme_last_value);
  };
};

module.exports = { handle_message_mqtt };