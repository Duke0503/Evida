require('dotenv').config();
const cron = require('node-cron');
const { createOutletDataTable } = require('./helpers/create_outlet_data_table');
const { createPowerConsumptionTable } = require('./helpers/create_power_consumption_table');
const { Client } = require('pg');
const { db2Config } = require('./config/database');
const transferData = require('./helpers/transferData'); 

const tables = ['outlet_data', 'power_consumption'];

const executeDataTransfer = async () => {
    for (const table of tables) {
        await transferData(table);
    }
};

const performAllTransfers = async () => {
    const clientDB2 = new Client(db2Config);
    try {
        await clientDB2.connect();
        
        // Ensure tables exist
        await createOutletDataTable();
        await createPowerConsumptionTable();

        await executeDataTransfer();
    } catch (err) {
        console.error('Error during data transfer:', err);
    } finally {
        await clientDB2.end();
    }
};

// Schedule the data transfer process to run at 12 AM every day 
cron.schedule('0 0 * * *', () => {
    console.log('Running data transfer process at 12 AM every day...');
    performAllTransfers();
});
