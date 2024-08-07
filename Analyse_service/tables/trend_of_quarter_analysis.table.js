const client = require('../config/database');

const trend_of_quarter_analysis = async () => {
  try {
    await client.query(`

DROP TABLE IF EXISTS public.trend_of_quarter_analysis;

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
)
SELECT
    t.year_ as "Year",
    t.quarter_ as "Quarter",
    t.time_::DATE AS "Time",
    t.total_user_on_quarter AS "Active Users",
    t.number_box_active AS "Active Boxes",
    t.number_of_outlet AS "Active Outlets",
    t.total_transaction as "Transaction Events",
    t.total_power as "Power Consumption",
    t.total_w_o_revenue / 1000000 "Revenue without Discount (Million VND)",
    t.number_of_promotion AS "Number of Discounts",
    t.total_promotion / 1000000 AS "Discount (Million VND)",
    t.total_cost_vnd / 1000000 as "Revenue after Discount (Million VND)",
    
    LAG(t.time_, 1) OVER (ORDER BY t.year_, t.quarter_) AS "Previous Quarter",
    
    LAG(t.total_user_on_quarter, 1) OVER (ORDER BY t.year_, t.quarter_) AS "Previous Active Users",
    t.total_user_on_quarter - LAG(t.total_user_on_quarter, 1) OVER (ORDER BY t.year_, t.quarter_) AS "Compare Active Users Change",
    ROUND(ROUND(CAST((t.total_user_on_quarter - LAG(t.total_user_on_quarter, 1) OVER (ORDER BY t.year_, t.quarter_)) AS NUMERIC), 3) * 100 / (LAG(t.total_user_on_quarter, 1) OVER (ORDER BY t.year_, t.quarter_)), 2) AS "Percentage Active Users Change",
    
    LAG(t.number_box_active, 1) OVER (ORDER BY t.year_, t.quarter_) AS "Previous Active Boxes",
    t.number_box_active - LAG(t.number_box_active, 1) OVER (ORDER BY t.year_, t.quarter_) AS "Compare Active Boxes Change",
    ROUND(ROUND(CAST((t.number_box_active - LAG(t.number_box_active, 1) OVER (ORDER BY t.year_, t.quarter_)) AS NUMERIC), 3) * 100 / (LAG(t.number_box_active, 1) OVER (ORDER BY t.year_, t.quarter_)), 2) AS "Percentage Active Boxes Change",
    
    LAG(t.number_of_outlet, 1) OVER (ORDER BY t.year_, t.quarter_) AS "Previous Active Outlets",
    t.number_of_outlet - LAG(t.number_of_outlet, 1) OVER (ORDER BY t.year_, t.quarter_) AS "Compare Active Outlets Change",
    ROUND(ROUND(CAST((t.number_of_outlet - LAG(t.number_of_outlet, 1) OVER (ORDER BY t.year_, t.quarter_)) AS NUMERIC), 3) * 100 / (LAG(t.number_of_outlet, 1) OVER (ORDER BY t.year_, t.quarter_)), 2) AS "Percentage Active Outlets Change",
    
    LAG(t.total_transaction, 1) OVER (ORDER BY t.year_, t.quarter_) AS "Previous Transaction Events",
    t.total_transaction - LAG(t.total_transaction, 1) OVER (ORDER BY t.year_, t.quarter_) AS "Compare Transaction Events Change",
    ROUND(ROUND(CAST((t.total_transaction - LAG(t.total_transaction, 1) OVER (ORDER BY t.year_, t.quarter_)) AS NUMERIC), 3) * 100 / (LAG(t.total_transaction, 1) OVER (ORDER BY t.year_, t.quarter_)), 2) AS "Percentage Transaction Events Change",
    
    LAG(t.total_power, 1) OVER (ORDER BY t.year_, t.quarter_) AS "Previous Power Consumption",
    t.total_power - LAG(t.total_power, 1) OVER (ORDER BY t.year_, t.quarter_) AS "Compare Previous Power Consumption",
    ROUND(ROUND(CAST((t.total_power - LAG(t.total_power, 1) OVER (ORDER BY t.year_, t.quarter_)) AS NUMERIC), 3) * 100 / CAST( LAG(t.total_power, 1) OVER (ORDER BY t.year_, t.quarter_) AS NUMERIC), 2) AS "Percentage Previous Power Consumption",
    
    LAG(t.total_w_o_revenue, 1) OVER (ORDER BY t.year_, t.quarter_) / 1000000 AS "Previous Revenue without Discount",
    t.total_w_o_revenue - LAG(t.total_w_o_revenue, 1) OVER (ORDER BY t.year_, t.quarter_) / 1000000 AS "Compare Previous Revenue without Discount Change",
    ROUND(ROUND(CAST((t.total_w_o_revenue - LAG(t.total_w_o_revenue, 1) OVER (ORDER BY t.year_, t.quarter_)) AS NUMERIC), 3) * 100 / CAST(LAG(t.total_w_o_revenue, 1) OVER (ORDER BY t.year_, t.quarter_) AS NUMERIC), 2) AS "Percentage Previous Revenue without Discount Change",
    
    LAG(t.number_of_promotion, 1) OVER (ORDER BY t.year_, t.quarter_) AS "Previous Number of Discounts",
    t.number_of_promotion - LAG(t.number_of_promotion, 1) OVER (ORDER BY t.year_, t.quarter_) AS "Compare Previous Number of Discounts Change",
    ROUND(ROUND(CAST((t.number_of_promotion - LAG(t.number_of_promotion, 1) OVER (ORDER BY t.year_, t.quarter_)) AS NUMERIC), 3) * 100 / (LAG(t.number_of_promotion, 1) OVER (ORDER BY t.year_, t.quarter_)), 2) AS "Percentage Previous Number of Discounts Change",
    
    LAG(t.total_promotion, 1) OVER (ORDER BY t.year_, t.quarter_) / 1000000 AS "Previous Discount",
    t.total_promotion - LAG(t.total_promotion, 1) OVER (ORDER BY t.year_, t.quarter_) / 1000000 AS "Compare Previous Discount Change",
    ROUND(ROUND(CAST((t.total_promotion - LAG(t.total_promotion, 1) OVER (ORDER BY t.year_, t.quarter_)) AS NUMERIC), 3) * 100 / CAST(LAG(t.total_promotion, 1) OVER (ORDER BY t.year_, t.quarter_) AS NUMERIC), 2) AS "Percentage Previous Discount Change",
    
    LAG(t.total_cost_vnd, 1) OVER (ORDER BY t.year_, t.quarter_) / 1000000 AS "Previous Revenue after Discount",
    t.total_cost_vnd - LAG(t.total_cost_vnd, 1) OVER (ORDER BY t.year_, t.quarter_) / 1000000 AS "Compare Previous Revenue after Discount Change",
    ROUND(ROUND(CAST((t.total_cost_vnd - LAG(t.total_cost_vnd, 1) OVER (ORDER BY t.year_, t.quarter_)) AS NUMERIC), 3) * 100 / CAST(LAG(t.total_cost_vnd, 1) OVER (ORDER BY t.year_, t.quarter_) AS NUMERIC), 2) AS "Percentage Previous Revenue after Discount Change",
    
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
ORDER BY t.year_, t.quarter_;

-- Adding primary key constraint
ALTER TABLE public.trend_of_quarter_analysis
ADD CONSTRAINT trend_of_quarter_analysis_pk PRIMARY KEY ("Year", "Quarter");

      `);
      console.log(`Table "trend_of_quarter_analysis" created and data inserted successfully.`);
  } catch (err) {
      console.error('Error executing queries', err);
  };
};

module.exports = {
  trend_of_quarter_analysis,
}