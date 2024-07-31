const mysqlConnection = require('../config/mysql-config'); // MySQL connection

const checkAndCreateOutletDataTable = async () => {
  try {
    const connection = await mysqlConnection;

    // Check if the table exists
    const [rows] = await connection.query(`
      SELECT COUNT(*) AS count 
      FROM information_schema.tables 
      WHERE table_schema = 'eboost-analytics-db'
      AND table_name = 'outlet_data'
    `);

    if (rows[0].count === 0) {
      // Create the table if it does not exist
      await connection.query(`
        CREATE TABLE \`eboost-analytics-db\`.outlet_data (
          id BIGINT NOT NULL AUTO_INCREMENT,
          ebox_id TEXT,
          ebox_name TEXT,
          box_status TEXT,
          outlet_id INT,
          outlet_status INT,
          system_status INT,
          timestamp TIMESTAMP(6),
          user_id INT,
          user_name TEXT,
          outlet_current REAL,
          current_external_meter REAL,
          outlet_voltage REAL,
          voltage_external_meter REAL,
          power_factor REAL,
          power_consumption REAL, 
          created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6),
          updated_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
          PRIMARY KEY (id)
        );
      `);
      console.log('Table outlet_data created in MySQL eboost-analytics-db database');

      // Create index on created_at
      await connection.query(`
        CREATE INDEX idx_created_at ON \`eboost-analytics-db\`.outlet_data (created_at);
      `);
      // console.log('Index on created_at created in outlet_data table');
    } else {
      // console.log('Table outlet_data already exists in MySQL eboost-analytics-db database');

      // Check if the index already exists
      const [indexRows] = await connection.query(`
        SELECT COUNT(*) AS count
        FROM information_schema.statistics
        WHERE table_schema = 'eboost-analytics-db'
        AND table_name = 'outlet_data'
        AND index_name = 'idx_created_at'
      `);

      if (indexRows[0].count === 0) {
        // Create index on created_at if it does not exist
        await connection.query(`
          CREATE INDEX idx_created_at ON \`eboost-analytics-db\`.outlet_data (created_at);
        `);
        // console.log('Index on created_at created in outlet_data table');
      } else {
        // console.log('Index on created_at already exists in outlet_data table');
      }
    }
  } catch (err) {
    console.error('Error during checking or creating outlet_data table:', err);
  }
};

module.exports = checkAndCreateOutletDataTable;
