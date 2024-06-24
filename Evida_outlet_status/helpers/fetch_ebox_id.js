const axios = require('axios');

const fetch_ebox_id = () => {
  return new Promise((resolve, reject) => {
    const login_user = {
      username: process.env.USERNAME_API,
      password: process.env.PASSWORD_API
    };

    axios.post(process.env.API_LOGIN, login_user)
      .then(response_login => {
        const token_authorization = response_login.data.token;
        const headers = {
          'Authorization': `Bearer ${token_authorization}`
        }
        axios.get(process.env.API_EBOXES, { headers: headers })
          .then(response_boxes => {
            const Ebox_id = response_boxes.data['hydra:member'].map(element => element.uniqueId);
            resolve(Ebox_id);
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