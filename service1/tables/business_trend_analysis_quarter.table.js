const client = require('../config/database');

const business_trend_analysis_quarter = async () => {
  try {
    await client.query(`

DROP TABLE IF EXISTS public.business_trend_analysis_quarter;

CREATE TABLE public.business_trend_analysis_quarter AS
SELECT
    tq.*,
    ibpq.boxes_installed_in_quarter,
    ibpq.boxes_installed_before_quarter,
    ibpq.total_boxes
FROM
    public.trend_of_quarter tq
JOIN
    public.installed_box_per_quarter ibpq
ON
    tq.year_ = ibpq.year_
    AND tq.quarter_ = ibpq.quarter_;

      `)
    console.log("Table business_trend_analysis_quarter created and data inserted successfully.");
  } catch (err) {
      console.error('Error executing queries', err);
  };
}

module.exports = { business_trend_analysis_quarter };