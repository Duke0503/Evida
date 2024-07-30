const client = require('../config/database');

const invoice_analysis = async () => {
  try {
    await client.query(`
DROP TABLE IF EXISTS public.invoice_analysis;

WITH tmp AS (
    SELECT 
        invoice_id,
        merged_start_time AS new_time_start,
        merged_end_time AS new_time_end,
        user_id,
        box_id,
        outlet_id,
        CASE 
        	WHEN (activation_fee + total_consumed_fee) > 0 THEN ROUND(activation_fee::numeric / (activation_fee::numeric + total_consumed_fee::numeric) * 100, 2) 
        	ELSE NULL 
    	END AS active_fee_percent,
		CASE 
			WHEN (activation_fee + total_consumed_fee)  > 0 THEN ROUND(total_consumed_fee::numeric / (activation_fee::numeric + total_consumed_fee::numeric) * 100, 2) 
			ELSE NULL 
		END AS kwh_fee_percent
		
    FROM public.valid_transaction
),
tmp2 AS (
    SELECT 
        EXTRACT(YEAR FROM tmp.new_time_start) AS year_,
        LPAD(EXTRACT(MONTH FROM tmp.new_time_start)::TEXT, 2, '0') AS month_,
        DATE_TRUNC('month', tmp.new_time_start) AS time_,
        SUM(CASE WHEN tmp.active_fee_percent < 20 THEN 1 ELSE 0 END) AS invoice_act_fee_lt_20,
        SUM(CASE WHEN tmp.active_fee_percent BETWEEN 20 AND 50 THEN 1 ELSE 0 END) AS invoice_act_fee_20_to_50,
        SUM(CASE WHEN tmp.active_fee_percent > 50 THEN 1 ELSE 0 END) AS invoice_act_fee_gt_50,
		SUM(CASE WHEN tmp.active_fee_percent is NULL THEN 1 ELSE 0 END) as invoice_free
    FROM tmp
    GROUP BY 
        EXTRACT(YEAR FROM tmp.new_time_start),
        LPAD(EXTRACT(MONTH FROM tmp.new_time_start)::TEXT, 2, '0'),
        DATE_TRUNC('month', tmp.new_time_start) 
),
tmp3 AS (
    SELECT 
        tmp2.*,
        ROUND(tmp2.invoice_act_fee_lt_20::numeric / (tmp2.invoice_act_fee_lt_20 + tmp2.invoice_act_fee_gt_50 + tmp2.invoice_act_fee_20_to_50 + tmp2.invoice_free) * 100, 2) AS percent_invoice_lt_20,
        ROUND(tmp2.invoice_act_fee_20_to_50::numeric / (tmp2.invoice_act_fee_lt_20 + tmp2.invoice_act_fee_gt_50 + tmp2.invoice_act_fee_20_to_50+ tmp2.invoice_free) * 100, 2) AS percent_invoice_20_to_50,
        ROUND(tmp2.invoice_act_fee_gt_50::numeric / (tmp2.invoice_act_fee_lt_20 + tmp2.invoice_act_fee_gt_50 + tmp2.invoice_act_fee_20_to_50+ tmp2.invoice_free) * 100, 2) AS percent_invoice_gt_50,
    	ROUND(tmp2.invoice_free::numeric / (tmp2.invoice_act_fee_lt_20 + tmp2.invoice_act_fee_gt_50 + tmp2.invoice_act_fee_20_to_50+ tmp2.invoice_free) * 100, 2) AS percent_invoice_free
	FROM tmp2
)
SELECT * 
INTO public.invoice_analysis
FROM tmp3;

      `);
      console.log("Table invoice_analysis created and data inserted successfully.");
  } catch (err) {
      console.error('Error executing queries', err);
  };
};

module.exports = {
  invoice_analysis,
}