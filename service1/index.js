require('dotenv').config();
const ping = require('ping');
const { fetch_ebox_data, fetch_user_data, fetch_transaction_data } = require('./helpers/fetch_api');
const client = require('./config/database.js');

const host = 'google.com'; // or any host you want to ping

function check_network_connection() {
  return new Promise((resolve) => {
    function ping_host() {
      ping.sys.probe(host, function(is_alive) {
        if (is_alive) {
          console.log(`${host} is reachable.`);
          resolve(true);
        } else {
          console.log(`${host} is unreachable. Retrying...`);
          setTimeout(ping_host, 1000); 
        }
      });
    }
    ping_host();
  });
}

async function fetch_data_from_api() {
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

  fetch_ebox_data();
  fetch_user_data();
  fetch_transaction_data();
}

fetch_data_from_api();
