const client = require('../config/database');

const box_hour_analysis = async () => {
  try {
    await client.query(`      
DROP TABLE IF EXISTS public.box_hour_analysis;

CREATE TABLE IF NOT EXISTS public.box_hour_analysis
(
    id SERIAL PRIMARY KEY,
	box_id text,
    time_ timestamp without time zone,
    number_of_transaction_events integer
);

DO $$
DECLARE 
    max_time TIMESTAMP;
BEGIN

    -- Get the maximum time from the table_time
    SELECT MAX(time_) INTO max_time FROM public.table_time;

    -- Common Table Expressions (CTEs)
    WITH status_charging AS (
        SELECT 
            Trans.box_id,
            Trans.merged_start_time AS new_time_start,
            Trans.merged_end_time AS new_time_end,
            Trans.time_charging,
            TB.id,
            TB.time_
        FROM public.hours_transaction Trans
        JOIN public.table_time TB
            ON Trans.time_charging < 86400 
            AND TB.time_ BETWEEN Trans.merged_start_time AND COALESCE(Trans.merged_end_time, max_time)
        WHERE CAST(SUBSTRING(Trans.box_id FROM '[0-9]+') AS INTEGER) >= 10
    ),
    box_analyst AS (
        SELECT 
            SG.box_id,
            SG.time_,    
            COUNT(SG.id) AS charging_count
        FROM status_charging SG
        GROUP BY SG.box_id, SG.time_
    )
	
	INSERT INTO public.box_hour_analysis (box_id, time_, number_of_transaction_events)
    SELECT 
       box_id,
	   time_,
	   charging_count
	FROM box_analyst;
END $$;
      `);
    console.log("Table box_hour_analysis created and data inserted successfully.");
  } catch (err) {
      console.error('Error executing queries', err);
  }
};

module.exports = {
  box_hour_analysis
};