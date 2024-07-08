const cron = require('node-cron');
const { Client } = require('pg');
const getLastUpdateTime = require('./helpers/getLastUpdateTime'); 
const { dbConfig, db2Config } = require('./config/database');

const transferAppUserData = require('./helpers/transferAppUserData'); 
const transferBoxesData = require('./helpers/transferBoxesData'); 
const transferOtherData = require('./helpers/transferOtherData'); 

const appUserTables = ['app_user'];
const appBoxesTables = ['boxes'];
const otherTables = ['outlet_data', 'power_consumption', 'transactions'];

async function runAppUserTransferData(clientDB2) {
    try {
        for (const table of appUserTables) {
            // Pass getLastUpdateTime function to transferData
            await transferAppUserData(table, (tableName) => getLastUpdateTime(tableName, clientDB2));
        }
    } catch (err) {
        console.error(`Error transferring data for ${table}:`, err);
    }
}
async function runBoxesTransferData(clientDB2) {
    try {
        for (const table of appBoxesTables) {
            // Pass getLastUpdateTime function to transferData
            await transferBoxesData(table, (tableName) => getLastUpdateTime(tableName, clientDB2));
        }
    } catch (err) {
        console.error(`Error transferring data for ${table}:`, err);
    }
}

async function runOtherTransferData() {
    for (const table of otherTables) {
        await transferOtherData(table);
    }
}

async function runAllTransfers() {
    const clientDB2 = new Client(db2Config);
    try {
        await clientDB2.connect();

        await runAppUserTransferData(clientDB2);
         await runBoxesTransferData(clientDB2);
        await runOtherTransferData();
    } catch (err) {
        console.error('Error during data transfer:', err);
    } finally {
        await clientDB2.end();
    }
}

// Schedule the data transfer process to run at 12 AM every day 
cron.schedule('*/25 * * * * *', () => {
    console.log('-                                                  -');
    console.log('Running data transfer process at 12 AM every day...');
    runAllTransfers();
});
