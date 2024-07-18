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
      console.log("Table 'table_time' created successfully.");
    } else {
      console.log("Table 'table_time' already exists.");
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

    console.log('Min Start Time (truncated to 00:00:00):', min_start_time);

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

    // If maxTime is equal to minStartTime, insert minStartTime into table_time
    if (max_time.getTime() === min_start_time.getTime()) {
      const insert_min_time_query = 'INSERT INTO table_time (time_) VALUES ($1);';
      await client.query(insert_min_time_query, [min_start_time]);
      max_time = new Date(min_start_time); // Set maxTime to minStartTime to start the loop
    }

    // Loop to insert records with 15-minute intervals until exceeding current time
    while (max_time <= current_time) {
      max_time.setMinutes(max_time.getMinutes() + 15); // Add 15 minutes
      if (max_time > current_time) {
        break; // Exit loop if maxTime exceeds currentTime
      }
      // Insert into table_time
      const insert_query = 'INSERT INTO table_time (time_) VALUES ($1);';
      await client.query(insert_query, [max_time]);
    }
  } catch (err) {
    console.error('Error inserting or querying:', err);
  } 
};

module.exports = {
  insert_time_records,
};
