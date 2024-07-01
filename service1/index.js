require('dotenv').config()

const { fetch_ebox_data, fetch_user_data, fetch_transaction_data } = require('./helpers/fetch_api');

const client = require('./config/database.js');

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

// fetch_ebox_data();
// fetch_user_data();
fetch_transaction_data();

