const client = require('../config/database');

const app_user_analysis = async () => {
  try {
    await client.query(`
DROP TABLE IF EXISTS app_user_analysis;

CREATE TABLE app_user_analysis AS
WITH user_analysis AS (
    SELECT 
        Z.*, 
        CASE 
            WHEN AVG_POWER >= 1.5 THEN 'High'
            ELSE 'Low'
        END AS Consumed,
        CASE 
            WHEN "CHARGING/MONTH" > 19 THEN 'Frequently'
            WHEN "CHARGING/MONTH" BETWEEN 10 AND 19 THEN 'Occasionally'
            ELSE 'Rarely'
        END AS charge,
        CASE
            WHEN "%REVENUE/REVENUE_WO" IS NULL OR "%PROMOTION/REVENUE_WO" IS NULL THEN 'Charging free'
            WHEN "AVG_NUMBER_PRO%" < 20 THEN 'Unaware of promotion'
            WHEN "AVG_NUMBER_PRO%" < 60 THEN 'Newly aware of promotion'
            ELSE 'Often use discounts'
        END AS promotion_usage
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
                WHEN "Consecutive Months in Year" > 0 THEN ROUND(("Transaction Events"::numeric / "Consecutive Months in Year"), 4) 
                ELSE NULL 
            END AS "CHARGING/MONTH"
        FROM (
            SELECT 
                X."User ID", 
                COUNT("Time") AS "Consecutive Months in Year", 
                MAX("Time") AS "Last Used",
                SUM("Power Consumption") AS "Power Consumption", 
                SUM("Transaction Events") AS "Transaction Events", 
                SUM("Activation Fee") / 1000000 AS "Activation Fee", 
                SUM("kWh Fee") / 1000000 AS "kWh Fee", 
                SUM("Discount Pricing") / 1000000 AS "Discount Pricing",  
                SUM("Number of Discounts") AS "Number of Discounts", 
                SUM("Revenue without Discount") / 1000000 AS "Revenue without Discount"
            FROM (
                SELECT 
                    user_id AS "User ID", 
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
    ) Z
)
SELECT
    AU.user_name AS "User Name",
    AU.email AS "Email",
    AU.phone_number AS "Phone Number",
    UA.*
FROM user_analysis UA
LEFT JOIN app_user AU ON UA."User ID" = AU.user_id;

      `);
      console.log(`Table "app_user_analysis"         created and data inserted successfully.`);
  } catch (err) {
      console.error('Error executing queries', err);
  };
};

module.exports = {
  app_user_analysis,
}