const client = require('../config/database');

const user_analysis_monthly = async () => {
  try {
    await client.query(`
DROP TABLE IF EXISTS public.user_analysis_monthly;

CREATE TABLE user_analysis_monthly AS 
SELECT  
  VT.user_id as "User ID"
  ,AU.user_name as "User Name"
  ,AU.email as "Email"
  ,AU.phone_number as "Phone Number"
  ,EXTRACT(YEAR FROM VT.merged_start_time) AS "Year" 
  ,EXTRACT(MONTH FROM VT.merged_start_time) AS "Month"
  ,SUM(VT.wattage_consumed) AS "Power Consumption"
  ,COUNT(VT.*) AS "Number of Transaction Events"
  ,SUM(VT.paid) AS "Revenue after Discount"
  ,SUM(VT.discount_amount) AS "Discount"
  ,SUM(CASE WHEN VT.promotion_discount > 0 THEN 1 ELSE 0 END) AS "Number of Discounts"
  ,SUM(VT.activation_fee) AS "Activation Fee"
FROM valid_transaction VT
LEFT JOIN app_user AU ON VT.user_id = AU.user_id
GROUP BY 
  VT.user_id
  ,AU.user_name
  ,AU.email
  ,AU.phone_number
  ,EXTRACT(YEAR FROM VT.merged_start_time) 
  ,EXTRACT(MONTH FROM VT.merged_start_time)
      `)
    console.log(`Table "user_analysis_monthly"         created and data inserted successfully.`);
  } catch (err) {
      console.error('Error executing queries', err);
  };
}

module.exports = { user_analysis_monthly };