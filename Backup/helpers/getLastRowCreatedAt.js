const mysqlConnection = require('../config/mysql-config.js'); // MySQL connection

const getLastRowCreatedAt = async (tableName) => {
  try {
    const connection = await mysqlConnection;

    const [rows] = await connection.query(`
      SELECT IFNULL(MAX(created_at), '1970-01-01 00:00:00') AS lastCreatedAt 
      FROM ${tableName}
    `);

    return rows[0].lastCreatedAt;
  } catch (err) {
    console.error(`Error getting the last created_at from ${tableName}:`, err);
    throw err;
  }
};

module.exports = getLastRowCreatedAt;
