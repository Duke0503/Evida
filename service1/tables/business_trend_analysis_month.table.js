const client = require('../config/database');

const business_trend_analysis_month = async () => {
  try {
    await client.query(`

DROP TABLE IF EXISTS public.business_trend_analysis_month;

CREATE TABLE public.business_trend_analysis_month AS
SELECT
    t.*,
    ib.boxes_installed_in_month,
    ib.boxes_installed_before_month,
    ib.total_boxes
FROM
    public.trend_of_month t
JOIN
    public.installed_box_per_month ib
ON
    t.time_current = ib.month_year;

ALTER TABLE public.business_trend_analysis_month
ADD CONSTRAINT business_trend_analysis_month_pk PRIMARY KEY (time_current);
      `)
    console.log("Table business_trend_analysis_month created and data inserted successfully.");
  } catch (err) {
      console.error('Error executing queries', err);
  };
}

module.exports = { business_trend_analysis_month };