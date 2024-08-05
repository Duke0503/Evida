const mysqlConnection = require('../config/mysql-config'); // MySQL connection

const checkAndCreatePowerConsumptionTable = async () => {
  try {
    const connection = await mysqlConnection;

    // Check if the table exists
    const [rows] = await connection.query(`
      SELECT COUNT(*) AS count 
      FROM information_schema.tables 
      WHERE table_schema = 'eboost-analytics-db' 
      AND table_name = 'power_consumption'
    `);

    if (rows[0].count === 0) {
      // Create the table if it does not exist
      await connection.query(`
        CREATE TABLE \`eboost-analytics-db\`.power_consumption (
          id BIGINT NOT NULL AUTO_INCREMENT,
          ebox_id TEXT,
          ebox_name TEXT,
          outlet_0_status INT,
          outlet_1_status INT,
          outlet_2_status INT,
          outlet_3_status INT,
          outlet_4_status INT,
          outlet_5_status INT,
          outlet_6_status INT,
          outlet_7_status INT,
          outlet_8_status INT,
          outlet_9_status INT,
          ebox_status TEXT,
          power_consumption REAL,
          pme_value REAL,
          timestamp TIMESTAMP(6),
          created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6),
          updated_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
          PRIMARY KEY (id)
        );
      `);
      console.log('Table power_consumption created in MySQL eboost-analytics-db database');

      // Create index on created_at
      await connection.query(`
        CREATE INDEX idx_created_at ON \`eboost-analytics-db\`.power_consumption (created_at);
      `);
      // console.log('Index on created_at created in power_consumption table');
    } else {
      // console.log('Table power_consumption already exists in MySQL eboost-analytics-db database');

      // Check if the index already exists
      const [indexRows] = await connection.query(`
        SELECT COUNT(*) AS count
        FROM information_schema.statistics
        WHERE table_schema = 'eboost-analytics-db'
        AND table_name = 'power_consumption'
        AND index_name = 'idx_created_at'
      `);

      if (indexRows[0].count === 0) {
        // Create index on created_at if it does not exist
        await connection.query(`
          CREATE INDEX idx_created_at ON \`eboost-analytics-db\`.power_consumption (created_at);
        `);
        // console.log('Index on created_at created in power_consumption table');
      } else {
        // console.log('Index on created_at already exists in power_consumption table');
      }
    }
  } catch (err) {
    // console.error('Error during checking or creating power_consumption table:', err);
  }
};

module.exports = checkAndCreatePowerConsumptionTable;
