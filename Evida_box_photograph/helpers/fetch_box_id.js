const axios = require('axios');

const fetch_box_id = async (list_box_data) => {
  return new Promise(async (resolve, reject) => {
    const login_user = {
      username: process.env.USERNAME_API,
      password: process.env.PASSWORD_API
    };

    await axios.post(process.env.API_LOGIN, login_user)
      .then(async response_login => {
        const token_authorization = response_login.data.token;
        const headers = {
          'Authorization': `Bearer ${token_authorization}`
        }
        await axios.get(process.env.API_EBOXES, { headers: headers })
          .then(response_boxes => {
            const list_box_id = response_boxes.data['hydra:member']
              .filter(element => element.status === true)
              .map(element => element.uniqueId);
            
            response_boxes.data['hydra:member'].forEach(element => {
              if (element.status === true && !list_box_data[element.uniqueId]) {
                list_box_data[element.uniqueId] = {
                  location_name: element.name,
                };
              };
            });
            resolve(list_box_id);
          })
          .catch(error => {
            reject(error);
          });
      })
      .catch(error => {
        console.error("Error logging in:", error.response ? error.response.data : error.message);
        reject(error);
      });
  });
};

module.exports = { fetch_box_id };