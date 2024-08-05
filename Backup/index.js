require('dotenv').config();
const postgresClient = require('./config/postgres-config.js'); // PostgreSQL client
const mysqlConnection = require('./config/mysql-config.js'); // MySQL connection
const checkAndCreatePowerConsumptionTable = require('./helpers/checkAndCreatePowerConsumptionTable.js'); // Import the power consumption module
const checkAndCreateBoxPhotographTable = require('./helpers/checkAndCreateBoxPhotographTable.js'); // Import the outlet data module
const transferData = require('./helpers/transferData.js'); // Import the transferData module
const cron = require('node-cron'); // Import node-cron

const connectPostgres = () => {
  return new Promise((resolve, reject) => {
    postgresClient.connect(err => {
      if (err) {
        console.error('Error connecting to PostgreSQL', err);
        reject(err);
      } else {
        console.log('Connected to PostgreSQL!');
        resolve();
      }
    });
  });
};

const connectMySQL = async () => {
  try {
    await mysqlConnection.getConnection();
    console.log('Connected to MySQL!');
  } catch (err) {
    console.error('Error connecting to MySQL:', err.stack);
    throw err;
  }
};

const startCronJob = async () => {
  try {
    // Connect to PostgreSQL
    await connectPostgres();

    // Connect to MySQL
    await connectMySQL();

    // Check and create power_consumption table if not exists
    await checkAndCreatePowerConsumptionTable();

    // Check and create box_photograph table if not exists
    await checkAndCreateBoxPhotographTable();

    // Schedule transferData to run at 12 AM daily

    await transferData('power_consumption', [
      'id', 'ebox_id', 'ebox_name', 'outlet_0_status', 'outlet_1_status', 'outlet_2_status',
      'outlet_3_status', 'outlet_4_status', 'outlet_5_status', 'outlet_6_status', 'outlet_7_status',
      'outlet_8_status', 'outlet_9_status', 'ebox_status', 'power_consumption', 'pme_value',
      'timestamp', 'created_at', 'updated_at'
    ]);

    await transferData('box_photograph', [
      'id', 'ebox_id', 'ebox_name', 'box_status', 'outlet_id', 'outlet_status', 'system_status',
      'timestamp', 'user_id', 'user_name', 'outlet_current', 'current_external_meter', 'outlet_voltage',
      'voltage_external_meter', 'power_factor', 'power_consumption', 'created_at', 'updated_at'
    ]);


  } catch (err) {
    console.error('Error during initial connection setup:', err);
  }
};

startCronJob();
