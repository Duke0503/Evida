const axios = require('axios');
const { get_headers } = require('./login_transaction');

const user_charging = async (ebox_id, outlet_id) => {
  try {
    // const headers = await login_transaction();
    const headers = await get_headers();

    let user = null;

    let should_continue = true;
    // Fetch transactions page by page
      for (let number_page = 1; number_page <= 10; number_page++) {
      if ( !should_continue) break;

      await axios.get(`${process.env.API_TRANSACTIONS}${number_page}`, { headers: headers })
        .then(response => {
          response.data['hydra:member'].forEach(async transaction => {
            if (transaction.outlet.uniqueId == `${ebox_id}_${outlet_id}`) {
              user = {
                id: transaction.user.id,
                name: transaction.user.name
              };
              should_continue = false;
              return;
            }
            if ( !should_continue) return;
          });
        })
        .catch(error => {
          console.error(`Error fetching transactions for page ${number_page}:`, error);
        });

      if (!should_continue) break;

      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    return user;
  } catch (error) {
    console.error('Error in fetch_transaction_data:', error);
  }
};

module.exports = {
  user_charging
}