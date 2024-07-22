const client = require('../config/database');

const charging_box_analysis = async () => {
  try {
    await client.query(`      
DROP TABLE IF EXISTS public.charging_box_analysis;

-- Create the new table with the additional box_name column
CREATE TABLE public.charging_box_analysis AS
SELECT 
    b.box_id,
    b.box_name,
    date_trunc('month', Trans.merged_start_time) + interval '1 month - 1 day' AS TIME_,
    EXTRACT(YEAR FROM Trans.merged_start_time) AS YEAR_,
    EXTRACT(MONTH FROM Trans.merged_start_time) AS MONTH_,
    COUNT(DISTINCT Trans.user_id) AS ACTIVE_USER,
    COUNT(Trans.invoice_id) AS CHARGING_EVENT,
    SUM(Trans.wattage_consumed) AS TOTAL_POWER_kWh,
    SUM(Trans.activation_fee) AS ACTIVATION_FEE,
    SUM(Trans.total_consumed_fee) AS kWh_FEE,
    SUM(Trans.discount_amount) AS PROMOTION,
    SUM(Trans.paid) AS TOTAL_COST_VNĐ,
    CASE WHEN COUNT(Trans.invoice_id) > 39 THEN 100 ELSE ROUND((COUNT(Trans.invoice_id)::numeric / 40) * 100, 2) END AS EFFECTIVE
FROM public.valid_transaction Trans
JOIN public.boxes b ON Trans.box_id = b.box_id
GROUP BY b.box_id, b.box_name, EXTRACT(YEAR FROM Trans.merged_start_time), EXTRACT(MONTH FROM Trans.merged_start_time), date_trunc('month', Trans.merged_start_time) + interval '1 month - 1 day'
ORDER BY YEAR_ DESC, MONTH_ DESC;

      `);
    console.log("Table charging_box_analysis created and data inserted successfully.");
  } catch (err) {
      console.error('Error executing queries', err);
  }
};

module.exports = {
  charging_box_analysis
};