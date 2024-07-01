const axios = require('axios');
const { login } = require('./login');
const { insert_ebox_query, insert_user_query, insert_transaction_query } = require('./insert_query');

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
          ebox.consumedFee
        );
      });
    }) 
    .catch(error => {
      console.log(error);
    });
};

const fetch_user_data = async () => {
  const headers = await login();

  let number_of_user = '';

  await axios.get(process.env.API_USERS, { headers: headers })
    .then(response_users => {
      number_of_user = response_users.data['hydra:totalItems'];
    }) 
    .catch(error => {
      console.log(error);
    });

  await axios.get(process.env.API_USERS + number_of_user, { headers: headers })
    .then(response_users => {

      response_users.data['hydra:member'].forEach(user => {
        let bike_brand = '';
        let bike_model = '';
        if (user.bikeBrand) {
          bike_brand = user.bikeBrand.name;
        }
        if (user.bikeModel) {
          bike_model = user.bikeModel.name;
        }

        insert_user_query(
          user.id,
          user.name,
          user.email,
          user.phoneNumber,
          bike_brand,
          bike_model,
          user.createdAt,
          user.balance,
        )
      });
    }) 
    .catch(error => {
      console.log(error);
    });
};

const fetch_transaction_data = async () => {
  const headers = await login();
  let number_of_transaction = '';

  await axios.get(process.env.API_USERS, { headers: headers })
    .then(response_transactions => {
      number_of_transaction = response_transactions.data['hydra:totalItems'];
    }) 
    .catch(error => {
      console.log(error);
    });

  axios.get(process.env.API_TRANSACTIONS + number_of_transaction, { headers: headers })
    .then(response_transactions => {

        response_transactions.data['hydra:member'].forEach(transaction => {

          insert_transaction_query(
            transaction.id,
            transaction.invoiceId,
            transaction.startTime,
            transaction.endTime,
            transaction.user.id,
            transaction.box.uniqueId,
            transaction.outlet.uniqueId,
            transaction.wattageConsumed,
            transaction.activationFee,
            transaction.reasonClosed
          );
        });
    }) 
    .catch(error => {
      console.log(error);
    });
};

module.exports = {
  fetch_ebox_data,
  fetch_user_data,
  fetch_transaction_data,
}