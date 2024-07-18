const client = require('../config/database');

const hour_analysis = async () => {
  try {
    await client.query(`

DROP TABLE IF EXISTS public.hour_analysis;

CREATE TABLE IF NOT EXISTS public.hour_analysis
(
    id SERIAL PRIMARY KEY,
    time_ timestamp without time zone,
    active_user integer,
    box_charging_largest integer,
    box_id text
);
      
DO $$
DECLARE 
    max_time TIMESTAMP;
BEGIN

    SELECT MAX(time_) INTO max_time FROM public.table_time;

    WITH status_charging AS (
        SELECT 
            Trans.box_id,
            Trans.merged_start_time AS new_time_start,
            Trans.merged_end_time AS new_time_end,
            Trans.time_charging,
            TB.id,
            TB.time_
        FROM public.valid_transaction Trans, public.table_time TB
        WHERE    Trans.time_charging < 86400 AND TB.time_ BETWEEN Trans.merged_start_time AND COALESCE(Trans.merged_end_time, max_time)
        AND CAST(SUBSTRING(box_id FROM '[0-9]+') AS INTEGER) >= 10
    ),
    box_analyst AS (
        SELECT 
            SG.box_id,
            SG.time_,
            COUNT(SG.id) AS charging_count
        FROM status_charging SG
        GROUP BY SG.box_id, SG.time_
    ),
    analyst_tmp AS (
        SELECT 
            BA.time_,
            SUM(BA.charging_count) AS active_user,
            MAX(BA.charging_count) AS box_charging_largest
        FROM box_analyst BA
        GROUP BY BA.time_
    ),
    cte AS (
        SELECT 
            AH.*,
            BA.box_id,
            ROW_NUMBER() OVER (PARTITION BY AH.time_, AH.box_charging_largest ORDER BY random()) AS rn
        FROM analyst_tmp AS AH
        LEFT JOIN box_analyst AS BA 
            ON AH.time_ = BA.time_ 
            AND AH.box_charging_largest = BA.charging_count
    )

    INSERT INTO public.hour_analysis (time_, active_user, box_charging_largest, box_id)
    SELECT 
        CTE.time_,
        CTE.active_user,
        CTE.box_charging_largest,
        CTE.box_id
    FROM cte
    WHERE rn = 1
    ORDER BY CTE.time_ DESC;

END $$;

      `);
      console.log("Table hour_analysis created and data inserted successfully.");
  } catch (err) {
      console.error('Error executing queries', err);
  };
};

module.exports = {
  hour_analysis,
}