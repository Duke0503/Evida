require('dotenv').config();

const database = require('./config/database');
const mqtt_connection = require('./config/mqtt');
const cron = require('node-cron');
const { fetch_ebox_id } = require('./helpers/fetch_ebox_id');
const { handle_message_mqtt } = require('./helpers/handle_message_mqtt');
const { save_data_to_mongodb } = require('./helpers/save_data_to_mongodb');

database.connect();
const client_connect_mqtt = mqtt_connection.connect();

const SE_topic_mqtt = 'SEbox_';
const PE_topic_mqtt = 'PEbox_';
const PME_topic_mqtt = 'PMEbox_';

let topics_mqtt = [];
let message_buffer_consumption = [];

const subscribe_to_topic_mqtt = async() => {
  try {
    const list_ebox_id = await fetch_ebox_id();

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
        } 
        else {
          console.log(`Subscribed to topic ${topic_mqtt}`);
        };        
      });
    }); 

    unsubcribe_to_topic_mqtt();

  } catch (error) {
    console.error("Failed to fet Ebox_id: ", error);
  };
};
 
const unsubcribe_to_topic_mqtt = () => {
  topics_mqtt.forEach(topic_mqtt => {
    client_connect_mqtt.unsubscribe(topic_mqtt, (err) => {
      if (err) {
        console.error(`Failed to unsubscribe from topic ${topic_mqtt}:`, err);
      } 
      else {
        console.log(`Unsubscribed from topic ${topic_mqtt}`);
      };
    });
  });

  setTimeout(save_data, 1000);  
 };

const save_data = () => {
  save_data_to_mongodb(message_buffer_consumption);
  message_buffer_consumption = [];
}

client_connect_mqtt.on('message', (topic_mqtt, data_ebox) => {
  handle_message_mqtt(
    topic_mqtt,
    data_ebox,
    message_buffer_consumption,
  );
});

cron.schedule('* * * * *', async () => {
  subscribe_to_topic_mqtt();
});