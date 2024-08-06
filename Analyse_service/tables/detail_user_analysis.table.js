const client = require('../config/database');

const detail_user_analysis = async () => {
  try {
    await client.query(`
DROP TABLE IF EXISTS public.detail_user_analysis;

WITH Valid_Transaction AS (
    SELECT 
        user_id AS id,
        date_trunc('month', merged_start_time) AS time_,
        EXTRACT(YEAR FROM merged_start_time) AS year_,
        EXTRACT(MONTH FROM merged_start_time) AS month_,
        COUNT(invoice_id) AS transaction_event,
        SUM(CASE WHEN promotion_discount > 0 THEN 1 ELSE 0 END) AS number_discount
    FROM public.valid_transaction
    GROUP BY 
	user_id, 
	date_trunc('month', merged_start_time), 
	EXTRACT(YEAR FROM merged_start_time), 
	EXTRACT(MONTH FROM merged_start_time)
),
Customer_classification AS (
    SELECT 
        COALESCE(VT1.id, VT2.id) AS userid,
        VT1.time_ AS time_current,
        VT1.year_ AS year_current,
        VT1.month_ AS month_current,
        VT1.transaction_event AS transaction_current,
        VT1.number_discount AS number_discount_current,

        VT2.time_ AS time_previous,
        VT2.year_ AS year_previous,
        VT2.month_ AS month_previous,
        VT2.transaction_event AS transaction_previous,
        VT2.number_discount AS number_discount_previous

    FROM Valid_Transaction VT1
    FULL JOIN Valid_Transaction VT2 ON VT1.id = VT2.id AND VT1.time_ = (VT2.time_ + interval '1 month')
),
Filter_user  AS (
    SELECT 
        CC.userid,
        AU.user_name AS username,
        AU.email,
        AU.phone_number,
        COALESCE(CC.time_current, (CC.time_previous + interval '1 month')) AS time_current,
        CC.transaction_current,
        CC.number_discount_current,
        CC.transaction_previous,
        CC.number_discount_previous,
		CASE 
			WHEN CC.Time_Current IS NULL THEN 'Inactive User'
			WHEN CC.Time_Previous IS NULL THEN (
				CASE 
					WHEN CC.Time_Current = (
						SELECT MIN(time_)
						FROM Valid_transaction VT
						WHERE VT.id = CC.Userid
					) THEN 'New Active User'
					ELSE 'Returning Active User'
				END
			)
			WHEN CAST(CC.Transaction_current AS FLOAT) / CC.Transaction_previous <= 0.5 THEN 'User Charges Less Than Previous Month'
			ELSE 'Fewer Discount Codes Used'
		END AS status_
    FROM Customer_classification CC 
    LEFT JOIN public.app_user AU ON AU.user_id = CC.userid
    WHERE 
        (
			CC.transaction_current IS NULL 
        	OR CC.transaction_previous IS NULL
        	OR CAST(CC.transaction_current AS FLOAT) / CC.transaction_previous <= 0.5
        	OR CAST(CC.number_discount_current AS FLOAT) / CC.transaction_current <= 0.5
		)
        AND (
			time_previous != date_trunc('month', current_date)::date
			OR time_previous IS NULL
			)
),
TMP AS (
    SELECT
        userid as "User ID",
        username as "User Name",
        email as "Email",
        phone_number as "Phone Number",
	    EXTRACT(MONTH FROM time_current) AS "Month",
        EXTRACT(YEAR FROM time_current) AS "Year",
		time_current as "Time",
        transaction_current as "Number of Transaction Events This Month",
        number_discount_current as "Number of Discount This Month",
        transaction_previous as "Number of Transaction Events Previous Month",
        number_discount_previous as "Number of Discount Last Month",
        status_ as "Comment"
    FROM Filter_user
)
SELECT * INTO public.detail_user_analysis FROM TMP;
      `);
      console.log(`Table "detail_user_analysis"      created and data inserted successfully.`);
  } catch (err) {
      console.error('Error executing queries', err);
  };
};

module.exports = {
  detail_user_analysis,
}