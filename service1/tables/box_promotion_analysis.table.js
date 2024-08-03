const client = require('../config/database');

const box_promotion_analysis = async () => {
  try {
    await client.query(`
DROP TABLE IF EXISTS public.box_promotion_analysis;

CREATE TABLE public.box_promotion_analysis AS
SELECT 
	EXTRACT(YEAR FROM merged_start_time) AS "Year",
  	EXTRACT(MONTH FROM merged_start_time) AS "Month",
    box_id as "Box ID",
    COUNT(DISTINCT invoice_id) AS "Number of Transaction Events",
    COUNT(DISTINCT user_id) AS "Number of Active Users",
     ROUND(SUM(wattage_consumed)::NUMERIC, 3) AS "Power Consumption(kWh)",
    COUNT(CASE WHEN promotion_discount > 0 THEN 1 ELSE NULL END) AS "Number of Promotions",
 	 COUNT(CASE WHEN promotion_discount = 0 THEN 1 ELSE NULL END) AS "Promotion = 0",
    COUNT(CASE WHEN promotion_discount = 30 THEN 1 ELSE NULL END) AS "Promotion = 30%",
    COUNT(CASE WHEN promotion_discount = 50 THEN 1 ELSE NULL END) AS "Promotion = 50%",
    COUNT(CASE WHEN promotion_discount = 49 THEN 1 ELSE NULL END) AS "Promotion = 49%",
	 COUNT(CASE WHEN promotion_discount = 100 THEN 1 ELSE NULL END) AS "Promotion = 100%"
FROM public.valid_transaction
GROUP BY "Month", "Year", "Box ID";

      `);
      console.log(`Table "box_promotion_analysis"    created and data inserted successfully.`);
  } catch (err) {
      console.error('Error executing queries', err);
  };
};

module.exports = {
  box_promotion_analysis,
}