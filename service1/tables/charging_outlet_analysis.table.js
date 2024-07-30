const client = require('../config/database');

const charging_outlet_analysis = async () => {
  try {
    await client.query(`      
DROP TABLE IF EXISTS public.charging_outlet_analysis;

CREATE TABLE public.charging_outlet_analysis AS
SELECT 
    Trans.box_id as "Box ID",
    B.box_name as "Location Name",
    Trans.outlet_id as "Outlet Number",
    date_trunc('month', Trans.merged_start_time) AS "Time",
    EXTRACT(YEAR FROM Trans.merged_start_time) AS "Year",
    EXTRACT(MONTH FROM Trans.merged_start_time) AS "Month",
    COUNT(DISTINCT Trans.user_id) AS "Active Users",
    COUNT(Trans.invoice_id) AS "Transaction Events",
    SUM(Trans.wattage_consumed) AS "Power Consumption",
    SUM(Trans.activation_fee) AS "Activation Fee",
    SUM(Trans.total_consumed_fee) AS "kWh Fee",
    SUM(Trans.discount_amount) AS "Discount Pricing",
    SUM(Trans.paid) AS "Revenue after Discount",
    CASE WHEN COUNT(Trans.invoice_id) > 39 THEN 100 ELSE ROUND((COUNT(Trans.invoice_id)::numeric / 40) * 100, 2) END AS "Utilization"
FROM public.valid_transaction Trans
JOIN public.boxes B ON Trans.box_id = B.box_id
GROUP BY Trans.box_id, B.box_name, Trans.outlet_id, EXTRACT(YEAR FROM Trans.merged_start_time), EXTRACT(MONTH FROM Trans.merged_start_time), date_trunc('month', Trans.merged_start_time)
ORDER BY "Year" DESC, "Month" DESC;

      `);
    console.log("Table charging_outlet_analysis created and data inserted successfully.");
  } catch (err) {
      console.error('Error executing queries', err);
  }
};

module.exports = {
  charging_outlet_analysis
};