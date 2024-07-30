const client = require('../config/database');

const valid_transaction = async () => {
  try {
    await client.query(`

DROP TABLE IF EXISTS public.valid_transaction;

CREATE TABLE public.valid_transaction AS
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
    AND CAST(SUBSTRING(box_id FROM '[0-9]+') AS INTEGER) >= 10
	  AND status = true;

ALTER TABLE public.valid_transaction
    ADD CONSTRAINT merge_time_trans_pkey PRIMARY KEY (id, invoice_id),
    ALTER COLUMN invoice_id SET NOT NULL,
    ALTER COLUMN merged_start_time SET DATA TYPE timestamp with time zone,
    ALTER COLUMN merged_end_time SET DATA TYPE timestamp with time zone,
    ALTER COLUMN box_id SET DATA TYPE text COLLATE pg_catalog."default",
    ALTER COLUMN outlet_id SET DATA TYPE text COLLATE pg_catalog."default",
    ALTER COLUMN reason_closed SET DATA TYPE text COLLATE pg_catalog."default";
    
CREATE INDEX valid_merged_start_time_idx ON valid_transaction(merged_start_time);
      `)
    console.log("Table valid_transaction created and data inserted successfully.");
  } catch (err) {
      console.error('Error executing queries', err);
  };
}

module.exports = { valid_transaction };