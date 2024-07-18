const client = require('../config/database');

const installed_box_per_month = async () => {
  try {
    await client.query(`

DROP TABLE IF EXISTS public.installed_box_per_month;

CREATE TABLE IF NOT EXISTS public.installed_box_per_month (
    month_year DATE PRIMARY KEY,
    boxes_installed_in_month INTEGER,
    boxes_installed_before_month INTEGER,
    total_boxes INTEGER
);

WITH monthly_boxes AS (
    SELECT 
        DATE_TRUNC('month', created_at) + INTERVAL '1 month - 1 day' AS month_year,
        COUNT(*) AS boxes_installed_in_month
    FROM public.boxes
    WHERE CAST(SUBSTRING(box_id FROM '[0-9]+') AS INTEGER) >= 10
    GROUP BY DATE_TRUNC('month', created_at)
),
cumulative_boxes AS (
    SELECT 
        month_year,
        boxes_installed_in_month,
        SUM(boxes_installed_in_month) OVER (ORDER BY month_year ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING) AS boxes_installed_before_month
    FROM monthly_boxes
)
INSERT INTO public.installed_box_per_month (month_year, boxes_installed_in_month, boxes_installed_before_month, total_boxes)
SELECT 
    month_year,
    boxes_installed_in_month,
    COALESCE(boxes_installed_before_month, 0) AS boxes_installed_before_month,
    boxes_installed_in_month + COALESCE(boxes_installed_before_month, 0) AS total_boxes
FROM cumulative_boxes
ORDER BY month_year;
      `)
    console.log("Table installed_box_per_month created and data inserted successfully.");
  } catch (err) {
      console.error('Error executing queries', err);
  };
}

module.exports = { installed_box_per_month };