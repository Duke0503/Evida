const client = require('../config/database');

const charging_box_analysis = async () => {
  try {
    await client.query(`      
DROP TABLE IF EXISTS public.charging_box_analysis;

CREATE TABLE public.charging_box_analysis AS
SELECT 
    b.box_id as "Box ID",
    b.box_name as "Location Name",
    date_trunc('month', Trans.merged_start_time) AS "Time",
    EXTRACT(YEAR FROM Trans.merged_start_time) AS "Year",
    EXTRACT(MONTH FROM Trans.merged_start_time) AS "Month",
    COUNT(DISTINCT Trans.user_id) AS "Active Users",
    COUNT(Trans.invoice_id) AS "Transaction Events",
    SUM(Trans.wattage_consumed) AS "Power Consumption",
    SUM(Trans.activation_fee) / 1000000 AS "Activation Fee (Million VND)",
    SUM(Trans.total_consumed_fee) / 1000000 AS "kWh Fee (Million VND)",
    SUM(Trans.discount_amount) / 1000000 AS "Discount (Million VND)",
    SUM(Trans.paid) / 1000000 AS "Revenue after Discount (Million VND)",
    CASE WHEN COUNT(Trans.invoice_id) > 40 * ao.number_of_active_outlets THEN 100 ELSE ROUND((COUNT(Trans.invoice_id)::numeric /(40 * ao.number_of_active_outlets) ) * 100, 2) END AS "Utilization"
FROM public.valid_transaction Trans
JOIN public.boxes b ON Trans.box_id = b.box_id
LEFT JOIN public.active_outlet ao ON b.box_id = ao.box_id
GROUP BY b.box_id, b.box_name, ao.number_of_active_outlets, EXTRACT(YEAR FROM Trans.merged_start_time), EXTRACT(MONTH FROM Trans.merged_start_time), date_trunc('month', Trans.merged_start_time) 
ORDER BY "Year" DESC, "Month" DESC;

      `);
    console.log(`Table "charging_box_analysis"     created and data inserted successfully.`);
  } catch (err) {
      console.error('Error executing queries', err);
  }
};

module.exports = {
  charging_box_analysis
};