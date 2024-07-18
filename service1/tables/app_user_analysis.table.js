const client = require('../config/database');

const app_user_analysis = async () => {
  try {
    await client.query(`
DROP TABLE IF EXISTS app_user_analysis;

CREATE TABLE app_user_analysis AS
SELECT
    AU.user_name,
    AU.email,
    AU.phone_number,
    UA.*,
    CG.group_user AS group_name
FROM user_analysis UA
LEFT JOIN customer_group CG ON UA.group_customer = CG.id
LEFT JOIN app_user AU ON UA.user_id = AU.user_id;

      `);
      console.log("Table app_user_analysis created and data inserted successfully.");
  } catch (err) {
      console.error('Error executing queries', err);
  };
};

module.exports = {
  app_user_analysis,
}