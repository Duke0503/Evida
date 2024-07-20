const client = require('../config/database');

const user_analysis = async () => {
  try {
    await client.query(`

DROP TABLE IF EXISTS public.user_analysis;

CREATE TABLE public.user_analysis AS
SELECT 
    Z.*, 
    CASE 
		WHEN "CHARGING/MONTH" > 19 AND AVG_POWER >= 1.5 AND ("%REVENUE/REVENUE_WO" IS NULL OR "%PROMOTION/REVENUE_WO" IS NULL) THEN 19						--'High consumed, charge frequently, charging free'
		WHEN "CHARGING/MONTH" > 19 AND AVG_POWER < 1.5 AND ("%REVENUE/REVENUE_WO" IS NULL OR "%PROMOTION/REVENUE_WO" IS NULL) THEN 20						--'Low consumed, charge frequently, charging free'

		WHEN ("CHARGING/MONTH" BETWEEN 10 AND 19) AND AVG_POWER >= 1.5 AND ("%REVENUE/REVENUE_WO" IS NULL OR "%PROMOTION/REVENUE_WO" IS NULL) THEN 21		--'High consumed, charge occasionally, charging free'
		WHEN ("CHARGING/MONTH" BETWEEN 10 AND 19) AND AVG_POWER < 1.5 AND ("%REVENUE/REVENUE_WO" IS NULL OR "%PROMOTION/REVENUE_WO" IS NULL) THEN 22		--'Low consumed, charge occasionally, charging free'

		WHEN AVG_POWER >= 1.5 AND ("%REVENUE/REVENUE_WO" IS NULL OR "%PROMOTION/REVENUE_WO" IS NULL) THEN 23												--'High consumed, charge rarely, charging free'
		WHEN AVG_POWER < 1.5 AND ("%REVENUE/REVENUE_WO" IS NULL OR "%PROMOTION/REVENUE_WO" IS NULL) THEN 24													--'Low consumed, charge rarely, charging free'


        WHEN "CHARGING/MONTH" > 19 AND AVG_POWER >= 1.5 AND "AVG_NUMBER_PRO%" < 20 THEN 1 -- 'High consumed, charge frequently, unaware of promotion.'
        WHEN "CHARGING/MONTH" > 19 AND AVG_POWER >= 1.5 AND "AVG_NUMBER_PRO%" < 60 THEN 2 -- 'High consumed, charge frequently, newly aware of promotion.'
        WHEN "CHARGING/MONTH" > 19 AND AVG_POWER >= 1.5 THEN 3 -- 'High consumed, charge frequently, often use discounts.'

        WHEN "CHARGING/MONTH" > 19 AND AVG_POWER < 1.5 AND "AVG_NUMBER_PRO%" < 20 THEN 4 -- 'Low consumed, charge frequently, unaware of promotion.'
        WHEN "CHARGING/MONTH" > 19 AND AVG_POWER < 1.5 AND "AVG_NUMBER_PRO%" < 60 THEN 5 -- 'Low consumed, charge frequently, newly aware of promotion.'
        WHEN "CHARGING/MONTH" > 19 AND AVG_POWER < 1.5 THEN 6 -- 'Low consumed, charge frequently, often use discounts.'

        WHEN ("CHARGING/MONTH" BETWEEN 10 AND 19) AND AVG_POWER < 1.5 AND "AVG_NUMBER_PRO%" < 20 THEN 7 -- 'Low consumed, charge occasionally, unaware of promotion.'
        WHEN ("CHARGING/MONTH" BETWEEN 10 AND 19) AND AVG_POWER < 1.5 AND "AVG_NUMBER_PRO%" < 60 THEN 8 -- 'Low consumed, charge occasionally, newly aware of promotion.'
        WHEN ("CHARGING/MONTH" BETWEEN 10 AND 19) AND AVG_POWER < 1.5 THEN 9 -- 'Low consumed, charge occasionally, often use discounts.'

        WHEN ("CHARGING/MONTH" BETWEEN 10 AND 19) AND AVG_POWER >= 1.5 AND "AVG_NUMBER_PRO%" < 20 THEN 10 -- 'High consumed, charge occasionally, unaware of promotion.'
        WHEN ("CHARGING/MONTH" BETWEEN 10 AND 19) AND AVG_POWER >= 1.5 AND "AVG_NUMBER_PRO%" < 60 THEN 11 -- 'High consumed, charge occasionally, newly aware of promotion.'
        WHEN ("CHARGING/MONTH" BETWEEN 10 AND 19) AND AVG_POWER >= 1.5 THEN 12 -- 'High consumed, charge occasionally, often use discounts.'

        WHEN AVG_POWER >= 1.5 AND "AVG_NUMBER_PRO%" < 20 THEN 13 -- 'High consumed, charge rarely, unaware of promotion.'
        WHEN AVG_POWER >= 1.5 AND "AVG_NUMBER_PRO%" < 60 THEN 14 -- 'High consumed, charge rarely, often use discounts.'
        WHEN AVG_POWER >= 1.5 THEN 15 -- 'High consumed, charge rarely, often use discounts.'

        WHEN "AVG_NUMBER_PRO%" < 20 THEN 16 -- 'Low consumed, charge rarely, unaware of promotion.'
        WHEN "AVG_NUMBER_PRO%" < 60 THEN 17 -- 'Low consumed, charge rarely, newly aware of promotion.'
        ELSE 18 -- 'Low consumed, charge rarely, often use discounts.'
    END AS group_customer
FROM (
    SELECT 
        Y.*, 
        CASE 
            WHEN PAID_TOTAL + PROMOTION > 0 THEN ROUND((PAID_TOTAL::numeric / (PAID_TOTAL::numeric + PROMOTION::numeric)) * 100, 2) 
            ELSE NULL 
        END AS "%REVENUE/REVENUE_WO", 
        CASE 
            WHEN PAID_TOTAL + PROMOTION > 0 THEN ROUND((100 - PAID_TOTAL::numeric / (PAID_TOTAL::numeric + PROMOTION::numeric)) * 100, 2) 
            ELSE NULL 
        END AS "%PROMOTION/REVENUE_WO", 
        CASE 
            WHEN NUMBER_CHARGING > 0 THEN ROUND((TOTAL_POWER::numeric / NUMBER_CHARGING::numeric), 4) 
            ELSE NULL 
        END AS AVG_POWER, 
        CASE 
            WHEN NUMBER_CHARGING > 0 THEN ROUND((NUMBER_PROMOTION::numeric / NUMBER_CHARGING::numeric) * 100, 4) 
            ELSE NULL 
        END AS "AVG_NUMBER_PRO%",  
        CASE 
            WHEN NUMBER_MONTH > 0 THEN ROUND((NUMBER_CHARGING::numeric / NUMBER_MONTH), 4) 
            ELSE NULL 
        END AS "CHARGING/MONTH"
    FROM (
        SELECT 
            X.user_id, 
            COUNT(time_) AS NUMBER_MONTH, 
            SUM(TOTAL_POWER) AS TOTAL_POWER, 
            SUM(NUMBER_CHARGING) AS NUMBER_CHARGING, 
            SUM(ACTIVE_FEE) AS ACTIVE_FEE, 
            SUM(kWh_FEE) AS kWh_FEE, 
            SUM(PROMOTION) AS PROMOTION, 
            SUM(NUMBER_PROMOTION) AS NUMBER_PROMOTION, 
            SUM(PAID_TOTAL) AS PAID_TOTAL
        FROM (
            SELECT 
                user_id, 
                TO_CHAR(merged_start_time, 'YYYY-MM') AS time_, 
                SUM(wattage_consumed) AS TOTAL_POWER, 
                COUNT(invoice_id) AS NUMBER_CHARGING, 
                SUM(activation_fee) AS ACTIVE_FEE, 
                SUM(total_fee - activation_fee) AS kWh_FEE, 
                SUM(discount_amount) AS PROMOTION, 
                COUNT(CASE WHEN promotion_discount > 0 THEN 1 ELSE NULL END) AS NUMBER_PROMOTION, 
                SUM(paid) AS PAID_TOTAL
            FROM valid_transaction 
            WHERE EXTRACT(YEAR FROM merged_start_time) = EXTRACT(YEAR FROM CURRENT_DATE)
            GROUP BY user_id, TO_CHAR(merged_start_time, 'YYYY-MM')
        ) X
        GROUP BY X.user_id
    ) Y
) Z;

      `)
    console.log("Table user_analysis created and data inserted successfully.");
  } catch (err) {
      console.error('Error executing queries', err);
  };
}

module.exports = { user_analysis };