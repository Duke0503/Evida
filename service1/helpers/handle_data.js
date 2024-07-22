const { valid_transaction } = require('../tables/valid_transaction.table');
const { charging_outlet_analysis } = require('../tables/charging_outlet_analysis.table');
const { user_analysis } = require('../tables/user_analysis.table');
const { customer_group } = require('../tables/customer_group.table');
const { app_user_analysis } = require('../tables/app_user_analysis.table');
const { invoice_analysis } = require('../tables/invoice_analysis.table');
const { charging_box_analysis } = require('../tables/charging_box_analysis.table');
const { hour_analysis } = require('../tables/hour_analysis.table');
const { insert_time_records } = require('../helpers/insert_time_records');
const { trend_of_month_analysis } = require('../tables/trend_of_month_analysis.table');
const { trend_of_quarter_analysis } = require('../tables/trend_of_quarter_analysis.table');

const handle_data = async () => {
    await valid_transaction();
    await insert_time_records();
    await trend_of_month_analysis(); // Question 1_month
    await trend_of_quarter_analysis(); // Question 1_quarter
    await charging_outlet_analysis();  // Question 2
    await charging_box_analysis(); // Question 3
    await hour_analysis(); // Question 4
    await user_analysis();
    await customer_group();
    await app_user_analysis(); // Question 5
    await invoice_analysis(); // Question 6
}

module.exports = { handle_data };