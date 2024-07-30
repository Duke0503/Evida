const client = require('../config/database');

const app_user_analysis = async () => {
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
    END AS "Group ID"
FROM (
    SELECT 
        Y.*, 
        CASE 
            WHEN "Revenue without Discount" + "Discount Pricing" > 0 THEN ROUND(("Revenue without Discount"::numeric / ("Revenue without Discount"::numeric + "Discount Pricing"::numeric)) * 100, 2) 
            ELSE NULL 
        END AS "%REVENUE/REVENUE_WO", 
        CASE 
            WHEN "Revenue without Discount" + "Discount Pricing" > 0 THEN ROUND((100 - ("Revenue without Discount"::numeric / ("Revenue without Discount"::numeric + "Discount Pricing"::numeric)) * 100), 2) 
            ELSE NULL 
        END AS "%PROMOTION/REVENUE_WO", 
        CASE 
            WHEN "Transaction Events" > 0 THEN ROUND(("Power Consumption"::numeric / "Transaction Events"::numeric), 4) 
            ELSE NULL 
        END AS AVG_POWER, 
        CASE 
            WHEN "Transaction Events" > 0 THEN ROUND(("Number of Discounts"::numeric / "Transaction Events"::numeric) * 100, 4) 
            ELSE NULL 
        END AS "AVG_NUMBER_PRO%",  
        CASE 
            WHEN "Consecutive Months" > 0 THEN ROUND(("Transaction Events"::numeric / "Consecutive Months"), 4) 
            ELSE NULL 
        END AS "CHARGING/MONTH"
    FROM (
        SELECT 
            X."User ID", 
            COUNT("Time") AS "Consecutive Months", 
            SUM("Power Consumption") as "Power Consumption", 
            SUM("Transaction Events") as "Transaction Events", 
            SUM("Activation Fee") / 1000000 as "Activation Fee", 
            SUM("kWh Fee") / 1000000 as "kWh Fee", 
            SUM("Discount Pricing") / 1000000 as "Discount Pricing",  
            SUM("Number of Discounts") as "Number of Discounts", 
            SUM("Revenue without Discount") / 1000000 as "Revenue without Discount"
        FROM (
            SELECT 
                user_id as "User ID", 
                TO_CHAR(merged_start_time, 'YYYY-MM') AS "Time", 
                SUM(wattage_consumed) AS "Power Consumption", 
                COUNT(invoice_id) AS "Transaction Events", 
                SUM(activation_fee) AS "Activation Fee", 
                SUM(total_consumed_fee) AS "kWh Fee", 
                SUM(discount_amount) AS "Discount Pricing", 
                COUNT(CASE WHEN discount_amount > 0 THEN 1 ELSE NULL END) AS "Number of Discounts", 
                SUM(paid) AS "Revenue without Discount"
            FROM valid_transaction 
            WHERE EXTRACT(YEAR FROM merged_start_time) = EXTRACT(YEAR FROM CURRENT_DATE)
            GROUP BY user_id, TO_CHAR(merged_start_time, 'YYYY-MM')
        ) X
        GROUP BY X."User ID"
    ) Y
) Z;

DROP TABLE IF EXISTS customer_group;

CREATE TABLE customer_group (
    ID SERIAL PRIMARY KEY,
    GROUP_USER VARCHAR(255)
);

INSERT INTO customer_group(GROUP_USER) VALUES
('High consumed, charge frequently, unaware of promotion.'),
('High consumed, charge frequently, newly aware of promotion.'),
('High consumed, charge frequently, often use discounts.'),

('Low consumed, charge frequently, unaware of promotion.'),
('Low consumed, charge frequently, newly aware of promotion.'),
('Low consumed, charge frequently, often use discounts.'),

('Low consumed, charge occasionally, unaware of promotion.'),
('Low consumed, charge occasionally, newly aware of promotion.'),
('Low consumed, charge occasionally, often use discounts.'),

('High consumed, charge occasionally, unaware of promotion.'),
('High consumed, charge occasionally, newly aware of promotion.'),
('High consumed, charge occasionally, often use discounts.'),

('High consumed, charge rarely, unaware of promotion.'),
('High consumed, charge rarely, newly aware of promotion.'),
('High consumed, charge rarely, often use discounts.'),

('Low consumed, charge rarely, unaware of promotion.'),
('Low consumed, charge rarely, newly aware of promotion.'),
('Low consumed, charge rarely, often use discounts.'),

('High consumed, charge frequently, charging free'),
('Low consumed, charge frequently, charging free'),

('High consumed, charge occasionally, charging free'),
('Low consumed, charge occasionally, charging free'),

('High consumed, charge rarely, charging free'),
('Low consumed, charge rarely, charging free');

DROP TABLE IF EXISTS app_user_analysis;

CREATE TABLE app_user_analysis AS
SELECT
    AU.user_name as "User Name",
    AU.email as "Email",
    AU.phone_number as "Phone Number",
    UA.*,
    CG.group_user AS "Group Name"
FROM user_analysis UA
LEFT JOIN customer_group CG ON UA."Group ID" = CG.id
LEFT JOIN app_user AU ON UA."User ID" = AU.user_id;

      `);
      console.log("Table app_user_analysis created and data inserted successfully.");
  } catch (err) {
      console.error('Error executing queries', err);
  };
};

module.exports = {
  app_user_analysis,
}