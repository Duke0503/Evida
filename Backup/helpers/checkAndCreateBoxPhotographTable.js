const mysqlConnection = require('../config/mysql-config'); // MySQL connection

const checkAndCreateBoxPhotographTable = async () => {
  try {
    const connection = await mysqlConnection;

    // Check if the table exists
    const [rows] = await connection.query(`
      SELECT COUNT(*) AS count 
      FROM information_schema.tables 
      WHERE table_schema = 'eboost-analytics-db'
      AND table_name = 'box_photograph'
    `);

    if (rows[0].count === 0) {
      // Create the table if it does not exist
      await connection.query(`
        CREATE TABLE \`eboost-analytics-db\`.box_photograph (
           id BIGINT NOT NULL AUTO_INCREMENT,
          box_id TEXT,
          location_name TEXT,
          box_connection TEXT,
          outlet_number INT,
          outlet_status INT,
          command INT,
          timestamp TIMESTAMP(6),
          user_id INT,
          user_name TEXT,
          outlet_current REAL,
          external_meter_current REAL,
          outlet_voltage REAL,
          external_meter_voltage REAL,
          outlet_power_factor REAL,
          outlet_power_consumption REAL, 
          created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6),
          updated_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
          PRIMARY KEY (id)
        );
      `);
      console.log('Table box_photograph created in MySQL eboost-analytics-db database');

      // Create index on created_at
      await connection.query(`
        CREATE INDEX idx_created_at ON \`eboost-analytics-db\`.box_photograph (created_at);
      `);

    } else {

      // Check if the index already exists
      const [indexRows] = await connection.query(`
        SELECT COUNT(*) AS count
        FROM information_schema.statistics
        WHERE table_schema = 'eboost-analytics-db'
        AND table_name = 'box_photograph'
        AND index_name = 'idx_created_at'
      `);

      if (indexRows[0].count === 0) {
        // Create index on created_at if it does not exist
        await connection.query(`
          CREATE INDEX idx_created_at ON \`eboost-analytics-db\`.box_photograph (created_at);
        `);
      }
    }
  } catch (err) {
    console.error('Error during checking or creating box_photograph table:', err);
  }
};

module.exports = checkAndCreateBoxPhotographTable;
