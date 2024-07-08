const { Client } = require('pg');
const { dbConfig, db2Config } = require('../config/database');

async function transferBoxesData(tableName, getLastUpdateTime) {
    const clientDB1 = new Client(dbConfig);
    const clientDB2 = new Client(db2Config);
     
    try {
        await clientDB1.connect();
        await clientDB2.connect();

        const lastUpdateTime = await getLastUpdateTime(tableName, clientDB2);
        console.log('Last update time in boxes:', lastUpdateTime);

        const query = `
            SELECT *
            FROM ${tableName}
            WHERE created_at > $1 OR updated_at >$1
        `;
     

        const res = await clientDB1.query(query, [lastUpdateTime]);

        if (res.rows.length > 0) {
            for (const row of res.rows) {
                const columns = Object.keys(row);
                const values = Object.values(row);

                const setClause = columns.map((col, idx) => `${col} = $${idx + 2}`).join(', ');

                const checkQuery = `
                    SELECT *
                    FROM ${tableName}
                    WHERE box_id = $1
                `;
         

                const checkRes = await clientDB2.query(checkQuery, [row.box_id]);

                if (checkRes.rows.length > 0) {
                    const updateQuery = `
                        UPDATE ${tableName}
                        SET ${setClause}
                        WHERE box_id = $1
                    `;
                  

                    await clientDB2.query(updateQuery, [row.box_id, ...values]);
                   
                    // console.log(`Data for user_id ${row.user_id} updated in ${tableName} in DB2.`);
                } else {
                    const insertQuery = `
                        INSERT INTO ${tableName} (${columns.join(', ')})
                        VALUES (${columns.map((_, idx) => `$${idx + 1}`).join(', ')})
                    `;
             

                    await clientDB2.query(insertQuery, values);
                    // console.log(`New data for user_id ${row.user_id} inserted into ${tableName} in DB2.`);
                }
            }
          console.log(`Have new or updated data found in ${tableName} to transfer.`);
        } else {
            console.log(`No new or updated data found in ${tableName} to transfer.`);
        }
    } catch (err) {
        console.error(`Error transferring data for ${tableName}:`, err);
    } finally {
        await clientDB1.end();
        await clientDB2.end();
    }
}

module.exports = transferBoxesData;
