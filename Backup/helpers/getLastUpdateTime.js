const defaultDateTime = '1970-01-01 00:00:00';

const getLastUpdateTime = async (tableName, clientDB2) => {
    try {
        // Check if there is any data in DB2
        const checkQuery = `
            SELECT COUNT(*) AS count
            FROM ${tableName}
        `;
        const checkRes = await clientDB2.query(checkQuery);

        if (checkRes.rows.length > 0 && parseInt(checkRes.rows[0].count) > 0) {
            // DB2 has data, fetch the last update time
            const res = await clientDB2.query(`
                SELECT GREATEST(MAX(created_at), MAX(updated_at)) AS last_update_time 
                FROM ${tableName}
            `);

            return res.rows.length ? res.rows[0].last_update_time : null;
        } else {
            // DB2 has no data, set default last update time
            return defaultDateTime;
        }
    } catch (err) {
        console.error(`Error fetching last update time from table ${tableName}:`, err);
        throw err;
    }
};

module.exports = getLastUpdateTime;
