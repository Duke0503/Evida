const client = require('../config/database');

const trend_of_month_analysis = async () => {
  try {
    await client.query(`

DROP TABLE IF EXISTS trend_of_month_analysis;

CREATE TABLE public.trend_of_month_analysis AS
WITH trend_of_month_analysis AS (
    SELECT
        EXTRACT(YEAR FROM merged_start_time) AS year_,
        LPAD(EXTRACT(MONTH FROM merged_start_time)::text, 2, '0') AS month_,
        DATE_TRUNC('month', merged_start_time) + INTERVAL '1 month - 1 day' AS time_,
        COUNT(DISTINCT user_id) AS total_user_on_month,
        SUM(total_fee) AS total_w_o_revenue,
        SUM(discount_amount) AS total_promotion,
        COUNT(CASE WHEN discount_amount > 0 THEN 1 ELSE NULL END) AS number_of_promotion,
        SUM(paid) AS total_cost_vnd,
        COUNT(invoice_id) AS total_transaction,
        SUM(wattage_consumed) AS total_power,
        COUNT(DISTINCT box_id) AS number_box_active,
        COUNT(DISTINCT outlet_id) AS number_of_outlet
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
),
installed_box_per_month AS (
    WITH monthly_boxes AS (
        SELECT 
            DATE_TRUNC('month', created_at) + INTERVAL '1 month - 1 day' AS month_year,
            COUNT(*) AS boxes_installed_in_month
        FROM public.boxes
        WHERE CAST(SUBSTRING(box_id FROM '[0-9]+') AS INTEGER) >= 10
			AND box_id != box_name
        GROUP BY DATE_TRUNC('month', created_at)
    ),
    cumulative_boxes AS (
        SELECT 
            month_year,
            boxes_installed_in_month,
            SUM(boxes_installed_in_month) OVER (ORDER BY month_year ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING) AS boxes_installed_before_month
        FROM monthly_boxes
    )
    SELECT 
        month_year,
        boxes_installed_in_month
    FROM cumulative_boxes
    ORDER BY month_year
)
SELECT
    t.time_::DATE AS time_current,
    t.total_user_on_month AS total_active_user,
    t.number_box_active,
	COALESCE(ib.boxes_installed_in_month, 0) AS boxes_installed_in_month,
    t.number_of_outlet,
    t.total_transaction,
    t.total_power,
    t.total_w_o_revenue,
    t.number_of_promotion AS number_of_discount,
    t.total_promotion AS discount,
    t.total_cost_vnd,
    
	LAG(t.time_, 1) OVER (ORDER BY t.time_) AS previous_month,
    
	LAG(t.total_user_on_month, 1) OVER (ORDER BY t.time_) AS user_prev,
    t.total_user_on_month - LAG(t.total_user_on_month, 1) OVER (ORDER BY t.time_) AS user_compare,
    ROUND(ROUND(CAST((t.total_user_on_month - LAG(t.total_user_on_month, 1) OVER (ORDER BY t.time_)) AS NUMERIC), 3) * 100 / t.total_user_on_month, 2) AS percentage_user_compare,
    
	LAG(t.number_box_active, 1) OVER (ORDER BY t.time_) AS box_prev_month,
    t.number_box_active - LAG(t.number_box_active, 1) OVER (ORDER BY t.time_) AS box_compare,
    ROUND(ROUND(CAST((t.number_box_active - LAG(t.number_box_active, 1) OVER (ORDER BY t.time_)) AS NUMERIC), 3) * 100 / t.number_box_active, 2) AS percentage_box_compare,
    
	LAG(ib.boxes_installed_in_month, 1) OVER (ORDER BY t.time_) AS installed_box_prev_month,
    ib.boxes_installed_in_month - LAG(ib.boxes_installed_in_month, 1) OVER (ORDER BY t.time_) AS installed_box_compare,
	
	LAG(t.number_of_outlet, 1) OVER (ORDER BY t.time_) AS outlet_prev,
    t.number_of_outlet - LAG(t.number_of_outlet, 1) OVER (ORDER BY t.time_) AS outlet_compare,
    ROUND(ROUND(CAST((t.number_of_outlet - LAG(t.number_of_outlet, 1) OVER (ORDER BY t.time_)) AS NUMERIC), 3) * 100 / t.number_of_outlet, 2) AS percentage_outlet_compare,
    
	LAG(t.total_transaction, 1) OVER (ORDER BY t.time_) AS trans_prev_month,
    t.total_transaction - LAG(t.total_transaction, 1) OVER (ORDER BY t.time_) AS trans_compare,
    ROUND(ROUND(CAST((t.total_transaction - LAG(t.total_transaction, 1) OVER (ORDER BY t.time_)) AS NUMERIC), 3) * 100 / t.total_transaction, 2) AS percentage_trans_compare,
    
	LAG(t.total_power, 1) OVER (ORDER BY t.time_) AS power_prev_month,
    t.total_power - LAG(t.total_power, 1) OVER (ORDER BY t.time_) AS power_compare,
    ROUND(ROUND(CAST((t.total_power - LAG(t.total_power, 1) OVER (ORDER BY t.time_)) AS NUMERIC), 3) * 100 / t.total_power::numeric, 2) AS percentage_power_compare,
    
	LAG(t.total_w_o_revenue, 1) OVER (ORDER BY t.time_) AS cost_w_o_prev,
    t.total_w_o_revenue - LAG(t.total_w_o_revenue, 1) OVER (ORDER BY t.time_) AS cost_w_o_compare,
    ROUND(ROUND(CAST((t.total_w_o_revenue - LAG(t.total_w_o_revenue, 1) OVER (ORDER BY t.time_)) AS NUMERIC), 3) * 100 / t.total_w_o_revenue::numeric, 2) AS percentage_cost_w_o_compare,
    
	LAG(t.number_of_promotion, 1) OVER (ORDER BY t.time_) AS nb_discount_prev,
    t.number_of_promotion - LAG(t.number_of_promotion, 1) OVER (ORDER BY t.time_) AS nb_discount_compare,
    
	LAG(t.total_promotion, 1) OVER (ORDER BY t.time_) AS discount_prev,
    t.total_promotion - LAG(t.total_promotion, 1) OVER (ORDER BY t.time_) AS discount_compare,
    
	LAG(t.total_cost_vnd, 1) OVER (ORDER BY t.time_) AS cost_prev,
    t.total_cost_vnd - LAG(t.total_cost_vnd, 1) OVER (ORDER BY t.time_) AS cost_compare,
    ROUND(ROUND(CAST((t.total_cost_vnd - LAG(t.total_cost_vnd, 1) OVER (ORDER BY t.time_)) AS NUMERIC), 3) * 100 / t.total_cost_vnd::numeric, 2) AS percentage_cost_compare,
    
	CASE 
        WHEN t.total_user_on_month > LAG(t.total_user_on_month, 1) OVER (ORDER BY t.time_) THEN 'UP'
        WHEN t.total_user_on_month = LAG(t.total_user_on_month, 1) OVER (ORDER BY t.time_) THEN 'BREAK'
        WHEN t.total_user_on_month < LAG(t.total_user_on_month, 1) OVER (ORDER BY t.time_) THEN 'DOWN'
        ELSE NULL END AS diff_user,
    CASE 
        WHEN t.number_box_active > LAG(t.number_box_active, 1) OVER (ORDER BY t.time_) THEN 'UP'
        WHEN t.number_box_active = LAG(t.number_box_active, 1) OVER (ORDER BY t.time_) THEN 'BREAK'
        WHEN t.number_box_active < LAG(t.number_box_active, 1) OVER (ORDER BY t.time_) THEN 'DOWN'
        ELSE NULL END AS diff_box,
    CASE 
        WHEN t.number_of_outlet > LAG(t.number_of_outlet, 1) OVER (ORDER BY t.time_) THEN 'UP'
        WHEN t.number_of_outlet = LAG(t.number_of_outlet, 1) OVER (ORDER BY t.time_) THEN 'BREAK'
        WHEN t.number_of_outlet < LAG(t.number_of_outlet, 1) OVER (ORDER BY t.time_) THEN 'DOWN'
        ELSE NULL END AS diff_outlet,
    CASE 
        WHEN t.total_transaction > LAG(t.total_transaction, 1) OVER (ORDER BY t.time_) THEN 'UP'
        WHEN t.total_transaction = LAG(t.total_transaction, 1) OVER (ORDER BY t.time_) THEN 'BREAK'
        WHEN t.total_transaction < LAG(t.total_transaction, 1) OVER (ORDER BY t.time_) THEN 'DOWN'
        ELSE NULL END AS diff_trans,
    CASE 
        WHEN t.total_power > LAG(t.total_power, 1) OVER (ORDER BY t.time_) THEN 'UP'
        WHEN t.total_power = LAG(t.total_power, 1) OVER (ORDER BY t.time_) THEN 'BREAK'
        WHEN t.total_power < LAG(t.total_power, 1) OVER (ORDER BY t.time_) THEN 'DOWN'
        ELSE NULL END AS diff_power,
    CASE 
        WHEN t.total_w_o_revenue > LAG(t.total_w_o_revenue, 1) OVER (ORDER BY t.time_) THEN 'UP'
        WHEN t.total_w_o_revenue = LAG(t.total_w_o_revenue, 1) OVER (ORDER BY t.time_) THEN 'BREAK'
        WHEN t.total_w_o_revenue < LAG(t.total_w_o_revenue, 1) OVER (ORDER BY t.time_) THEN 'DOWN'
        ELSE NULL END AS diff_w_o_cost,
    CASE 
        WHEN t.number_of_promotion > LAG(t.number_of_promotion, 1) OVER (ORDER BY t.time_) THEN 'UP'
        WHEN t.number_of_promotion = LAG(t.number_of_promotion, 1) OVER (ORDER BY t.time_) THEN 'BREAK'
        WHEN t.number_of_promotion < LAG(t.number_of_promotion, 1) OVER (ORDER BY t.time_) THEN 'DOWN'
        ELSE NULL END AS diff_number_of_discount,
    CASE 
        WHEN t.total_promotion > LAG(t.total_promotion, 1) OVER (ORDER BY t.time_) THEN 'UP'
        WHEN t.total_promotion = LAG(t.total_promotion, 1) OVER (ORDER BY t.time_) THEN 'BREAK'
        WHEN t.total_promotion < LAG(t.total_promotion, 1) OVER (ORDER BY t.time_) THEN 'DOWN'
        ELSE NULL END AS diff_discount,
    CASE 
        WHEN t.total_cost_vnd > LAG(t.total_cost_vnd, 1) OVER (ORDER BY t.time_) THEN 'UP'
        WHEN t.total_cost_vnd = LAG(t.total_cost_vnd, 1) OVER (ORDER BY t.time_) THEN 'BREAK'
        WHEN t.total_cost_vnd < LAG(t.total_cost_vnd, 1) OVER (ORDER BY t.time_) THEN 'DOWN'
        ELSE NULL END AS diff_cost
    
FROM trend_of_month_analysis t
LEFT JOIN installed_box_per_month ib ON ib.month_year = t.time_
ORDER BY t.time_;

ALTER TABLE public.trend_of_month_analysis
ADD CONSTRAINT trend_of_month_analysis_pk PRIMARY KEY (time_current);

      `);
      console.log("Table trend_of_month_analysis created and data inserted successfully.");
  } catch (err) {
      console.error('Error executing queries', err);
  };
};

module.exports = {
  trend_of_month_analysis,
}