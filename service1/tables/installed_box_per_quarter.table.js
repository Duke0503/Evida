const client = require('../config/database');

const installed_box_per_quarter = async () => {
  try {
    await client.query(`

DROP TABLE IF EXISTS public.installed_box_per_quarter;

CREATE TABLE IF NOT EXISTS public.installed_box_per_quarter (
    year_ NUMERIC,
    quarter_ NUMERIC,
    time_ DATE,
    boxes_installed_in_quarter INTEGER,
    boxes_installed_before_quarter INTEGER,
    total_boxes INTEGER,
    PRIMARY KEY (year_, quarter_)
);

WITH quarterly_boxes AS (
    SELECT 
        EXTRACT(YEAR FROM created_at) AS year_,
        EXTRACT(QUARTER FROM created_at) AS quarter_,
        COUNT(*) AS boxes_installed_in_quarter
    FROM public.boxes
    WHERE CAST(SUBSTRING(box_id FROM '[0-9]+') AS INTEGER) >= 10
    GROUP BY EXTRACT(YEAR FROM created_at), EXTRACT(QUARTER FROM created_at)
),
cumulative_boxes AS (
    SELECT 
        year_,
        quarter_,
        boxes_installed_in_quarter,
        SUM(boxes_installed_in_quarter) OVER (ORDER BY year_, quarter_ ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING) AS boxes_installed_before_quarter
    FROM quarterly_boxes
)
INSERT INTO public.installed_box_per_quarter (year_, quarter_, time_, boxes_installed_in_quarter, boxes_installed_before_quarter, total_boxes)
SELECT 
    year_,
    quarter_,
    (DATE_TRUNC('quarter', TO_DATE(year_ || '-' || quarter_ * 3 || '-01', 'YYYY-MM-DD')) + INTERVAL '3 months - 1 day')::DATE AS time_,
    boxes_installed_in_quarter,
    COALESCE(boxes_installed_before_quarter, 0) AS boxes_installed_before_quarter,
    boxes_installed_in_quarter + COALESCE(boxes_installed_before_quarter, 0) AS total_boxes
FROM cumulative_boxes
ORDER BY year_, quarter_;
      `)
    console.log("Table installed_box_per_quarter created and data inserted successfully.");
  } catch (err) {
      console.error('Error executing queries', err);
  };
}

module.exports = { installed_box_per_quarter };