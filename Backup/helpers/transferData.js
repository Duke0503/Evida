const postgresClient = require('../config/postgres-config.js');
const mysqlConnection = require('../config/mysql-config.js');
const getLastRowCreatedAt = require('./getLastRowCreatedAt.js');

const BATCH_SIZE = 1000; // Number of rows to transfer in each batch

const transferData = async (tableName, queryFields) => {
  try {
    const lastCreatedAt = await getLastRowCreatedAt(tableName);
    console.log(`Last created_at in ${tableName}:`, lastCreatedAt);

    let offset = 0;
    let hasMoreData = true;

    while (hasMoreData) {
      // Construct PostgreSQL query
      const postgresQuery = `
        SELECT ${queryFields.map(field => field === 'created_at' || field === 'updated_at' || field === 'timestamp' ? `CAST(${field} AS TEXT) AS ${field}` : field).join(', ')}
        FROM ${tableName.split('.').pop()}  -- Get the table name without schema prefix
        WHERE created_at > $1
        ORDER BY created_at ASC
        LIMIT $2 OFFSET $3
      `;

      const { rows: data } = await postgresClient.query(postgresQuery, [lastCreatedAt, BATCH_SIZE, offset]);
   
      if (data.length > 0) {
        // Prepare MySQL insert query
        const columns = queryFields;
        const values = data.map(row => 
          columns.map(column => {
            const value = row[column];
            // Handle different types of values
            if (typeof value === 'string' && ((column === 'updated_at') || (column === 'created_at') || (column === 'timestamp') )) {
           return value.endsWith('+00') ? value.slice(0, -3) : value; 
            } else if (typeof value === 'string') {
              return value.replace(/'/g, "''"); // Escape single quotes
            } else if (Number.isNaN(value) || value === undefined) {
              return null; // Use null for NaN or undefined values
            } else if (value === null) {
              return 'DEFAULT'; // Use DEFAULT for null values
            } else {
              return value;
            }
          })
        );

        const placeholders = values.map(
          () => `(${columns.map(() => `?`).join(', ')})`
        ).join(', ');

        const insertQuery = `
          INSERT INTO ${tableName} (${columns.join(', ')})
          VALUES ${placeholders}
          ON DUPLICATE KEY UPDATE
          ${columns.map(column => `${column} = VALUES(${column})`).join(', ')}
        `;

        // Flatten values array for MySQL query
        const flattenedValues = values.flat().map(v => (v === 'DEFAULT' ? null : v));
        
        // Execute MySQL insert query
        await mysqlConnection.query(insertQuery, flattenedValues);

        console.log(`Transferred ${data.length} rows to ${tableName} in the backup database.`);
        offset += BATCH_SIZE;
      } else {
        hasMoreData = false;
        console.log(`No more data to transfer for ${tableName}.`);
      }
    }
  } catch (err) {
    console.error(`Error during data transfer for ${tableName}:`, err);
  }
};

module.exports = transferData;
