const axios = require('axios');

const fetch_ebox_id = (message_buffer_consumption) => {
  return new Promise((resolve, reject) => {
    const login_user = {
      username: process.env.USERNAME_API,
      password: process.env.PASSWORD_API,
    };

    axios.post(process.env.API_LOGIN, login_user)
      .then(response_login => {
        const token_authorization = response_login.data.token;

        const headers = {
          'Authorization': `Bearer ${token_authorization}`
        }
        axios.get(process.env.API_EBOXES, { headers: headers })
          .then(response_boxes => {
            
            const Ebox_ids = response_boxes.data['hydra:member']
              .filter(element => element.status === true)
              .map(element => element.uniqueId);

            response_boxes.data['hydra:member'].forEach(element => {
              if (element.status === true && !message_buffer_consumption[element.uniqueId]) {
                message_buffer_consumption[element.uniqueId] = {
                  ebox_id: element.uniqueId,
                  ebox_name: element.name,
                };
              }
            });
            resolve(Ebox_ids);
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

module.exports = { fetch_ebox_id };
