const mysql = require('mysql2/promise');

const mysqlConnection = mysql.createPool({
  host: process.env.BK_HOST,
  user: process.env.BK_USERNAME,
  password: process.env.BK_PASSWORD,
  database: process.env.BK_NAME,
  port: process.env.BK_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = mysqlConnection;
