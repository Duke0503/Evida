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
    SUM(Trans.activation_fee) AS "Activation Fee",
    SUM(Trans.total_consumed_fee) AS "kWh Fee",
    SUM(Trans.discount_amount) AS "Discount Pricing",
    SUM(Trans.paid) AS "Revenue without Discount",
    CASE WHEN COUNT(Trans.invoice_id) > 39 THEN 100 ELSE ROUND((COUNT(Trans.invoice_id)::numeric / 40) * 100, 2) END AS "Utilization"
FROM public.valid_transaction Trans
JOIN public.boxes b ON Trans.box_id = b.box_id
GROUP BY b.box_id, b.box_name, EXTRACT(YEAR FROM Trans.merged_start_time), EXTRACT(MONTH FROM Trans.merged_start_time), date_trunc('month', Trans.merged_start_time) 
ORDER BY "Year" DESC, "Month" DESC;

---- Detail Box Analysis ----
DROP TABLE IF EXISTS public.detail_box_analysis;
CREATE TABLE detail_box_analysis AS (
	SELECT 
    CASE 
        WHEN CBA2."Box ID" IS NULL THEN CBA1."Box ID" 
        ELSE CBA2."Box ID" 
    END AS "Box ID",
	CASE 
        WHEN CBA1."Time" IS NULL THEN 'ACTIVE' 
        ELSE 'UNACTIVE'
    END AS "Status",
    CASE 
		WHEN CBA1."Location Name" IS NULL then CBA2."Location Name"
		ELSE CBA1."Location Name"
	END AS "Location Name"
	
FROM charging_box_analysis CBA1
FULL JOIN charging_box_analysis CBA2 
    ON CBA1."Box ID" = CBA2."Box ID" 
    AND DATE_PART('month', AGE(CBA2."Time", CBA1."Time")) = 1
WHERE 
    (
        (
            EXTRACT(MONTH FROM CURRENT_DATE) = 1 
            AND EXTRACT(YEAR FROM CBA1."Time") = EXTRACT(YEAR FROM CURRENT_DATE) - 1 
            AND EXTRACT(MONTH FROM CBA1."Time") = 12
        )
        OR (
            EXTRACT(MONTH FROM CURRENT_DATE) <> 1 
            AND EXTRACT(YEAR FROM CBA1."Time") = EXTRACT(YEAR FROM CURRENT_DATE) 
            AND EXTRACT(MONTH FROM CBA1."Time") = EXTRACT(MONTH FROM CURRENT_DATE) - 1
        )
        OR (
            EXTRACT(YEAR FROM CBA2."Time") = EXTRACT(YEAR FROM CURRENT_DATE) 
            AND EXTRACT(MONTH FROM CBA2."Time") = EXTRACT(MONTH FROM CURRENT_DATE)
        )
    )
    AND (CBA2."Time" IS NULL OR CBA1."Time" IS NULL)
)
      `);
    console.log("Table charging_box_analysis created and data inserted successfully.");
  } catch (err) {
      console.error('Error executing queries', err);
  }
};

module.exports = {
  charging_box_analysis
};