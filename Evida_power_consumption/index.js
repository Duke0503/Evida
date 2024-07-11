require('dotenv').config();

const mqtt_connection = require('./config/mqtt');
const cron = require('node-cron');
const client = require('./config/database.js');
const { fetch_ebox_id } = require('./helpers/fetch_ebox_id');
const { handle_message_mqtt } = require('./helpers/handle_message_mqtt');
const { insert_data } = require('./helpers/insert_data.js');
const { check_network_connection } = require('./helpers/check_network_connection.js');

const initialize = async () => {
  await check_network_connection();

  client.connect(err => {
    if (err) {
      console.error('Error connecting to PostgreSQL', err);
    } else {
      console.log('Connected to PostgreSQL!');
    }
  });

  process.on('exit', () => {
    client.end();
  });

  const client_connect_mqtt = mqtt_connection.connect();

  const SE_topic_mqtt = 'SEbox_';
  const PE_topic_mqtt = 'PEbox_';
  const PME_topic_mqtt = 'PMEbox_';

  let topics_mqtt = [];
  let message_buffer_consumption = [];

  const subscribe_to_topic_mqtt = async () => {
    try {
      const list_ebox_id = await fetch_ebox_id(message_buffer_consumption);

      list_ebox_id.forEach(ebox => {
        const ebox_id = ebox.split('_')[1];

        topics_mqtt.push(PE_topic_mqtt + ebox_id);
        topics_mqtt.push(PME_topic_mqtt + ebox_id);
        topics_mqtt.push(SE_topic_mqtt + ebox_id);
      });

      topics_mqtt.forEach(topic_mqtt => {
        client_connect_mqtt.subscribe(topic_mqtt, err => {
          if (err) {
            console.error(`Failed to subscribe to topic ${topic_mqtt}:`, err);
          } else {
            console.log(`Subscribed to topic ${topic_mqtt}`);
          }
        });
      });

      unsubcribe_to_topic_mqtt();

    } catch (error) {
      console.error("Failed to fetch Ebox_id: ", error);
    }
  };

  const unsubcribe_to_topic_mqtt = () => {
    topics_mqtt.forEach(topic_mqtt => {
      client_connect_mqtt.unsubscribe(topic_mqtt, err => {
        if (err) {
          console.error(`Failed to unsubscribe from topic ${topic_mqtt}:`, err);
        } else {
          console.log(`Unsubscribed from topic ${topic_mqtt}`);
        }
      });
    });
    
    setTimeout(save_data, 1000);
  };

  const save_data = () => {
    insert_data(message_buffer_consumption);
    message_buffer_consumption = [];
  }

  client_connect_mqtt.on('message', (topic_mqtt, data_ebox) => {
    handle_message_mqtt(
      topic_mqtt,
      data_ebox,
      message_buffer_consumption,
    );
  });

  cron.schedule('0 * * * *', async () => {
    await check_network_connection();
    subscribe_to_topic_mqtt();
  });
};

initialize();