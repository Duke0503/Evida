const axios = require('axios');
const { get_headers } = require('./login_transaction');

const get_list_user_charging = async (list_user_charging) => {
  try {
    const headers = await get_headers();

    let number_of_charging_transaction = 0;

    await axios.get(process.env.API_TRANSACTIONS_TOTAL_ITEMS, { headers: headers })
      .then(response => {
        number_of_charging_transaction = response.data['hydra:totalItems'];
      })
      .catch(error => {
        console.error('Error fetching total number of users:', error);
      });

    for (let number_page = 1; number_page <= Math.ceil(number_of_charging_transaction / 100); number_page++) {
      await axios.get(`${process.env.API_TRANSACTIONS}${number_page}`, { headers: headers })
        .then(response_false_transactions => {
            response_false_transactions.data['hydra:member'].forEach(async transaction => {
              if (!list_user_charging[transaction.outlet.uniqueId]) {
                list_user_charging[transaction.outlet.uniqueId] = {
                  user_id : transaction.user.id,
                  user_name : transaction.user.name
                }
              }
          });
      })
      .catch(error => {
        console.error(`Error fetching users for page ${number_page}:`, error);
      });
    }
  } catch (error) {
    console.error('Error in fetch_transaction_data:', error);
  }
};

module.exports = {
  get_list_user_charging
}