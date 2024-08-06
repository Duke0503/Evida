const client = require('../config/database');

const detail_box_analysis = async () => {
  try {
    await client.query(`
DROP TABLE IF EXISTS public.detail_box_analysis;
CREATE TABLE detail_box_analysis AS (
	SELECT 
    CASE 
        WHEN CBA2."Box ID" IS NULL THEN CBA1."Box ID" 
        ELSE CBA2."Box ID" 
    END AS "Box ID",
	CASE 
        WHEN CBA1."Time" IS NULL THEN 'ACTIVE' 
        ELSE 'INACTIVE'
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
      console.log(`Table "detail_box_analysis"       created and data inserted successfully.`);
  } catch (err) {
      console.error('Error executing queries', err);
  };
};

module.exports = {
  detail_box_analysis,
}