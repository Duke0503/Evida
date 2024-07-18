const { valid_transaction } = require('../tables/valid_transaction.table');
const { charging_outlet_analysis } = require('../tables/charging_outlet_analysis.table');
const { user_analysis } = require('../tables/user_analysis.table');
const { customer_group } = require('../tables/customer_group.table');
const { app_user_analysis } = require('../tables/app_user_analysis.table');
const { invoice_analysis } = require('../tables/invoice_analysis.table');
const { trend_of_month } = require('../tables/trend_of_month.table');
const { installed_box_per_month } = require('../tables/installed_box_per_month.table');
const { business_trend_analysis_month } = require('../tables/business_trend_analysis_month.table');
const { trend_of_quarter } = require('../tables/trend_of_quarter.table');
const { installed_box_per_quarter } = require('../tables/installed_box_per_quarter.table');
const { business_trend_analysis_quarter } = require('../tables/business_trend_analysis_quarter.table');
const { charging_box_analysis } = require('../tables/charging_box_analysis.table');
const { hour_analysis } = require('../tables/hour_analysis.table');
const { insert_time_records } = require('../helpers/insert_time_records');

const handle_data = async () => {
    await valid_transaction();
    // await insert_time_records();
    await trend_of_month();
    await installed_box_per_month();
    await business_trend_analysis_month(); // Question 1_month
    await trend_of_quarter();
    await installed_box_per_quarter();
    await business_trend_analysis_quarter(); // Question 1_quarter
    await charging_outlet_analysis();  // Question 2
    await charging_box_analysis(); // Question 3
    // await hour_analysis(); // Question 4
    await user_analysis();
    await customer_group();
    await app_user_analysis(); // Question 5
    await invoice_analysis(); // Question 6
}

module.exports = { handle_data };