const client = require('../config/database');

const trend_of_quarter_analysis = async () => {
  try {
    await client.query(`

DROP TABLE public.trend_of_quarter_analysis;

CREATE TABLE public.trend_of_quarter_analysis AS
WITH trend_of_quarter_analysis AS (
    SELECT
        EXTRACT(YEAR FROM merged_start_time) AS year_,
        EXTRACT(QUARTER FROM merged_start_time) AS quarter_,
        DATE_TRUNC('quarter', merged_start_time) + INTERVAL '3 month - 1 day' AS time_,
        COUNT(DISTINCT user_id) AS total_user_on_quarter,
        SUM(total_fee) AS total_w_o_revenue,
        SUM(discount_amount) AS total_promotion,
        COUNT(CASE WHEN discount_amount > 0 THEN 1 ELSE NULL END) AS number_of_promotion,
        SUM(paid) AS total_cost_vnd,
        COUNT(invoice_id) AS total_transaction,
        SUM(wattage_consumed) AS total_power,
        COUNT(DISTINCT box_id) AS number_box_active,
        COUNT(DISTINCT outlet_id) AS number_of_outlet
    FROM public.valid_transaction
    WHERE EXTRACT(QUARTER FROM merged_start_time) IN (
        SELECT DISTINCT EXTRACT(QUARTER FROM merged_start_time)
        FROM public.valid_transaction
    )
    AND EXTRACT(YEAR FROM merged_start_time) IN (
        SELECT DISTINCT EXTRACT(YEAR FROM merged_start_time)
        FROM public.valid_transaction
    )
    GROUP BY year_, quarter_, time_
),
installed_box_per_quarter AS (
    WITH quarterly_boxes AS (
        SELECT 
            DATE_TRUNC('quarter', created_at) + INTERVAL '3 month - 1 day' AS quarter_year,
            COUNT(*) AS boxes_installed_in_quarter
        FROM public.boxes
        WHERE CAST(SUBSTRING(box_id FROM '[0-9]+') AS INTEGER) >= 10
            AND box_id != box_name
        GROUP BY DATE_TRUNC('quarter', created_at)
    ),
    cumulative_boxes AS (
        SELECT 
            quarter_year,
            boxes_installed_in_quarter,
            SUM(boxes_installed_in_quarter) OVER (ORDER BY quarter_year ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING) AS boxes_installed_before_quarter
        FROM quarterly_boxes
    )
    SELECT 
        quarter_year,
        boxes_installed_in_quarter
    FROM cumulative_boxes
    ORDER BY quarter_year
)
SELECT
    t.year_,
    t.quarter_,
    t.time_::DATE AS time_current,
    t.total_user_on_quarter AS total_active_user,
    t.number_box_active,
    ib.boxes_installed_in_quarter,
    t.number_of_outlet,
    t.total_transaction,
    t.total_power,
    t.total_w_o_revenue,
    t.number_of_promotion AS number_of_discount,
    t.total_promotion AS discount,
    t.total_cost_vnd,
    
    LAG(t.time_, 1) OVER (ORDER BY t.year_, t.quarter_) AS previous_quarter,
    
    LAG(t.total_user_on_quarter, 1) OVER (ORDER BY t.year_, t.quarter_) AS user_prev,
    t.total_user_on_quarter - LAG(t.total_user_on_quarter, 1) OVER (ORDER BY t.year_, t.quarter_) AS user_compare,
    ROUND(ROUND(CAST((t.total_user_on_quarter - LAG(t.total_user_on_quarter, 1) OVER (ORDER BY t.year_, t.quarter_)) AS NUMERIC), 3) * 100 / t.total_user_on_quarter, 2) AS percentage_user_compare,
    
    LAG(t.number_box_active, 1) OVER (ORDER BY t.year_, t.quarter_) AS box_prev_quarter,
    t.number_box_active - LAG(t.number_box_active, 1) OVER (ORDER BY t.year_, t.quarter_) AS box_compare,
    ROUND(ROUND(CAST((t.number_box_active - LAG(t.number_box_active, 1) OVER (ORDER BY t.year_, t.quarter_)) AS NUMERIC), 3) * 100 / t.number_box_active, 2) AS percentage_box_compare,
    
    LAG(ib.boxes_installed_in_quarter, 1) OVER (ORDER BY t.year_, t.quarter_) AS installed_box_prev_quarter,
    ib.boxes_installed_in_quarter - LAG(ib.boxes_installed_in_quarter, 1) OVER (ORDER BY t.year_, t.quarter_) AS installed_box_compare,
    ROUND(ROUND(CAST((ib.boxes_installed_in_quarter - LAG(ib.boxes_installed_in_quarter, 1) OVER (ORDER BY t.year_, t.quarter_)) AS NUMERIC), 3) * 100 / ib.boxes_installed_in_quarter::numeric, 2) AS percentage_installed_box_compare,
    
    LAG(t.number_of_outlet, 1) OVER (ORDER BY t.year_, t.quarter_) AS outlet_prev,
    t.number_of_outlet - LAG(t.number_of_outlet, 1) OVER (ORDER BY t.year_, t.quarter_) AS outlet_compare,
    ROUND(ROUND(CAST((t.number_of_outlet - LAG(t.number_of_outlet, 1) OVER (ORDER BY t.year_, t.quarter_)) AS NUMERIC), 3) * 100 / t.number_of_outlet, 2) AS percentage_outlet_compare,
    
    LAG(t.total_transaction, 1) OVER (ORDER BY t.year_, t.quarter_) AS trans_prev_quarter,
    t.total_transaction - LAG(t.total_transaction, 1) OVER (ORDER BY t.year_, t.quarter_) AS trans_compare,
    ROUND(ROUND(CAST((t.total_transaction - LAG(t.total_transaction, 1) OVER (ORDER BY t.year_, t.quarter_)) AS NUMERIC), 3) * 100 / t.total_transaction, 2) AS percentage_trans_compare,
    
    LAG(t.total_power, 1) OVER (ORDER BY t.year_, t.quarter_) AS power_prev_quarter,
    t.total_power - LAG(t.total_power, 1) OVER (ORDER BY t.year_, t.quarter_) AS power_compare,
    ROUND(ROUND(CAST((t.total_power - LAG(t.total_power, 1) OVER (ORDER BY t.year_, t.quarter_)) AS NUMERIC), 3) * 100 / t.total_power::numeric, 2) AS percentage_power_compare,
    
    LAG(t.total_w_o_revenue, 1) OVER (ORDER BY t.year_, t.quarter_) AS cost_w_o_prev,
    t.total_w_o_revenue - LAG(t.total_w_o_revenue, 1) OVER (ORDER BY t.year_, t.quarter_) AS cost_w_o_compare,
    ROUND(ROUND(CAST((t.total_w_o_revenue - LAG(t.total_w_o_revenue, 1) OVER (ORDER BY t.year_, t.quarter_)) AS NUMERIC), 3) * 100 / t.total_w_o_revenue::numeric, 2) AS percentage_cost_w_o_compare,
    
    LAG(t.number_of_promotion, 1) OVER (ORDER BY t.year_, t.quarter_) AS nb_discount_prev,
    t.number_of_promotion - LAG(t.number_of_promotion, 1) OVER (ORDER BY t.year_, t.quarter_) AS nb_discount_compare,
    ROUND(ROUND(CAST((t.number_of_promotion - LAG(t.number_of_promotion, 1) OVER (ORDER BY t.year_, t.quarter_)) AS NUMERIC), 3) * 100 / t.number_of_promotion, 2) AS percentage_nb_discount_compare,
    
    LAG(t.total_promotion, 1) OVER (ORDER BY t.year_, t.quarter_) AS discount_prev,
    t.total_promotion - LAG(t.total_promotion, 1) OVER (ORDER BY t.year_, t.quarter_) AS discount_compare,
    ROUND(ROUND(CAST((t.total_promotion - LAG(t.total_promotion, 1) OVER (ORDER BY t.year_, t.quarter_)) AS NUMERIC), 3) * 100 / t.total_promotion::numeric, 2) AS percentage_discount_compare,
    
    LAG(t.total_cost_vnd, 1) OVER (ORDER BY t.year_, t.quarter_) AS cost_prev,
    t.total_cost_vnd - LAG(t.total_cost_vnd, 1) OVER (ORDER BY t.year_, t.quarter_) AS cost_compare,
    ROUND(ROUND(CAST((t.total_cost_vnd - LAG(t.total_cost_vnd, 1) OVER (ORDER BY t.year_, t.quarter_)) AS NUMERIC), 3) * 100 / t.total_cost_vnd::numeric, 2) AS percentage_cost_compare,
    
    CASE 
        WHEN t.total_user_on_quarter > LAG(t.total_user_on_quarter, 1) OVER (ORDER BY t.year_, t.quarter_) THEN 'UP'
        WHEN t.total_user_on_quarter = LAG(t.total_user_on_quarter, 1) OVER (ORDER BY t.year_, t.quarter_) THEN 'BREAK'
        WHEN t.total_user_on_quarter < LAG(t.total_user_on_quarter, 1) OVER (ORDER BY t.year_, t.quarter_) THEN 'DOWN'
        ELSE NULL END AS diff_user,
    CASE 
        WHEN t.number_box_active > LAG(t.number_box_active, 1) OVER (ORDER BY t.year_, t.quarter_) THEN 'UP'
        WHEN t.number_box_active = LAG(t.number_box_active, 1) OVER (ORDER BY t.year_, t.quarter_) THEN 'BREAK'
        WHEN t.number_box_active < LAG(t.number_box_active, 1) OVER (ORDER BY t.year_, t.quarter_) THEN 'DOWN'
        ELSE NULL END AS diff_box,
    CASE 
        WHEN t.number_of_outlet > LAG(t.number_of_outlet, 1) OVER (ORDER BY t.year_, t.quarter_) THEN 'UP'
        WHEN t.number_of_outlet = LAG(t.number_of_outlet, 1) OVER (ORDER BY t.year_, t.quarter_) THEN 'BREAK'
        WHEN t.number_of_outlet < LAG(t.number_of_outlet, 1) OVER (ORDER BY t.year_, t.quarter_) THEN 'DOWN'
        ELSE NULL END AS diff_outlet,
    CASE 
        WHEN t.total_transaction > LAG(t.total_transaction, 1) OVER (ORDER BY t.year_, t.quarter_) THEN 'UP'
        WHEN t.total_transaction = LAG(t.total_transaction, 1) OVER (ORDER BY t.year_, t.quarter_) THEN 'BREAK'
        WHEN t.total_transaction < LAG(t.total_transaction, 1) OVER (ORDER BY t.year_, t.quarter_) THEN 'DOWN'
        ELSE NULL END AS diff_trans,
    CASE 
        WHEN t.total_power > LAG(t.total_power, 1) OVER (ORDER BY t.year_, t.quarter_) THEN 'UP'
        WHEN t.total_power = LAG(t.total_power, 1) OVER (ORDER BY t.year_, t.quarter_) THEN 'BREAK'
        WHEN t.total_power < LAG(t.total_power, 1) OVER (ORDER BY t.year_, t.quarter_) THEN 'DOWN'
        ELSE NULL END AS diff_power,
    CASE 
        WHEN t.total_w_o_revenue > LAG(t.total_w_o_revenue, 1) OVER (ORDER BY t.year_, t.quarter_) THEN 'UP'
        WHEN t.total_w_o_revenue = LAG(t.total_w_o_revenue, 1) OVER (ORDER BY t.year_, t.quarter_) THEN 'BREAK'
        WHEN t.total_w_o_revenue < LAG(t.total_w_o_revenue, 1) OVER (ORDER BY t.year_, t.quarter_) THEN 'DOWN'
        ELSE NULL END AS diff_w_o_cost,
    CASE 
        WHEN t.number_of_promotion > LAG(t.number_of_promotion, 1) OVER (ORDER BY t.year_, t.quarter_) THEN 'UP'
        WHEN t.number_of_promotion = LAG(t.number_of_promotion, 1) OVER (ORDER BY t.year_, t.quarter_) THEN 'BREAK'
        WHEN t.number_of_promotion < LAG(t.number_of_promotion, 1) OVER (ORDER BY t.year_, t.quarter_) THEN 'DOWN'
        ELSE NULL END AS diff_number_of_discount,
    CASE 
        WHEN t.total_promotion > LAG(t.total_promotion, 1) OVER (ORDER BY t.year_, t.quarter_) THEN 'UP'
        WHEN t.total_promotion = LAG(t.total_promotion, 1) OVER (ORDER BY t.year_, t.quarter_) THEN 'BREAK'
        WHEN t.total_promotion < LAG(t.total_promotion, 1) OVER (ORDER BY t.year_, t.quarter_) THEN 'DOWN'
        ELSE NULL END AS diff_discount,
    CASE
        WHEN t.total_cost_vnd > LAG(t.total_cost_vnd, 1) OVER (ORDER BY t.year_, t.quarter_) THEN 'UP'
        WHEN t.total_cost_vnd = LAG(t.total_cost_vnd, 1) OVER (ORDER BY t.year_, t.quarter_) THEN 'BREAK'
        WHEN t.total_cost_vnd < LAG(t.total_cost_vnd, 1) OVER (ORDER BY t.year_, t.quarter_) THEN 'DOWN'
        ELSE NULL END AS diff_cost
    
FROM trend_of_quarter_analysis t
LEFT JOIN installed_box_per_quarter ib ON t.time_ = ib.quarter_year
ORDER BY t.year_, t.quarter_;

-- Adding primary key constraint
ALTER TABLE public.trend_of_quarter_analysis
ADD CONSTRAINT trend_of_quarter_analysis_pk PRIMARY KEY (year_, quarter_);

      `);
      console.log("Table trend_of_quarter_analysis created and data inserted successfully.");
  } catch (err) {
      console.error('Error executing queries', err);
  };
};

module.exports = {
  trend_of_quarter_analysis,
}