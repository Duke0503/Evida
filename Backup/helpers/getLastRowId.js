const { Client } = require('pg');
const { db2Config } = require('../config/database');

const getLastRowId = async (tableName, clientDB2) => {
    try {
        const res = await clientDB2.query(`SELECT id FROM ${tableName} ORDER BY id DESC LIMIT 1`);
        return res.rows.length ? res.rows[0].id : 0;
    } catch (err) {
        console.error(`Error fetching last row id from table ${tableName}: ${err}`);
        throw err;
    }
};

module.exports = getLastRowId;
