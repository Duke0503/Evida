const client = require('../config/database');

const hour_analysis = async () => {
  try {
    await client.query(`

DROP TABLE IF EXISTS public.hours_transaction;

CREATE TABLE public.hours_transaction AS
SELECT
    id,
    invoice_id,
    start_date + start_time AS merged_start_time,
    end_date + end_time AS merged_end_time,
	EXTRACT(EPOCH FROM (end_date + end_time) - (start_date + start_time)) AS time_charging,
    user_id,
    box_id,
    outlet_id,
    wattage_consumed,
    total_fee,
    status,
    discount_amount,
    promotion_code,
    promotion_discount,
    activation_fee,
    paid,
    total_consumed_fee,
    reason_closed,
    created_at,
    updated_at
FROM public.transactions
WHERE
    (wattage_consumed > 0.005
    OR wattage_consumed > 0.001 AND total_consumed_fee > 0)
    AND CAST(SUBSTRING(box_id FROM '[0-9]+') AS INTEGER) >= 10;

ALTER TABLE public.hours_transaction
    ADD CONSTRAINT merge_time_hour_trans_pkey PRIMARY KEY (id, invoice_id),
    ALTER COLUMN invoice_id SET NOT NULL,
    ALTER COLUMN merged_start_time SET DATA TYPE timestamp with time zone,
    ALTER COLUMN merged_end_time SET DATA TYPE timestamp with time zone,
    ALTER COLUMN box_id SET DATA TYPE text COLLATE pg_catalog."default",
    ALTER COLUMN outlet_id SET DATA TYPE text COLLATE pg_catalog."default",
    ALTER COLUMN reason_closed SET DATA TYPE text COLLATE pg_catalog."default";

CREATE INDEX hour_merged_start_time_idx ON hours_transaction(merged_start_time);


DROP TABLE IF EXISTS public.hour_analysis;

CREATE TABLE IF NOT EXISTS public.hour_analysis
(
    id SERIAL PRIMARY KEY,
    time_ timestamp with time zone,
    active_user integer,
    box_charging_largest integer,
    box_id text,
    box_name text
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
            AH.time_,
            AH.active_user,
            AH.box_charging_largest,
            BA.box_id,
            ROW_NUMBER() OVER (PARTITION BY AH.time_, AH.box_charging_largest ORDER BY random()) AS rn
        FROM analyst_tmp AS AH
        LEFT JOIN box_analyst AS BA 
            ON AH.time_ = BA.time_ 
            AND AH.box_charging_largest = BA.charging_count
    )

    -- Insert into the hour_analysis table
    INSERT INTO public.hour_analysis (time_, active_user, box_charging_largest, box_id, box_name)
    SELECT 
        CTE.time_,
        CTE.active_user,
        CTE.box_charging_largest,
        CTE.box_id,
        B.box_name
    FROM cte
    LEFT JOIN public.boxes B
        ON CTE.box_id = B.box_id
    WHERE rn = 1
    ORDER BY CTE.time_ DESC;

END $$;

DROP TABLE IF EXISTS public.hour_analysis_average;

CREATE TABLE hour_analysis_average AS (
	SELECT 
	    (EXTRACT(HOUR FROM time_) + 1) % 24 AS "Hour",
	    SUM(active_user) / COUNT(DISTINCT DATE(time_ )) AS "average active users"
	FROM hour_analysis
	WHERE 
	    EXTRACT(YEAR FROM time_) = EXTRACT(YEAR FROM CURRENT_DATE)
	    AND EXTRACT(MONTH FROM time_) = EXTRACT(MONTH FROM CURRENT_DATE) - 1
	GROUP BY (EXTRACT(HOUR FROM time_) + 1) % 24
)
    
      `);
      console.log("Table hour_analysis created and data inserted successfully.");
  } catch (err) {
      console.error('Error executing queries', err);
  };
};

module.exports = {
  hour_analysis,
}