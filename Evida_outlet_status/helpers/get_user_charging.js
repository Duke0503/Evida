const axios = require('axios');
const { get_headers } = require('./login_transaction');

const user_charging = async (box_id, outlet_number) => {
  try {
    const headers = await get_headers();

    let user = null;

    try {
      const response = await axios.get(`${process.env.API_TRANSACTIONS}`, { headers: headers });
    
      for (const transaction of response.data['hydra:member']) {
        if (transaction.outlet.uniqueId === `${box_id}_${outlet_number}`) {
          user = {
            id: transaction.user.id,
            name: transaction.user.name
          };
          break;
        }
      }
    } catch (error) {
      console.error(`Error fetching transactions:`, error);
    }

    return user;
  } catch (error) {
    console.error('Error in fetch_transaction_data:', error);
  }
};

module.exports = {
  user_charging
}