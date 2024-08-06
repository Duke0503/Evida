const client = require('../config/database');

async function check_table_time() {
  try {
    // Check if the table_time table exists
    const check_table_query = `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'table_time'
      );
    `;
    const res = await client.query(check_table_query);

    if (!res.rows[0].exists) {
      // If the table does not exist, create it
      const create_table_query = `
        CREATE TABLE public.table_time (
          id SERIAL PRIMARY KEY,
          time_ TIMESTAMP NOT NULL
        );
      `;
      await client.query(create_table_query);
    }
    
  } catch (err) {
    console.error("Error ensuring table 'table_time' exists:", err);
  };
}

async function get_min_start_time() {
  try {
    // Query to get minimum merged_start_time truncated to 0 hour 0 minute 0 second
    const query = `
      SELECT DATE_TRUNC('day', MIN(merged_start_time)) AS min_start_time
      FROM valid_transaction;
    `;
    const result = await client.query(query);

    const min_start_time = result.rows[0].min_start_time;

    return min_start_time;
  } catch (err) {
    console.error('Error executing query:', err.message);
  };
}

async function insert_time_records() {
  try {
    await check_table_time(); // Ensure table_time exists before proceeding

    const min_start_time = await get_min_start_time(); // Get minStartTime from getMinStartTime function

    // Query to get maximum time from table_time (if any)
    const max_time_query = 'SELECT MAX(time_) AS max_time FROM table_time;';
    const max_time_result = await client.query(max_time_query);
    let max_time = max_time_result.rows[0].max_time || min_start_time; // Use minStartTime if no data

    const current_time = new Date();

    const create_index_query = `
      DO $$
      BEGIN
          -- Check if the index already exists before creating it
          IF NOT EXISTS (
              SELECT 1 
              FROM pg_indexes 
              WHERE tablename = 'table_time' 
              AND indexname = 'idx_table_time_time_'
          ) THEN
              CREATE INDEX idx_table_time_time_ ON table_time (time_);
          END IF;
      END $$;
    `;

    // If maxTime is equal to minStartTime, insert minStartTime into table_time
    if (max_time.getTime() === min_start_time.getTime()) {
      const insert_min_time_query = 'INSERT INTO table_time (time_) VALUES ($1);';
      await client.query('BEGIN');
      await client.query(insert_min_time_query, [min_start_time]);
      await client.query(create_index_query);
      await client.query('COMMIT');
      max_time = new Date(min_start_time); // Set maxTime to minStartTime to start the loop
    }

    // Loop to insert records with 1-hour intervals until exceeding current time
    while (max_time <= current_time) {
      max_time.setMinutes(max_time.getMinutes() + 60); // Add 1 hour
      if (max_time > current_time) {
        break; // Exit loop if maxTime exceeds currentTime
      }
      // Insert into table_time
      const insert_query = 'INSERT INTO table_time (time_) VALUES ($1);';
      await client.query('BEGIN');
      await client.query(insert_query, [max_time]);
      await client.query(create_index_query);
      await client.query('COMMIT');
    }
  } catch (err) {
    console.error('Error inserting or querying:', err);
  } 
};

module.exports = {
  insert_time_records,
};
