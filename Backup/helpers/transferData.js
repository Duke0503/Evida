const { Client } = require('pg');
const { dbConfig, db2Config } = require('../config/database');
const getLastRowId = require('./getLastRowId');

async function transferData(tableName) {
    const clientDB1 = new Client(dbConfig);
    const clientDB2 = new Client(db2Config);

    try {
        await clientDB1.connect();
        await clientDB2.connect();

        // Lấy id dòng cuối cùng trong DB2
        const lastRowId = await getLastRowId(tableName, clientDB2);
        console.log(`Last row ID in ${tableName}: ${lastRowId}`);

        // Lấy dữ liệu từ DB1 bắt đầu từ id lớn hơn lastRowId
        const query = `SELECT * FROM ${tableName} WHERE id > $1`;
        const res = await clientDB1.query(query, [lastRowId]);

        if (res.rows.length > 0) {
            // Chèn dữ liệu vào DB2
            for (const row of res.rows) {
                const columns = Object.keys(row).join(', ');
                const values = Object.values(row).map(value => {
                    if (value instanceof Date) {
                        return `'${value.toISOString()}'`;
                    } else if (typeof value === 'string') {
                        return `'${value.replace(/'/g, "''")}'`; // Escape single quotes
                    } else if (value === null) {
                        return 'DEFAULT'; // Use DEFAULT for null values
                    } else {
                        return value;
                    }
                }).join(', ');

                const insertQuery = `INSERT INTO ${tableName} (${columns}) OVERRIDING SYSTEM VALUE VALUES (${values})`;
                await clientDB2.query(insertQuery);
            }
            console.log(`Data from ${tableName} in DB1 transferred to ${tableName} in DB2 successfully.`);
        } else {
            console.log(`No new data found in ${tableName} to transfer.`);
        }
    } catch (err) {
        console.error(`Error transferring data from ${tableName}:`, err);
    } finally {
        await clientDB1.end();
        await clientDB2.end();
    }
}

module.exports = transferData;
