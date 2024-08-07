const client = require('../config/database');

const promotion_analysis = async () => {
  try {
    await client.query(`      
DROP TABLE IF EXISTS public.promotion_analysis;

CREATE TABLE promotion_analysis AS (
WITH CTE1 AS (
  SELECT 
    merged_start_time
    ,UPPER(promotion_code) AS promotion_code
    ,promotion_discount
  FROM valid_transaction
  WHERE promotion_discount > 0
),
CTE2 AS (
  SELECT 
    promotion_code,
    promotion_discount,
    MIN(merged_start_time) AS Start_day,
    MAX(merged_start_time) AS End_day
  FROM CTE1
  GROUP BY promotion_code, promotion_discount 
)
SELECT 
  CTE2.promotion_code AS "Promotion Code", 
  CTE2.promotion_discount AS "% Promotion Discount",
  TO_CHAR(CTE2.Start_day, 'YYYY-MM-DD') AS "Start Day", 
  TO_CHAR(CTE2.End_day, 'YYYY-MM-DD') AS "End Day", 
  (End_day::date - Start_day::date) AS "Total Time (Day)",
  COUNT(valid_transaction.promotion_code) AS "Number of Discounts Used"
FROM valid_transaction
JOIN CTE2 ON UPPER(valid_transaction.promotion_code) = CTE2.promotion_code
GROUP BY CTE2.promotion_code, CTE2.Start_day, CTE2.End_day, CTE2.promotion_discount
)
      `);
    console.log(`Table "promotion_analysis"         created and data inserted successfully.`);
  } catch (err) {
      console.error('Error executing queries', err);
  }
};

module.exports = {
  promotion_analysis
};