const mqtt = require('mqtt');

const MQTT_BROKER_HOST = process.env.MQTT_BROKER_HOST;
const MQTT_BROKER_PORT = process.env.MQTT_BROKER_PORT;
const client_mqtt_Id = `mqtt_${Math.random().toString(16).slice(3)}`;

const connect_mqtt_url = `mqtt://${MQTT_BROKER_HOST}:${MQTT_BROKER_PORT}`;

module.exports.connect = () => {
  try {
    const client = mqtt.connect(connect_mqtt_url, {
    client_mqtt_Id,
    clean: true,
    connectTimeout: 4000,
    username: process.env.MQTT_BROKER_USERNAME,
    password: process.env.MQTT_BROKER_PASSWORD,
    reconnectPeriod: 1000,
    });     
    console.log("Connect MQTT Server Success!");
    return client;
  } catch (error) {
    console.log("Connect MQTT Server Error!");
  }
}