const axios = require('axios');
const { login } = require('./login');
const { insert_ebox_query, insert_user_query, insert_transaction_query } = require('./insert_query');
const { get_the_last_created_time_transaction } = require('./get_the_last_created_time_transaction');

const fetch_ebox_data = async () => {
  const headers = await login();
  await axios.get(process.env.API_EBOXES, { headers: headers })
    .then(response_eboxes => {
      response_eboxes.data['hydra:member'].forEach(ebox => {
        let province_box = '';
        let district_box = '';

        if (ebox.city) {
          province_box = ebox.city.name;
        }
        if (ebox.district) {
          district_box = ebox.district.name;
        }

        insert_ebox_query(
          ebox.uniqueId,
          ebox.name,
          province_box,
          district_box,
          ebox.address,
          `${ebox.latitude},${ebox.longitude}`,
          ebox.consumedFee,
          ebox.available,
          ebox.status,
          ebox.createdAt,
          ebox.updatedAt,
        );
      });
    }) 
    .catch(error => {
      console.log(error);
    });
};

const fetch_user_data = async () => {
  try {
    const headers = await login();

    let number_of_user = 0;

    // Fetch the total number of users
    await axios.get(process.env.API_USERS_TOTALITEMS, { headers: headers })
      .then(response_users => {
        number_of_user = response_users.data['hydra:totalItems'];
      })
      .catch(error => {
        console.error('Error fetching total number of users:', error);
      });

    // Fetch users page by page
    for (let number_page = 1; number_page <= Math.ceil(number_of_user / 100); number_page++) {
      await axios.get(`${process.env.API_USERS}${number_page}`, { headers: headers })
        .then(response_users => {
          response_users.data['hydra:member'].forEach(async user => {
            let bike_brand = user.bikeBrand ? user.bikeBrand.name : '';
            let bike_model = user.bikeModel ? user.bikeModel.name : '';

            await insert_user_query(
              user.id,
              user.name,
              user.email,
              user.phoneNumber,
              bike_brand,
              bike_model,
              user.createdAt,
              user.balance,
              user.activated,
              user.enabled,
              user.isReadTerm,
              user.street,
              user.city,
              user.country,
              user.state,
              user.postalCode,
              user.createdAt,
              user.updatedAt
            );
          });
        })
        .catch(error => {
          console.error(`Error fetching users for page ${number_page}:`, error);
        });

      console.log(`Processed users for page: ${number_page}`);

      // Delay 1 second before the next request
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.error('Error in fetch_user_data:', error);
  }
};

const fetch_transaction_data = async () => {
  try {

    const last_created_time = await get_the_last_created_time_transaction();

    const current_time = new Date();

    const midnight = new Date(current_time);

    midnight.setHours(0, 0, 0, 0);

    const last_updated_time = new Date(midnight.getTime() - 24 * 60 * 60 * 1000);

    const headers = await login();

    let number_of_transaction = '';

    // Fetch the total number of transactions
    await axios.get(process.env.API_TRANSACTIONS_TOTALITEMS, { headers: headers })
      .then(response => {
        number_of_transaction = response.data['hydra:totalItems'];
      })
      .catch(error => {
        console.error('Error fetching total number of transactions:', error);
      });

    let should_continue = true;
    // Fetch transactions page by page
    for (let number_page = 1; number_page <= Math.ceil(number_of_transaction / 100); number_page++) {
      if ( !should_continue) break;

      await axios.get(`${process.env.API_TRANSACTIONS}${number_page}`, { headers: headers })
        .then(response => {
          response.data['hydra:member'].forEach(async transaction => {

            if (last_created_time == null) {
              await insert_transaction_query(
                transaction.id,
                transaction.invoiceId,
                transaction.startTime,
                transaction.endTime,
                transaction.user.id,
                transaction.box.uniqueId,
                transaction.outlet.uniqueId,
                transaction.wattageConsumed,
                transaction.totalFee,
                transaction.status,
                transaction.discountAmount,
                transaction.promotionCode,
                transaction.promotionDiscount,
                transaction.activationFee,
                transaction.paid,
                transaction.totalConsumedFee,
                transaction.reasonClosed,
                transaction.createdAt,
                transaction.updatedAt
              );
            } 
            else {
              if (new Date(transaction.createdAt) > last_created_time || new Date(transaction.updatedAt) > last_updated_time) {
                console.log(transaction.reasonClosed)
                await insert_transaction_query(
                  transaction.id,
                  transaction.invoiceId,
                  transaction.startTime,
                  transaction.endTime,
                  transaction.user.id,
                  transaction.box.uniqueId,
                  transaction.outlet.uniqueId,
                  transaction.wattageConsumed,
                  transaction.totalFee,
                  transaction.status,
                  transaction.discountAmount,
                  transaction.promotionCode,
                  transaction.promotionDiscount,
                  transaction.activationFee,
                  transaction.paid,
                  transaction.totalConsumedFee,
                  transaction.reasonClosed,
                  transaction.createdAt,
                  transaction.updatedAt
                );
              } else {
                should_continue = false;
                return;
              }
            }
            
          });
        })
        .catch(error => {
          console.error(`Error fetching transactions for page ${number_page}:`, error);
        });

      console.log(`Processed transactions for page: ${number_page}`);

      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.error('Error in fetch_transaction_data:', error);
  }
};

module.exports = {
  fetch_ebox_data,
  fetch_user_data,
  fetch_transaction_data,
}