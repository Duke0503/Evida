require('dotenv').config();

const mqtt_connection = require('./config/mqtt');
const cron = require('node-cron');
const client = require('./config/database');

const { fetch_ebox_id } = require('./helpers/fetch_ebox_id');
const { handle_message_mqtt } = require('./helpers/handle_message_mqtt');
const { check_time_outlet } = require('./helpers/check_time_outlet');
const { check_network_connection } = require('./helpers/check_network_connection');
const { create_outlet_data_table, create_outlets_table } = require('./helpers/create_table');

const initialize = async () => {
  await check_network_connection();

  const client_connect_mqtt = mqtt_connection.connect();

  client.connect(err => {
    if (err) {
      console.error('Error connecting to PostgreSQL', err);
    } else {
      console.log('Connected to PostgreSQL');
    }
  });
  
  create_outlet_data_table();
  create_outlets_table();

  process.on('exit', () => {
    client.end();
  });

  let ebox_data = [];

  const SE_topic_mqtt = 'SEbox_';
  const AE_topic_mqtt = 'AEbox_';
  const PE_topic_mqtt = 'PEbox_';
  const PFE_topic_mqtt = 'PFEbox_';
  const VE_topic_mqtt = 'VEbox_';
  const PME_topic_mqtt = 'PMEbox_';
  const CE_topic_mqtt = 'CEbox_';

  let topics_mqtt = [];
  let list_ebox_outlet = [];

  client_connect_mqtt.on('connect', async() => {
    try {
      const list_ebox_id = await fetch_ebox_id(ebox_data);
      
      list_ebox_id.forEach(ebox => {
        const ebox_id = ebox.split('_')[1];
        topics_mqtt.push(SE_topic_mqtt + ebox_id); 
        topics_mqtt.push(AE_topic_mqtt + ebox_id); 
        topics_mqtt.push(PE_topic_mqtt + ebox_id);
        topics_mqtt.push(PFE_topic_mqtt + ebox_id); 
        topics_mqtt.push(VE_topic_mqtt + ebox_id); 
        topics_mqtt.push(PME_topic_mqtt + ebox_id);
        topics_mqtt.push(CE_topic_mqtt + ebox_id);
      });

      topics_mqtt.forEach(topic_mqtt => {
        client_connect_mqtt.subscribe(topic_mqtt, err => {
          if (err) {
            console.error(`Failed to subscribe to topic ${topic_mqtt}:`, err);
          } 
          else {
            console.log(`Subscribed to topic ${topic_mqtt}`);
          };
        });
      });
    } catch (error) {
      console.error("Failed to fetch Ebox IDs:", error);
    };
  });

  client_connect_mqtt.on('message', (topic_mqtt, data_ebox) => {
    handle_message_mqtt(
      topic_mqtt,
      data_ebox,
      list_ebox_outlet,
      ebox_data,
    );
  });

  cron.schedule('* * * * *', async () => {
    check_time_outlet(list_ebox_outlet, ebox_data);
  });
};

cron.schedule('0 0 * * *', () => {
  initialize();
});

initialize();

