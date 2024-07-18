const client = require('../config/database');

const trend_of_quarter = async () => {
  try {
    await client.query(`

DROP TABLE IF EXISTS public.trend_of_quarter;

WITH Trend_of_quarter AS (
    SELECT
        EXTRACT(YEAR FROM merged_start_time) AS year_,
        EXTRACT(QUARTER FROM merged_start_time) AS quarter_,
        COUNT(DISTINCT user_id) AS active_user_quarter,
        SUM(paid) + SUM(activation_fee_discount) AS total_w_o_revenue,
        SUM(promotion_discount) AS total_promotion,
        COUNT(CASE WHEN promotion_discount > 0 THEN 1 ELSE NULL END) AS count_promotion,
        SUM(total_fee) AS total_cost_vnd,
        COUNT(invoice_id) AS total_transaction,
        SUM(wattage_consumed) AS total_power,
        COUNT(DISTINCT box_id) AS number_box_active,
        COUNT(DISTINCT outlet_id) AS count_outlet
    FROM public.valid_transaction
    WHERE EXTRACT(QUARTER FROM merged_start_time) IN (
        SELECT DISTINCT EXTRACT(QUARTER FROM merged_start_time)
        FROM public.valid_transaction
    )
    AND EXTRACT(YEAR FROM merged_start_time) IN (
        SELECT DISTINCT EXTRACT(YEAR FROM merged_start_time)
        FROM public.valid_transaction
    )
    GROUP BY year_, quarter_
)
SELECT
    year_,
    quarter_,
    (DATE_TRUNC('quarter', TO_DATE(year_ || '-' || quarter_ * 3 || '-01', 'YYYY-MM-DD')) + INTERVAL '3 months - 1 day')::DATE AS time_,
    active_user_quarter AS total_active_user,
    number_box_active,
    count_outlet,
    total_transaction,
    total_power,
    total_w_o_revenue,
    count_promotion AS count_discount,
    total_promotion AS discount,
    total_cost_vnd,
    
    LAG(active_user_quarter, 1) OVER (ORDER BY year_, quarter_) AS user_prev_q,
    active_user_quarter - LAG(active_user_quarter, 1) OVER (ORDER BY year_, quarter_) AS user_compare_q,
    ROUND(CAST((active_user_quarter - LAG(active_user_quarter, 1) OVER (ORDER BY year_, quarter_)) AS NUMERIC), 3) * 100 / active_user_quarter AS percentage_user_compare_q,
    
    LAG(number_box_active, 1) OVER (ORDER BY year_, quarter_) AS box_prev_q,
    number_box_active - LAG(number_box_active, 1) OVER (ORDER BY year_, quarter_) AS box_compare_q,
    ROUND(CAST((number_box_active - LAG(number_box_active, 1) OVER (ORDER BY year_, quarter_)) AS NUMERIC), 3) * 100 / number_box_active AS percentage_box_compare_q,
    
    LAG(count_outlet, 1) OVER (ORDER BY year_, quarter_) AS outlet_prev_q,
    count_outlet - LAG(count_outlet, 1) OVER (ORDER BY year_, quarter_) AS outlet_compare_q,
    ROUND(CAST((count_outlet - LAG(count_outlet, 1) OVER (ORDER BY year_, quarter_)) AS NUMERIC), 3) * 100 / count_outlet AS percentage_outlet_compare_q,
    
    LAG(total_transaction, 1) OVER (ORDER BY year_, quarter_) AS trans_prev_q,
    total_transaction - LAG(total_transaction, 1) OVER (ORDER BY year_, quarter_) AS trans_compare_q,
    ROUND(CAST((total_transaction - LAG(total_transaction, 1) OVER (ORDER BY year_, quarter_)) AS NUMERIC), 3) * 100 / total_transaction AS percentage_trans_compare_q,
    
    LAG(total_power, 1) OVER (ORDER BY year_, quarter_) AS power_prev_q,
    total_power - LAG(total_power, 1) OVER (ORDER BY year_, quarter_) AS power_compare_q,
    ROUND(CAST((total_power - LAG(total_power, 1) OVER (ORDER BY year_, quarter_)) AS NUMERIC), 3) * 100 / total_power AS percentage_power_compare_q,
    
    LAG(total_w_o_revenue, 1) OVER (ORDER BY year_, quarter_) AS cost_w_o_prev_q,
    total_w_o_revenue - LAG(total_w_o_revenue, 1) OVER (ORDER BY year_, quarter_) AS cost_w_o_compare_q,
    ROUND(CAST((total_w_o_revenue - LAG(total_w_o_revenue, 1) OVER (ORDER BY year_, quarter_)) AS NUMERIC), 3) * 100 / total_w_o_revenue AS percentage_cost_w_o_compare_q,
    
    LAG(count_promotion, 1) OVER (ORDER BY year_, quarter_) AS nb_discount_prev_q,
    count_promotion - LAG(count_promotion, 1) OVER (ORDER BY year_, quarter_) AS nb_discount_compare_q,
    ROUND(CAST((count_promotion - LAG(count_promotion, 1) OVER (ORDER BY year_, quarter_)) AS NUMERIC), 3) * 100 / count_promotion AS percentage_nb_discount_compare_q,
    
    LAG(total_promotion, 1) OVER (ORDER BY year_, quarter_) AS discount_prev_q,
    total_promotion - LAG(total_promotion, 1) OVER (ORDER BY year_, quarter_) AS discount_compare_q,
    ROUND(CAST((total_promotion - LAG(total_promotion, 1) OVER (ORDER BY year_, quarter_)) AS NUMERIC), 3) * 100 / total_promotion AS percentage_discount_compare_q,
    
    LAG(total_cost_vnd, 1) OVER (ORDER BY year_, quarter_) AS cost_prev_q,
    total_cost_vnd - LAG(total_cost_vnd, 1) OVER (ORDER BY year_, quarter_) AS cost_compare_q,
    ROUND(CAST((total_cost_vnd - LAG(total_cost_vnd, 1) OVER (ORDER BY year_, quarter_)) AS NUMERIC), 3) * 100 / total_cost_vnd AS percentage_cost_compare_q,
    
    CASE 
        WHEN active_user_quarter > LAG(active_user_quarter, 1) OVER (ORDER BY year_, quarter_) THEN 'UP'
        WHEN active_user_quarter = LAG(active_user_quarter, 1) OVER (ORDER BY year_, quarter_) THEN 'BREAK'
        WHEN active_user_quarter < LAG(active_user_quarter, 1) OVER (ORDER BY year_, quarter_) THEN 'DOWN'
        ELSE NULL END AS diff_user_q,
    
    CASE 
        WHEN number_box_active > LAG(number_box_active, 1) OVER (ORDER BY year_, quarter_) THEN 'UP'
        WHEN number_box_active = LAG(number_box_active, 1) OVER (ORDER BY year_, quarter_) THEN 'BREAK'
        WHEN number_box_active < LAG(number_box_active, 1) OVER (ORDER BY year_, quarter_) THEN 'DOWN'
        ELSE NULL END AS diff_box_q,
    
    CASE 
        WHEN count_outlet > LAG(count_outlet, 1) OVER (ORDER BY year_, quarter_) THEN 'UP'
        WHEN count_outlet = LAG(count_outlet, 1) OVER (ORDER BY year_, quarter_) THEN 'BREAK'
        WHEN count_outlet < LAG(count_outlet, 1) OVER (ORDER BY year_, quarter_) THEN 'DOWN'
        ELSE NULL END AS diff_outlet_q,
    
    CASE 
        WHEN total_transaction > LAG(total_transaction, 1) OVER (ORDER BY year_, quarter_) THEN 'UP'
        WHEN total_transaction = LAG(total_transaction, 1) OVER (ORDER BY year_, quarter_) THEN 'BREAK'
        WHEN total_transaction < LAG(total_transaction, 1) OVER (ORDER BY year_, quarter_) THEN 'DOWN'
        ELSE NULL END AS diff_trans_q,
    
    CASE 
        WHEN total_power > LAG(total_power, 1) OVER (ORDER BY year_, quarter_) THEN 'UP'
        WHEN total_power = LAG(total_power, 1) OVER (ORDER BY year_, quarter_) THEN 'BREAK'
        WHEN total_power < LAG(total_power, 1) OVER (ORDER BY year_, quarter_) THEN 'DOWN'
        ELSE NULL END AS diff_power_q,
    
    CASE 
        WHEN total_w_o_revenue > LAG(total_w_o_revenue, 1) OVER (ORDER BY year_, quarter_) THEN 'UP'
        WHEN total_w_o_revenue = LAG(total_w_o_revenue, 1) OVER (ORDER BY year_, quarter_) THEN 'BREAK'
        WHEN total_w_o_revenue < LAG(total_w_o_revenue, 1) OVER (ORDER BY year_, quarter_) THEN 'DOWN'
        ELSE NULL END AS diff_w_o_cost_q,
    
    CASE 
        WHEN count_promotion > LAG(count_promotion, 1) OVER (ORDER BY year_, quarter_) THEN 'UP'
        WHEN count_promotion = LAG(count_promotion, 1) OVER (ORDER BY year_, quarter_) THEN 'BREAK'
        WHEN count_promotion < LAG(count_promotion, 1) OVER (ORDER BY year_, quarter_) THEN 'DOWN'
        ELSE NULL END AS diff_count_discount_q,
    
    CASE 
        WHEN total_promotion > LAG(total_promotion, 1) OVER (ORDER BY year_, quarter_) THEN 'UP'
        WHEN total_promotion = LAG(total_promotion, 1) OVER (ORDER BY year_, quarter_) THEN 'BREAK'
        WHEN total_promotion < LAG(total_promotion, 1) OVER (ORDER BY year_, quarter_) THEN 'DOWN'
        ELSE NULL END AS diff_discount_q,
    
    CASE 
        WHEN total_cost_vnd > LAG(total_cost_vnd, 1) OVER (ORDER BY year_, quarter_) THEN 'UP'
        WHEN total_cost_vnd = LAG(total_cost_vnd, 1) OVER (ORDER BY year_, quarter_) THEN 'BREAK'
        WHEN total_cost_vnd < LAG(total_cost_vnd, 1) OVER (ORDER BY year_, quarter_) THEN 'DOWN'
        ELSE NULL END AS diff_cost_q,


   LAG(active_user_quarter, 4) OVER (ORDER BY year_, quarter_) AS user_prev_4q,
    active_user_quarter - LAG(active_user_quarter, 4) OVER (ORDER BY year_, quarter_) AS user_compare_4q,
    ROUND(CAST((active_user_quarter - LAG(active_user_quarter, 4) OVER (ORDER BY year_, quarter_)) AS NUMERIC), 3) * 100 / active_user_quarter AS percentage_user_compare_4q,
    LAG(number_box_active, 4) OVER (ORDER BY year_, quarter_) AS box_prev_4q,
    number_box_active - LAG(number_box_active, 4) OVER (ORDER BY year_, quarter_) AS box_compare_4q,
    ROUND(CAST((number_box_active - LAG(number_box_active, 4) OVER (ORDER BY year_, quarter_)) AS NUMERIC), 3) * 100 / number_box_active AS percentage_box_compare_4q,
    LAG(count_outlet, 4) OVER (ORDER BY year_, quarter_) AS outlet_prev_4q,
    count_outlet - LAG(count_outlet, 4) OVER (ORDER BY year_, quarter_) AS outlet_compare_4q,
    ROUND(CAST((count_outlet - LAG(count_outlet, 4) OVER (ORDER BY year_, quarter_)) AS NUMERIC), 3) * 100 / count_outlet AS percentage_outlet_compare_4q,
    LAG(total_transaction, 4) OVER (ORDER BY year_, quarter_) AS trans_prev_4q,
    total_transaction - LAG(total_transaction, 4) OVER (ORDER BY year_, quarter_) AS trans_compare_4q,
    ROUND(CAST((total_transaction - LAG(total_transaction, 4) OVER (ORDER BY year_, quarter_)) AS NUMERIC), 3) * 100 / total_transaction AS percentage_trans_compare_4q,
    LAG(total_power, 4) OVER (ORDER BY year_, quarter_) AS power_prev_4q,
    total_power - LAG(total_power, 4) OVER (ORDER BY year_, quarter_) AS power_compare_4q,
    ROUND(CAST((total_power - LAG(total_power, 4) OVER (ORDER BY year_, quarter_)) AS NUMERIC), 3) * 100 / total_power AS percentage_power_compare_4q,
    LAG(total_w_o_revenue, 4) OVER (ORDER BY year_, quarter_) AS cost_w_o_prev_4q,
    total_w_o_revenue - LAG(total_w_o_revenue, 4) OVER (ORDER BY year_, quarter_) AS cost_w_o_compare_4q,
    ROUND(CAST((total_w_o_revenue - LAG(total_w_o_revenue, 4) OVER (ORDER BY year_, quarter_)) AS NUMERIC), 3) * 100 / total_w_o_revenue AS percentage_cost_w_o_compare_4q,
    LAG(count_promotion, 4) OVER (ORDER BY year_, quarter_) AS nb_discount_prev_4q,
    count_promotion - LAG(count_promotion, 4) OVER (ORDER BY year_, quarter_) AS nb_discount_compare_4q,
    ROUND(CAST((count_promotion - LAG(count_promotion, 4) OVER (ORDER BY year_, quarter_)) AS NUMERIC), 3) * 100 / count_promotion AS percentage_nb_discount_compare_4q,
    LAG(total_promotion, 4) OVER (ORDER BY year_, quarter_) AS discount_prev_4q,
    total_promotion - LAG(total_promotion, 4) OVER (ORDER BY year_, quarter_) AS discount_compare_4q,
    ROUND(CAST((total_promotion - LAG(total_promotion, 4) OVER (ORDER BY year_, quarter_)) AS NUMERIC), 3) * 100 / total_promotion AS percentage_discount_compare_4q,
    LAG(total_cost_vnd, 4) OVER (ORDER BY year_, quarter_) AS cost_prev_4q,
    total_cost_vnd - LAG(total_cost_vnd, 4) OVER (ORDER BY year_, quarter_) AS cost_compare_4q,
    ROUND(CAST((total_cost_vnd - LAG(total_cost_vnd, 4) OVER (ORDER BY year_, quarter_)) AS NUMERIC), 3) * 100 / total_cost_vnd AS percentage_cost_compare_4q

INTO public.trend_of_quarter
FROM Trend_of_quarter;

      `)
    console.log("Table trend_of_quarter created and data inserted successfully.");
  } catch (err) {
      console.error('Error executing queries', err);
  };
}

module.exports = { trend_of_quarter };