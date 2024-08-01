require('dotenv').config();

const mqtt_connection = require('./config/mqtt');
const cron = require('node-cron');
const client = require('./config/database');

const { fetch_box_id } = require('./helpers/fetch_box_id')
const { handle_message_mqtt } = require('./helpers/handle_message_mqtt');
const { check_time_outlet } = require('./helpers/check_time_outlet');
const { check_network_connection } = require('./helpers/check_network_connection');
const { create_box_photograph_table, create_outlet_status_table, create_outlets_table } = require('./helpers/create_table');
const { get_list_user_charging } = require('./helpers/get_user_charging');
const { insert_query } = require('./helpers/insert_query');

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
  
  create_box_photograph_table();
  create_outlet_status_table();
  create_outlets_table();

  process.on('exit', () => {
    client.end();
  });

  let list_box_data = [];
  let list_buffer_message = [];
  let list_user_charging = [];

  const SE_topic_mqtt = 'SEbox_';
  const AE_topic_mqtt = 'AEbox_';
  const PE_topic_mqtt = 'PEbox_';
  const PFE_topic_mqtt = 'PFEbox_';
  const VE_topic_mqtt = 'VEbox_';
  const PME_topic_mqtt = 'PMEbox_';
  const CE_topic_mqtt = 'CEbox_';

  let topics_mqtt = [];
  let list_box_outlet = [];

  client_connect_mqtt.on('connect', async() => {
    try {
      const list_box_id = await fetch_box_id(list_box_data);
      
      list_box_id.forEach(box => {
        const box_id = box.split('_')[1];
        topics_mqtt.push(SE_topic_mqtt + box_id); 
        topics_mqtt.push(AE_topic_mqtt + box_id); 
        topics_mqtt.push(PE_topic_mqtt + box_id);
        topics_mqtt.push(PFE_topic_mqtt + box_id); 
        topics_mqtt.push(VE_topic_mqtt + box_id); 
        topics_mqtt.push(PME_topic_mqtt + box_id);
        topics_mqtt.push(CE_topic_mqtt + box_id);
      });

      topics_mqtt.forEach(topic_mqtt => {
        client_connect_mqtt.subscribe(topic_mqtt, err => {
          if (err) {
            console.error(`Failed to subscribe to topic ${topic_mqtt}:`, err);
          };
        });
      });
    } catch (error) {
      console.error("Failed to fetch Ebox IDs:", error);
    };
  });

  client_connect_mqtt.on('message', (topic_mqtt, content_mqtt) => {
    handle_message_mqtt(
      topic_mqtt,
      content_mqtt,
      list_box_outlet,
      list_box_data,
      list_buffer_message,
    );
  });

  cron.schedule('* * * * *', async () => {
    check_time_outlet(list_box_outlet, list_buffer_message);
  });

  cron.schedule('*/5 * * * *', async() => {
    await get_list_user_charging(list_user_charging);

    let list_message_save_to_database = JSON.parse(JSON.stringify(list_buffer_message));

    list_buffer_message = [];

    list_message_save_to_database.forEach(async message => {
      if (message.outlet_status === 2) {
        const user = list_user_charging[`${message.box_id}_${message.outlet_number}`];
        if (user) {
          message.user_id = user.user_id;
          message.user_name = user.user_name;
        }
      }

      await insert_query(message);
    })

    list_message_save_to_database = [];
    list_user_charging = [];
  })
};

initialize();

