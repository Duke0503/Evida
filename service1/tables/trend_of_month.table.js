const client = require('../config/database');

const trend_of_month = async () => {
  try {
    await client.query(`

DROP TABLE IF EXISTS public.trend_of_month;

WITH trend_of_month AS (
    SELECT
        EXTRACT(YEAR FROM merged_start_time) AS year_,
        LPAD(EXTRACT(MONTH FROM merged_start_time)::text, 2, '0') AS month_,
        DATE_TRUNC('month', merged_start_time) + INTERVAL '1 month - 1 day' AS time_,
        COUNT(DISTINCT user_id) AS total_user_on_month,
        SUM(paid) AS total_w_o_revenue,
        SUM(promotion_discount) AS total_promotion,
        COUNT(CASE WHEN promotion_discount > 0 THEN 1 ELSE NULL END) AS count_promotion,
        SUM(paid) AS total_cost_vnd,
        COUNT(invoice_id) AS total_transaction,
        SUM(wattage_consumed) AS total_power,
        COUNT(DISTINCT box_id) AS number_box_active,
        COUNT(DISTINCT outlet_id) AS count_outlet
    FROM public.valid_transaction
    WHERE EXTRACT(MONTH FROM merged_start_time) IN (
        SELECT DISTINCT EXTRACT(MONTH FROM merged_start_time)
        FROM public.valid_transaction
    )
    AND EXTRACT(YEAR FROM merged_start_time) IN (
        SELECT DISTINCT EXTRACT(YEAR FROM merged_start_time)
        FROM public.valid_transaction
    )
    GROUP BY year_, month_, time_
)
SELECT
     time_::DATE AS time_current,
    total_user_on_month AS total_active_user,
    number_box_active,
    count_outlet,
    total_transaction,
    total_power,
    total_w_o_revenue,
    count_promotion AS count_discount,
    total_promotion AS discount,
    total_cost_vnd,
    LAG(time_, 1) OVER (ORDER BY time_) AS previous_month,
    LAG(total_user_on_month, 1) OVER (ORDER BY time_) AS user_prev,
    total_user_on_month - LAG(total_user_on_month, 1) OVER (ORDER BY time_) AS user_compare,
    ROUND(CAST((total_user_on_month - LAG(total_user_on_month, 1) OVER (ORDER BY time_)) AS NUMERIC), 3) * 100 / total_user_on_month AS percentage_user_compare,
    LAG(number_box_active, 1) OVER (ORDER BY time_) AS box_prev_month,
    number_box_active - LAG(number_box_active, 1) OVER (ORDER BY time_) AS box_compare,
    ROUND(CAST((number_box_active - LAG(number_box_active, 1) OVER (ORDER BY time_)) AS NUMERIC), 3) * 100 / number_box_active AS percentage_box_compare,
    LAG(count_outlet, 1) OVER (ORDER BY time_) AS outlet_prev,
    count_outlet - LAG(count_outlet, 1) OVER (ORDER BY time_) AS outlet_compare,
    ROUND(CAST((count_outlet - LAG(count_outlet, 1) OVER (ORDER BY time_)) AS NUMERIC), 3) * 100 / count_outlet AS percentage_outlet_compare,
    LAG(total_transaction, 1) OVER (ORDER BY time_) AS trans_prev_month,
    total_transaction - LAG(total_transaction, 1) OVER (ORDER BY time_) AS trans_compare,
    ROUND(CAST((total_transaction - LAG(total_transaction, 1) OVER (ORDER BY time_)) AS NUMERIC), 3) * 100 / total_transaction AS percentage_trans_compare,
    LAG(total_power, 1) OVER (ORDER BY time_) AS power_prev_month,
    total_power - LAG(total_power, 1) OVER (ORDER BY time_) AS power_compare,
    ROUND(CAST((total_power - LAG(total_power, 1) OVER (ORDER BY time_)) AS NUMERIC), 3) * 100 / total_power AS percentage_power_compare,
    LAG(total_w_o_revenue, 1) OVER (ORDER BY time_) AS cost_w_o_prev,
    total_w_o_revenue - LAG(total_w_o_revenue, 1) OVER (ORDER BY time_) AS cost_w_o_compare,
    ROUND(CAST((total_w_o_revenue - LAG(total_w_o_revenue, 1) OVER (ORDER BY time_)) AS NUMERIC), 3) * 100 / total_w_o_revenue AS percentage_cost_w_o_compare,
    LAG(count_promotion, 1) OVER (ORDER BY time_) AS nb_discount_prev,
    count_promotion - LAG(count_promotion, 1) OVER (ORDER BY time_) AS nb_discount_compare,
    ROUND(CAST((count_promotion - LAG(count_promotion, 1) OVER (ORDER BY time_)) AS NUMERIC), 3) * 100 / count_promotion AS percentage_nb_discount_compare,
    LAG(total_promotion, 1) OVER (ORDER BY time_) AS discount_prev,
    total_promotion - LAG(total_promotion, 1) OVER (ORDER BY time_) AS discount_compare,
    ROUND(CAST((total_promotion - LAG(total_promotion, 1) OVER (ORDER BY time_)) AS NUMERIC), 3) * 100 / total_promotion AS percentage_discount_compare,
    LAG(total_cost_vnd, 1) OVER (ORDER BY time_) AS cost_prev,
    total_cost_vnd - LAG(total_cost_vnd, 1) OVER (ORDER BY time_) AS cost_compare,
    ROUND(CAST((total_cost_vnd - LAG(total_cost_vnd, 1) OVER (ORDER BY time_)) AS NUMERIC), 3) * 100 / total_cost_vnd AS percentage_cost_compare,
    CASE 
        WHEN total_user_on_month > LAG(total_user_on_month, 1) OVER (ORDER BY time_) THEN 'UP'
        WHEN total_user_on_month = LAG(total_user_on_month, 1) OVER (ORDER BY time_) THEN 'BREAK'
        WHEN total_user_on_month < LAG(total_user_on_month, 1) OVER (ORDER BY time_) THEN 'DOWN'
        ELSE NULL END AS diff_user,
    CASE 
        WHEN number_box_active > LAG(number_box_active, 1) OVER (ORDER BY time_) THEN 'UP'
        WHEN number_box_active = LAG(number_box_active, 1) OVER (ORDER BY time_) THEN 'BREAK'
        WHEN number_box_active < LAG(number_box_active, 1) OVER (ORDER BY time_) THEN 'DOWN'
        ELSE NULL END AS diff_box,
    CASE 
        WHEN count_outlet > LAG(count_outlet, 1) OVER (ORDER BY time_) THEN 'UP'
        WHEN count_outlet = LAG(count_outlet, 1) OVER (ORDER BY time_) THEN 'BREAK'
        WHEN count_outlet < LAG(count_outlet, 1) OVER (ORDER BY time_) THEN 'DOWN'
        ELSE NULL END AS diff_outlet,
    CASE 
        WHEN total_transaction > LAG(total_transaction, 1) OVER (ORDER BY time_) THEN 'UP'
        WHEN total_transaction = LAG(total_transaction, 1) OVER (ORDER BY time_) THEN 'BREAK'
        WHEN total_transaction < LAG(total_transaction, 1) OVER (ORDER BY time_) THEN 'DOWN'
        ELSE NULL END AS diff_trans,
    CASE 
        WHEN total_power > LAG(total_power, 1) OVER (ORDER BY time_) THEN 'UP'
        WHEN total_power = LAG(total_power, 1) OVER (ORDER BY time_) THEN 'BREAK'
        WHEN total_power < LAG(total_power, 1) OVER (ORDER BY time_) THEN 'DOWN'
        ELSE NULL END AS diff_power,
    CASE 
        WHEN total_w_o_revenue > LAG(total_w_o_revenue, 1) OVER (ORDER BY time_) THEN 'UP'
        WHEN total_w_o_revenue = LAG(total_w_o_revenue, 1) OVER (ORDER BY time_) THEN 'BREAK'
        WHEN total_w_o_revenue < LAG(total_w_o_revenue, 1) OVER (ORDER BY time_) THEN 'DOWN'
        ELSE NULL END AS diff_w_o_cost,
    CASE 
        WHEN count_promotion > LAG(count_promotion, 1) OVER (ORDER BY time_) THEN 'UP'
        WHEN count_promotion = LAG(count_promotion, 1) OVER (ORDER BY time_) THEN 'BREAK'
        WHEN count_promotion < LAG(count_promotion, 1) OVER (ORDER BY time_) THEN 'DOWN'
        ELSE NULL END AS diff_count_discount,
    CASE 
        WHEN total_promotion > LAG(total_promotion, 1) OVER (ORDER BY time_) THEN 'UP'
        WHEN total_promotion = LAG(total_promotion, 1) OVER (ORDER BY time_) THEN 'BREAK'
        WHEN total_promotion < LAG(total_promotion, 1) OVER (ORDER BY time_) THEN 'DOWN'
        ELSE NULL END AS diff_discount,
    CASE 
        WHEN total_cost_vnd > LAG(total_cost_vnd, 1) OVER (ORDER BY time_) THEN 'UP'
        WHEN total_cost_vnd = LAG(total_cost_vnd, 1) OVER (ORDER BY time_) THEN 'BREAK'
        WHEN total_cost_vnd < LAG(total_cost_vnd, 1) OVER (ORDER BY time_) THEN 'DOWN'
        ELSE NULL END AS diff_cost
INTO public.trend_of_month
FROM Trend_of_month;

ALTER TABLE public.trend_of_month
ADD CONSTRAINT trend_of_month_pk PRIMARY KEY (time_current);
      `)
    console.log("Table trend_of_month created and data inserted successfully.");
  } catch (err) {
      console.error('Error executing queries', err);
  };
}

module.exports = { trend_of_month };