const { valid_transaction } = require('../tables/valid_transaction.table');
const { app_user_analysis } = require('../tables/app_user_analysis.table');
const { invoice_analysis } = require('../tables/invoice_analysis.table');
const { charging_box_analysis } = require('../tables/charging_box_analysis.table');
const { hour_analysis } = require('../tables/hour_analysis.table');
const { insert_time_records } = require('../helpers/insert_time_records');
const { trend_of_month_analysis } = require('../tables/trend_of_month_analysis.table');
const { trend_of_quarter_analysis } = require('../tables/trend_of_quarter_analysis.table');
const { active_outlet } = require('../tables/active_outlet.table');
const { box_hour_analysis } = require('../tables/box_hour_analysis.table');
const { detail_user_analysis } = require('../tables/detail_user_analysis.table');
const { detail_box_analysis } = require('../tables/detail_box_analysis.table');
const { box_promotion_analysis } = require('../tables/box_promotion_analysis.table');
const { user_analysis_monthly } = require('../tables/user_analysis_monthly');

const handle_data = async () => {
    await active_outlet();
    await valid_transaction();
    await insert_time_records();
    await trend_of_month_analysis(); // Question 1_month
    await trend_of_quarter_analysis(); // Question 1_quarter
    await charging_box_analysis(); // Question 3
    await hour_analysis(); // Question 4
    await app_user_analysis(); // Question 5
    await invoice_analysis(); // Question 6
    await box_hour_analysis();
    await detail_user_analysis();
    await detail_box_analysis();
    await box_promotion_analysis();
    await user_analysis_monthly();
}

module.exports = { handle_data };